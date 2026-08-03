export interface PaginationState {
  nextCursor?: string;
  prevCursor?: string;
}

export type PaginationDirection = 'next' | 'previous';

export function canGoNext(nextCursor?: string): boolean {
  return hasCursor(nextCursor);
}

export function canGoPrevious(prevCursor?: string): boolean {
  return hasCursor(prevCursor);
}

export function getCursorForDirection(
  paginationState: PaginationState,
  direction: PaginationDirection,
): string | undefined {
  return direction === 'next' ? paginationState.nextCursor : paginationState.prevCursor;
}

function hasCursor(cursor?: string): boolean {
  return typeof cursor === 'string' && cursor.trim().length > 0;
}
