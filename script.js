/* =========================================
   ANIMEHUNT FRONTEND ENGINE (FINAL CF BUILD)
========================================= */

const API_BASE = "https://animehunt-backend.animehunt715.workers.dev";

/* =========================================
   DOM READY
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  initHome();
  initSearch();
});

/* =========================================
SIDEBAR ENGINE
========================================= */
function initSidebar() {

const menuBtn = document.querySelector(".menu-btn");
const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector(".overlay");
const closeBtn = document.querySelector(".close-btn");

if (!menuBtn || !sidebar || !overlay) return;

menuBtn.addEventListener("click", () => {
sidebar.classList.add("active");
overlay.classList.add("active");
document.body.style.overflow = "hidden";
});

function closeSidebar() {
sidebar.classList.remove("active");
overlay.classList.remove("active");
document.body.style.overflow = "";
}

closeBtn?.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

}

/* =========================================
HOME PAGE LOADER
========================================= */
async function initHome() {

const rows = document.querySelectorAll(".movie-scroll");
if (!rows.length) return;

try {

const res = await fetch(API_BASE + "/api/anime");  
const json = await res.json();  
if (!json.success || !json.data) return;  

const allAnime = json.data;  

rows.forEach(row => {  

  const category = row.dataset.row;  
  row.innerHTML = "";  

  let filtered = allAnime;  

  if (category === "ongoing") {  
    filtered = allAnime.filter(a => a.status === "ongoing");  
  }  

  else if (category === "action") {  
    filtered = allAnime.filter(a => a.genre?.toLowerCase().includes("action"));  
  }  

  else if (category === "romance") {  
    filtered = allAnime.filter(a => a.genre?.toLowerCase().includes("romance"));  
  }  

  else if (category === "series") {  
    filtered = allAnime.filter(a => a.type === "series");  
  }  

  else if (category === "top-rated") {  
    filtered = [...allAnime].sort((a,b)=> b.rating - a.rating);  
  }  

  else if (category === "most-viewed") {  
    filtered = [...allAnime].sort((a,b)=> b.views - a.views);  
  }  

  filtered.slice(0,10).forEach(anime => {  

    const card = document.createElement("div");  
    card.className = "movie-card";  
    card.innerHTML = `  
      <img src="${anime.thumbnail}" alt="">  
      <span>${anime.title}</span>  
    `;  

    card.onclick = () => {  
      window.location.href = `details.html?anime=${anime.slug}`;  
    };  

    row.appendChild(card);  

  });  

});

} catch (err) {
console.error("Home load error:", err);
}

}

/* =========================================
LIVE SEARCH ENGINE
========================================= */
function initSearch() {

const searchInput = document.querySelector(".search-bar");
if (!searchInput) return;

const dropdown = document.createElement("div");
dropdown.className = "search-dropdown";
dropdown.style.display = "none";
document.body.appendChild(dropdown);

let allData = [];

fetch(API_BASE + "/api/anime")
.then(res => res.json())
.then(json => {
if (json.success && json.data) {
allData = json.data;
}
});

function positionDropdown() {
const rect = searchInput.getBoundingClientRect();
dropdown.style.position = "absolute";
dropdown.style.top = rect.bottom + window.scrollY + "px";
dropdown.style.left = rect.left + window.scrollX + "px";
dropdown.style.width = rect.width + "px";
}

searchInput.addEventListener("input", function () {

const query = this.value.trim().toLowerCase();  
dropdown.innerHTML = "";  

if (!query) {  
  dropdown.style.display = "none";  
  return;  
}  

const results = allData  
  .filter(a => a.title.toLowerCase().includes(query))  
  .slice(0,8);  

if (!results.length) {  
  dropdown.style.display = "none";  
  return;  
}  

results.forEach(anime => {  

  const item = document.createElement("div");  
  item.className = "search-item";  

  item.innerHTML = `  
    <img src="${anime.thumbnail}" alt="">  
    <span>${anime.title}</span>  
  `;  

  item.onclick = () => {  
    window.location.href = `details.html?anime=${anime.slug}`;  
  };  

  dropdown.appendChild(item);  

});  

positionDropdown();  
dropdown.style.display = "block";

});

document.addEventListener("click", function (e) {
if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
dropdown.style.display = "none";
}
});

}

/* ===============================
   CONFIG
================================ */

const API_BASE = "/api"

/* ===============================
   CATEGORY LIST (13)
================================ */

const CATEGORIES = {

ongoing: "Ongoing",
trending: "Trending Now",
romance: "Love & Romantic",
action: "High-Octane Action",
psychological: "Dark & Psychological",

cinematic: "Cinematic Masterpieces",
classics: "Modern Classics",
adventure: "Deep-Dive Adventures",
slice: "Slice of Life & Drama",

binge: "Binge-Worthy Series",
hidden: "Hidden Gems",
top: "Top Rated Globally",
popular: "Most Viewed"

}


