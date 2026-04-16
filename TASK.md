# Next Task: Replace Dead APIs

## Context
Cinement is a static client-side movie sentiment app. Two of its three APIs are broken as of April 2026. The rate-limit bug has been fixed (`b56d213`). What remains is replacing the dead services.

## What's broken and why

### 1. Parallel Dots (sentiment + emotion)
All 8 API keys return `{"status":"Unauthorized"}` — expired since 2019.
- `getParallelDotsSentiment()` — lines 207–266 in `assets/javascript/main.js`
- `getParallelDotsEmotion()` — lines 283–338

**Recommended replacement:** Hugging Face Inference API (free tier, CORS-friendly)
- Sentiment: `POST https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english`
- Emotion: `POST https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base`
- Requires a free HuggingFace account + token (set as `Authorization: Bearer hf_...` header)
- Response shapes will differ from Parallel Dots — display logic in both functions will need updating

### 2. MeaningCloud (summarization)
CORS blocks all browser-to-MeaningCloud requests. The free tier still exists but can't be called directly from the browser.
- `getSummary()` — lines 165–176

**Recommended replacement:** Client-side extractive summarizer (no API, no account, works everywhere)
- Simplest approach: score sentences by keyword frequency, pick top N
- Or use a small JS library like `node-summarizer` via CDN

## Files to edit
- `assets/javascript/main.js` — replace API call bodies in the four functions above
- `DOCS.md` — update §8 API reference and §9 known issues when done
- Remove `TASK.md` when complete

## What's working fine
- TMDB (movie search, reviews, trending, ratings) — fully functional
- UI, CSS, Foundation grid — untouched
- Rate-limit key rotation logic — fixed, ready to use once new keys are in place

## Branch
`docs/cinement-documentation` — push changes here, or open a new feature branch off master.
