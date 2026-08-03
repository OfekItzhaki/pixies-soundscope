import { describe, expect, it } from 'vitest';

import {
  createSearchHistoryStorage,
  loadHistory,
  removeHistoryTerm,
  saveHistory,
  updateHistory,
} from '../state/searchHistoryManager';
import type { KeyValueStorage } from '../utils/storage';

describe('searchHistoryManager', () => {
  it('adds new terms to the top and removes duplicates case-insensitively', () => {
    const history = ['Jazz', 'Ambient', 'House'];

    expect(updateHistory(history, 'ambient')).toEqual(['ambient', 'Jazz', 'House']);
  });

  it('keeps only the five most recent unique terms', () => {
    const history = ['one', 'two', 'three', 'four', 'five'];

    expect(updateHistory(history, 'six')).toEqual(['six', 'one', 'two', 'three', 'four']);
  });

  it('normalizes whitespace and ignores blank search terms', () => {
    expect(updateHistory(['deep   house', 'jazz'], '  deep    house  ')).toEqual([
      'deep house',
      'jazz',
    ]);
    expect(updateHistory(['jazz'], '   ')).toEqual(['jazz']);
  });

  it('loads and saves history through the storage adapter', () => {
    const keyValueStorage = createMemoryStorage();
    const historyStorage = createSearchHistoryStorage(keyValueStorage);

    saveHistory(historyStorage, ['jazz', 'ambient', 'jazz', '']);

    expect(loadHistory(historyStorage)).toEqual(['jazz', 'ambient']);
  });

  it('removes a term case-insensitively while keeping the remaining history sanitized', () => {
    expect(removeHistoryTerm(['Jazz', 'ambient', 'deep   house', 'ambient'], ' jazz ')).toEqual([
      'ambient',
      'deep house',
    ]);
  });
});

function createMemoryStorage(): KeyValueStorage {
  const values = new Map<string, string>();

  return {
    getItem: (key: string): string | null => values.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      values.set(key, value);
    },
    removeItem: (key: string): void => {
      values.delete(key);
    },
  };
}
