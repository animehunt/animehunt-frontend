// ============================================================
// js/features/watch.js
// watch.html — video player, server list, episodes
// ============================================================

import { fetchDetails, fetchEpisodes, fetchServers, fetchDownloadLinks, fetchRelated } from '../api.js';
import { saveWatchProgress, getParam, showEpSkeletons, showRelSkeletons, lazyLoadCards, escapeHtml } from '../utils.js';

export async function initWatch() {
  const slug   = getParam('slug');
  const season = parseInt(getParam('season') || '1');
  const ep     = parseInt(getParam('ep')     || '1');

  if (!slug) return;

  // Episode grid skeleton immediately dikhao
  showEpSkeletons(document.getElementById('episodeGrid'), 8);
  showRelSkeletons(document.getElementById('relatedGrid'), 4);

  try {
    // ✅ FIX (FE-ISSUE-007): unwrap every {success, data} envelope —
    // apiFetch() returns the raw response body, never the anime object /
    // episodes array / servers array directly. Without this, episodes.find()
    // and every array method below throws, silently caught by the outer
    // catch, leaving the whole page blank.
    const animeResp = await fetchDetails(slug);
    const anime      = animeResp?.data || animeResp;
    if (!anime?.id) return;

    const episodesResp = await fetchEpisodes(anime.id, season);
    const episodes      = episodesResp?.data || [];
    const currentEp      = episodes.find(e => e.number === ep) || episodes[0];

    // About section
    renderAbout(anime);

    // Page title
    document.title = `Watch ${anime.title} S${season}E${ep} – AnimeHunt`;

    // Servers
    if (currentEp) {
      const [serversResp, linksResp] = await Promise.all([
        fetchServers(currentEp.id),
        fetchDownloadLinks(currentEp.id)
      ]);
      const servers = serversResp?.data || [];
      const links    = linksResp?.data   || [];
      renderServerList(servers, anime, season, ep);
      renderDownloadBox(links, anime.slug, season, ep);
      saveWatchProgress(slug, season, ep, anime.poster, anime.title);
    }

    // Episode grid + season dropdown
    renderEpisodeGrid(episodes, anime.slug, season);
    // ✅ FIX (FE-ISSUE-005): backend field is season_count, not totalSeasons
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
// EPISODE GRID — watch.html ke liye local version
// ============================================================
function renderEpisodeGrid(episodes, slug, season) {
  const grid = document.getElementById('episodeGrid');
  if (!grid) return;

  if (!episodes || episodes.length === 0) {
    grid.innerHTML = '<p style="color:#666;font-size:12px;padding:10px;grid-column:1/-1;">No episodes found.</p>';
    return;
  }

  const safeSlug = encodeURIComponent(slug || '');

  // ✅ FIX (FE-ISSUE-003): title and thumbnail now both go through
  // escapeHtml() — thumbnail (a src attribute) was previously unescaped.
  grid.innerHTML = episodes.map(ep => `
    <div class="ep-card"
      data-slug="${safeSlug}"
      data-season="${season}"
      data-ep="${ep.number}"
      style="cursor:pointer;">
      <div class="ep-thumb">
        <img src="${escapeHtml(ep.thumbnail || '')}"
             alt="EP ${ep.number}"
             loading="lazy"
             onerror="this.style.display='none'">
        <div class="ep-no">EP ${ep.number}</div>
      </div>
      <p>${escapeHtml(ep.title || 'Episode ' + ep.number)}</p>
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
    // ✅ FIX (FE-ISSUE-003): r.value was completely unescaped — this is
    // admin-entered data (type/status/language/genres/year, all set via
    // the admin panel's anime.js), not raw public user input, but nothing
    // here enforced that assumption, and it's cheap to close regardless.
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
// SERVER LIST
// ============================================================
function renderServerList(servers, anime, season, ep) {
  const serverList = document.getElementById('serverList');
  const iframe     = document.getElementById('iframe-embed');
  const msgBox     = document.getElementById('player-message');
  if (!serverList || !iframe) return;

  if (!servers || servers.length === 0) {
    serverList.innerHTML = '<p style="color:#666;font-size:12px;padding:10px;">No servers available.</p>';
    if (msgBox) {
      msgBox.innerHTML = 'Server not working 😢 <br><br> Please switch server';
      msgBox.style.display = 'flex';
    }
    return;
  }

  // Pehla server load karo
  loadServer(servers[0], iframe, msgBox);

  serverList.innerHTML = `
    <div class="ps-list-container">
      <div class="ps__-title">Select Server:</div>
      <div class="ps__-list">
        ${servers.map((s, i) => `
          <div class="item ${i === 0 ? 'active' : ''}" data-index="${i}">
            <div class="btn">${escapeHtml(s.name || 'Server ' + (i + 1))}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Server switch
  serverList.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', () => {
      serverList.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      loadServer(servers[parseInt(item.dataset.index)], iframe, msgBox);
    });
  });
}

function loadServer(server, iframe, msgBox) {
  const src = server?.embed || server?.url;
  if (!src) return;
  // ✅ FIX (FE-ISSUE-003, defense-in-depth): only allow http(s) schemes
  // into the iframe src. This is admin-entered data (adminServers.js on
  // the backend), not raw public input, so this isn't directly
  // exploitable by an anonymous visitor — but it's a cheap guard against
  // a compromised admin account or a future data-entry mistake turning
  // into a javascript: URL executing here.
  if (!/^https?:\/\//i.test(src)) return;
  if (msgBox) msgBox.style.display = 'none';
  iframe.src = src;
}

// ============================================================
// DOWNLOAD BOX
// ============================================================
function renderDownloadBox(links, slug, season, ep) {
  const box = document.getElementById('downloadBox');
  if (!box || !links?.length) return;

  const safeSlug = encodeURIComponent(slug);
  box.innerHTML = links.map(link => {
    const quality = escapeHtml(link.quality || 'Download');
    return `
      <button class="download"
        data-slug="${safeSlug}"
        data-season="${season}"
        data-ep="${ep}"
        style="margin-right:6px;">
        ⬇ ${quality}
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
  const nextEp = episodes.find(e => e.number === currentEp + 1);
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
      window.location.href = `watch.html?slug=${encodeURIComponent(slug)}&season=${season}&ep=${nextEp.number}`;
    }
  }, 1000);

  // Page unload pe timer clear (memory leak fix)
  window.addEventListener('pagehide', () => clearInterval(timer), { once: true });

  // Click pe cancel
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
