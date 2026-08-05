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

    // Servers & Links
    if (currentEp) {
      const [serversResp, linksResp] = await Promise.all([
        fetchServers(currentEp.id),
        fetchDownloadLinks(currentEp.id)
      ]);
      const servers = serversResp?.data || [];
      const links   = linksResp?.data   || [];
      
      // Call new JW Player Integration
      renderServerList(servers, anime, season, ep);
      
      renderDownloadBox(links, anime.slug, season, ep);
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
// SERVER LIST & JW PLAYER INTEGRATION (DANGER ZONE)
// ============================================================
function renderServerList(servers, anime, season, ep) {
  const serverList = document.getElementById('serverList');
  const playerContainer = document.getElementById('jw-player-container');
  const msgBox = document.getElementById('player-message');
  
  if (!serverList || !playerContainer) return;

  // Assume currentEp id is passed correctly via servers array
  const currentEpId = servers.length > 0 ? servers[0].episode_id : null; 

  if (!currentEpId) {
    serverList.innerHTML = '<p style="color:#666;font-size:12px;padding:10px;">No servers available.</p>';
    if (msgBox) {
      msgBox.innerHTML = 'Server not working 😢 <br><br> Please switch server';
      msgBox.style.display = 'flex';
    }
    return;
  }

  // Hide old server buttons because JW Player will handle auto-switching (P1 -> P2 -> P3)
  serverList.style.display = 'none';

  loadJWPlayer(currentEpId, playerContainer, msgBox);
}

async function loadJWPlayer(episodeId, playerContainer, msgBox) {
  if (msgBox) {
    msgBox.innerHTML = 'Loading High-Speed Stream Engine...';
    msgBox.style.display = 'flex';
  }

  try {
    // 1. Fetch the P1/P2/P3 Payload & Ads Config from our new Backend Engine
    const res = await fetch(`/api/player/jw-config/${episodeId}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error || "Failed to load player config");

    if (msgBox) msgBox.style.display = 'none';

    // 2. Anti-Adblock Detection Logic
    let isAdBlockActive = false;
    try {
      // Dummy fetch to a known ad network to test adblocker
      await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', { mode: 'no-cors', cache: 'no-store' });
    } catch (e) {
      isAdBlockActive = true;
    }

    // 3. Ensure container is properly set up
    playerContainer.id = 'jw-player-container';

    // 4. Initialize JW Player
    const playerInstance = jwplayer('jw-player-container');
    playerInstance.setup(data.jwConfig);

    // 5. Fallback Display Banner (If AdBlock blocks VAST)
    if (isAdBlockActive && data.monetization && data.monetization.fallbackDisplayBanner) {
      playerInstance.on('ready', function() {
        const adContainer = document.createElement('div');
        adContainer.style.position = 'absolute';
        adContainer.style.bottom = '40px';
        adContainer.style.width = '100%';
        adContainer.style.textAlign = 'center';
        adContainer.style.zIndex = '9999';
        adContainer.innerHTML = data.monetization.fallbackDisplayBanner;
        document.getElementById('jw-player-container').appendChild(adContainer);
      });
    }

    // 6. Frequency Capped Popunder / Clickunder Logic
    if (data.monetization && data.monetization.frequencyCapping) {
      const POP_KEY = 'pop_count_session';
      const POP_TIME_KEY = 'pop_time_start';
      let popCount = parseInt(localStorage.getItem(POP_KEY)) || 0;
      let sessionStart = parseInt(localStorage.getItem(POP_TIME_KEY)) || Date.now();

      // Reset session if time window passed
      if (Date.now() - sessionStart > data.monetization.frequencyCapping.sessionWindowMins * 60 * 1000) {
        popCount = 0;
        localStorage.setItem(POP_TIME_KEY, Date.now().toString());
      }

      // Trigger on first play click
      playerInstance.on('firstFrame', function() {
        if (popCount < data.monetization.frequencyCapping.maxPopunders && data.monetization.popunderScript) {
          const scriptEl = document.createElement('script');
          scriptEl.innerHTML = data.monetization.popunderScript.replace(/<\/?script[^>]*>/gi, '');
          document.body.appendChild(scriptEl);
          
          localStorage.setItem(POP_KEY, (popCount + 1).toString());
        }
      });
    }

    // 7. Auto-Failover Logic
    playerInstance.on('setupError', function(e) {
       console.warn("P1 Stream failed, JW Player will automatically cascade to P2/P3 fallback sources.");
    });
    playerInstance.on('error', function(e) {
       console.warn("Playback error on current stream. Attempting next priority stream.");
    });

  } catch (err) {
    if (msgBox) {
      msgBox.innerHTML = `Stream temporarily unavailable. <br><br> ${err.message}`;
      msgBox.style.display = 'flex';
    }
  }
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
