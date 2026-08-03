import type { ReactElement } from 'react';

import { canGoNext, canGoPrevious } from '../state/paginationManager';
import { useSearchState } from '../state/useSearchState';
import type { ViewMode } from '../state/types';

export function PaginationControls(): ReactElement | null {
  const { state, actions } = useSearchState();

  if (!state.query && state.results.length === 0) {
    return null;
  }

  const setViewMode = (viewMode: ViewMode): void => {
    actions.setViewMode(viewMode);
  };

  return (
    <div className="pagination-controls" aria-label="Search result controls">
      <div className="pager-buttons">
        <button
          type="button"
          onClick={() => void actions.goToPreviousPage()}
          disabled={state.loading || !canGoPrevious(state.prevCursor)}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => void actions.goToNextPage()}
          disabled={state.loading || !canGoNext(state.nextCursor)}
        >
          Next
        </button>
      </div>

      <div className="view-toggle" aria-label="Result view">
        <button
          type="button"
          className={state.viewMode === 'list' ? 'active' : undefined}
          aria-pressed={state.viewMode === 'list'}
          onClick={() => setViewMode('list')}
        >
          List
        </button>
        <button
          type="button"
          className={state.viewMode === 'tile' ? 'active' : undefined}
          aria-pressed={state.viewMode === 'tile'}
          onClick={() => setViewMode('tile')}
        >
          Tile
        </button>
      </div>
    </div>
  );
}
