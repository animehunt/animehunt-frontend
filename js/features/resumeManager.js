import {
  saveResume,
  getResume
} from "../core/storage.js";

/* ======================================================
   RESUME MANAGER
====================================================== */

let timer = null;

/* ================= START ================= */

export function startResumeTracking({

  anime,

  episode,

  iframe

}) {

  stopResumeTracking();

  if (!anime || !episode || !iframe) return;

  let seconds = 0;

  timer = setInterval(() => {

    seconds += 5;

    saveResume({

      slug: anime.slug,

      animeId: anime.id,

      episodeId: episode.id,

      episodeNo: episode.episode,

      currentTime: seconds

    });

  }, 5000);
}

/* ================= STOP ================= */

export function stopResumeTracking() {

  if (timer) {

    clearInterval(timer);

    timer = null;
  }
}

/* ================= GET ================= */

export function getResumeData(slug) {

  const data = getResume();

  if (!data) return null;

  if (data.slug !== slug) return null;

  return data;
}
