// ============================================================
// js/features/historyPage.js
// history.html — watch history + continue watching
// ============================================================

import { lazyLoadCards } from '../utils.js';

export function initHistoryPage() {
  renderContinueWatching();
  renderWatchHistory();

  document.getElementById('clearHistory')?.addEventListener('click', () => {
    localStorage.removeItem('ah_history');
    localStorage.removeItem('ah_continue');
    const hg = document.getElementById('historyGrid');
    const cg = document.getElementById('continueGrid');
    if (hg) hg.innerHTML = '<p style="color:#555;font-size:12px;grid-column:1/-1;">No watch history.</p>';
    if (cg) cg.innerHTML = '<p style="color:#555;font-size:12px;grid-column:1/-1;">Nothing here yet.</p>';
  });
}

// ============================================================
// CONTINUE WATCHING
// ============================================================
function renderContinueWatching() {
  const grid = document.getElementById('continueGrid');
  if (!grid) return;

  let items = [];
  try { items = JSON.parse(localStorage.getItem('ah_continue') || '[]'); } catch {}

  if (items.length === 0) {
    grid.innerHTML = '<p style="color:#555;font-size:12px;grid-column:1/-1;">Nothing here yet.</p>';
    return;
  }

  grid.innerHTML = items.map(item => {
    const slug  = encodeURIComponent(item.slug || '');
    const title = (item.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const s     = item.season || 1;
    const ep    = item.ep || 1;
    return `
      <div class="card"
        data-slug="${slug}"
        data-season="${s}"
        data-ep="${ep}"
        data-poster="${item.poster || ''}"
        style="background:#1a1f2e;">
        <span style="color:#ffcc00;font-size:10px;font-weight:bold;">S${s} EP${ep}</span>
        <span style="color:#ccc;font-size:10px;margin-top:2px;">${title}</span>
      </div>`;
  }).join('');

  lazyLoadCards(grid);

  grid.addEventListener('click', e => {
    const c = e.target.closest('[data-slug]');
    if (c) location.href = `watch.html?slug=${c.dataset.slug}&season=${c.dataset.season}&ep=${c.dataset.ep}`;
  });
}

// ============================================================
// WATCH HISTORY
// ============================================================
function renderWatchHistory() {
  const grid = document.getElementById('historyGrid');
  if (!grid) return;

  let items = [];
  try { items = JSON.parse(localStorage.getItem('ah_history') || '[]'); } catch {}

  if (items.length === 0) {
    grid.innerHTML = '<p style="color:#555;font-size:12px;grid-column:1/-1;">No watch history.</p>';
    return;
  }

  grid.innerHTML = items.map(item => {
    const slug  = encodeURIComponent(item.slug || '');
    const title = (item.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
      <div class="card"
        data-slug="${slug}"
        data-poster="${item.poster || ''}"
        style="background:#1a1f2e;">
        <span style="color:#fff;font-size:10px;background:rgba(0,0,0,0.6);padding:2px 4px;border-radius:3px;">${title}</span>
      </div>`;
  }).join('');

  lazyLoadCards(grid);

  grid.addEventListener('click', e => {
    const c = e.target.closest('[data-slug]');
    if (c) location.href = `details.html?slug=${c.dataset.slug}`;
  });
}
