const API_BASE = '/.netlify/functions';

const recyclableItems = [
    { id: 'plastic-bottle', name: 'Plastic Bottle', icon: '🥤', category: 'Plastic' },
    { id: 'plastic-container', name: 'Food Container', icon: '🥡', category: 'Plastic' },
    { id: 'plastic-bag', name: 'Plastic Bag', icon: '🛍️', category: 'Plastic' },
    { id: 'bottle-cap', name: 'Bottle Caps', icon: '🔴', category: 'Plastic' },
    { id: 'cardboard-box', name: 'Cardboard Box', icon: '📦', category: 'Paper' },
    { id: 'toilet-roll', name: 'Toilet Roll', icon: '🧻', category: 'Paper' },
    { id: 'newspaper', name: 'Newspaper', icon: '📰', category: 'Paper' },
    { id: 'egg-carton', name: 'Egg Carton', icon: '🥚', category: 'Paper' },
    { id: 'cereal-box', name: 'Cereal Box', icon: '🥣', category: 'Paper' },
    { id: 'pizza-box', name: 'Pizza Box', icon: '🍕', category: 'Paper' },
    { id: 'glass-jar', name: 'Glass Jar', icon: '🍯', category: 'Glass' },
    { id: 'glass-bottle', name: 'Glass Bottle', icon: '🍾', category: 'Glass' },
    { id: 'tin-can', name: 'Tin Can', icon: '🥫', category: 'Metal' },
    { id: 'soda-can', name: 'Soda Can', icon: '🥤', category: 'Metal' },
    { id: 'old-tshirt', name: 'Old T-Shirt', icon: '👕', category: 'Fabric' },
    { id: 'jeans', name: 'Old Jeans', icon: '👖', category: 'Fabric' },
    { id: 'socks', name: 'Old Socks', icon: '🧦', category: 'Fabric' },
    { id: 'cd-dvd', name: 'Old CD/DVD', icon: '💿', category: 'Electronics' },
    { id: 'coffee-grounds', name: 'Coffee Grounds', icon: '☕', category: 'Organic' },
    { id: 'egg-shells', name: 'Egg Shells', icon: '🥚', category: 'Organic' },
    { id: 'wine-cork', name: 'Wine Cork', icon: '🍾', category: 'Other' }
];

const selectedItems = new Set();
let itemsGrid, resultsSection, resultsGrid, searchBtn;

function init() {
    itemsGrid = document.getElementById('items-grid');
    resultsSection = document.getElementById('results-section');
    resultsGrid = document.getElementById('results-grid');
    searchBtn = document.getElementById('search-btn');

    if (itemsGrid) renderItems();
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
        updateSearchButton();
    }
}

function renderItems() {
    itemsGrid.innerHTML = '';
    recyclableItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.id = item.id;
        card.innerHTML = `
            <span class="item-icon">${item.icon}</span>
            <span class="item-name">${item.name}</span>
            <span class="item-category">${item.category}</span>
        `;
        card.addEventListener('click', () => toggleItem(item.id));
        itemsGrid.appendChild(card);
    });
}

function toggleItem(itemId) {
    const card = document.querySelector(`.item-card[data-id="${itemId}"]`);
    if (selectedItems.has(itemId)) {
        selectedItems.delete(itemId);
        if (card) card.classList.remove('selected');
    } else {
        selectedItems.add(itemId);
        if (card) card.classList.add('selected');
    }
    updateSearchButton();
}

function updateSearchButton() {
    if (!searchBtn) return;
    const count = selectedItems.size;
    searchBtn.disabled = count === 0;
    searchBtn.textContent = count > 0 
        ? `Search YouTube for ${count} Item${count > 1 ? 's' : ''} 🔍` 
        : 'Select Items to Search 🔍';
}

async function handleSearch() {
    if (selectedItems.size === 0) return;

    const originalText = searchBtn.textContent;
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching YouTube... ⏳';

    resultsSection.hidden = false;
    resultsGrid.innerHTML = '<div class="loader">Finding the best recycling tutorials for you...</div>';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
        const query = constructQuery();
        const videos = await fetchVideos(query);
        displayResults(videos);
    } catch (error) {
        console.error('Search failed:', error);
        resultsGrid.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #ef4444;">
                <p>Oops! Something went wrong while searching.</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
                <button onclick="handleSearch()" class="secondary-button" style="margin-top: 1rem;">Try Again</button>
            </div>
        `;
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = originalText;
        updateSearchButton();
    }
}

function constructQuery() {
    const names = Array.from(selectedItems).map(id => recyclableItems.find(i => i.id === id)?.name || id);
    return `DIY recycling tutorial using ${names.join(' and ')}`;
}

async function fetchVideos(query) {
    const response = await fetch(`${API_BASE}/get-youtube-videos?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || ''
    }));
}

function displayResults(videos) {
    resultsGrid.innerHTML = '';
    if (!videos || videos.length === 0) {
        resultsGrid.innerHTML = `
            <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
                <p style="font-size: 1.25rem; color: var(--neutral-600);">No tutorials found for this combination.</p>
                <p style="margin-top: 0.5rem; color: var(--neutral-400);">Try selecting different items or fewer categories.</p>
            </div>
        `;
        return;
    }

    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="video-container">
                <iframe 
                    src="https://www.youtube.com/embed/${video.id}" 
                    title="${video.title}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            <div class="result-content">
                <h3>${video.title}</h3>
                <p>${video.description}</p>
            </div>
        `;
        resultsGrid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', init);
