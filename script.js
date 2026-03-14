// CONFIGURATION
const API_BASE_URL = "https://animehunt-backend.animehunt715.workers.dev/api"; 
let allContent = []; 

document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupGlobalListeners();
});

// 1. INITIALIZE APP
async function initApp() {
    try {
        const response = await fetch(`${API_BASE_URL}/get-content`); // CMS se data mangna
        allContent = await response.json();
        
        // Initial View: Home Rows & Banner
        renderHomeLayout();
    } catch (error) {
        console.error("D1 Database se connect karne mein error:", error);
    }
}

// 2. RENDER HOME LAYOUT (13 ROWS)
function renderHomeLayout() {
    // Hero Banner Setup
    updateHeroSection();

    // Reset View: Display rows, Hide grid
    document.querySelectorAll('.movie-row').forEach(row => row.style.display = 'block');
    document.querySelector('.home-grid').style.display = 'none';
    document.getElementById('homeHeroBanner').style.display = 'flex';

    // 13 Rows mein data distribute karna
    const scrollContainers = document.querySelectorAll('.movie-scroll');
    scrollContainers.forEach(container => {
        const category = container.getAttribute('data-row'); // Ongoing, Trending, etc.
        const rowData = allContent.filter(item => item.category === category);
        
        container.innerHTML = rowData.length > 0 
            ? rowData.map(item => createThumbnailHTML(item)).join('')
            : `<p class="no-data">Coming Soon...</p>`;
    });
}

// 3. THUMBNAIL HTML TEMPLATE
function createThumbnailHTML(item) {
    // ImageKit optimization (Optional: w=300 resize for speed)
    const optimizedThumb = item.thumbnail_url; 

    return `
        <div class="movie-card" onclick="openWatchPage('${item.id}')">
            <div class="thumbnail-container">
                <img src="${optimizedThumb}" alt="${item.title}" loading="lazy">
                <span class="card-quality">${item.type.toUpperCase()}</span>
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

// 4. HERO SECTION LOGIC (ADMIN CONTROLLED)
function updateHeroSection() {
    // CMS mein agar 'is_banner' column hai toh wo use karo, warna latest trending
    const bannerItem = allContent.find(i => i.is_banner === 1) || allContent[0];
    
    if (bannerItem) {
        const hero = document.getElementById('homeHeroBanner');
        const playBtn = hero.querySelector('.play-btn');
        const title = hero.querySelector('.hero-title');

        // CMS Dynamic Title & Background
        title.innerHTML = bannerItem.title.replace(" ", "<br>");
        hero.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.1), #000), url('${bannerItem.thumbnail_url}')`;

        // Play Button Event
        playBtn.onclick = () => openWatchPage(bannerItem.id);
    }
}

// 5. FILTER & A-Z NAVIGATION LOGIC
function applyFilter(mode, value) {
    const hero = document.getElementById('homeHeroBanner');
    const rows = document.querySelectorAll('.movie-row');
    const grid = document.querySelector('.home-grid');

    if (value === 'ALL') {
        renderHomeLayout();
        return;
    }

    // UI Toggle: Rows OFF, Grid ON
    hero.style.display = 'none';
    rows.forEach(r => r.style.display = 'none');
    grid.style.display = 'grid';

    let filteredData = [];
    if (mode === 'GENRE') {
        // CMS 'genre' column check (Action, Series, etc.)
        filteredData = allContent.filter(item => item.genre.toUpperCase() === value.toUpperCase());
    } else if (mode === 'AZ') {
        filteredData = allContent.filter(item => item.title.toUpperCase().startsWith(value));
    }

    grid.innerHTML = filteredData.length > 0 
        ? filteredData.map(item => createThumbnailHTML(item)).join('')
        : `<div class="no-results">No Content Found in "${value}"</div>`;
}

// 6. GLOBAL EVENT LISTENERS
function setupGlobalListeners() {
    // Category Bar (Action, Series, etc.)
    document.querySelectorAll('.category-bar button').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelector('.category-bar button.active').classList.remove('active');
            e.target.classList.add('active');
            applyFilter('GENRE', e.target.innerText);
        };
    });

    // A-Z Nav
    document.querySelectorAll('.az-nav span').forEach(span => {
        span.onclick = () => applyFilter('AZ', span.innerText);
    });

    // Sidebar
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    const closeBtn = document.querySelector('.close-btn');

    const toggleSidebar = (state) => {
        sidebar.classList.toggle('active', state);
        overlay.classList.toggle('active', state);
    };

    menuBtn.onclick = () => toggleSidebar(true);
    closeBtn.onclick = () => toggleSidebar(false);
    overlay.onclick = () => toggleSidebar(false);
}

// 7. ROUTING
function openWatchPage(id) {
    window.location.href = `watch.html?id=${id}`;
}
