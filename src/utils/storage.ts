export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function getStringArrayItem(
  key: string,
  fallback: string[] = [],
  storage: KeyValueStorage = window.localStorage,
): string[] {
  const storedValue = storage.getItem(key);

  if (!storedValue) {
    return fallback;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue) || !parsedValue.every((item) => typeof item === 'string')) {
      return fallback;
    }

    return parsedValue;
  } catch {
    return fallback;
  }
}

export function setStringArrayItem(
  key: string,
  value: string[],
  storage: KeyValueStorage = window.localStorage,
): void {
  storage.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string, storage: KeyValueStorage = window.localStorage): void {
  storage.removeItem(key);
}
