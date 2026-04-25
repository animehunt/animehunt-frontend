import { getAnime } from "../core/api.js";

export function initSearch() {
  const input = document.querySelector(".search-bar");
  if (!input) return;

  const box = document.createElement("div");
  box.className = "search-dropdown";
  document.body.appendChild(box);

  let timer;

  input.addEventListener("input", () => {
    clearTimeout(timer);

    const q = input.value.trim();
    if (!q) {
      box.innerHTML = "";
      return;
    }

    timer = setTimeout(async () => {
      const data = await getAnime(`?search=${q}&limit=6`);

      box.innerHTML = (data || [])
        .map(a => `
          <div class="search-item" onclick="location.href='details.html?id=${a.id}'">
            <img src="${a.poster}">
            <span>${a.title}</span>
          </div>
        `).join("");
    }, 400);
  });

  document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== input) {
      box.innerHTML = "";
    }
  });
}
