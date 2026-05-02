import { getAnimeBySlug, getEpisodes, getServers } from "../core/api.js";

/* ================= PARAMS ================= */
function getParams() {
  const url = new URLSearchParams(location.search);
  return {
    slug: url.get("slug"),
    ep: url.get("ep")
  };
}

/* ================= STATE ================= */
let animeSlug = null;
let episodes = [];
let currentIndex = 0;

let servers = [];
let currentServer = 0;
let failCount = 0;

let watchTimer = null;
let watchedSeconds = 0;

/* ================= INIT ================= */
export async function initWatchPage() {

  const params = getParams();
  if (!params.slug) return;

  animeSlug = params.slug;

  const anime = await getAnimeBySlug(animeSlug);
  if (!anime) return;

  episodes = await getEpisodes(anime.id);
  if (!episodes.length) return;

  const resume = getResume();

  if (params.ep) {
    currentIndex = episodes.findIndex(e => e.id == params.ep);
  } else if (resume && resume.slug === animeSlug) {
    currentIndex = episodes.findIndex(e => e.id == resume.episodeId);
  } else {
    currentIndex = 0;
  }

  if (currentIndex < 0) currentIndex = 0;

  renderEpisodes();
  loadEpisode();
  renderResumeButton();
}

/* ================= LOAD EP ================= */
async function loadEpisode() {

  const ep = episodes[currentIndex];
  if (!ep) return;

  servers = await getServers(ep.id);

  currentServer = 0;
  failCount = 0;
  watchedSeconds = 0;

  startWatchTimer();
  loadServer();
  renderDownloadButtons();
}

/* ================= LOAD SERVER ================= */
function loadServer() {

  const iframe = document.getElementById("iframe-embed");
  const server = servers[currentServer];

  if (!server) return;

  iframe.src = server.url;

  renderServers();
  detectFailover();
  saveHistory();
}

/* ================= FAILOVER ================= */
function detectFailover() {

  setTimeout(() => {

    const iframe = document.getElementById("iframe-embed");

    if (!iframe.src || iframe.src === "about:blank") {
      failCount++;

      if (failCount < servers.length) {
        currentServer++;
        loadServer();
      } else {
        showError();
      }
    }

  }, 4000);
}

function showError() {
  const msg = document.getElementById("player-message");
  if (msg) msg.style.display = "block";
}

/* ================= SERVERS ================= */
function renderServers() {

  const list = document.getElementById("serverList");

  list.innerHTML = servers.map((s, i) => `
    <button class="server ${i === currentServer ? "active" : ""}" data-i="${i}">
      Server ${i + 1}
    </button>
  `).join("");

  list.onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    currentServer = Number(btn.dataset.i);
    loadServer();
  };
}

/* ================= DOWNLOAD ================= */
function renderDownloadButtons(){

  const box = document.getElementById("downloadBox");
  if(!box) return;

  const ep = episodes[currentIndex];
  const epNo = currentIndex + 1;

  box.innerHTML = `
    <button class="download-btn">⬇ Download EP ${epNo}</button>
    <button class="download-btn secondary">📦 Full Page</button>
  `;

  const [epBtn, fullBtn] = box.querySelectorAll("button");

  epBtn.onclick = () => {
    location.href = `download.html?anime=${encodeURIComponent(animeSlug)}&episode=${epNo}`;
  };

  fullBtn.onclick = () => {
    location.href = `download.html?anime=${encodeURIComponent(animeSlug)}`;
  };
}

/* ================= NEXT ================= */
function nextEpisode() {

  currentIndex++;
  if (currentIndex >= episodes.length) return;

  loadEpisode();
}

/* ================= WATCH TIMER ================= */
function startWatchTimer() {

  if (watchTimer) clearInterval(watchTimer);

  watchTimer = setInterval(() => {
    watchedSeconds += 5;
    saveResume();
  }, 5000);
}

/* ================= HISTORY ================= */
function saveHistory() {

  const ep = episodes[currentIndex];

  let history = JSON.parse(localStorage.getItem("WATCH_HISTORY") || "[]");

  history = history.filter(h => h.slug !== animeSlug);

  history.unshift({
    slug: animeSlug,
    episodeId: ep.id,
    episodeNo: currentIndex + 1,
    updatedAt: Date.now()
  });

  localStorage.setItem("WATCH_HISTORY", JSON.stringify(history.slice(0, 20)));
}

/* ================= RESUME ================= */
function saveResume() {

  const ep = episodes[currentIndex];

  const data = {
    slug: animeSlug,
    episodeId: ep.id,
    episodeNo: currentIndex + 1,
    time: watchedSeconds
  };

  localStorage.setItem("RESUME_DATA", JSON.stringify(data));
}

function getResume() {
  try {
    return JSON.parse(localStorage.getItem("RESUME_DATA"));
  } catch {
    return null;
  }
}

/* ================= RESUME BUTTON ================= */
function renderResumeButton() {

  const resume = getResume();
  if (!resume || resume.slug !== animeSlug) return;

  const box = document.getElementById("extraActions");
  if (!box) return;

  const btn = document.createElement("button");
  btn.innerText = `▶ Resume EP ${resume.episodeNo}`;
  btn.className = "server";

  btn.onclick = () => {
    currentIndex = episodes.findIndex(e => e.id == resume.episodeId);
    loadEpisode();
  };

  box.prepend(btn);
}

/* ================= EP LIST ================= */
function renderEpisodes() {

  const grid = document.getElementById("episodeGrid");

  grid.innerHTML = episodes.map((ep, i) => `
    <div class="ep-card" data-i="${i}">
      <div class="ep-thumb">
        <img src="${ep.thumbnail || ""}?tr=w-300,h-180">
        <span class="ep-no">EP ${i + 1}</span>
      </div>
      <p>${ep.title || "Episode " + (i + 1)}</p>
    </div>
  `).join("");

  grid.onclick = (e) => {
    const card = e.target.closest(".ep-card");
    if (!card) return;

    currentIndex = Number(card.dataset.i);
    loadEpisode();
  };
}
