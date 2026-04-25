import { getAnime } from "../core/api.js";
import { createCard } from "../core/utils.js";
import { loadBanner } from "./banner.js";

export async function initCategoryPage(category) {
  await loadBanner("home");

  const grid = document.querySelector(".anime-grid");
  if (!grid) return;

  const data = await getAnime(`?category=${category}&limit=40`);

  grid.innerHTML = (data || []).map(createCard).join("");
}
