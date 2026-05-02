import { getAnimeBySlug, getAnime, getEpisodes } from "../core/api.js";
import { createCard, initLazy } from "../core/utils.js";

/* ================= PARAM ================= */
function getSlug() {
  return new URLSearchParams(location.search).get("slug");
}

/* ================= STATE ================= */
let animeSlug = null;
let episodes = [];
let currentSeason = "1";

/* ================= INIT ================= */
export async function initDetailsPage() {

  const slug = getSlug();
  if (!slug) {
    document.body.innerHTML = "<p>Invalid URL</p>";
    return;
  }

  animeSlug = slug;

  const data = await getAnimeBySlug(slug);

  if (!data) {
    document.body.innerHTML = "<p>Anime not found</p>";
    return;
  }

  renderAnime(data);

  await loadEpisodes(data.id);

  loadRelated(data);
}

/* ================= RENDER ANIME ================= */
function renderAnime(data) {

  document.getElementById("heroBg").style.backgroundImage =
    `url(${data.banner}?tr=w-1200,h-500)`;

  document.getElementById("posterImg").src =
    `${data.poster}?tr=w-300,h-450`;

  document.getElementById("animeTitle").innerHTML =
    `${data.title} <span>(${data.year || ""})</span>`;

  document.getElementById("animeMeta").innerHTML = `
    <span>${data.type}</span>
    <span>${data.status}</span>
    <span class="imdb">⭐ ${data.rating || "N/A"}</span>
  `;

  document.getElementById("animeDesc").innerText =
    data.description || "No description available";

  document.getElementById("aboutList").innerHTML = `
    <li><b>Language:</b> ${data.language || "-"}</li>
    <li><b>Duration:</b> ${data.duration || "-"}</li>
    <li><b>Genres:</b> ${(data.genres || []).join(", ")}</li>
  `;

  document.getElementById("aboutDesc").innerText =
    data.description || "";

  /* WATCH */
  document.querySelector(".watch").onclick = () => {
    location.href = `watch.html?slug=${data.slug}`;
  };

  /* DOWNLOAD */
  document.querySelector(".download").onclick = () => {
    location.href = `download.html?anime=${encodeURIComponent(data.slug)}`;
  };
}

/* ================= LOAD EPISODES ================= */
async function loadEpisodes(id) {

  const grid = document.getElementById("episodeGrid");
  grid.innerHTML = "Loading episodes...";

  try {
    episodes = await getEpisodes(id);

    if (!episodes.length) {
      grid.innerHTML = "<p>No episodes available</p>";
      return;
    }

    renderSeasonTabs();
    renderEpisodes();

  } catch {
    grid.innerHTML = "<p>Failed to load episodes</p>";
  }
}

/* ================= SEASON ================= */
function renderSeasonTabs() {

  const seasons = [...new Set(episodes.map(e => e.season || "1"))];

  const list = document.getElementById("seasonList");

  list.innerHTML = seasons.map(s => `
    <div data-season="${s}">Season ${s}</div>
  `).join("");

  list.onclick = (e) => {
    const s = e.target.dataset.season;
    if (!s) return;

    currentSeason = s;
    list.style.display = "none";
    renderEpisodes();
  };

  document.getElementById("seasonBtn").onclick = () => {
    list.style.display =
      list.style.display === "none" ? "block" : "none";
  };

  document.getElementById("allBtn").onclick = () => {
    currentSeason = "ALL";
    renderEpisodes();
  };
}

/* ================= EPISODES ================= */
function renderEpisodes() {

  const grid = document.getElementById("episodeGrid");

  let list = episodes;

  if (currentSeason !== "ALL") {
    list = episodes.filter(e =>
      (e.season || "1") == currentSeason
    );
  }

  grid.innerHTML = list.map(ep => `
    <div class="ep-card" data-id="${ep.id}">
      <div class="ep-thumb">
        <img src="${ep.thumbnail || ""}?tr=w-300,h-180">
        <span class="ep-no">EP ${ep.episode}</span>
      </div>
      <p>${ep.title || "Episode " + ep.episode}</p>
    </div>
  `).join("");

  grid.onclick = (e) => {
    const card = e.target.closest(".ep-card");
    if (!card) return;

    const epId = card.dataset.id;

    location.href = `watch.html?slug=${animeSlug}&ep=${epId}`;
  };
}

/* ================= RELATED ================= */
async function loadRelated(data) {
  try {
    const res = await getAnime(
      `?type=${data.type}&limit=8`
    );

    const list = res?.data || [];

    document.getElementById("relatedGrid").innerHTML =
      list.map(createCard).join("");

    initLazy();

  } catch (err) {
    console.warn("Related failed", err);
  }
}
