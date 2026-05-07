const API =
"https://animehunt-backend.animehunt715.workers.dev/api/seo"

let CACHE = null

/* =========================================
LOAD SEO
========================================= */

export async function loadSEO() {

  if (CACHE) return CACHE

  const res =
    await fetch(API)

  const json =
    await res.json()

  CACHE = json

  return json
}

/* =========================================
GLOBAL SEO
========================================= */

export function applyGlobalSEO(
  seo
) {

  if (!seo?.global)
    return

  document.title =
    seo.global.title

  setMeta(
    "description",
    seo.global.desc
  )

  setMeta(
    "keywords",
    seo.global.keywords
  )

  setMeta(
    "robots",
    seo.global.indexing
  )

  setCanonical(
    seo.global.canonical
  )
}

/* =========================================
DYNAMIC SEO
========================================= */

export function applyDynamicSEO(
  type,
  data,
  seo
) {

  if (!seo?.templates)
    return

  let title = ""
  let desc = ""

  /* ANIME */

  if (type === "anime") {

    title =
      seo.templates.anime
      .replace(
        "{title}",
        data.title
      )

    desc =
      data.description ||
      seo.global.desc
  }

  /* EPISODE */

  if (type === "episode") {

    title =
      seo.templates.episode
      .replace(
        "{anime}",
        data.title
      )
      .replace(
        "{ep}",
        data.episode
      )

    desc =
      `${data.title} episode ${data.episode}`
  }

  /* SEARCH */

  if (type === "search") {

    title =
      seo.templates.search
      .replace(
        "{query}",
        data.query
      )

    desc =
      `Search results for ${data.query}`
  }

  document.title = title

  setMeta(
    "description",
    desc
  )

  setOG(title, desc, data.poster)

  injectJSONLD(type, data)
}

/* =========================================
OPEN GRAPH
========================================= */

function setOG(
  title,
  desc,
  image
) {

  setMetaProperty(
    "og:title",
    title
  )

  setMetaProperty(
    "og:description",
    desc
  )

  setMetaProperty(
    "og:image",
    image || ""
  )

  setMetaProperty(
    "og:type",
    "website"
  )

  setMetaProperty(
    "twitter:card",
    "summary_large_image"
  )
}

/* =========================================
JSON-LD
========================================= */

function injectJSONLD(
  type,
  data
) {

  const old =
    document.getElementById(
      "jsonld"
    )

  if (old) old.remove()

  const script =
    document.createElement("script")

  script.type =
    "application/ld+json"

  script.id = "jsonld"

  if (type === "anime") {

    script.textContent =
      JSON.stringify({

        "@context":
          "https://schema.org",

        "@type":
          "TVSeries",

        name:
          data.title,

        image:
          data.poster,

        description:
          data.description
      })
  }

  document.head.appendChild(script)
}

/* =========================================
HELPERS
========================================= */

function setMeta(
  name,
  content
) {

  let el =
    document.querySelector(
      `meta[name="${name}"]`
    )

  if (!el) {

    el =
      document.createElement(
        "meta"
      )

    el.setAttribute(
      "name",
      name
    )

    document.head.appendChild(el)
  }

  el.setAttribute(
    "content",
    content || ""
  )
}

function setMetaProperty(
  property,
  content
) {

  let el =
    document.querySelector(
      `meta[property="${property}"]`
    )

  if (!el) {

    el =
      document.createElement(
        "meta"
      )

    el.setAttribute(
      "property",
      property
    )

    document.head.appendChild(el)
  }

  el.setAttribute(
    "content",
    content || ""
  )
}

function setCanonical(
  href
) {

  let el =
    document.querySelector(
      `link[rel="canonical"]`
    )

  if (!el) {

    el =
      document.createElement(
        "link"
      )

    el.rel = "canonical"

    document.head.appendChild(el)
  }

  el.href = href
}
