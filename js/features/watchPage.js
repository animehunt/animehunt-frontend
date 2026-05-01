import { getAnimeById, getEpisodes, getServers } from "../core/api.js";

function getParams() {
  const url = new URLSearchParams(location.search);
  return {
    id: url.get("id"),
    ep: url.get("ep")
  };
}

let animeId = null;
let animeName = null; // ✅ FINAL FIX
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
  animeId = params.id;

  if (!animeId) return;

  const animeData = await getAnimeById(animeId);
  if (!animeData) return;

  // ✅ ALWAYS SAME FIELD USE KARO
  animeName = animeData.title;

  episodes = await getEpisodes(animeId);
  if (!episodes?.length) return;

  const resume = getResume();

  if (params.ep) {
    currentIndex = episodes.findIndex(e => e.id == params.ep);
  } else if (resume && resume.animeId === animeId) {
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

/* ================= SERVER ================= */
function loadServer() {
  const iframe = document.getElementById("iframe-embed");
  const server = servers[currentServer];

  if (!server) return;

  iframe.src = server.url;

  renderServers();

  startFailDetection();
  startAutoNextTimer();

  saveHistory();
}

/* ================= SERVERS ================= */
function renderServers() {
  const list = document.getElementById("serverList");

  list.innerHTML = servers.map((s, i) => `
    <button class="server ${i === currentServer ? "active" : ""}" data-i="${i}">
      Server ${i + 1}
    </button>
  `).join("");

  list.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      currentServer = Number(btn.dataset.i);
      loadServer();
    };
  });
}

/* ================= DOWNLOAD BUTTONS ================= */
function renderDownloadButtons(){

  const container = document.getElementById("downloadBox");
  if(!container) return;

  const ep = episodes[currentIndex];
  const episodeNo = currentIndex + 1;

  container.innerHTML = `
    <button class="download-btn" id="downloadEp">
      ⬇ Download Episode ${episodeNo}
    </button>

    <button class="download-btn secondary" id="downloadAll">
      📦 Full Download Page
    </button>
  `;

  // ✅ SINGLE EP
  document.getElementById("downloadEp").onclick = () => {

    const url = `download.html?anime=${encodeURIComponent(animeName)}&season=${ep.season || 1}&episode=${episodeNo}`;

    location.href = url;
  };

  // ✅ FULL PAGE
  document.getElementById("downloadAll").onclick = () => {

    const url = `download.html?anime=${encodeURIComponent(animeName)}`;

    location.href = url;
  };

}

/* ================= FAILOVER ================= */
function startFailDetection() {
  const iframe = document.getElementById("iframe-embed");

  let loaded = false;

  iframe.onload = () => {
    loaded = true;
  };

  setTimeout(() => {
    if (!loaded) {
      failCount++;

      if (failCount < servers.length) {
        currentServer++;
        loadServer();
      } else {
        showError();
      }
    }
  }, 5000);
}

function showError() {
  const msg = document.getElementById("player-message");
  if (msg) msg.style.display = "block";
}

/* ================= AUTO NEXT ================= */
function startAutoNextTimer() {
  const box = document.getElementById("autoNextBox");
  const countEl = document.getElementById("countdown");

  if (!box || !countEl) return;

  let time = 5;

  box.style.display = "block";
  countEl.innerText = time;

  const interval = setInterval(() => {
    time--;
    countEl.innerText = time;

    if (time <= 0) {
      clearInterval(interval);
      nextEpisode();
    }
  }, 1000);
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
    watchedSeconds++;
    saveResume();
  }, 5000);
}

/* ================= HISTORY ================= */
function saveHistory() {
  const ep = episodes[currentIndex];

  let history = JSON.parse(localStorage.getItem("WATCH_HISTORY") || "[]");

  history = history.filter(h => h.animeId !== animeId);

  history.unshift({
    animeId,
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
    animeId,
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
  if (!resume || resume.animeId !== animeId) return;

  const container = document.getElementById("extraActions");
  if (!container) return;

  const btn = document.createElement("button");
  btn.innerText = `▶ Resume EP ${resume.episodeNo}`;
  btn.className = "server";

  btn.onclick = () => {
    currentIndex = episodes.findIndex(e => e.id == resume.episodeId);
    loadEpisode();
  };

  container.prepend(btn);
}

/* ================= EPISODES ================= */
function renderEpisodes() {
  const grid = document.getElementById("episodeGrid");

  grid.innerHTML = episodes.map((ep, i) => `
    <div class="ep-card" onclick="goEp(${i})">
      <div class="ep-thumb">
        <img src="${ep.thumbnail || ""}">
        <span class="ep-no">EP ${i + 1}</span>
      </div>
      <p>${ep.title || "Episode " + (i + 1)}</p>
    </div>
  `).join("");

  window.goEp = (i) => {
    currentIndex = i;
    loadEpisode();
  };
}
