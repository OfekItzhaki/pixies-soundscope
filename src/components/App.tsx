import type { ReactElement } from 'react';

import { SearchStateProvider } from '../state/SearchStateContext';
import { RecentSearchesContainer } from './RecentSearchesContainer';
import { SearchContainer } from './SearchContainer';

export function App(): ReactElement {
  return (
    <SearchStateProvider>
      <main className="app-shell" aria-label="PiXies SoundScope">
        <header className="app-header">
          <p className="app-kicker">PiXies</p>
          <h1>SoundScope</h1>
          <p className="app-subtitle">Search Mixcloud tracks and keep your recent discoveries close.</p>
        </header>

        <div className="app-layout">
          <SearchContainer />
          <RecentSearchesContainer />
        </div>
      </main>
    </SearchStateProvider>
  );
}
