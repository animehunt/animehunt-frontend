// ============================================================
// js/features/home.js
// index.html — homepage rows, categories, continue watching
// ============================================================

import { fetchHomepage, fetchFeaturedBanners } from '../api.js';
import { initHeroSlider }                      from './heroSlider.js';
import { getWatchProgress }                    from '../utils.js';

export async function initHome() {

  // ---- Header scroll shadow ----
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 10);
  });

  // ---- Data fetch ----
  try {
    const [data, banners] = await Promise.all([
      fetchHomepage(),
      fetchFeaturedBanners()
    ]);

    // 🔥 Dynamic hero slider
    initHeroSlider(banners);

    // Category bar
    if (data.categories?.length) {
      renderCategoryBar(data.categories);
    }

    // Continue Watching
    renderContinueWatching();

    // Homepage rows (Trending, New, etc.)
    if (data.rows?.length) {
      renderHomepageRows(data.rows);
    }

  } catch (err) {
    console.error('Home load error:', err);
  }

  // ---- A-Z nav ----
  initAZNav();
}

// ============================================================
// CATEGORY BAR
// ============================================================
function renderCategoryBar(categories) {
  const bar = document.querySelector('.category-bar');
  if (!bar) return;

  bar.innerHTML = categories.map(cat => `
    <button
      style="
        background:#1a1f2e;
        border:none;
        color:#ccc;
        padding:6px 14px;
        border-radius:20px;
        font-size:12px;
        cursor:pointer;
        white-space:nowrap;
      "
      data-slug="${cat.slug}"
    >${cat.name}</button>
  `).join('');

  bar.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = `Category.html?slug=${btn.dataset.slug}`;
    });
  });
}

// ============================================================
// HOMEPAGE ROWS
// ============================================================
function renderHomepageRows(rows) {
  const container = document.getElementById('homepageRows');
  if (!container) return;

  container.innerHTML = rows.map(row => `
    <section class="movie-row">
      <div class="row-header">
        <h2>${row.title}</h2>
        <button class="see-more-btn"
          onclick="location.href='${row.seeMoreUrl || '#'}'">
          See More
        </button>
      </div>
      <div class="movie-scroll">
        ${row.items.map(item => renderMovieCard(item)).join('')}
      </div>
    </section>
  `).join('');
}

// ============================================================
// MOVIE CARD
// ============================================================
function renderMovieCard(item) {
  return `
    <div class="movie-card"
      style="
        background-image: url('${item.poster}');
        background-size: cover;
        background-position: center;
        min-width: 22%;
        aspect-ratio: 2/3;
        border-radius: 10px;
        display: flex;
        align-items: flex-end;
        padding: 8px;
        font-size: 12px;
        cursor: pointer;
        flex-shrink: 0;
      "
      onclick="location.href='details.html?slug=${item.slug}'"
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
      ">${item.title}</span>
    </div>
  `;
}

// ============================================================
// CONTINUE WATCHING (localStorage)
// ============================================================
function renderContinueWatching() {
  const section  = document.getElementById('continueSection');
  const scroll   = document.getElementById('continueScroll');
  const clearBtn = document.getElementById('clearContinueBtn');
  if (!section || !scroll) return;

  const history = JSON.parse(localStorage.getItem('ah_continue') || '[]');

  if (history.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  scroll.innerHTML = history.map(item => `
    <div class="movie-card"
      style="
        background-image: url('${item.poster}');
        background-size: cover;
        background-position: center;
        min-width: 22%;
        aspect-ratio: 2/3;
        border-radius: 10px;
        display: flex;
        align-items: flex-end;
        padding: 8px;
        font-size: 12px;
        cursor: pointer;
        flex-shrink: 0;
        position: relative;
      "
      onclick="location.href='watch.html?slug=${item.slug}&season=${item.season || 1}&ep=${item.ep || 1}'"
    >
      <span style="
        background:rgba(0,0,0,0.6);
        padding:2px 5px;
        border-radius:4px;
        font-size:10px;
        color:#fff;
      ">EP ${item.ep || 1}</span>
    </div>
  `).join('');

  // Clear button
  clearBtn?.addEventListener('click', () => {
    localStorage.removeItem('ah_continue');
    section.style.display = 'none';
  });
}

// ============================================================
// A-Z NAV
// ============================================================
function initAZNav() {
  document.querySelectorAll('.az-nav span').forEach(span => {
    span.addEventListener('click', () => {
      const letter = span.textContent.trim();
      window.location.href = `Category.html?letter=${letter}`;
    });
  });
}
