import { $ } from "../core/utils.js";

/* ======================================================
   AUTO NEXT
====================================================== */

let timer = null;

let seconds = 5;

/* ======================================================
   START
====================================================== */

export function startAutoNext({

  onNext

}) {

  stopAutoNext();

  const box = $("#autoNextBox");
  const count = $("#countdown");

  if (!box || !count) return;

  seconds = 5;

  box.style.display = "block";

  count.innerText = seconds;

  timer = setInterval(() => {

    seconds--;

    count.innerText = seconds;

    if (seconds <= 0) {

      stopAutoNext();

      if (typeof onNext === "function") {
        onNext();
      }
    }

  }, 1000);
}

/* ======================================================
   STOP
====================================================== */

export function stopAutoNext() {

  if (timer) {

    clearInterval(timer);

    timer = null;
  }

  const box = $("#autoNextBox");

  if (box) {
    box.style.display = "none";
  }
}
