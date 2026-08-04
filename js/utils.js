// ============================================================
// js/utils.js
// Helper functions — localStorage, URL params, debounce etc.
// ============================================================

const KEY_HISTORY  = 'ah_history';
const KEY_CONTINUE = 'ah_continue';
const MAX_HISTORY  = 50;
const MAX_CONTINUE = 20;

// ============================================================
// URL PARAMS
// ============================================================
export function getParam(key) {
  return new URLSearchParams(location.search).get(key) || '';
}

// ============================================================
// HTML ESCAPE — prevents XSS
// ✅ FIX (frontend audit FE-ISSUE-003): every feature file (11 of them)
// duplicated an inline `.replace(/</g,'&lt;').replace(/>/g,'&gt;')`
// pattern instead of using a shared helper — and that pattern only
// escapes 2 of the 5 characters that matter (`<` and `>`), leaving `"`,
// `'`, and `&` unescaped. That gap is exploitable specifically via the
// `data-poster="${item.poster}"` attribute used across 10 of those same
// files: poster is admin-entered (not raw public user input — confirmed
// against the backend's anime.js), so this isn't reachable by an
// anonymous visitor, but it is reachable via a compromised admin account
// or the bulk-CSV-import path, and a `"` in that value breaks out of the
// attribute entirely. This is the same 5-character implementation used
// consistently across the admin panel's own escapeHtml/escapeHTML
// helpers, provided here as the one shared version for the public site.
// ============================================================
export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// DEBOUNCE
// ============================================================
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ============================================================
// SLUGIFY
// ============================================================
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ============================================================
// WATCH HISTORY — details.html se save hota hai
// ============================================================
export function saveToHistory(anime) {
  if (!anime?.slug) return;

  try {
    const list     = getHistory();
    const filtered = list.filter(i => i.slug !== anime.slug);

    filtered.unshift({
      slug:   anime.slug,
      title:  anime.title  || '',
      poster: anime.poster || '',
      ts:     Date.now()
    });

    localStorage.setItem(
      KEY_HISTORY,
      JSON.stringify(filtered.slice(0, MAX_HISTORY))
    );
  } catch (e) { /* localStorage full ya private mode */ }
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY_HISTORY) || '[]');
  } catch { return []; }
}

export function clearHistory() {
  localStorage.removeItem(KEY_HISTORY);
}

// ============================================================
// CONTINUE WATCHING — watch.html se save hota hai
// ============================================================
export function saveWatchProgress(slug, season, ep, poster = '', title = '') {
  if (!slug) return;

  try {
    const list     = getContinueList();
    const filtered = list.filter(i => i.slug !== slug);

    filtered.unshift({ slug, season, ep, poster, title, ts: Date.now() });

    localStorage.setItem(
      KEY_CONTINUE,
      JSON.stringify(filtered.slice(0, MAX_CONTINUE))
    );
  } catch (e) {}
}

export function getWatchProgress(slug) {
  const list = getContinueList();
  return list.find(i => i.slug === slug) || null;
}

export function getContinueList() {
  try {
    return JSON.parse(localStorage.getItem(KEY_CONTINUE) || '[]');
  } catch { return []; }
}

export function clearContinueWatching() {
  localStorage.removeItem(KEY_CONTINUE);
}

// ============================================================
// SKELETON SHIMMER — Netflix-style loading placeholder
// ============================================================

/**
 * Grid mein skeleton cards dikhao (fetch hone se pehle)
 * @param {Element} grid - Target grid container
 * @param {number} count - Kitne skeleton cards dikhane hain
 */
export function showSkeletons(grid, count = 8) {
  if (!grid) return;
  grid.innerHTML = Array(count).fill(
    '<div class="skeleton skeleton-card"></div>'
  ).join('');
}

/**
 * Episode grid ke liye skeleton
 */
export function showEpSkeletons(grid, count = 8) {
  if (!grid) return;
  grid.innerHTML = Array(count).fill(
    '<div class="ep-card"><div class="ep-thumb skeleton skeleton-ep"></div><div class="skeleton skeleton-text w60" style="margin-top:5px;"></div></div>'
  ).join('');
}

/**
 * Related grid ke liye skeleton
 */
export function showRelSkeletons(grid, count = 4) {
  if (!grid) return;
  grid.innerHTML = Array(count).fill(
    '<div class="skeleton skeleton-card"></div>'
  ).join('');
}

