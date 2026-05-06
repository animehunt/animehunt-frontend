import {
  getAnimeBySlug,
  getAnime,
  getEpisodes
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

/* ======================================================
   STATE
====================================================== */

let animeData = null;

let allEpisodes = [];

let currentSeason = "1";

/* ======================================================
   INIT
====================================================== */

export async function initDetailsPage() {

  const slug = getQuery("slug");

  if (!slug) {

    document.body.innerHTML =
      "<h2 style='padding:20px'>Invalid URL</h2>";

    return;
  }

  await loadAnime(slug);
}

/* ======================================================
   LOAD ANIME
====================================================== */

async function loadAnime(slug) {

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

    await loadEpisodes(data.id);

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

  /* HERO */

  const hero =
    $("#heroBg");

  if (hero) {

    hero.style.backgroundImage =
      `url(${image(data.banner)}?tr=w-1200,h-500)`;
  }

  /* POSTER */

  const poster =
    $("#posterImg");

  if (poster) {

    poster.src =
      `${image(data.poster)}?tr=w-300,h-450`;
  }

  /* TITLE */

  setHTML(
    $("#animeTitle"),

    `
      ${data.title}

      <span>
        (${data.year || ""})
      </span>
    `
  );

  /* META */

  setHTML(
    $("#animeMeta"),

    `
      <span>${data.type || "-"}</span>

      <span>${data.status || "-"}</span>

      <span class="imdb">
        ⭐ ${data.rating || "N/A"}
      </span>
    `
  );

  /* DESCRIPTION */

  setText(
    $("#animeDesc"),
    data.description || ""
  );

  /* ABOUT */

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

  /* WATCH */

  const watchBtn =
    document.querySelector(".watch");

  if (watchBtn) {

    watchBtn.onclick = () => {

      go(
        `watch.html?slug=${data.slug}`
      );
    };
  }

  /* DOWNLOAD */

  const downloadBtn =
    document.querySelector(".download");

  if (downloadBtn) {

    downloadBtn.onclick = () => {

      go(
        `download.html?anime=${encodeURIComponent(data.slug)}`
      );
    };
  }
}

/* ======================================================
   LOAD EPISODES
====================================================== */

async function loadEpisodes(animeId) {

  const grid =
    $("#episodeGrid");

  if (!grid) return;

  loading(grid, "Loading Episodes...");

  try {

    allEpisodes =
      await getEpisodes(animeId);

    if (!allEpisodes.length) {

      empty(
        grid,
        "No Episodes Available"
      );

      return;
    }

    currentSeason =
      allEpisodes[0]?.season || "1";

    /* SEASON MANAGER */

    initSeasonManager({

      episodes: allEpisodes,

      defaultSeason: currentSeason,

      render: renderEpisodes
    });

  } catch (err) {

    console.error(err);

    error(
      grid,
      "Failed To Load Episodes"
    );
  }
}

/* ======================================================
   RENDER EPISODES
====================================================== */

function renderEpisodes(list = []) {

  const grid =
    $("#episodeGrid");

  if (!grid) return;

  if (!list.length) {

    empty(grid, "No Episodes");

    return;
  }

  setHTML(
    grid,

    list.map(ep => {

      return `
      
        <div
          class="ep-card"
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

    const id =
      card.dataset.id;

    go(
      `watch.html?slug=${animeData.slug}&ep=${id}`
    );
  };
}
