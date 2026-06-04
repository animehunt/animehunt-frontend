// ============================================================
// js/features/animePage.js
// anime.html — anime listing with type filter (ALL/MOVIES/SERIES)
// HTML mein: <body data-page="anime">
// Grid: <div class="anime-grid" data-type-page="anime">
// ============================================================

import { fetchListing } from '../api.js';
import { getParam }     from '../utils.js';

let currentPage   = 1;
let currentFilter = 'all'; // all | movie | series
let isLoading     = false;
let hasMore       = true;

export async function initAnimePage() {

  // Header scroll shadow
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Type filter buttons (ALL / MOVIES / SERIES)
  initTypeFilter();

  // A-Z nav
  initAZNav();

  // First load
  await loadPage(1);
}

// ============================================================
// TYPE FILTER — ALL / MOVIES / SERIES
// ============================================================
function initTypeFilter() {
  const btns = document.querySelectorAll('.type-filter button');
  btns.forEach(btn => {
    btn.addEventListener('click', async () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const text = btn.textContent.trim().toLowerCase();
      currentFilter = text === 'all' ? 'all' : text === 'movies' ? 'movie' : 'series';

      currentPage = 1;
      hasMore     = true;
      await loadPage(1, true);
    });
  });
}

// ============================================================
// LOAD PAGE
// ============================================================
async function loadPage(page, replace = false) {
  if (isLoading) return;
  isLoading = true;

  try {
    const data = await fetchListing('anime', page, currentFilter);

    if (!data?.items?.length) {
      hasMore = false;
      isLoading = false;
      return;
    }

    renderGrid(data.items, replace || page === 1);
    renderPagination(page, data.total);

    hasMore     = page < Math.ceil((data.total || 0) / 20);
    currentPage = page;
  } catch (err) {
    console.error('Anime page error:', err);
  }

  isLoading = false;
}

// ============================================================
// GRID RENDER
// ============================================================
function renderGrid(items, replace = false) {
  const grid = document.querySelector('.anime-grid[data-type-page="anime"]');
  if (!grid) return;

  const cards = items.map(item => `
    <div
      class="anime-card"
      style="
        background-image: url('${item.poster}');
        background-size: cover;
        background-position: center;
        aspect-ratio: 2/3;
        border-radius: 10px;
        display: flex;
        align-items: flex-end;
        padding: 8px;
        cursor: pointer;
        transition: transform .3s ease, box-shadow .3s ease;
      "
      onclick="location.href='details.html?slug=${item.slug}'"
      onmouseover="this.style.transform='translateY(-5px) scale(1.03)';this.style.boxShadow='0 14px 36px rgba(0,0,0,.7)'"
      onmouseout="this.style.transform='';this.style.boxShadow=''"
    >
      <span style="
        background:rgba(0,0,0,0.65);
        padding:2px 6px;
        border-radius:4px;
        font-size:10px;
        color:#fff;
        max-width:100%;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        display:block;
      ">${item.title}</span>
    </div>
  `).join('');

  if (replace) {
    grid.innerHTML = cards;
  } else {
    grid.insertAdjacentHTML('beforeend', cards);
  }
}

// ============================================================
// PAGINATION
// ============================================================
function renderPagination(page, total) {
  const nav = document.querySelector('nav.pagination');
  if (!nav) return;

  const totalPages = Math.ceil((total || 0) / 20);
  if (totalPages <= 1) { nav.innerHTML = ''; return; }

  // Max 5 page buttons dikhao
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, start + 4);

  let html = `<button ${page === 1 ? 'disabled' : ''}
    onclick="window.__animePage(${page - 1})">Prev</button>`;

  for (let p = start; p <= end; p++) {
    html += `<button class="${p === page ? 'active' : ''}"
      onclick="window.__animePage(${p})">${p}</button>`;
  }

  html += `<button ${page === totalPages ? 'disabled' : ''}
    onclick="window.__animePage(${page + 1})">Next</button>`;

  nav.innerHTML = html;

  // Scroll top pe jao
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Global pagination handler
window.__animePage = async (page) => {
  await loadPage(page, true);
};

// ============================================================
// A-Z NAV
// ============================================================
function initAZNav() {
  document.querySelectorAll('.az-nav span').forEach(span => {
    span.addEventListener('click', () => {
      const letter = span.textContent.trim();
      window.location.href = `Category.html?letter=${letter}&type=anime`;
    });
  });
}
