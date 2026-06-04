// ============================================================
// js/features/seriesPage.js
// series.html — series listing with pagination
// HTML mein: <body data-page="series">
// Grid: <div class="anime-grid" data-type-page="series">
// ============================================================

import { fetchListing } from '../api.js';

let currentPage = 1;
let isLoading   = false;

export async function initSeriesPage() {

  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 10);
  });

  initAZNav();
  await loadPage(1);
}

// ============================================================
// LOAD
// ============================================================
async function loadPage(page, replace = false) {
  if (isLoading) return;
  isLoading = true;

  try {
    const data = await fetchListing('series', page, 'all');

    if (!data?.items?.length) { isLoading = false; return; }

    renderGrid(data.items, replace || page === 1);
    renderPagination(page, data.total);
    currentPage = page;
  } catch (err) {
    console.error('Series page error:', err);
  }

  isLoading = false;
}

// ============================================================
// GRID
// ============================================================
function renderGrid(items, replace = false) {
  const grid = document.querySelector('.anime-grid[data-type-page="series"]');
  if (!grid) return;

  const cards = items.map(item => `
    <div
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

  replace ? (grid.innerHTML = cards) : grid.insertAdjacentHTML('beforeend', cards);
}

// ============================================================
// PAGINATION
// ============================================================
function renderPagination(page, total) {
  const nav = document.querySelector('nav.pagination');
  if (!nav) return;

  const totalPages = Math.ceil((total || 0) / 20);
  if (totalPages <= 1) { nav.innerHTML = ''; return; }

  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, start + 4);

  let html = `<button ${page === 1 ? 'disabled' : ''}
    onclick="window.__seriesPage(${page - 1})">Prev</button>`;

  for (let p = start; p <= end; p++) {
    html += `<button class="${p === page ? 'active' : ''}"
      onclick="window.__seriesPage(${p})">${p}</button>`;
  }

  html += `<button ${page === totalPages ? 'disabled' : ''}
    onclick="window.__seriesPage(${page + 1})">Next</button>`;

  nav.innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.__seriesPage = async (page) => {
  await loadPage(page, true);
};

// ============================================================
// A-Z NAV
// ============================================================
function initAZNav() {
  document.querySelectorAll('.az-nav span').forEach(span => {
    span.addEventListener('click', () => {
      window.location.href = `Category.html?letter=${span.textContent.trim()}&type=series`;
    });
  });
}
