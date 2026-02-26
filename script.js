/* =====================================================
   ANIMEHUNT – FINAL PRODUCTION SCRIPT
   Fully Stable – Admin Compatible
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ================= SIDEBAR ================= */

  const menuBtn = document.querySelector(".menu-btn");
  const sidebar = document.querySelector(".sidebar");
  const closeBtn = document.querySelector(".close-btn");
  const overlay = document.querySelector(".overlay");

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  }

  /* ================= HERO PLAY BUTTON ================= */

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

    const slug = card.dataset.slug ||
      card.innerText.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    window.location.href = "details.html?anime=" + slug;
  });

  /* =====================================================
     HOME CATEGORY FILTER
  ===================================================== */

  const categoryBar = document.querySelector(".category-bar");
  const homeGrid = document.querySelector(".home-grid");

  if (categoryBar && homeGrid) {

    categoryBar.addEventListener("click", function (e) {

      if (e.target.tagName !== "BUTTON") return;

      const filter = e.target.innerText.toLowerCase();

      categoryBar.querySelectorAll("button")
        .forEach(btn => btn.classList.remove("active"));

      e.target.classList.add("active");

      if (filter === "all") {
        document.body.classList.remove("grid-mode");
        homeGrid.innerHTML = "";
        return;
      }

      const allCards = document.querySelectorAll(".movie-row .movie-card");

      homeGrid.innerHTML = "";
      document.body.classList.add("grid-mode");
      homeGrid.classList.add("active");

      allCards.forEach(card => {
        const cats = (card.dataset.category || "").toLowerCase();
        if (cats.includes(filter)) {
          homeGrid.appendChild(card.cloneNode(true));
        }
      });

    });
  }

  /* =====================================================
     UNIVERSAL GRID DETECTOR
  ===================================================== */

  function getActiveGrid() {
    return (
      document.querySelector(".home-grid.active") ||
      document.querySelector(".anime-grid") ||
      document.querySelector(".movies-grid") ||
      document.querySelector(".series-grid") ||
      document.querySelector(".cartoon-grid")
    );
  }

  /* =====================================================
     UNIVERSAL PAGINATION
  ===================================================== */

  const pagination = document.querySelector(".pagination");

  if (pagination) {

    let currentPage = 1;
    const perPage = 20;

    function showPage(page) {

      const grid = getActiveGrid();
      if (!grid) return;

      const cards = Array.from(grid.querySelectorAll(".movie-card"));

      currentPage = page;

      const start = (page - 1) * perPage;
      const end = start + perPage;

      cards.forEach((card, index) => {
        card.style.display =
          index >= start && index < end ? "block" : "none";
      });

      pagination.querySelectorAll("button").forEach(btn => {
        btn.classList.remove("active");
        if (btn.innerText == page) {
          btn.classList.add("active");
        }
      });
    }

    pagination.addEventListener("click", function (e) {

      if (e.target.tagName !== "BUTTON") return;

      const text = e.target.innerText;

      const grid = getActiveGrid();
      if (!grid) return;

      const totalCards = grid.querySelectorAll(".movie-card").length;
      const maxPage = Math.ceil(totalCards / perPage);

      if (text === "Next" && currentPage < maxPage) {
        showPage(currentPage + 1);
      }
      else if (text === "Prev" && currentPage > 1) {
        showPage(currentPage - 1);
      }
      else if (!isNaN(text)) {
        showPage(Number(text));
      }

    });

    showPage(1);
  }

  /* =====================================================
     UNIVERSAL A–Z
  ===================================================== */

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

  /* =====================================================
     TYPE FILTER (Anime / Cartoon)
  ===================================================== */

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

});
/* ================= HOME A–Z FIX ================= */

const homeAZ = document.querySelector(".az-nav");
const homeGrid = document.querySelector(".home-grid");
const homeRows = document.querySelectorAll(".movie-row");

if (homeAZ && homeGrid && homeRows.length > 0) {

  homeAZ.addEventListener("click", function (e) {

    if (e.target.tagName !== "SPAN") return;

    const letter = e.target.innerText.toLowerCase();

    // active highlight
    homeAZ.querySelectorAll("span")
      .forEach(l => l.classList.remove("active"));

    e.target.classList.add("active");

    const allCards =
      document.querySelectorAll(".movie-row .movie-card");

    homeGrid.innerHTML = "";

    document.body.classList.add("grid-mode");
    homeGrid.classList.add("active");

    allCards.forEach(card => {

      const title = card.innerText.trim().toLowerCase();

      if (title.startsWith(letter)) {
        homeGrid.appendChild(card.cloneNode(true));
      }

    });

  });

}
/* =====================================================
   HOME PAGE – ADMIN DYNAMIC SYSTEM
===================================================== */

