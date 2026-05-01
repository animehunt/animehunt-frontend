import { getDownloads } from "../core/api.js"

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

  // ===== IF EPISODE PAGE =====
  if(season && episode){
    loadEpisode(anime, season, episode)
    return
  }

  // ===== FULL ANIME MODE =====
  container.innerHTML = "Select episode from watch page"
}

/* ================= EPISODE ================= */

async function loadEpisode(anime, season, episode){

  const container = document.getElementById("downloadContainer")

  container.innerHTML = "Loading..."

  try{

    const data = await getDownloads(anime, season, episode)

    if(!Array.isArray(data) || !data.length){
      container.innerHTML = "No downloads found"
      return
    }

    const grouped = {}

    data.forEach(d=>{
      if(!grouped[d.host]) grouped[d.host] = []
      grouped[d.host].push(d)
    })

    container.innerHTML = `
      <h2>Season ${season} • Episode ${episode}</h2>
    `

    Object.keys(grouped).forEach(host=>{

      container.innerHTML += `
      <div class="episode-block">

        <h3>${host}</h3>

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
      `

    })

  }catch(e){
    container.innerHTML = "Failed to load"
  }

}
