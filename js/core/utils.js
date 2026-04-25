export function createCard(a) {
  return `
    <div class="movie-card" onclick="location.href='details.html?id=${a.id}'">
      <img src="${a.poster}" />
    </div>
  `;
}
