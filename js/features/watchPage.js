import { getAnimeById, getEpisodes, getServers } from "../core/api.js";

function getParams() {
  const url = new URLSearchParams(location.search);
  return {
    id: url.get("id"),
    ep: url.get("ep")
  };
}

let episodes = [];
let currentIndex = 0;
let servers = [];
let currentServer = 0;
let failCount = 0;

// ================= INIT =================
export async function initWatchPage() {
  const { id, ep } = getParams();
  if (!id) return;

  episodes = await getEpisodes(id);
  if (!episodes?.length) return;

  currentIndex = ep
    ? episodes.findIndex(e => e.id == ep)
    : 0;

  if (currentIndex < 0) currentIndex = 0;

  renderEpisodes(id);
  loadEpisode();
}

// ================= LOAD EPISODE =================
async function loadEpisode() {
  const ep = episodes[currentIndex];
  if (!ep) return;

  servers = await getServers(ep.id);
  currentServer = 0;
  failCount = 0;

  loadServer();
}

// ================= LOAD SERVER =================
function loadServer() {
  const iframe = document.getElementById("iframe-embed");
  const server = servers[currentServer];

  if (!server) return;

  iframe.src = server.url;

  renderServers();

  startFailDetection();
  startAutoNextTimer();
}

// ================= SERVER SWITCH =================
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

// ================= FAILOVER =================
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

// ================= AUTO NEXT =================
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

// ================= NEXT EP =================
function nextEpisode() {
  currentIndex++;

  if (currentIndex >= episodes.length) {
    console.log("No more episodes");
    return;
  }

  loadEpisode();
}

// ================= EPISODES GRID =================
function renderEpisodes(animeId) {
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
