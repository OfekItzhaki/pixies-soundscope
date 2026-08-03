import { useContext } from 'react';

import { SearchStateContext } from './searchStateContextValue';
import type { SearchStateContextValue } from './types';

export function useSearchState(): SearchStateContextValue {
  const contextValue = useContext(SearchStateContext);

  if (!contextValue) {
    throw new Error('useSearchState must be used within SearchStateProvider.');
  }

  return contextValue;
}
