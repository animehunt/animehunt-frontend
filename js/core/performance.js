const API =
"https://animehunt-backend.animehunt715.workers.dev/api/performance/public";

let CONFIG = {};

/* =========================
LOAD CONFIG
========================= */

export async function loadPerformanceConfig(){

  try{

    const res = await fetch(API);

    if(!res.ok) return {};

    CONFIG = await res.json();

    applyPerformance();

    return CONFIG;

  }catch(err){

    console.warn("Performance fallback");

    return {};

  }

}

/* =========================
APPLY ENGINE
========================= */

function applyPerformance(){

  /* =========================
  PRECONNECT
  ========================= */

  if(CONFIG.preconnect){

    addPreconnect("https://ik.imagekit.io");
    addPreconnect("https://fonts.googleapis.com");

  }

  /* =========================
  LAZY LOAD IMAGES
  ========================= */

  if(CONFIG.lazyLoad){

    document
      .querySelectorAll("img")
      .forEach(img=>{

        if(!img.loading){
          img.loading = "lazy";
        }

      });

  }

  /* =========================
  MOBILE PRIORITY
  ========================= */

  if(CONFIG.mobilePriority && window.innerWidth < 768){

    document.body.classList.add("mobile-priority");

  }

  /* =========================
  CDN MODE
  ========================= */

  if(CONFIG.cdnMode){

    document.body.classList.add("cdn-enabled");

  }

  /* =========================
  SMART CACHE
  ========================= */

  if(CONFIG.smartCache){

    window.SMART_CACHE = true;

  }

}

/* =========================
PRECONNECT
========================= */

function addPreconnect(url){

  const link = document.createElement("link");

  link.rel = "preconnect";

  link.href = url;

  document.head.appendChild(link);

}
