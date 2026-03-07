const API = "https://animehunt-backend.animehunt715.workers.dev/api/anime";

/* =========================================
LOAD HOMEPAGE
========================================= */

async function loadHome(){

  try{

    const res = await fetch(API);
    const json = await res.json();

    if(!json.success) return;

    const animeList = json.data;

    loadBanner(animeList);
    loadRows(animeList);

  }catch(err){

    console.error("Home Load Error:",err);

  }

}


/* =========================================
HERO BANNER
========================================= */

function loadBanner(list){

  const hero = document.getElementById("homeHeroBanner");

  if(!hero) return;

  const bannerAnime = list.find(a =>
    a.isBanner == 1 && a.banner
  );

  if(!bannerAnime) return;

  hero.style.background =
  `linear-gradient(to bottom,rgba(0,0,0,.4),#0b0f1a),
  url("${bannerAnime.banner}") center/cover no-repeat`;

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


/* =========================================
LOAD ROWS
========================================= */

function loadRows(list){

  const rows = document.querySelectorAll(".movie-scroll");

  rows.forEach(row => {

    const type = row.dataset.row;

    let filtered = [];

    if(type === "ongoing"){
      filtered = list.filter(a =>
        a.status === "ongoing" && a.poster
      );
    }

    else if(type === "trending"){
      filtered = list.filter(a =>
        a.isTrending == 1 && a.poster
      );
    }

    else if(type === "most-viewed"){
      filtered = list.filter(a =>
        a.isMostViewed == 1 && a.poster
      );
    }

    else if(type === "series"){
      filtered = list.filter(a =>
        a.type === "series" && a.poster
      );
    }

    else{

      filtered = list.filter(a =>
        a.categories &&
        a.categories.includes(type) &&
        a.poster
      );

    }

    renderRow(row,filtered.slice(0,12));

  });

}


/* =========================================
RENDER ROW
========================================= */

function renderRow(container,list){

  container.innerHTML = "";

  list.forEach(anime => {

    if(!anime.poster) return;

    const card = document.createElement("div");

    card.className = "movie-card";

    card.innerHTML = `
      <img src="${anime.poster}">
      <span>${anime.title}</span>
    `;

    card.onclick = () => {
      window.location.href =
      "details.html?anime="+anime.slug;
    };

    container.appendChild(card);

  });

}


/* =========================================
INIT
========================================= */

document.addEventListener("DOMContentLoaded",loadHome);
