const API = "https://animehunt-backend.animehunt715.workers.dev/api/footer/public";

export async function initFooter() {
  const footer = document.querySelector(".main-footer");
  if (!footer) return;

  try {
    const res = await fetch(API);
    if (!res.ok) return;

    const cfg = await res.json();
    if (!cfg || Object.keys(cfg).length === 0) return;

    // ===== ENABLE =====
    if (!cfg.footerOn) {
      footer.style.display = "none";
      return;
    }

    // ===== THEME =====
    footer.classList.add(cfg.footerTheme?.toLowerCase() || "dark");

    // ===== BLUR =====
    if (cfg.footerBlur) {
      footer.style.backdropFilter = "blur(10px)";
    }

    // ===== LOCK =====
    if (cfg.footerLock) {
      footer.style.position = "fixed";
      footer.style.bottom = "0";
      footer.style.width = "100%";
    }

    // ===== LINKS =====
    const linksBox = footer.querySelector(".footer-links");
    if (linksBox) {

      const links = [];

      if (cfg.about) links.push({ name: "About", url: "/about.html" });
      if (cfg.privacy) links.push({ name: "Privacy", url: "/privacy.html" });
      if (cfg.disclaimer) links.push({ name: "Disclaimer", url: "/disclaimer.html" });
      if (cfg.dmca) links.push({ name: "DMCA", url: "/dmca.html" });
      if (cfg.telegram) links.push({ name: "Telegram", url: "https://t.me/toons15", ext: true });

      if (links.length) {
        linksBox.innerHTML = links.map(l => `
          <a href="${l.url}" ${l.ext ? 'target="_blank"' : ''}>
            ${l.name}
          </a>
        `).join("");
      }
    }

    // ===== MOBILE NAV =====
    if (cfg.mobileNav) {
      const nav = document.querySelector(".bottom-nav");
      if (nav) nav.style.display = "flex";
    }

  } catch (err) {
    console.warn("Footer fallback used");
  }
}
