const API = "https://animehunt-backend.animehunt715.workers.dev/api/sidebar/public";

export async function initSidebar() {

  const sidebar = document.querySelector(".sidebar");
  const menu = document.querySelector(".sidebar-menu");
  const overlay = document.querySelector(".overlay");
  const openBtn = document.querySelector(".menu-btn");
  const closeBtn = document.querySelector(".close-btn");

  if (!menu) return;

  /* =========================
  LOAD ITEMS
  ========================= */

  try {

    const res = await fetch(API);
    if (!res.ok) throw new Error("API failed");

    const items = await res.json();

    if (!items || !items.length) {
      console.warn("No sidebar items");
      return;
    }

    // clear fallback menu
    menu.innerHTML = "";

    items.forEach(i => {

      /* =========================
      DEVICE FILTER
      ========================= */

      if (i.device === "Mobile" && window.innerWidth > 768) return;
      if (i.device === "Desktop" && window.innerWidth <= 768) return;

      /* =========================
      LINK BUILD
      ========================= */

      const a = document.createElement("a");

      a.href = i.url || "#";

      if (i.newTab) a.target = "_blank";

      /* =========================
      HIGHLIGHT BADGE
      ========================= */

      let highlight = "";

      if (i.highlight && i.highlight !== "None") {
        highlight = `<small class="badge">${i.highlight}</small>`;
      }

      /* =========================
      CUSTOM BADGE TEXT
      ========================= */

      let badge = "";

      if (i.badge) {
        badge = `<small class="badge-text">${i.badge}</small>`;
      }

      a.innerHTML = `
        <span class="icon">${i.icon || ""}</span>
        <span class="text">${i.title}</span>
        ${highlight}
        ${badge}
      `;

      /* =========================
      AUTO CLOSE ON CLICK (MOBILE)
      ========================= */

      a.onclick = () => {
        if (window.innerWidth < 768) closeSidebar();
      };

      menu.appendChild(a);

    });

  } catch (err) {
    console.warn("Sidebar fallback used");
  }

  /* =========================
  TOGGLE SYSTEM
  ========================= */

  function openSidebar() {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  openBtn?.addEventListener("click", openSidebar);
  closeBtn?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);

  /* =========================
  ESC CLOSE
  ========================= */

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

}
