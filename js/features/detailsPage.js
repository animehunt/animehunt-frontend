import { getAnimeById, getAnime } from "../core/api.js";
import { createCard, initLazy } from "../core/utils.js";

/* ================= PARAM ================= */
function getId() {
  return new URLSearchParams(location.search).get("id");
}

/* ================= INIT ================= */
export async function initDetailsPage() {

  const id = getId();
  if (!id) return;

  const data = await getAnimeById(id);
  if (!data) return;

  /* ================= SAFE VALUES ================= */
  const title = data.title || "Unknown";
  const slug = data.slug || title;
  const banner = data.banner || "";
  const poster = data.poster || "";
  const year = data.year || "";
  const type = data.type || "-";
  const status = data.status || "-";
  const rating = data.rating || "N/A";
  const desc = data.description || "";
  const genres = data.genres || [];
  const language = data.language || "-";
  const duration = data.duration || "-";

  /* ================= HERO ================= */
  const heroBg = document.getElementById("heroBg");
  const posterImg = document.getElementById("posterImg");
  const titleEl = document.getElementById("animeTitle");
  const metaEl = document.getElementById("animeMeta");
  const descEl = document.getElementById("animeDesc");

  if(heroBg) heroBg.style.backgroundImage = `url(${banner})`;
  if(posterImg) posterImg.src = poster;

  if(titleEl){
    titleEl.innerHTML = `${title} <span>(${year})</span>`;
  }

  if(metaEl){
    metaEl.innerHTML = `
      <span>${type}</span>
      <span>${status}</span>
      <span class="imdb">⭐ ${rating}</span>
    `;
  }

  if(descEl){
    descEl.innerText = desc;
  }

  /* ================= ABOUT ================= */
  const aboutList = document.getElementById("aboutList");
  const aboutDesc = document.getElementById("aboutDesc");

  if(aboutList){
    aboutList.innerHTML = `
      <li><b>Language:</b> ${language}</li>
      <li><b>Duration:</b> ${duration}</li>
      <li><b>Genres:</b> ${genres.join(", ") || "-"}</li>
    `;
  }

  if(aboutDesc){
    aboutDesc.innerText = desc;
  }

  /* ================= WATCH BUTTON ================= */
  const watchBtn = document.querySelector(".watch");

  if(watchBtn){
    watchBtn.onclick = () => {
      location.href = `watch.html?id=${id}`;
    };
  }

  /* ================= DOWNLOAD BUTTON ================= */
  const downloadBtn = document.querySelector(".download");

  if(downloadBtn){
    downloadBtn.onclick = () => {
      location.href = `download.html?anime=${encodeURIComponent(slug)}`;
    };
  }

  /* ================= RELATED ================= */
  try{

    const related = await getAnime(`?category=${genres[0] || ""}&limit=8`);

    const grid = document.getElementById("relatedGrid");

    if(grid){
      grid.innerHTML = (related || []).map(createCard).join("");
    }

    initLazy();

  }catch(e){
    console.warn("Related load failed");
  }

}
