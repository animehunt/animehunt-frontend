// ============================================================
// js/features/categoryPage.js
// Category.html — genre/letter filter page
// ============================================================

import { fetchCategory }                                         from '../api.js';
import { getParam, showSkeletons, lazyLoadCards, renderPaginationShared, escapeHtml } from '../utils.js';

let currentPage = 1;
let isLoading   = false;
let catSlug     = '';
let catLetter   = '';
let catType     = '';

export async function initCategoryPage() {

  catSlug   = getParam('slug')   || '';
  catLetter = getParam('letter') || '';
  catType   = getParam('type')   || '';

  // Banner title set karo
  const bannerTitle = document.getElementById('bannerTitle');
  if (bannerTitle) {
    if (catSlug)        bannerTitle.textContent = catSlug.toUpperCase();
    else if (catLetter) bannerTitle.textContent = `ANIME: ${catLetter}`;
    else                bannerTitle.textContent = 'CATEGORY';
  }

  // Page title
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    pageTitle.textContent = catSlug
      ? `${catSlug} – AnimeHunt`
      : `Anime: ${catLetter} – AnimeHunt`;
  }

  initAZNav();
  await loadPage(1);
}

// ✅ FIX (audit Issue 5): the old comment here claimed "GET
// /api/category/:key doesn't exist on the backend yet" -- that was
// wrong (verified directly against public.js: the route genuinely
// exists and returns exactly the {key,page,limit,title,total,items}
// shape this file expects). The real, remaining bug: apiFetch()
// returns the raw {success, data:{...}} envelope unwrapped, so
// fetchCategory()'s return value needed one more level of unwrapping
// before reading .items/.total/.title -- the exact same shape every
// sibling listing page (animePage.js, moviesPage.js, seriesPage.js,
// cartoonPage.js) already unwraps correctly via `resp?.data?.data`.
// Without this, data?.items was always undefined, so Category.html
// showed "No results found" on every single load regardless of what
// the backend actually had.
async function loadPage(page, replace = false) {
  if (isLoading) return;
  isLoading = true;
  const grid = document.getElementById('animeGrid');
  if (replace || page === 1) showSkeletons(grid, 8);
  try {
    const key  = catSlug || catLetter;
    const resp = await fetchCategory(key, page, catType);
    const data = resp?.data || {};
    if (!data?.items?.length) {
      if (page === 1 && grid) grid.innerHTML = '<p style="color:#555;font-size:12px;padding:20px;grid-column:1/-1;">No results found.</p>';
      isLoading = false;
      return;
    }
    if (page === 1 && data.title) {
      const bannerTitle = document.getElementById('bannerTitle');
      // ✅ FIX (FE-ISSUE-003): data.title comes from the API — use
      // textContent (not innerHTML) so it can't be interpreted as HTML.
      // toUpperCase() is safe on textContent either way, but keeping this
      // as a plain-text assignment rather than innerHTML closes the gap.
      if (bannerTitle) bannerTitle.textContent = data.title.toUpperCase();
    }
    renderGrid(data.items, replace || page === 1);
    renderPag(page, data.total);
    currentPage = page;
  } catch (err) {
    console.error('Category page error:', err);
  }
  isLoading = false;
}

function renderGrid(items, replace = false) {
  const grid = document.getElementById('animeGrid');
  if (!grid) return;
  // ✅ FIX (FE-ISSUE-003): full escapeHtml() on title and poster
  const cards = items.map(item => {
    const slug   = encodeURIComponent(item.slug || '');
    const title  = escapeHtml(item.title || '');
    const poster = escapeHtml(item.poster || '');
    return `<div class="movie-card" data-slug="${slug}" data-poster="${poster}" style="background:#1a1f2e;"><span class="card-title">${title}</span></div>`;
  }).join('');
  replace ? (grid.innerHTML = cards) : grid.insertAdjacentHTML('beforeend', cards);
  lazyLoadCards(grid);
  if (!grid._ci) {
    grid._ci = true;
    grid.addEventListener('click', e => {
      const c = e.target.closest('[data-slug]');
      if (c) location.href = `details.html?slug=${c.dataset.slug}`;
    });
  }
}

function renderPag(page, total) {
  renderPaginationShared(document.getElementById('pagination'), page, total, pg => loadPage(pg, true));
}

function initAZNav() {
  document.querySelectorAll('#azNav span').forEach(span => {
    span.addEventListener('click', () => {
      const letter = span.textContent.trim();
      window.location.href = `Category.html?letter=${letter}${catType ? '&type=' + catType : ''}`;
    });
  });
}
