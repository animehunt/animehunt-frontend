// ============================================================
// js/config.js
// Shared backend BASE URL — the ONE place this is defined.
// ✅ FIX (audit Issue 1): api.js and the inline scripts in
// download.html/go.html/knight.html previously each had their own
// independent hardcoded copy of this URL (6 total across the
// codebase, all still literal placeholder text). All 6 now import
// from here — set the real backend domain on the line below and
// every page/module picks it up automatically.
// ============================================================

export const BASE = 'https://YOUR-ACTUAL-BACKEND-DOMAIN.com';  // ⚠️ REPLACE with the real backend domain
