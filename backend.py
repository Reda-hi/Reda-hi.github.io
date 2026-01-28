from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import re
from datetime import datetime
from config import Config

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Load configuration
Config.validate()
YOUTUBE_API_KEY = Config.get_api_key()
AI_AGENT_NAME = "Recycle It AI v3.0"

# Test if API key is working
def test_api_key():
    """Test if YouTube API key is valid"""
    if not YOUTUBE_API_KEY or len(YOUTUBE_API_KEY) < 10:
        return False, "No API key set - configure YOUTUBE_API_KEY environment variable"
    
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        'part': 'snippet',
        'q': 'DIY tutorial',
        'type': 'video',
        'maxResults': 1,
        'key': YOUTUBE_API_KEY
    }
    
    try:
        r = requests.get(url, params=params, timeout=5)
        data = r.json()
        if 'error' in data:
            return False, f"API Error: {data['error'].get('message', 'Unknown error')}"
        return True, "API working"
    except Exception as e:
        return False, f"Connection error: {str(e)}"

# Check API on startup
API_WORKING, API_STATUS = test_api_key()
print(f"[STARTUP] YouTube API Status: {API_STATUS}")

class RecyclingAI:
    def __init__(self):
        self.craft_keywords = ['diy', 'craft', 'tutorial', 'how to', 'upcycle', 'make']
        
    def generate_queries(self, material):
        """Generate search queries from material name"""
        clean = material.replace('_', ' ').replace('-', ' ')
        queries = [
            f"{clean} DIY tutorial",
            f"how to make {clean} craft",
            f"upcycle {clean} projects",
            f"{clean} craft ideas",
            f"recycle {clean} tutorial"
        ]
        return queries
    
    def is_valid_video(self, title, description):
        """Filter out gaming, asmr, irrelevant content"""
        text = (title + " " + description).lower()
        bad_words = ['asmr', 'gaming', 'fortnite', 'minecraft', 'roblox', 'prank', 'reaction']
        if any(bad in text for bad in bad_words):
            return False
        # Must contain craft-related words
        if not any(kw in text for kw in self.craft_keywords):
            return False
        return True
    
    def parse_duration(self, iso):
        try:
            match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso)
            if not match: return "N/A"
            h, m, s = match.groups()
            h = int(h or 0)
            m = int(m or 0)
            s = int(s or 0)
            if h: return f"{h}:{m:02d}:{s:02d}"
            return f"{m}:{s:02d}"
        except:
            return "N/A"
    
    def get_video_details(self, video_id):
        url = "https://www.googleapis.com/youtube/v3/videos"
        params = {
            'part': 'statistics,contentDetails',
            'id': video_id,
            'key': YOUTUBE_API_KEY
        }
        try:
            r = requests.get(url, params=params, timeout=5)
            data = r.json()
            if data.get('items'):
                item = data['items'][0]
                return {
                    'views': item['statistics'].get('viewCount', '0'),
                    'duration': self.parse_duration(item['contentDetails'].get('duration', ''))
                }
        except Exception as e:
            print(f"Error getting details: {e}")
        return {'views': '0', 'duration': 'N/A'}
    
    def estimate_difficulty(self, title):
        text = title.lower()
        if any(x in text for x in ['easy', 'simple', 'beginner', 'quick', 'no-sew']):
            return 'easy'
        if any(x in text for x in ['sew', 'drill', 'complex', 'advanced', 'difficult']):
            return 'hard'
        return 'medium'
    
    def search_material(self, material, max_results=5):
        queries = self.generate_queries(material)
        seen_ids = set()
        videos = []
        
        print(f"[AI] Searching for: {material}")
        
        for query in queries[:3]:  # Limit to save quota
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                'part': 'snippet',
                'q': query,
                'type': 'video',
                'maxResults': 10,
                'order': 'relevance',
                'key': YOUTUBE_API_KEY,
                'safeSearch': 'moderate',
                'videoDuration': 'medium',
                'relevanceLanguage': 'en'
            }
            
            try:
                r = requests.get(url, params=params, timeout=5)
                data = r.json()
                
                if 'error' in data:
                    print(f"[AI] API Error: {data['error']['message']}")
                    continue
                
                for item in data.get('items', []):
                    video_id = item['id']['videoId']
                    
                    if video_id in seen_ids:
                        continue
                    seen_ids.add(video_id)
                    
                    title = item['snippet']['title']
                    desc = item['snippet']['description']
                    channel = item['snippet']['channelTitle']
                    
                    # Filter irrelevant content
                    if not self.is_valid_video(title, desc):
                        continue
                    
                    # Get detailed stats
                    details = self.get_video_details(video_id)
                    
                    videos.append({
                        'id': video_id,
                        'title': title,
                        'channel': channel,
                        'views': details['views'],
                        'duration': details['duration'],
                        'difficulty': self.estimate_difficulty(title),
                        'thumbnail': item['snippet']['thumbnails']['high']['url']
                    })
                    
                    if len(videos) >= max_results:
                        return videos
                        
            except Exception as e:
                print(f"[AI] Search error: {e}")
                continue
        
        return videos

# Initialize
ai = RecyclingAI()

@app.route('/api/search', methods=['POST'])
def search():
    data = request.get_json()
    materials = data.get('materials', [])
    
    if not materials:
        return jsonify({'error': 'No materials provided', 'api_status': 'error'}), 400
    
    # Check API status first
    if not API_WORKING:
        return jsonify({
            'error': 'YouTube API not working',
            'api_status': 'failed',
            'message': f'YouTube API Error: {API_STATUS}. Using local database instead.',
            'results': {},
            'total_videos': 0
        }), 503
    
    results = {}
    api_working = False
    api_error = None
    
    for material in materials:
        clean = material.strip().lower().replace(' ', '_')
        try:
            vids = ai.search_material(clean)
            if vids:
                results[clean] = vids
                api_working = True
        except Exception as e:
            api_error = str(e)
            print(f"[API ERROR] Failed to search {material}: {e}")
    
    response = {
        'agent': AI_AGENT_NAME,
        'timestamp': datetime.now().isoformat(),
        'results': results,
        'total_videos': sum(len(v) for v in results.values()),
        'api_status': 'working' if api_working else 'failed',
        'api_error': api_error
    }
    
    if not api_working:
        response['message'] = 'YouTube API is not responding. Using local database instead.'
    
    return jsonify(response)

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'online',
        'api_working': API_WORKING,
        'api_status': API_STATUS,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print(f"[STARTUP] Starting Recycle It API...")
    print(f"[STARTUP] YouTube API Key: {'SET' if YOUTUBE_API_KEY and len(YOUTUBE_API_KEY) > 10 else 'NOT SET'}")
    print(f"[STARTUP] API Status: {API_STATUS}")
    print(f"[STARTUP] Server running on http://localhost:5000")
    print(f"[STARTUP] CORS enabled for all origins")
    app.run(host='0.0.0.0', debug=False, port=5000)