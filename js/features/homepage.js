import { getHomepage, getAnime } from "../core/api.js";
import { createCard } from "../core/utils.js";
import { loadBanner } from "./banner.js";

export async function initHome() {
  await loadBanner("home");

  const container = document.getElementById("homepageRows");
  if (!container) return;

  const rows = await getHomepage();
  if (!rows) return;

  container.innerHTML = "";

  for (const row of rows) {
    const anime = await getAnime(`?category=${row.source}&limit=20`);

    const html = `
      <section class="movie-row">
        <div class="row-header">
          <h2>${row.title}</h2>
          <a href="${row.source}.html" class="see-more-btn">See more</a>
        </div>
        <div class="movie-scroll">
          ${(anime || []).map(createCard).join("")}
        </div>
      </section>
    `;

    container.innerHTML += html;
  }

  initFilter();
}

// ===== FILTER =====
function initFilter() {
  const buttons = document.querySelectorAll(".category-bar button");
  const rows = document.getElementById("homepageRows");
  const grid = document.querySelector(".home-grid");

  buttons.forEach(btn => {
    btn.onclick = async () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const text = btn.innerText.toLowerCase();

      if (text === "all") {
        rows.style.display = "block";
        grid.style.display = "none";
        return;
      }

      rows.style.display = "none";
      grid.style.display = "grid";

      const data = await getAnime(`?category=${text}&limit=40`);

      grid.innerHTML = (data || []).map(createCard).join("");
    };
  });
}
