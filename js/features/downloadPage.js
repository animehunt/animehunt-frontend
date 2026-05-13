/* =========================================================
   js/features/downloadPage.js
   FINAL DOWNLOAD PAGE ENGINE
========================================================= */

import { api } from "../core/api.js"

/* =========================================================
   PARAMS
========================================================= */

function getParams(){

  const params =
  new URLSearchParams(
    location.search
  )

  return {

    anime:
    params.get("anime")

  }

}

/* =========================================================
   DOM
========================================================= */

const container =
document.getElementById(
  "downloadsContainer"
)

const animeTitle =
document.getElementById(
  "animeTitle"
)

const animeType =
document.getElementById(
  "animeType"
)

const poster =
document.getElementById(
  "poster"
)

const backdrop =
document.getElementById(
  "backdrop"
)

const downloadCount =
document.getElementById(
  "downloadCount"
)

/* =========================================================
   INIT
========================================================= */

export async function initDownloadPage(){

  const { anime } =
  getParams()

  /* =====================================================
     VALIDATION
  ===================================================== */

  if(!anime){

    container.innerHTML = `

      <div class="empty">

        Invalid anime

      </div>

    `

    return

  }

  /* =====================================================
     LOAD
  ===================================================== */

  try{

    const data =

    await api(

      `/downloads-by-slug/${anime}`

    )

    if(
      !data?.success
    ){

      container.innerHTML = `

        <div class="empty">

          Anime not found

        </div>

      `

      return

    }

    renderPage(data)

  }catch(err){

    console.error(err)

    container.innerHTML = `

      <div class="empty">

        Failed to load

      </div>

    `

  }

}

/* =========================================================
   RENDER PAGE
========================================================= */

function renderPage(data){

  const anime =
  data.anime

  const downloads =
  data.downloads || []

  /* =====================================================
     TOP
  ===================================================== */

  animeTitle.innerText =

    anime.title

  animeType.innerText =

    (
      anime.type ||
      "anime"
    ).toUpperCase()

  poster.src =
  anime.poster || ""

  backdrop.style.backgroundImage =

    `url(${anime.poster})`

  downloadCount.innerText =

    `${downloads.length} Downloads`

  /* =====================================================
     EMPTY
  ===================================================== */

  if(!downloads.length){

    container.innerHTML = `

      <div class="empty">

        No downloads available

      </div>

    `

    return

  }

  /* =====================================================
     GROUP
  ===================================================== */

  const grouped = {}

  downloads.forEach(item=>{

    const seasonKey =

      item.content_type ===
      "movie"

      ? "MOVIES"

      : item.content_type ===
        "series_zip"

      ? "SERIES ZIP"

      : `Season ${item.season || 1}`

    if(!grouped[seasonKey]){

      grouped[seasonKey] = []

    }

    grouped[seasonKey]
    .push(item)

  })

  /* =====================================================
     RENDER
  ===================================================== */

  container.innerHTML = ""

  Object.keys(grouped)
  .forEach(season=>{

    const list =
    grouped[season]

    const seasonDiv =
    document.createElement("div")

    seasonDiv.className =
    "season-block"

    seasonDiv.innerHTML = `

      <div class="season-header">

        <h2>

          ${season}

        </h2>

        <div class="season-count">

          ${list.length} Entries

        </div>

      </div>

    `

    /* ===================================================
       EPISODES
    =================================================== */

    list.forEach(item=>{

      const card =
      document.createElement("div")

      card.className =
      "episode-card"

      const epTitle =

        item.content_type ===
        "movie"

        ? (
            item.episode_title ||
            anime.title
          )

        : item.content_type ===
          "season_zip"

        ? `Season ${item.season} ZIP`

        : item.content_type ===
          "series_zip"

        ? "Full Series ZIP"

        : (
            item.episode_title ||
            `Episode ${item.episode}`
          )

      card.innerHTML = `

        <div class="episode-top">

          <div class="ep-left">

            <div class="ep-number">

              ${
                item.content_type ===
                "movie"

                ? "MOVIE"

                : item.content_type ===
                  "season_zip"

                ? "SEASON ZIP"

                : item.content_type ===
                  "series_zip"

                ? "SERIES ZIP"

                : `EPISODE ${item.episode}`
              }

            </div>

            <div class="ep-title">

              ${epTitle}

            </div>

          </div>

          <div class="host-count">

            ${item.hosts.length}
            Hosts

          </div>

        </div>

        <div class="host-grid"></div>

      `

      /* =================================================
         HOSTS
      ================================================= */

      const hostGrid =
      card.querySelector(
        ".host-grid"
      )

      item.hosts.forEach(host=>{

        const btn =
        document.createElement(
          "button"
        )

        btn.className =
        "host-btn"

        btn.innerText =
        host.host

        /* ===============================================
           GO FLOW
        =============================================== */

        btn.onclick = ()=>{

          location.href =

            `/api/go?host_id=${host.id}&step=1`

        }

        hostGrid.appendChild(btn)

      })

      seasonDiv.appendChild(card)

    })

    container.appendChild(
      seasonDiv
    )

  })

}
