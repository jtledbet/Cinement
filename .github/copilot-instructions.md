# Cinement — Copilot Instructions

## Overview

**Cinement** is a pure frontend movie review analyzer with no build step or backend server. Open `index.html` directly in a browser or serve statically. Combines three external APIs to fetch reviews, analyze sentiment, and generate summaries.

**Live:** https://jtledbet.github.io/Cinement/

## Quick Start

No installation or build needed. Simply open `index.html` in a browser.

To serve locally:
```bash
python -m http.server 8000    # or any simple HTTP server
# Visit http://localhost:8000
```

## Architecture

### API Integration (Client-Side Only)

1. **The Movie Database (TMDB)**
   - Search endpoint: `/search/movie`
   - Returns movie metadata + reviews list

2. **Meaning Cloud (Summarization)**
   - Summarization API: summarizes each review
   - Takes review text → returns summary

3. **Parallel Dots (Sentiment Analysis)**
   - Sentiment API: analyzes review text sentiment
   - Returns sentiment score/classification

### Data Flow
User enters movie search → TMDB API → fetch reviews → Parallel Dots (sentiment) + Meaning Cloud (summarization) → display results

### File Structure
```
index.html                   (main page)
assets/
  css/                       (styling)
  js/                        (API calls, DOM manipulation)
  images/                    (images)
```

## Key Conventions

### API Keys
**All API keys are embedded client-side in the JavaScript files.** This is a tradeoff for a simple frontend-only app (keys are exposed but okay for a portfolio/demo project with rate limits).

If extending this, consider:
- Using a backend proxy to hide keys
- Migrating keys to environment variables (would require build step)

### No Framework Dependencies
Pure HTML/CSS/jQuery. No build tools, no npm, no bundler. Changes are live immediately.

### jQuery Event Handlers
UI interactivity is delegated via jQuery on `document`. Familiar to other projects in this repo (news_scraper, CatBurger).

## Common Tasks

### Add a new API source
1. Create new JS file in `assets/js/` with API call logic
2. Link in `index.html` `<script>` tag
3. Update event handlers to call new API
4. Update DOM to display new data

### Change TMDB search parameters
- Edit API call in `assets/js/` file that handles TMDB queries
- Modify query string parameters (e.g., `&language=`, `&region=`)
- Test with `index.html` in browser

### Style changes
- Edit `assets/css/` files directly
- Refresh browser to see changes (no build step needed)

### Debug API calls
- Open browser DevTools (F12)
- Check Network tab for API requests
- Check Console for errors (usually CORS or missing keys)
- If using CORS-blocking APIs, may need to route through CORS proxy or backend

## Deployment

Hosted on GitHub Pages. Simply serve from `index.html` or enable Pages in GitHub settings to point to this directory.

## Notes

- **No backend:** All data flows through client-side APIs
- **CORS:** Some APIs may have CORS restrictions; if adding new APIs, test in browser first
- **Rate limits:** TMDB, Meaning Cloud, Parallel Dots all have free tier rate limits; not suitable for high-volume production use
- **Offline:** App requires internet (all APIs are external)
