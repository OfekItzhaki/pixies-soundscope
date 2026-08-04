import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent, ReactElement } from 'react';

import type { Track } from '../api/types';
import { useSearchState } from '../state/useSearchState';
import { debounce } from '../utils/debounce';
import { getStringItem, setStringItem } from '../utils/storage';
import { ImageContainer, type SelectionAnimation } from './ImageContainer';
import { PaginationControls } from './PaginationControls';
import { ResultsGrid } from './ResultsGrid';
import { ResultsList } from './ResultsList';

const SEARCH_DEBOUNCE_MS = 300;
const AUTOPLAY_SELECTION_STORAGE_KEY = 'pixies-soundscope:autoplay-selection';

export function SearchContainer(): ReactElement {
  const { state, actions } = useSearchState();
  const imageTargetRef = useRef<HTMLDivElement | null>(null);
  const selectedTrackButtonRef = useRef<HTMLButtonElement | null>(null);
  const animationIdRef = useRef(0);
  const [selectionAnimation, setSelectionAnimation] = useState<SelectionAnimation | undefined>();
  const [visiblePlayerTrackId, setVisiblePlayerTrackId] = useState<string | undefined>();
  const [recentSearchesOpen, setRecentSearchesOpen] = useState(false);
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
        void actions.performSearch(query, { recordInHistory: true });
      }, SEARCH_DEBOUNCE_MS),
    [actions],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextQuery = event.target.value;
    actions.setQuery(nextQuery);
    debouncedSearch(nextQuery);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setRecentSearchesOpen(false);
    debouncedSearch.cancel();
    actions.recordRecentSearch(state.query);
    void actions.performSearch(state.query);
  };

  const handleRecentSearchSelect = (term: string): void => {
    setRecentSearchesOpen(false);
    debouncedSearch.cancel();
    actions.setQuery(term);
    void actions.performSearch(term, { recordInHistory: true });
  };

  const handleSearchControlBlur = (event: FocusEvent<HTMLDivElement>): void => {
    const nextFocusedElement = event.relatedTarget;

    if (!(nextFocusedElement instanceof Node) || !event.currentTarget.contains(nextFocusedElement)) {
      setRecentSearchesOpen(false);
    }
  };

  const handleSelectTrack = (track: Track, sourceElement: HTMLElement): void => {
    const targetElement = imageTargetRef.current;

    if (!targetElement) {
      actions.selectTrack(track);
      setVisiblePlayerTrackId(autoplaySelection ? track.id : undefined);
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

  const hasRecentSearches = state.recentSearches.length > 0;
  const isRecentSearchesMenuOpen = recentSearchesOpen && hasRecentSearches;

  return (
    <section className="search-panel" aria-labelledby="search-heading" aria-busy={state.loading}>
      <h2 id="search-heading">Find tracks</h2>

      <form className="search-form" onSubmit={handleSubmit}>
        <label className="search-label" htmlFor="track-search">
          Search term
        </label>
        <div className="search-row" onBlur={handleSearchControlBlur}>
          <div className="search-input-shell">
            <input
              id="track-search"
              type="text"
              value={state.query}
              onChange={handleQueryChange}
              placeholder="Try deep house, jazz, ambient..."
              autoComplete="off"
              aria-describedby="search-status"
            />
            {state.query ? (
              <button
                type="button"
                className="search-icon-button"
                aria-label="Clear search term"
                onClick={() => {
                  actions.setQuery('');
                  debouncedSearch.cancel();
                }}
              >
                <span aria-hidden="true" className="icon-x" />
              </button>
            ) : null}
            <button
              type="button"
              className="search-icon-button"
              aria-label="Show recent searches"
              aria-expanded={isRecentSearchesMenuOpen}
              aria-controls="recent-searches-menu"
              disabled={!hasRecentSearches}
              onClick={() => setRecentSearchesOpen((isOpen) => !isOpen)}
            >
              <span aria-hidden="true" className="icon-chevron-down" />
            </button>
            {isRecentSearchesMenuOpen ? (
              <div id="recent-searches-menu" className="recent-searches-menu" role="menu">
                {state.recentSearches.map((term) => (
                  <div key={term} className="recent-search-menu-item">
                    <button
                      type="button"
                      className="recent-search-term"
                      role="menuitem"
                      onClick={() => handleRecentSearchSelect(term)}
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      className="recent-search-remove"
                      aria-label={`Remove ${term} from recent searches`}
                      onClick={() => actions.removeRecentSearch(term)}
                    >
                      <span aria-hidden="true" className="icon-x" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="submit"
            className="search-submit-button"
            disabled={state.loading || state.query.trim().length === 0}
          >
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
          setVisiblePlayerTrackId(autoplaySelection ? track.id : undefined);
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
