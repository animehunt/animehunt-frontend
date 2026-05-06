/* ======================================================
   CORE UTILS
====================================================== */

/* ================= SAFE QUERY ================= */

export const $ = (selector, parent = document) =>
  parent.querySelector(selector);

export const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

/* ================= SAFE HTML ================= */

export function setHTML(el, html = "") {
  if (!el) return;
  el.innerHTML = html;
}

/* ================= SAFE TEXT ================= */

export function setText(el, text = "") {
  if (!el) return;
  el.textContent = text;
}

/* ================= IMAGE ================= */

export function image(url, fallback = "no-image.png") {
  if (!url) return fallback;
  return url;
}

/* ================= LOADER ================= */

export function loading(el, text = "Loading...") {
  if (!el) return;
  el.innerHTML = `
    <div style="
      padding:20px;
      text-align:center;
      color:#888;
      font-size:13px;
    ">
      ${text}
    </div>
  `;
}

/* ================= EMPTY ================= */

export function empty(el, text = "No Data") {
  if (!el) return;

  el.innerHTML = `
    <div style="
      padding:20px;
      text-align:center;
      color:#777;
      font-size:13px;
    ">
      ${text}
    </div>
  `;
}

/* ================= ERROR ================= */

export function error(el, text = "Something went wrong") {
  if (!el) return;

  el.innerHTML = `
    <div style="
      padding:20px;
      text-align:center;
      color:#ff6b6b;
      font-size:13px;
    ">
      ${text}
    </div>
  `;
}

/* ================= SLUG ================= */

export function slugify(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ================= QUERY ================= */

export function getQuery(name) {
  return new URLSearchParams(location.search).get(name);
}

/* ================= TIME ================= */

export function debounce(fn, delay = 300) {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/* ================= ARRAY ================= */

export function unique(arr = []) {
  return [...new Set(arr)];
}

/* ================= EPISODE SORT ================= */

export function sortEpisodes(list = []) {
  return [...list].sort((a, b) => {

    const sa = Number(a.season || 1);
    const sb = Number(b.season || 1);

    if (sa !== sb) {
      return sa - sb;
    }

    return Number(a.episode || 0) -
           Number(b.episode || 0);

  });
}

/* ================= CARD ================= */

export function createAnimeCard(anime) {

  return `
    <div 
      class="rel-card"
      data-slug="${anime.slug}"
      style="
        background-image:url('${image(anime.poster)}?tr=w-300,h-450');
        background-size:cover;
        background-position:center;
      "
    >
      <div style="
        width:100%;
        background:linear-gradient(transparent,rgba(0,0,0,.9));
        padding-top:50px;
        font-size:11px;
      ">
        ${anime.title}
      </div>
    </div>
  `;
}

/* ================= NAVIGATE ================= */

export function go(url) {
  location.href = url;
}

/* ================= PLAYER MESSAGE ================= */

export function showPlayerMessage(msg = "") {

  const box = $("#player-message");

  if (!box) return;

  box.innerHTML = msg;
  box.style.display = "flex";
}

export function hidePlayerMessage() {

  const box = $("#player-message");

  if (!box) return;

  box.style.display = "none";
}

/* ================= SAFE JSON ================= */

export function safeJSON(data, fallback = null) {

  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}
