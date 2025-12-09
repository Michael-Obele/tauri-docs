import { CacheEntry, CacheStats, CacheConfig } from "./types";

export class CacheManager<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats: CacheStats;
  private config: Required<CacheConfig>;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: CacheConfig) {
    this.config = {
      checkInterval: 60000, // 1 minute default
      ...config,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      maxSize: config.maxSize,
      itemCount: 0,
    };

    // Start automatic cleanup
    this.startCleanup();
  }

  /**
   * Get a value from cache
   */
  get<V = T>(key: string): V | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      return undefined;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.value as unknown as V;
  }

  /**
   * Set a value in cache
   */
  set(key: string, value: T): void {
    const size = this.estimateSize(value);
    const expiresAt = Date.now() + this.config.ttl;

    // Check if we need to evict items
    while (
      this.stats.size + size > this.config.maxSize &&
      this.cache.size > 0
    ) {
      this.evictLRU();
    }

    // Remove old entry if exists
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!;
      this.stats.size -= oldEntry.size;
      this.stats.itemCount--;
    }

    // Add new entry
    const entry: CacheEntry<T> = {
      value,
      expiresAt,
      size,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
    this.stats.size += size;
    this.stats.itemCount++;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.stats.size -= entry.size;
    this.stats.itemCount--;
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.itemCount = 0;
    this.stats.evictions = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let lruKey: string | undefined;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
      this.stats.evictions++;
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.checkInterval);

    // Don't keep process alive for cleanup
    this.cleanupTimer.unref();
  }

  /**
   * Stop automatic cleanup timer
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: T): number {
    const str = JSON.stringify(value);
    return new Blob([str]).size;
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}

// =============================
// Cache Instances
// =============================

// 10MB cache for documentation index (1 hour TTL)
export const indexCache = new CacheManager({
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 10 * 1024 * 1024, // 10MB
});

// 50MB cache for page content (30 minutes TTL)
export const pageCache = new CacheManager({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 50 * 1024 * 1024, // 50MB
});
