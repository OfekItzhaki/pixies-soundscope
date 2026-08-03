import type { Track } from '../api/types';

export type ViewMode = 'list' | 'tile';

export interface SearchState {
  query: string;
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
  performSearch(query: string): Promise<void>;
  goToNextPage(): Promise<void>;
  goToPreviousPage(): Promise<void>;
  selectTrack(track: Track): void;
  setViewMode(mode: ViewMode): void;
}

export interface SearchStateContextValue {
  state: SearchState;
  actions: SearchStateActions;
}
