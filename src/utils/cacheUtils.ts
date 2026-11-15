/**
 * In-memory TTL cache and O(1) indexed lookup utilities.
 * Optimizes repetitive database and entity scans across the platform.
 */

interface CacheRecord<T> {
  value: T;
  expiresAt: number;
}

/**
 * Lightweight, generic in-memory TTL cache with O(1) reads and writes.
 */
export class FastCache<T> {
  private readonly store = new Map<string, CacheRecord<T>>();
  private readonly defaultTtlMs: number;

  /**
   * @param defaultTtlMs Default time-to-live in milliseconds (default: 60,000ms).
   */
  constructor(defaultTtlMs = 60000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Retrieves an item from cache if not expired.
   * @param key Unique cache key.
   * @returns Value or undefined if missing/expired.
   */
  get(key: string): T | undefined {
    const record = this.store.get(key);
    if (!record) return undefined;
    if (Date.now() > record.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return record.value;
  }

  /**
   * Caches an item with an optional TTL.
   * @param key Unique cache key.
   * @param value Item to store.
   * @param ttlMs Optional custom TTL in milliseconds.
   */
  set(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
  }

  /**
   * Checks whether an unexpired key exists in the cache.
   * @param key Unique cache key.
   * @returns Boolean indicating presence.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Removes an item from the cache.
   * @param key Unique cache key.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clears the entire cache store.
   */
  clear(): void {
    this.store.clear();
  }
}

/**
 * Builds an O(1) Map index from an array of items with an `id` field.
 * @param items Array of items.
 * @returns Map indexed by item ID.
 */
export function buildIdIndex<T extends { id: string }>(items: readonly T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return map;
}

/** Global fast entity cache for high-frequency queries */
export const entityCache = new FastCache<unknown>(30000);
