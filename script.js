const API = "https://animehunt-backend.animehunt715.workers.dev/api/anime"

async function loadAnime(){

  try{

    const res = await fetch(API)
    const animeList = await res.json()

    const grid = document.querySelector(".anime-grid")

    if(!grid) return

    grid.innerHTML = ""

    animeList.forEach(anime => {

      const card = document.createElement("div")

      card.className = "movie-card"

      card.innerHTML = `
        <img src="${anime.poster || 'https://via.placeholder.com/300x450'}">
        <p>${anime.title}</p>
      `

      card.onclick = () => {
        window.location.href = "details.html?anime=" + anime.slug
      }

      grid.appendChild(card)

    })

  }catch(err){

    console.error("Anime load error",err)

  }

}

loadAnime()
