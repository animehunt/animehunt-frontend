const API_BASE = "https://animehunt-backend.animehunt715.workers.dev/api"

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

  // title
  titleEl.innerText = `${category.name} – AnimeHunt`

  // banner text
  bannerTitle.innerText = category.name.toUpperCase()

  // 🔥 optional: banner class dynamic
  banner.className = "page-banner " + category.slug + "-banner"
}

// ===== LOAD ANIME =====
async function loadAnime(slug) {
  const grid = document.getElementById("animeGrid")

  // अभी dummy (तुम बाद में api connect करोगे)
  grid.innerHTML = `<p style="padding:20px">Loading ${slug}...</p>`

  // 🔥 future:
  // const data = await fetch(API_BASE + "/anime?category=" + slug).then(r=>r.json())
  // renderAnime(data)
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

    setPageUI(category)
    loadAnime(slug)

  } catch (err) {
    console.error(err)
  }
}
