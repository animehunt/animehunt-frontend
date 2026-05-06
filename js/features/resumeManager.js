const RESUME_KEY =
  "RESUME_DATA";

/* ======================================================
   SAVE RESUME
====================================================== */

export function saveResume(data = {}) {

  try {

    const payload = {

      slug:
        data.slug || "",

      animeTitle:
        data.animeTitle || "",

      poster:
        data.poster || "",

      episodeId:
        data.episodeId || "",

      episodeNo:
        data.episodeNo || "",

      season:
        data.season || "1",

      time:
        Number(data.time || 0),

      duration:
        Number(data.duration || 0),

      updatedAt:
        Date.now()
    };

    localStorage.setItem(
      RESUME_KEY,
      JSON.stringify(payload)
    );

  } catch (err) {

    console.error(
      "Resume Save Failed",
      err
    );
  }
}

/* ======================================================
   GET RESUME
====================================================== */

export function getResume() {

  try {

    return JSON.parse(
      localStorage.getItem(RESUME_KEY) || "null"
    );

  } catch {

    return null;
  }
}

/* ======================================================
   CLEAR RESUME
====================================================== */

export function clearResume() {

  localStorage.removeItem(
    RESUME_KEY
  );
}

/* ======================================================
   VALIDATE
====================================================== */

export function hasResume(slug) {

  const data =
    getResume();

  if (!data) return false;

  return data.slug === slug;
}

/* ======================================================
   WATCH TIMER
====================================================== */

let timer = null;

let current = 0;

/* ======================================================
   START
====================================================== */

export function startWatchTimer({

  slug,
  animeTitle,
  poster,
  episodeId,
  episodeNo,
  season,
  getCurrentTime

}) {

  stopWatchTimer();

  current = 0;

  timer = setInterval(() => {

    try {

      current =
        Number(
          getCurrentTime?.() || 0
        );

      saveResume({

        slug,
        animeTitle,
        poster,
        episodeId,
        episodeNo,
        season,
        time: current
      });

    } catch (err) {

      console.error(err);
    }

  }, 5000);
}

/* ======================================================
   STOP
====================================================== */

export function stopWatchTimer() {

  if (timer) {

    clearInterval(timer);

    timer = null;
  }
}
