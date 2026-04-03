// src/lib/cache.ts

interface CacheEntry<T> {
  data:      T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlMs: number = 60_000): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  invalidate(keyPrefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(keyPrefix)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
  }
}

// Singleton — shared across all hook calls in the same browser session
export const cache = new MemoryCache();

// TTL constants
export const TTL = {
  PROMPT:   5  * 60_000,  // 5 minutes
  PROMPTS:  2  * 60_000,  // 2 minutes
  COMMENTS: 0,            // No cache — always real-time
} as const;