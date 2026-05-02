import { getAnime, prefetch } from "../core/api.js";
import { createCard } from "../core/utils.js";
import { renderPagination } from "./pagination.js";
import { loadBanner } from "./banner.js";

let currentPage = 1;

export async function initAnimePage(type) {
  const grid = document.querySelector(".anime-grid");
  const pagination = document.querySelector(".pagination");

  // banner load
  await loadBanner(type);

  async function load(page = 1) {
    currentPage = page;

    // 🔥 loading UI
    grid.innerHTML = "<p style='padding:20px'>Loading...</p>";

    try {
      const res = await getAnime(`?type=${type}&page=${page}&limit=20`);

      if (!res) {
        grid.innerHTML = "<p style='padding:20px'>Failed to load data</p>";
        return;
      }

      const list = res.data || [];
      const totalItems = res.count || 0;
      const totalPages = Math.ceil(totalItems / 20);

      // ❌ empty state
      if (!list.length) {
        grid.innerHTML = "<p style='padding:20px'>No anime found</p>";
        return;
      }

      // ✅ render cards
      grid.innerHTML = list.map(createCard).join("");

      // ✅ pagination
      renderPagination(pagination, currentPage, totalPages, load);

      // ⚡ prefetch next page (performance boost)
      if (currentPage < totalPages) {
        prefetch(`/public/anime?type=${type}&page=${currentPage + 1}&limit=20`);
      }

    } catch (err) {
      console.error(err);
      grid.innerHTML = "<p style='padding:20px'>Something went wrong</p>";
    }
  }

  // initial load
  load(1);
}
