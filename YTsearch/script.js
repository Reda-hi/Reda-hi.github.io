const API_BASE = '/.netlify/functions';
const items = ['plastic bottles','cardboard','glass jars','metal cans','fabric','wood','paper','electronics','batteries','organic waste'];
const selected = new Set();
function initItems() {
  const grid = document.getElementById('items-grid');
  if (!grid) return;
  items.forEach(name => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.textContent = name;
    card.addEventListener('click', () => {
      if (selected.has(name)) selected.delete(name); else selected.add(name);
      card.classList.toggle('active'); updateSearchButton();
    });
    grid.appendChild(card);
  });
}
function updateSearchButton() {
  const btn = document.getElementById('search-btn');
  if (!btn) return; btn.disabled = selected.size === 0;
}
function constructQuery() {
  const tags = Array.from(selected);
  const base = tags.join(' + ');
  return `recycling tutorial ${base}`;
}
async function fetchVideos(query) {
  const res = await fetch(`${API_BASE}/get-youtube-videos?q=${encodeURIComponent(query)}`);
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed to fetch videos'); }
  const data = await res.json();
  return data.items.map(it => ({ id: it.id.videoId, title: it.snippet.title, description: it.snippet.description, thumbnail: it.snippet.thumbnails.medium.url }));
}
function displayResults(list) {
  const section = document.getElementById('results-section');
  const grid = document.getElementById('results-grid');
  if (!section || !grid) return;
  section.hidden = false; grid.innerHTML = '';
  list.forEach(v => {
    const card = document.createElement('div'); card.className = 'result-card';
    const a = document.createElement('a'); a.href = `https://www.youtube.com/watch?v=${v.id}`; a.target = '_blank';
    const img = document.createElement('img'); img.className = 'thumb'; img.src = v.thumbnail; a.appendChild(img);
    const body = document.createElement('div'); body.className = 'card-body';
    const title = document.createElement('div'); title.className = 'card-title'; title.textContent = v.title;
    const desc = document.createElement('div'); desc.className = 'card-desc'; desc.textContent = v.description;
    body.appendChild(title); body.appendChild(desc); card.appendChild(a); card.appendChild(body); grid.appendChild(card);
  });
}
function init() {
  initItems();
  const btn = document.getElementById('search-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { const q = constructQuery(); const videos = await fetchVideos(q); displayResults(videos); }
      catch (e) { alert(e.message); }
      finally { btn.disabled = false; }
    });
  }
}
document.addEventListener('DOMContentLoaded', init);
