const API = "https://animehunt-backend.animehunt715.workers.dev/api/anime";

async function loadHome() {

  try {

    const res = await fetch(API);
    const data = await res.json();

    if (!data || !data.length) return;

    const rows = document.querySelectorAll(".movie-scroll");

    rows.forEach(row => {

      const type = row.dataset.row;

      let filtered = [];

      if (type === "ongoing") {
        filtered = data.filter(a => a.status === "ongoing");
      }

      else if (type === "trending") {
        filtered = data.filter(a => a.isTrending === 1);
      }

      else if (type === "most-viewed") {
        filtered = data.filter(a => a.isMostViewed === 1);
      }

      else if (type === "series") {
        filtered = data.filter(a => a.type === "series");
      }

      else {
        filtered = data.filter(a =>
          a.categories && a.categories.includes(type)
        );
      }

      renderRow(row, filtered.slice(0, 12));

    });

  } catch (err) {

    console.error("Home load error:", err);

  }

}

function renderRow(container, list) {

  container.innerHTML = "";

  list.forEach(anime => {

    const card = document.createElement("div");

    card.className = "movie-card";

    card.innerHTML = `
      <img src="${anime.poster || 'https://via.placeholder.com/300x450'}">
      <span>${anime.title}</span>
    `;

    card.onclick = () => {
      window.location.href = "details.html?anime=" + anime.slug;
    };

    container.appendChild(card);

  });

}

document.addEventListener("DOMContentLoaded", loadHome);
