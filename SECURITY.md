# 🔐 Security Guide - API Key Protection

## ✅ What's Protected

Your API keys and sensitive data are now protected from accidental GitHub exposure.

### Files NOT Committed to Git
- `.env` - Contains your actual API keys
- `__pycache__/` - Python cache files
- `.DS_Store` - macOS files
- Node modules and logs

## 🚀 Setup Instructions

### 1. Install python-dotenv
```bash
pip install python-dotenv
```

### 2. Create `.env` File
Copy `.env.example` to `.env` and add your real credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
YOUTUBE_API_KEY=your_actual_youtube_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

### 3. Run the Backend
```bash
python backend.py
```

The app automatically loads from `.env` file. No hardcoded keys!

## 📝 File Structure

```
├── .gitignore          # Files to exclude from Git
├── .env.example        # Template (safe to commit)
├── .env                # ⚠️ Your secrets (NEVER commit - see .gitignore)
├── config.py           # Configuration loader
└── backend.py          # Uses config.py to load API key
```

## 🔒 Security Checklist

- ✅ `.env` file ignored in `.gitignore`
- ✅ API key loaded from environment variable
- ✅ `.env.example` provided as template
- ✅ No hardcoded secrets in code
- ✅ Safe to push to GitHub
- ✅ Configuration centralized in `config.py`

## 🌍 Deploy to GitHub

```bash
# Initialize git
git init

# Create .env locally (NOT committed)
cp .env.example .env
# Edit .env with your keys

# Safe to add all files
git add .
git commit -m "Initial commit"
git push origin main
```

**Your `.env` file will NOT be included** - `.gitignore` prevents it!

## 🖥️ Deploy to Server

### Method 1: Environment Variables
```bash
# On your server, set the environment variable
export YOUTUBE_API_KEY=your_key_here
python backend.py
```

### Method 2: .env File
```bash
# Copy .env.example to server
scp .env.example user@server:/app/.env.example

# On server, create .env
cp .env.example .env
nano .env  # Edit with your keys
python backend.py
```

### Method 3: Docker (Recommended)
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "backend.py"]
```

Build and run:
```bash
docker build -t recycle-it .
docker run -e YOUTUBE_API_KEY=your_key_here recycle-it
```

## ⚠️ What NOT to Do

❌ Never hardcode API keys in source code
❌ Never commit `.env` file to Git
❌ Never share your `.env` file
❌ Never post API keys in issues/documentation

## ✅ What TO Do

✅ Use `.env` file locally
✅ Use environment variables in production
✅ Use `.env.example` as template
✅ Update `.gitignore` for new sensitive files
✅ Use secrets management services (AWS Secrets Manager, etc.)

## 🔑 Getting YouTube API Key

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable YouTube Data API v3
4. Create an API key in Credentials section
5. Add to `.env`:
```env
YOUTUBE_API_KEY=your_key_here
```

## 📚 Additional Resources

- [12-Factor App - Config](https://12factor.net/config)
- [GitHub - Gitignore Templates](https://github.com/github/gitignore)
- [Python-dotenv Documentation](https://python-dotenv.readthedocs.io/)
- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Your project is now production-ready with enterprise-grade security! 🚀**
