// ============================================================
// js/features/download.js
// download.html — quality links + episode list
// HTML: <body data-page="download">
// ============================================================

import { fetchDetails, fetchEpisodes, fetchDownloadLinks } from '../api.js';
import { getParam, showSkeletons }                         from '../utils.js';

export async function initDownload() {
  const slug   = getParam('slug');
  const season = parseInt(getParam('season') || '1');
  const ep     = parseInt(getParam('ep')     || '1');
  if (!slug) return;

  // Skeleton dikhao jab tak data aaye
  showSkeletons(document.querySelector('.quality-list, #qualityLinks'), 3);

  try {
    const anime      = await fetchDetails(slug);
    const episodes   = await fetchEpisodes(anime.id, season);
    const currentEp  = episodes.find(e => e.number === ep) || episodes[0];

    renderDownloadHero(anime, season, ep);

    if (currentEp) {
      const links = await fetchDownloadLinks(currentEp.id);
      renderQualityLinks(links, anime.slug, season, ep);
    }

    renderEpisodeLinks(episodes, anime, season);

  } catch (err) {
    console.error('Download page error:', err);
  }
}

// ============================================================
// HERO
// ============================================================
function renderDownloadHero(anime, season, ep) {
  const backdrop = document.querySelector('.download-backdrop');
  if (backdrop) {
    backdrop.style.backgroundImage = `url('${anime.banner || anime.poster}')`;
  }

  const posterImg = document.querySelector('.poster img');
  if (posterImg) {
    posterImg.src = anime.poster;
    posterImg.alt = (anime.title || '').replace(/"/g, '&quot;');
  }

  const titleEl = document.querySelector('.dl-title, .download-title, h1');
  if (titleEl) titleEl.textContent = anime.title || '';

  const metaEl = document.querySelector('.dl-meta, .download-meta, .meta');
  if (metaEl) {
    metaEl.innerHTML = `
      <span>${anime.year || ''}</span>
      <span class="imdb">⭐ ${anime.rating || 'N/A'}</span>
      <span>Season ${season} • Episode ${ep}</span>
    `;
  }

  document.title = `Download ${anime.title} – AnimeHunt`;
}

// ============================================================
// QUALITY LINKS — XSS-safe, event delegation
// ============================================================
function renderQualityLinks(links, slug, season, ep) {
  const container = document.querySelector('.quality-list, #qualityLinks, .dl-links');
  if (!container) return;

  if (!links || links.length === 0) {
    container.innerHTML = '<p style="color:#666;font-size:12px;padding:12px;">No download links available.</p>';
    return;
  }

  const safeSlug = encodeURIComponent(slug);

  container.innerHTML = links.map((link, idx) => {
    const quality    = (link.quality || 'HD').replace(/</g, '&lt;');
    const size       = (link.size    || '').replace(/</g, '&lt;');
    const sessionId  = encodeURIComponent(link.sessionId || link.url || '');
    return `
      <div class="quality-row"
        style="
          display:flex;align-items:center;justify-content:space-between;
          padding:12px 16px;background:#111827;border:1px solid #1e2a3a;
          border-radius:8px;margin-bottom:8px;
          transition: border-color 0.2s ease;
        "
        onmouseenter="this.style.borderColor='#ffcc00'"
        onmouseleave="this.style.borderColor='#1e2a3a'"
      >
        <span style="font-size:13px;color:#fff;">
          ${quality}${size ? ' — ' + size : ''}
        </span>
        <button
          class="dl-btn"
          data-session="${sessionId}"
          data-slug="${safeSlug}"
          data-season="${season}"
          data-ep="${ep}"
          style="
            background:#ffcc00;border:none;color:#000;
            padding:7px 16px;border-radius:6px;font-size:12px;
            font-weight:bold;cursor:pointer;
            transition:transform 0.15s ease, box-shadow 0.15s ease;
          "
          onmouseenter="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 12px rgba(255,204,0,0.4)'"
          onmouseleave="this.style.transform='';this.style.boxShadow=''"
        >⬇ Download</button>
      </div>
    `;
  }).join('');

  // Event delegation — no inline onclick = XSS-safe
  container.addEventListener('click', e => {
    const btn = e.target.closest('.dl-btn');
    if (!btn) return;

    const sessionId = decodeURIComponent(btn.dataset.session);
    const slug      = btn.dataset.slug;
    const s         = btn.dataset.season;
    const ep        = btn.dataset.ep;

    if (sessionId.startsWith('http')) {
      const params = new URLSearchParams({ url: sessionId, slug, season: s, ep });
      window.location.href = `go.html?${params}`;
    } else {
      window.location.href = `go.html?session=${encodeURIComponent(sessionId)}`;
    }
  });
}

// ============================================================
// EPISODE LIST — XSS-safe, event delegation
// ============================================================
function renderEpisodeLinks(episodes, anime, season) {
  const container = document.querySelector('.ep-list, #episodeLinks, .episode-download-list');
  if (!container || !episodes?.length) return;

  const safeSlug = encodeURIComponent(anime.slug || '');

  container.innerHTML = `
    <h3 style="font-size:15px;margin-bottom:12px;padding:0 16px;">All Episodes — Season ${season}</h3>
    <div id="epLinkRows">
      ${episodes.map(ep => {
        const epTitle = (ep.title || '').replace(/</g, '&lt;');
        return `
          <div class="ep-link-row"
            data-slug="${safeSlug}"
            data-season="${season}"
            data-ep="${ep.number}"
            style="
              display:flex;align-items:center;justify-content:space-between;
              padding:10px 16px;border-bottom:1px solid #1a1f2e;cursor:pointer;
              transition: background 0.15s ease;
            "
            onmouseenter="this.style.background='rgba(255,204,0,0.05)'"
            onmouseleave="this.style.background=''"
          >
            <span style="font-size:12px;color:#ccc;">
              Episode ${ep.number}${epTitle ? ' – ' + epTitle : ''}
            </span>
            <span style="
              border:1px solid #ffcc00;color:#ffcc00;
              padding:4px 10px;border-radius:5px;font-size:11px;
              flex-shrink:0;margin-left:8px;
            ">Download</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Event delegation
  container.querySelector('#epLinkRows').addEventListener('click', e => {
    const row = e.target.closest('.ep-link-row');
    if (row) {
      window.location.href = `download.html?slug=${row.dataset.slug}&season=${row.dataset.season}&ep=${row.dataset.ep}`;
    }
  });
}
