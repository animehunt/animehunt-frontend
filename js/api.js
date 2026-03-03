/* ===============================
   BASE CONFIG
================================ */
const BASE_URL = "https://animehunt-backend.animehunt715.workers.dev";

/* ===============================
   GENERIC FETCH
================================ */
async function apiFetch(endpoint) {
  try {
    const res = await fetch(BASE_URL + endpoint);

    if (!res.ok) {
      throw new Error("API Error");
    }

    return await res.json();
  } catch (err) {
    console.error("API Failed:", err);
    return [];
  }
}

/* ===============================
   ANIME FUNCTIONS
================================ */
async function getAllAnime() {
  return await apiFetch("/api/admin/anime");
}

async function getTrendingAnime() {
  return await apiFetch("/api/admin/anime?status=ongoing&home=yes");
}

async function getAnimeBySlug(slug) {
  const list = await apiFetch("/api/admin/anime?search=" + slug);
  return list.find(a => a.slug === slug);
}