/* ===============================
   UTIL
================================ */

function qs(name){

return new URLSearchParams(location.search).get(name)

}

function escapeHTML(str){

return String(str||"")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")

}

/* ===============================
   RENDER ANIME CARD
================================ */

function renderAnimeCard(a){

return `
<a href="/anime.html?slug=${a.slug}" class="anime-card">

<img src="${a.poster || ""}" loading="lazy">

<div class="title">
${escapeHTML(a.title)}
</div>

</a>
`

}

/* ===============================
   LOAD HOMEPAGE
================================ */

async function loadHome(){

try{

const res = await fetch(API_BASE+"/home")

const data = await res.json()

Object.keys(CATEGORIES).forEach(cat=>{

const grid = document.getElementById(cat+"Grid")

if(!grid) return

const list = data[cat] || []

grid.innerHTML=""

list.forEach(a=>{
grid.innerHTML+=renderAnimeCard(a)
})

})

}catch(e){

console.error("Home load failed",e)

}

}

/* ===============================
   LOAD CATEGORY PAGE
================================ */

async function loadCategory(){

const slug = qs("slug")

if(!slug) return

try{

const res = await fetch(API_BASE+"/anime/category/"+slug)

const data = await res.json()

const grid = document.getElementById("categoryGrid")

if(!grid) return

grid.innerHTML=""

data.forEach(a=>{
grid.innerHTML+=renderAnimeCard(a)
})

}catch(e){

console.error("Category load failed")

}

}

/* ===============================
   LOAD TYPE PAGE
   anime / movie / series / cartoon
================================ */

async function loadType(type){

try{

const res = await fetch(API_BASE+"/anime/type/"+type)

const data = await res.json()

const grid = document.getElementById("typeGrid")

if(!grid) return

grid.innerHTML=""

data.forEach(a=>{
grid.innerHTML+=renderAnimeCard(a)
})

}catch(e){

console.error("Type load failed")

}

}

/* ===============================
   LOAD ANIME DETAILS
================================ */

async function loadAnime(){

const slug = qs("slug")

if(!slug) return

try{

const res = await fetch(API_BASE+"/anime/"+slug)

const anime = await res.json()

document.getElementById("animeTitle").innerText = anime.title
document.getElementById("animePoster").src = anime.poster
document.getElementById("animeDesc").innerText = anime.description

loadEpisodes(slug)

}catch(e){

console.error("Anime load failed")

}

}

/* ===============================
   LOAD EPISODES
================================ */

async function loadEpisodes(slug){

try{

const res = await fetch(API_BASE+"/episodes/"+slug)

const data = await res.json()

const box = document.getElementById("episodes")

if(!box) return

box.innerHTML=""

data.forEach(ep=>{

box.innerHTML+=`
<a href="/watch.html?slug=${slug}&ep=${ep.episode_number}" class="episode">
Episode ${ep.episode_number}
</a>
`

})

}catch(e){

console.error("Episodes load failed")

}

}

/* ===============================
   PLAYER PAGE
================================ */

async function loadPlayer(){

const slug = qs("slug")
const ep = qs("ep")

if(!slug || !ep) return

try{

const res = await fetch(API_BASE+"/episodes/"+slug)

const data = await res.json()

const episode = data.find(e=>e.episode_number==ep)

if(!episode) return

document.getElementById("player").src = episode.video_url

}catch(e){

console.error("Player load failed")

}

}


/* ===============================
   AUTO PAGE DETECT
================================ */

document.addEventListener("DOMContentLoaded",()=>{

const page = document.body.dataset.page

if(page==="home") loadHome()

if(page==="category") loadCategory()

if(page==="anime") loadAnime()

if(page==="watch") loadPlayer()

if(page==="anime-list") loadType("anime")

if(page==="movies") loadType("movie")

if(page==="series") loadType("series")

if(page==="cartoon") loadType("cartoon")

})
function setSEO(data){

const title = data.title + " Hindi Dubbed Anime | AnimeHunt"

const desc = data.description || "Watch Hindi dubbed anime online"

document.title = title

setMeta("description",desc)
setMeta("og:title",title)
setMeta("og:description",desc)

}

function setMeta(name,content){

let tag = document.querySelector(`meta[name="${name}"]`)

if(!tag){

tag = document.createElement("meta")

tag.setAttribute("name",name)

document.head.appendChild(tag)

}

tag.setAttribute("content",content)

}
function setCanonical(){

const link = document.createElement("link")

link.rel="canonical"

link.href = location.origin + location.pathname + location.search

document.head.appendChild(link)

}

setCanonical()
