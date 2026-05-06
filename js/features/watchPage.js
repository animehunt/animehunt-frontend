import {
  getAnimeBySlug,
  getEpisodes,
  getServers,
  api
} from "../core/api.js";

import {
  $,
  setHTML,
  setText,
  loading,
  empty,
  error,
  image,
  getQuery,
  go
} from "../core/utils.js";

import {
  initSeasonManager
} from "./seasonManager.js";

import {
  loadRelatedAnime
} from "./relatedAnime.js";

import {
  renderDownloadButtons
} from "./downloadManager.js";

import {
  addToHistory
} from "./historyManager.js";

import {
  startResumeTracking,
  stopResumeTracking,
  getResumeData
} from "./resumeManager.js";

import {
  initServerManager
} from "./serverManager.js";

import {
  startAutoNext,
  stopAutoNext
} from "./autoNext.js";

/* ======================================================
   WATCH PAGE
====================================================== */

let animeData = null;

let allEpisodes = [];

let currentEpisodeIndex = 0;

let currentServers = [];

let playerConfig = null;

/* ======================================================
   INIT
====================================================== */

export async function initWatchPage() {

  const slug = getQuery("slug");

  const epId = getQuery("ep");

  if (!slug) {

    document.body.innerHTML =
      "<h2 style='padding:20px'>Invalid Watch URL</h2>";

    return;
  }

  await loadAnime(slug, epId);
}

/* ======================================================
   LOAD ANIME
====================================================== */

async function loadAnime(slug, epId) {

  try {

    const data =
      await getAnimeBySlug(slug);

    if (!data) {

      document.body.innerHTML =
        "<h2 style='padding:20px'>Anime Not Found</h2>";

      return;
    }

    animeData = data;

    renderAnime(data);

    await loadEpisodes(data.id, epId);

    loadRelatedAnime(data);

  } catch (err) {

    console.error(err);

    document.body.innerHTML =
      "<h2 style='padding:20px'>Failed To Load</h2>";
  }
}

/* ======================================================
   RENDER ANIME
====================================================== */

function renderAnime(data) {

  setHTML(
    $("#aboutList"),

    `
      <li>
        <b>Language:</b>
        ${data.language || "-"}
      </li>

      <li>
        <b>Duration:</b>
        ${data.duration || "-"}
      </li>

      <li>
        <b>Genres:</b>
        ${(data.genres || []).join(", ")}
      </li>
    `
  );

  setText(
    $("#aboutDesc"),
    data.description || ""
  );
}

/* ======================================================
   LOAD EPISODES
====================================================== */

async function loadEpisodes(animeId, epId) {

  const grid = $("#episodeGrid");

  if (!grid) return;

  loading(grid, "Loading Episodes...");

  try {

    allEpisodes =
      await getEpisodes(animeId);

    if (!allEpisodes.length) {

      empty(grid, "No episodes available");

      return;
    }

    /* CURRENT */

    if (epId) {

      currentEpisodeIndex =
        allEpisodes.findIndex(
          ep => String(ep.id) === String(epId)
        );

    } else {

      const resume =
        getResumeData(animeData.slug);

      if (resume) {

        currentEpisodeIndex =
          allEpisodes.findIndex(
            ep =>
              String(ep.id) ===
              String(resume.episodeId)
          );
      }
    }

    if (currentEpisodeIndex < 0) {
      currentEpisodeIndex = 0;
    }

    /* SEASON */

    initSeasonManager({

      episodes: allEpisodes,

      defaultSeason:
        allEpisodes[currentEpisodeIndex]?.season || "1",

      render: renderEpisodes
    });

    /* PLAYER */

    await loadCurrentEpisode();

  } catch (err) {

    console.error(err);

    error(grid, "Failed to load episodes");
  }
}

/* ======================================================
   LOAD CURRENT EPISODE
====================================================== */

async function loadCurrentEpisode() {

  stopResumeTracking();

  stopAutoNext();

  const current =
    allEpisodes[currentEpisodeIndex];

  if (!current) return;

  try {

    /* SERVERS */

    currentServers =
      await getServers(current.id);

    if (!currentServers.length) {

      empty(
        $("#serverList"),
        "No servers available"
      );

      return;
    }

    /* PLAYER CONFIG */

    const cfg =
      await api("/admin/player");

    playerConfig = cfg || {};

    /* SERVERS */

    initServerManager({

      list: currentServers,

      config: playerConfig,

      onChange: () => {

        addToHistory({

          anime: animeData,

          episode: current
        });
      }
    });

    /* DOWNLOAD */

    renderDownloadButtons({

      animeSlug: animeData.slug,

      currentEpisode: current,

      playerConfig
    });

    /* RESUME */

    startResumeTracking({

      anime: animeData,

      episode: current,

      iframe: $("#iframe-embed")
    });

    /* AUTONEXT */

    setupAutoNext();

  } catch (err) {

    console.error(err);

    empty(
      $("#serverList"),
      "Failed to load servers"
    );
  }
}

/* ======================================================
   AUTO NEXT
====================================================== */

function setupAutoNext() {

  const iframe = $("#iframe-embed");

  if (!iframe) return;

  iframe.onload = () => {

    stopAutoNext();

    /* MOCK VIDEO END */

    clearTimeout(window.__AUTO_NEXT__);

    window.__AUTO_NEXT__ =
      setTimeout(() => {

        if (
          currentEpisodeIndex + 1 <
          allEpisodes.length
        ) {

          startAutoNext({

            onNext: nextEpisode
          });
        }

      }, 1000 * 60 * 20);
  };
}

/* ======================================================
   NEXT
====================================================== */

function nextEpisode() {

  if (
    currentEpisodeIndex + 1 >=
    allEpisodes.length
  ) return;

  currentEpisodeIndex++;

  loadCurrentEpisode();

  renderEpisodes(
    allEpisodes.filter(
      ep =>
        String(ep.season || "1") ===
        String(
          allEpisodes[currentEpisodeIndex]
            ?.season || "1"
        )
    )
  );
}

/* ======================================================
   RENDER EPISODES
====================================================== */

function renderEpisodes(list = []) {

  const grid = $("#episodeGrid");

  if (!grid) return;

  if (!list.length) {

    empty(grid, "No episodes");

    return;
  }

  setHTML(
    grid,

    list.map(ep => {

      const active =
        allEpisodes[currentEpisodeIndex]
          ?.id === ep.id;

      return `
      
        <div
          class="ep-card ${
            active ? "active" : ""
          }"
          data-id="${ep.id}"
        >

          <div class="ep-thumb">

            <img
              src="${image(ep.thumbnail)}?tr=w-300,h-180"
              loading="lazy"
            >

            <span class="ep-no">
              EP ${ep.episode}
            </span>

          </div>

          <p>
            ${ep.title || `Episode ${ep.episode}`}
          </p>

        </div>
      
      `;

    }).join("")
  );

  /* CLICK */

  grid.onclick = (e) => {

    const card =
      e.target.closest(".ep-card");

    if (!card) return;

    const id = card.dataset.id;

    const index =
      allEpisodes.findIndex(
        ep => String(ep.id) === String(id)
      );

    if (index < 0) return;

    currentEpisodeIndex = index;

    loadCurrentEpisode();

    history.replaceState(
      null,
      "",
      `watch.html?slug=${animeData.slug}&ep=${id}`
    );
  };
}
