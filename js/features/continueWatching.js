import { getAnimeBySlug } from "../core/api.js";

export async function initContinueWatching() {

  const section = document.getElementById("continueSection");
  const scroll = document.getElementById("continueScroll");

  let history = JSON.parse(localStorage.getItem("WATCH_HISTORY") || "[]");

  if (!history.length) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  const html = await Promise.all(
    history.map(async (item) => {
      const anime = await getAnimeBySlug(item.slug);
      if (!anime) return "";

      return `
        <div class="movie-card" data-slug="${item.slug}" data-ep="${item.episodeId}">
          <div>${anime.title}</div>
          <small>EP ${item.episodeNo}</small>
        </div>
      `;
    })
  );

  scroll.innerHTML = html.join("");

  scroll.onclick = (e) => {
    const card = e.target.closest(".movie-card");
    if (!card) return;

    location.href = `watch.html?slug=${card.dataset.slug}&ep=${card.dataset.ep}`;
  };
}
