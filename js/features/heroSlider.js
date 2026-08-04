// ============================================================
// js/features/sidebar.js
// Sidebar open/close — har page pe kaam karta hai
// ============================================================

export function initSidebar() {
  const sidebar  = document.querySelector('.sidebar');
  const overlay  = document.querySelector('.overlay');
  const menuBtn  = document.querySelector('.menu-btn');
  const closeBtn = document.querySelector('.close-btn');

  if (!sidebar || !overlay) return;

  // --- Open ---
  menuBtn?.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // scroll band
  });

  // --- Close ---
  function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // --- ESC key se bhi band ho ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
}
