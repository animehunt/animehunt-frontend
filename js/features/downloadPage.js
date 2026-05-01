import { api } from "../core/api.js"

function getParams(){
  const url = new URLSearchParams(location.search)

  return {
    anime: url.get("anime"),
    season: url.get("season"),
    episode: url.get("episode")
  }
}

export async function initDownloadPage(){

  const { anime, season, episode } = getParams()

  const container = document.getElementById("downloadContainer")
  const title = document.getElementById("downloadTitle")

  if(!anime){
    container.innerHTML = "Invalid request"
    return
  }

  title.innerText = `Download ${anime}`

  // 🎯 MODE 2: SINGLE EPISODE
  if(season && episode){
    loadEpisode(anime, season, episode)
    return
  }

  // 🎯 MODE 1: FULL ANIME
  loadFullAnime(anime)
}

/* ================= FULL ANIME ================= */

async function loadFullAnime(anime){

  const container = document.getElementById("downloadContainer")

  container.innerHTML = "Loading..."

  try{

    const data = await api(`/downloads-full/${anime}`)

    if(!Array.isArray(data) || !data.length){
      container.innerHTML = "No data found"
      return
    }

    const grouped = {}

    data.forEach(d=>{

      // ZIP = season download
      if(d.quality === "ZIP"){
        if(!grouped["ZIP"]) grouped["ZIP"] = []
        grouped["ZIP"].push(d)
        return
      }

      const key = `S${d.season}`

      if(!grouped[key]) grouped[key] = {}

      if(!grouped[key][d.episode]) grouped[key][d.episode] = []

      grouped[key][d.episode].push(d)

    })

    container.innerHTML = ""

    /* ===== SEASONS ===== */

    Object.keys(grouped).forEach(key=>{

      // ZIP BLOCK
      if(key === "ZIP"){
        container.innerHTML += renderZIP(grouped[key], anime)
        return
      }

      const season = key.replace("S","")

      container.innerHTML += `
        <h2>Season ${season}</h2>
      `

      Object.keys(grouped[key]).forEach(ep=>{

        container.innerHTML += renderEpisodeBlock(
          anime,
          season,
          ep,
          grouped[key][ep]
        )

      })

    })

  }catch{
    container.innerHTML = "Failed to load"
  }

}

/* ================= EPISODE MODE ================= */

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
      ${renderEpisodeBlock(anime, season, episode, data)}
    `

  }catch{
    container.innerHTML = "Failed to load"
  }

}

/* ================= EP BLOCK ================= */

function renderEpisodeBlock(anime, season, episode, list){

  const grouped = {}

  list.forEach(d=>{
    if(!grouped[d.host]) grouped[d.host] = []
    grouped[d.host].push(d)
  })

  return `
  <div class="episode-block">

    <h3>Episode ${episode}</h3>

    ${Object.keys(grouped).map(host=>`

      <div class="host-block">

        <h4>${host} (${grouped[host][0].storage || "-"})</h4>

        <div class="quality-links">

          ${grouped[host].map(l=>`

            <a href="/go?anime=${encodeURIComponent(anime)}
            &season=${season}
            &episode=${episode}
            &host=${host}
            &quality=${l.quality}">

              ${l.quality}

            </a>

          `).join("")}

        </div>

      </div>

    `).join("")}

  </div>
  `
}

/* ================= ZIP ================= */

function renderZIP(list, anime){

  const grouped = {}

  list.forEach(d=>{
    if(!grouped[d.season]) grouped[d.season] = []
    grouped[d.season].push(d)
  })

  return Object.keys(grouped).map(season=>`

    <div class="episode-block">

      <h3>Season ${season} Complete ZIP</h3>

      ${grouped[season].map(d=>`

        <div class="host-block">

          <h4>${d.host}</h4>

          <div class="quality-links">

            <a href="/go?anime=${encodeURIComponent(anime)}
            &season=${season}
            &episode=zip
            &host=${d.host}
            &quality=ZIP">

              Download

            </a>

          </div>

        </div>

      `).join("")}

    </div>

  `).join("")
}
