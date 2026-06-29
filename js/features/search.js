// ============================================================
// js/features/search.js
// Global search bar + dropdown — saari pages pe kaam karta hai
// ============================================================

import { searchAnime } from '../api.js';
import { debounce }    from '../utils.js';

export function initSearch() {
  const searchBar = document.querySelector('.search-bar');
  if (!searchBar) return;

  // Dropdown div banao aur body mein dalo
  const dropdown = document.createElement('div');
  dropdown.className = 'search-dropdown';
  dropdown.style.display = 'none';
  document.body.appendChild(dropdown);

  // ---- Search call ----
  const doSearch = debounce(async (query) => {
    if (query.length < 2) {
      dropdown.style.display = 'none';
      return;
    }

    try {
      const results = await searchAnime(query);
      showDropdown(results);
    } catch (err) {
      dropdown.style.display = 'none';
    }
  }, 300);

  // ---- Input event ----
  searchBar.addEventListener('input', (e) => {
    doSearch(e.target.value.trim());
  });

  // ---- Dropdown position update ----
  function positionDropdown() {
    const rect = searchBar.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top      = rect.bottom + 4 + 'px';
    dropdown.style.right    = '16px';
    dropdown.style.width    = rect.width + 'px';
  }

  // ---- Dropdown render ----
  function showDropdown(results) {
    if (!results || results.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    positionDropdown();

    dropdown.innerHTML = results.slice(0, 8).map(item => `
      <div class="search-item" data-slug="${item.slug}">
        <img src="${item.poster}" alt="${item.title}"
             onerror="this.style.display='none'">
        <span>${item.title}</span>
      </div>
    `).join('');

    dropdown.style.display = 'block';

    // Click pe details page
    dropdown.querySelectorAll('.search-item').forEach(el => {
      el.addEventListener('click', () => {
        window.location.href = `details.html?slug=${el.dataset.slug}`;
      });
    });
  }

  // ---- Bahar click pe band karo ----
  document.addEventListener('click', (e) => {
    if (!searchBar.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  // ---- Enter key pe pehla result ----
  searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = dropdown.querySelector('.search-item');
      if (first) first.click();
    }
  });
}
