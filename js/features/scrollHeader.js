// ============================================================
// js/features/scrollHeader.js
// Scroll pe header shadow — saari pages pe reuse hota hai
// ============================================================

export function initScrollHeader() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}


