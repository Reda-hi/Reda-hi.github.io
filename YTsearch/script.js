const FALLBACK_ORIGIN = typeof window !== 'undefined' && window.NETLIFY_ORIGIN ? window.NETLIFY_ORIGIN : null;
const API_BASES = ['/.netlify/functions'].concat(FALLBACK_ORIGIN ? [FALLBACK_ORIGIN + '/.netlify/functions'] : []);
async function apiFetch(path, init) {
  let lastErr;
  for (const base of API_BASES) {
    try {
      const res = await fetch(base + path, init);
      if (res.ok) return res;
      lastErr = new Error('HTTP ' + res.status);
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('API unreachable');
}
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
let resultsSection, resultsGrid, searchBtn;
function initItems() {
  const grid = document.getElementById('items-grid');
  if (!grid) return;
  grid.innerHTML = '';
  recyclableItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.id = item.id;
    card.innerHTML =
      '<span class="item-icon">' + item.icon + '</span>' +
      '<span class="item-name">' + item.name + '</span>' +
      '<span class="item-category">' + item.category + '</span>';
    card.addEventListener('click', () => toggleItem(item.id));
    grid.appendChild(card);
  });
}
function ensureResultsRefs() {
  resultsSection = document.getElementById('results-section');
  resultsGrid = document.getElementById('results-grid');
  searchBtn = document.getElementById('search-btn');
}
function showLoading() {
  ensureResultsRefs();
  if (!resultsSection || !resultsGrid) return;
  resultsSection.hidden = false;
  resultsGrid.innerHTML = '<div class="loader">Searching YouTube for recycling tutorials...</div>';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function toggleItem(itemId) {
  const card = document.querySelector('.item-card[data-id="' + itemId + '"]');
  if (selectedItems.has(itemId)) {
    selectedItems.delete(itemId);
    if (card) card.classList.remove('selected', 'active');
  } else {
    selectedItems.add(itemId);
    if (card) card.classList.add('selected', 'active');
  }
  updateSearchButton();
}
function updateSearchButton() {
  ensureResultsRefs();
  if (!searchBtn) return;
  const n = selectedItems.size;
  searchBtn.disabled = n === 0;
  searchBtn.textContent = n > 0 ? ('Search YouTube for ' + n + ' Item' + (n>1?'s':'') + ' 🔍') : 'Select Items to Search 🔍';
}
function constructQuery() {
  const names = Array.from(selectedItems).map(id => recyclableItems.find(i => i.id === id)?.name || id);
  return 'recycling tutorial ' + names.join(' and ');
}
async function fetchVideos(query) {
  const res = await apiFetch('/get-youtube-videos?q=' + encodeURIComponent(query));
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed to fetch videos'); }
  const data = await res.json();
  return data.items.map(it => ({ id: it.id.videoId, title: it.snippet.title, description: it.snippet.description, thumbnail: it.snippet.thumbnails.medium.url }));
}
function displayResults(list) {
  ensureResultsRefs();
  if (!resultsSection || !resultsGrid) return;
  resultsSection.hidden = false; resultsGrid.innerHTML = '';
  list.forEach(v => {
    const card = document.createElement('div'); card.className = 'result-card';
    const a = document.createElement('a'); a.href = `\`https://www.youtube.com/watch?v=\${v.id}\ `; a.target = '_blank';
    const img = document.createElement('img'); img.className = 'thumb'; img.src = v.thumbnail; a.appendChild(img);
    const body = document.createElement('div'); body.className = 'card-body';
    const title = document.createElement('div'); title.className = 'card-title'; title.textContent = v.title;
    const desc = document.createElement('div'); desc.className = 'card-desc'; desc.textContent = v.description;
    body.appendChild(title); body.appendChild(desc); card.appendChild(a); card.appendChild(body); resultsGrid.appendChild(card);
  });
}
function showEmpty(message) {
  ensureResultsRefs();
  if (!resultsSection || !resultsGrid) return;
  resultsSection.hidden = false;
  resultsGrid.innerHTML = '<p>' + message + '</p>';
}
function init() {
  initItems();
  ensureResultsRefs();
  if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
      if (selectedItems.size === 0) return;
      searchBtn.disabled = true;
      const originalText = searchBtn.textContent;
      searchBtn.textContent = 'Searching APIs... ⏳';
      showLoading();
      try { 
        const q = constructQuery(); 
        const videos = await fetchVideos(q); 
        if (!videos || videos.length === 0) { showEmpty('No results found. Try fewer or different items.'); }
        else { displayResults(videos); }
      }
      catch (e) { showEmpty(`Search failed: ${e.message}`); }
      finally { 
        searchBtn.disabled = false; 
        searchBtn.textContent = originalText; 
        updateSearchButton();
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', startApp);
function startApp() {
  const origin = typeof window !== 'undefined' && window.NETLIFY_ORIGIN ? window.NETLIFY_ORIGIN : '';
  const apiBase = origin ? (origin + '/.netlify/functions') : '/.netlify/functions';
  const els = {
    itemsGrid: document.getElementById('items-grid'),
    searchBtn: document.getElementById('search-btn'),
    resultsSection: document.getElementById('results-section'),
    resultsGrid: document.getElementById('results-grid')
  };
  const items = [
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
  const selected = new Set();
  function renderItems() {
    if (!els.itemsGrid) return;
    els.itemsGrid.innerHTML = '';
    items.forEach(it => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.dataset.id = it.id;
      card.innerHTML = '<span class="item-icon">' + it.icon + '</span><span class="item-name">' + it.name + '</span><span class="item-category">' + it.category + '</span>';
      card.addEventListener('click', () => {
        if (selected.has(it.id)) { selected.delete(it.id); card.classList.remove('selected','active'); }
        else { selected.add(it.id); card.classList.add('selected','active'); }
        updateButton();
      });
      els.itemsGrid.appendChild(card);
    });
  }
  function updateButton() {
    if (!els.searchBtn) return;
    const n = selected.size;
    els.searchBtn.disabled = n === 0;
    els.searchBtn.textContent = n > 0 ? ('Search YouTube for ' + n + ' Item' + (n>1?'s':'') + ' 🔍') : 'Select Items to Search 🔍';
  }
  function showLoading() {
    if (!els.resultsSection || !els.resultsGrid) return;
    els.resultsSection.hidden = false;
    els.resultsGrid.innerHTML = '<div class="loader">Searching YouTube for recycling tutorials...</div>';
    els.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function buildQuery() {
    const names = Array.from(selected).map(id => items.find(i => i.id === id)?.name || id);
  return 'recycling tutorial ' + names.join(' and ');
  }
  async function search() {
    if (selected.size === 0 || !els.searchBtn) return;
    const old = els.searchBtn.textContent;
    els.searchBtn.disabled = true;
    els.searchBtn.textContent = 'Searching APIs... ⏳';
    showLoading();
    try {
      const q = buildQuery();
      const res = await fetch(apiBase + '/get-youtube-videos?q=' + encodeURIComponent(q));
      if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.error || ('HTTP ' + res.status)); }
      const data = await res.json();
      const items = (data.items || []).map(it => ({ id: it.id.videoId, title: it.snippet.title, description: it.snippet.description, thumbnail: it.snippet.thumbnails?.medium?.url || '' }));
      renderResults(items);
    } catch (e) {
      renderEmpty('Search failed: ' + e.message);
    } finally {
      els.searchBtn.disabled = false;
      els.searchBtn.textContent = old;
      updateButton();
    }
  }
  function renderResults(list) {
    if (!els.resultsSection || !els.resultsGrid) return;
    els.resultsSection.hidden = false;
    els.resultsGrid.innerHTML = '';
    if (!list || list.length === 0) { renderEmpty('No results found. Try fewer or different items.'); return; }
    list.forEach(v => {
      const card = document.createElement('div'); card.className = 'result-card';
    const a = document.createElement('a'); a.href = 'https://www.youtube.com/watch?v=' + v.id; a.target = '_blank';
      const img = document.createElement('img'); img.className = 'thumb'; img.src = v.thumbnail; a.appendChild(img);
      const body = document.createElement('div'); body.className = 'card-body';
      const title = document.createElement('div'); title.className = 'card-title'; title.textContent = v.title;
      const desc = document.createElement('div'); desc.className = 'card-desc'; desc.textContent = v.description;
      body.appendChild(title); body.appendChild(desc); card.appendChild(a); card.appendChild(body); els.resultsGrid.appendChild(card);
    });
  }
  function renderEmpty(message) {
    if (!els.resultsSection || !els.resultsGrid) return;
    els.resultsSection.hidden = false;
    els.resultsGrid.innerHTML = '<p>' + message + '</p>';
  }
  renderItems();
  updateButton();
  if (els.searchBtn) els.searchBtn.addEventListener('click', search);
}
