const DEFAULT_API_BASE = 'https://reclable-backend.amaaliredhmed872.workers.dev';
const storedApiBase = localStorage.getItem('api_base');
const API_BASE = window.BACKEND_BASE || (storedApiBase && storedApiBase.startsWith('http') ? storedApiBase : DEFAULT_API_BASE);
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
    if (!file || !file.type.startsWith('video/')) {
        alert('Please select a valid video file.');
        return;
    }
    
    // Revoke old URL if exists to prevent memory leaks
    if (currentFile && previewVideo.src) {
        URL.revokeObjectURL(previewVideo.src);
    }

    currentFile = file;
    const url = URL.createObjectURL(file);
    
    if (previewWrap && previewVideo) {
        previewWrap.hidden = false;
        previewVideo.src = url;
        previewVideo.load();
    }

    if (dropzone) {
        const inner = dropzone.querySelector('.dropzone-inner');
        if (inner) {
            inner.innerHTML = `
                <div class="dz-icon" style="color: var(--primary-500);">✅</div>
                <div class="dz-title" style="color: var(--primary-700);">Video Selected</div>
                <div class="dz-sub" style="margin-bottom: 1.5rem;">${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)</div>
                <div class="flex gap-3 justify-center">
                    <button id="change-file" type="button" class="secondary-button">Change</button>
                    <button id="remove-file" type="button" class="secondary-button" style="border-color: #fee2e2; color: #dc2626;">Remove</button>
                </div>
            `;
            
            document.getElementById('change-file').onclick = (e) => {
                e.stopPropagation();
                videoFileInput.click();
            };
            
            document.getElementById('remove-file').onclick = (e) => {
                e.stopPropagation();
                removeFile();
            };
        }
        dropzone.classList.add('active');
    }
}

function removeFile() {
    if (previewVideo.src) {
        URL.revokeObjectURL(previewVideo.src);
    }
    currentFile = null;
    videoFileInput.value = '';
    
    if (previewWrap) previewWrap.hidden = true;
    if (previewVideo) previewVideo.src = '';
    
    if (dropzone) {
        const inner = dropzone.querySelector('.dropzone-inner');
        if (inner) {
            inner.innerHTML = `
                <div class="dz-icon">📹</div>
                <div class="dz-title">Drag & drop your video here</div>
                <div class="dz-sub">or</div>
                <button id="choose-file" type="button" class="cta-button">Choose a file</button>
            `;
            document.getElementById('choose-file').onclick = () => videoFileInput.click();
        }
        dropzone.classList.remove('active');
    }
}

function goStep(n) {
    if (n < 1) n = 1;
    if (n > 4) n = 4;
    
    // Validation before moving forward
    if (n > currentStep) {
        if (currentStep === 1 && !currentFile) {
            alert('Please upload a video first.');
            return;
        }
        if (currentStep === 2) {
            const title = document.getElementById('video-title')?.value.trim();
            if (!title) {
                alert('Please provide a title for your tutorial.');
                return;
            }
        }
        if (currentStep === 3) {
            const tags = Array.from(tagsGrid.querySelectorAll('input[type="checkbox"]:checked'));
            if (tags.length === 0) {
                alert('Please select at least one material tag.');
                return;
            }
        }
    }

    if (n === 4) { 
        nextBtn.hidden = true; 
        publishBtn.hidden = false;
        updatePublishSummary();
    } else { 
        nextBtn.hidden = false; 
        publishBtn.hidden = true; 
    }

    backBtn.disabled = n === 1;
    
    // Update steps UI
    wizardSteps.forEach(s => {
        const stepNum = Number(s.dataset.step);
        s.classList.toggle('active', stepNum === n);
        s.classList.toggle('completed', stepNum < n);
    });

    // Show/Hide panels with animation
    wizardPanels.forEach(p => {
        const isCurrent = Number(p.dataset.step) === n;
        p.hidden = !isCurrent;
        if (isCurrent) {
            p.style.opacity = '0';
            p.style.transform = 'translateY(10px)';
            setTimeout(() => {
                p.style.transition = 'all 0.4s ease-out';
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
            }, 10);
        }
    });

    currentStep = n;
}

function updatePublishSummary() {
    const title = document.getElementById('video-title')?.value || 'Untitled';
    const tags = Array.from(tagsGrid.querySelectorAll('input[type="checkbox"]:checked'))
        .map(c => c.parentElement.textContent.trim())
        .join(', ');
    
    const summaryDiv = document.getElementById('publish-summary');
    if (summaryDiv) {
        summaryDiv.innerHTML = `
            <div style="background: var(--neutral-50); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--neutral-200); margin-bottom: 1rem;">
                <p style="font-weight: 600; color: var(--neutral-900); margin-bottom: 0.5rem;">Title: <span style="font-weight: 400; color: var(--neutral-600);">${title}</span></p>
                <p style="font-weight: 600; color: var(--neutral-900);">Materials: <span style="font-weight: 400; color: var(--neutral-600);">${tags}</span></p>
            </div>
            <p style="text-align: center; font-size: 0.875rem; color: var(--primary-600);">Ready to share with the community!</p>
        `;
    }
}

async function publishWizard() {
    const title = document.getElementById('video-title')?.value.trim();
    const desc = document.getElementById('video-desc')?.value.trim();
    const tags = Array.from(tagsGrid ? tagsGrid.querySelectorAll('input[type="checkbox"]:checked') : []).map(c => c.value);

    if (!currentFile || !title || tags.length === 0) {
        alert('Please fill in all fields and upload a video.');
        return;
    }

    const originalBtnText = publishBtn.innerHTML;
    publishBtn.innerHTML = '<span class="loader" style="width: 1.2rem; height: 1.2rem; border-width: 2px; margin-right: 0.5rem;"></span> Publishing...';
    publishBtn.disabled = true;

    try {
        // 1. Get Signature from our backend
        const sigResponse = await fetch(`${API_BASE}/get-signature`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title, 
                description: desc, 
                tags: tags.join(',') 
            })
        });

        if (!sigResponse.ok) throw new Error('Failed to get upload signature');
        const sigData = await sigResponse.json();

        // 2. Upload to Cloudinary directly
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('api_key', sigData.api_key);
        formData.append('timestamp', sigData.timestamp);
        formData.append('signature', sigData.signature);
        formData.append('folder', sigData.folder);
        formData.append('tags', sigData.tags);
        formData.append('context', sigData.context);

        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/video/upload`, {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error?.message || 'Upload to Cloudinary failed');
        }

        // Success state
        const wizardBody = document.querySelector('.wizard-body');
        wizardBody.innerHTML = `
            <div class="status-success" style="text-align: center; padding: 4rem 2rem; animation: scaleIn 0.5s ease-out;">
                <div style="font-size: 5rem; margin-bottom: 2rem;">🎉</div>
                <h2 style="color: var(--primary-700); margin-bottom: 1rem;">Tutorial Published!</h2>
                <p style="color: var(--neutral-600); margin-bottom: 2rem; max-width: 400px; margin-left: auto; margin-right: auto;">
                    Your recycling tutorial has been successfully uploaded and shared with the community.
                </p>
                <div class="flex gap-4 justify-center">
                    <button onclick="location.reload()" class="cta-button">Upload Another</button>
                    <a href="/community/search/" class="secondary-button">Browse Tutorials</a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Publishing failed:', error);
        alert(`Failed to publish: ${error.message}`);
        publishBtn.innerHTML = originalBtnText;
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
