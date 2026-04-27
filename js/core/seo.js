const API = "https://animehunt-backend.animehunt715.workers.dev/api/seo"

let SEO_CACHE = null

export async function loadSEO() {

  if (SEO_CACHE) return SEO_CACHE

  const res = await fetch(API)
  const data = await res.json()

  SEO_CACHE = data
  return data
}

/* =========================
APPLY GLOBAL SEO
========================= */
export function applyGlobalSEO(seo) {

  if (!seo?.global) return

  document.title = seo.global.title

  setMeta("description", seo.global.desc)
  setMeta("keywords", seo.global.keywords)

  setMeta("robots", seo.global.indexing)

  setLink("canonical", seo.global.canonical)
}

/* =========================
APPLY HOMEPAGE SEO
========================= */
export function applyHomeSEO(seo) {

  if (!seo?.home) return

  document.title = seo.home.title

  setMeta("description", seo.home.desc)
  setMeta("keywords", seo.home.keywords)

  if (seo.home.og) {
    setMeta("og:image", seo.home.og)
  }
}

/* =========================
DYNAMIC TEMPLATE SEO
========================= */
export function applyDynamicSEO(type, data, seo) {

  if (!seo?.templates) return

  let title = ""

  if (type === "anime") {
    title = seo.templates.anime.replace("{title}", data.title)
  }

  if (type === "category") {
    title = seo.templates.category.replace("{category}", data.name)
  }

  if (type === "search") {
    title = seo.templates.search.replace("{query}", data.query)
  }

  document.title = title
}

/* =========================
HELPERS
========================= */

function setMeta(name, content) {

  let el = document.querySelector(`meta[name="${name}"]`)

  if (!el) {
    el = document.createElement("meta")
    el.setAttribute("name", name)
    document.head.appendChild(el)
  }

  el.setAttribute("content", content)
}

function setLink(rel, href) {

  let el = document.querySelector(`link[rel="${rel}"]`)

  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", rel)
    document.head.appendChild(el)
  }

  el.setAttribute("href", href)
}
