const API = "https://animehunt-backend.animehunt715.workers.dev/api"

let SETTINGS = null
let ACTIVE_REQ = 0

/* =========================
LOAD SETTINGS
========================= */
async function loadSearchSettings() {
  if (SETTINGS) return SETTINGS

  try {
    const res = await fetch(`${API}/search`)
    SETTINGS = await res.json()
    return SETTINGS
  } catch (e) {
    console.error("Search settings load failed", e)
    return null
  }
}

/* =========================
INIT SEARCH
========================= */
export async function initSearch() {

  const settings = await loadSearchSettings()
  if (!settings || !settings.enableSearch) return

  const input = document.querySelector(".search-bar")
  if (!input) return

  let timeout = null

  input.addEventListener("input", () => {

    const q = input.value.trim()

    if (!q) {
      clearResults()
      return
    }

    if (settings.mode === "debounce") {
      clearTimeout(timeout)
      timeout = setTimeout(() => runSearch(q, settings), settings.debounce)
    } else {
      runSearch(q, settings)
    }

  })

  // ESC key close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") clearResults()
  })

  // outside click close
  document.addEventListener("click", (e) => {
    const box = document.getElementById("searchResults")
    if (box && !box.contains(e.target) && e.target !== input) {
      clearResults()
    }
  })
}

/* =========================
SEARCH LOGIC
========================= */
async function runSearch(query, settings) {

  const requestId = ++ACTIVE_REQ

  showLoading()

  try {
    const res = await fetch(`${API}/anime?search=${encodeURIComponent(query)}`)
    let data = await res.json()

    // cancel outdated request
    if (requestId !== ACTIVE_REQ) return

    // TYPO fallback
    if (settings.smart?.typo && (!data || data.length === 0)) {
      data = await tryTypo(query)
    }

    data = rankResults(data, settings)

    renderResults(data, query, settings)

  } catch (e) {
    console.error("Search failed", e)
    showError()
  }
}

/* =========================
TYPO FIX
========================= */
async function tryTypo(query) {
  try {
    const fixed = query.slice(0, -1)
    const res = await fetch(`${API}/anime?search=${fixed}`)
    return await res.json()
  } catch {
    return []
  }
}

/* =========================
RANKING
========================= */
function rankResults(data, settings) {

  return (data || []).sort((a, b) => {

    let A = a.views || 0
    let B = b.views || 0

    // FEATURE BOOST
    if (settings.ranking?.boost) {
      if (a.featured) A += settings.ranking.weight * 100
      if (b.featured) B += settings.ranking.weight * 100
    }

    // AI TRENDING
    if (a.trending) A += 500
    if (b.trending) B += 500

    return B - A
  })
}

/* =========================
RENDER RESULTS
========================= */
function renderResults(data, query, settings) {

  const box = getBox()

  if (!data || data.length === 0) {
    box.innerHTML = `<div class="search-empty">No results found</div>`
    return
  }

  const max = settings.ui?.max || 8
  const items = data.slice(0, max)

  box.innerHTML = items.map(a => `
    <div class="search-item" onclick="goTo('${a.id}')">
      
      ${settings.ui?.thumb ? `<img src="${a.image || a.poster}" />` : ""}

      <div>
        <div class="title">${highlight(a.title, query, settings)}</div>
        <div class="meta">${a.category || ""}</div>
      </div>

    </div>
  `).join("")
}

/* =========================
UI HELPERS
========================= */
function getBox() {

  let box = document.getElementById("searchResults")

  if (!box) {
    box = document.createElement("div")
    box.id = "searchResults"
    box.className = "search-dropdown"
    document.body.appendChild(box)
  }

  return box
}

function showLoading() {
  const box = getBox()
  box.innerHTML = `<div class="search-loading">Searching...</div>`
}

function showError() {
  const box = getBox()
  box.innerHTML = `<div class="search-error">Something went wrong</div>`
}

/* =========================
HIGHLIGHT
========================= */
function highlight(text, query, settings) {

  if (!settings.ui?.highlight) return text

  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const reg = new RegExp(`(${safe})`, "gi")

  return text.replace(reg, `<b>$1</b>`)
}

/* =========================
CLEAR
========================= */
function clearResults() {
  const box = document.getElementById("searchResults")
  if (box) box.innerHTML = ""
}

/* =========================
NAVIGATION
========================= */
window.goTo = function(id) {
  location.href = `details.html?id=${id}`
}
