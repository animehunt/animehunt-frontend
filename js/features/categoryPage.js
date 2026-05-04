import { getAnime, getCategories } from "../core/api.js";
import { createCard, initLazy } from "../core/utils.js";
import { loadSEO, applyDynamicSEO } from "../core/seo.js";

/* ================= GET SLUG ================= */
function getSlug() {
  const params = new URLSearchParams(location.search);
  return params.get("type");
}

/* ================= STATE ================= */
let currentSlug = null;
let currentPage = 1;
let loading = false;

/* ================= INIT ================= */
export async function initCategoryPage() {

  const slug = getSlug();

  if (!slug) {
    renderError("Invalid category");
    return;
  }

  currentSlug = slug;

  try {
    const categories = await getCategories();

    const category = categories?.find(c => c.slug === slug && c.active);

    if (!category) {
      renderError("Category not found");
      return;
    }

    /* ===== UI SET ===== */
    setPageUI(category);

    /* ===== LOAD ANIME ===== */
    await loadAnime();

    /* ===== SEO ===== */
    const seo = await loadSEO();

    applyDynamicSEO("category", {
      name: category.name
    }, seo);

  } catch (err) {
    console.error(err);
    renderError("Something went wrong");
  }
}

/* ================= UI ================= */
function setPageUI(category) {

  document.getElementById("pageTitle").innerText =
    `${category.name} – AnimeHunt`;

  document.getElementById("bannerTitle").innerText =
    category.name.toUpperCase();

  const banner = document.getElementById("pageBanner");

  banner.className = "page-banner " + category.slug + "-banner";
}

/* ================= LOAD ANIME ================= */
async function loadAnime(page = 1) {

  if (loading) return;
  loading = true;

  const grid = document.getElementById("animeGrid");

  if (page === 1) {
    grid.innerHTML = `<p style="padding:20px">Loading...</p>`;
  }

  try {

    const res = await getAnime(
      `?category=${currentSlug}&page=${page}&limit=24`
    );

    const data = res?.data || res || [];

    if (!data.length && page === 1) {
      grid.innerHTML = `<p style="padding:20px">No anime found</p>`;
      return;
    }

    if (page === 1) {
      grid.innerHTML = data.map(createCard).join("");
    } else {
      grid.innerHTML += data.map(createCard).join("");
    }

    initLazy();

    currentPage = page;

    renderLoadMore(data.length);

  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="padding:20px">Failed to load</p>`;
  }

  loading = false;
}

/* ================= LOAD MORE ================= */
function renderLoadMore(count) {

  const box = document.getElementById("loadMoreBox");

  if (!box) return;

  if (count < 24) {
    box.style.display = "none";
    return;
  }

  box.style.display = "block";

  box.innerHTML = `<button id="loadMoreBtn">Load More</button>`;

  document.getElementById("loadMoreBtn").onclick = () => {
    loadAnime(currentPage + 1);
  };
}

/* ================= ERROR ================= */
function renderError(msg) {
  document.getElementById("animeGrid").innerHTML =
    `<p style="padding:20px">${msg}</p>`;
}
