// ============================================================
// js/features/listing.js
// anime.html / movies.html / series.html / cartoon.html
// body mein: data-page="listing" data-type="anime" etc.
// ============================================================

import { fetchListing }        from '../api.js';
import { getParam, escapeHtml } from '../utils.js';

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
    // ✅ FIX (FE-ISSUE-006/009): same double-nested {data:{data,total}}
    // shape as the 4 dedicated listing pages this file duplicates. This
    // file is currently dead code (never imported — see script.js's
    // router, which has no 'listing' case), fixed here for consistency.
    const resp  = await fetchListing(currentType, currentPage, activeFilter);
    const items = resp?.data?.data  || [];
    const total = resp?.data?.total || 0;

    if (!items.length) {
      hasMore = false;
      isLoading = false;
      return;
    }

    renderGrid(items, currentPage === 1);

    hasMore = currentPage < Math.ceil(total / 20);
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

  // ✅ FIX (FE-ISSUE-003/009): poster (in a CSS url()) and title (in
  // innerHTML) were both completely unescaped.
  const cards = items.map(item => `
    <div
      style="
        background-image: url(${JSON.stringify(item.poster || '')});
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
      ">${escapeHtml(item.title || '')}</span>
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
