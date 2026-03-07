// configuration
const API_URL = "https://animehunt-backend.animehunt715.workers.dev/api/movies"; 
let allMovies = []; // Global variable sara data store karne ke liye

document.addEventListener("DOMContentLoaded", () => {
    fetchMovies();
    setupEventListeners();
});

// 1. DATA FETCHING FROM D1 (VIA WORKER)
async function fetchMovies() {
    try {
        const response = await fetch(API_URL);
        allMovies = await response.json();
        
        renderHomeRows(); // Default view: Rows dikhao
        updateHeroBanner(); // Hero banner update karo
    } catch (error) {
        console.error("Data fetch karne mein error:", error);
    }
}

// 2. RENDER ROWS (HOME VIEW)
function renderHomeRows() {
    const rows = document.querySelectorAll('.movie-scroll');
    
    rows.forEach(row => {
        const category = row.getAttribute('data-row');
        // Filter movies for this specific row
        const filtered = allMovies.filter(m => m.category === category);
        
        row.innerHTML = filtered.map(movie => createMovieCard(movie)).join('');
    });
}

// 3. MOVIE CARD HTML TEMPLATE
function createMovieCard(movie) {
    return `
        <div class="movie-card" onclick="goToWatch('${movie.id}')">
            <img src="${movie.thumbnail_url}" alt="${movie.title}" loading="lazy">
            <div class="card-info">
                <p class="card-title">${movie.title}</p>
                <span class="card-year">${movie.year}</span>
            </div>
        </div>
    `;
}

// 4. FILTER LOGIC (HIDE ROWS, SHOW GRID)
function applyFilter(filterType, value) {
    const rowsSection = document.querySelectorAll('.movie-row');
    const heroSection = document.querySelector('.hero-banner');
    const gridSection = document.querySelector('.home-grid');

    if (value === 'ALL') {
        // Sab normal kar do
        rowsSection.forEach(r => r.style.display = 'block');
        heroSection.style.display = 'flex';
        gridSection.style.display = 'none';
        renderHomeRows();
    } else {
        // Rows aur Hero hide karo, Grid dikhao
        rowsSection.forEach(r => r.style.display = 'none');
        heroSection.style.display = 'none';
        gridSection.style.display = 'grid';

        let filtered;
        if (filterType === 'genre') {
            filtered = allMovies.filter(m => m.genre.toUpperCase() === value.toUpperCase());
        } else if (filterType === 'az') {
            filtered = allMovies.filter(m => m.title.toUpperCase().startsWith(value));
        }

        gridSection.innerHTML = filtered.length > 0 
            ? filtered.map(movie => createMovieCard(movie)).join('')
            : `<p class="no-results">No movies found for "${value}"</p>`;
    }
}

// 5. HERO BANNER LOGIC
function updateHeroBanner() {
    const playBtn = document.querySelector('.play-btn');
    // Maan lijiye list ki pehli movie banner par hai
    if (allMovies.length > 0) {
        playBtn.onclick = () => goToWatch(allMovies[0].id);
    }
}

// 6. NAVIGATION FUNCTIONS
function goToWatch(id) {
    window.location.href = `watch.html?id=${id}`;
}

// 7. EVENT LISTENERS SETUP
function setupEventListeners() {
    // Category Buttons
    document.querySelectorAll('.category-bar button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.category-bar button.active').classList.remove('active');
            e.target.classList.add('active');
            applyFilter('genre', e.target.innerText);
        });
    });

    // A-Z Navigation
    document.querySelectorAll('.az-nav span').forEach(span => {
        span.addEventListener('click', () => {
            applyFilter('az', span.innerText);
        });
    });

    // Sidebar Toggle
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    const closeBtn = document.querySelector('.close-btn');

    menuBtn.onclick = () => { sidebar.classList.add('active'); overlay.classList.add('active'); };
    closeBtn.onclick = () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); };
    overlay.onclick = () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); };
}
