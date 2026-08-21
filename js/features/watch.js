// ============================================================
// js/features/watch.js
// watch.html — video player, server list, episodes
// ============================================================

import { fetchDetails, fetchEpisodes, fetchServers, fetchDownloadLinks, fetchRelated } from '../api.js';
import { saveWatchProgress, getParam, showEpSkeletons, showRelSkeletons, lazyLoadCards, escapeHtml, updateMetaTags } from '../utils.js';

export async function initWatch() {
  const slug   = getParam('slug');
  const season = parseInt(getParam('season') || '1');
  const ep     = parseInt(getParam('ep')     || '1');

  if (!slug) return;

  // Episode grid skeleton immediately dikhao
  showEpSkeletons(document.getElementById('episodeGrid'), 8);
  showRelSkeletons(document.getElementById('relatedGrid'), 4);

  try {
    const animeResp = await fetchDetails(slug);
    const anime      = animeResp?.data || animeResp;
    if (!anime?.id) return;

    const episodesResp = await fetchEpisodes(anime.id, season);
    const episodes      = episodesResp?.data || [];
    const currentEp      = episodes.find(e => e.episode === ep) || episodes[0];

    // About section
    renderAbout(anime);

    // Page title + SEO meta tags (og:title/description/image, canonical) —
    // same shared helper details.html uses, closing the parity gap this
    // page previously had (title-only, no OG tags at all).
    const epTitleForMeta = currentEp?.title ? ` – ${currentEp.title}` : '';
    updateMetaTags({
      title:       `Watch ${anime.title} S${season}E${ep}${epTitleForMeta} – AnimeHunt`,
      description: currentEp?.description || anime.description || '',
      image:       currentEp?.thumbnail || anime.poster || '',
      url:         `${location.origin}/watch.html?slug=${encodeURIComponent(anime.slug || '')}&season=${season}&ep=${ep}`,
      ogType:      'video.episode'
    });

    // Servers & Links
    if (currentEp) {
      const [serversResp, linksResp] = await Promise.all([
        fetchServers(currentEp.id),
        fetchDownloadLinks(currentEp.id)
      ]);
      const servers = serversResp?.data || [];
      const hostEntries = linksResp?.data || [];

      renderServerList(servers, anime, season, ep);

      renderDownloadBox(hostEntries, anime.slug, season, ep);
      saveWatchProgress(slug, season, ep, anime.poster, anime.title);
    }

    // Episode grid + season dropdown
    renderEpisodeGrid(episodes, anime.slug, season);
    renderSeasonDropdown(anime.season_count || 1, anime, season);

    // Related
    const relatedResp = await fetchRelated(anime.id);
    const related       = relatedResp?.data || [];
    renderRelated(related);

    // Auto next
    setupAutoNext(episodes, ep, anime.slug, season);

  } catch (err) {
    console.error('Watch page error:', err);
  }
}

// ============================================================
// SERVER LIST & PLAYER
// ============================================================
// ✅ FIX (audit Issue 7 -- most severe bug found in this phase): this
// used to call GET /api/player/jw-config/:episodeId, which does not
// exist anywhere on the backend (verified against every route file),
// and target #jw-player-container, which does not exist anywhere in
// watch.html either (verified directly) -- so this function silently
// exited on every single page load, before even reaching the broken
// fetch, and the video player never initialized for anyone. The real,
// working servers array (fetched correctly via fetchServers(), shape
// confirmed against the actual backend: {id,name,embed,type,priority})
// was being fetched and then thrown away unused. This rebuilds server
// switching against the real data and the real #iframe-embed /
// #player-message elements that were already sitting in watch.html.
let currentServers = [];

