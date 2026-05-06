const HISTORY_KEY =
  "WATCH_HISTORY";

/* ======================================================
   SAVE HISTORY
====================================================== */

export function saveWatchHistory(data = {}) {

  try {

    let history =
      JSON.parse(
        localStorage.getItem(HISTORY_KEY) || "[]"
      );

    /* REMOVE OLD */

    history =
      history.filter(
        x =>
          !(
            x.slug === data.slug &&
            x.episodeId === data.episodeId
          )
      );

    /* ADD NEW */

    history.unshift({

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

      updatedAt:
        Date.now()
    });

    /* LIMIT */

    history =
      history.slice(0, 50);

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history)
    );

  } catch (err) {

    console.error(
      "History Save Failed",
      err
    );
  }
}

/* ======================================================
   GET HISTORY
====================================================== */

export function getWatchHistory() {

  try {

    return JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]"
    );

  } catch {

    return [];
  }
}

/* ======================================================
   CLEAR HISTORY
====================================================== */

export function clearWatchHistory() {

  localStorage.removeItem(
    HISTORY_KEY
  );
}

/* ======================================================
   REMOVE ONE
====================================================== */

export function removeHistoryItem(
  episodeId
) {

  try {

    let history =
      getWatchHistory();

    history =
      history.filter(
        x => x.episodeId !== episodeId
      );

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history)
    );

  } catch (err) {

    console.error(err);
  }
}
