// ============================================================
// js/api.js
// Saare backend API calls ek jagah
// Base: https://YOUR-ACTUAL-BACKEND-DOMAIN.com  ⚠️ REPLACE with the real backend domain
// ============================================================

const BASE = 'https://YOUR-ACTUAL-BACKEND-DOMAIN.com';  // ⚠️ REPLACE

// Generic fetch helper — error handle karta hai
async function apiFetch(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// ============================================================
// HOME PAGE
// ============================================================

// { rows: [], categories: [] }
export function fetchHomepage() {
  return apiFetch('/api/homepage/public');
}

// featured banners array — hero slider ke liye
// returns: [{ slug, title, banner, poster, year, rating }]
export function fetchFeaturedBanners() {
  return apiFetch('/api/anime/featured');
}

// ============================================================
// ANIME DETAILS
// ============================================================

// Full anime object with seasons/episodes count
export function fetchDetails(slug) {
  return apiFetch(`/api/anime/${encodeURIComponent(slug)}`);
}

// episodes array for a season
// season = 1,2,3... OR 'all'
export function fetchEpisodes(animeId, season = 1) {
  return apiFetch(`/api/public/episodes/${encodeURIComponent(animeId)}?season=${season}`);
}

// related anime array
export function fetchRelated(animeId) {
  return apiFetch(`/api/recommendations/${encodeURIComponent(animeId)}`);
}

// ============================================================
// WATCH / PLAYER
// ============================================================

// servers array for an episode
// returns: [{ name, url }]
export function fetchServers(episodeId) {
  return apiFetch(`/api/public/servers/${encodeURIComponent(episodeId)}`);
}

// ============================================================
// DOWNLOAD
// ============================================================

// download links for an episode
// returns: [{ quality, size, sessionId }]
export function fetchDownloadLinks(episodeId) {
  return apiFetch(`/api/download/${encodeURIComponent(episodeId)}`);
}

// go.html session validate
// returns: { link, type }
export function fetchGoSession(sessionId) {
  return apiFetch(`/api/session/${encodeURIComponent(sessionId)}`);
}

// ============================================================
// LISTING PAGES
// ============================================================

// anime.html / movies.html / series.html / cartoon.html
// type: 'anime' | 'movie' | 'series' | 'cartoon'
// filter: 'all' | 'movie' | 'series'
// returns: { items: [], total, page }
export function fetchListing(type, page = 1, filter = 'all') {
  const f = filter === 'all' ? '' : `&filter=${filter}`;
  return apiFetch(`/api/anime?type=${type}&page=${page}${f}`);
}

// ============================================================
// CATEGORY PAGE
// ============================================================

// Category.html — genre slug ya A-Z letter
// key: 'action' OR 'A'
// returns: { items: [], title, total, hasMore }
export function fetchCategory(key, page = 1, type = '') {
  const typeQ = type ? `&type=${type}` : '';
  return apiFetch(`/api/category/${encodeURIComponent(key)}?page=${page}${typeQ}`);
}

// ============================================================
// SEARCH
// ============================================================

// Global search dropdown
// returns: [{ slug, title, poster, type }]
export function searchAnime(query) {
  return apiFetch(`/api/search?q=${encodeURIComponent(query)}`);
}


