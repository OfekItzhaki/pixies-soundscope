import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';

import { createSoundApiClient } from '../api/soundApiClient';
import type { SearchResponse, SoundApiClient, Track } from '../api/types';
import { canGoNext, canGoPrevious, getCursorForDirection } from './paginationManager';
import {
  createSearchHistoryStorage,
  loadHistory,
  saveHistory,
  updateHistory,
  type SearchHistoryStorage,
} from './searchHistoryManager';
import { SearchStateContext } from './searchStateContextValue';
import type { SearchState, SearchStateActions, SearchStateContextValue, ViewMode } from './types';
import { getStringItem, setStringItem, type KeyValueStorage } from '../utils/storage';

const VIEW_MODE_STORAGE_KEY = 'pixies-soundscope:view-mode';

const defaultSoundApiClient = createSoundApiClient();
const defaultSearchHistoryStorage = createSearchHistoryStorage();

interface SearchStateProviderProps {
  children: ReactNode;
  soundApiClient?: SoundApiClient;
  searchHistoryStorage?: SearchHistoryStorage;
  viewModeStorage?: KeyValueStorage;
}

type SearchStateAction =
  | { type: 'set-query'; query: string }
  | { type: 'search-start'; query: string }
  | { type: 'search-success'; response: SearchResponse }
  | { type: 'search-error'; error: string }
  | { type: 'set-recent-searches'; recentSearches: string[] }
  | { type: 'select-track'; track: Track }
  | { type: 'set-view-mode'; viewMode: ViewMode };

export function SearchStateProvider({
  children,
  soundApiClient = defaultSoundApiClient,
  searchHistoryStorage = defaultSearchHistoryStorage,
  viewModeStorage,
}: SearchStateProviderProps): ReactElement {
  const [state, dispatch] = useReducer(
    searchStateReducer,
    undefined,
    () => createInitialState(searchHistoryStorage, viewModeStorage),
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const runSearch = useCallback(
    async (query: string, cursor?: string): Promise<void> => {
      const normalizedQuery = query.trim();

      if (!normalizedQuery) {
        return;
      }

      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      dispatch({ type: 'search-start', query: normalizedQuery });

      try {
        const response = await soundApiClient.searchTracks(
          normalizedQuery,
          cursor,
          abortController.signal,
        );

        if (requestId !== requestIdRef.current || abortController.signal.aborted) {
          return;
        }

        dispatch({ type: 'search-success', response });

        if (!cursor) {
          const nextHistory = updateHistory(stateRef.current.recentSearches, normalizedQuery);
          saveHistory(searchHistoryStorage, nextHistory);
          dispatch({ type: 'set-recent-searches', recentSearches: nextHistory });
        }
      } catch (error) {
        if (abortController.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        dispatch({
          type: 'search-error',
          error: getSearchErrorMessage(error),
        });
      }
    },
    [searchHistoryStorage, soundApiClient],
  );

  const actions = useMemo<SearchStateActions>(
    () => ({
      setQuery: (query: string): void => dispatch({ type: 'set-query', query }),
      performSearch: (query: string): Promise<void> => runSearch(query),
      goToNextPage: (): Promise<void> => {
        const { query, nextCursor, prevCursor } = stateRef.current;

        if (!canGoNext(nextCursor)) {
          return Promise.resolve();
        }

        return runSearch(query, getCursorForDirection({ nextCursor, prevCursor }, 'next'));
      },
      goToPreviousPage: (): Promise<void> => {
        const { query, nextCursor, prevCursor } = stateRef.current;

        if (!canGoPrevious(prevCursor)) {
          return Promise.resolve();
        }

        return runSearch(query, getCursorForDirection({ nextCursor, prevCursor }, 'previous'));
      },
      selectTrack: (track: Track): void => dispatch({ type: 'select-track', track }),
      setViewMode: (viewMode: ViewMode): void => {
        setStringItem(VIEW_MODE_STORAGE_KEY, viewMode, viewModeStorage);
        dispatch({ type: 'set-view-mode', viewMode });
      },
    }),
    [runSearch, viewModeStorage],
  );

  const contextValue = useMemo<SearchStateContextValue>(
    () => ({ state, actions }),
    [actions, state],
  );

  return <SearchStateContext.Provider value={contextValue}>{children}</SearchStateContext.Provider>;
}

function createInitialState(
  searchHistoryStorage: SearchHistoryStorage,
  viewModeStorage?: KeyValueStorage,
): SearchState {
  return {
    query: '',
    results: [],
    viewMode: loadViewMode(viewModeStorage),
    loading: false,
    recentSearches: loadHistory(searchHistoryStorage),
  };
}

function searchStateReducer(state: SearchState, action: SearchStateAction): SearchState {
  switch (action.type) {
    case 'set-query':
      return {
        ...state,
        query: action.query,
      };
    case 'search-start':
      return {
        ...state,
        query: action.query,
        loading: true,
        error: undefined,
      };
    case 'search-success':
      return {
        ...state,
        results: action.response.tracks,
        selectedTrack: undefined,
        loading: false,
        error: undefined,
        nextCursor: action.response.nextCursor,
        prevCursor: action.response.prevCursor,
      };
    case 'search-error':
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case 'set-recent-searches':
      return {
        ...state,
        recentSearches: action.recentSearches,
      };
    case 'select-track':
      return {
        ...state,
        selectedTrack: action.track,
      };
    case 'set-view-mode':
      return {
        ...state,
        viewMode: action.viewMode,
      };
    default:
      return state;
  }
}

function loadViewMode(storage?: KeyValueStorage): ViewMode {
  const storedViewMode = getStringItem(VIEW_MODE_STORAGE_KEY, 'list', storage);

  return storedViewMode === 'tile' ? 'tile' : 'list';
}

function getSearchErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while searching tracks.';
}
