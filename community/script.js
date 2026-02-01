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
const itemsGrid = document.getElementById('items-grid');
const searchBtn = document.getElementById('search-btn');
const resultsSection = document.getElementById('results-section');
const resultsGrid = document.getElementById('results-grid');
const tagsGrid = document.getElementById('tags-grid');
const tutorialForm = document.getElementById('tutorial-form');
const dropzone = document.getElementById('dropzone');
const chooseFileBtn = document.getElementById('choose-file');
const videoFileInput = document.getElementById('video-file');
const previewWrap = document.getElementById('preview');
const previewVideo = document.getElementById('preview-video');
const wizardSteps = document.querySelectorAll('.wizard-step');
const wizardPanels = document.querySelectorAll('.wizard-panel');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
const publishBtn = document.getElementById('publish-btn');
const exportBtn = document.getElementById('export-library');
const importInput = document.getElementById('import-library');
let currentStep = 1;
let currentFile = null;
function init() {
    if (itemsGrid) initItems();
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    initSubmission();
    initWizard();
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
function initWizard() {
    if (!dropzone) return;
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files && e.dataTransfer.files[0] ? e.dataTransfer.files[0] : null;
        if (file) setFile(file);
    });
    if (chooseFileBtn && videoFileInput) {
        chooseFileBtn.addEventListener('click', () => videoFileInput.click());
        videoFileInput.addEventListener('change', () => {
            const file = videoFileInput.files && videoFileInput.files[0] ? videoFileInput.files[0] : null;
            if (file) setFile(file);
        });
    }
    if (backBtn && nextBtn && publishBtn) {
        backBtn.addEventListener('click', () => goStep(currentStep - 1));
        nextBtn.addEventListener('click', () => goStep(currentStep + 1));
        publishBtn.addEventListener('click', publishWizard);
    }
    if (exportBtn) exportBtn.addEventListener('click', exportLibrary);
    if (importInput) importInput.addEventListener('change', importLibrary);
    goStep(1);
}
function setFile(file) {
    currentFile = file;
    const url = URL.createObjectURL(file);
    if (previewWrap && previewVideo) {
        previewWrap.hidden = false;
        previewVideo.src = url;
    }
}
function goStep(n) {
    if (n < 1) n = 1;
    if (n > 4) n = 4;
    if (n === 2 && !currentFile) return;
    if (n === 4) { nextBtn.hidden = true; publishBtn.hidden = false; }
    else { nextBtn.hidden = false; publishBtn.hidden = true; }
    backBtn.disabled = n === 1;
    currentStep = n;
    wizardSteps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === n));
    wizardPanels.forEach(p => p.hidden = Number(p.dataset.step) !== n);
}
async function publishWizard() {
    const title = document.getElementById('video-title') ? document.getElementById('video-title').value.trim() : '';
    const desc = document.getElementById('video-desc') ? document.getElementById('video-desc').value.trim() : '';
    const tags = Array.from(tagsGrid ? tagsGrid.querySelectorAll('input[type="checkbox"]:checked') : []).map(c => c.value);
    if (!currentFile || !title || tags.length === 0) { alert('Please fill in all fields and upload a video.'); return; }
    const originalBtnText = publishBtn.textContent;
    publishBtn.textContent = 'Uploading... ⏳';
    publishBtn.disabled = true;
    try {
        await uploadToCloudinary(currentFile, { title, description: desc, tags });
        alert('Published Successfully! 🎉 Your video is now live.');
        document.getElementById('tutorial-form').reset();
        if(document.getElementById('video-title')) document.getElementById('video-title').value = '';
        if(document.getElementById('video-desc')) document.getElementById('video-desc').value = '';
        if(tagsGrid) tagsGrid.querySelectorAll('input').forEach(i => i.checked = false);
        currentFile = null;
        if (previewWrap) previewWrap.hidden = true;
        if (dropzone) { dropzone.classList.remove('active'); dropzone.querySelector('.dropzone-inner').hidden = false; }
        goStep(1);
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + error.message);
    } finally {
        publishBtn.textContent = originalBtnText;
        publishBtn.disabled = false;
    }
}
async function uploadToCloudinary(file, meta) {
    const sigResponse = await fetch(`${API_BASE}/get-signature`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: meta.tags.join(','), title: meta.title, description: meta.description })
    });
    if (!sigResponse.ok) throw new Error('Failed to initialize upload');
    const sigData = await sigResponse.json();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sigData.api_key);
    formData.append('timestamp', sigData.timestamp);
    formData.append('signature', sigData.signature);
    formData.append('folder', sigData.folder);
    formData.append('tags', sigData.tags);
    formData.append('context', sigData.context);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/video/upload`;
    const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
    if (!uploadResponse.ok) { const err = await uploadResponse.json(); throw new Error(err.error?.message || 'Upload failed'); }
    return await uploadResponse.json();
}
function toggleItem(itemId) {
    const card = document.querySelector(`.item-card[data-id="${itemId}"]`);
    if (selectedItems.has(itemId)) { selectedItems.delete(itemId); card.classList.remove('selected'); }
    else { selectedItems.add(itemId); card.classList.add('selected'); }
    updateSearchButton();
}
function updateSearchButton() {
    if (selectedItems.size > 0) { searchBtn.disabled = false; searchBtn.textContent = `Search Projects for ${selectedItems.size} Item${selectedItems.size > 1 ? 's' : ''} 🔍`; }
    else { searchBtn.disabled = true; searchBtn.textContent = 'Select Items to Search 🔍'; }
}
async function handleSearch() {
    if (selectedItems.size === 0) return;
    searchBtn.disabled = true; searchBtn.textContent = 'Searching APIs... ⏳';
    resultsSection.hidden = false;
    resultsGrid.innerHTML = '<div class="loader">Searching global database for recycling projects...</div>';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    const query = constructSearchQuery();
    try {
        const videos = await fetchVideos(query);
        displayResults(videos);
    } catch (error) {
        console.error("Search failed:", error);
        resultsGrid.innerHTML = '<p class="error">Oops! Something went wrong while searching. Please try again.</p>';
    } finally {
        updateSearchButton();
    }
}
function constructSearchQuery() {
    const itemNames = Array.from(selectedItems).map(id => recyclableItems.find(i => i.id === id).name);
    return `DIY recycled crafts using ${itemNames.join(' and ')}`;
}
async function fetchVideos(query) {
    const tags = Array.from(selectedItems).join(',');
    try {
        const res = await fetch(`${API_BASE}/get-videos?tags=${tags}`);
        if (!res.ok) throw new Error('Search failed');
        const videos = await res.json();
        return videos.map(v => ({ videoUrl: v.url, title: v.title, description: v.description, relatedItem: 'Community Result' }));
    } catch (err) {
        console.error('API Error:', err);
        return [];
    }
}
function displayResults(results) {
    resultsGrid.innerHTML = '';
    if (results.length === 0) { resultsGrid.innerHTML = '<p>No specific videos found for this combination. Try selecting fewer items!</p>'; return; }
    results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="video-container"><video src="${result.videoUrl}" controls></video></div>
            <div class="result-content">
                <h3>${result.title}</h3>
                <p>${result.description}</p>
                <div class="tag-container"><span class="result-tag">${result.relatedItem}</span></div>
            </div>
        `;
        resultsGrid.appendChild(card);
    });
}
function onSubmitTutorial(e) { e.preventDefault(); publishWizard(); }
document.addEventListener('DOMContentLoaded', init);
