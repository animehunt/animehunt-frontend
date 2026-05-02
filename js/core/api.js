/* ===============================
   BASE CONFIG
=============================== */

const BASE = "https://animehunt-backend.animehunt715.workers.dev/api";

/* ===============================
   SIMPLE CACHE (in-memory)
=============================== */

const cache = new Map();

/* ===============================
   CORE API FUNCTION
=============================== */

export async function api(url, options = {}) {
  const method = options.method || "GET";

  // ✅ cache only for GET
  const key = method === "GET" ? url : null;

  if (key && cache.has(key)) {
    return cache.get(key);
  }

  try {
    const res = await fetch(BASE + url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : null
    });

    if (!res.ok) {
      console.error("❌ API FAILED:", res.status, url);
      return null;
    }

    const json = await res.json();

    // ✅ strict structure
    if (!json.success) {
      console.error("❌ API ERROR:", json.message);
      return null;
    }

    const data = json.data;

    if (key) cache.set(key, data);

    return data;

  } catch (err) {
    console.error("❌ API ERROR:", err);
    return null;
  }
}

/* ===============================
   CLEAR CACHE
=============================== */

export function clearCache() {
  cache.clear();
}

/* ===============================
   PARALLEL FETCH
=============================== */

export async function parallel(requests = []) {
  return Promise.all(requests.map(r => api(r)));
}

/* ===============================
   PREFETCH
=============================== */

export function prefetch(url) {
  api(url);
}

/* ===============================
   ===============================
   PUBLIC APIs
   ===============================
=============================== */

/* ========= ANIME ========= */

// list with filters + pagination
export const getAnime = (params = "") =>
  api(`/public/anime${params}`);

// by slug (future ready)
export const getAnimeBySlug = (slug) =>
  api(`/public/anime/${encodeURIComponent(slug)}`);

/* ========= BANNERS ========= */

export const getBanner = (params = "") =>
  api(`/banner/public${params}`);

/* ========= EPISODES ========= */

export const getEpisodes = async (animeId) => {
  const data = await api(`/public/episodes/${encodeURIComponent(animeId)}`);

  if (!Array.isArray(data)) return [];

  return data.map(e => ({
    id: e.id,
    season: e.season || "1",
    episode: e.episode,
    title: e.title || `Episode ${e.episode}`,
    thumbnail: e.thumbnail || "",
    servers: e.servers || []
  }));
};

/* ========= SERVERS ========= */

export const getServers = async (epId) => {
  const data = await api(`/public/servers/${epId}`);

  if (!Array.isArray(data)) return [];

  return data.map(s => ({
    url: s.url
  }));
};

/* ========= CATEGORIES ========= */

export const getCategories = () =>
  api(`/categories`);

/* ========= DOWNLOAD ========= */

export const getDownloads = (anime, season, episode) =>
  api(`/downloads/${encodeURIComponent(anime)}/${season}/${episode}`);

export const getFullDownloads = (anime) =>
  api(`/downloads-full/${encodeURIComponent(anime)}`);

/* ========= SEARCH ========= */

export const searchAnime = (query) =>
  api(`/public/anime?search=${encodeURIComponent(query)}`);
