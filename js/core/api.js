const BASE = "https://animehunt-backend.animehunt715.workers.dev/api";

const cache = new Map();

/* ================= CORE API ================= */

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

/* ================= PUBLIC APIs ================= */

export const getAnime = (params = "") =>
  api(`/public/anime${params}`);

export const getAnimeById = (id) =>
  api(`/public/anime/${id}`);

/* 🔥 FIXED (IMPORTANT) */
export const getEpisodes = (anime) =>
  api(`/public/episodes/${encodeURIComponent(anime)}`);

export const getServers = (epId) =>
  api(`/public/servers/${epId}`);

export const getBanner = (params = "") =>
  api(`/banner/public${params}`);

export const getCategories = () =>
  api(`/categories`);

/* ================= DOWNLOAD ================= */

export const getDownloads = (anime, season, episode) =>
  api(`/downloads/${encodeURIComponent(anime)}/${season}/${episode}`);

export const getAllDownloads = (anime) =>
  api(`/downloads-full/${encodeURIComponent(anime)}`);
