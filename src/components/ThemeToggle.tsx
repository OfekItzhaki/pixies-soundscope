import type { ReactElement } from 'react';

import type { ThemePreference } from '../utils/theme';

interface ThemeToggleProps {
  preference: ThemePreference;
  onPreferenceChange(preference: ThemePreference): void;
}

const themeOptions: Array<{ label: string; value: ThemePreference }> = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

export function ThemeToggle({ preference, onPreferenceChange }: ThemeToggleProps): ReactElement {
  return (
    <fieldset className="theme-toggle" aria-label="Theme mode">
      <legend>Theme</legend>
      <div className="theme-toggle-options">
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
    </fieldset>
  );
}
