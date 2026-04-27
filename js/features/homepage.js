import { getHomepage, getAnime, getCategories } from "../core/api.js"
import { createCard } from "../core/utils.js"
import { loadBanner } from "./banner.js"

export async function initHome() {

  await loadBanner("home")

  const container = document.getElementById("homepageRows")
  const grid = document.querySelector(".home-grid")
  const filterBar = document.querySelector(".category-bar")

  if (!container) return

  // ===== LOAD CATEGORIES (for filter) =====
  const categories = await getCategories()

  // ===== BUILD FILTER =====
  buildFilter(filterBar, categories, container, grid)

  // ===== LOAD HOMEPAGE ROWS =====
  const rows = await getHomepage()

  container.innerHTML = ""

  for (const row of rows) {

    const anime = await getAnime(`?category=${row.source}&limit=20`)

    const html = `
      <section class="movie-row">
        <div class="row-header">
          <h2>${row.title}</h2>
          <a href="category.html?type=${row.source}" class="see-more-btn">See more</a>
        </div>

        <div class="movie-scroll">
          ${(anime || []).map(createCard).join("")}
        </div>
      </section>
    `

    container.innerHTML += html
  }
}
function buildFilter(bar, categories, rows, grid) {

  // RESET
  bar.innerHTML = `<button class="active">ALL</button>`

  // ADD FROM CMS
  categories
    .filter(c => c.active)
    .forEach(cat => {
      bar.innerHTML += `<button data-slug="${cat.slug}">${cat.name}</button>`
    })

  const buttons = bar.querySelectorAll("button")

  buttons.forEach(btn => {

    btn.onclick = async () => {

      buttons.forEach(b => b.classList.remove("active"))
      btn.classList.add("active")

      const slug = btn.dataset.slug

      // ===== ALL =====
      if (!slug) {
        rows.style.display = "block"
        grid.style.display = "none"
        return
      }

      // ===== FILTER MODE =====
      rows.style.display = "none"
      grid.style.display = "grid"

      grid.innerHTML = `<p style="padding:20px">Loading...</p>`

      const data = await getAnime(`?category=${slug}&limit=40`)

      grid.innerHTML = (data || []).map(createCard).join("")
    }
  })
}
