const BASE = "https://animehunt-backend.animehunt715.workers.dev/api";

const cache = new Map();

export async function api(url) {
  if (cache.has(url)) return cache.get(url);

  try {
    const res = await fetch(BASE + url);
    const json = await res.json();

    const data = json.data || json;
    cache.set(url, data);

    return data;
  } catch (err) {
    console.error("API ERROR:", err);
    return null;
  }
}

// ===== PUBLIC APIs =====
export const getAnime = (params = "") => api(`/public/anime${params}`);
export const getAnimeById = (id) => api(`/public/anime/${id}`);
export const getEpisodes = (id) => api(`/public/episodes/${id}`);
export const getServers = (epId) => api(`/public/servers/${epId}`);
export const getBanner = (params = "") => api(`/banner/public${params}`);

// ⚠️ FIXED
export const getCategories = () => api(`/categories`);

// ❌ REMOVE this (admin endpoint)
// export const getHomepage = () => api(`/admin/homepage`);

// ===== DOWNLOAD =====
export const getDownloads = (anime, season, episode) =>
  api(`/downloads/${anime}/${season}/${episode}`)

export const getAllEpisodes = (anime) =>
  api(`/downloads/${anime}`)

const BASE = "https://animehunt-backend.animehunt715.workers.dev/api"

export async function getEpisodes(anime){
  const res = await fetch(`${BASE}/public/episodes/${encodeURIComponent(anime)}`)
  return res.json()
}

export async function getServers(id){
  const res = await fetch(`${BASE}/public/servers/${id}`)
  return res.json()
}
