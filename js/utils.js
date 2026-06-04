// ============================================================
// js/utils.js
// Helper functions — localStorage, URL params, debounce etc.
// ============================================================

const KEY_HISTORY  = 'ah_history';
const KEY_CONTINUE = 'ah_continue';
const MAX_HISTORY  = 50;
const MAX_CONTINUE = 20;

// ============================================================
// URL PARAMS
// ============================================================
export function getParam(key) {
  return new URLSearchParams(location.search).get(key) || '';
}

// ============================================================
// DEBOUNCE
// ============================================================
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ============================================================
// SLUGIFY
// ============================================================
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ============================================================
// WATCH HISTORY — details.html se save hota hai
// ============================================================
export function saveToHistory(anime) {
  if (!anime?.slug) return;

  try {
    const list     = getHistory();
    const filtered = list.filter(i => i.slug !== anime.slug);

    filtered.unshift({
      slug:   anime.slug,
      title:  anime.title  || '',
      poster: anime.poster || '',
      ts:     Date.now()
    });

    localStorage.setItem(
      KEY_HISTORY,
      JSON.stringify(filtered.slice(0, MAX_HISTORY))
    );
  } catch (e) { /* localStorage full ya private mode */ }
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY_HISTORY) || '[]');
  } catch { return []; }
}

export function clearHistory() {
  localStorage.removeItem(KEY_HISTORY);
}

// ============================================================
// CONTINUE WATCHING — watch.html se save hota hai
// ============================================================
export function saveWatchProgress(slug, season, ep, poster = '', title = '') {
  if (!slug) return;

  try {
    const list     = getContinueList();
    const filtered = list.filter(i => i.slug !== slug);

    filtered.unshift({ slug, season, ep, poster, title, ts: Date.now() });

    localStorage.setItem(
      KEY_CONTINUE,
      JSON.stringify(filtered.slice(0, MAX_CONTINUE))
    );
  } catch (e) {}
}

export function getWatchProgress(slug) {
  const list = getContinueList();
  return list.find(i => i.slug === slug) || null;
}

export function getContinueList() {
  try {
    return JSON.parse(localStorage.getItem(KEY_CONTINUE) || '[]');
  } catch { return []; }
}

export function clearContinueWatching() {
  localStorage.removeItem(KEY_CONTINUE);
}
