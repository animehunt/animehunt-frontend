/* ======================================================
   STORAGE MANAGER
====================================================== */

import { safeJSON } from "./utils.js";

/* ================= KEYS ================= */

const KEYS = {

  HISTORY: "WATCH_HISTORY",

  RESUME: "RESUME_DATA"

};

/* ================= STORAGE ================= */

function set(key, value) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

  } catch (err) {

    console.error("Storage save failed", err);

  }
}

function get(key, fallback = null) {

  try {

    const value = localStorage.getItem(key);

    if (!value) return fallback;

    return safeJSON(value, fallback);

  } catch {

    return fallback;

  }
}

function remove(key) {

  try {

    localStorage.removeItem(key);

  } catch {}

}

/* ======================================================
   WATCH HISTORY
====================================================== */

export function getHistory() {
  return get(KEYS.HISTORY, []);
}

export function saveHistory(item) {

  if (!item?.slug) return;

  let history = getHistory();

  history = history.filter(
    x =>
      !(
        x.slug === item.slug &&
        x.episodeId === item.episodeId
      )
  );

  history.unshift({

    slug: item.slug,

    animeId: item.animeId || null,

    episodeId: item.episodeId,

    episodeNo: item.episodeNo,

    title: item.title || "",

    poster: item.poster || "",

    updatedAt: Date.now()

  });

  history = history.slice(0, 50);

  set(KEYS.HISTORY, history);
}

export function clearHistory() {
  remove(KEYS.HISTORY);
}

/* ======================================================
   RESUME
====================================================== */

export function getResume() {
  return get(KEYS.RESUME, null);
}

export function saveResume(data) {

  if (!data?.slug) return;

  set(KEYS.RESUME, {

    slug: data.slug,

    animeId: data.animeId || null,

    episodeId: data.episodeId,

    episodeNo: data.episodeNo,

    currentTime: data.currentTime || 0,

    duration: data.duration || 0,

    updatedAt: Date.now()

  });
}

export function clearResume() {
  remove(KEYS.RESUME);
}

/* ======================================================
   HELPERS
====================================================== */

export function hasResume(slug) {

  const data = getResume();

  if (!data) return false;

  return data.slug === slug;
}
