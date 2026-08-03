export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function getStringItem(
  key: string,
  fallback: string,
  storage: KeyValueStorage = window.localStorage,
): string {
  return storage.getItem(key) ?? fallback;
}

export function setStringItem(
  key: string,
  value: string,
  storage: KeyValueStorage = window.localStorage,
): void {
  storage.setItem(key, value);
}

export function getJsonItem<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
  storage: KeyValueStorage = window.localStorage,
): T {
  const storedValue = storage.getItem(key);

  if (!storedValue) {
    return fallback;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    return isValid(parsedValue) ? parsedValue : fallback;
  } catch {
    return fallback;
  }
}

export function setJsonItem<T>(
  key: string,
  value: T,
  storage: KeyValueStorage = window.localStorage,
): void {
  storage.setItem(key, JSON.stringify(value));
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
