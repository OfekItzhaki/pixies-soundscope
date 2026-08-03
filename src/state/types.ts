import type { Track } from '../api/types';

export type ViewMode = 'list' | 'tile';

export interface SearchState {
  query: string;
  lastSearchedQuery?: string;
  results: Track[];
  selectedTrack?: Track;
  viewMode: ViewMode;
  loading: boolean;
  error?: string;
  nextCursor?: string;
  prevCursor?: string;
  recentSearches: string[];
}

export interface SearchStateActions {
  setQuery(query: string): void;
  performSearch(query: string, options?: SearchRequestOptions): Promise<void>;
  recordRecentSearch(query: string): void;
  goToNextPage(): Promise<void>;
  goToPreviousPage(): Promise<void>;
  selectTrack(track: Track): void;
  setViewMode(mode: ViewMode): void;
}

export interface SearchRequestOptions {
  recordInHistory?: boolean;
}

export interface SearchStateContextValue {
  state: SearchState;
  actions: SearchStateActions;
}
