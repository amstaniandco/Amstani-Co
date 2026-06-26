import type { StoreInfo } from "../context/StoreContext";

// In-memory cache of store fetches, shared across the store page and the
// music player so they never request the same store twice, and so navigating
// between store pages reuses the already-loaded data instead of refetching.
// Entries expire after TTL_MS so longer revisits still pick up changes
// (e.g. live status) while rapid navigation stays instant.
const TTL_MS = 60_000;

type Entry = { at: number; promise: Promise<StoreInfo | null> };
const cache = new Map<string, Entry>();

type FetchOpts = { storeId?: string | null; state?: string | null };

function endpointFor({ storeId, state }: FetchOpts): string {
  if (storeId) return `/api/stores?storeId=${storeId}`;
  if (state) return `/api/stores?state=${encodeURIComponent(state)}`;
  return "/api/stores";
}

export function fetchStore(opts: FetchOpts): Promise<StoreInfo | null> {
  const url = endpointFor(opts);

  const cached = cache.get(url);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.promise;

  const promise = fetch(url)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => ((data?.stores ?? [])[0] ?? null) as StoreInfo | null)
    .catch((e) => {
      // Don't cache failures — allow a retry on the next call
      cache.delete(url);
      console.error("fetchStore failed", e);
      return null;
    });

  cache.set(url, { at: Date.now(), promise });
  return promise;
}
