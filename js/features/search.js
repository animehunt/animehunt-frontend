// ============================================================
// js/features/search.js
// Global search bar + dropdown — saari pages pe kaam karta hai
// ============================================================

import { searchAnime }         from '../api.js';
import { debounce, escapeHtml } from '../utils.js';

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
      // ✅ FIX (FE-ISSUE-013): unwrap the {success, data:{results,...}}
      // envelope — apiFetch() returns the raw response body, and the
      // actual array lives at response.data.results, not the top level.
      // Without this, .length/.slice() below threw a TypeError on every
      // search, silently caught by the outer catch, meaning search never
      // worked anywhere on the site — this bar appears on every page.
      const resp    = await searchAnime(query);
      const results = resp?.data?.results || [];
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

    // ✅ FIX (FE-ISSUE-003): this was the worst unescaped-attribute
    // instance in the whole codebase — slug (in a data-* attribute),
    // poster (in a src attribute), and title (in both an alt attribute
    // and innerHTML) were ALL completely unescaped, on a component that
    // renders on every single page of the site.
    dropdown.innerHTML = results.slice(0, 8).map(item => {
      const slug   = escapeHtml(item.slug || '');
      const poster = escapeHtml(item.poster || '');
      const title  = escapeHtml(item.title || '');
      return `
        <div class="search-item" data-slug="${slug}">
          <img src="${poster}" alt="${title}"
               onerror="this.style.display='none'">
          <span>${title}</span>
        </div>
      `;
    }).join('');

    dropdown.style.display = 'block';

    // Click pe details page
    dropdown.querySelectorAll('.search-item').forEach(el => {
      el.addEventListener('click', () => {
        // ✅ FIX: encodeURIComponent() on the slug read back out of the
        // (now-escaped) data attribute, for the URL itself — a slug
        // containing &, ?, or # would otherwise break this URL.
        window.location.href = `details.html?slug=${encodeURIComponent(el.dataset.slug)}`;
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
