/**
 * Fast Client-Side Cache Store with Stale-While-Revalidate (SWR)
 * Minimizes network round-trips to Firestore, enabling instant (0ms) page renders.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number; // when data was fetched (ms)
  staleAfter: number; // when data is considered stale (ms)
  expiresAfter: number; // when data must be completely discarded (ms)
}

const MEMORY_CACHE = new Map<string, CacheEntry<unknown>>();
const PENDING_PROMISES = new Map<string, Promise<unknown>>();
const CACHE_PREFIX = 'divya_cache_v2_';

// Default times: 10s fresh allows instant navigation while reflecting admin updates within seconds
const DEFAULT_STALE_MS = 10 * 1000; // 10 seconds fresh
const DEFAULT_EXPIRE_MS = 2 * 60 * 1000; // 2 minutes max retention

/**
 * Checks if client storage is available.
 */
function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Reads entry from in-memory or localStorage cache.
 */
function readFromCache<T>(key: string): CacheEntry<T> | null {
  // 1. Check in-memory map first (fastest)
  const mem = MEMORY_CACHE.get(key) as CacheEntry<T> | undefined;
  if (mem) {
    if (Date.now() < mem.expiresAfter) {
      return mem;
    }
    MEMORY_CACHE.delete(key);
  }

  // 2. Check localStorage
  if (isStorageAvailable()) {
    try {
      const serialized = localStorage.getItem(CACHE_PREFIX + key);
      if (serialized) {
        const parsed = JSON.parse(serialized) as CacheEntry<T>;
        if (Date.now() < parsed.expiresAfter) {
          // Warm up in-memory cache
          MEMORY_CACHE.set(key, parsed as CacheEntry<unknown>);
          return parsed;
        }
        localStorage.removeItem(CACHE_PREFIX + key);
      }
    } catch {
      // Storage quota or parse error — ignore
    }
  }

  return null;
}

/**
 * Writes entry to in-memory and localStorage cache.
 */
function writeToCache<T>(key: string, data: T, staleMs: number, expireMs: number): void {
  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    timestamp: now,
    staleAfter: now + staleMs,
    expiresAfter: now + expireMs,
  };

  MEMORY_CACHE.set(key, entry as CacheEntry<unknown>);

  if (isStorageAvailable()) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Quota exceeded: prune older cache entries
      pruneOldCache();
    }
  }
}

/**
 * Prunes expired or oldest entries if localStorage quota is tight.
 */
function pruneOldCache(): void {
  if (!isStorageAvailable()) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    // Remove half to free up space
    keysToRemove.slice(0, Math.ceil(keysToRemove.length / 2)).forEach((k) => {
      localStorage.removeItem(k);
    });
  } catch {
    // ignore
  }
}

/**
 * Retrieves data from cache or runs fetcher using Stale-While-Revalidate pattern.
 * If data is in cache, it resolves INSTANTLY without network wait.
 * If stale, it executes the fetcher in background to refresh the cache.
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    staleMs?: number;
    expireMs?: number;
    forceRefresh?: boolean;
  }
): Promise<T> {
  // If running on server or SSG build, run fetcher directly
  if (typeof window === 'undefined') {
    return fetcher();
  }

  const staleMs = options?.staleMs ?? DEFAULT_STALE_MS;
  const expireMs = options?.expireMs ?? DEFAULT_EXPIRE_MS;

  // 1. Check existing cache
  if (!options?.forceRefresh) {
    const cached = readFromCache<T>(key);
    if (cached) {
      const isStale = Date.now() > cached.staleAfter;
      if (isStale) {
        // Stale-While-Revalidate: re-fetch in background without awaiting
        revalidateInBackground(key, fetcher, staleMs, expireMs);
      }
      return cached.data;
    }
  }

  // 2. Prevent duplicate in-flight network requests for the same key
  if (PENDING_PROMISES.has(key)) {
    return PENDING_PROMISES.get(key) as Promise<T>;
  }

  const promise = (async () => {
    try {
      const result = await fetcher();
      writeToCache(key, result, staleMs, expireMs);
      return result;
    } finally {
      PENDING_PROMISES.delete(key);
    }
  })();

  PENDING_PROMISES.set(key, promise);
  return promise;
}

/**
 * Revalidates data in background and silently updates the cache.
 */
function revalidateInBackground<T>(
  key: string,
  fetcher: () => Promise<T>,
  staleMs: number,
  expireMs: number
): void {
  if (PENDING_PROMISES.has(key)) return;

  const bgPromise = fetcher()
    .then((fresh) => {
      writeToCache(key, fresh, staleMs, expireMs);
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('divya_cache_updated', { detail: { key, data: fresh } }));
        } catch {
          // ignore
        }
      }
      return fresh;
    })
    .catch((err) => {
      console.warn(`[CacheStore] Background revalidation failed for "${key}":`, err);
    })
    .finally(() => {
      PENDING_PROMISES.delete(key);
    });

  PENDING_PROMISES.set(key, bgPromise);
}

/**
 * Helper to test if a key matches an invalidation target.
 */
function keyMatchesTarget(key: string, target: string): boolean {
  return (
    key === target ||
    key.startsWith(target) ||
    key.includes(`_${target}`) ||
    key.includes(`${target}_`) ||
    key.includes(target)
  );
}

/**
 * Invalidates cache by exact key or collection target (e.g. 'products', 'services', 'workshops').
 * Matches all related query keys such as col_products_*, doc_products_*, products_cat_*, etc.
 * Emits cross-tab event to ensure instant updates.
 */
export function invalidateCache(prefixOrKey?: string): void {
  if (!prefixOrKey) {
    MEMORY_CACHE.clear();
    if (isStorageAvailable()) {
      try {
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(CACHE_PREFIX)) toRemove.push(k);
        }
        toRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // ignore
      }
    }
    return;
  }

  // Clear matching keys in memory
  for (const k of Array.from(MEMORY_CACHE.keys())) {
    if (keyMatchesTarget(k, prefixOrKey)) {
      MEMORY_CACHE.delete(k);
    }
  }

  // Clear matching keys in localStorage
  if (isStorageAvailable()) {
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const rawKey = localStorage.key(i);
        if (rawKey && rawKey.startsWith(CACHE_PREFIX)) {
          const keyWithoutPrefix = rawKey.slice(CACHE_PREFIX.length);
          if (keyMatchesTarget(keyWithoutPrefix, prefixOrKey)) {
            toRemove.push(rawKey);
          }
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }

  // Broadcast cross-tab cache invalidation event
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('divya_cache_invalidated', { detail: { prefixOrKey } }));
    } catch {
      // ignore
    }
  }
}
