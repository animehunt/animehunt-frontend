// ============================================================
// js/features/heroSlider.js
// Auto-rotating hero banner — har 5 sec pe change hoga
// UI same rahega, sirf data dynamic hoga
// ============================================================

export function initHeroSlider(banners) {
  if (!banners || banners.length === 0) return;

  const banner  = document.getElementById('homeHeroBanner');
  if (!banner) return;

  const titleEl = banner.querySelector('.hero-title');
  const metaEl  = banner.querySelector('.hero-meta');
  const playBtn = banner.querySelector('.play-btn');

  let current   = 0;
  let autoTimer = null;

  // ---- Slide dikhao ----
  function showSlide(i) {
    const item = banners[i];
    if (!item) return;

    // Background image update
    banner.style.backgroundImage =
      `linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.15)),
       url("${item.banner}")`;
    banner.style.backgroundSize     = 'cover';
    banner.style.backgroundPosition = 'center';
    banner.style.backgroundRepeat   = 'no-repeat';

    // Title — words pe line break
    const words = item.title.toUpperCase().split(' ');
    if (words.length >= 3) {
      // 2-3 line mein split karo
      const mid = Math.ceil(words.length / 2);
      titleEl.innerHTML =
        words.slice(0, mid).join(' ') + '<br>' +
        words.slice(mid).join(' ');
    } else {
      titleEl.textContent = item.title.toUpperCase();
    }

    // Meta: year + rating
    metaEl.innerHTML =
      `<span>${item.year || ''}</span>
       <span>⭐ ${item.rating || ''}</span>`;

    // Play button — details page pe jao
    playBtn.onclick = () => {
      window.location.href = `details.html?slug=${item.slug}`;
    };
  }

  // ---- Auto slide ----
  function startAutoSlide() {
    autoTimer = setInterval(() => {
      current = (current + 1) % banners.length;
      showSlide(current);
    }, 5000); // 5 seconds
  }

  // ---- Init ----
  showSlide(0);
  if (banners.length > 1) startAutoSlide();
}
