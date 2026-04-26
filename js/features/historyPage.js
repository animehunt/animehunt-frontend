import { getAnimeById } from "../core/api.js";

// ================= INIT =================
init();

async function init() {
  renderContinue();
  renderHistory();

  document.getElementById("clearHistory").onclick = clearHistory;
}

// ================= CONTINUE =================
async function renderContinue() {
  const resume = JSON.parse(localStorage.getItem("RESUME_DATA") || "null");
  const container = document.getElementById("continueGrid");

  if (!resume) {
    container.innerHTML = "<p style='color:#777'>No resume data</p>";
    return;
  }

  const anime = await getAnimeById(resume.animeId);

  if (!anime) return;

  container.innerHTML = `
    <div class="card" onclick="goWatch('${anime.id}','${resume.episodeId}')">
      <div>${anime.title}</div>
      <small>EP ${resume.episodeNo}</small>
    </div>
  `;
}

// ================= HISTORY =================
async function renderHistory() {
  const history = JSON.parse(localStorage.getItem("WATCH_HISTORY") || "[]");
  const container = document.getElementById("historyGrid");

  if (!history.length) {
    container.innerHTML = "<p style='color:#777'>No history</p>";
    return;
  }

  container.innerHTML = "Loading...";

  const html = await Promise.all(
    history.map(async (item) => {
      const anime = await getAnimeById(item.animeId);
      if (!anime) return "";

      return `
        <div class="card" onclick="goDetails('${anime.id}')">
          <div>${anime.title}</div>
          <small>Last EP ${item.episodeNo}</small>
        </div>
      `;
    })
  );

  container.innerHTML = html.join("");
}

// ================= NAVIGATION =================
window.goWatch = (id, ep) => {
  location.href = `watch.html?id=${id}&ep=${ep}`;
};

window.goDetails = (id) => {
  location.href = `details.html?id=${id}`;
};

// ================= CLEAR =================
function clearHistory() {
  if (!confirm("Clear all history?")) return;

  localStorage.removeItem("WATCH_HISTORY");
  localStorage.removeItem("RESUME_DATA");

  renderHistory();
  renderContinue();
}
