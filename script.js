import { api } from "./js/api.js";

let allContent = [];

document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupGlobalListeners();
});

// INIT
async function initApp() {
    try {
        allContent = await api.getContent();
        renderHomeLayout();
    } catch (error) {
        console.error("Backend error:", error);
    }
}

// HOME RENDER
function renderHomeLayout() {
    updateHeroSection();

    document.querySelectorAll('.movie-row').forEach(row => row.style.display = 'block');
    document.querySelector('.home-grid').style.display = 'none';
    document.getElementById('homeHeroBanner').style.display = 'flex';

    document.querySelectorAll('.movie-scroll').forEach(container => {
        const category = container.dataset.row;

        const rowData = allContent.filter(item => item.category === category);

        container.innerHTML = rowData.length
            ? rowData.map(createThumbnailHTML).join('')
            : `<p class="no-data">Coming Soon...</p>`;
    });
}

// CARD
function createThumbnailHTML(item) {
    return `
        <div class="movie-card" data-id="${item.id}">
            <div class="thumbnail-container">
                <img src="${item.thumbnail_url}" alt="${item.title}" loading="lazy">
                <span class="card-quality">${item.type?.toUpperCase() || ''}</span>
            </div>
            <div class="card-details">
                <p class="card-title">${item.title}</p>
                <div class="card-meta">
                    <span>${item.year}</span>
                    <span>⭐ ${item.rating || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

// HERO
function updateHeroSection() {
    const bannerItem = allContent.find(i => i.is_banner === 1) || allContent[0];
    if (!bannerItem) return;

    const hero = document.getElementById('homeHeroBanner');
    const playBtn = hero.querySelector('.play-btn');
    const title = hero.querySelector('.hero-title');

    title.innerHTML = bannerItem.title.replace(" ", "<br>");
    hero.style.backgroundImage =
        `linear-gradient(to bottom, rgba(0,0,0,0.1), #000), url('${bannerItem.thumbnail_url}')`;

    playBtn.onclick = () => openWatchPage(bannerItem.id);
}

// FILTER
function applyFilter(mode, value) {
    const hero = document.getElementById('homeHeroBanner');
    const rows = document.querySelectorAll('.movie-row');
    const grid = document.querySelector('.home-grid');

    if (value === 'ALL') {
        renderHomeLayout();
        return;
    }

    hero.style.display = 'none';
    rows.forEach(r => r.style.display = 'none');
    grid.style.display = 'grid';

    let filteredData = [];

    if (mode === 'GENRE') {
        filteredData = allContent.filter(
            item => item.genre?.toUpperCase() === value.toUpperCase()
        );
    } else if (mode === 'AZ') {
        filteredData = allContent.filter(
            item => item.title?.toUpperCase().startsWith(value)
        );
    }

    grid.innerHTML = filteredData.length
        ? filteredData.map(createThumbnailHTML).join('')
        : `<div class="no-results">No Content Found</div>`;
}

// EVENTS
function setupGlobalListeners() {

    // CATEGORY
    document.querySelectorAll('.category-bar button').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelector('.category-bar button.active')?.classList.remove('active');
            e.target.classList.add('active');
            applyFilter('GENRE', e.target.innerText);
        };
    });

    // A-Z
    document.querySelectorAll('.az-nav span').forEach(span => {
        span.onclick = () => applyFilter('AZ', span.innerText);
    });

    // EVENT DELEGATION (IMPORTANT FIX)
    document.body.addEventListener("click", (e) => {
        const card = e.target.closest(".movie-card");
        if (card) {
            openWatchPage(card.dataset.id);
        }
    });

    // SIDEBAR
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');

    const toggleSidebar = (state) => {
        sidebar.classList.toggle('active', state);
        overlay.classList.toggle('active', state);
    };

    document.querySelector('.menu-btn').onclick = () => toggleSidebar(true);
    document.querySelector('.close-btn').onclick = () => toggleSidebar(false);
    overlay.onclick = () => toggleSidebar(false);
}

// ROUTING
function openWatchPage(id) {
    window.location.href = `watch.html?id=${id}`;
}
