# Environment Configuration
# This file loads environment variables safely

import os
from pathlib import Path

class Config:
    """Application configuration"""
    
    # Load from .env file if it exists
    if Path('.env').exists():
        from dotenv import load_dotenv
        load_dotenv()
    
    # YouTube API Key - loaded from environment
    YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')
    
    # Flask Configuration
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # Server Configuration
    SERVER_HOST = os.getenv('SERVER_HOST', '0.0.0.0')
    SERVER_PORT = int(os.getenv('SERVER_PORT', 5000))
    
    @staticmethod
    def get_api_key():
        """Get API key with validation"""
        key = Config.YOUTUBE_API_KEY
        if not key or len(key) < 10:
            return None
        return key
    
    @staticmethod
    def validate():
        """Validate configuration"""
        if not Config.get_api_key():
            print("[WARNING] YouTube API Key not configured")
            print("  - Set YOUTUBE_API_KEY environment variable")
            print("  - Or create .env file with your API key")
            print("  - See .env.example for template")
            return False
        return True
