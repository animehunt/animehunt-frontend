import {
  getWatchHistory
} from "./watchHistory.js";

import {
  go,
  image
} from "../core/utils.js";

/* ======================================================
   INIT
====================================================== */

export function initContinueWatching() {

  const section =
    document.getElementById(
      "continueSection"
    );

  const scroll =
    document.getElementById(
      "continueScroll"
    );

  if (!section || !scroll) return;

  const history =
    getWatchHistory();

  if (!history.length) {

    section.style.display = "none";

    return;
  }

  section.style.display = "block";

  render(history, scroll);
}

/* ======================================================
   RENDER
====================================================== */

function render(list, container) {

  container.innerHTML =
    list.map(item => {

      return `

        <div
          class="movie-card continue-card"
          data-slug="${item.slug}"
          data-ep="${item.episodeId}"
        >

          <div class="thumb">

            <img
              src="${image(item.poster)}?tr=w-300,h-450"
              loading="lazy"
            >

          </div>

          <div class="info">

            <h4>
              ${item.animeTitle}
            </h4>

            <small>
              EP ${item.episodeNo}
            </small>

          </div>

        </div>

      `;

    }).join("");

  /* CLICK */

  container.onclick = (e) => {

    const card =
      e.target.closest(
        ".continue-card"
      );

    if (!card) return;

    go(
      `watch.html?slug=${card.dataset.slug}&ep=${card.dataset.ep}`
    );
  };
}
