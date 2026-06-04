// ============================================================
// js/features/historyPage.js
// history.html — watch history + continue watching
// ============================================================

export function initHistoryPage() {

  renderContinueWatching();
  renderWatchHistory();

  // Clear button
  document.getElementById('clearHistory')?.addEventListener('click', () => {
    localStorage.removeItem('ah_history');
    localStorage.removeItem('ah_continue');
    document.getElementById('historyGrid').innerHTML    = '';
    document.getElementById('continueGrid').innerHTML   = '';
  });
}

// ============================================================
// CONTINUE WATCHING
// ============================================================
function renderContinueWatching() {
  const grid = document.getElementById('continueGrid');
  if (!grid) return;

  const items = JSON.parse(localStorage.getItem('ah_continue') || '[]');

  if (items.length === 0) {
    grid.innerHTML = '<p style="color:#555;font-size:12px;grid-column:1/-1;">Nothing here yet.</p>';
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="card"
      style="
        background-image: url('${item.poster}');
        background-size: cover;
        background-position: center;
        cursor: pointer;
      "
      onclick="location.href='watch.html?slug=${item.slug}&season=${item.season}&ep=${item.ep}'"
    >
      <span style="color:#ffcc00;font-size:10px;font-weight:bold;">
        S${item.season} EP${item.ep}
      </span>
      <span style="color:#ccc;font-size:10px;margin-top:2px;">
        ${item.title || ''}
      </span>
    </div>
  `).join('');
}

// ============================================================
// WATCH HISTORY
// ============================================================
function renderWatchHistory() {
  const grid = document.getElementById('historyGrid');
  if (!grid) return;

  const items = JSON.parse(localStorage.getItem('ah_history') || '[]');

  if (items.length === 0) {
    grid.innerHTML = '<p style="color:#555;font-size:12px;grid-column:1/-1;">No watch history.</p>';
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="card"
      style="
        background-image: url('${item.poster}');
        background-size: cover;
        background-position: center;
        cursor: pointer;
      "
      onclick="location.href='details.html?slug=${item.slug}'"
    >
      <span style="
        color:#fff;font-size:10px;
        background:rgba(0,0,0,0.6);
        padding:2px 4px;
        border-radius:3px;
      ">${item.title || ''}</span>
    </div>
  `).join('');
}
