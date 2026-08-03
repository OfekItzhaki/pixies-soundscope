import type { ReactElement } from 'react';

import type { ThemePreference } from '../utils/theme';

interface ThemeToggleProps {
  preference: ThemePreference;
  onPreferenceChange(preference: ThemePreference): void;
}

const themeOptions: Array<{ label: string; value: ThemePreference }> = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'system' },
];

export function ThemeToggle({ preference, onPreferenceChange }: ThemeToggleProps): ReactElement {
  return (
    <section className="theme-toggle" aria-labelledby="theme-toggle-heading">
      <h2 id="theme-toggle-heading">Theme</h2>
      <div className="theme-toggle-options" role="group" aria-label="Theme mode">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={preference === option.value ? 'active' : undefined}
            aria-pressed={preference === option.value}
            onClick={() => onPreferenceChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
