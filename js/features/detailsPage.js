import { getAnimeById, getAnime } from "../core/api.js";
import { createCard, initLazy } from "../core/utils.js";

function getId() {
  return new URLSearchParams(location.search).get("id");
}

export async function initDetailsPage() {
  const id = getId();
  if (!id) return;

  const data = await getAnimeById(id);
  if (!data) return;

  // ===== HERO =====
  document.getElementById("heroBg").style.backgroundImage = `url(${data.banner})`;
  document.getElementById("posterImg").src = data.poster;
  document.getElementById("animeTitle").innerHTML = `${data.title} <span>(${data.year || ""})</span>`;

  document.getElementById("animeMeta").innerHTML = `
    <span>${data.type}</span>
    <span>${data.status}</span>
    <span class="imdb">⭐ ${data.rating || "N/A"}</span>
  `;

  document.getElementById("animeDesc").innerText = data.description || "";

  // ===== ABOUT =====
  document.getElementById("aboutList").innerHTML = `
    <li><b>Language:</b> ${data.language || "-"}</li>
    <li><b>Duration:</b> ${data.duration || "-"}</li>
    <li><b>Genres:</b> ${(data.genres || []).join(", ")}</li>
  `;

  document.getElementById("aboutDesc").innerText = data.description || "";

  // ===== WATCH BUTTON =====
  document.querySelector(".watch").onclick = () => {
    location.href = `watch.html?id=${id}`;
  };

  // ===== RELATED =====
  const related = await getAnime(`?category=${data.genres?.[0] || ""}&limit=8`);

  document.getElementById("relatedGrid").innerHTML =
    (related || []).map(createCard).join("");

  initLazy();
}
