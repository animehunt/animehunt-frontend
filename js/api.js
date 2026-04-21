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

const API = import.meta.env.VITE_API_URL;

fetch(`${API}/`)
  .then(res => res.text())
  .then(data => console.log(data));

export default {
  async fetch(request) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*"
        }
      });
    }

    return new Response("Backend working", {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
