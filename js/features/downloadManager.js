import { $ } from "../core/utils.js";

/* ======================================================
   DOWNLOAD MANAGER
====================================================== */

export function renderDownloadButtons({

  animeSlug,

  currentEpisode,

  playerConfig = {}

}) {

  const box = $("#downloadBox");

  if (!box) return;

  /* PLAYER CMS SUPPORT */

  if (
    playerConfig?.ui &&
    playerConfig.ui.download === false
  ) {

    box.style.display = "none";

    return;
  }

  box.style.display = "flex";

  /* ================= EPISODE ================= */

  const epNo =
    currentEpisode?.episode || 1;

  box.innerHTML = `
  
    <button class="download-btn">
      ⬇ Download EP ${epNo}
    </button>

    <button class="download-btn secondary">
      📦 Full Download
    </button>

  `;

  const [epBtn, fullBtn] =
    box.querySelectorAll("button");

  /* EP DOWNLOAD */

  epBtn.onclick = () => {

    location.href =
      `download.html?anime=${encodeURIComponent(animeSlug)}&episode=${epNo}`;
  };

  /* FULL DOWNLOAD */

  fullBtn.onclick = () => {

    location.href =
      `download.html?anime=${encodeURIComponent(animeSlug)}`;
  };
}
