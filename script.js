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
// Community-driven: no external API configuration

// "Mock API" Database - Simulates a massive search index
// This handles single items AND combinations
const mockApiIndex = [
    // Combinations (Priority)
    {
        keywords: ['plastic-bottle', 'cardboard-box'],
        videoId: '7lCjV9w_M28',
        title: 'Amazing Crafts with Plastic Bottles & Cardboard',
        description: 'Learn how to combine bottles and cardboard to make a stunning organizer.'
    },
    {
        keywords: ['toilet-roll', 'cardboard-box'],
        videoId: 's4vJ0wW_v1k',
        title: 'Desk Organizer from Cardboard & Rolls',
        description: 'The ultimate zero-waste desk setup using bathroom rolls and boxes.'
    },
    {
        keywords: ['glass-jar', 'wine-cork'],
        videoId: 'b5aJq_y4w7E',
        title: 'DIY Glass Jar Decor with Corks',
        description: 'Rustic home decor using leftover jars and wine corks.'
    },

    // Singles - Plastic
    {
        keywords: ['plastic-bottle'],
        videoId: 'y1as5sGHCOQ',
        title: '4 Easy DIY Planters using Plastic Bottles',
        description: 'Transform your plastic bottles into cute boho planters for your home garden.'
    },
    {
        keywords: ['plastic-container'],
        videoId: 'xPj64n4Wq6Y',
        title: 'Creative Plastic Container Reuse',
        description: 'Learn how to turn food containers into useful organizers.'
    },
    {
        keywords: ['bottle-cap'],
        videoId: 'q1j2k3l4m5n', // Placeholder ID
        title: '10 Crafts with Bottle Caps',
        description: 'Don\'t toss them! Make art, coasters, and games.'
    },

    // Singles - Paper
    {
        keywords: ['cardboard-box'],
        videoId: 'c0uu1kg6_iI',
        title: '5 Simple DIY Organizers from Cardboard',
        description: 'Make amazing storage solutions using just cardboard boxes and glue.'
    },
    {
        keywords: ['newspaper'],
        videoId: 'a1b2c3d4e5f', // Placeholder
        title: 'Woven Basket from Newspaper',
        description: 'Ancient weaving techniques using old newspapers.'
    },
    {
        keywords: ['toilet-roll'],
        videoId: 'g6h7i8j9k0l', // Placeholder
        title: 'Toilet Roll Wall Art',
        description: 'Create stunning wall decor that looks like wrought iron.'
    },

    // Singles - Fabric
    {
        keywords: ['old-tshirt'],
        videoId: 'xpyTG7oznZM',
        title: 'How to Make T-Shirt Yarn',
        description: 'Turn your old t-shirts into yarn for knitting, crochet, or weaving projects.'
    },
    {
        keywords: ['jeans'],
        videoId: 'm1n2o3p4q5r', // Placeholder
        title: 'No-Sew Denim Apron',
        description: 'Upcycle old jeans into a sturdy workshop apron.'
    },

    // Singles - Glass/Metal
    {
        keywords: ['glass-jar'],
        videoId: 'zCTp_rqKZiw',
        title: 'Magical Lanterns from Glass Jars',
        description: 'Create beautiful decorative lanterns using simple materials and glass jars.'
    },
    {
        keywords: ['tin-can'],
        videoId: 's1t2u3v4w5x', // Placeholder
        title: 'Tin Can Cutlery Holder',
        description: 'Rustic chic storage for your kitchen utensils.'
    },
    
    // Singles - Organic
    {
        keywords: ['coffee-grounds'],
        videoId: 'y1z2a3b4c5d', // Placeholder
        title: 'Coffee Ground Body Scrub',
        description: 'Turn morning waste into a luxurious skincare product.'
    }
];

// State
const selectedItems = new Set();
let userVideos = [];
let db;

// DOM Elements
const itemsGrid = document.getElementById('items-grid');
const searchBtn = document.getElementById('search-btn');
const resultsSection = document.getElementById('results-section');
const resultsGrid = document.getElementById('results-grid');
const tagsGrid = document.getElementById('tags-grid');
const tutorialForm = document.getElementById('tutorial-form');

