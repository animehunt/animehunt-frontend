import { getPage } from "./core/router.js";

import { initHome } from "./features/homepage.js";
import { initAnimePage } from "./features/animePage.js";
import { initCategoryPage } from "./features/categoryPage.js";
import { initSearch } from "./features/search.js";
import { initDetailsPage } from "./features/detailsPage.js";
import { initWatchPage } from "./features/watchPage.js";
import { initHistoryPage } from "./features/historyPage.js";
import { initContinueWatching } from "./features/continueWatching.js";

// ✅ NEW
import { initSidebar } from "./features/sidebar.js";
import { initFooter } from "./features/footer.js";

import { loadSEO, applyDynamicSEO } from "./core/seo.js";

document.addEventListener("DOMContentLoaded", async () => {
  const page = getPage();

  // ===== GLOBAL INIT =====
  initSearch();
  initContinueWatching();

  // ✅ VERY IMPORTANT (top pe hi run karo)
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
