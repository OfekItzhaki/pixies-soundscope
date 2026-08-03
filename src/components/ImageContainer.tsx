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
  const hasImage = Boolean(selectedTrack?.imageUrl);
  const playableEmbedUrl = selectedTrack ? buildPlayableEmbedUrl(selectedTrack.embedUrl) : undefined;
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

  return (
    <section className="image-container" aria-labelledby="selected-track-heading">
      <h2 id="selected-track-heading">Selected track</h2>
      <button
        ref={selectedButtonRef}
        type="button"
        className={`selected-track ${selectedTrack ? 'selected-track-ready' : 'selected-track-empty'}`}
        onClick={onPlayerToggle}
        disabled={!selectedTrack}
        aria-label={
          selectedTrack
            ? `${playerVisible ? 'Hide player for' : 'Play'} ${selectedTrack.title}`
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

      {selectedTrack && playerVisible && playableEmbedUrl ? (
        <MixcloudPlayer track={selectedTrack} embedUrl={playableEmbedUrl} />
      ) : null}
    </section>
  );
}

interface MixcloudPlayerProps {
  track: Track;
  embedUrl: string;
}

function MixcloudPlayer({ track, embedUrl }: MixcloudPlayerProps): ReactElement {
  return (
    <iframe
      className="track-player"
      title={`Mixcloud player for ${track.title}`}
      src={embedUrl}
      allow="autoplay; encrypted-media"
      loading="lazy"
      aria-label={`Mixcloud embedded player for ${track.title}`}
    />
  );
}

function buildPlayableEmbedUrl(embedUrl: string): string {
  const playableEmbedUrl = new URL(embedUrl);
  playableEmbedUrl.searchParams.set('autoplay', '1');

  return playableEmbedUrl.toString();
}
