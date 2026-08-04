// ============================================================
// js/features/heroSlider.js
// Auto-rotating hero banner — har 5 sec pe change hoga
// UI same rahega, sirf data dynamic hoga
// ============================================================

import { escapeHtml } from '../utils.js';

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

    // Netflix crossfade: pehle fade out
    banner.style.transition = 'opacity 0.45s ease';
    banner.style.opacity    = '0';

    setTimeout(() => {
      // Background image update
      // ✅ FIX (FE-ISSUE-003, minor): JSON.stringify() for safe CSS
      // quoting — item.banner containing a " would otherwise break this
      // url("...") syntax.
      banner.style.backgroundImage =
        `linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.65)),
         url(${JSON.stringify(item.banner || '')})`;
      banner.style.backgroundSize     = 'cover';
      banner.style.backgroundPosition = 'center';
      banner.style.backgroundRepeat   = 'no-repeat';

      // Title — words pe line break
      // ✅ FIX (FE-ISSUE-003): the innerHTML branch below was completely
      // unescaped — the textContent branch (< 3 words) was already safe,
      // but most real titles are 3+ words, so this was the common case.
      const safeTitle = escapeHtml((item.title || '').toUpperCase());
      const words = safeTitle.split(' ');
      if (words.length >= 3) {
        const mid = Math.ceil(words.length / 2);
        titleEl.innerHTML =
          words.slice(0, mid).join(' ') + '<br>' +
          words.slice(mid).join(' ');
      } else {
        titleEl.textContent = (item.title || '').toUpperCase();
      }

      // Meta: year + rating
      // ✅ FIX (FE-ISSUE-003): escapeHtml() for consistency, even though
      // year/rating are typically numeric.
      metaEl.innerHTML =
        `<span>${escapeHtml(String(item.year || ''))}</span>
         <span>⭐ ${escapeHtml(String(item.rating || ''))}</span>`;

      // Play button
      // ✅ FIX: encodeURIComponent() on slug, matching every other file's
      // pattern — a slug containing &, ?, or # would otherwise break the
      // URL structure.
      playBtn.onclick = () => {
        window.location.href = `details.html?slug=${encodeURIComponent(item.slug || '')}`;
      };

      // Fade in
      banner.style.opacity = '1';
    }, 450);
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
