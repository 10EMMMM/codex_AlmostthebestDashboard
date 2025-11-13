"use server";

// Ensure a no-op localStorage exists when running in Node (e.g., during SSR or Turbopack)
if (typeof window === 'undefined') {
  const storageMap = new Map<string, string>();

  const memoryStorage: Storage = {
    get length() {
      return storageMap.size;
    },
    clear() {
      storageMap.clear();
    },
    getItem(key: string) {
      return storageMap.has(key) ? storageMap.get(key)! : null;
    },
    key(index: number) {
      return Array.from(storageMap.keys())[index] ?? null;
    },
    removeItem(key: string) {
      storageMap.delete(key);
    },
    setItem(key: string, value: string) {
      storageMap.set(key, String(value));
    },
  };

  const shouldPolyfill =
    typeof globalThis.localStorage === 'undefined' ||
    typeof globalThis.localStorage.getItem !== 'function';

  if (shouldPolyfill) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: memoryStorage,
      writable: false,
      configurable: true,
    });
  }
}
