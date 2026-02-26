/* =====================================================  
   ANIMEHUNT – COMPLETE FINAL STABLE SCRIPT  
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

/* ================= API CONFIG ================= */

const API_BASE = "https://animehunt-backend-rhg6.onrender.com";

async function apiGet(url) {
  try {
    const res = await fetch(API_BASE + url);
    return await res.json();
  } catch (err) {
    console.error("API ERROR:", err);
    return { success: false };
  }
}

/* ================= SIDEBAR ================= */

const menuBtn = document.querySelector(".menu-btn");
const sidebar = document.querySelector(".sidebar");
const closeBtn = document.querySelector(".close-btn");
const overlay = document.querySelector(".overlay");

if (menuBtn && sidebar && overlay) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
  });
}

if (closeBtn && sidebar && overlay) {
  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });
}

if (overlay && sidebar) {
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });
}

/* ================= HERO PLAY ================= */

const playBtn = document.querySelector(".play-btn");
if (playBtn) {
  playBtn.addEventListener("click", () => {
    window.location.href = "watch.html";
  });
}

/* ================= MOVIE CARD CLICK ================= */

document.addEventListener("click", function (e) {
  const card = e.target.closest(".movie-card");
  if (!card) return;
  if (e.target.closest("a")) return;

  const slug =
    card.dataset.slug ||
    card.innerText.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

  window.location.href = "details.html?anime=" + slug;
});

/* ================= GRID DETECTOR ================= */

function getActiveGrid() {
  return (
    document.querySelector(".home-grid.active") ||
    document.querySelector(".anime-grid") ||
    document.querySelector(".movies-grid") ||
    document.querySelector(".series-grid") ||
    document.querySelector(".cartoon-grid")
  );
}

/* ================= UNIVERSAL PAGINATION ================= */

function initPagination() {

  const pagination = document.querySelector(".pagination");
  if (!pagination) return;

  let currentPage = 1;
  const perPage = 20;

  function showPage(page) {

    const grid = getActiveGrid();
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".movie-card"));
    const totalPages = Math.ceil(cards.length / perPage);
    if (page > totalPages) return;

    currentPage = page;

    const start = (page - 1) * perPage;
    const end = start + perPage;

    cards.forEach((card, index) => {
      card.style.display =
        index >= start && index < end ? "block" : "none";
    });

    pagination.querySelectorAll("button").forEach(btn => {
      btn.classList.remove("active");
      if (btn.dataset.page == page) btn.classList.add("active");
    });
  }

  pagination.addEventListener("click", function (e) {

    if (e.target.dataset.page) {
      showPage(Number(e.target.dataset.page));
    }

    if (e.target.dataset.nav === "prev" && currentPage > 1) {
      showPage(currentPage - 1);
    }

    if (e.target.dataset.nav === "next") {
      showPage(currentPage + 1);
    }

  });

  showPage(1);
}

initPagination();

/* ================= A-Z ================= */

const azNav = document.querySelector(".az-nav");

if (azNav) {

  azNav.addEventListener("click", function (e) {

    if (e.target.tagName !== "SPAN") return;

    const letter = e.target.innerText.toLowerCase();

    azNav.querySelectorAll("span")
      .forEach(l => l.classList.remove("active"));

    e.target.classList.add("active");

    const grid = getActiveGrid();
    if (!grid) return;

    const cards = grid.querySelectorAll(".movie-card");

    cards.forEach(card => {
      const title = card.innerText.trim().toLowerCase();
      card.style.display =
        title.startsWith(letter) ? "block" : "none";
    });

  });

}

/* ================= TYPE FILTER ================= */

const typeFilter = document.querySelector(".type-filter");

if (typeFilter) {

  typeFilter.addEventListener("click", function (e) {

    if (e.target.tagName !== "BUTTON") return;

    const filter = e.target.innerText.toLowerCase();

    typeFilter.querySelectorAll("button")
      .forEach(btn => btn.classList.remove("active"));

    e.target.classList.add("active");

    const grid = getActiveGrid();
    if (!grid) return;

    const cards = grid.querySelectorAll(".movie-card");

    cards.forEach(card => {

      const type = (card.dataset.type || "").toLowerCase();

      if (filter === "all") {
        card.style.display = "block";
      }
      else if (filter === "movies" && type === "movie") {
        card.style.display = "block";
      }
      else if (filter === "series" && type === "series") {
        card.style.display = "block";
      }
      else {
        card.style.display = "none";
      }

    });

  });

}

/* ================= DETAILS PAGE ================= */

async function loadDetailsPage() {

  if (!location.pathname.includes("details")) return;

  const params = new URLSearchParams(location.search);
  const slug = params.get("anime");
  if (!slug) return;

  const res = await apiGet("/api/anime");
  if (!res.success || !res.data) return;

  const anime = res.data.find(a => a.slug === slug);
  if (!anime) return;

  document.title = anime.title + " – AnimeHunt";

  const animeTitle = document.getElementById("animeTitle");
  if (animeTitle) animeTitle.innerText = anime.title;

  const posterImg = document.getElementById("posterImg");
  if (posterImg) posterImg.src = anime.thumbnail;

  const animeDesc = document.getElementById("animeDesc");
  if (animeDesc) animeDesc.innerText = anime.shortDescription || "";

  const episodeGrid = document.getElementById("episodeGrid");

  if (episodeGrid && anime.episodes) {

    episodeGrid.innerHTML = "";

    anime.episodes.forEach(ep => {

      const card = document.createElement("div");
      card.className = "ep-card";

      card.innerHTML = `
        <div class="ep-thumb">
          <img src="${ep.thumbnail || anime.thumbnail}">
          <div class="ep-no">EP ${ep.number}</div>
        </div>
        <p>${ep.title || "Episode " + ep.number}</p>
      `;

      card.onclick = () => {
        window.location.href =
          "watch.html?anime=" + anime.slug + "&ep=" + ep.number;
      };

      episodeGrid.appendChild(card);

    });

  }

  const relatedGrid = document.getElementById("relatedGrid");

  if (relatedGrid) {

    relatedGrid.innerHTML = "";

    const related = res.data
      .filter(a =>
        a.genre === anime.genre && a.slug !== anime.slug
      )
      .slice(0, 8);

    related.forEach(a => {

      const card = document.createElement("div");
      card.className = "movie-card";
      card.dataset.slug = a.slug;

      card.innerHTML = `
        <img src="${a.thumbnail}">
        <span>${a.title}</span>
      `;

      relatedGrid.appendChild(card);

    });

  }

}

loadDetailsPage();

});