function renderServerList(servers, anime, season, ep) {
  const serverList = document.getElementById('serverList');
  const iframe      = document.getElementById('iframe-embed');
  const msgBox      = document.getElementById('player-message');

  if (!serverList || !iframe) return;

  currentServers = (servers || []).filter(s => s?.embed);

  if (!currentServers.length) {
    serverList.innerHTML = '<p style="color:#666;font-size:12px;padding:10px;">No servers available.</p>';
    iframe.src = '';
    if (msgBox) {
      msgBox.innerHTML = 'Server not working 😢 <br><br> Please switch server';
      msgBox.style.display = 'flex';
    }
    return;
  }

  // Servers are already ordered by priority ASC from the backend —
  // build one button per server, XSS-safe (escapeHtml + event delegation,
  // matching the pattern used throughout the rest of this codebase).
  serverList.innerHTML = currentServers.map((s, idx) => `
    <button
      class="server-btn${idx === 0 ? ' active' : ''}"
      data-idx="${idx}"
      style="
        background:${idx === 0 ? '#ffcc00' : '#1a1f2e'};
        color:${idx === 0 ? '#000' : '#ccc'};
        border:1px solid #2a3244;border-radius:6px;
        padding:8px 14px;margin:0 6px 6px 0;font-size:12px;
        font-weight:bold;cursor:pointer;
      "
    >${escapeHtml(s.name || `Server ${idx + 1}`)}</button>
  `).join('');

  if (!serverList._ci) {
    serverList._ci = true;
    serverList.addEventListener('click', e => {
      const btn = e.target.closest('.server-btn');
      if (!btn) return;
      const idx = parseInt(btn.dataset.idx, 10);
      serverList.querySelectorAll('.server-btn').forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.style.background = active ? '#ffcc00' : '#1a1f2e';
        b.style.color      = active ? '#000'    : '#ccc';
      });
      loadServer(idx, iframe, msgBox);
    });
  }

  loadServer(0, iframe, msgBox);
}

function loadServer(idx, iframe, msgBox) {
  const server = currentServers[idx];
  if (!server?.embed) return;

  if (msgBox) {
    msgBox.innerHTML = 'Loading server…';
    msgBox.style.display = 'flex';
  }

  // iframe/m3u8/mp4/dash servers all embed the same way for this player
  // shell (a direct src assignment) — the backend's own type constraint
  // (servers.type IN iframe/m3u8/mp4/dash) covers playback-source
  // format, not how the frontend mounts it.
  iframe.onload = () => { if (msgBox) msgBox.style.display = 'none'; };
  iframe.onerror = () => {
    if (msgBox) {
      msgBox.innerHTML = 'Stream temporarily unavailable. <br><br> Please try another server.';
      msgBox.style.display = 'flex';
    }
  };
  iframe.src = server.embed;
}

// ============================================================
// EPISODE GRID
// ============================================================
function renderEpisodeGrid(episodes, slug, season) {
  const grid = document.getElementById('episodeGrid');
  if (!grid) return;

  if (!episodes || episodes.length === 0) {
    grid.innerHTML = '<p style="color:#666;font-size:12px;padding:10px;grid-column:1/-1;">No episodes found.</p>';
    return;
  }

  const safeSlug = encodeURIComponent(slug || '');

  grid.innerHTML = episodes.map(ep => `
    <div class="ep-card"
      data-slug="${safeSlug}"
      data-season="${season}"
      data-ep="${ep.episode}"
      style="cursor:pointer;">
      <div class="ep-thumb">
        <img src="${escapeHtml(ep.thumbnail || '')}"
             alt="EP ${ep.episode}"
             loading="lazy"
             onerror="this.style.display='none'">
        <div class="ep-no">EP ${ep.episode}</div>
      </div>
      <p>${escapeHtml(ep.title || 'Episode ' + ep.episode)}</p>
    </div>
  `).join('');

  grid.addEventListener('click', e => {
    const card = e.target.closest('[data-slug]');
    if (card) {
      location.href = `watch.html?slug=${card.dataset.slug}&season=${card.dataset.season}&ep=${card.dataset.ep}`;
    }
  });
}

// ============================================================
// ABOUT
// ============================================================
function renderAbout(anime) {
  const list   = document.getElementById('aboutList');
  const descEl = document.getElementById('aboutDesc');

  if (list) {
    const rows = [
      { label: 'Type',     value: anime.type },
      { label: 'Status',   value: anime.status },
      { label: 'Language', value: anime.language },
      { label: 'Genres',   value: (anime.genres || []).join(', ') },
      { label: 'Year',     value: anime.year },
    ];
    
    list.innerHTML = rows
      .filter(r => r.value)
      .map(r => `
        <li>
          <strong style="color:#ccc">${escapeHtml(r.label)}:</strong>
          <span style="color:#fff; margin-left:6px;">${escapeHtml(String(r.value))}</span>
        </li>
      `).join('');
  }

  if (descEl) descEl.textContent = anime.description || '';
}

