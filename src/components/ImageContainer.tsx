import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactElement, RefObject } from 'react';

import type { Track } from '../api/types';

export interface SelectionAnimation {
  id: number;
  track: Track;
  from: DOMRect;
  to: DOMRect;
}

interface ImageContainerProps {
  selectedTrack?: Track;
  animation?: SelectionAnimation;
  targetRef: RefObject<HTMLDivElement | null>;
  selectedButtonRef: RefObject<HTMLButtonElement | null>;
  playerVisible: boolean;
  onPlayerToggle(): void;
  onAnimationComplete(track: Track): void;
}

type FlyerStyle = CSSProperties &
  Record<
    | '--flyer-from-x'
    | '--flyer-from-y'
    | '--flyer-from-width'
    | '--flyer-from-height'
    | '--flyer-to-x'
    | '--flyer-to-y'
    | '--flyer-to-width'
    | '--flyer-to-height',
    string
  >;

export function ImageContainer({
  selectedTrack,
  animation,
  targetRef,
  selectedButtonRef,
  playerVisible,
  onPlayerToggle,
  onAnimationComplete,
}: ImageContainerProps): ReactElement {
  const playerWidgetRef = useRef<MixcloudPlayerWidget | null>(null);
  const playerHasStartedRef = useRef(false);
  const playerIsPlayingRef = useRef(false);
  const pendingPlayRequestRef = useRef(false);
  const [playRequest, setPlayRequest] = useState({ id: 0, trackId: '' });
  const hasImage = Boolean(selectedTrack?.imageUrl);
  const flyerStyle: FlyerStyle | undefined = animation
    ? {
        '--flyer-from-x': `${animation.from.left}px`,
        '--flyer-from-y': `${animation.from.top}px`,
        '--flyer-from-width': `${animation.from.width}px`,
        '--flyer-from-height': `${animation.from.height}px`,
        '--flyer-to-x': `${animation.to.left}px`,
        '--flyer-to-y': `${animation.to.top}px`,
        '--flyer-to-width': `${animation.to.width}px`,
        '--flyer-to-height': `${animation.to.height}px`,
      }
    : undefined;

  useEffect(() => {
    playerWidgetRef.current = null;
    playerHasStartedRef.current = false;
    playerIsPlayingRef.current = false;
    pendingPlayRequestRef.current = false;
  }, [playerVisible, selectedTrack?.id]);

  const handleSelectedTrackClick = (): void => {
    if (!selectedTrack) {
      return;
    }

    const playerWidget = playerWidgetRef.current;

    if (playerVisible && playerWidget) {
      if (playerHasStartedRef.current && playerIsPlayingRef.current) {
        void playerWidget.togglePlay();
        return;
      }

      pendingPlayRequestRef.current = true;
      setPlayRequest((currentRequest) => ({
        id: currentRequest.id + 1,
        trackId: selectedTrack.id,
      }));
      void playerWidget.play();
      return;
    }

    pendingPlayRequestRef.current = true;
    setPlayRequest((currentRequest) => ({
      id: currentRequest.id + 1,
      trackId: selectedTrack.id,
    }));
    onPlayerToggle();
  };

  return (
    <section className="image-container" aria-labelledby="selected-track-heading">
      <h2 id="selected-track-heading">Selected track</h2>
      <button
        ref={selectedButtonRef}
        type="button"
        className={`selected-track ${selectedTrack ? 'selected-track-ready' : 'selected-track-empty'}`}
        onClick={handleSelectedTrackClick}
        disabled={!selectedTrack}
        aria-label={
          selectedTrack
            ? `${playerVisible ? 'Play or pause' : 'Open player for'} ${selectedTrack.title}`
            : 'No track selected'
        }
      >
        <div ref={targetRef} className="selected-track-target">
          {selectedTrack ? (
            hasImage ? (
              <img key={selectedTrack.id} src={selectedTrack.imageUrl} alt="" className="selected-image" />
            ) : (
              <span className="selected-placeholder">{selectedTrack.title}</span>
            )
          ) : (
            <span className="selected-placeholder selected-placeholder-empty">
              <span className="placeholder-mark">PiXies</span>
              <span className="placeholder-title">SoundScope</span>
            </span>
          )}
        </div>
      </button>

      {animation ? (
        <div
          key={animation.id}
          className="selection-flyer"
          style={flyerStyle}
          onAnimationEnd={() => {
            onAnimationComplete(animation.track);
          }}
          aria-hidden="true"
        >
          {animation.track.title}
        </div>
      ) : null}

      {selectedTrack && playerVisible ? (
        <MixcloudPlayer
          key={selectedTrack.id}
          track={selectedTrack}
          embedUrl={selectedTrack.embedUrl}
          playRequestId={playRequest.trackId === selectedTrack.id ? playRequest.id : 0}
          onReady={(widget) => {
            playerWidgetRef.current = widget;
            widget.events.play.on(() => {
              playerHasStartedRef.current = true;
              playerIsPlayingRef.current = true;
            });
            widget.events.pause?.on(() => {
              playerIsPlayingRef.current = false;
            });

            if (pendingPlayRequestRef.current) {
              pendingPlayRequestRef.current = false;
              void widget.play();
            }
          }}
        />
      ) : null}
    </section>
  );
}

