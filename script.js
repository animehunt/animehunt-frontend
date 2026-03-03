/* =========================================
   ANIMEHUNT FRONTEND ENGINE (FINAL CF BUILD)
========================================= */

const API_BASE = "https://animehunt-backend.animehunt715.workers.dev";

/* =========================================
   DOM READY
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  initHome();
  initSearch();
});


/* =========================================
   HOME PAGE LOADER
========================================= */
async function initHome() {

  const rows = document.querySelectorAll(".movie-scroll");
  if (!rows.length) return;

  try {

    const res = await fetch(API_BASE + "/api/anime");
    const json = await res.json();

    if (!json.success) return;

    const allAnime = json.data;

    rows.forEach(row => {

      const category = row.dataset.row;
      row.innerHTML = "";

      let filtered = [...allAnime];

      if (category === "ongoing") {
        filtered = allAnime.filter(a => a.status === "ongoing");
      }

      if (category === "series") {
        filtered = allAnime.filter(a => a.type === "series");
      }

      if (category === "top-rated") {
        filtered = [...allAnime].sort((a,b)=> (b.rating || 0) - (a.rating || 0));
      }

      if (category === "most-viewed") {
        filtered = [...allAnime].sort((a,b)=> (b.views || 0) - (a.views || 0));
      }

      filtered.slice(0,10).forEach(anime => {

        const card = document.createElement("div");
        card.className = "movie-card";

        card.innerHTML = `
          <img src="${anime.poster || 'https://via.placeholder.com/300x450'}">
          <span>${anime.title}</span>
        `;

        card.onclick = () => {
          window.location.href = `details.html?slug=${anime.slug}`;
        };

        row.appendChild(card);

      });

    });

  } catch (err) {
    console.error("Home load error:", err);
  }
}


/* =========================================
   LIVE SEARCH ENGINE
========================================= */
function initSearch() {

  const searchInput = document.querySelector(".search-bar");
  if (!searchInput) return;

  const dropdown = document.createElement("div");
  dropdown.className = "search-dropdown";
  dropdown.style.display = "none";
  document.body.appendChild(dropdown);

  let allData = [];

  fetch(API_BASE + "/api/anime")
    .then(res => res.json())
    .then(json => {
      if (json.success) {
        allData = json.data;
      }
    });

  searchInput.addEventListener("input", function () {

    const query = this.value.trim().toLowerCase();
    dropdown.innerHTML = "";

    if (!query) {
      dropdown.style.display = "none";
      return;
    }

    const results = allData
      .filter(a => a.title.toLowerCase().includes(query))
      .slice(0,8);

    results.forEach(anime => {

      const item = document.createElement("div");
      item.className = "search-item";

      item.innerHTML = `
        <img src="${anime.poster || ''}">
        <span>${anime.title}</span>
      `;

      item.onclick = () => {
        window.location.href = `details.html?slug=${anime.slug}`;
      };

      dropdown.appendChild(item);
    });

    dropdown.style.display = results.length ? "block" : "none";

  });

  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

}