// ============================================================
// DOWNLOAD BOX
// ============================================================
function renderDownloadBox(hostEntries, slug, season, ep) {
  const box = document.getElementById('downloadBox');
  if (!box || !hostEntries?.length) return;

  const safeSlug = encodeURIComponent(slug);

  // Flatten to one row per distinct quality across all hosts (first host
  // offering that quality wins) — this is a compact widget on the watch
  // page, not the full host-by-host breakdown download.html shows.
  const seen = new Set();
  const flat = [];
  for (const host of hostEntries) {
    for (const link of (host.links || [])) {
      const q = link.quality || 'Download';
      if (seen.has(q)) continue;
      seen.add(q);
      flat.push(q);
    }
  }

  box.innerHTML = flat.map(quality => {
    const q = escapeHtml(quality);
    return `
      <button class="download"
        data-slug="${safeSlug}"
        data-season="${season}"
        data-ep="${ep}"
        style="margin-right:6px;">
        ⬇ ${q}
      </button>`;
  }).join('');

  box.addEventListener('click', e => {
    const btn = e.target.closest('button[data-slug]');
    if (btn) location.href = `download.html?slug=${btn.dataset.slug}&season=${btn.dataset.season}&ep=${btn.dataset.ep}`;
  });
}

// ============================================================
// SEASON DROPDOWN
// ============================================================
async function renderSeasonDropdown(totalSeasons, anime, activeSeason) {
  const seasonBtn  = document.getElementById('seasonBtn');
  const seasonList = document.getElementById('seasonList');
  if (!seasonBtn || !seasonList) return;

  seasonBtn.textContent = `SEASON ${activeSeason}`;

  const seasons = Array.from({ length: totalSeasons }, (_, i) => i + 1);
  seasonList.innerHTML = seasons.map(s =>
    `<div data-season="${s}">Season ${s}</div>`
  ).join('');

  seasonBtn.addEventListener('click', () => {
    const open = seasonList.style.display === 'block';
    seasonList.style.display = open ? 'none' : 'block';
    seasonBtn.classList.toggle('active', !open);
  });

  seasonList.querySelectorAll('div').forEach(div => {
    div.addEventListener('click', () => {
      seasonList.style.display = 'none';
      window.location.href = `watch.html?slug=${encodeURIComponent(anime.slug)}&season=${div.dataset.season}&ep=1`;
    });
  });
}

// ============================================================
// AUTO NEXT EPISODE
// ============================================================
function setupAutoNext(episodes, currentEp, slug, season) {
  const nextEp = episodes.find(e => e.episode === currentEp + 1);
  if (!nextEp) return;

  const box       = document.getElementById('autoNextBox');
  const countdown = document.getElementById('countdown');
  if (!box || !countdown) return;

  let secs = 5;
  box.style.display = 'block';
  countdown.textContent = secs;

  const timer = setInterval(() => {
    secs--;
    countdown.textContent = secs;
    if (secs <= 0) {
      clearInterval(timer);
      window.location.href = `watch.html?slug=${encodeURIComponent(slug)}&season=${season}&ep=${nextEp.episode}`;
    }
  }, 1000);

  window.addEventListener('pagehide', () => clearInterval(timer), { once: true });

  box.addEventListener('click', () => {
    clearInterval(timer);
    box.style.display = 'none';
  });
}

// ============================================================
// RELATED
// ============================================================
function renderRelated(related) {
  const grid = document.getElementById('relatedGrid');
  if (!grid || !related?.length) return;

  grid.innerHTML = related.map(item => {
    const slug   = encodeURIComponent(item.slug || '');
    const title  = escapeHtml(item.title || '');
    const poster = escapeHtml(item.poster || '');
    return `
      <div class="rel-card" data-slug="${slug}" data-poster="${poster}" style="background:#1a1f2e;">
        <span style="background:rgba(0,0,0,0.6);padding:2px 5px;border-radius:4px;font-size:10px;color:#fff;">${title}</span>
      </div>`;
  }).join('');

  lazyLoadCards(grid);

  grid.addEventListener('click', e => {
    const c = e.target.closest('[data-slug]');
    if (c) location.href = `details.html?slug=${c.dataset.slug}`;
  });
}
