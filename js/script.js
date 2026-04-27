import { getPage } from "./core/router.js";
import { initHome } from "./features/homepage.js";
import { initAnimePage } from "./features/animePage.js";
import { initCategoryPage } from "./features/categoryPage.js";
import { initSearch } from "./features/search.js";
import { initDetailsPage } from "./features/detailsPage.js";
import { initWatchPage } from "./features/watchPage.js";

const page = getPage();

document.addEventListener("DOMContentLoaded", () => {
  initSearch();

  if (page === "home") initHome();

  if (page === "anime") initAnimePage("anime");
  if (page === "movies") initAnimePage("movie");
  if (page === "series") initAnimePage("series");
  if (page === "cartoon") initAnimePage("cartoon");

  if (page === "details") initDetailsPage();
  if (page === "watch") initWatchPage();

  const grid = document.querySelector(".anime-grid");
  if (grid?.dataset.category) {
    initCategoryPage(grid.dataset.category);
  }
});

import { initHistoryPage } from "./js/features/historyPage.js";

const page = document.body.dataset.page;

if (page === "history") {
  initHistoryPage?.();
}

import { initContinueWatching } from "./features/continueWatching.js";

document.addEventListener("DOMContentLoaded", () => {
  initContinueWatching();
});
import { initCategoryPage } from "./features/categoryPage.js"

if (window.PAGE_TYPE === "category") {
  initCategoryPage()
}
