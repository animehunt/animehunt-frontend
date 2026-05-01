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

    const data = await api(`/downloads-full/${encodeURIComponent(anime)}`)

    if(!data || typeof data !== "object"){
      container.innerHTML = "No downloads found"
      return
    }

    container.innerHTML = ""

    Object.keys(data).forEach(season=>{

      container.innerHTML += `<h2>Season ${season}</h2>`

      Object.keys(data[season]).forEach(ep=>{

        const episodeData = data[season][ep]

        container.innerHTML += renderEpisodeBlock(
          anime,
          season,
          ep,
          groupByHost(episodeData)
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

    const data = await api(`/downloads/${encodeURIComponent(anime)}/${season}/${episode}`)

    if(!Array.isArray(data) || !data.length){
      container.innerHTML = "No downloads found"
      return
    }

    container.innerHTML = `
      <h2>Season ${season} • Episode ${episode}</h2>
      ${renderEpisodeBlock(anime, season, episode, groupByHost(data))}
    `

  }catch{
    container.innerHTML = "Failed to load"
  }
}

/* ================= GROUP BY HOST ================= */
function groupByHost(list){

  const grouped = {}

  list.forEach(d=>{
    if(!grouped[d.host]) grouped[d.host] = []
    grouped[d.host].push(d)
  })

  return grouped
}

/* ================= EP BLOCK ================= */
function renderEpisodeBlock(anime, season, episode, grouped){

  return `
  <div class="episode-block">

    <h3>Episode ${episode}</h3>

    ${Object.keys(grouped).map(host=>{

      return `
      <div class="host-block">

        <h4>${host}</h4>

        <div class="quality-links">

          ${grouped[host].map(item=>{

            const url = `/api/go?anime=${encodeURIComponent(anime)}&season=${season}&episode=${episode}&host=${host}&quality=${item.quality}&step=1`

            return `<a href="${url}">${item.quality}</a>`

          }).join("")}

        </div>

      </div>
      `

    }).join("")}

  </div>
  `
}
