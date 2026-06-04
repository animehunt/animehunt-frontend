// ============================================================
// js/features/categoryPage.js
// Category.html — genre/letter filter page
// IDs: #animeGrid, #bannerTitle, #pagination, #azNav
// URL params: ?slug=action OR ?letter=A&type=anime
// ============================================================

import { fetchCategory } from '../api.js';
import { getParam }      from '../utils.js';

let currentPage = 1;
let isLoading   = false;
let hasMore     = true;
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
    if (catSlug)   bannerTitle.textContent = catSlug.toUpperCase();
    else if (catLetter) bannerTitle.textContent = `ANIME: ${catLetter}`;
    else           bannerTitle.textContent = 'CATEGORY';
  }

  // Page title
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    pageTitle.textContent = catSlug
      ? `${catSlug} – AnimeHunt`
      : `Anime: ${catLetter} – AnimeHunt`;
  }

  // A-Z nav
  initAZNav();

  // First page load
  await loadPage(1);
}

// ============================================================
// LOAD
// ============================================================
async function loadPage(page, replace = false) {
  if (isLoading) return;
  isLoading = true;

  try {
    const key  = catSlug || catLetter;
    const data = await fetchCategory(key, page, catType);

    if (!data?.items?.length) {
      hasMore = false;

      // Grid empty message
      if (page === 1) {
        const grid = document.getElementById('animeGrid');
        if (grid) grid.innerHTML =
          '<p style="color:#666;font-size:12px;padding:20px;grid-column:1/-1;">No results found.</p>';
      }

      isLoading = false;
      return;
    }

    // Banner title backend se aya to update karo
    if (page === 1 && data.title) {
      const bannerTitle = document.getElementById('bannerTitle');
      if (bannerTitle) bannerTitle.textContent = data.title.toUpperCase();
    }

    renderGrid(data.items, replace || page === 1);
    renderPagination(page, data.total);

    hasMore     = page < Math.ceil((data.total || 0) / 20);
    currentPage = page;
  } catch (err) {
    console.error('Category page error:', err);
  }

  isLoading = false;
}

// ============================================================
// GRID — #animeGrid
// ============================================================
function renderGrid(items, replace = false) {
  const grid = document.getElementById('animeGrid');
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
// PAGINATION — #pagination div
// ============================================================
function renderPagination(page, total) {
  const nav = document.getElementById('pagination');
  if (!nav) return;

  const totalPages = Math.ceil((total || 0) / 20);
  if (totalPages <= 1) { nav.innerHTML = ''; return; }

  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, start + 4);

  let html = `<button ${page === 1 ? 'disabled' : ''}
    onclick="window.__catPage(${page - 1})">Prev</button>`;

  for (let p = start; p <= end; p++) {
    html += `<button class="${p === page ? 'active' : ''}"
      onclick="window.__catPage(${p})">${p}</button>`;
  }

  html += `<button ${page === totalPages ? 'disabled' : ''}
    onclick="window.__catPage(${page + 1})">Next</button>`;

  nav.innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.__catPage = async (page) => {
  await loadPage(page, true);
};

// ============================================================
// A-Z NAV — #azNav
// ============================================================
function initAZNav() {
  document.querySelectorAll('#azNav span').forEach(span => {
    span.addEventListener('click', () => {
      const letter = span.textContent.trim();
      window.location.href =
        `Category.html?letter=${letter}${catType ? '&type=' + catType : ''}`;
    });
  });
}
