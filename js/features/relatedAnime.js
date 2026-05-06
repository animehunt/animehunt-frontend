import { getAnime } from "../core/api.js";

import {
  $,
  setHTML,
  createAnimeCard,
  empty
} from "../core/utils.js";

/* ======================================================
   RELATED ANIME
====================================================== */

export async function loadRelatedAnime(currentAnime) {

  const grid = $("#relatedGrid");

  if (!grid || !currentAnime) return;

  try {

    const genres =
      currentAnime.genres || [];

    /* ================= FETCH ================= */

    const res = await getAnime(
      `?type=${currentAnime.type}&limit=20`
    );

    if (!res?.data?.length) {

      empty(grid, "No related anime");

      return;
    }

    /* ================= FILTER ================= */

    let list = res.data.filter(anime => {

      /* EXCLUDE SELF */

      if (anime.slug === currentAnime.slug) {
        return false;
      }

      /* HIDDEN */

      if (anime.isHidden) {
        return false;
      }

      return true;
    });

    /* ================= SCORE ================= */

    list = list.map(anime => {

      const sharedGenres =
        (anime.genres || []).filter(
          g => genres.includes(g)
        ).length;

      return {

        ...anime,

        score: sharedGenres
      };

    });

    /* ================= SORT ================= */

    list.sort((a, b) => {

      /* SAME GENRE PRIORITY */

      if (b.score !== a.score) {
        return b.score - a.score;
      }

      /* TRENDING */

      if (a.isTrending && !b.isTrending) {
        return -1;
      }

      if (!a.isTrending && b.isTrending) {
        return 1;
      }

      return 0;
    });

    /* ================= LIMIT ================= */

    list = list.slice(0, 8);

    if (!list.length) {

      empty(grid, "No related anime");

      return;
    }

    /* ================= RENDER ================= */

    setHTML(
      grid,

      list.map(createAnimeCard).join("")
    );

    /* ================= CLICK ================= */

    grid.onclick = (e) => {

      const card =
        e.target.closest(".rel-card");

      if (!card) return;

      location.href =
        `details.html?slug=${card.dataset.slug}`;
    };

  } catch (err) {

    console.error(err);

    empty(grid, "Related load failed");
  }
}
