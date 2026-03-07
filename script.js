const API = "https://animehunt-backend.animehunt715.workers.dev/api/anime";

async function loadHome(){

  try{

    const res = await fetch(API);
    const json = await res.json();

    const animeList = json.data;   // ⭐ FIX

    if(!animeList) return;

    const rows = document.querySelectorAll(".movie-scroll");

    rows.forEach(row => {

      const type = row.dataset.row;

      let filtered = [];

      if(type === "ongoing"){
        filtered = animeList.filter(a => a.status === "ongoing");
      }

      else if(type === "trending"){
        filtered = animeList.filter(a => a.isTrending == 1);
      }

      else if(type === "most-viewed"){
        filtered = animeList.filter(a => a.isMostViewed == 1);
      }

      else if(type === "series"){
        filtered = animeList.filter(a => a.type === "series");
      }

      else{

        filtered = animeList.filter(a =>
          a.categories &&
          a.categories.includes(type)
        );

      }

      renderRow(row, filtered.slice(0,12));

    });

  }catch(err){

    console.error("Home load error:",err);

  }

}


function renderRow(container,list){

  container.innerHTML="";

  list.forEach(anime=>{

    const card=document.createElement("div");

    card.className="movie-card";

    card.innerHTML=`
      <img src="${anime.poster || 'https://via.placeholder.com/300x450'}">
      <span>${anime.title}</span>
    `;

    card.onclick=()=>{
      window.location.href="details.html?anime="+anime.slug;
    }

    container.appendChild(card);

  })

}

document.addEventListener("DOMContentLoaded",loadHome);
function loadBanner(animeList){

  const hero = document.getElementById("homeHeroBanner");

  if(!hero) return;

  const bannerAnime = animeList.find(a => a.isBanner == 1);

  if(!bannerAnime) return;

  hero.style.background =
    `linear-gradient(to bottom,rgba(0,0,0,.4),#0b0f1a),
     url("${bannerAnime.banner || bannerAnime.poster}") center/cover no-repeat`;

  const title = hero.querySelector(".hero-title");
  const meta = hero.querySelector(".hero-meta");

  if(title){
    title.innerHTML = bannerAnime.title;
  }

  if(meta){
    meta.innerHTML = `
      <span>${bannerAnime.year || "-"}</span>
      <span>⭐ ${bannerAnime.rating || "-"}</span>
    `;
  }

}
