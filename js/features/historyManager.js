import {
  saveHistory
} from "../core/storage.js";

/* ======================================================
   HISTORY MANAGER
====================================================== */

export function addToHistory({

  anime,

  episode

}) {

  if (!anime || !episode) return;

  saveHistory({

    slug: anime.slug,

    animeId: anime.id,

    title: anime.title,

    poster: anime.poster,

    episodeId: episode.id,

    episodeNo: episode.episode

  });
}
