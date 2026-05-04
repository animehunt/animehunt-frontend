import { loadSEO, applyGlobalSEO, applyHomeSEO } from "../core/seo.js";
import { getHomepage, getAnime, getCategories } from "../core/api.js";
import { createCard, initLazy } from "../core/utils.js";
import { loadBanner } from "./banner.js";
import { initContinueWatching } from "./continueWatching.js";

/* ================= INIT ================= */
export async function initHome() {

  const container = document.getElementById("homepageRows");
  const grid = document.querySelector(".home-grid");
  const filterBar = document.querySelector(".category-bar");

  if (!container) return;

  /* ================= SEO ================= */
  try {
    const seo = await loadSEO();
    applyGlobalSEO(seo);
    applyHomeSEO(seo);
  } catch {}

  /* ================= HERO BANNER ================= */
  await loadBanner("home");

  /* ================= CONTINUE WATCHING ================= */
  initContinueWatching();

  /* ================= LOAD CATEGORIES ================= */
  const categories = await getCategories();

  /* ================= FILTER ================= */
  buildFilter(filterBar, categories, container, grid);

  /* ================= LOAD HOMEPAGE ROWS ================= */
  const rows = await getHomepage();

  if (!rows?.length) {
    container.innerHTML = "<p style='padding:20px'>No content</p>";
    return;
  }

  container.innerHTML = "";

  for (const row of rows) {

    const anime = await getAnime(`?category=${row.source}&limit=${row.row_limit || 20}`);

    const html = `
      <section class="movie-row">

        <div class="row-header">
          <h2>${row.title}</h2>
          <a href="category.html?type=${row.source}" class="see-more-btn">See more</a>
        </div>

        <div class="movie-scroll">
          ${(anime || []).map(createCard).join("")}
        </div>

      </section>
    `;

    container.innerHTML += html;
  }

  initLazy();
}

/* ================= FILTER ================= */
function buildFilter(bar, categories, rows, grid) {

  if (!bar) return;

  /* RESET */
  bar.innerHTML = `<button class="active">ALL</button>`;

  /* ADD CATEGORIES */
  categories
    ?.filter(c => c.active)
    ?.forEach(cat => {
      bar.innerHTML += `
        <button data-slug="${cat.slug}">
          ${cat.name}
        </button>
      `;
    });

  const buttons = bar.querySelectorAll("button");

  buttons.forEach(btn => {

    btn.onclick = async () => {

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const slug = btn.dataset.slug;

      /* ===== ALL ===== */
      if (!slug) {
        rows.style.display = "block";
        grid.style.display = "none";
        return;
      }

      /* ===== FILTER MODE ===== */
      rows.style.display = "none";
      grid.style.display = "grid";

      grid.innerHTML = `<p style="padding:20px">Loading...</p>`;

      const data = await getAnime(`?category=${slug}&limit=40`);

      if (!data?.length) {
        grid.innerHTML = `<p style="padding:20px">No results</p>`;
        return;
      }

      grid.innerHTML = data.map(createCard).join("");

      initLazy();
    };
  });
}
