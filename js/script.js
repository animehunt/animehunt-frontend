// ============================================================
// js/script.js
// MAIN ENTRY POINT — sabhi HTML pages yahi load karti hain
// <script type="module" src="js/script.js"></script>
// ============================================================

import { initSidebar }      from './features/sidebar.js';
import { initSearch }       from './features/search.js';
import { initScrollHeader } from './features/scrollHeader.js';

// ---- Har page pe common init ----
initSidebar();
initSearch();
initScrollHeader();

// ---- Page detect karo ----
const page = document.body.dataset.page || window.PAGE_TYPE || '';

// ============================================================
// ROUTER
// ============================================================
switch (page) {
  case 'home':     import('./features/home.js').then(m => m.initHome()); break;
  case 'details':  import('./features/details.js').then(m => m.initDetails()); break;
  case 'watch':    import('./features/watch.js').then(m => m.initWatch()); break;
  case 'download': import('./features/download.js').then(m => m.initDownload()); break;
  case 'anime':    import('./features/animePage.js').then(m => m.initAnimePage()); break;
  case 'movies':   import('./features/moviesPage.js').then(m => m.initMoviesPage()); break;
  case 'series':   import('./features/seriesPage.js').then(m => m.initSeriesPage()); break;
  case 'cartoon':  import('./features/cartoonPage.js').then(m => m.initCartoonPage()); break;
  case 'category': import('./features/categoryPage.js').then(m => m.initCategoryPage()); break;
  case 'history':  import('./features/historyPage.js').then(m => m.initHistoryPage()); break;
  case 'go':       import('./features/go.js'); break;
  case 'knight':   import('./features/knight.js'); break;
  default:         break;
}

// ============================================================
// THE SHIELD: ANTI-COPYCAT SECURITY (Block F12, Right-Click, Ctrl+U)
// ============================================================
document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', (e) => {
  // F12 key
  if (e.keyCode === 123) {
    e.preventDefault();
  }
  // Ctrl+Shift+I (Inspect)
  if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
    e.preventDefault();
  }
  // Ctrl+Shift+J (Console)
  if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
    e.preventDefault();
  }
  // Ctrl+U (View Source)
  if (e.ctrlKey && e.keyCode === 85) {
    e.preventDefault();
  }
});
