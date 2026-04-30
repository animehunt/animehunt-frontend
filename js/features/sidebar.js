const API = "https://animehunt-backend.animehunt715.workers.dev/api/sidebar/public";

export async function initSidebar() {
  const menu = document.querySelector(".sidebar-menu");
  if (!menu) return;

  try {
    const res = await fetch(API);
    if (!res.ok) return;

    const items = await res.json();
    if (!items || !items.length) return;

    // clear static (fallback remove only if success)
    menu.innerHTML = "";

    items.forEach(i => {
      const a = document.createElement("a");

      a.href = i.url || "#";
      if (i.newTab) a.target = "_blank";

      let badge = "";
      if (i.highlight && i.highlight !== "None") {
        badge = `<small style="
          font-size:9px;
          margin-left:5px;
          padding:2px 4px;
          border-radius:4px;
          background:#ffcc00;
          color:#000
        ">${i.highlight}</small>`;
      }

      a.innerHTML = `
        ${i.icon || ""} ${i.title}
        ${badge}
      `;

      menu.appendChild(a);
    });

  } catch (err) {
    console.warn("Sidebar fallback used");
  }
}
