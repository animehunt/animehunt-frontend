const BASE = "https://animehunt-backend.animehunt715.workers.dev/api";

export async function api(url) {
  try {
    const res = await fetch(BASE + url);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error("API ERROR:", err);
    return null;
  }
}

// ===== PUBLIC =====
export const getAnime = (params = "") => api(`/public/anime${params}`);
export const getBanner = (params = "") => api(`/banner/public${params}`);
export const getHomepage = () => api(`/admin/homepage`);
