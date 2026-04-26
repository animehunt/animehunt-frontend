import { getAnimeById } from "../core/api.js";

// ================= INIT =================
export async function initContinueWatching() {
  const section = document.getElementById("continueSection");
  const scroll = document.getElementById("continueScroll");
  const clearBtn = document.getElementById("clearContinueBtn");

  let history = JSON.parse(localStorage.getItem("WATCH_HISTORY") || "[]");

  if (!history.length) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  // ================= RENDER =================
  const html = await Promise.all(
    history.map(async (item) => {
      const anime = await getAnimeById(item.animeId);
      if (!anime) return "";

      return `
        <div class="movie-card" onclick="goResume('${item.animeId}','${item.episodeId}')">
          <div>${anime.title}</div>
          <small>EP ${item.episodeNo}</small>
        </div>
      `;
    })
  );

  scroll.innerHTML = html.join("");

  // ================= CLEAR =================
  clearBtn.onclick = () => {
    if (!confirm("Clear Continue Watching?")) return;

    localStorage.removeItem("WATCH_HISTORY");
    localStorage.removeItem("RESUME_DATA");

    section.style.display = "none";
  };
}

// ================= NAV =================
window.goResume = (id, ep) => {
  location.href = `watch.html?id=${id}&ep=${ep}`;
};
