import {
  getWatchHistory,
  clearWatchHistory
} from "./watchHistory.js";

import {
  getResume,
  clearResume
} from "./resumeManager.js";

import {
  image,
  go
} from "../core/utils.js";

/* ======================================================
   INIT
====================================================== */

init();

function init() {

  renderContinue();

  renderHistory();

  bindClear();
}

/* ======================================================
   CONTINUE
====================================================== */

function renderContinue() {

  const container =
    document.getElementById(
      "continueGrid"
    );

  if (!container) return;

  const resume =
    getResume();

  if (!resume) {

    container.innerHTML =
      `
        <p style="color:#777">
          No Resume Data
        </p>
      `;

    return;
  }

  container.innerHTML = `

    <div
      class="card continue-card"
      data-slug="${resume.slug}"
      data-ep="${resume.episodeId}"
    >

      <img
        src="${image(resume.poster)}?tr=w-300,h-450"
        style="
          width:100%;
          aspect-ratio:2/3;
          object-fit:cover;
          border-radius:8px;
          margin-bottom:8px;
        "
      >

      <div>
        ${resume.animeTitle}
      </div>

      <small>
        EP ${resume.episodeNo}
      </small>

    </div>

  `;

  container.onclick = (e) => {

    const card =
      e.target.closest(".continue-card");

    if (!card) return;

    go(
      `watch.html?slug=${card.dataset.slug}&ep=${card.dataset.ep}`
    );
  };
}

/* ======================================================
   HISTORY
====================================================== */

function renderHistory() {

  const container =
    document.getElementById(
      "historyGrid"
    );

  if (!container) return;

  const history =
    getWatchHistory();

  if (!history.length) {

    container.innerHTML =
      `
        <p style="color:#777">
          No History
        </p>
      `;

    return;
  }

  container.innerHTML =
    history.map(item => {

      return `

        <div
          class="card history-card"
          data-slug="${item.slug}"
          data-ep="${item.episodeId}"
        >

          <img
            src="${image(item.poster)}?tr=w-300,h-450"
            style="
              width:100%;
              aspect-ratio:2/3;
              object-fit:cover;
              border-radius:8px;
              margin-bottom:8px;
            "
          >

          <div>
            ${item.animeTitle}
          </div>

          <small>
            Last EP ${item.episodeNo}
          </small>

        </div>

      `;

    }).join("");

  container.onclick = (e) => {

    const card =
      e.target.closest(".history-card");

    if (!card) return;

    go(
      `watch.html?slug=${card.dataset.slug}&ep=${card.dataset.ep}`
    );
  };
}

/* ======================================================
   CLEAR
====================================================== */

function bindClear() {

  const btn =
    document.getElementById(
      "clearHistory"
    );

  if (!btn) return;

  btn.onclick = () => {

    const ok =
      confirm(
        "Clear All History?"
      );

    if (!ok) return;

    clearWatchHistory();

    clearResume();

    renderContinue();

    renderHistory();
  };
}
