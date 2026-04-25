import { getBanner } from "../core/api.js";

export async function loadBanner(page = "home") {
  const el = document.getElementById("homeHeroBanner") || document.getElementById("categoryBanner");
  if (!el) return;

  const data = await getBanner(`?page=${page}&position=hero`);

  if (!data?.length) return;

  const b = data[0];

  el.style.background = `
    linear-gradient(to bottom, rgba(0,0,0,.2), rgba(0,0,0,.8)),
    url(${b.image}) center/cover
  `;
}
