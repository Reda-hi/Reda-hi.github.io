/**
 * Recycle It - Main Application Logic
 * Handles UI state, search, and rendering
 */

class RecycleItApp {
    constructor() {
        this.selectedMaterials = new Set();
        this.currentResults = [];
        this.apiStatus = 'unknown';
        this.init();
    }

    init() {
        this.renderMaterials();
        this.attachEventListeners();
        this.checkAPIStatus();
    }

    /**
     * Render material selection grid
     */
    renderMaterials() {
        const list = document.getElementById('materialsList');
        if (!list) return;

        list.innerHTML = '';
        Object.entries(materialsDB).forEach(([key, data]) => {
            const item = document.createElement('div');
            item.className = 'checkbox-item';
            item.dataset.key = key;

            item.innerHTML = `
                <input type="checkbox" id="${key}" value="${key}" class="material-checkbox">
                <label for="${key}">
                    <img src="${data.image}" alt="${data.label}" class="material-photo" 
                         onerror="this.src='https://via.placeholder.com/60?text=${encodeURIComponent(data.label)}'">
                    <div class="material-info">
                        <span class="material-name">${data.icon} ${data.label}</span>
                        <span class="material-category">${data.category}</span>
                    </div>
                </label>
            `;

            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => this.updateSelection(key, checkbox.checked));
            item.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    checkbox.checked = !checkbox.checked;
                    this.updateSelection(key, checkbox.checked);
                }
            });

            list.appendChild(item);
        });
    }

    /**
     * Update selected materials
     */
    updateSelection(key, isChecked) {
        if (isChecked) {
            this.selectedMaterials.add(key);
        } else {
            this.selectedMaterials.delete(key);
        }

        document.getElementById('countDisplay').textContent = this.selectedMaterials.size;
        document.getElementById('searchBtn').disabled = this.selectedMaterials.size === 0;

        const item = document.querySelector(`[data-key="${key}"]`);
        if (item) {
            item.classList.toggle('active', isChecked);
        }
    }

    /**
     * Start AI search
     */
    async startSearch() {
        const materials = Array.from(this.selectedMaterials);
        if (materials.length === 0) return;

        this.showProcessing(true);
        this.updateLog('🔍 Searching for videos...');

        // Try API first
        const apiResult = await apiClient.searchMaterials(materials);

        if (apiResult.success && Object.keys(apiResult.data).length > 0) {
            this.updateLog('✓ YouTube API Connected!', 'success');
            this.displayResults(apiResult.data);
        } else {
            this.updateLog('⚠️ Using local database...', 'warning');
            const localResults = this.getLocalResults(materials);
            this.displayResults(localResults);
        }

        await this.delay(800);
        this.showProcessing(false);
        this.switchSection('results');
    }

    /**
     * Get results from local database
     */
    getLocalResults(materials) {
        const results = {};
        materials.forEach(mat => {
            if (materialsDB[mat]) {
                results[mat] = materialsDB[mat].videos;
            }
        });
        return results;
    }

    /**
     * Display search results
     */
    displayResults(results) {
        const grid = document.getElementById('videoGrid');
        let videos = [];

        Object.entries(results).forEach(([material, items]) => {
            if (Array.isArray(items)) {
                items.forEach(v => {
                    const materialData = materialsDB[material];
                    videos.push({
                        id: v.id,
                        title: v.title,
                        views: v.views || '0',
                        duration: v.duration || 'N/A',
                        difficulty: v.difficulty || 'medium',
                        source: materialData?.label || material,
                        image: materialData?.image || 'https://via.placeholder.com/140'
                    });
                });
            }
        });

        this.currentResults = videos;
        document.getElementById('resultCount').textContent = `${videos.length} ${Utils.plural(videos.length, 'video', 'videos')}`;

        // Show matched items
        this.displayMatchedItems();

        // Render video cards
        grid.innerHTML = '';
        videos.forEach((video) => {
            grid.appendChild(this.createVideoCard(video));
        });
    }

    /**
     * Display matched items
     */
    displayMatchedItems() {
        const display = document.getElementById('selectedItemsDisplay');
        const list = document.getElementById('selectedItemsList');
        
        list.innerHTML = '';
        this.selectedMaterials.forEach(mat => {
            if (materialsDB[mat]) {
                const badge = document.createElement('span');
                badge.className = 'matched-item-badge';
                badge.textContent = `${materialsDB[mat].icon} ${materialsDB[mat].label}`;
                list.appendChild(badge);
            }
        });
        display.style.display = 'block';
    }

    /**
     * Create video card element
     */
    createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <div class="video-wrapper">
                <iframe src="https://www.youtube.com/embed/${video.id}" 
                        title="${video.title}" allowfullscreen></iframe>
            </div>
            <div class="video-content">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-stats">
                    <span>👁️ ${Utils.formatViews(video.views)}</span>
                    <span>⏱️ ${video.duration}</span>
                </div>
                <span class="difficulty-badge difficulty-${video.difficulty}">${video.difficulty}</span>
                <div class="video-material">
                    <img src="${video.image}" alt="${video.source}" class="material-thumbnail">
                    <span class="material-label">For: ${video.source}</span>
                </div>
            </div>
        `;
        return card;
    }

    /**
     * Switch between sections
     */
    switchSection(section) {
        document.getElementById('intro-section').style.display = 'none';
        document.getElementById('search-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';

        document.getElementById('navIntro').classList.remove('active');
        document.getElementById('navSearch').classList.remove('active');
        document.getElementById('navResults').classList.remove('active');

        if (section === 'intro') {
            document.getElementById('intro-section').style.display = 'block';
            document.getElementById('navIntro').classList.add('active');
        } else if (section === 'search') {
            document.getElementById('search-section').style.display = 'block';
            document.getElementById('navSearch').classList.add('active');
        } else if (section === 'results') {
            document.getElementById('results-section').style.display = 'block';
            document.getElementById('navResults').classList.add('active');
            document.getElementById('navResults').style.display = 'block';
        }
    }

    /**
     * Show/hide processing panel
     */
    showProcessing(show) {
        const panel = document.getElementById('processingPanel');
        if (show) {
            panel.style.display = 'flex';
            document.getElementById('progressBar').style.width = '0%';
            this.animateProgress();
        } else {
            document.getElementById('progressBar').style.width = '100%';
            setTimeout(() => {
                panel.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Animate progress bar
     */
    animateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress = Math.min(90, progress + Math.random() * 15);
            document.getElementById('progressBar').style.width = progress + '%';
            
            if (progress >= 90) clearInterval(interval);
        }, 300);
    }

    /**
     * Update log messages
     */
    updateLog(message, type = 'info') {
        const log = document.getElementById('searchLog');
        const color = {
            'success': '#10b981',
            'warning': '#dc2626',
            'error': '#dc2626',
            'info': '#6b7280'
        }[type] || '#6b7280';

        const entry = document.createElement('div');
        entry.style.color = color;
        entry.style.fontWeight = type === 'success' || type === 'warning' ? '600' : 'normal';
        entry.textContent = message;
        log.appendChild(entry);
    }

    /**
     * Check API status
     */
    async checkAPIStatus() {
        const health = await apiClient.checkHealth();
        this.apiStatus = health.api_working ? 'working' : 'offline';
        
        const indicator = document.getElementById('apiStatus');
        if (indicator) {
            indicator.className = `api-status ${this.apiStatus}`;
            indicator.title = `API Status: ${this.apiStatus}`;
        }
    }

    /**
     * Utility: delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RecycleItApp();
});

// Global function for navigation
function switchSection(section) {
    if (window.app) window.app.switchSection(section);
}

// Global function for search
function startSearch() {
    if (window.app) window.app.startSearch();
}