async function loadHomeDynamic() {

  const res = await apiGet("/api/anime");

  if (!res.success || !res.data) return;

  const animeList = res.data;

  document.querySelectorAll(".movie-scroll").forEach(row => {

    const rowType = row.dataset.row;
    row.innerHTML = "";

    const filtered = animeList.filter(anime =>
      anime.categories &&
      anime.categories.includes(rowType)
    );

    filtered.slice(0, 12).forEach(anime => {

      const card = document.createElement("div");
      card.className = "movie-card";
      card.dataset.slug = anime.slug;
      card.dataset.category = anime.categories.join(",");
      card.dataset.type = anime.type;

      card.innerHTML = `
        <img src="${anime.thumbnail}" alt="${anime.title}">
        <span>${anime.title}</span>
      `;

      row.appendChild(card);

    });

  });

}

if (document.querySelector(".movie-scroll")) {
  loadHomeDynamic();
}
/* =====================================================
   ONGOING PAGE – AUTO 30 DAYS FILTER
===================================================== */

async function loadOngoingPage() {

  const grid = document.querySelector(".anime-grid[data-page='ongoing']");
  if (!grid) return;

  const res = await apiGet("/api/anime");

  if (!res.success || !res.data) return;

  const animeList = res.data;

  const now = new Date();

  const ongoing = animeList.filter(anime => {

    if (!anime.updatedAt) return false;

    const updated = new Date(anime.updatedAt);
    const diffDays = (now - updated) / (1000 * 60 * 60 * 24);

    return diffDays <= 30;
  });

  grid.innerHTML = "";

  ongoing.forEach(anime => {

    const card = document.createElement("div");
    card.className = "movie-card";
    card.dataset.slug = anime.slug;
    card.dataset.type = anime.type;

    card.innerHTML = `
      <img src="${anime.thumbnail}" alt="${anime.title}">
      <span>${anime.title}</span>
    `;

    grid.appendChild(card);

  });

}

loadOngoingPage();
/* =====================================================
   BINGE-WORTHY SERIES PAGE – ADMIN DYNAMIC
===================================================== */

async function loadBingeSeriesPage() {

  const grid = document.querySelector(".anime-grid[data-page='binge-series']");
  if (!grid) return;

  const res = await apiGet("/api/anime");
  if (!res.success || !res.data) return;

  const animeList = res.data;

  // Filter only series category
  const filtered = animeList.filter(anime =>
    anime.categories &&
    anime.categories.includes("series")
  );

  grid.innerHTML = "";

  filtered.forEach(anime => {

    const card = document.createElement("div");
    card.className = "movie-card";
    card.dataset.slug = anime.slug;
    card.dataset.type = anime.type;

    card.innerHTML = `
      <img src="${anime.thumbnail}" alt="${anime.title}">
      <span>${anime.title}</span>
    `;

    grid.appendChild(card);

  });

}

loadBingeSeriesPage();
/* =====================================================
   UNIVERSAL CATEGORY PAGE LOADER
===================================================== */

async function loadCategoryPage() {

  const grid = document.querySelector(".anime-grid[data-category]");
  if (!grid) return;

  const category = grid.dataset.category;

  const res = await apiGet("/api/anime");
  if (!res.success || !res.data) return;

  const animeList = res.data;

  let filtered = animeList.filter(anime =>
    anime.categories &&
    anime.categories.includes(category)
  );

  // Special rule for Ongoing (last 30 days)
  if (category === "ongoing") {
    const now = new Date();
    filtered = animeList.filter(anime => {
      if (!anime.updatedAt) return false;
      const updated = new Date(anime.updatedAt);
      const diffDays = (now - updated) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    });
  }

  renderGridWithPagination(grid, filtered);

}

loadCategoryPage();
/* =====================================================
   AUTO PAGINATION SYSTEM
===================================================== */

