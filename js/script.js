// ============================================================
// js/script.js
// MAIN ENTRY POINT — sabhi HTML pages yahi load karti hain
// <script type="module" src="js/script.js"></script>
// ============================================================

import { initSidebar }     from './features/sidebar.js';
import { initSearch }      from './features/search.js';
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

  // index.html
  case 'home':
    import('./features/home.js')
      .then(m => m.initHome());
    break;

  // details.html
  case 'details':
    import('./features/details.js')
      .then(m => m.initDetails());
    break;

  // watch.html
  case 'watch':
    import('./features/watch.js')
      .then(m => m.initWatch());
    break;

  // download.html
  case 'download':
    import('./features/download.js')
      .then(m => m.initDownload());
    break;

  // anime.html
  case 'anime':
    import('./features/animePage.js')
      .then(m => m.initAnimePage());
    break;

  // movies.html
  case 'movies':
    import('./features/moviesPage.js')
      .then(m => m.initMoviesPage());
    break;

  // series.html
  case 'series':
    import('./features/seriesPage.js')
      .then(m => m.initSeriesPage());
    break;

  // cartoon.html
  case 'cartoon':
    import('./features/cartoonPage.js')
      .then(m => m.initCartoonPage());
    break;

  // Category.html — window.PAGE_TYPE = "category" already set hai HTML mein
  case 'category':
    import('./features/categoryPage.js')
      .then(m => m.initCategoryPage());
    break;

  // history.html
  case 'history':
    import('./features/historyPage.js')
      .then(m => m.initHistoryPage());
    break;

  // go.html — download session verify
  case 'go':
    import('./features/go.js');
    break;

  // knight.html — quality selection
  case 'knight':
    import('./features/knight.js');
    break;

  default:
    // Koi page match nahi hua — kuch nahi karna
    break;
}


