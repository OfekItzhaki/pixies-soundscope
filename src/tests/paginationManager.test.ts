import { describe, expect, it } from 'vitest';

import {
  canGoNext,
  canGoPrevious,
  getCursorForDirection,
} from '../state/paginationManager';

describe('paginationManager', () => {
  it('allows next navigation only when a next cursor is present', () => {
    expect(canGoNext('https://api.mixcloud.com/search/?limit=6&offset=6')).toBe(true);
    expect(canGoNext('')).toBe(false);
    expect(canGoNext('   ')).toBe(false);
    expect(canGoNext()).toBe(false);
  });

  it('allows previous navigation only when a previous cursor is present', () => {
    expect(canGoPrevious('https://api.mixcloud.com/search/?limit=6&offset=0')).toBe(true);
    expect(canGoPrevious('')).toBe(false);
    expect(canGoPrevious('   ')).toBe(false);
    expect(canGoPrevious()).toBe(false);
  });

  it('returns the cursor for the requested direction', () => {
    const paginationState = {
      nextCursor: 'next-page',
      prevCursor: 'previous-page',
    };

    expect(getCursorForDirection(paginationState, 'next')).toBe('next-page');
    expect(getCursorForDirection(paginationState, 'previous')).toBe('previous-page');
  });
});
