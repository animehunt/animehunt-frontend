// ============================================================
// js/features/watch.js
// watch.html — JW PLAYER + IFRAME ENGINE (Dynamic API Integration)
// ============================================================

import { fetchDetails, fetchEpisodes, fetchServers, fetchDownloadLinks, fetchRelated } from '../api.js';
import { saveWatchProgress, getParam, showEpSkeletons, showRelSkeletons, lazyLoadCards, escapeHtml, updateMetaTags } from '../utils.js';

let currentEpId = null; // Track current episode ID for config fetching

export async function initWatch() {
  const slug   = getParam('slug');
  const season = parseInt(getParam('season') || '1');
  const ep     = parseInt(getParam('ep')     || '1');

  if (!slug) return;

  showEpSkeletons(document.getElementById('episodeGrid'), 8);
  showRelSkeletons(document.getElementById('relatedGrid'), 4);

  try {
    const animeResp = await fetchDetails(slug);
    const anime      = animeResp?.data || animeResp;
    if (!anime?.id) return;

    const episodesResp = await fetchEpisodes(anime.id, season);
    const episodes      = episodesResp?.data || [];
    const currentEp      = episodes.find(e => e.episode === ep) || episodes[0];
    
    if(currentEp) currentEpId = currentEp.id;

    renderAbout(anime);

    const epTitleForMeta = currentEp?.title ? ` – ${currentEp.title}` : '';
    updateMetaTags({
      title:       `Watch ${anime.title} S${season}E${ep}${epTitleForMeta} – AnimeHunt`,
      description: currentEp?.description || anime.description || '',
      image:       currentEp?.thumbnail || anime.poster || '',
      url:         `${location.origin}/watch.html?slug=${encodeURIComponent(anime.slug || '')}&season=${season}&ep=${ep}`,
      ogType:      'video.episode'
    });

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

    renderEpisodeGrid(episodes, anime.slug, season);
    renderSeasonDropdown(anime.season_count || 1, anime, season);

    const relatedResp = await fetchRelated(anime.id);
    const related       = relatedResp?.data || [];
    renderRelated(related);

    setupAutoNext(episodes, ep, anime.slug, season);

  } catch (err) {
    console.error('Watch page error:', err);
  }
}

// ============================================================
// THE MASTER ENGINE: SMART SERVER LIST & AUTO FALLBACK
// ============================================================
let currentServers = [];

function renderServerList(servers, anime, season, ep) {
  const serverList = document.getElementById('serverList');
  const msgBox     = document.getElementById('player-message');

  if (!serverList) return;

  // Sorting backend se priority ke hisaab se aa chuki hai
  currentServers = (servers || []).filter(s => s?.embed);

  if (!currentServers.length) {
    serverList.innerHTML = '<p style="color:#666;font-size:12px;padding:10px;">No servers available.</p>';
    if (msgBox) {
      msgBox.innerHTML = 'Server not working 😢 <br><br> Please switch server';
      msgBox.style.display = 'flex';
    }
    return;
  }

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
      switchServerUI(idx);
      loadServer(idx, msgBox);
    });
  }

  loadServer(0, msgBox);
}

function switchServerUI(idx) {
  const serverList = document.getElementById('serverList');
  if(!serverList) return;
  serverList.querySelectorAll('.server-btn').forEach(b => {
    const active = parseInt(b.dataset.idx, 10) === idx;
    b.classList.toggle('active', active);
    b.style.background = active ? '#ffcc00' : '#1a1f2e';
    b.style.color      = active ? '#000'    : '#ccc';
  });
}

// ============================================================
// DYNAMIC PLAYER INJECTION (JW Config API Integration)
// ============================================================
async function loadServer(idx, msgBox) {
  const server = currentServers[idx];
  if (!server?.embed) return;

  const iframe = document.getElementById('iframe-embed');
  const jwContainer = document.getElementById('jw-player-container');

  if (msgBox) msgBox.style.display = 'none';

  // RESET BOTH PLAYERS
  iframe.style.display = 'none';
  iframe.src = '';
  jwContainer.style.display = 'none';
  if (window.jwplayer && jwplayer("jw-player-container").getState) {
     jwplayer("jw-player-container").remove();
  }

  // SMART TOGGLE: Iframe vs API JSON Generated JW Player
  if (server.type === 'iframe') {
    iframe.style.display = 'block';
    iframe.src = server.embed;
    iframe.onerror = () => fallbackToNext(idx, msgBox);
  } else {
    jwContainer.style.display = 'block';
    
    try {
      // 1. Fetch Dynamic Backend JW Config (Hindi Multi-Audio & Ads schema)
      const res = await fetch(`/api/player/jw-config/${currentEpId}`);
      const data = await res.json();
      
      if(data.success && data.jwConfig) {
        const config = data.jwConfig;
        
        // Setup Player
        const player = jwplayer("jw-player-container").setup({
          playlist: config.playlist,
          autostart: config.autostart,
          cast: config.cast || {},
          advertising: config.advertising,
          width: "100%",
          height: "100%"
        });

        // 2. Custom Ads Control Layer Handling
        if(config.adsControlLayer) {
           handleAdsMonetization(config.adsControlLayer, player);
        }

        // 3. Fallback Engine (P2/P3 Scraper fallback)
        if(config.autoFailover && config.autoFailover.enabled) {
           player.on('setupError', () => fallbackToNext(idx, msgBox));
           player.on('error', () => fallbackToNext(idx, msgBox));
        }
      } else {
         throw new Error("Invalid Config API Payload");
      }
    } catch(e) {
      console.error("Player Init Failed, falling back...", e);
      fallbackToNext(idx, msgBox);
    }
  }
}

