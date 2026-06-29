// ============================================================
// js/features/categoryPage.js
// Category.html — genre/letter filter page
// ============================================================

import { fetchCategory }                                         from '../api.js';
import { getParam, showSkeletons, lazyLoadCards, renderPaginationShared } from '../utils.js';

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

async function loadPage(page, replace = false) {
  if (isLoading) return;
  isLoading = true;
  const grid = document.getElementById('animeGrid');
  if (replace || page === 1) showSkeletons(grid, 8);
  try {
    const key  = catSlug || catLetter;
    const data = await fetchCategory(key, page, catType);
    if (!data?.items?.length) {
      if (page === 1 && grid) grid.innerHTML = '<p style="color:#555;font-size:12px;padding:20px;grid-column:1/-1;">No results found.</p>';
      isLoading = false;
      return;
    }
    if (page === 1 && data.title) {
      const bannerTitle = document.getElementById('bannerTitle');
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
  const cards = items.map(item => {
    const slug  = encodeURIComponent(item.slug || '');
    const title = (item.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<div class="movie-card" data-slug="${slug}" data-poster="${item.poster || ''}" style="background:#1a1f2e;"><span class="card-title">${title}</span></div>`;
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
