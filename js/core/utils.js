export function createCard(a) {
  return `
    <div class="movie-card" onclick="location.href='details.html?id=${a.id}'">
      <img data-src="${a.poster}" class="lazy-img" />
    </div>
  `;
}

// LAZY LOAD
export function initLazy() {
  const imgs = document.querySelectorAll(".lazy-img");

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        img.src = img.dataset.src;
        obs.unobserve(img);
      }
    });
  });

  imgs.forEach(img => obs.observe(img));
}
