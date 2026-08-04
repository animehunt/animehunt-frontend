// ============================================================
// js/features/seriesPage.js
// series.html — series listing with pagination
// ============================================================

import { fetchListing }                                          from '../api.js';
import { showSkeletons, lazyLoadCards, renderPaginationShared, escapeHtml } from '../utils.js';

let currentPage = 1;
let isLoading   = false;

export async function initSeriesPage() {
  initAZNav();
  await loadPage(1);
}

async function loadPage(page, replace = false) {
  if (isLoading) return;
  isLoading = true;
  const grid = document.querySelector('.anime-grid[data-type-page="series"]');
  if (replace || page === 1) showSkeletons(grid, 8);
  try {
    // ✅ FIX (FE-ISSUE-006): double-nested {data:{data,total}} shape —
    // see animePage.js for the full explanation, identical bug here.
    const resp  = await fetchListing('series', page, 'all');
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
    console.error('Series page error:', err);
  }
  isLoading = false;
}

function renderGrid(items, replace = false) {
  const grid = document.querySelector('.anime-grid[data-type-page="series"]');
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
  renderPaginationShared(document.querySelector('nav.pagination'), page, total, pg => loadPage(pg, true));
}

function initAZNav() {
  document.querySelectorAll('.az-nav span').forEach(span => {
    span.addEventListener('click', () => {
      window.location.href = `Category.html?letter=${span.textContent.trim()}&type=series`;
    });
  });
}
