// ============================================================
// js/features/home.js
// index.html — homepage rows, categories, continue watching
// ============================================================

import { fetchHomepage, fetchFeaturedBanners } from '../api.js';
import { initHeroSlider }                      from './heroSlider.js';
import { showSkeletons, lazyLoadCards }        from '../utils.js';

export async function initHome() {

  try {
    const [resp, bannerResp] = await Promise.all([
      fetchHomepage(),
      fetchFeaturedBanners()
    ]);

    // Unwrap API envelope: /api/homepage/public returns { success, data: [...rows] }
    const rows    = resp?.data    || resp?.rows    || [];
    const banners = bannerResp?.data || bannerResp || [];

    // Hero slider
    initHeroSlider(banners);

    // Continue Watching
    renderContinueWatching();

    // Homepage rows
    if (rows.length) renderHomepageRows(rows);

  } catch (err) {
    console.error('Home load error:', err);
  }

  initAZNav();
}

// ============================================================
// CATEGORY BAR
// ============================================================
function renderCategoryBar(categories) {
  const bar = document.querySelector('.category-bar');
  if (!bar) return;

  bar.innerHTML = categories.map(cat => {
    const name = (cat.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const slug = encodeURIComponent(cat.slug || '');
    return `<button data-slug="${slug}">${name}</button>`;
  }).join('');

  bar.addEventListener('click', e => {
    const btn = e.target.closest('button[data-slug]');
    if (btn) window.location.href = `Category.html?slug=${btn.dataset.slug}`;
  });
}

// ============================================================
// HOMEPAGE ROWS — skeleton + lazy load
// ============================================================
function renderHomepageRows(rows) {
  const container = document.getElementById('homepageRows');
  if (!container) return;

  container.innerHTML = rows.map(row => {
    const title = (row.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cards = (row.items || []).map(item => {
      const slug  = encodeURIComponent(item.slug || '');
      const t     = (item.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `
        <div class="movie-card"
          data-slug="${slug}"
          data-poster="${item.poster || ''}"
          style="min-width:22%;flex-shrink:0;background:#1a1f2e;">
          <span class="card-title">${t}</span>
        </div>`;
    }).join('');

    const seeMore = row.seeMoreUrl
      ? `<a href="${row.seeMoreUrl}" class="see-more-btn">See More</a>`
      : '';

    return `
      <section class="movie-row">
        <div class="row-header">
          <h2>${title}</h2>
          ${seeMore}
        </div>
        <div class="movie-scroll" data-row>
          ${cards}
        </div>
      </section>`;
  }).join('');

  // Lazy load + event delegation for ALL rows
  container.querySelectorAll('[data-row]').forEach(scroll => {
    lazyLoadCards(scroll);
    scroll.addEventListener('click', e => {
      const c = e.target.closest('[data-slug]');
      if (c) location.href = `details.html?slug=${c.dataset.slug}`;
    });
  });
}

// ============================================================
// CONTINUE WATCHING (localStorage)
// ============================================================
function renderContinueWatching() {
  const section  = document.getElementById('continueSection');
  const scroll   = document.getElementById('continueScroll');
  const clearBtn = document.getElementById('clearContinueBtn');
  if (!section || !scroll) return;

  let list = [];
  try { list = JSON.parse(localStorage.getItem('ah_continue') || '[]'); } catch {}

  if (list.length === 0) { section.style.display = 'none'; return; }

  section.style.display = 'block';

  scroll.innerHTML = list.map(item => {
    const slug  = encodeURIComponent(item.slug || '');
    const title = (item.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const ep    = item.ep || 1;
    const s     = item.season || 1;
    return `
      <div class="movie-card"
        data-slug="${slug}"
        data-season="${s}"
        data-ep="${ep}"
        data-poster="${item.poster || ''}"
        style="min-width:22%;flex-shrink:0;background:#1a1f2e;">
        <span class="card-title" style="background:rgba(52,152,219,0.85);">S${s} EP${ep}</span>
      </div>`;
  }).join('');

  lazyLoadCards(scroll);

  scroll.addEventListener('click', e => {
    const c = e.target.closest('[data-slug]');
    if (c) location.href = `watch.html?slug=${c.dataset.slug}&season=${c.dataset.season}&ep=${c.dataset.ep}`;
  });

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
      window.location.href = `Category.html?letter=${span.textContent.trim()}`;
    });
  });
}
