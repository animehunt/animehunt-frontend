const API =
"https://animehunt-backend.animehunt715.workers.dev/api"

let SETTINGS = null
let TIMER = null
let ACTIVE_REQUEST = 0

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

  } catch (err) {

    console.error(
      "Search settings failed",
      err
    )

    return null
  }
}

/* =========================================
INIT SEARCH
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

        clearResults()
        return
      }

      if (settings.mode === "debounce") {

        clearTimeout(TIMER)

        TIMER = setTimeout(() => {

          runSearch(q)

        }, settings.debounce || 300)

      } else {

        runSearch(q)
      }
    }
  )

  /* ESC CLOSE */

  document.addEventListener(
    "keydown",
    (e) => {

      if (e.key === "Escape") {

        clearResults()
      }
    }
  )

  /* OUTSIDE CLICK */

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

        clearResults()
      }
    }
  )
}

/* =========================================
SEARCH
========================================= */

async function runSearch(query) {

  const requestId =
    ++ACTIVE_REQUEST

  const box = getBox()

  box.innerHTML = `
    <div class="search-loading">
      Searching...
    </div>
  `

  try {

    const res =
      await fetch(
        `${API}/search?q=${encodeURIComponent(query)}`
      )

    const json =
      await res.json()

    if (requestId !== ACTIVE_REQUEST)
      return

    const data =
      json.data || []

    renderResults(
      data,
      query
    )

  } catch (err) {

    console.error(
      "Search failed",
      err
    )

    box.innerHTML = `
      <div class="search-error">
        Search failed
      </div>
    `
  }
}

/* =========================================
RENDER RESULTS
========================================= */

function renderResults(
  data,
  query
) {

  const box = getBox()

  if (!data.length) {

    box.innerHTML = `
      <div class="search-empty">
        No results found
      </div>
    `

    return
  }

  box.innerHTML =
    data.map(item => `

      <div
        class="search-item"
        data-slug="${item.slug}"
      >

        <img
          src="${item.poster}"
          loading="lazy"
          alt="${item.title}"
        >

        <span>
          ${highlight(
            item.title,
            query
          )}
        </span>

      </div>

    `).join("")

  /* CLICK */

  box.querySelectorAll(".search-item")
    .forEach(item => {

      item.onclick = () => {

        location.href =
          `details.html?slug=${item.dataset.slug}`
      }
    })
}

/* =========================================
GET BOX
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

/* =========================================
CLEAR
========================================= */

function clearResults() {

  const box =
    document.getElementById(
      "searchResults"
    )

  if (box) {

    box.innerHTML = ""
  }
}

/* =========================================
HIGHLIGHT
========================================= */

function highlight(
  text,
  query
) {

  if (!query)
    return text

  const safe =
    query.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    )

  return text.replace(
    new RegExp(
      `(${safe})`,
      "gi"
    ),
    "<b>$1</b>"
  )
}
