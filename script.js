console.log("SCRIPT LOADED SUCCESSFULLY");
alert("JS FILE RUNNING");
/* =====================================================
   UNIVERSAL SIDEBAR ENGINE (SAFE + STABLE)
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const menuBtn = document.querySelector(".menu-btn");
  const sidebar = document.querySelector(".sidebar");
  const closeBtn = document.querySelector(".close-btn");
  const overlay = document.querySelector(".overlay");

  if (!menuBtn || !sidebar || !overlay) {
    console.warn("Sidebar elements missing on this page");
    return;
  }

  function openSidebar() {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  menuBtn.addEventListener("click", openSidebar);

  if (closeBtn) {
    closeBtn.addEventListener("click", closeSidebar);
  }

  overlay.addEventListener("click", closeSidebar);

});

/* =====================================================
   DETAILS PAGE COMPLETE ENGINE (STABLE)
===================================================== */

(function () {

  if (!location.pathname.includes("details")) return;

  const API_BASE = "https://animehunt-backend-rhg6.onrender.com";
  const TELEGRAM_LINK = "https://t.me/toons15";

  const slug = new URLSearchParams(location.search).get("anime");
  if (!slug) return;

  async function loadDetails() {

    try {

      const res = await fetch(API_BASE + "/api/anime");
      const json = await res.json();
      if (!json.success || !json.data) return;

      const anime = json.data.find(a => a.slug === slug);
      if (!anime) return;

      /* ================= HERO ================= */

      document.title = anime.title + " – AnimeHunt";

      const heroBg = document.getElementById("heroBg");
      if (heroBg && anime.banner) {
        heroBg.style.background =
          `linear-gradient(to bottom,rgba(0,0,0,.4),#0b0f1a),
           url("${anime.banner}") center/cover no-repeat`;
      }

      document.getElementById("posterImg")?.setAttribute("src", anime.thumbnail);
      document.getElementById("animeTitle").innerText = anime.title;

      document.getElementById("animeMeta").innerHTML = `
        <span>${anime.year || "-"}</span>
        <span class="imdb">⭐ ${anime.rating || "-"}</span>
        <span>${anime.type || "Anime"}</span>
      `;

      document.getElementById("animeDesc").innerText =
        anime.shortDescription || "";

      /* ================= ABOUT ================= */

      document.getElementById("aboutList").innerHTML = `
        <li><b>Genre:</b> ${anime.genre || "-"}</li>
        <li><b>Status:</b> ${anime.status || "-"}</li>
        <li><b>Total Episodes:</b> ${
          anime.type === "movie"
            ? 1
            : anime.episodes?.length || "-"
        }</li>
      `;

      document.getElementById("aboutDesc").innerText =
        anime.description || "";

      /* ================= BUTTONS ================= */

      // Subscribe
      document.querySelector(".subscribe")?.addEventListener("click", () => {
        window.open(TELEGRAM_LINK, "_blank");
      });

      // Watch
      document.querySelector(".watch")?.addEventListener("click", () => {
        if (anime.type === "movie") {
          window.location.href = `watch.html?anime=${anime.slug}`;
        } else {
          window.location.href = `watch.html?anime=${anime.slug}&ep=1`;
        }
      });

      // Download
      document.querySelector(".download")?.addEventListener("click", () => {
        window.location.href = `download.html?anime=${anime.slug}`;
      });

      /* ================= MOVIE CASE ================= */

      if (anime.type === "movie") {
        document.querySelector(".ep-tabs")?.remove();
        document.getElementById("seasonList")?.remove();
      }

      /* ================= EPISODES ================= */

      if (anime.type !== "movie" && anime.episodes?.length) {

        const episodeGrid = document.getElementById("episodeGrid");
        const seasonBtn = document.getElementById("seasonBtn");
        const allBtn = document.getElementById("allBtn");
        const seasonList = document.getElementById("seasonList");

        const seasons = {};

        anime.episodes.forEach(ep => {
          const seasonNo = ep.season || 1;
          if (!seasons[seasonNo]) seasons[seasonNo] = [];
          seasons[seasonNo].push(ep);
        });

        function renderEpisodes(list) {
          episodeGrid.innerHTML = "";

          list.forEach(ep => {

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

        // Default render first season
        const firstSeason = Object.keys(seasons)[0];
        renderEpisodes(seasons[firstSeason]);

        // Season dropdown toggle
        seasonBtn?.addEventListener("click", () => {
          seasonList.style.display =
            seasonList.style.display === "block"
              ? "none"
              : "block";
        });

        // Build dropdown
        seasonList.innerHTML = "";
        Object.keys(seasons).forEach(seasonNo => {

          const div = document.createElement("div");
          div.innerText = "Season " + seasonNo;

          div.onclick = () => {
            seasonBtn.innerText = "SEASON " + seasonNo;
            seasonList.style.display = "none";
            renderEpisodes(seasons[seasonNo]);
          };

          seasonList.appendChild(div);
        });

        // All episodes
        allBtn?.addEventListener("click", () => {
          renderEpisodes(anime.episodes);
        });

      }

      /* ================= RELATED ================= */

      const relatedGrid = document.getElementById("relatedGrid");
      if (relatedGrid) {

        relatedGrid.innerHTML = "";

        const related = json.data
          .filter(a =>
            a.genre === anime.genre &&
            a.slug !== anime.slug
          )
          .slice(0, 8);

        related.forEach(a => {

          const card = document.createElement("div");
          card.className = "rel-card";
          card.innerText = a.title;

          card.onclick = () => {
            window.location.href =
              `details.html?anime=${a.slug}`;
          };

          relatedGrid.appendChild(card);

        });

      }

    } catch (err) {
      console.error("Details error:", err);
    }

  }

  loadDetails();

})();
/* =====================================================
   WATCH PAGE COMPLETE ENGINE
===================================================== */

(function () {

  if (!location.pathname.includes("watch")) return;

  const API_BASE = "https://animehunt-backend-rhg6.onrender.com";
  const TELEGRAM_LINK = "https://t.me/toons15";

  const params = new URLSearchParams(location.search);
  const slug = params.get("anime");
  let currentEpNumber = Number(params.get("ep")) || 1;

  if (!slug) return;

  async function loadWatch() {

    try {

      const res = await fetch(API_BASE + "/api/anime");
      const json = await res.json();
      if (!json.success || !json.data) return;

      const anime = json.data.find(a => a.slug === slug);
      if (!anime) return;

      document.title = anime.title + " – Watch – AnimeHunt";

      /* ================= PLAYER ================= */

      const player = document.getElementById("videoPlayer");
      const serverContainer = document.getElementById("serverButtons");
      const episodeGrid = document.getElementById("episodeGrid");
      const seasonBtn = document.getElementById("seasonBtn");
      const allBtn = document.getElementById("allBtn");
      const seasonList = document.getElementById("seasonList");

      function getCurrentEpisode() {
        return anime.episodes?.find(ep => ep.number === currentEpNumber);
      }

      function loadServers(ep) {

        if (!ep || !ep.servers || !ep.servers.length) return;

        serverContainer.innerHTML = "";

        ep.servers.forEach((server, index) => {

          const btn = document.createElement("button");
          btn.innerText = server.name;
          if (index === 0) btn.classList.add("active");

          btn.onclick = () => {

            serverContainer.querySelectorAll("button")
              .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            player.src = server.url;
          };

          serverContainer.appendChild(btn);

        });

        // default load first server
        player.src = ep.servers[0].url;
      }

      function renderEpisodes(list) {

        episodeGrid.innerHTML = "";

        list.forEach(ep => {

          const card = document.createElement("div");
          card.className = "ep-card";

          if (ep.number === currentEpNumber) {
            card.classList.add("active");
          }

          card.innerHTML = `
            <div class="ep-thumb">
              <img src="${ep.thumbnail || anime.thumbnail}">
              <div class="ep-no">EP ${ep.number}</div>
            </div>
            <p>${ep.title || "Episode " + ep.number}</p>
          `;

          card.onclick = () => {
            currentEpNumber = ep.number;
            loadServers(ep);
            renderEpisodes(list);
          };

          episodeGrid.appendChild(card);

        });
      }

      /* ================= MOVIE CASE ================= */

      if (anime.type === "movie") {

        document.querySelector(".ep-tabs")?.remove();
        document.getElementById("seasonList")?.remove();

        if (anime.episodes?.length) {
          loadServers(anime.episodes[0]);
        }

        return;
      }

      /* ================= SERIES CASE ================= */

      if (!anime.episodes?.length) return;

      const seasons = {};

      anime.episodes.forEach(ep => {
        const seasonNo = ep.season || 1;
        if (!seasons[seasonNo]) seasons[seasonNo] = [];
        seasons[seasonNo].push(ep);
      });

      const currentEpisode = getCurrentEpisode();
      loadServers(currentEpisode);

      const firstSeason = Object.keys(seasons)[0];
      renderEpisodes(seasons[firstSeason]);

      /* Season dropdown */

      seasonBtn?.addEventListener("click", () => {
        seasonList.style.display =
          seasonList.style.display === "block"
            ? "none"
            : "block";
      });

      seasonList.innerHTML = "";

      Object.keys(seasons).forEach(seasonNo => {

        const div = document.createElement("div");
        div.innerText = "Season " + seasonNo;

        div.onclick = () => {
          seasonBtn.innerText = "SEASON " + seasonNo;
          seasonList.style.display = "none";
          renderEpisodes(seasons[seasonNo]);
        };

        seasonList.appendChild(div);

      });

      /* All episodes */

      allBtn?.addEventListener("click", () => {
        renderEpisodes(anime.episodes);
      });

      /* Subscribe */

      document.querySelector(".subscribe")?.addEventListener("click", () => {
        window.open(TELEGRAM_LINK, "_blank");
      });

    } catch (err) {
      console.error("Watch page error:", err);
    }

  }

  loadWatch();

})();
/* =====================================================
   ANIME & CARTOON FILTER + PAGINATION ENGINE
===================================================== */

(function () {

  const API_BASE = "https://animehunt-backend-rhg6.onrender.com";

  const grid =
    document.querySelector(".anime-grid") ||
    document.querySelector(".cartoon-grid");

  const filterBar = document.querySelector(".type-filter");
  const pagination = document.querySelector(".pagination");

  if (!grid || !pagination) return;

  const perPage = 20;
  let currentPage = 1;
  let allData = [];
  let filteredData = [];

  async function loadData() {

    try {

      const res = await fetch(API_BASE + "/api/anime");
      const json = await res.json();
      if (!json.success || !json.data) return;

      allData = json.data;

      // Page type filter (anime/cartoon)
      if (grid.dataset.typePage) {
        allData = allData.filter(a =>
          a.type &&
          a.type.toLowerCase() === grid.dataset.typePage.toLowerCase()
        );
      }

      filteredData = [...allData];

      renderPage(1);

    } catch (err) {
      console.error("Filter engine error:", err);
    }

  }

  function renderPage(page) {

    currentPage = page;

    const totalPages = Math.ceil(filteredData.length / perPage);
    if (page < 1 || page > totalPages) return;

    grid.innerHTML = "";

    const start = (page - 1) * perPage;
    const end = start + perPage;

    filteredData.slice(start, end).forEach(anime => {

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

    renderPagination(totalPages);

  }

  function renderPagination(totalPages) {

    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    const prev = document.createElement("button");
    prev.textContent = "Prev";
    prev.disabled = currentPage === 1;
    prev.onclick = () => renderPage(currentPage - 1);
    pagination.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.onclick = () => renderPage(i);
      pagination.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "Next";
    next.disabled = currentPage === totalPages;
    next.onclick = () => renderPage(currentPage + 1);
    pagination.appendChild(next);

  }


  /* ================= FILTER ================= */

  if (filterBar) {

    filterBar.addEventListener("click", function (e) {

      if (e.target.tagName !== "BUTTON") return;

      const filter = e.target.innerText.toLowerCase();

      filterBar.querySelectorAll("button")
        .forEach(btn => btn.classList.remove("active"));

      e.target.classList.add("active");

      if (filter === "all") {
        filteredData = [...allData];
      }
      else if (filter === "movies") {
        filteredData = allData.filter(a =>
          a.type && a.type.toLowerCase() === "movie"
        );
      }
      else if (filter === "series") {
        filteredData = allData.filter(a =>
          a.type && a.type.toLowerCase() === "series"
        );
      }

      renderPage(1);

    });

  }

  loadData();

})();
/* =====================================================
   UNIVERSAL A–Z ENGINE (ALL LISTING PAGES)
===================================================== */

(function () {

  const grid =
    document.querySelector(".anime-grid") ||
    document.querySelector(".movies-grid") ||
    document.querySelector(".series-grid") ||
    document.querySelector(".cartoon-grid");

  const azNav = document.querySelector(".az-nav");
  const pagination = document.querySelector(".pagination");

  if (!grid || !azNav) return;

  const perPage = 20;
  let currentPage = 1;

  function getAllCards() {
    return Array.from(grid.querySelectorAll(".movie-card"));
  }

  function filterByLetter(letter) {

    const allCards = getAllCards();

    if (letter === "#") {
      return allCards.filter(card => {
        const title = card.innerText.trim();
        return !/^[a-zA-Z]/.test(title);
      });
    }

    return allCards.filter(card => {
      const title = card.innerText.trim().toLowerCase();
      return title.startsWith(letter.toLowerCase());
    });

  }

  function renderPage(cards, page) {

    currentPage = page;

    const totalPages = Math.ceil(cards.length / perPage);

    getAllCards().forEach(card => {
      card.style.display = "none";
    });

    const start = (page - 1) * perPage;
    const end = start + perPage;

    cards.slice(start, end).forEach(card => {
      card.style.display = "block";
    });

    renderPagination(cards, totalPages);

  }

  function renderPagination(cards, totalPages) {

    if (!pagination) return;

    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    const prev = document.createElement("button");
    prev.textContent = "Prev";
    prev.disabled = currentPage === 1;
    prev.onclick = () => renderPage(cards, currentPage - 1);
    pagination.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.onclick = () => renderPage(cards, i);
      pagination.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "Next";
    next.disabled = currentPage === totalPages;
    next.onclick = () => renderPage(cards, currentPage + 1);
    pagination.appendChild(next);

  }

  azNav.addEventListener("click", function (e) {

    if (e.target.tagName !== "SPAN") return;

    const letter = e.target.innerText.trim();

    azNav.querySelectorAll("span")
      .forEach(l => l.classList.remove("active"));

    e.target.classList.add("active");

    const filtered = filterByLetter(letter);

    renderPage(filtered, 1);

  });

})();
/* =====================================================
   LIVE DROPDOWN SEARCH ENGINE (ADMIN DATA)
===================================================== */

(function () {

  const API_BASE = "https://animehunt-backend-rhg6.onrender.com";

  const searchInput = document.querySelector(".search-bar");
  if (!searchInput) return;

  // Create dropdown container
  const dropdown = document.createElement("div");
  dropdown.className = "search-dropdown";
  dropdown.style.display = "none";
  document.body.appendChild(dropdown);

  let allData = [];

  async function loadData() {
    try {
      const res = await fetch(API_BASE + "/api/anime");
      const json = await res.json();
      if (json.success && json.data) {
        allData = json.data;
      }
    } catch (err) {
      console.error("Search load error:", err);
    }
  }

  loadData();

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
      .slice(0, 8);

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

  // Close wh
   // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

})();  // <-- THIS WAS MISSING
