/* =====================================================
GLOBAL CONFIG
===================================================== */

const API_BASE = "https://animehunt-backend.animehunt715.workers.dev"

let ANIME_CACHE = []

async function fetchAnime(){

  try{

    const res = await fetch(API_BASE + "/api/anime")
    const json = await res.json()

    if(json.success && Array.isArray(json.data)){
      ANIME_CACHE = json.data
    }else{
      ANIME_CACHE = []
    }

  }catch(err){
    console.error("API ERROR:",err)
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
LISTING ENGINE
===================================================== */

(async function(){

  const grid=document.querySelector(".anime-grid")
  const pagination=document.querySelector(".pagination")

  if(!grid) return

  await fetchAnime()

  const typePage=grid.dataset.typePage

  let data=[...ANIME_CACHE]

  if(typePage){

    data=data.filter(a=>
      a.type &&
      a.type.toLowerCase()===typePage.toLowerCase()
    )

  }

  const perPage=20
  let currentPage=1

  function renderPage(page){

    currentPage=page

    grid.innerHTML=""

    const start=(page-1)*perPage
    const end=start+perPage

    data.slice(start,end).forEach(anime=>{

      const card=document.createElement("div")
      card.className="movie-card"

      card.innerHTML=`
      <img src="${anime.poster || ''}">
      <span>${anime.title}</span>
      `

      card.onclick=()=>{
        window.location.href=`details.html?anime=${anime.slug}`
      }

      grid.appendChild(card)

    })

    renderPagination()

  }


  function renderPagination(){

    if(!pagination) return

    const totalPages=Math.ceil(data.length/perPage)

    pagination.innerHTML=""

    if(totalPages<=1) return

    const prev=document.createElement("button")
    prev.innerText="Prev"
    prev.disabled=currentPage===1
    prev.onclick=()=>renderPage(currentPage-1)

    pagination.appendChild(prev)

    for(let i=1;i<=totalPages;i++){

      const btn=document.createElement("button")

      btn.innerText=i

      if(i===currentPage){
        btn.classList.add("active")
      }

      btn.onclick=()=>renderPage(i)

      pagination.appendChild(btn)

    }

    const next=document.createElement("button")
    next.innerText="Next"
    next.disabled=currentPage===totalPages
    next.onclick=()=>renderPage(currentPage+1)

    pagination.appendChild(next)

  }

  renderPage(1)

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

  document.getElementById("posterImg")?.setAttribute(
    "src",anime.poster
  )

  document.getElementById("animeTitle").innerText=anime.title

  document.getElementById("animeMeta").innerHTML=`
  <span>${anime.year || "-"}</span>
  <span class="imdb">⭐ ${anime.rating || "-"}</span>
  <span>${anime.type || "Anime"}</span>
  `

  document.getElementById("animeDesc").innerText=
  anime.description || ""

  document.getElementById("aboutList").innerHTML=`
  <li><b>Genre:</b> ${anime.categories || "-"}</li>
  <li><b>Status:</b> ${anime.status || "-"}</li>
  `

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

  const azNav=document.querySelector(".az-nav")
  const grid=document.querySelector(".anime-grid")

  if(!azNav || !grid) return

  azNav.addEventListener("click",e=>{

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
LIVE SEARCH DROPDOWN
===================================================== */

(async function(){

  const searchInput=document.querySelector(".search-bar")

  if(!searchInput) return

  await fetchAnime()

  const dropdown=document.createElement("div")
  dropdown.className="search-dropdown"
  dropdown.style.display="none"

  document.body.appendChild(dropdown)

  searchInput.addEventListener("input",function(){

    const query=this.value.toLowerCase()

    dropdown.innerHTML=""

    if(!query){

      dropdown.style.display="none"
      return

    }

    const results=ANIME_CACHE
      .filter(a=>a.title.toLowerCase().includes(query))
      .slice(0,8)

    results.forEach(anime=>{

      const item=document.createElement("div")
      item.className="search-item"

      item.innerHTML=`
      <img src="${anime.poster || ''}">
      <span>${anime.title}</span>
      `

      item.onclick=()=>{
        window.location.href=`details.html?anime=${anime.slug}`
      }

      dropdown.appendChild(item)

    })

    dropdown.style.display="block"

  })

})()
