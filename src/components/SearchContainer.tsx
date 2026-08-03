import { useEffect, useMemo } from 'react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';

import { useSearchState } from '../state/useSearchState';
import { debounce } from '../utils/debounce';
import { PaginationControls } from './PaginationControls';
import { ResultsList } from './ResultsList';

const SEARCH_DEBOUNCE_MS = 300;

export function SearchContainer(): ReactElement {
  const { state, actions } = useSearchState();
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        void actions.performSearch(query);
      }, SEARCH_DEBOUNCE_MS),
    [actions],
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextQuery = event.target.value;
    actions.setQuery(nextQuery);
    debouncedSearch(nextQuery);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    debouncedSearch.cancel();
    void actions.performSearch(state.query);
  };

  return (
    <section className="search-panel" aria-labelledby="search-heading">
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
          />
          <button type="submit" disabled={state.loading || state.query.trim().length === 0}>
            Go
          </button>
        </div>
      </form>

      {state.error ? (
        <div className="status-message status-message-error" role="alert">
          <p>{state.error}</p>
          <button type="button" onClick={() => void actions.performSearch(state.query)}>
            Retry
          </button>
        </div>
      ) : null}

      {state.loading ? <p className="status-message">Searching Mixcloud...</p> : null}

      {!state.loading && !state.error && state.query && state.results.length === 0 ? (
        <p className="status-message">No tracks found for "{state.query}".</p>
      ) : null}

      <ResultsList tracks={state.results} onSelectTrack={actions.selectTrack} />
      <PaginationControls />
    </section>
  );
}
