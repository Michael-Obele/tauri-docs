export type CacheEntry<T> = {
  data: T;
  expires: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (cached && cached.expires > now) {
    return Promise.resolve(cached.data);
  }

  return fetcher().then((data) => {
    cache.set(key, { data, expires: now + ttlMs });
    return data;
  });
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
    return;
  }
  cache.clear();
}
