import type { ReactElement } from 'react';

import type { ThemePreference } from '../utils/theme';

interface ThemeToggleProps {
  preference: ThemePreference;
  onPreferenceChange(preference: ThemePreference): void;
}

const themeOptions: Array<{ icon: string; label: string; value: ThemePreference }> = [
  { icon: '☀', label: 'Light theme', value: 'light' },
  { icon: '◐', label: 'Dark theme', value: 'dark' },
  { icon: 'A', label: 'Auto theme', value: 'system' },
];

export function ThemeToggle({ preference, onPreferenceChange }: ThemeToggleProps): ReactElement {
  return (
    <div className="theme-toggle" role="group" aria-label="Theme mode">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          className={preference === option.value ? 'active' : undefined}
          aria-pressed={preference === option.value}
          aria-label={option.label}
          title={option.label}
          onClick={() => onPreferenceChange(option.value)}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
