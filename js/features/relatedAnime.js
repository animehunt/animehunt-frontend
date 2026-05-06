import {
  getAnime
} from "../core/api.js";

import {
  $,
  setHTML,
  image,
  go
} from "../core/utils.js";

/* ======================================================
   LOAD RELATED
====================================================== */

export async function loadRelatedAnime(anime) {

  const grid =
    $("#relatedGrid");

  if (!grid) return;

  try {

    const res =
      await getAnime(
        `?type=${anime.type}&limit=8`
      );

    const list =
      res?.data || [];

    if (!list.length) {

      grid.style.display = "none";

      return;
    }

    /* REMOVE CURRENT */

    const filtered =
      list.filter(
        x => x.slug !== anime.slug
      );

    renderRelated(filtered);

  } catch (err) {

    console.error(err);

    grid.style.display = "none";
  }
}

/* ======================================================
   RENDER
====================================================== */

function renderRelated(list = []) {

  const grid =
    $("#relatedGrid");

  if (!grid) return;

  setHTML(
    grid,

    list.map(item => {

      return `

        <div
          class="rel-card"
          data-slug="${item.slug}"
          style="
            background-image:
            linear-gradient(
              to top,
              rgba(0,0,0,.95),
              rgba(0,0,0,.2)
            ),
            url(${image(item.poster)}?tr=w-300,h-450);

            background-size:cover;
            background-position:center;
          "
        >

          <span>
            ${item.title}
          </span>

        </div>

      `;

    }).join("")
  );

  /* CLICK */

  grid.onclick = (e) => {

    const card =
      e.target.closest(".rel-card");

    if (!card) return;

    go(
      `details.html?slug=${card.dataset.slug}`
    );
  };
}
