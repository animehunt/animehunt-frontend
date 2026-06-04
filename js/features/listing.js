// ============================================================
// js/features/listing.js
// anime.html / movies.html / series.html / cartoon.html
// body mein: data-page="listing" data-type="anime" etc.
// ============================================================

import { fetchListing } from '../api.js';
import { getParam }     from '../utils.js';

let currentPage = 1;
let currentType = 'anime';
let isLoading   = false;
let hasMore     = true;

export async function initListing() {
  currentType = document.body.dataset.type || 'anime';
  currentPage = 1;
  hasMore     = true;

  // ---- Header scroll ----
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 10);
  });

  // ---- Filter buttons ----
  initFilterButtons();

  // ---- First page load ----
  await loadMore();

  // ---- Infinite scroll ----
  window.addEventListener('scroll', handleInfiniteScroll);
}

// ============================================================
// LOAD MORE
// ============================================================
async function loadMore() {
  if (isLoading || !hasMore) return;
  isLoading = true;

  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.value || '';

  try {
    const data = await fetchListing(currentType, currentPage, activeFilter);

    if (!data?.items?.length) {
      hasMore = false;
      isLoading = false;
      return;
    }

    renderGrid(data.items, currentPage === 1);

    hasMore = currentPage < Math.ceil(data.total / 20);
    currentPage++;
  } catch (err) {
    console.error('Listing error:', err);
  }

  isLoading = false;
}

// ============================================================
// GRID RENDER
// ============================================================
function renderGrid(items, replace = false) {
  let grid = document.getElementById('listingGrid');

  // Grid already nahi hai to banao
  if (!grid) {
    grid = document.createElement('div');
    grid.id = 'listingGrid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 0 16px 80px;
    `;
    // Main content area mein add karo
    const main = document.querySelector('main, .content, body');
    const footer = document.querySelector('.main-footer');
    footer ? footer.before(grid) : main.appendChild(grid);
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
        font-size: 12px;
        cursor: pointer;
        transition: transform .3s ease, box-shadow .3s ease;
      "
      onclick="location.href='details.html?slug=${item.slug}'"
      onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 30px rgba(0,0,0,.7)'"
      onmouseout="this.style.transform='';this.style.boxShadow=''"
    >
      <span style="
        background:rgba(0,0,0,0.6);
        padding:2px 5px;
        border-radius:4px;
        font-size:10px;
        color:#fff;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        max-width:100%;
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
// INFINITE SCROLL
// ============================================================
function handleInfiniteScroll() {
  const scrollBottom = window.innerHeight + window.scrollY;
  const pageBottom   = document.body.offsetHeight - 200;

  if (scrollBottom >= pageBottom) {
    loadMore();
  }
}

// ============================================================
// FILTER BUTTONS (genre / category)
// ============================================================
function initFilterButtons() {
  document.querySelectorAll('.filter-btn, .category-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.filter-btn, .category-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Reset aur reload
      currentPage = 1;
      hasMore     = true;
      await loadMore();
    });
  });
}
