export function getFromLocalStorage<T>(key: string): T {
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data) as T;
  } else {
    return undefined!;
  }
}

export function saveToLocalStorage<T>(key: string, value: T, removeIfNull = false): void {
  if (removeIfNull && !value) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
