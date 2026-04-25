import { getAnime } from "../core/api.js";
import { createCard } from "../core/utils.js";
import { renderPagination } from "./pagination.js";
import { loadBanner } from "./banner.js";

let currentPage = 1;

export async function initAnimePage(type) {
  await loadBanner(type);

  const grid = document.querySelector(".anime-grid");
  const pagination = document.querySelector(".pagination");

  async function load(page = 1) {
    currentPage = page;

    const res = await getAnime(`?type=${type}&page=${page}&limit=20`);

    const data = res?.data || res;
    const total = res?.totalPages || 5;

    grid.innerHTML = (data || []).map(createCard).join("");

    renderPagination(pagination, currentPage, total, load);
  }

  load(1);
}
