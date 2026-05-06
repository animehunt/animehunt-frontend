import {
  $,
  setHTML,
  sortEpisodes
} from "../core/utils.js";

/* ======================================================
   SEASON MANAGER
====================================================== */

let allEpisodes = [];

let currentSeason = "1";

let onRender = null;

/* ================= INIT ================= */

export function initSeasonManager({

  episodes = [],

  defaultSeason = "1",

  render

}) {

  allEpisodes = sortEpisodes(episodes);

  currentSeason = defaultSeason;

  onRender = render;

  renderSeasonDropdown();

  renderEpisodes();
}

/* ================= GET CURRENT ================= */

export function getCurrentSeason() {
  return currentSeason;
}

/* ================= GET FILTERED ================= */

export function getFilteredEpisodes() {

  if (currentSeason === "ALL") {
    return allEpisodes;
  }

  return allEpisodes.filter(
    ep => String(ep.season || "1") === String(currentSeason)
  );
}

/* ================= DROPDOWN ================= */

function renderSeasonDropdown() {

  const seasonBtn = $("#seasonBtn");
  const allBtn = $("#allBtn");
  const seasonList = $("#seasonList");

  if (!seasonBtn || !seasonList) return;

  const seasons = [
    ...new Set(
      allEpisodes.map(
        ep => String(ep.season || "1")
      )
    )
  ];

  setHTML(
    seasonList,

    seasons.map(season => `
      <div data-season="${season}">
        Season ${season}
      </div>
    `).join("")
  );

  updateSeasonButton();

  /* TOGGLE */

  seasonBtn.onclick = () => {

    seasonList.style.display =
      seasonList.style.display === "block"
        ? "none"
        : "block";
  };

  /* ALL */

  if (allBtn) {

    allBtn.onclick = () => {

      currentSeason = "ALL";

      updateSeasonButton();

      renderEpisodes();

      seasonList.style.display = "none";
    };
  }

  /* SELECT */

  seasonList.onclick = (e) => {

    const item = e.target.closest("[data-season]");

    if (!item) return;

    currentSeason = item.dataset.season;

    updateSeasonButton();

    renderEpisodes();

    seasonList.style.display = "none";
  };
}

/* ================= UPDATE BTN ================= */

function updateSeasonButton() {

  const seasonBtn = $("#seasonBtn");

  if (!seasonBtn) return;

  if (currentSeason === "ALL") {

    seasonBtn.innerText = "ALL EPISODES";

  } else {

    seasonBtn.innerText =
      `SEASON ${currentSeason}`;
  }
}

/* ================= RENDER ================= */

function renderEpisodes() {

  if (typeof onRender !== "function") return;

  onRender(getFilteredEpisodes());
}
