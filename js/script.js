import { getPage } from "./core/router.js";

import { initHome } from "./features/homepage.js";
import { initAnimePage } from "./features/animePage.js";
import { initCategoryPage } from "./features/categoryPage.js";
import { initSearch } from "./features/search.js";
import { initDetailsPage } from "./features/detailsPage.js";
import { initWatchPage } from "./features/watchPage.js";
import { initHistoryPage } from "./features/historyPage.js";
import { initContinueWatching } from "./features/continueWatching.js";

// ✅ NEW UI
import { initSidebar } from "./features/sidebar.js";
import { initFooter } from "./features/footer.js";

// ✅ 🔥 DOWNLOAD (ADD THIS)
import { initDownloadPage } from "./features/downloadPage.js";

import { loadSEO, applyDynamicSEO } from "./core/seo.js";

document.addEventListener("DOMContentLoaded", async () => {
  const page = getPage();

  // ===== GLOBAL INIT =====
  initSearch();
  initContinueWatching();

  // ===== UI =====
  initSidebar();
  initFooter();

  // ===== PAGE ROUTING =====
  if (page === "home") initHome();

  if (page === "anime") initAnimePage("anime");
  if (page === "movies") initAnimePage("movie");
  if (page === "series") initAnimePage("series");
  if (page === "cartoon") initAnimePage("cartoon");

  if (page === "details") initDetailsPage();
  if (page === "watch") initWatchPage();
  if (page === "history") initHistoryPage();

  // ✅ 🔥 DOWNLOAD PAGE ROUTE
  if (page === "download") initDownloadPage();

  // ===== CATEGORY (dynamic) =====
  const grid = document.querySelector(".anime-grid");
  if (grid?.dataset.category) {
    initCategoryPage(grid.dataset.category);
  }

  // ===== SEO =====
  try {
    const seo = await loadSEO();
    applyDynamicSEO(page, {}, seo);
  } catch (e) {
    console.warn("SEO load failed");
  }
});

import { loadPerformanceConfig }
from "./core/performance.js";

loadPerformanceConfig();
import { initDetailsPage }
from "./features/detailsPage.js";

import { initWatchPage }
from "./features/watchPage.js";

/* ======================================================
   APP INIT
====================================================== */

const page =
  document.body.dataset.page;

/* DETAILS */

if (page === "details") {

  initDetailsPage();
}

/* WATCH */

if (page === "watch") {

  initWatchPage();
}
import {
  initWatchPage
} from "./features/watchPage.js";

import {
  initDetailsPage
} from "./features/detailsPage.js";

import {
  initContinueWatching
} from "./features/continueWatching.js";

/* ======================================================
   PAGE DETECT
====================================================== */

const page =
  document.body.dataset.page || "";

/* ======================================================
   INIT
====================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    /* WATCH */

    if (page === "watch") {

      await initWatchPage();
    }

    /* DETAILS */

    if (page === "details") {

      await initDetailsPage();
    }

    /* CONTINUE WATCHING */

    initContinueWatching();

    /* SIDEBAR */

    initSidebar();
  }
);

/* ======================================================
   SIDEBAR
====================================================== */

function initSidebar() {

  const sidebar =
    document.querySelector(".sidebar");

  const overlay =
    document.querySelector(".overlay");

  const menuBtn =
    document.querySelector(".menu-btn");

  const closeBtn =
    document.querySelector(".close-btn");

  if (
    !sidebar ||
    !overlay ||
    !menuBtn
  ) return;

  menuBtn.onclick = open;

  if (closeBtn) {

    closeBtn.onclick = close;
  }

  overlay.onclick = close;

  function open() {

    sidebar.classList.add("active");

    overlay.classList.add("active");
  }

  function close() {

    sidebar.classList.remove("active");

    overlay.classList.remove("active");
  }
}
