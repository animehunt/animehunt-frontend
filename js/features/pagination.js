export function renderPagination(el, page, totalPages, onChange) {
  if (!el) return;

  let html = "";

  if (page > 1) {
    html += `<button data-page="${page - 1}">Prev</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="${i === page ? "active" : ""}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  if (page < totalPages) {
    html += `<button data-page="${page + 1}">Next</button>`;
  }

  el.innerHTML = html;

  el.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      const p = Number(btn.dataset.page);
      onChange(p);
    };
  });
}
