const API_BASE = "https://animehunt-backend.animehunt715.workers.dev"

/* ==============================
LOAD ANIME
============================== */

async function loadAnime(){

try{

const res = await fetch(API_BASE + "/api/anime")
const data = await res.json()

renderAnime(data)

}catch(err){

console.error("Anime load error",err)

}

}

/* ==============================
RENDER ANIME GRID
============================== */

function renderAnime(list){

const grid = document.querySelector(".anime-grid")

if(!grid) return

grid.innerHTML = ""

list.forEach(anime => {

const card = document.createElement("div")

card.className = "movie-card"

card.innerHTML = `
  <img src="${anime.poster || 'placeholder.jpg'}">
  <span>${anime.title}</span>
`

card.onclick = () => {

  location.href = "details.html?anime=" + anime.slug

}

grid.appendChild(card)

})

}

/* ==============================
LOAD BANNERS
============================== */

async function loadBanners(){

try{

const res = await fetch(API_BASE + "/api/banners")

const banners = await res.json()

renderBanners(banners)

}catch(err){

console.error("Banner load error",err)

}

}

/* ==============================
RENDER BANNER
============================== */

function renderBanners(banners){

const hero = document.querySelector(".hero-banner")

if(!hero) return

const banner = banners.find(b => b.active)

if(!banner) return

hero.style.backgroundImage = "url(${banner.image})"

}

/* ==============================
DETAILS PAGE
============================== */

async function loadDetails(){

if(!location.pathname.includes("details")) return

const slug = new URLSearchParams(location.search).get("anime")

const res = await fetch(API_BASE + "/api/anime")

const list = await res.json()

const anime = list.find(a => a.slug === slug)

if(!anime) return

document.getElementById("animeTitle").innerText = anime.title

document.getElementById("posterImg").src = anime.poster

document.getElementById("animeDesc").innerText = anime.description || ""

}

/* ==============================
SEARCH
============================== */

async function initSearch(){

const input = document.querySelector(".search-bar")

if(!input) return

const res = await fetch(API_BASE + "/api/anime")

const data = await res.json()

input.addEventListener("input",function(){

const q = this.value.toLowerCase()

const results = data.filter(a =>
  a.title.toLowerCase().includes(q)
).slice(0,8)

console.log(results)

})

}

/* ==============================
INIT
============================== */

loadAnime()
loadBanners()
loadDetails()
initSearch()
