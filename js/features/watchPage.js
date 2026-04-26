import { getAnimeById, getEpisodes, getServers } from "../core/api.js";

function getParams() {
  const url = new URLSearchParams(location.search);
  return {
    id: url.get("id"),
    ep: url.get("ep")
  };
}

export async function initWatchPage() {
  const { id, ep } = getParams();
  if (!id) return;

  const anime = await getAnimeById(id);
  const episodes = await getEpisodes(id);

  if (!episodes?.length) return;

  let currentEp = ep || episodes[0].id;

  renderEpisodes(episodes, id);
  loadPlayer(currentEp);
}

// ===== PLAYER =====
async function loadPlayer(epId) {
  const iframe = document.getElementById("iframe-embed");
  const servers = await getServers(epId);

  if (!servers?.length) {
    iframe.src = "";
    return;
  }

  iframe.src = servers[0].url;

  renderServers(servers, iframe);
}

// ===== SERVERS =====
function renderServers(servers, iframe) {
  const list = document.getElementById("serverList");

  list.innerHTML = servers.map((s, i) => `
    <button class="server ${i === 0 ? "active" : ""}" data-url="${s.url}">
      Server ${i + 1}
    </button>
  `).join("");

  list.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      list.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      iframe.src = btn.dataset.url;
    };
  });
}

// ===== EPISODES =====
function renderEpisodes(episodes, animeId) {
  const grid = document.getElementById("episodeGrid");

  grid.innerHTML = episodes.map((ep, i) => `
    <div class="ep-card" onclick="location.href='watch.html?id=${animeId}&ep=${ep.id}'">
      <div class="ep-thumb">
        <img src="${ep.thumbnail || ''}">
        <span class="ep-no">EP ${i + 1}</span>
      </div>
      <p>${ep.title || "Episode " + (i + 1)}</p>
    </div>
  `).join("");
}
