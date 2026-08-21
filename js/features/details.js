// ============================================================
// js/features/details.js
// details.html — anime/movie details page
// ============================================================

import { fetchDetails, fetchEpisodes, fetchRelated } from '../api.js';
import { saveToHistory, getParam, showEpSkeletons, showRelSkeletons, lazyLoadCards, escapeHtml, updateMetaTags } from '../utils.js';

export async function initDetails() {
  const slug = getParam('slug');
  if (!slug) return;

  // Immediate skeletons
  showEpSkeletons(document.getElementById('episodeGrid'), 8);
  showRelSkeletons(document.getElementById('relatedGrid'), 4);

  try {
    // ✅ FIX (FE-ISSUE-004): unwrap the {success, data} envelope —
    // apiFetch() returns the raw response body, not the anime object
    // directly. Every field access below was reading undefined.
    const resp  = await fetchDetails(slug);
    const anime = resp?.data || resp;
    if (!anime?.id) return;

    renderHero(anime);
    renderAbout(anime);
    updateMetaTags({
      title:       `${anime.title} – AnimeHunt`,
      description: anime.description || '',
      image:       anime.poster || '',
      url:         `${location.origin}/details.html?slug=${encodeURIComponent(anime.slug || '')}`,
      ogType:      'video.episode'
    });
    saveToHistory(anime);

    // ✅ FIX (FE-ISSUE-007): unwrap the episodes array envelope too.
    const episodesResp = await fetchEpisodes(anime.id, 1);
    const episodes       = episodesResp?.data || [];
    renderEpisodeGrid(episodes, anime.slug, 1);
    // ✅ FIX (FE-ISSUE-005): backend field is season_count, not totalSeasons
    renderSeasonDropdown(anime.season_count || 1, anime);

    const relatedResp = await fetchRelated(anime.id);
    const related       = relatedResp?.data || [];
    renderRelated(related);

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
    // ✅ FIX (FE-ISSUE-003, minor): JSON.stringify() for safe CSS url()
    // quoting — a poster/banner URL containing a single quote would
    // otherwise break the url('...') syntax.
    heroBg.style.backgroundImage    = `url(${JSON.stringify(anime.banner || anime.poster || '')})`;
    heroBg.style.backgroundSize     = 'cover';
    heroBg.style.backgroundPosition = 'center';
  }

  if (posterImg) {
    posterImg.src = anime.poster || '';
    // ✅ FIX (FE-ISSUE-003): full escapeHtml() instead of only escaping "
    posterImg.alt = escapeHtml(anime.title || '');
  }

  if (titleEl) {
    // ✅ FIX (FE-ISSUE-003): full escapeHtml() — was only escaping <
    const year  = anime.year ? ` <span>(${escapeHtml(String(anime.year))})</span>` : '';
    titleEl.innerHTML = `${escapeHtml(anime.title || '')}${year}`;
  }

  if (metaEl) {
    // ✅ FIX (FE-ISSUE-003): all four fields were completely unescaped
    metaEl.innerHTML = `
      <span>${escapeHtml(String(anime.year || ''))}</span>
      <span class="imdb">⭐ ${escapeHtml(String(anime.rating || 'N/A'))}</span>
      <span>${escapeHtml(anime.type || '')}</span>
      <span>${escapeHtml(anime.language || '')}</span>
    `;
  }

  if (descEl) descEl.textContent = anime.description || '';

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
      // ✅ FIX (FE-ISSUE-005): backend fields are episode_count/season_count
      { label: 'Episodes', value: anime.episode_count },
      { label: 'Seasons',  value: anime.season_count },
      { label: 'Year',     value: anime.year },
    ];
    // ✅ FIX (FE-ISSUE-003): full escapeHtml() on r.value — was unescaped
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
// EPISODE GRID — exported so watch.js bhi use kar sake
// ============================================================
export function renderEpisodeGrid(episodes, slug, season) {
  const grid = document.getElementById('episodeGrid');
  if (!grid) return;

  if (!episodes || episodes.length === 0) {
    grid.innerHTML = '<p style="color:#666;font-size:12px;padding:10px;grid-column:1/-1;">No episodes found.</p>';
    return;
  }

  const safeSlug = encodeURIComponent(slug || '');

  // ✅ FIX (FE-ISSUE-003): thumbnail (src attribute) and title now both
  // go through escapeHtml() — thumbnail was previously fully unescaped.
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

  // Event delegation
  grid.addEventListener('click', e => {
    const card = e.target.closest('[data-slug]');
    if (card) {
      location.href = `watch.html?slug=${card.dataset.slug}&season=${card.dataset.season}&ep=${card.dataset.ep}`;
    }
  });
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
      showEpSkeletons(document.getElementById('episodeGrid'), 8);
      // ✅ FIX (FE-ISSUE-007): unwrap the {success, data} envelope
      const epsResp = await fetchEpisodes(anime.id, currentSeason);
      const eps       = epsResp?.data || [];
      renderEpisodeGrid(eps, anime.slug, currentSeason);
    });
  });

  // All Episodes button
  allBtn?.addEventListener('click', async () => {
    showEpSkeletons(document.getElementById('episodeGrid'), 12);
    // ✅ FIX (FE-ISSUE-007): same unwrap
    const allEpsResp = await fetchEpisodes(anime.id, 'all');
    const allEps       = allEpsResp?.data || [];
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

  // ✅ FIX (FE-ISSUE-003): full escapeHtml() on both title and poster —
  // poster (used in a data-* attribute) was previously unescaped.
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

// ============================================================
// ACTION BUTTONS
// ============================================================
function setupActionButtons(anime, episodes) {
  const watchBtn    = document.querySelector('.actions .watch');
  const downloadBtn = document.querySelector('.actions .download');
  const firstEp     = episodes?.[0]?.episode || 1;
  const safeSlug    = encodeURIComponent(anime.slug || '');

  watchBtn?.addEventListener('click', () => {
    window.location.href = `watch.html?slug=${safeSlug}&season=1&ep=${firstEp}`;
  });

  downloadBtn?.addEventListener('click', () => {
    window.location.href = `download.html?slug=${safeSlug}&season=1&ep=${firstEp}`;
  });
}
