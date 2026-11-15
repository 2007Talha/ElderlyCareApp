/**
 * Deterministic hash-keyed LRU cache with TTL and latency savings metrics.
 * Caches AI responses and prescription scans to optimize efficiency and latency.
 */

interface CacheEntry<T> {
  value: T;
  createdAt: number;
  accessCount: number;
}

export interface CacheMetrics {
  totalLookups: number;
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  estimatedLatencySavedMs: number;
}

const ESTIMATED_LLM_LATENCY_MS = 2000;

function generateCacheKey(obj: unknown): string {
  const str = JSON.stringify(obj, Object.keys((obj ?? {}) as Record<string, unknown>).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `elder_cache_${Math.abs(hash).toString(36)}`;
}

export class ResponseCache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;
  private readonly ttlMs: number;
  private metrics: CacheMetrics = {
    totalLookups: 0, hits: 0, misses: 0, size: 0, hitRate: 0, estimatedLatencySavedMs: 0,
  };

  constructor(maxSize = 100, ttlMs = 300000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  get(keyObj: unknown): T | undefined {
    const key = generateCacheKey(keyObj);
    this.metrics.totalLookups++;
    const entry = this.cache.get(key);
    if (!entry) {
      this.metrics.misses++;
      this.updateMetrics();
      return undefined;
    }
    if (Date.now() - entry.createdAt > this.ttlMs) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.updateMetrics();
      return undefined;
    }
    this.cache.delete(key);
    entry.accessCount++;
    this.cache.set(key, entry);
    this.metrics.hits++;
    this.metrics.estimatedLatencySavedMs += ESTIMATED_LLM_LATENCY_MS;
    this.updateMetrics();
    return entry.value;
  }

  set(keyObj: unknown, value: T): void {
    const key = generateCacheKey(keyObj);
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const first = this.cache.keys().next().value;
      if (first !== undefined) this.cache.delete(first);
    }
    this.cache.set(key, { value, createdAt: Date.now(), accessCount: 0 });
    this.updateMetrics();
  }

  getMetrics(): CacheMetrics { return { ...this.metrics }; }

  clear(): void {
    this.cache.clear();
    this.metrics = { totalLookups: 0, hits: 0, misses: 0, size: 0, hitRate: 0, estimatedLatencySavedMs: 0 };
  }

  private updateMetrics(): void {
    this.metrics.size = this.cache.size;
    this.metrics.hitRate = this.metrics.totalLookups > 0
      ? (this.metrics.hits / this.metrics.totalLookups) * 100
      : 0;
  }
}

export const assistantResponseCache = new ResponseCache<string>(100, 300000);
