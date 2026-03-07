const API = "https://animehunt-backend.animehunt715.workers.dev/api/anime";

/* ===============================
LOAD HOMEPAGE
================================ */

async function loadHome(){

  try{

    const res = await fetch(API);
    const json = await res.json();

    if(!json.success) return;

    const animeList = json.data;

    loadBanner(animeList);

  }catch(err){

    console.error(err);

  }

}

/* ===============================
HERO BANNER
================================ */

function loadBanner(list){

  const hero = document.getElementById("homeHeroBanner");

  if(!hero) return;

  const bannerAnime = list.find(a => a.isBanner == 1);

  if(!bannerAnime) return;

  hero.style.backgroundImage =
    `linear-gradient(to bottom,rgba(0,0,0,.4),#0b0f1a),
     url(${bannerAnime.banner || bannerAnime.poster})`;

  const title = hero.querySelector(".hero-title");
  const meta = hero.querySelector(".hero-meta");

  if(title){
    title.innerText = bannerAnime.title;
  }

  if(meta){
    meta.innerHTML = `
      <span>${bannerAnime.year || "-"}</span>
      <span>⭐ ${bannerAnime.rating || "-"}</span>
    `;
  }

}

/* ===============================
INIT
================================ */

document.addEventListener("DOMContentLoaded",loadHome);
