// YouTube API Configuration (Proxied via Netlify Functions)
// If hosting locally or on Netlify, use relative path. 
// If on GitHub Pages, you must point to your deployed Netlify Functions URL.
const API_BASE = '/.netlify/functions'; 

// Recyclable Items Data
const recyclableItems = [
    // Plastic
    { id: 'plastic-bottle', name: 'Plastic Bottle', icon: '🥤', category: 'Plastic' },
    { id: 'plastic-container', name: 'Food Container', icon: '🥡', category: 'Plastic' },
    { id: 'plastic-bag', name: 'Plastic Bag', icon: '🛍️', category: 'Plastic' },
    { id: 'bottle-cap', name: 'Bottle Caps', icon: '🔴', category: 'Plastic' },
    
    // Paper/Cardboard
    { id: 'cardboard-box', name: 'Cardboard Box', icon: '📦', category: 'Paper' },
    { id: 'toilet-roll', name: 'Toilet Roll', icon: '🧻', category: 'Paper' },
    { id: 'newspaper', name: 'Newspaper', icon: '📰', category: 'Paper' },
    { id: 'egg-carton', name: 'Egg Carton', icon: '🥚', category: 'Paper' },
    { id: 'cereal-box', name: 'Cereal Box', icon: '🥣', category: 'Paper' },
    { id: 'pizza-box', name: 'Pizza Box', icon: '🍕', category: 'Paper' },
    
    // Glass/Metal
    { id: 'glass-jar', name: 'Glass Jar', icon: '🫙', category: 'Glass' },
    { id: 'glass-bottle', name: 'Glass Bottle', icon: '🍾', category: 'Glass' },
    { id: 'tin-can', name: 'Tin Can', icon: '🥫', category: 'Metal' },
    { id: 'soda-can', name: 'Soda Can', icon: '🥤', category: 'Metal' },
    
    // Fabric/Textiles
    { id: 'old-tshirt', name: 'Old T-Shirt', icon: '👕', category: 'Fabric' },
    { id: 'jeans', name: 'Old Jeans', icon: '👖', category: 'Fabric' },
    { id: 'socks', name: 'Old Socks', icon: '🧦', category: 'Fabric' },
    
    // Electronics/Other
    { id: 'cd-dvd', name: 'Old CD/DVD', icon: '💿', category: 'Electronics' },
    { id: 'coffee-grounds', name: 'Coffee Grounds', icon: '☕', category: 'Organic' },
    { id: 'egg-shells', name: 'Egg Shells', icon: '🥚', category: 'Organic' },
    { id: 'wine-cork', name: 'Wine Cork', icon: '🍾', category: 'Other' }
];

// State
const selectedItems = new Set();

// DOM Elements
const itemsGrid = document.getElementById('items-grid');
const searchBtn = document.getElementById('search-btn');
const resultsSection = document.getElementById('results-section');
const resultsGrid = document.getElementById('results-grid');

// Initialize
function init() {
    if (itemsGrid) initItems();
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
}

function initItems() {
    itemsGrid.innerHTML = '';
    recyclableItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.id = item.id;
        card.onclick = () => toggleItem(item.id);
        
        card.innerHTML = `
            <span class="item-icon">${item.icon}</span>
            <span class="item-name">${item.name}</span>
            <span class="item-category">${item.category}</span>
        `;
        
        itemsGrid.appendChild(card);
    });
}

function toggleItem(itemId) {
    const card = document.querySelector(`.item-card[data-id="${itemId}"]`);
    
    if (selectedItems.has(itemId)) {
        selectedItems.delete(itemId);
        card.classList.remove('selected');
    } else {
        selectedItems.add(itemId);
        card.classList.add('selected');
    }
    
    updateSearchButton();
}

function updateSearchButton() {
    if (selectedItems.size > 0) {
        searchBtn.disabled = false;
        searchBtn.textContent = `Search YouTube for ${selectedItems.size} Item${selectedItems.size > 1 ? 's' : ''} 🔍`;
    } else {
        searchBtn.disabled = true;
        searchBtn.textContent = 'Select Items to Search 🔍';
    }
}

async function handleSearch() {
    if (selectedItems.size === 0) return;
    
    // UI: Show Loading State
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching YouTube... ⏳';
    resultsSection.hidden = false;
    resultsGrid.innerHTML = '<div class="loader">Searching YouTube for recycling tutorials...</div>';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    // 1. Construct Query
    const query = constructSearchQuery();
    
    try {
        // 2. Fetch Data from YouTube
        const videos = await fetchVideos(query);
        
        // 3. Display Results
        displayResults(videos);
    } catch (error) {
        console.error("Search failed:", error);
        resultsGrid.innerHTML = `<p class="error">Oops! ${error.message}</p>`;
    } finally {
        updateSearchButton();
    }
}

function constructSearchQuery() {
    const itemNames = Array.from(selectedItems).map(id => {
        return recyclableItems.find(i => i.id === id).name;
    });
    return `DIY recycled crafts using ${itemNames.join(' and ')}`;
}

async function fetchVideos(query) {
    if (YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
        throw new Error('Missing API Key. Please configure YOUTUBE_API_KEY in script.js');
    }

    const params = new URLSearchParams({
        part: 'snippet',
        q: query,
        key: YOUTUBE_API_KEY,
        type: 'video',
        maxResults: 12
    });

    const res = await fetch(`${API_URL}?${params.toString()}`);
    const data = await res.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url
    }));
}

function displayResults(results) {
    resultsGrid.innerHTML = '';
    
    if (results.length === 0) {
        resultsGrid.innerHTML = '<p>No videos found for this combination.</p>';
        return;
    }

    results.forEach(video => {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        card.innerHTML = `
            <div class="video-container">
                <iframe width="100%" height="200" src="https://www.youtube.com/embed/${video.id}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="result-content">
                <h3>${video.title}</h3>
                <p>${video.description}</p>
                <div class="tag-container">
                    <span class="result-tag">YouTube</span>
                </div>
            </div>
        `;
        
        resultsGrid.appendChild(card);
    });
}

// Start
init();
