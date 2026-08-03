import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';

import type { Track } from '../api/types';
import { useSearchState } from '../state/useSearchState';
import { debounce } from '../utils/debounce';
import { getStringItem, setStringItem } from '../utils/storage';
import { ImageContainer, type SelectionAnimation } from './ImageContainer';
import { PaginationControls } from './PaginationControls';
import { ResultsGrid } from './ResultsGrid';
import { ResultsList } from './ResultsList';

const SEARCH_DEBOUNCE_MS = 300;
const RECENT_SEARCH_STABILITY_MS = 5000;
const AUTOPLAY_SELECTION_STORAGE_KEY = 'pixies-soundscope:autoplay-selection';

export function SearchContainer(): ReactElement {
  const { state, actions } = useSearchState();
  const imageTargetRef = useRef<HTMLDivElement | null>(null);
  const selectedTrackButtonRef = useRef<HTMLButtonElement | null>(null);
  const animationIdRef = useRef(0);
  const [selectionAnimation, setSelectionAnimation] = useState<SelectionAnimation | undefined>();
  const [visiblePlayerTrackId, setVisiblePlayerTrackId] = useState<string | undefined>();
  const [autoplaySelection, setAutoplaySelection] = useState<boolean>(
    () => getStringItem(AUTOPLAY_SELECTION_STORAGE_KEY, 'enabled') !== 'disabled',
  );
  const hasCompletedEmptySearch =
    !state.loading &&
    !state.error &&
    Boolean(state.lastSearchedQuery) &&
    state.results.length === 0;
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        void actions.performSearch(query);
      }, SEARCH_DEBOUNCE_MS),
    [actions],
  );
  const debouncedRecentSearch = useMemo(
    () =>
      debounce((query: string) => {
        actions.recordRecentSearch(query);
      }, RECENT_SEARCH_STABILITY_MS),
    [actions],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      debouncedRecentSearch.cancel();
    };
  }, [debouncedRecentSearch, debouncedSearch]);

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextQuery = event.target.value;
    actions.setQuery(nextQuery);
    debouncedSearch(nextQuery);
    debouncedRecentSearch(nextQuery);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    debouncedSearch.cancel();
    debouncedRecentSearch.cancel();
    actions.recordRecentSearch(state.query);
    void actions.performSearch(state.query);
  };

  const handleSelectTrack = (track: Track, sourceElement: HTMLElement): void => {
    const targetElement = imageTargetRef.current;
    actions.selectTrack(track);
    setVisiblePlayerTrackId(autoplaySelection ? track.id : undefined);

    if (!targetElement) {
      return;
    }

    animationIdRef.current += 1;
    setSelectionAnimation({
      id: animationIdRef.current,
      track,
      from: sourceElement.getBoundingClientRect(),
      to: targetElement.getBoundingClientRect(),
    });
  };

  const handleAutoplaySelectionChange = (enabled: boolean): void => {
    setAutoplaySelection(enabled);
    setStringItem(AUTOPLAY_SELECTION_STORAGE_KEY, enabled ? 'enabled' : 'disabled');
  };

  return (
    <section className="search-panel" aria-labelledby="search-heading" aria-busy={state.loading}>
      <h2 id="search-heading">Find tracks</h2>

      <form className="search-form" onSubmit={handleSubmit}>
        <label className="search-label" htmlFor="track-search">
          Search term
        </label>
        <div className="search-row">
          <input
            id="track-search"
            type="search"
            value={state.query}
            onChange={handleQueryChange}
            placeholder="Try deep house, jazz, ambient..."
            autoComplete="off"
            aria-describedby="search-status"
          />
          <button type="submit" disabled={state.loading || state.query.trim().length === 0}>
            Go
          </button>
        </div>
      </form>

      <div id="search-status" className="status-region" aria-live="polite" aria-atomic="true">
        {state.loading ? <p className="status-message">Searching Mixcloud...</p> : null}

        {hasCompletedEmptySearch ? (
          <p className="status-message">No tracks found for "{state.lastSearchedQuery}".</p>
        ) : null}
      </div>

      {state.error ? (
        <div className="status-message status-message-error" role="alert" aria-live="assertive">
          <p>{state.error}</p>
          <button type="button" onClick={() => void actions.performSearch(state.query)}>
            Retry
          </button>
        </div>
      ) : null}

      <ImageContainer
        selectedTrack={state.selectedTrack}
        animation={selectionAnimation}
        targetRef={imageTargetRef}
        selectedButtonRef={selectedTrackButtonRef}
        playerVisible={Boolean(state.selectedTrack && visiblePlayerTrackId === state.selectedTrack.id)}
        autoplaySelection={autoplaySelection}
        onPlayerToggle={() =>
          setVisiblePlayerTrackId((currentTrackId) => {
            if (!state.selectedTrack || currentTrackId === state.selectedTrack.id) {
              return currentTrackId;
            }

            return state.selectedTrack.id;
          })
        }
        onAutoplaySelectionChange={handleAutoplaySelectionChange}
        onAnimationComplete={(track) => {
          actions.selectTrack(track);
          setSelectionAnimation(undefined);
          window.requestAnimationFrame(() => selectedTrackButtonRef.current?.focus());
        }}
      />

      {state.viewMode === 'tile' ? (
        <ResultsGrid tracks={state.results} onSelectTrack={handleSelectTrack} />
      ) : (
        <ResultsList tracks={state.results} onSelectTrack={handleSelectTrack} />
      )}
      <PaginationControls />
    </section>
  );
}
