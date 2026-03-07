/* =====================================================
   GLOBAL CONFIG
===================================================== */

const API_BASE = "https://animehunt-backend.animehunt715.workers.dev"

let ANIME_CACHE = []

async function fetchAnime(){

  try{

    const res = await fetch(API_BASE + "/api/anime")
    const json = await res.json()

    if(Array.isArray(json)){
      ANIME_CACHE = json
    }else if(json.data){
      ANIME_CACHE = json.data
    }

  }catch(err){
    console.error("Anime fetch error:",err)
  }

}


/* =====================================================
   SIDEBAR ENGINE
===================================================== */

document.addEventListener("DOMContentLoaded",()=>{

  const menuBtn=document.querySelector(".menu-btn")
  const sidebar=document.querySelector(".sidebar")
  const overlay=document.querySelector(".overlay")
  const closeBtn=document.querySelector(".close-btn")

  if(!menuBtn || !sidebar) return

  function openSidebar(){

    sidebar.classList.add("active")
    overlay.classList.add("active")
    document.body.style.overflow="hidden"

  }

  function closeSidebar(){

    sidebar.classList.remove("active")
    overlay.classList.remove("active")
    document.body.style.overflow=""

  }

  menuBtn.onclick=openSidebar
  overlay.onclick=closeSidebar

  if(closeBtn){
    closeBtn.onclick=closeSidebar
  }

})


/* =====================================================
   LISTING ENGINE (ANIME / MOVIES / SERIES / CARTOON)
===================================================== */

(async function(){

  const grid=document.querySelector(".anime-grid")

  if(!grid) return

  await fetchAnime()

  const pageType=grid.dataset.typePage

  let data=[...ANIME_CACHE]

  if(pageType){

    data=data.filter(a=>
      a.type &&
      a.type.toLowerCase()===pageType.toLowerCase()
    )

  }

  const perPage=20
  let currentPage=1

  const pagination=document.querySelector(".pagination")

  function render(page){

    currentPage=page

    grid.innerHTML=""

    const start=(page-1)*perPage
    const end=start+perPage

    data.slice(start,end).forEach(anime=>{

      const card=document.createElement("div")

      card.className="movie-card"

      card.innerHTML=`
        <img src="${anime.poster || ''}" alt="${anime.title}">
        <span>${anime.title}</span>
      `

      card.onclick=()=>{
        location.href=`details.html?anime=${anime.slug}`
      }

      grid.appendChild(card)

    })

    renderPagination()

  }

  function renderPagination(){

    if(!pagination) return

    const total=Math.ceil(data.length/perPage)

    pagination.innerHTML=""

    if(total<=1) return

    const prev=document.createElement("button")
    prev.innerText="Prev"
    prev.disabled=currentPage===1
    prev.onclick=()=>render(currentPage-1)

    pagination.appendChild(prev)

    for(let i=1;i<=total;i++){

      const btn=document.createElement("button")

      btn.innerText=i

      if(i===currentPage){
        btn.classList.add("active")
      }

      btn.onclick=()=>render(i)

      pagination.appendChild(btn)

    }

    const next=document.createElement("button")
    next.innerText="Next"
    next.disabled=currentPage===total
    next.onclick=()=>render(currentPage+1)

    pagination.appendChild(next)

  }

  render(1)

})()


/* =====================================================
   DETAILS PAGE ENGINE
===================================================== */

(async function(){

  if(!location.pathname.includes("details")) return

  const slug=new URLSearchParams(location.search).get("anime")

  if(!slug) return

  await fetchAnime()

  const anime=ANIME_CACHE.find(a=>a.slug===slug)

  if(!anime) return

  document.title=anime.title+" – AnimeHunt"

  const hero=document.getElementById("heroBg")

  if(hero && anime.banner){

    hero.style.background=
    `linear-gradient(to bottom,rgba(0,0,0,.4),#0b0f1a),
    url("${anime.banner}") center/cover`

  }

  const poster=document.getElementById("posterImg")
  if(poster) poster.src=anime.poster

  const title=document.getElementById("animeTitle")
  if(title) title.innerText=anime.title

  const desc=document.getElementById("animeDesc")
  if(desc) desc.innerText=anime.description || ""

  const meta=document.getElementById("animeMeta")
  if(meta){

    meta.innerHTML=`
    <span>${anime.year || "-"}</span>
    <span class="imdb">⭐ ${anime.rating || "-"}</span>
    <span>${anime.type || "Anime"}</span>
    `

  }

  const about=document.getElementById("aboutList")

  if(about){

    about.innerHTML=`
    <li><b>Genre:</b> ${anime.categories || "-"}</li>
    <li><b>Status:</b> ${anime.status || "-"}</li>
    `

  }

})()


/* =====================================================
   WATCH PAGE ENGINE
===================================================== */

(async function(){

  if(!location.pathname.includes("watch")) return

  const slug=new URLSearchParams(location.search).get("anime")

  if(!slug) return

  await fetchAnime()

  const anime=ANIME_CACHE.find(a=>a.slug===slug)

  if(!anime) return

  document.title=anime.title+" – Watch – AnimeHunt"

})()


/* =====================================================
   A-Z FILTER ENGINE
===================================================== */

(function(){

  const az=document.querySelector(".az-nav")
  const grid=document.querySelector(".anime-grid")

  if(!az || !grid) return

  az.addEventListener("click",e=>{

    if(e.target.tagName!=="SPAN") return

    const letter=e.target.innerText.toLowerCase()

    grid.querySelectorAll(".movie-card").forEach(card=>{

      const title=card.innerText.toLowerCase()

      if(title.startsWith(letter)){
        card.style.display="block"
      }else{
        card.style.display="none"
      }

    })

  })

})()


/* =====================================================
   LIVE SEARCH ENGINE
===================================================== */

(async function(){

  const input=document.querySelector(".search-bar")

  if(!input) return

  await fetchAnime()

  const dropdown=document.createElement("div")

  dropdown.className="search-dropdown"
  dropdown.style.display="none"

  document.body.appendChild(dropdown)

  input.addEventListener("input",function(){

    const q=this.value.toLowerCase()

    dropdown.innerHTML=""

    if(!q){

      dropdown.style.display="none"
      return

    }

    const results=ANIME_CACHE
    .filter(a=>a.title.toLowerCase().includes(q))
    .slice(0,8)

    results.forEach(anime=>{

      const item=document.createElement("div")

      item.className="search-item"

      item.innerHTML=`
        <img src="${anime.poster}">
        <span>${anime.title}</span>
      `

      item.onclick=()=>{
        location.href=`details.html?anime=${anime.slug}`
      }

      dropdown.appendChild(item)

    })

    dropdown.style.display="block"

  })

})()
