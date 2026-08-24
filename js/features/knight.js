// ============================================================
// js/features/knight.js
// knight.html — quality selection page
// Host ID se quality links fetch karo
// ============================================================

import { BASE } from '../config.js';
import { escapeHtml } from '../utils.js';

const params  = new URLSearchParams(location.search);
const hostId  = params.get('host_id');
const anime   = params.get('anime');
const season  = params.get('season');
const episode = params.get('episode');

// ============================================================
// QUALITY METADATA
// ============================================================
const QUALITY_META = {
  '4K':    { icon: '💎', details: '3840×2160 · Ultra HD',    res: 'res-4K',    size: '~8–15 GB',    recommended: false },
  '1080p': { icon: '🎬', details: '1920×1080 · Full HD',     res: 'res-1080p', size: '~1.5–4 GB',   recommended: false },
  '720p':  { icon: '📺', details: '1280×720  · HD Ready',    res: 'res-720p',  size: '~700 MB–1.5 GB', recommended: true },
  '480p':  { icon: '📱', details: '854×480   · Standard',    res: 'res-480p',  size: '~300–600 MB', recommended: false },
  '360p':  { icon: '⚡', details: '640×360   · Low Quality', res: 'res-360p',  size: '~150–300 MB', recommended: false }
};

// ============================================================
// ANALYTICS
// ============================================================
async function track(event_type, extra = {}) {
  try {
    await fetch(`${BASE}/api/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type,
        event_data: JSON.stringify({ host_id: hostId, anime, season, episode, ...extra })
      })
    });
  } catch {}
}

// ============================================================
// LOAD DATA
// ============================================================
async function loadKnightData() {
  const list = document.getElementById('qualityList');
  if (!list) return;

  try {
    const r = await fetch(`${BASE}/api/knight-data?host_id=${encodeURIComponent(hostId || '')}`);
    const j = await r.json();

    if (!j.success || !j.data?.qualities?.length) {
      list.innerHTML = `
        <div style="
          background:#0d1020;border:1px solid #ff444422;border-radius:10px;
          padding:16px;color:#ff6b6b;font-size:13px;text-align:center;
        ">
          ⚠️ No quality links found. Please go back and try another host.
        </div>`;
      return;
    }

    renderQualities(j.data);
    loadAnimeInfo(j.data);
    track('knight_page_view');

  } catch (err) {
    console.error('Knight load error:', err);
    if (list) list.innerHTML = `
      <div style="
        background:#0d1020;border:1px solid #ff444422;border-radius:10px;
        padding:16px;color:#ff6b6b;font-size:13px;text-align:center;
      ">
        ⚠️ Failed to load. Please try again.
      </div>`;
  }
}

// ============================================================
// ANIME INFO
// ============================================================
function loadAnimeInfo(data) {
  const epInfo   = document.getElementById('epInfo');
  const nameEl   = document.getElementById('animeName');
  const metaEl   = document.getElementById('epMeta');
  const posterEl = document.getElementById('posterEl');

  if (!epInfo || !nameEl) return;

  nameEl.textContent = data.anime_title || decodeURIComponent(anime || 'Unknown Anime');

  const parts = [];
  if (season)           parts.push(`Season ${season}`);
  if (episode)          parts.push(`Episode ${episode}`);
  if (data.episode_title) parts.push(data.episode_title);
  if (metaEl) metaEl.textContent = parts.join(' · ');

  if (data.poster && posterEl) {
    const img = document.createElement('img');
    img.src = data.poster;
    img.alt = 'poster';
    img.style.width  = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    posterEl.textContent = '';
    posterEl.appendChild(img);
  }

  epInfo.style.display = 'flex';
}

// ============================================================
// QUALITY BUTTONS — XSS-safe, event delegation
// ============================================================
function renderQualities(data) {
  const list = document.getElementById('qualityList');
  if (!list) return;

  const qs = data.qualities || [];

  const order  = ['4K', '1080p', '720p', '480p', '360p'];
  const sorted = [...qs].sort((a, b) => order.indexOf(a.quality) - order.indexOf(b.quality));

  list.innerHTML = sorted.map((q, idx) => {
    const meta  = QUALITY_META[q.quality] || {
      icon: '📥', details: 'Download',
      res: '', size: '', recommended: false
    };
    const isRec = meta.recommended;
    const safeQ = escapeHtml(q.quality);
    const link  = encodeURIComponent(q.link || '');

    return `
      <div class="quality-btn ${meta.res}${isRec ? ' recommended' : ''}"
        data-link="${link}"
        data-quality="${safeQ}"
        tabindex="0"
        role="button"
        style="cursor:pointer;"
      >
        <div class="qb-left">
          <span class="qb-icon">${meta.icon}</span>
          <div>
            <div class="qb-quality">${safeQ}</div>
            <div class="qb-details">${meta.details}</div>
          </div>
        </div>
        <div class="qb-right">
          ${isRec ? '<span class="rec-badge">⭐ Recommended</span>' : ''}
          <span class="size-badge">${meta.size}</span>
          <span class="qb-arrow">›</span>
        </div>
      </div>
    `;
  }).join('');

  // Event delegation — no inline onclick = XSS-safe
  list.addEventListener('click', e => {
    const btn = e.target.closest('[data-link]');
    if (!btn) return;
    const quality = btn.dataset.quality;
    const link    = decodeURIComponent(btn.dataset.link);
    
    // URL protocol validation to prevent javascript: or data: URIs
    if (!/^https?:\/\//i.test(link)) return;
    
    track('knight_download', { quality });
    window.location.href = link;
  });

  // Keyboard support
  list.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const btn = e.target.closest('[data-link]');
      if (btn) btn.click();
    }
  });
}

// ============================================================
// INIT
// ============================================================
loadKnightData();
