import type { ReactElement } from 'react';

import { useSearchState } from '../state/useSearchState';

export function RecentSearchesContainer(): ReactElement {
  const { state, actions } = useSearchState();

  return (
    <aside className="recent-searches" aria-labelledby="recent-searches-heading">
      <h2 id="recent-searches-heading">Recent searches</h2>
      {state.recentSearches.length > 0 ? (
        <ul>
          {state.recentSearches.map((term) => (
            <li key={term}>
              <div className="recent-search-item">
                <button
                  type="button"
                  className="recent-search-term"
                  aria-label={`Search again for ${term}`}
                  onClick={() => {
                    actions.setQuery(term);
                    void actions.performSearch(term, { recordInHistory: true });
                  }}
                >
                  {term}
                </button>
                <button
                  type="button"
                  className="recent-search-remove"
                  aria-label={`Remove ${term} from recent searches`}
                  onClick={() => actions.removeRecentSearch(term)}
                >
                  x
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent searches yet.</p>
      )}
    </aside>
  );
}
