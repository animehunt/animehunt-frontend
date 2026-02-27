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
  closeBtn?.addEventListener("click", closeSidebar);
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

      document.title = anime.title + " – AnimeHunt";

      const heroBg = document.getElementById("heroBg");
      if (heroBg && anime.banner) {
        heroBg.style.background =
          `linear-gradient(to bottom,rgba(0,0,0,.4),#0b0f1a),
           url("${anime.banner}") center/cover no-repeat`;
      }

      document.getElementById("posterImg")?.setAttribute("src", anime.thumbnail);
      document.getElementById("animeTitle")?.innerText = anime.title;

      document.getElementById("animeMeta")?.innerHTML = `
        <span>${anime.year || "-"}</span>
        <span class="imdb">⭐ ${anime.rating || "-"}</span>
        <span>${anime.type || "Anime"}</span>
      `;

      document.getElementById("animeDesc")?.innerText =
        anime.shortDescription || "";

      document.getElementById("aboutList")?.innerHTML = `
        <li><b>Genre:</b> ${anime.genre || "-"}</li>
        <li><b>Status:</b> ${anime.status || "-"}</li>
        <li><b>Total Episodes:</b> ${
          anime.type === "movie"
            ? 1
            : anime.episodes?.length || "-"
        }</li>
      `;

      document.getElementById("aboutDesc")?.innerText =
        anime.description || "";

      document.querySelector(".subscribe")
        ?.addEventListener("click", () => {
          window.open(TELEGRAM_LINK, "_blank");
        });

      document.querySelector(".watch")
        ?.addEventListener("click", () => {
          if (anime.type === "movie") {
            window.location.href = `watch.html?anime=${anime.slug}`;
          } else {
            window.location.href =
              `watch.html?anime=${anime.slug}&ep=1`;
          }
        });

      document.querySelector(".download")
        ?.addEventListener("click", () => {
          window.location.href =
            `download.html?anime=${anime.slug}`;
        });

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

      const player = document.getElementById("videoPlayer");
      const serverContainer =
        document.getElementById("serverButtons");

      function loadServers(ep) {

        if (!ep?.servers?.length) return;

        serverContainer.innerHTML = "";

        ep.servers.forEach((server, index) => {

          const btn = document.createElement("button");
          btn.innerText = server.name;
          if (index === 0) btn.classList.add("active");

          btn.onclick = () => {
            serverContainer
              .querySelectorAll("button")
              .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");
            player.src = server.url;
          };

          serverContainer.appendChild(btn);

        });

        player.src = ep.servers[0].url;
      }

      if (anime.type === "movie") {
        if (anime.episodes?.length) {
          loadServers(anime.episodes[0]);
        }
        return;
      }

      const currentEpisode =
        anime.episodes?.find(ep => ep.number === currentEpNumber);

      loadServers(currentEpisode);

      document.querySelector(".subscribe")
        ?.addEventListener("click", () => {
          window.open(TELEGRAM_LINK, "_blank");
        });

    } catch (err) {
      console.error("Watch page error:", err);
    }

  }

  loadWatch();

})();


/* =====================================================
   LIVE DROPDOWN SEARCH ENGINE (FIXED & CLOSED)
===================================================== */

(function () {

  const API_BASE =
    "https://animehunt-backend-rhg6.onrender.com";

  const searchInput =
    document.querySelector(".search-bar");

  if (!searchInput) return;

  const dropdown = document.createElement("div");
  dropdown.className = "search-dropdown";
  dropdown.style.display = "none";
  document.body.appendChild(dropdown);

  let allData = [];

  async function loadData() {
    try {
      const res =
        await fetch(API_BASE + "/api/anime");
      const json = await res.json();
      if (json.success && json.data) {
        allData = json.data;
      }
    } catch (err) {
      console.error("Search load error:", err);
    }
  }

  loadData();

  searchInput.addEventListener("input", function () {

    const query =
      this.value.trim().toLowerCase();

    dropdown.innerHTML = "";

    if (!query) {
      dropdown.style.display = "none";
      return;
    }

    const results = allData
      .filter(a =>
        a.title.toLowerCase().includes(query))
      .slice(0, 8);

    if (!results.length) {
      dropdown.style.display = "none";
      return;
    }

    results.forEach(anime => {

      const item =
        document.createElement("div");

      item.className = "search-item";

      item.innerHTML = `
        <img src="${anime.thumbnail}" alt="">
        <span>${anime.title}</span>
      `;

      item.onclick = () => {
        window.location.href =
          `details.html?anime=${anime.slug}`;
      };

      dropdown.appendChild(item);

    });

    dropdown.style.display = "block";

  });

  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target)
        && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

})();
