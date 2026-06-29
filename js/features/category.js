// ============================================================
// js/features/category.js
// Category.html — genre/letter filter page
// ============================================================

import { fetchCategory } from '../api.js';
import { getParam }      from '../utils.js';

let currentPage = 1;
let isLoading   = false;
let hasMore     = true;
let catSlug     = '';
let catLetter   = '';

export async function initCategory() {
  catSlug   = getParam('slug')   || '';
  catLetter = getParam('letter') || '';

  // Page title set karo
  if (catSlug) {
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = `${catSlug} – AnimeHunt`;
  } else if (catLetter) {
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = `Anime: ${catLetter} – AnimeHunt`;
  }

  await loadCategoryPage();
  window.addEventListener('scroll', handleInfiniteScroll);
}

// ============================================================
// LOAD
// ============================================================
async function loadCategoryPage() {
  if (isLoading || !hasMore) return;
  isLoading = true;

  try {
    const data = await fetchCategory(catSlug || catLetter, currentPage);

    if (!data?.items?.length) {
      hasMore = false;
      isLoading = false;
      return;
    }

    // Category title
    if (currentPage === 1 && data.title) {
      const h2 = document.querySelector('.page-banner h2, .category-title, h2');
      if (h2) h2.textContent = data.title;
    }

    renderGrid(data.items, currentPage === 1);

    hasMore = !!data.hasMore;
    currentPage++;
  } catch (err) {
    console.error('Category error:', err);
  }

  isLoading = false;
}

// ============================================================
// GRID
// ============================================================
function renderGrid(items, replace = false) {
  let grid = document.querySelector('.category-grid, #categoryGrid, .content-grid');

  if (!grid) {
    grid = document.createElement('div');
    grid.id = 'categoryGrid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 0 16px 80px;
    `;
    const footer = document.querySelector('.main-footer');
    footer
      ? footer.before(grid)
      : document.body.appendChild(grid);
  }

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
      "
      
    >
      <span style="
        background:rgba(0,0,0,0.6);
        padding:2px 5px;
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
// INFINITE SCROLL
// ============================================================
function handleInfiniteScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadCategoryPage();
  }
}
