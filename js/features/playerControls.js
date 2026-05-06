import {
  $,
  showPlayerMessage,
  hidePlayerMessage
} from "../core/utils.js";

/* ======================================================
   PLAYER CONTROLS
====================================================== */

let failTimer = null;

/* ======================================================
   LOAD PLAYER
====================================================== */

export function loadPlayer({

  url,

  config = {}

}) {

  const iframe = $("#iframe-embed");

  if (!iframe) return;

  hidePlayerMessage();

  clearFailCheck();

  /* ================= URL ================= */

  iframe.src = url || "";

  /* ================= SECURITY ================= */

  applySecurity(config);

  /* ================= FAIL CHECK ================= */

  startFailCheck();
}

/* ======================================================
   SECURITY
====================================================== */

function applySecurity(config) {

  const iframe = $("#iframe-embed");

  if (!iframe) return;

  /* SANDBOX */

  if (config?.security?.sandbox) {

    iframe.setAttribute(
      "sandbox",
      `
      allow-scripts
      allow-same-origin
      allow-presentation
      allow-fullscreen
      `
    );

  } else {

    iframe.removeAttribute("sandbox");
  }

  /* REFERRER */

  iframe.referrerPolicy =
    config?.security?.referrer ||
    "strict-origin";
}

/* ======================================================
   FAIL CHECK
====================================================== */

function startFailCheck() {

  const iframe = $("#iframe-embed");

  if (!iframe) return;

  failTimer = setTimeout(() => {

    if (
      !iframe.src ||
      iframe.src === "about:blank"
    ) {

      showPlayerMessage(
        `
        Server not working 😢
        <br><br>
        Please switch server
        `
      );
    }

  }, 6000);
}

function clearFailCheck() {

  if (failTimer) {

    clearTimeout(failTimer);

    failTimer = null;
  }
}

/* ======================================================
   FULLSCREEN
====================================================== */

export function enterFullscreen() {

  const iframe = $("#iframe-embed");

  if (!iframe) return;

  if (iframe.requestFullscreen) {
    iframe.requestFullscreen();
  }
}

/* ======================================================
   AUTO PLAY
====================================================== */

export function tryAutoplay() {

  const iframe = $("#iframe-embed");

  if (!iframe) return;

  iframe.allow =
    "autoplay; fullscreen; encrypted-media; picture-in-picture";
}

/* ======================================================
   CLEANUP
====================================================== */

export function destroyPlayer() {

  clearFailCheck();

  const iframe = $("#iframe-embed");

  if (!iframe) return;

  iframe.src = "";
}
