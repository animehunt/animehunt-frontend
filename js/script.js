import { getPage } from "./core/router.js";

import { initHome } from "./features/homepage.js";
import { initAnimePage } from "./features/animePage.js";
import { initCategoryPage } from "./features/categoryPage.js";
import { initSearch } from "./features/search.js";

import { initDetailsPage } from "./features/detailsPage.js";
import { initWatchPage } from "./features/watchPage.js";

import { initHistoryPage } from "./features/historyPage.js";
import { initContinueWatching } from "./features/continueWatching.js";

import { initSidebar } from "./features/sidebar.js";
import { initFooter } from "./features/footer.js";

import { initDownloadPage } from "./features/downloadPage.js";

import {
  loadSEO,
  applyDynamicSEO
} from "./core/seo.js";

import {
  loadPerformanceConfig
} from "./core/performance.js";

/* ======================================================
   APP INIT
====================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const page = getPage();

    /* =========================================
       GLOBAL
    ========================================= */

    initSearch();

    initSidebar();

    initFooter();

    initContinueWatching();

    loadPerformanceConfig();

    /* =========================================
       HOME
    ========================================= */

    if (page === "home") {

      await initHome();
    }

    /* =========================================
       ANIME PAGES
    ========================================= */

    if (page === "anime") {

      await initAnimePage("anime");
    }

    if (page === "movies") {

      await initAnimePage("movie");
    }

    if (page === "series") {

      await initAnimePage("series");
    }

    if (page === "cartoon") {

      await initAnimePage("cartoon");
    }

    /* =========================================
       DETAILS
    ========================================= */

    if (page === "details") {

      await initDetailsPage();
    }

    /* =========================================
       WATCH
    ========================================= */

    if (page === "watch") {

      await initWatchPage();
    }

    /* =========================================
       HISTORY
    ========================================= */

    if (page === "history") {

      await initHistoryPage();
    }

    /* =========================================
       DOWNLOAD
    ========================================= */

    if (page === "download") {

      await initDownloadPage();
    }

    /* =========================================
       CATEGORY PAGE
    ========================================= */

    const grid =
      document.querySelector(".anime-grid");

    if (grid?.dataset.category) {

      await initCategoryPage(
        grid.dataset.category
      );
    }

    /* =========================================
       SEO
    ========================================= */

    try {

      const seo =
        await loadSEO();

      applyDynamicSEO(
        page,
        {},
        seo
      );

    } catch (err) {

      console.warn(
        "SEO load failed",
        err
      );
    }
  }
);
