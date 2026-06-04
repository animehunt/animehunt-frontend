// ============================================================
// js/features/download.js
// download.html — quality links + episode list
// ============================================================

import { fetchDetails, fetchEpisodes, fetchDownloadLinks } from '../api.js';
import { getParam } from '../utils.js';

export async function initDownload() {
  const slug   = getParam('slug');
  const season = parseInt(getParam('season') || '1');
  const ep     = parseInt(getParam('ep')     || '1');
  if (!slug) return;

  try {
    const anime    = await fetchDetails(slug);
    const episodes = await fetchEpisodes(anime.id, season);
    const currentEp = episodes.find(e => e.number === ep) || episodes[0];

    // Hero section
    renderDownloadHero(anime, season, ep);

    // Quality links
    if (currentEp) {
      const links = await fetchDownloadLinks(currentEp.id);
      renderQualityLinks(links, anime.slug, season, ep);
    }

    // Episode list (season ke saare episodes)
    renderEpisodeLinks(episodes, anime, season);

  } catch (err) {
    console.error('Download page error:', err);
  }
}

// ============================================================
// HERO
// ============================================================
function renderDownloadHero(anime, season, ep) {
  // Backdrop
  const backdrop = document.querySelector('.download-backdrop');
  if (backdrop) {
    backdrop.style.backgroundImage = `url('${anime.banner || anime.poster}')`;
  }

  // Poster
  const posterImg = document.querySelector('.poster img');
  if (posterImg) {
    posterImg.src = anime.poster;
    posterImg.alt = anime.title;
  }

  // Title
  const titleEl = document.querySelector('.dl-title, .download-title, h1');
  if (titleEl) titleEl.textContent = anime.title;

  // Meta
  const metaEl = document.querySelector('.dl-meta, .download-meta, .meta');
  if (metaEl) {
    metaEl.innerHTML = `
      <span>${anime.year || ''}</span>
      <span>⭐ ${anime.rating || ''}</span>
      <span>Season ${season} • Episode ${ep}</span>
    `;
  }

  // Page title
  document.title = `Download ${anime.title} – AnimeHunt`;
}

// ============================================================
// QUALITY LINKS
// ============================================================
function renderQualityLinks(links, slug, season, ep) {
  const container = document.querySelector('.quality-list, #qualityLinks, .dl-links');
  if (!container) return;

  if (!links || links.length === 0) {
    container.innerHTML = '<p style="color:#666;font-size:12px;">No download links available.</p>';
    return;
  }

  container.innerHTML = links.map(link => `
    <div style="
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:12px 16px;
      background:#111827;
      border:1px solid #1e2a3a;
      border-radius:8px;
      margin-bottom:8px;
    ">
      <span style="font-size:13px;color:#fff;">
        ${link.quality || 'HD'} — ${link.size || ''}
      </span>
      <button
        onclick="handleDownloadClick('${link.sessionId || link.url}', '${slug}', ${season}, ${ep})"
        style="
          background:#ffcc00;
          border:none;
          color:#000;
          padding:6px 14px;
          border-radius:6px;
          font-size:12px;
          font-weight:bold;
          cursor:pointer;
        "
      >⬇ Download</button>
    </div>
  `).join('');
}

// Global function (onclick mein use hota hai)
window.handleDownloadClick = function(sessionId, slug, season, ep) {
  if (sessionId.startsWith('http')) {
    // Direct link — go.html se redirect
    const params = new URLSearchParams({ url: sessionId, slug, season, ep });
    window.location.href = `go.html?${params}`;
  } else {
    // Session ID — backend se validate
    window.location.href = `go.html?session=${sessionId}`;
  }
};

// ============================================================
// EPISODE LIST
// ============================================================
function renderEpisodeLinks(episodes, anime, season) {
  const container = document.querySelector('.ep-list, #episodeLinks, .episode-download-list');
  if (!container || !episodes?.length) return;

  container.innerHTML = `
    <h3 style="font-size:15px;margin-bottom:12px;padding:0 16px;">All Episodes</h3>
    ${episodes.map(ep => `
      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:10px 16px;
        border-bottom:1px solid #1e2a3a;
      ">
        <span style="font-size:12px;color:#ccc;">Episode ${ep.number}${ep.title ? ' – ' + ep.title : ''}</span>
        <button
          onclick="location.href='download.html?slug=${anime.slug}&season=${season}&ep=${ep.number}'"
          style="
            background:transparent;
            border:1px solid #ffcc00;
            color:#ffcc00;
            padding:4px 10px;
            border-radius:5px;
            font-size:11px;
            cursor:pointer;
          "
        >Download</button>
      </div>
    `).join('')}
  `;
}
