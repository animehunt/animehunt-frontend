// ============================================================
// js/features/details.js
// details.html — anime/movie details page
// ============================================================

import { fetchDetails, fetchEpisodes, fetchRelated } from '../api.js';
import { saveToHistory, getParam }                   from '../utils.js';

export async function initDetails() {
  const slug = getParam('slug');
  if (!slug) return;

  try {
    // ---- Anime data fetch ----
    const anime = await fetchDetails(slug);
    if (!anime) return;

    renderHero(anime);
    renderAbout(anime);
    saveToHistory(anime);

    // ---- Episodes ----
    const episodes = await fetchEpisodes(anime.id, 1);
    renderEpisodeGrid(episodes, anime.slug, 1);
    renderSeasonDropdown(anime.totalSeasons || 1, anime);

    // ---- Related ----
    const related = await fetchRelated(anime.id);
    renderRelated(related);

    // ---- Buttons ----
    setupActionButtons(anime, episodes);

  } catch (err) {
    console.error('Details load error:', err);
  }
}

// ============================================================
// HERO SECTION
// ============================================================
function renderHero(anime) {
  const heroBg    = document.getElementById('heroBg');
  const posterImg = document.getElementById('posterImg');
  const titleEl   = document.getElementById('animeTitle');
  const metaEl    = document.getElementById('animeMeta');
  const descEl    = document.getElementById('animeDesc');

  if (heroBg) {
    heroBg.style.backgroundImage    = `url('${anime.banner || anime.poster}')`;
    heroBg.style.backgroundSize     = 'cover';
    heroBg.style.backgroundPosition = 'center';
  }

  if (posterImg) {
    posterImg.src = anime.poster;
    posterImg.alt = anime.title;
  }

  if (titleEl) {
    titleEl.innerHTML =
      `${anime.title} <span>(${anime.year || ''})</span>`;
  }

  if (metaEl) {
    metaEl.innerHTML = `
      <span>${anime.year || ''}</span>
      <span class="imdb">⭐ ${anime.rating || 'N/A'}</span>
      <span>${anime.type || ''}</span>
      <span>${anime.language || ''}</span>
    `;
  }

  if (descEl) {
    descEl.textContent = anime.description || '';
  }

  // Page title
  document.title = `${anime.title} – AnimeHunt`;
}

// ============================================================
// ABOUT SECTION
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
      { label: 'Episodes', value: anime.totalEpisodes },
      { label: 'Seasons',  value: anime.totalSeasons },
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

  if (descEl) {
    descEl.textContent = anime.description || '';
  }
}

// ============================================================
// EPISODE GRID
// ============================================================
export function renderEpisodeGrid(episodes, slug, season) {
  const grid = document.getElementById('episodeGrid');
  if (!grid) return;

  if (!episodes || episodes.length === 0) {
    grid.innerHTML = '<p style="color:#666;font-size:12px;padding:10px;">No episodes found.</p>';
    return;
  }

  grid.innerHTML = episodes.map(ep => `
    <div class="ep-card"
      onclick="location.href='watch.html?slug=${slug}&season=${season}&ep=${ep.number}'"
      style="cursor:pointer;"
    >
      <div class="ep-thumb">
        <img src="${ep.thumbnail || ''}"
             alt="EP ${ep.number}"
             onerror="this.style.display='none'">
        <div class="ep-no">EP ${ep.number}</div>
      </div>
      <p>${ep.title || 'Episode ' + ep.number}</p>
    </div>
  `).join('');
}

// ============================================================
// SEASON DROPDOWN
// ============================================================
function renderSeasonDropdown(totalSeasons, anime) {
  const seasonBtn  = document.getElementById('seasonBtn');
  const seasonList = document.getElementById('seasonList');
  const allBtn     = document.getElementById('allBtn');
  if (!seasonBtn || !seasonList) return;

  let currentSeason = 1;
  seasonBtn.textContent = 'SEASON 1';

  // Seasons list build karo
  const seasons = Array.from({ length: totalSeasons }, (_, i) => i + 1);

  seasonList.innerHTML = seasons.map(s =>
    `<div data-season="${s}">Season ${s}</div>`
  ).join('');

  // Toggle dropdown
  seasonBtn.addEventListener('click', () => {
    const open = seasonList.style.display === 'block';
    seasonList.style.display = open ? 'none' : 'block';
    seasonBtn.classList.toggle('active', !open);
  });

  // Season select
  seasonList.querySelectorAll('div').forEach(div => {
    div.addEventListener('click', async () => {
      currentSeason = parseInt(div.dataset.season);
      seasonBtn.textContent = `SEASON ${currentSeason}`;
      seasonBtn.classList.remove('active');
      seasonList.style.display = 'none';

      // New season episodes load karo
      const eps = await fetchEpisodes(anime.id, currentSeason);
      renderEpisodeGrid(eps, anime.slug, currentSeason);
    });
  });

  // All Episodes button
  allBtn?.addEventListener('click', async () => {
    const allEps = await fetchEpisodes(anime.id, 'all');
    renderEpisodeGrid(allEps, anime.slug, currentSeason);
    seasonList.style.display = 'none';
  });
}

// ============================================================
// RELATED ANIME
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

// ============================================================
// ACTION BUTTONS
// ============================================================
function setupActionButtons(anime, episodes) {
  const watchBtn    = document.querySelector('.actions .watch');
  const downloadBtn = document.querySelector('.actions .download');

  const firstEp = episodes?.[0]?.number || 1;

  watchBtn?.addEventListener('click', () => {
    window.location.href =
      `watch.html?slug=${anime.slug}&season=1&ep=${firstEp}`;
  });

  downloadBtn?.addEventListener('click', () => {
    window.location.href =
      `download.html?slug=${anime.slug}&season=1&ep=${firstEp}`;
  });
}
