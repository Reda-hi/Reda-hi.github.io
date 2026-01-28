# Recycle It - Modular System Design

## 📁 Project Structure

Your project now follows a **clean, modular architecture**:

```
portfo.html/
├── index.html          # Main HTML structure
├── styles.css          # All CSS styling
├── data.js             # Material database
├── app.js              # Main app logic & UI controller
├── api.js              # Backend API communication
├── utils.js            # Utility functions
└── backend.py          # Flask API (optional, with local fallback)
```

## 🎯 Key Features

### 1. **Modular JavaScript Architecture**
- `data.js` - Separated material database (16 recyclables)
- `app.js` - Main application class with state management
- `api.js` - API client with timeout & fallback handling
- `utils.js` - Helper functions (formatting, animations, etc.)

### 2. **Three-Section Navigation**
- 📖 **Project Info** - Introduction and features
- 🔍 **Search Items** - Select materials to recycle
- 🎯 **Results** - Display matched videos with material photos

### 3. **API-First with Local Fallback**
- Tries YouTube API first
- Falls back to local database if API fails
- Clear status messages to users

### 4. **Professional UI/UX**
- Clean, modern design
- Smooth animations and transitions
- Material photos prominently displayed
- Responsive mobile design
- Color-coded difficulty badges

## 🚀 How to Run

### Start the Frontend Server
```bash
cd "c:\Users\SHOP\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\35698584A7B3398E916DDF457CE4F57E81036EC1\transfers\2025-52\portfo.html"
python -m http.server 8000
```

Then open: **http://localhost:8000**

### Start the Backend (Optional)
```bash
python backend.py
```

The backend runs on `http://localhost:5000` and is optional - the app works perfectly with local data.

## 📊 File Responsibilities

| File | Purpose | Size |
|------|---------|------|
| `index.html` | HTML structure | ~150 lines |
| `styles.css` | All styling | ~600 lines |
| `data.js` | 16 materials + videos | ~250 lines |
| `app.js` | UI logic & state | ~300 lines |
| `api.js` | API communication | ~50 lines |
| `utils.js` | Helper functions | ~50 lines |
| `backend.py` | Flask API | ~200 lines |

## ✨ What Works

✅ Material selection with visual feedback
✅ Multi-material video matching
✅ Material photos below videos
✅ Navigation between sections
✅ Back button in results
✅ Matched items display
✅ API error handling with fallback
✅ Fully responsive mobile design
✅ Smooth animations & transitions
✅ Progress indicator during search

## 🔄 Application Flow

1. **User lands on Project Info page**
2. **Clicks "Start Exploring"** → Goes to Search section
3. **Selects 1+ materials** → Counter updates
4. **Clicks "Find Tutorials"** → Processing starts
5. **Results display** → Shows videos + material photos + matched items
6. **Clicks "Back"** → Returns to Search to select different materials

## 🤖 Smart Fallback System

```javascript
// Automatic fallback order:
1. Try YouTube API
2. If API fails → Use local database
3. Show user clear status message
4. Continue seamlessly
```

## 📱 Responsive Breakpoints

- Desktop: Full layout
- Tablet (768px): Adjusted spacing
- Mobile (480px): Single column, optimized touch

## 🎨 Design System

- **Primary Color**: `#10b981` (Green)
- **Secondary**: `#3b82f6` (Blue)
- **Accent**: `#f59e0b` (Amber)
- **Font**: Segoe UI / System fonts

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/search` | POST | Search videos |
| `/api/health` | GET | Check API status |

## 📝 Customization

### Add a New Material
Edit `data.js`:
```javascript
'new_material': {
    label: 'Material Name',
    category: 'Category',
    icon: '🔶',
    image: 'https://...',
    videos: [
        { id: 'youtube_id', title: '...', duration: '...', views: '...', difficulty: 'easy' }
    ]
}
```

### Change Colors
Edit `:root` in `styles.css`:
```css
--primary: #10b981;
--secondary: #3b82f6;
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Videos not loading | Check YouTube IDs are valid |
| API not working | Local database still works |
| Styles look broken | Clear browser cache |
| App not responsive | Check viewport meta tag |

## 🎓 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Flask (Python) - optional
- **Data**: Local JSON-like structure
- **APIs**: YouTube Data API v3
- **Hosting**: Simple HTTP server

---

**Status**: ✅ Production Ready with Local-First Architecture
