import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Track } from '../api/types';
import { ImageContainer } from '../components/ImageContainer';

const selectedTrack: Track = {
  id: '/jazz/refreshed/',
  title: 'Jazz re:freshed',
  imageUrl: 'https://images.example.com/jazz.jpg',
  embedUrl:
    'https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=https%3A%2F%2Fwww.mixcloud.com%2Fjazz%2Frefreshed%2F',
};

describe('ImageContainer', () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
    }

    root = undefined;
    container?.remove();
    container = undefined;
    document.head
      .querySelectorAll('script[data-mixcloud-widget-api="true"]')
      .forEach((script) => script.remove());
    vi.restoreAllMocks();
  });

  it('turns a selected-image click into an autoplay iframe request before iframe play is pressed', () => {
    const onPlayerToggle = vi.fn();
    const targetRef = { current: null };
    const selectedButtonRef = { current: null };

    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    act(() => {
      root?.render(
        <ImageContainer
          selectedTrack={selectedTrack}
          targetRef={targetRef}
          selectedButtonRef={selectedButtonRef}
          playerVisible
          onPlayerToggle={onPlayerToggle}
          onAnimationComplete={vi.fn()}
        />,
      );
    });

    const iframeBeforeClick = getPlayerIframe();
    expect(iframeBeforeClick.src).not.toContain('autoplay=1');
    expect(iframeBeforeClick.getAttribute('allow')).toContain('autoplay');

    const selectedButton = getSelectedTrackButton();

    act(() => {
      selectedButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const iframeAfterClick = getPlayerIframe();
    const iframeUrl = new URL(iframeAfterClick.src);

    expect(iframeUrl.searchParams.get('autoplay')).toBe('1');
    expect(iframeUrl.searchParams.get('pixies_play_request')).toBe('1');
    expect(onPlayerToggle).toHaveBeenCalledTimes(1);
  });
});

function getPlayerIframe(): HTMLIFrameElement {
  const iframe = document.querySelector<HTMLIFrameElement>('.track-player');

  if (!iframe) {
    throw new Error('Expected Mixcloud player iframe to be rendered.');
  }

  return iframe;
}

function getSelectedTrackButton(): HTMLButtonElement {
  const selectedButton = document.querySelector<HTMLButtonElement>('.selected-track');

  if (!selectedButton) {
    throw new Error('Expected selected track button to be rendered.');
  }

  return selectedButton;
}
