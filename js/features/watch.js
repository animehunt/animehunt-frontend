// ============================================================
// js/features/watch.js
// watch.html — video player, server list, episodes
// ============================================================

import { fetchDetails, fetchEpisodes, fetchServers, fetchDownloadLinks } from '../api.js';
import { saveWatchProgress, getParam }                                   from '../utils.js';
import { renderEpisodeGrid }                                             from './details.js';

export async function initWatch() {
  const slug   = getParam('slug');
  const season = parseInt(getParam('season') || '1');
  const ep     = parseInt(getParam('ep')     || '1');

  if (!slug) return;

  try {
    // ---- Anime data ----
    const anime    = await fetchDetails(slug);
    const episodes = await fetchEpisodes(anime.id, season);

    // Current episode find karo
    const currentEp = episodes.find(e => e.number === ep) || episodes[0];

    // ---- About section ----
    renderAbout(anime);

    // ---- Servers ----
    if (currentEp) {
      const servers = await fetchServers(currentEp.id);
      renderServerList(servers, anime, season, ep);

      const links = await fetchDownloadLinks(currentEp.id);
      renderDownloadBox(links, anime.slug, season, ep);

      // Progress save karo
      saveWatchProgress(slug, season, ep, anime.poster, anime.title);
    }

    // ---- Episode grid ----
    renderEpisodeGrid(episodes, anime.slug, season);
    renderSeasonDropdown(anime.totalSeasons || 1, anime, season);

    // ---- Related ----
    const { fetchRelated } = await import('../api.js');
    const related = await fetchRelated(anime.id);
    renderRelated(related);

    // ---- Next episode auto ----
    setupAutoNext(episodes, ep, anime.slug, season);

  } catch (err) {
    console.error('Watch page error:', err);
  }
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
          <strong style="color:#ccc">${r.label}:</strong>
          <span style="color:#fff; margin-left:6px;">${r.value}</span>
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
            <div class="btn">${s.name || 'Server ' + (i + 1)}</div>
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
      const idx = parseInt(item.dataset.index);
      loadServer(servers[idx], iframe, msgBox);
    });
  });
}

function loadServer(server, iframe, msgBox) {
  if (!server?.url) return;
  if (msgBox) msgBox.style.display = 'none';
  iframe.src = server.url;
}

// ============================================================
// DOWNLOAD BOX
// ============================================================
function renderDownloadBox(links, slug, season, ep) {
  const box = document.getElementById('downloadBox');
  if (!box || !links?.length) return;

  box.innerHTML = links.map(link => `
    <button
      class="download"
      onclick="location.href='download.html?slug=${slug}&season=${season}&ep=${ep}'"
      style="margin-right:6px;"
    >
      ⬇ ${link.quality || 'Download'}
    </button>
  `).join('');
}

// ============================================================
// SEASON DROPDOWN (same as details.js logic)
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
      const s = div.dataset.season;
      seasonList.style.display = 'none';
      // Season 1 ep 1 pe jao
      window.location.href =
        `watch.html?slug=${anime.slug}&season=${s}&ep=1`;
    });
  });
}

// ============================================================
// AUTO NEXT EPISODE
// ============================================================
function setupAutoNext(episodes, currentEp, slug, season) {
  const nextEp  = episodes.find(e => e.number === currentEp + 1);
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
      window.location.href =
        `watch.html?slug=${slug}&season=${season}&ep=${nextEp.number}`;
    }
  }, 1000);

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

  grid.innerHTML = related.map(item => `
    <div class="rel-card"
      style="
        background-image:url('${item.poster}');
        background-size:cover;
        background-position:center;
        cursor:pointer;
      "
      onclick="location.href='details.html?slug=${item.slug}'"
    >
      <span style="
        background:rgba(0,0,0,0.6);
        padding:2px 5px;
        border-radius:4px;
        font-size:10px;
        color:#fff;
      ">${item.title}</span>
    </div>
  `).join('');
}
