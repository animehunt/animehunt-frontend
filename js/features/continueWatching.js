// ============================================================
// js/features/continueWatching.js
// Continue Watching — localStorage helper
// home.js aur historyPage.js dono ye use karte hain
// ============================================================

const KEY_CONTINUE = 'ah_continue';
const MAX_ITEMS    = 20;

// ============================================================
// SAVE — Watch page se call karo
// ============================================================
export function saveContinueWatching(anime, season, ep) {
  const list = getContinueList();

  // Duplicate hata do
  const filtered = list.filter(i => i.slug !== anime.slug);

  // Nayi entry sabse aage
  const entry = {
    slug:   anime.slug,
    title:  anime.title,
    poster: anime.poster,
    season: season || 1,
    ep:     ep || 1,
    ts:     Date.now()
  };

  filtered.unshift(entry);

  // Max limit
  localStorage.setItem(KEY_CONTINUE, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
}

// ============================================================
// GET LIST
// ============================================================
export function getContinueList() {
  try {
    return JSON.parse(localStorage.getItem(KEY_CONTINUE) || '[]');
  } catch {
    return [];
  }
}

// ============================================================
// CLEAR
// ============================================================
export function clearContinueWatching() {
  localStorage.removeItem(KEY_CONTINUE);
}

// ============================================================
// RENDER — Home page ki continue watching row
// ============================================================
export function renderContinueRow() {
  const section  = document.getElementById('continueSection');
  const scroll   = document.getElementById('continueScroll');
  const clearBtn = document.getElementById('clearContinueBtn');
  if (!section || !scroll) return;

  const list = getContinueList();

  if (list.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  scroll.innerHTML = list.map(item => `
    <div
      class="movie-card"
      style="
        background-image: url('${item.poster}');
        background-size: cover;
        background-position: center;
        min-width: 22%;
        aspect-ratio: 2/3;
        border-radius: 10px;
        display: flex;
        align-items: flex-end;
        padding: 8px;
        cursor: pointer;
        flex-shrink: 0;
        position: relative;
        transition: transform .3s ease, box-shadow .3s ease;
      "
      onclick="location.href='watch.html?slug=${item.slug}&season=${item.season}&ep=${item.ep}'"
      onmouseover="this.style.transform='translateY(-5px) scale(1.04)'"
      onmouseout="this.style.transform=''"
    >
      <!-- Progress badge -->
      <span style="
        background: rgba(52,152,219,0.85);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        color: #fff;
      ">S${item.season} EP${item.ep}</span>
    </div>
  `).join('');

  // Clear button
  clearBtn?.addEventListener('click', () => {
    clearContinueWatching();
    section.style.display = 'none';
  });
}
