// ============================================================
// js/features/animePage.js
// anime.html — anime listing with type filter (ALL/MOVIES/SERIES)
// HTML mein: <body data-page="anime">
// Grid: <div class="anime-grid" data-type-page="anime">
// ============================================================

import { fetchListing }                                          from '../api.js';
import { showSkeletons, lazyLoadCards, renderPaginationShared, escapeHtml } from '../utils.js';

let currentPage   = 1;
let currentFilter = 'all';
let isLoading     = false;

export async function initAnimePage() {
  initTypeFilter();
  initAZNav();
  await loadPage(1);
}

function initTypeFilter() {
  const btns = document.querySelectorAll('.type-filter button');
  btns.forEach(btn => {
    btn.addEventListener('click', async () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const text = btn.textContent.trim().toLowerCase();
      currentFilter = text === 'all' ? 'all' : text === 'movies' ? 'movie' : 'series';
      currentPage = 1;
      await loadPage(1, true);
    });
  });
}

async function loadPage(page, replace = false) {
  if (isLoading) return;
  isLoading = true;
  const grid = document.querySelector('.anime-grid[data-type-page="anime"]');
  if (replace || page === 1) showSkeletons(grid, 8);
  try {
    // ✅ FIX (FE-ISSUE-006): GET /api/anime returns
    // {success, data: {page, limit, total, data: [...items]}} — a
    // double-nested shape. items/total were being read one (or two)
    // levels too shallow, so this branch always hit "No results found"
    // regardless of what the API actually returned.
    const resp  = await fetchListing('anime', page, currentFilter);
    const items = resp?.data?.data || [];
    const total = resp?.data?.total || 0;

    if (!items.length) {
      if (grid) grid.innerHTML = '<p style="color:#555;font-size:12px;grid-column:1/-1;padding:20px;">No results found.</p>';
      isLoading = false;
      return;
    }
    renderGrid(items, replace || page === 1);
    renderPag(page, total);
    currentPage = page;
  } catch (err) {
    console.error('Anime page error:', err);
  }
  isLoading = false;
}

function renderGrid(items, replace = false) {
  const grid = document.querySelector('.anime-grid[data-type-page="anime"]');
  if (!grid) return;
  // ✅ FIX (FE-ISSUE-003): full escapeHtml() on title and poster — poster
  // (a data-* attribute) was previously unescaped.
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
  renderPaginationShared(document.querySelector('nav.pagination'), page, total, pg => loadPage(pg, true));
}

function initAZNav() {
  document.querySelectorAll('.az-nav span').forEach(span => {
    span.addEventListener('click', () => {
      window.location.href = `Category.html?letter=${span.textContent.trim()}&type=anime`;
    });
  });
}
