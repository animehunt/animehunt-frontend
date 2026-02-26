/* ===============================
   ADS ENGINE – HARDENED VERSION
================================ */

const ADS_CACHE_TTL = 60000; // 60 sec cache
let adsCache = null;
let adsCacheTime = 0;

/* ===============================
   SAFE FETCH
================================ */
async function safeFetch(url, options = {}) {

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {

    const res = await fetch(url, {
      credentials: "same-origin",
      signal: controller.signal,
      ...options
    });

    clearTimeout(timeout);

    if (!res.ok) throw new Error("API error");

    return await res.json();

  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/* ===============================
   BASIC SANITIZER (lightweight)
================================ */
function sanitizeHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html;

  // Remove script tags
  template.content.querySelectorAll("script").forEach(el => el.remove());

  return template.innerHTML;
}

/* ===============================
   LOAD ADS
================================ */
async function loadAds() {

  const now = Date.now();

  if (adsCache && (now - adsCacheTime) < ADS_CACHE_TTL) {
    return adsCache;
  }

  const data = await safeFetch("/api/ads/active");

  if (!data) return [];

  adsCache = data;
  adsCacheTime = now;

  return data;
}

/* ===============================
   IMPRESSION (ONLY WHEN VISIBLE)
================================ */
function trackImpression(adId, element) {

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {

      if (entry.isIntersecting) {

        fetch(`/api/ads/impression/${adId}`, {
          method: "POST",
          credentials: "same-origin"
        });

        observer.disconnect();
      }

    });
  }, { threshold: 0.5 });

  observer.observe(element);
}

/* ===============================
   CLICK TRACK
================================ */
function trackClick(adId, element) {
  element.addEventListener("click", () => {
    fetch(`/api/ads/click/${adId}`, {
      method: "POST",
      credentials: "same-origin"
    });
  }, { once: true });
}

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", async () => {

  const slots = document.querySelectorAll("[data-ad-slot]");
  if (!slots.length) return;

  const ads = await loadAds();
  if (!ads.length) return;

  slots.forEach(slot => {

    const page = slot.dataset.page;
    const position = slot.dataset.position;

    const ad = ads.find(a =>
      a.page === page &&
      a.position === position &&
      a.enabled
    );

    if (!ad) return;

    const box = document.createElement("div");
    box.className = "ad-box";

    // sanitize injected code
    box.innerHTML = sanitizeHTML(ad.adCode);

    slot.appendChild(box);

    trackImpression(ad._id, box);
    trackClick(ad._id, box);

  });

});