interface MixcloudPlayerProps {
  track: Track;
  embedUrl: string;
  playRequestId: number;
  onReady(widget: MixcloudPlayerWidget): void;
}

interface MixcloudPlayerWidget {
  readonly ready: Promise<void>;
  readonly events: {
    readonly play: MixcloudWidgetEvent;
    readonly pause?: MixcloudWidgetEvent;
  };
  play(): Promise<void>;
  togglePlay(): Promise<void>;
}

interface MixcloudWidgetEvent {
  on(listener: () => void): void;
}

interface MixcloudWidgetApi {
  PlayerWidget(iframe: HTMLIFrameElement): MixcloudPlayerWidget;
}

declare global {
  interface Window {
    Mixcloud?: MixcloudWidgetApi;
  }
}

let mixcloudWidgetApiPromise: Promise<MixcloudWidgetApi> | undefined;

function MixcloudPlayer({
  track,
  embedUrl,
  playRequestId,
  onReady,
}: MixcloudPlayerProps): ReactElement {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const initializedEmbedUrlRef = useRef<string | undefined>(undefined);
  const playableEmbedUrl = buildPlayableEmbedUrl(embedUrl, playRequestId);

  const initializeWidget = useCallback((): void => {
    const iframe = iframeRef.current;

    if (!iframe || initializedEmbedUrlRef.current === playableEmbedUrl) {
      return;
    }

    initializedEmbedUrlRef.current = playableEmbedUrl;

    void loadMixcloudWidgetApi()
      .then((mixcloudApi) => {
        const widget = mixcloudApi.PlayerWidget(iframe);

        return widget.ready.then(() => {
          onReady(widget);
        });
      })
      .catch(() => {
        initializedEmbedUrlRef.current = undefined;
        // The iframe remains usable even if the optional widget API fails to load.
      });
  }, [onReady, playableEmbedUrl]);

  useEffect(() => {
    initializeWidget();
  }, [initializeWidget]);

  return (
    <div className="track-player-frame">
      <iframe
        ref={iframeRef}
        className="track-player"
        title={`Mixcloud player for ${track.title}`}
        src={playableEmbedUrl}
        allow="autoplay; encrypted-media"
        aria-label={`Mixcloud embedded player for ${track.title}`}
        onLoad={initializeWidget}
      />
    </div>
  );
}

function buildPlayableEmbedUrl(embedUrl: string, playRequestId: number): string {
  if (playRequestId === 0) {
    return embedUrl;
  }

  const playableEmbedUrl = new URL(embedUrl);
  playableEmbedUrl.searchParams.set('autoplay', '1');
  playableEmbedUrl.searchParams.set('pixies_play_request', String(playRequestId));

  return playableEmbedUrl.toString();
}

function loadMixcloudWidgetApi(): Promise<MixcloudWidgetApi> {
  if (window.Mixcloud) {
    return Promise.resolve(window.Mixcloud);
  }

  if (mixcloudWidgetApiPromise) {
    return mixcloudWidgetApiPromise;
  }

  mixcloudWidgetApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-mixcloud-widget-api="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Mixcloud) {
          resolve(window.Mixcloud);
        } else {
          reject(new Error('Mixcloud widget API did not initialize.'));
        }
      });
      existingScript.addEventListener('error', () =>
        reject(new Error('Mixcloud widget API failed to load.')),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://widget.mixcloud.com/media/js/widgetApi.js';
    script.async = true;
    script.dataset.mixcloudWidgetApi = 'true';
    script.addEventListener('load', () => {
      if (window.Mixcloud) {
        resolve(window.Mixcloud);
      } else {
        reject(new Error('Mixcloud widget API did not initialize.'));
      }
    });
    script.addEventListener('error', () =>
      reject(new Error('Mixcloud widget API failed to load.')),
    );
    document.head.append(script);
  });

  return mixcloudWidgetApiPromise;
}
