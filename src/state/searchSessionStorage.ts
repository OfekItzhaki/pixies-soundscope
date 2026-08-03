import type { Track } from '../api/types';
import { getJsonItem, setJsonItem, type KeyValueStorage } from '../utils/storage';
import type { SearchState } from './types';

const SEARCH_SESSION_STORAGE_KEY = 'pixies-soundscope:search-session';

export interface PersistedSearchSession {
  query: string;
  lastSearchedQuery?: string;
  results: Track[];
  selectedTrack?: Track;
  nextCursor?: string;
  prevCursor?: string;
}

export interface SearchSessionStorage {
  read(): PersistedSearchSession | undefined;
  write(session: PersistedSearchSession): void;
}

export function createSearchSessionStorage(
  storage?: KeyValueStorage,
  key = SEARCH_SESSION_STORAGE_KEY,
): SearchSessionStorage {
  return {
    read: () => getJsonItem(key, undefined, isPersistedSearchSession, storage),
    write: (session: PersistedSearchSession) => setJsonItem(key, session, storage),
  };
}

export function toPersistedSearchSession(state: SearchState): PersistedSearchSession {
  return {
    query: state.query,
    lastSearchedQuery: state.lastSearchedQuery,
    results: state.results,
    selectedTrack: state.selectedTrack,
    nextCursor: state.nextCursor,
    prevCursor: state.prevCursor,
  };
}

function isPersistedSearchSession(value: unknown): value is PersistedSearchSession {
  if (!isRecord(value) || typeof value.query !== 'string' || !Array.isArray(value.results)) {
    return false;
  }

  return (
    optionalString(value.lastSearchedQuery) &&
    optionalString(value.nextCursor) &&
    optionalString(value.prevCursor) &&
    value.results.every(isTrack) &&
    (value.selectedTrack === undefined || isTrack(value.selectedTrack))
  );
}

function isTrack(value: unknown): value is Track {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.imageUrl === 'string' &&
    typeof value.embedUrl === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}
