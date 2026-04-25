import { getPage } from "./core/router.js";
import { initHome } from "./features/homepage.js";
import { initAnimePage } from "./features/animePage.js";
import { initCategoryPage } from "./features/categoryPage.js";
import { initSearch } from "./features/search.js";

const page = getPage();

document.addEventListener("DOMContentLoaded", () => {
  initSearch(); // 🔍 always

  if (page === "home") initHome();

  if (page === "anime") initAnimePage("anime");
  if (page === "movies") initAnimePage("movie");
  if (page === "series") initAnimePage("series");
  if (page === "cartoon") initAnimePage("cartoon");

  const grid = document.querySelector(".anime-grid");
  if (grid?.dataset.category) {
    initCategoryPage(grid.dataset.category);
  }
});
