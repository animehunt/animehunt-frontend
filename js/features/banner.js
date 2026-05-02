import { getBanner } from "../core/api.js";

let rotateInterval = null;

export async function loadBanner(page = "home") {
  const el =
    document.getElementById("homeHeroBanner") ||
    document.getElementById("categoryBanner");

  if (!el) return;

  // loading state
  el.style.background = "#111";

  try {
    const data = await getBanner(`?page=${page}&position=hero`);

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("No banners found");
      return;
    }

    // 🔥 apply first banner
    applyBanner(el, data[0]);

    // 🔥 auto rotate (if multiple + enabled)
    const rotatable = data.filter(b => b.rotate);

    if (rotatable.length > 1) {
      let i = 0;

      clearInterval(rotateInterval);

      rotateInterval = setInterval(() => {
        i = (i + 1) % rotatable.length;
        applyBanner(el, rotatable[i]);
      }, 4000);
    }

  } catch (err) {
    console.error("Banner load error:", err);
  }
}

/* ===============================
   APPLY BANNER
=============================== */

function applyBanner(el, banner) {
  if (!banner?.image) return;

  // 🔥 ImageKit optimization (auto)
  const img = banner.image.includes("?")
    ? banner.image
    : `${banner.image}?tr=w-1200,h-500`;

  el.style.background = `
    linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,.85)),
    url(${img}) center/cover no-repeat
  `;

  // optional title (if you add later)
  if (banner.title && el.querySelector(".banner-title")) {
    el.querySelector(".banner-title").innerText = banner.title;
  }
}
