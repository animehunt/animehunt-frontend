const API_BASE = "https://animehunt-backend.animehunt715.workers.dev/api"
import { loadSEO, applyDynamicSEO } from "../core/seo.js"

// ===== GET SLUG FROM URL =====
function getSlug() {
  const params = new URLSearchParams(window.location.search)
  return params.get("type")
}

// ===== FETCH ALL CATEGORIES =====
async function fetchCategories() {
  const res = await fetch(API_BASE + "/categories")
  return res.json()
}

// ===== FIND CATEGORY =====
function findCategory(categories, slug) {
  return categories.find(c => c.slug === slug && c.active)
}

// ===== SET PAGE DATA =====
function setPageUI(category) {
  const titleEl = document.getElementById("pageTitle")
  const bannerTitle = document.getElementById("bannerTitle")
  const banner = document.getElementById("pageBanner")

  // title (UI)
  titleEl.innerText = `${category.name} – AnimeHunt`

  // banner text
  bannerTitle.innerText = category.name.toUpperCase()

  // banner class dynamic
  banner.className = "page-banner " + category.slug + "-banner"
}

// ===== LOAD ANIME =====
async function loadAnime(slug) {
  const grid = document.getElementById("animeGrid")

  grid.innerHTML = `<p style="padding:20px">Loading ${slug}...</p>`

  // 🔥 future API
  // const data = await fetch(API_BASE + "/anime?category=" + slug).then(r=>r.json())
  // grid.innerHTML = data.map(createCard).join("")
}

// ===== INIT =====
export async function initCategoryPage() {

  const slug = getSlug()

  if (!slug) {
    document.getElementById("animeGrid").innerHTML = "No category"
    return
  }

  try {
    const categories = await fetchCategories()
    const category = findCategory(categories, slug)

    if (!category) {
      document.getElementById("animeGrid").innerHTML = "Category not found"
      return
    }

    // ===== UI SET =====
    setPageUI(category)

    // ===== LOAD CONTENT =====
    loadAnime(slug)

    // ===== ✅ SEO APPLY (YAHI MAIN CHEEZ HAI) =====
    const seo = await loadSEO()

    applyDynamicSEO("category", {
      name: category.name
    }, seo)

  } catch (err) {
    console.error(err)
  }
}