// ============================================================
// LAZY LOADING — IntersectionObserver se images load karo
// ============================================================

/**
 * Container ke andar saare [data-poster] elements ko lazy load karo
 * @param {Element} container - Parent element
 */
export function lazyLoadCards(container) {
  if (!container || !('IntersectionObserver' in window)) {
    // Fallback: seedha load karo
    container?.querySelectorAll('[data-poster]').forEach(el => {
      // ✅ FIX (FE-ISSUE-003, minor): a poster URL containing a single
      // quote would break the url('...') syntax here — this is a CSS
      // property assignment, not innerHTML, so it's a functional bug
      // (image fails to load) rather than an injection vector, but
      // el.style.backgroundImage accepts a CSS <url()> value directly
      // without needing manual string quoting at all.
      el.style.backgroundImage = `url(${JSON.stringify(el.dataset.poster)})`;
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el  = entry.target;
        const src = el.dataset.poster;
        if (src) {
          // Smooth image appear
          el.style.transition      = 'opacity 0.4s ease';
          el.style.opacity         = '0';
          // ✅ FIX (FE-ISSUE-003, minor): same JSON.stringify() quoting
          // fix as the fallback path above.
          el.style.backgroundImage = `url(${JSON.stringify(src)})`;
          el.removeAttribute('data-poster');
          // Micro-delay se fade in
          requestAnimationFrame(() => {
            el.style.opacity = '1';
          });
        }
        observer.unobserve(el);
      }
    });
  }, { rootMargin: '120px' });

  container.querySelectorAll('[data-poster]').forEach(el => observer.observe(el));
}

// ============================================================
// RENDER CARD — Shared card HTML template (XSS-safe)
// ============================================================

/**
 * Ek movie card ka HTML return karta hai
 * Lazy loading + event delegation ready
 * ✅ FIX (FE-ISSUE-003): title AND poster now both go through
 * escapeHtml() — poster (used in a data-* attribute) was previously
 * completely unescaped.
 */
export function renderCardHTML(item, extraStyle = '') {
  const slug   = encodeURIComponent(item.slug || '');
  const title  = escapeHtml(item.title || '');
  const poster = escapeHtml(item.poster || '');

  return `
    <div
      class="movie-card"
      data-slug="${slug}"
      data-poster="${poster}"
      style="background:#1a1f2e;${extraStyle}"
    >
      <span class="card-title">${title}</span>
    </div>
  `;
}

/**
 * Grid mein event delegation setup karo
 * Sabhi card clicks handle karta hai (XSS-safe)
 */
export function initCardClicks(container, urlBuilder) {
  if (!container) return;
  container.addEventListener('click', (e) => {
    const card = e.target.closest('[data-slug]');
    if (!card) return;
    const slug = decodeURIComponent(card.dataset.slug);
    window.location.href = urlBuilder
      ? urlBuilder(slug)
      : `details.html?slug=${encodeURIComponent(slug)}`;
  });
}

// ============================================================
// PAGINATION — Central function (saare pages use karen)
// ============================================================

/**
 * Pagination render karo
 * @param {Element}  navEl       - Pagination container element
 * @param {number}   page        - Current page number
 * @param {number}   total       - Total items count
 * @param {Function} onPageChange - (page) => void callback
 * @param {number}   perPage     - Items per page (default 20)
 */
export function renderPaginationShared(navEl, page, total, onPageChange, perPage = 20) {
  if (!navEl) return;

  const totalPages = Math.ceil((total || 0) / perPage);
  if (totalPages <= 1) { navEl.innerHTML = ''; return; }

  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, start + 4);

  let html = `<button ${page === 1 ? 'disabled' : ''} data-pg="${page - 1}">Prev</button>`;

  for (let p = start; p <= end; p++) {
    html += `<button class="${p === page ? 'active' : ''}" data-pg="${p}">${p}</button>`;
  }

  html += `<button ${page === totalPages ? 'disabled' : ''} data-pg="${page + 1}">Next</button>`;

  navEl.innerHTML = html;

  // Event delegation (no inline onclick = no XSS risk)
  navEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-pg]');
    if (!btn || btn.disabled) return;
    const pg = parseInt(btn.dataset.pg);
    if (pg >= 1 && pg <= totalPages) {
      onPageChange(pg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, { once: true }); // once: true — re-render pe naya listener lagega
}
