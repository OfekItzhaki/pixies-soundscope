import { getStringArrayItem, setStringArrayItem, type KeyValueStorage } from '../utils/storage';

export interface SearchHistoryStorage {
  read(): string[];
  write(history: string[]): void;
}

const MAX_RECENT_SEARCHES = 5;
const SEARCH_HISTORY_STORAGE_KEY = 'pixies-soundscope:recent-searches';

export function createSearchHistoryStorage(
  storage?: KeyValueStorage,
  key = SEARCH_HISTORY_STORAGE_KEY,
): SearchHistoryStorage {
  return {
    read: () => getStringArrayItem(key, [], storage),
    write: (history: string[]) => setStringArrayItem(key, history, storage),
  };
}

export function loadHistory(storage: SearchHistoryStorage): string[] {
  return sanitizeHistory(storage.read());
}

export function saveHistory(storage: SearchHistoryStorage, history: string[]): void {
  storage.write(sanitizeHistory(history));
}

export function updateHistory(history: string[], newTerm: string): string[] {
  const normalizedTerm = normalizeSearchTerm(newTerm);

  if (!normalizedTerm) {
    return sanitizeHistory(history);
  }

  const remainingTerms = sanitizeHistory(history).filter(
    (term) => term.toLocaleLowerCase() !== normalizedTerm.toLocaleLowerCase(),
  );

  return [normalizedTerm, ...remainingTerms].slice(0, MAX_RECENT_SEARCHES);
}

export function removeHistoryTerm(history: string[], termToRemove: string): string[] {
  const normalizedTermToRemove = normalizeSearchTerm(termToRemove);

  if (!normalizedTermToRemove) {
    return sanitizeHistory(history);
  }

  return sanitizeHistory(history).filter(
    (term) => term.toLocaleLowerCase() !== normalizedTermToRemove.toLocaleLowerCase(),
  );
}

function sanitizeHistory(history: string[]): string[] {
  return history.reduce<string[]>((uniqueTerms, term) => {
    const normalizedTerm = normalizeSearchTerm(term);
    const termExists = uniqueTerms.some(
      (existingTerm) => existingTerm.toLocaleLowerCase() === normalizedTerm.toLocaleLowerCase(),
    );

    if (!normalizedTerm || termExists) {
      return uniqueTerms;
    }

    return [...uniqueTerms, normalizedTerm].slice(0, MAX_RECENT_SEARCHES);
  }, []);
}

function normalizeSearchTerm(term: string): string {
  return term.trim().replace(/\s+/g, ' ');
}
