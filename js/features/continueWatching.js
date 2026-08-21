// ============================================================
// js/features/continueWatching.js
// Continue Watching — localStorage helper
// home.js aur historyPage.js dono ye use karte hain
// ============================================================

import { escapeHtml } from '../utils.js';

const KEY_CONTINUE = 'ah_continue';
const MAX_ITEMS    = 20;

// ============================================================
// SAVE — Watch page se call karo
// ============================================================
export function saveContinueWatching(anime, season, ep) {
  const list = getContinueList();

  // Duplicate hata do
  const filtered = list.filter(i => i.slug !== anime.slug);

  // Nayi entry sabse aage
  const entry = {
    slug:   anime.slug,
    title:  anime.title,
    poster: anime.poster,
    season: season || 1,
    ep:     ep || 1,
    ts:     Date.now()
  };

  filtered.unshift(entry);

  // Max limit
  localStorage.setItem(KEY_CONTINUE, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
}

// ============================================================
// GET LIST
// ============================================================
export function getContinueList() {
  try {
    return JSON.parse(localStorage.getItem(KEY_CONTINUE) || '[]');
  } catch {
    return [];
  }
}

// ============================================================
// CLEAR
// ============================================================
export function clearContinueWatching() {
  localStorage.removeItem(KEY_CONTINUE);
}

// ============================================================
// RENDER — Home page ki continue watching row
// ============================================================
// ✅ FIX (audit Issue 6): this row previously had no click handler and
// no data-slug at all (confirmed via grep — only clearBtn had a
// listener), and item.poster was inserted raw into a single-quoted CSS
// url() with no escaping (every sibling file in this codebase —
// heroSlider.js, download.js, listing.js — correctly uses
// JSON.stringify() for this exact purpose). The result: cards on the
// homepage's Continue Watching row were unclickable and had no title
// text, so a user could see they had something in progress but
// couldn't tell what it was or resume it — defeating the point of the
// feature. historyPage.js's version of this same feature (reading the
// same localStorage key) already does this correctly; this brings
// renderContinueRow() in line with that working pattern.
export function renderContinueRow() {
  const section  = document.getElementById('continueSection');
  const scroll   = document.getElementById('continueScroll');
  const clearBtn = document.getElementById('clearContinueBtn');
  if (!section || !scroll) return;

  const list = getContinueList();

  if (list.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  scroll.innerHTML = list.map(item => {
    const slug   = encodeURIComponent(item.slug || '');
    const title  = escapeHtml(item.title || '');
    const s      = item.season || 1;
    const ep     = item.ep || 1;
    return `
    <div
      class="movie-card"
      data-slug="${slug}"
      data-season="${s}"
      data-ep="${ep}"
      style="
        background-image: url(${JSON.stringify(item.poster || '')});
        background-size: cover;
        background-position: center;
        min-width: 22%;
        aspect-ratio: 2/3;
        border-radius: 10px;
        display: flex;
        align-items: flex-end;
        padding: 8px;
        cursor: pointer;
        flex-shrink: 0;
        position: relative;
        transition: transform .3s ease, box-shadow .3s ease;
      "
      
      onmouseover="this.style.transform='translateY(-5px) scale(1.04)'"
      onmouseout="this.style.transform=''"
    >
      <!-- Progress badge -->
      <span style="
        background: rgba(52,152,219,0.85);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        color: #fff;
        position: relative;
        z-index: 1;
      ">S${s} EP${ep}</span>
      <span style="
        position: absolute;
        left: 8px;
        right: 8px;
        bottom: 30px;
        font-size: 11px;
        color: #fff;
        background: rgba(0,0,0,0.6);
        padding: 2px 5px;
        border-radius: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      ">${title}</span>
    </div>
  `;
  }).join('');

  if (!scroll._ci) {
    scroll._ci = true;
    scroll.addEventListener('click', e => {
      const c = e.target.closest('[data-slug]');
      if (c) location.href = `watch.html?slug=${c.dataset.slug}&season=${c.dataset.season}&ep=${c.dataset.ep}`;
    });
  }

  // Clear button
  clearBtn?.addEventListener('click', () => {
    clearContinueWatching();
    section.style.display = 'none';
  });
}
