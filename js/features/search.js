import {
  applyDynamicSEO
} from "../core/seo.js"

const API =
"https://animehunt-backend.animehunt715.workers.dev/api"

let SETTINGS = null
let TIMER = null
let ACTIVE = 0

/* =========================================
LOAD SETTINGS
========================================= */

async function loadSettings() {

  if (SETTINGS) return SETTINGS

  try {

    const res =
      await fetch(`${API}/search`)

    const json =
      await res.json()

    SETTINGS = json

    return json

  } catch {

    return null
  }
}

/* =========================================
INIT
========================================= */

export async function initSearch() {

  const input =
    document.querySelector(".search-bar")

  if (!input) return

  const settings =
    await loadSettings()

  if (!settings?.enableSearch)
    return

  input.addEventListener(
    "input",
    () => {

      const q =
        input.value.trim()

      if (!q) {

        clearSearch()
        return
      }

      if (settings.mode === "debounce") {

        clearTimeout(TIMER)

        TIMER = setTimeout(() => {

          runSearch(q, settings)

        }, settings.debounce)

      } else {

        runSearch(q, settings)
      }
    }
  )

  document.addEventListener(
    "click",
    (e) => {

      const box =
        document.getElementById(
          "searchResults"
        )

      if (
        box &&
        !box.contains(e.target) &&
        e.target !== input
      ) {

        clearSearch()
      }
    }
  )
}

/* =========================================
SEARCH
========================================= */

async function runSearch(
  query,
  settings
) {

  const req = ++ACTIVE

  const box = getBox()

  box.innerHTML =
    `<div class="search-loading">
      Searching...
    </div>`

  try {

    const res =
      await fetch(
        `${API}/search?q=${encodeURIComponent(query)}`
      )

    const json =
      await res.json()

    if (req !== ACTIVE)
      return

    const data =
      json.data || []

    renderResults(
      data,
      query,
      settings
    )

  } catch {

    box.innerHTML =
      `<div class="search-error">
        Search failed
      </div>`
  }
}

/* =========================================
RENDER
========================================= */

function renderResults(
  data,
  query,
  settings
) {

  const box = getBox()

  if (!data.length) {

    box.innerHTML =
      `<div class="search-empty">
        No results
      </div>`

    return
  }

  box.innerHTML = data.map(item => `

    <div
      class="search-item"
      data-slug="${item.slug}"
    >

      <img
        src="${item.poster}"
      >

      <div>

        <span>
          ${highlight(
            item.title,
            query
          )}
        </span>

      </div>

    </div>

  `).join("")

  box.querySelectorAll(".search-item")
    .forEach(item => {

      item.onclick = () => {

        location.href =
          `details.html?slug=${item.dataset.slug}`
      }
    })
}

/* =========================================
HELPERS
========================================= */

function getBox() {

  let box =
    document.getElementById(
      "searchResults"
    )

  if (!box) {

    box =
      document.createElement("div")

    box.id =
      "searchResults"

    box.className =
      "search-dropdown"

    document.body.appendChild(box)
  }

  return box
}

function clearSearch() {

  const box =
    document.getElementById(
      "searchResults"
    )

  if (box)
    box.innerHTML = ""
}

function highlight(
  text,
  query
) {

  const safe =
    query.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    )

  return text.replace(
    new RegExp(`(${safe})`, "gi"),
    "<b>$1</b>"
  )
}