// ============================================================
// CUSTOM ADS CONTROL SYSTEM (Client-side execution)
// ============================================================
function handleAdsMonetization(adsLayer, playerInstance) {
   // 1. Anti Ad-Blocker Check
   if(adsLayer.antiAdBlock && adsLayer.antiAdBlock.enabled) {
      playerInstance.on('adBlock', () => {
         console.warn("Adblock detected! Executing fallback banner...");
         // Custom fallback logic could be appended to DOM here
      });
   }

   // 2. Popunder / Clickunder Engine with Frequency Capping
   if(adsLayer.clickunder && adsLayer.clickunder.enabled) {
      const storageKey = `popunder_cap_${new Date().toISOString().split('T')[0]}`;
      const clicksToday = parseInt(localStorage.getItem(storageKey)) || 0;
      
      const maxAllowed = adsLayer.frequencyCapping.maxPopunder || 2;

      if(clicksToday < maxAllowed) {
         const triggerPopunder = () => {
            window.open(adsLayer.clickunder.url, '_blank', 'noopener,noreferrer');
            localStorage.setItem(storageKey, clicksToday + 1);
            // Remove listener after trigger
            document.getElementById('jw-player-container').removeEventListener('click', triggerPopunder);
         };
         // Attach to first play click
         document.getElementById('jw-player-container').addEventListener('click', triggerPopunder);
      }
   }
}

// AUTO FALLBACK CASCADE (P1 -> P2 -> P3)
function fallbackToNext(currentIdx, msgBox) {
  const nextIdx = currentIdx + 1;
  if (nextIdx < currentServers.length) {
    switchServerUI(nextIdx);
    loadServer(nextIdx, msgBox);
  } else {
    if (msgBox) {
      msgBox.innerHTML = 'All servers failed to load. 😢 <br><br> Please try again later.';
      msgBox.style.display = 'flex';
    }
  }
}

// ============================================================
// EPISODE GRID, ABOUT, DOWNLOAD, RELATED & AUTO NEXT
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
    <div class="ep-card" data-slug="${safeSlug}" data-season="${season}" data-ep="${ep.episode}" style="cursor:pointer;">
      <div class="ep-thumb">
        <img src="${escapeHtml(ep.thumbnail || '')}" alt="EP ${ep.episode}" loading="lazy" onerror="this.style.display='none'">
        <div class="ep-no">EP ${ep.episode}</div>
      </div>
      <p>${escapeHtml(ep.title || 'Episode ' + ep.episode)}</p>
    </div>
  `).join('');

  grid.addEventListener('click', e => {
    const card = e.target.closest('[data-slug]');
    if (card) location.href = `watch.html?slug=${card.dataset.slug}&season=${card.dataset.season}&ep=${card.dataset.ep}`;
  });
}

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
    list.innerHTML = rows.filter(r => r.value).map(r => `
        <li>
          <strong style="color:#ccc">${escapeHtml(r.label)}:</strong>
          <span style="color:#fff; margin-left:6px;">${escapeHtml(String(r.value))}</span>
        </li>
      `).join('');
  }
  if (descEl) descEl.textContent = anime.description || '';
}

function renderDownloadBox(hostEntries, slug, season, ep) {
  const box = document.getElementById('downloadBox');
  if (!box || !hostEntries?.length) return;
  const safeSlug = encodeURIComponent(slug);
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
    return `<button class="download" data-slug="${safeSlug}" data-season="${season}" data-ep="${ep}" style="margin-right:6px;">⬇ ${q}</button>`;
  }).join('');

  box.addEventListener('click', e => {
    const btn = e.target.closest('button[data-slug]');
    if (btn) location.href = `download.html?slug=${btn.dataset.slug}&season=${btn.dataset.season}&ep=${btn.dataset.ep}`;
  });
}

async function renderSeasonDropdown(totalSeasons, anime, activeSeason) {
  const seasonBtn  = document.getElementById('seasonBtn');
  const seasonList = document.getElementById('seasonList');
  if (!seasonBtn || !seasonList) return;
  seasonBtn.textContent = `SEASON ${activeSeason}`;
  const seasons = Array.from({ length: totalSeasons }, (_, i) => i + 1);
  seasonList.innerHTML = seasons.map(s => `<div data-season="${s}">Season ${s}</div>`).join('');
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