function renderGridWithPagination(grid, data) {

  const pagination = document.querySelector(".pagination");
  const perPage = 20;
  let currentPage = 1;

  function showPage(page) {

    currentPage = page;
    grid.innerHTML = "";

    const start = (page - 1) * perPage;
    const end = start + perPage;

    const pageItems = data.slice(start, end);

    pageItems.forEach(anime => {

      const card = document.createElement("div");
      card.className = "movie-card";
      card.dataset.slug = anime.slug;
      card.dataset.type = anime.type;

      card.innerHTML = `
        <img src="${anime.thumbnail}" alt="${anime.title}">
        <span>${anime.title}</span>
      `;

      grid.appendChild(card);

    });

    updatePaginationButtons();

  }

  function updatePaginationButtons() {

    if (!pagination) return;

    const totalPages = Math.ceil(data.length / perPage);

    pagination.innerHTML = `
      <button data-nav="prev">Prev</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      pagination.innerHTML += `
        <button class="${i===currentPage?'active':''}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    pagination.innerHTML += `
      <button data-nav="next">Next</button>
    `;

  }

  if (pagination) {

    pagination.addEventListener("click", function (e) {

      if (e.target.dataset.page) {
        showPage(Number(e.target.dataset.page));
      }

      if (e.target.dataset.nav === "prev" && currentPage > 1) {
        showPage(currentPage - 1);
      }

      if (e.target.dataset.nav === "next" &&
          currentPage < Math.ceil(data.length / perPage)) {
        showPage(currentPage + 1);
      }

    });

  }

  showPage(1);

}
/* =====================================================
   UNIVERSAL TYPE PAGE LOADER
   (Movies / Anime / Series / Cartoon)
===================================================== */

async function loadTypePage() {

  const grid = document.querySelector(".anime-grid[data-type-page]");
  if (!grid) return;

  const pageType = grid.dataset.typePage;

  const res = await apiGet("/api/anime");
  if (!res.success || !res.data) return;

  let data = res.data;

  // Filter by type
  data = data.filter(anime => anime.type === pageType);

  renderGridWithPagination(grid, data);

}

loadTypePage();
/* =====================================================
   LIVE DATABASE SEARCH (ADMIN DRIVEN)
===================================================== */

const searchInput = document.querySelector(".search-bar");

if (searchInput) {

  const dropdown = document.createElement("div");
  dropdown.className = "search-dropdown";
  dropdown.style.display = "none";
  document.body.appendChild(dropdown);

  searchInput.addEventListener("input", async function () {

    const query = this.value.trim().toLowerCase();
    dropdown.innerHTML = "";

    if (!query) {
      dropdown.style.display = "none";
      return;
    }

    const res = await apiGet("/api/anime");
    if (!res.success || !res.data) return;

    const results = res.data.filter(anime =>
      anime.title.toLowerCase().includes(query)
    ).slice(0, 8);

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

    dropdown.style.display = results.length ? "block" : "none";

  });

  document.addEventListener("click", function (e) {
    if (!dropdown.contains(e.target) && e.target !== searchInput) {
      dropdown.style.display = "none";
    }
  });

}
/* =====================================================
   DYNAMIC SEO FOR DETAILS PAGE
===================================================== */

async function loadDynamicSEO() {

  if (!location.pathname.includes("details")) return;

  const params = new URLSearchParams(location.search);
  const slug = params.get("anime");
  if (!slug) return;

  const res = await apiGet("/api/anime");
  if (!res.success || !res.data) return;

  const anime = res.data.find(a => a.slug === slug);
  if (!anime) return;

  document.title = anime.title + " – AnimeHunt";

  let metaDesc = document.querySelector("meta[name='description']");
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }

  metaDesc.content = anime.description || 
    `Watch ${anime.title} in Hindi on AnimeHunt.`;

}

loadDynamicSEO();
/* =====================================================
   DETAILS PAGE – FULLY DYNAMIC
===================================================== */

async function loadDetailsPage() {

  if (!location.pathname.includes("details")) return;

  try {

    const params = new URLSearchParams(location.search);
    const slug = params.get("anime");

    if (!slug) {
      console.warn("Slug not found in URL");
      return;
    }

    const res = await apiGet("/api/anime");

    if (!res || !res.success || !res.data) {
      console.error("API failed", res);
      return;
    }

    const anime = res.data.find(a => a.slug === slug);

    if (!anime) {
      console.warn("Anime not found for slug:", slug);
      return;
    }

    /* ================= HIDE EPISODES FOR MOVIES ================= */
    if (anime.type === "movie") {
      document.querySelector(".episodes")?.remove();
    }

    /* ================= HERO ================= */

    const heroBg = document.getElementById("heroBg");
    if (heroBg && anime.banner) {
      heroBg.style.background =
        `linear-gradient(to bottom,rgba(0,0,0,.3),#0b0f1a),
         url("${anime.banner}") center/cover no-repeat`;
    }

    const posterImg = document.getElementById("posterImg");
    if (posterImg && anime.thumbnail) {
      posterImg.src = anime.thumbnail;
    }

    const animeTitle = document.getElementById("animeTitle");
    if (animeTitle) animeTitle.innerText = anime.title || "";

    const animeMeta = document.getElementById("animeMeta");
    if (animeMeta) {
      animeMeta.innerHTML = `
        <span>${anime.year || "-"}</span>
        <span class="imdb">⭐ ${anime.rating || "-"}</span>
        <span>${anime.type || "Anime"}</span>
      `;
    }

    const animeDesc = document.getElementById("animeDesc");
    if (animeDesc) animeDesc.innerText = anime.shortDescription || "";

    /* ================= ABOUT ================= */

    const aboutList = document.getElementById("aboutList");
    if (aboutList) {
      aboutList.innerHTML = `
        <li><b>Genre:</b> ${anime.genre || "-"}</li>
        <li><b>Status:</b> ${anime.status || "-"}</li>
        <li><b>Total Episodes:</b> ${anime.totalEpisodes || "-"}</li>
      `;
    }

    const aboutDesc = document.getElementById("aboutDesc");
    if (aboutDesc) aboutDesc.innerText = anime.description || "";

    /* ================= EPISODES ================= */

    const episodeGrid = document.getElementById("episodeGrid");

    if (episodeGrid) {

      episodeGrid.innerHTML = "";

      if (anime.episodes && anime.episodes.length) {

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
              `watch.html?anime=${anime.slug}&ep=${ep.number}`;
          };

          episodeGrid.appendChild(card);

        });

      }

    }

    /* ================= RELATED ================= */

    const relatedGrid = document.getElementById("relatedGrid");

    if (relatedGrid) {

      relatedGrid.innerHTML = "";

      const related = res.data
        .filter(a => a.genre =
