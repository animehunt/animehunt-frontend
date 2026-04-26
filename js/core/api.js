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

// ===== PUBLIC =====
export const getAnime = (params = "") => api(`/public/anime${params}`);
export const getBanner = (params = "") => api(`/banner/public${params}`);
export const getHomepage = () => api(`/admin/homepage`);
export const getAnimeById = (id) => api(`/public/anime/${id}`);
export const getEpisodes = (id) => api(`/public/episodes/${id}`);
export const getServers = (epId) => api(`/public/servers/${epId}`);
