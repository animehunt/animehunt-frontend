import { getAnime } from "../core/api.js";

let SETTINGS = null

const API = "https://animehunt-backend.animehunt715.workers.dev/api"

/* =========================
LOAD SETTINGS
========================= */
async function loadSettings() {

  if (SETTINGS) return SETTINGS

  try {
    const res = await fetch(`${API}/search`)
    SETTINGS = await res.json()
  } catch {
    // fallback अगर API fail हो जाए
    SETTINGS = {
      enableSearch: true,
      mode: "debounce",
      debounce: 300,
      ui: { max: 6, thumb: true, highlight: true },
      ranking: { boost: true, weight: 5 },
      smart: { typo: true }
    }
  }

  return SETTINGS
}

/* =========================
INIT SEARCH
========================= */
export async function initSearch() {

  const settings = await loadSettings()

  if (!settings.enableSearch) return

  const input = document.querySelector(".search-bar")
  if (!input) return

  let box = document.querySelector(".search-dropdown")

  if (!box) {
    box = document.createElement("div")
    box.className = "search-dropdown"
    document.body.appendChild(box)
  }

  let timer

  input.addEventListener("input", () => {

    clearTimeout(timer)

    const q = input.value.trim()

    if (!q) {
      box.innerHTML = ""
      return
    }

    if (settings.mode === "debounce") {

      timer = setTimeout(() => {
        runSearch(q, box, settings)
      }, settings.debounce)

    } else {
      runSearch(q, box, settings)
    }

  })

  /* CLICK OUTSIDE */
  document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== input) {
      box.innerHTML = ""
    }
  })
}

/* =========================
SEARCH LOGIC
========================= */
async function runSearch(query, box, settings) {

  let data = await getAnime(`?search=${query}&limit=20`)

  // 👉 TYPO FIX
  if (settings.smart?.typo && (!data || data.length === 0)) {
    data = await getAnime(`?search=${query.slice(0, -1)}&limit=20`)
  }

  // 👉 RANKING
  data = rankResults(data, settings)

  render(data, query, box, settings)
}

/* =========================
RANKING
========================= */
function rankResults(data, settings) {

  if (!data) return []

  return data.sort((a, b) => {

    let A = a.views || 0
    let B = b.views || 0

    // FEATURED BOOST
    if (settings.ranking?.boost) {
      if (a.featured) A += settings.ranking.weight * 100
      if (b.featured) B += settings.ranking.weight * 100
    }

    // TRENDING (AI ENGINE)
    if (a.trending) A += 500
    if (b.trending) B += 500

    return B - A
  })
}

/* =========================
RENDER
========================= */
function render(data, query, box, settings) {

  const max = settings.ui?.max || 6

  const items = (data || []).slice(0, max)

  box.innerHTML = items.map(a => `
    <div class="search-item" onclick="goTo('${a.id}')">

      ${settings.ui?.thumb ? `<img src="${a.poster || a.image}">` : ""}

      <div>
        <div class="title">${highlight(a.title, query, settings)}</div>
      </div>

    </div>
  `).join("")
}

/* =========================
HIGHLIGHT
========================= */
function highlight(text, query, settings) {

  if (!settings.ui?.highlight) return text

  const reg = new RegExp(`(${query})`, "gi")
  return text.replace(reg, `<b>$1</b>`)
}

/* =========================
NAVIGATION
========================= */
window.goTo = function(id) {
  location.href = `details.html?id=${id}`
}
