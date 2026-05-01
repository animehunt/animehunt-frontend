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

  const key = url + JSON.stringify(options);

  if (cache.has(key)) {
    return cache.get(key);
  }

  try {

    const res = await fetch(BASE + url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : null
    });

    if (!res.ok) {
      console.error("API FAILED:", res.status, url);
      return null;
    }

    const json = await res.json();

    const data = json.data || json;

    cache.set(key, data);

    return data;

  } catch (err) {
    console.error("API ERROR:", err);
    return null;
  }
}

/* ===============================
   CLEAR CACHE (optional use)
=============================== */

export function clearCache() {
  cache.clear();
}

/* ===============================
   PUBLIC ANIME APIs
=============================== */

export const getAnime = (params = "") =>
  api(`/public/anime${params}`);

export const getAnimeById = (id) =>
  api(`/public/anime/${id}`);

/* ===============================
   EPISODES
=============================== */

export const getEpisodes = async (animeId) => {

  const data = await api(`/public/episodes/${encodeURIComponent(animeId)}`);

  if (!Array.isArray(data)) return [];

  // 🔥 normalize
  return data.map(e => ({
    id: e.id,
    season: e.season || "1",
    episode: e.episode,
    title: e.title || `Episode ${e.episode}`,
    thumbnail: e.thumbnail || "",
    servers: e.servers || []
  }));
};

/* ===============================
   SERVERS
=============================== */

export const getServers = async (epId) => {

  const data = await api(`/public/servers/${epId}`);

  if (!Array.isArray(data)) return [];

  return data.map(s => ({
    url: s.url
  }));
};

/* ===============================
   BANNERS
=============================== */

export const getBanner = (params = "") =>
  api(`/banner/public${params}`);

/* ===============================
   CATEGORIES
=============================== */

export const getCategories = () =>
  api(`/categories`);

/* ===============================
   DOWNLOAD APIs
=============================== */

export const getDownloads = (anime, season, episode) =>
  api(`/downloads/${encodeURIComponent(anime)}/${season}/${episode}`);

export const getFullDownloads = (anime) =>
  api(`/downloads-full/${encodeURIComponent(anime)}`);

/* ===============================
   SEARCH (optional future use)
=============================== */

export const searchAnime = (query) =>
  api(`/public/anime?search=${encodeURIComponent(query)}`);

/* ===============================
   PREFETCH (🔥 PERFORMANCE BOOST)
=============================== */

export function prefetch(url) {
  api(url);
}

/* ===============================
   PARALLEL FETCH
=============================== */

export async function parallel(requests = []) {
  return Promise.all(requests.map(r => api(r)));
}
