/* =========================================
   ANIMEHUNT FRONTEND ENGINE (CLEAN BUILD)
========================================= */

const API_BASE = "https://animehunt-backend-rhg6.onrender.com";

/* =========================================
   DOM READY
========================================= */
document.addEventListener("DOMContentLoaded", () => {

  initSidebar();
  initHome();
  initSearch();

});


/* =========================================
   SIDEBAR ENGINE
========================================= */
function initSidebar() {

  const menuBtn = document.querySelector(".menu-btn");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".overlay");
  const closeBtn = document.querySelector(".close-btn");

  if (!menuBtn || !sidebar || !overlay) return;

  menuBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  closeBtn?.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

}


/* =========================================
   HOME PAGE LOADER
========================================= */
async function initHome() {

  const rows = document.querySelectorAll(".movie-scroll");
  if (!rows.length) return;

  try {

    const res = await fetch(API_BASE + "/api/anime");
    const json = await res.json();
    if (!json.success || !json.data) return;

    const allAnime = json.data;

    rows.forEach(row => {

      const category = row.dataset.row;
      row.innerHTML = "";

      let filtered = allAnime;

      if (category === "ongoing") {
        filtered = allAnime.filter(a => a.status === "ongoing");
      }

      else if (category === "action") {
        filtered = allAnime.filter(a => a.genre?.toLowerCase().includes("action"));
      }

      else if (category === "romance") {
        filtered = allAnime.filter(a => a.genre?.toLowerCase().includes("romance"));
      }

      else if (category === "series") {
        filtered = allAnime.filter(a => a.type === "series");
      }

      else if (category === "top-rated") {
        filtered = [...allAnime].sort((a,b)=> b.rating - a.rating);
      }

      else if (category === "most-viewed") {
        filtered = [...allAnime].sort((a,b)=> b.views - a.views);
      }

      filtered.slice(0,10).forEach(anime => {

        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
          <img src="${anime.thumbnail}" alt="">
          <span>${anime.title}</span>
        `;

        card.onclick = () => {
          window.location.href = `details.html?anime=${anime.slug}`;
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
      if (json.success && json.data) {
        allData = json.data;
      }
    });

  function positionDropdown() {
    const rect = searchInput.getBoundingClientRect();
    dropdown.style.position = "absolute";
    dropdown.style.top = rect.bottom + window.scrollY + "px";
    dropdown.style.left = rect.left + window.scrollX + "px";
    dropdown.style.width = rect.width + "px";
  }

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

    if (!results.length) {
      dropdown.style.display = "none";
      return;
    }

    results.forEach(anime => {

      const item = document.createElement("div");
      item.className = "search-item";

      item.innerHTML = `
        <img src="${anime.thumbnail}" alt="">
        <span>${anime.title}</span>
      `;

      item.onclick = () => {
        window.location.href = `details.html?anime=${anime.slug}`;
      };

      dropdown.appendChild(item);

    });

    positionDropdown();
    dropdown.style.display = "block";

  });

  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

}
