import { useEffect, useState, type ReactElement } from 'react';

import { SearchStateProvider } from '../state/SearchStateContext';
import { getStringItem, setStringItem } from '../utils/storage';
import {
  isThemePreference,
  resolveThemePreference,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from '../utils/theme';
import { SearchContainer } from './SearchContainer';
import { ThemeToggle } from './ThemeToggle';

const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';

export function App(): ReactElement {
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    const storedPreference = getStringItem(THEME_STORAGE_KEY, DEFAULT_THEME_PREFERENCE);

    return isThemePreference(storedPreference) ? storedPreference : DEFAULT_THEME_PREFERENCE;
  });

  useEffect(() => {
    const applyResolvedTheme = (): void => {
      document.documentElement.dataset.theme = resolveThemePreference(themePreference);
    };

    applyResolvedTheme();

    if (themePreference !== 'system') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyResolvedTheme);

    return () => mediaQuery.removeEventListener('change', applyResolvedTheme);
  }, [themePreference]);

  const updateThemePreference = (nextPreference: ThemePreference): void => {
    setStringItem(THEME_STORAGE_KEY, nextPreference);
    setThemePreference(nextPreference);
  };

  return (
    <SearchStateProvider>
      <main className="app-shell" aria-label="PiXies SoundScope">
        <header className="app-header">
          <div>
            <p className="app-kicker">PiXies</p>
            <div className="app-title-row">
              <h1>SoundScope</h1>
              <ThemeToggle preference={themePreference} onPreferenceChange={updateThemePreference} />
            </div>
            <p className="app-subtitle">Search Mixcloud tracks and keep your recent discoveries close.</p>
          </div>
        </header>

        <div className="app-layout">
          <SearchContainer />
        </div>
      </main>
    </SearchStateProvider>
  );
}
