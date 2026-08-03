import { createContext } from 'react';

import type { SearchStateContextValue } from './types';

export const SearchStateContext = createContext<SearchStateContextValue | undefined>(undefined);
