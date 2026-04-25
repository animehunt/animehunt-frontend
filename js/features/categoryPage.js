import { getAnime } from "../core/api.js";
import { createCard } from "../core/utils.js";
import { renderPagination } from "./pagination.js";
import { loadBanner } from "./banner.js";

export async function initCategoryPage(category) {
  await loadBanner("home");

  const grid = document.querySelector(".anime-grid");
  const pagination = document.querySelector(".pagination");

  async function load(page = 1) {
    const res = await getAnime(`?category=${category}&page=${page}&limit=20`);

    const data = res?.data || res;
    const total = res?.totalPages || 5;

    grid.innerHTML = (data || []).map(createCard).join("");

    renderPagination(pagination, page, total, load);
  }

  load();
}
