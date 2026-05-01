import { api } from "../core/api.js"

/* ================= PARAMS ================= */

function getParams(){
  const url = new URLSearchParams(location.search)

  return {
    anime: url.get("anime"),
    season: url.get("season"),
    episode: url.get("episode")
  }
}

/* ================= INIT ================= */

export async function initDownloadPage(){

  const { anime, season, episode } = getParams()

  const container = document.getElementById("downloadContainer")
  const title = document.getElementById("downloadTitle")

  if(!anime){
    container.innerHTML = "Invalid request"
    return
  }

  title.innerText = `Download ${anime}`

  // 🎯 SINGLE EP
  if(season && episode){
    loadEpisode(anime, season, episode)
  }else{
    loadFullAnime(anime)
  }
}

/* ================= FULL ANIME ================= */

async function loadFullAnime(anime){

  const container = document.getElementById("downloadContainer")
  container.innerHTML = "Loading..."

  try{

    const data = await api(`/downloads-full/${anime}`)

    if(!data || typeof data !== "object"){
      container.innerHTML = "No data found"
      return
    }

    container.innerHTML = ""

    Object.keys(data).forEach(season=>{

      container.innerHTML += `
        <h2>Season ${season}</h2>
      `

      Object.keys(data[season]).forEach(ep=>{

        const episodeData = data[season][ep]

        container.innerHTML += renderEpisodeBlock(
          anime,
          season,
          ep,
          episodeData
        )

      })

    })

  }catch{
    container.innerHTML = "Failed to load"
  }

}

/* ================= SINGLE EP ================= */

async function loadEpisode(anime, season, episode){

  const container = document.getElementById("downloadContainer")
  container.innerHTML = "Loading..."

  try{

    const data = await api(`/downloads/${anime}/${season}/${episode}`)

    if(!Array.isArray(data) || !data.length){
      container.innerHTML = "No downloads found"
      return
    }

    container.innerHTML = `
      <h2>Season ${season} • Episode ${episode}</h2>
      ${renderEpisodeBlock(anime, season, episode, convertToGrouped(data))}
    `

  }catch{
    container.innerHTML = "Failed to load"
  }

}

/* ================= GROUP HELPER ================= */

function convertToGrouped(list){

  const grouped = {}

  list.forEach(d=>{
    if(!grouped[d.host]) grouped[d.host] = []
    grouped[d.host].push({ quality: d.quality })
  })

  return grouped
}

/* ================= EP BLOCK ================= */

function renderEpisodeBlock(anime, season, episode, grouped){

  return `
  <div class="episode-block">

    <h3>Episode ${episode}</h3>

    ${Object.keys(grouped).map(host=>`

      <div class="host-block">

        <h4>${host}</h4>

        <div class="quality-links">

          ${grouped[host].map(l=>{

            const url = `/go?anime=${encodeURIComponent(anime)}&season=${season}&episode=${episode}&host=${host}&quality=${l.quality}`

            return `<a href="${url}">${l.quality}</a>`

          }).join("")}

        </div>

      </div>

    `).join("")}

  </div>
  `
}