// Initialize
async function init() {
    if (itemsGrid) {
        initItems();
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    initSubmission();
    await initDb();
    await loadUserVideos();
}

// Initialize Items Grid
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

function initSubmission() {
    if (tagsGrid) {
        tagsGrid.innerHTML = '';
        recyclableItems.forEach(item => {
            const wrap = document.createElement('label');
            wrap.className = 'tag-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = item.id;
            const text = document.createElement('span');
            text.textContent = `${item.icon} ${item.name}`;
            wrap.appendChild(checkbox);
            wrap.appendChild(text);
            tagsGrid.appendChild(wrap);
        });
    }
    if (tutorialForm) {
        tutorialForm.addEventListener('submit', onSubmitTutorial);
    }
}

function onSubmitTutorial(e) {
    e.preventDefault();
    const title = document.getElementById('video-title').value.trim();
    const fileInput = document.getElementById('video-file');
    const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
    const desc = document.getElementById('video-desc').value.trim();
    const tags = Array.from(tagsGrid.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
    if (!title || !file || tags.length === 0) return;
    const id = Date.now().toString();
    const record = { id, title, description: desc, tags };
    saveVideo(record, file).then(async () => {
        const url = URL.createObjectURL(file);
        userVideos.push({ id, title, description: desc, tags, url });
    });
    tutorialForm.reset();
}

async function initDb() {
    db = await new Promise((resolve, reject) => {
        const req = indexedDB.open('recycle_db', 1);
        req.onupgradeneeded = () => {
            const d = req.result;
            if (!d.objectStoreNames.contains('videos')) {
                const store = d.createObjectStore('videos', { keyPath: 'id' });
                store.createIndex('tags', 'tags', { multiEntry: true });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveVideo(meta, file) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('videos', 'readwrite');
        const store = tx.objectStore('videos');
        store.put({ ...meta, file });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function loadUserVideos() {
    userVideos = await new Promise((resolve) => {
        const tx = db.transaction('videos', 'readonly');
        const store = tx.objectStore('videos');
        const req = store.getAll();
        req.onsuccess = () => {
            const items = (req.result || []).map(v => ({ id: v.id, title: v.title, description: v.description || '', tags: v.tags || [], url: v.file ? URL.createObjectURL(v.file) : '' }));
            resolve(items);
        };
        req.onerror = () => resolve([]);
    });
}
// Toggle Item Selection
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
        searchBtn.textContent = `Search Projects for ${selectedItems.size} Item${selectedItems.size > 1 ? 's' : ''} 🔍`;
    } else {
        searchBtn.disabled = true;
        searchBtn.textContent = 'Select Items to Search 🔍';
    }
}

// Main Search Handler
async function handleSearch() {
    if (selectedItems.size === 0) return;
    
    // UI: Show Loading State
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching APIs... ⏳';
    resultsSection.hidden = false;
    resultsGrid.innerHTML = '<div class="loader">Searching global database for recycling projects...</div>';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    // 1. Construct Query
    const query = constructSearchQuery();
    
    try {
        // 2. Fetch Data (Real or Mock)
        const videos = await fetchVideos(query);
        
        // 3. Display Results
        displayResults(videos);
    } catch (error) {
        console.error("Search failed:", error);
        resultsGrid.innerHTML = '<p class="error">Oops! Something went wrong while searching. Please try again.</p>';
    } finally {
        updateSearchButton();
    }
}

// Logic: Construct a smart search query
function constructSearchQuery() {
    const itemNames = Array.from(selectedItems).map(id => {
        return recyclableItems.find(i => i.id === id).name;
    });
    
    // Example: "DIY recycled crafts using Plastic Bottle and Newspaper"
    return `DIY recycled crafts using ${itemNames.join(' and ')}`;
}

// API: Fetch Videos
async function fetchVideos(query) {
    // Simulate Network Delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    const local = await searchLocalVideos();
    return local;
}

// Removed proxy-based search; purely community + curated examples

// API: Mock Implementation (Smart Search)
function mockApiSearch() {
    return [];
}

async function searchLocalVideos() {
    const ids = Array.from(selectedItems);
    if (ids.length === 0) return [];
    const matches = userVideos.filter(v => ids.every(t => v.tags.includes(t)));
    return matches.map(v => ({
        videoUrl: v.url,
        title: v.title,
        description: v.description || '',
        relatedItem: 'Community'
    }));
}
// Display Results
function displayResults(results) {
    resultsGrid.innerHTML = '';
    
    if (results.length === 0) {
        resultsGrid.innerHTML = '<p>No specific videos found for this combination. Try selecting fewer items!</p>';
        return;
    }

    results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        card.innerHTML = `
            <div class="video-container">
                <video src="${result.videoUrl}" controls></video>
            </div>
            <div class="result-content">
                <h3>${result.title}</h3>
                <p>${result.description}</p>
                <div class="tag-container">
                    <span class="result-tag">${result.relatedItem}</span>
                </div>
            </div>
        `;
        
        resultsGrid.appendChild(card);
    });
}

// Start
init();
