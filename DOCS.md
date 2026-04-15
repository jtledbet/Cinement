# Cinement — Developer Documentation

> Branch: `docs/cinement-documentation`
> Last updated: 2026-04-15

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Contributors & Ownership](#2-contributors--ownership)
3. [Architecture & Data Flow](#3-architecture--data-flow)
4. [File Structure](#4-file-structure)
5. [HTML Structure (`index.html`)](#5-html-structure-indexhtml)
6. [JavaScript Reference (`main.js`)](#6-javascript-reference-mainjs)
   - [Global State & Configuration](#61-global-state--configuration)
   - [Initialization](#62-initialization)
   - [API Functions](#63-api-functions)
   - [Data Processing](#64-data-processing)
   - [UI / DOM Functions](#65-ui--dom-functions)
   - [Event Handlers](#66-event-handlers)
7. [CSS Reference (`style.css`)](#7-css-reference-stylecss)
8. [External API Reference](#8-external-api-reference)
9. [Known Issues & Technical Debt](#9-known-issues--technical-debt)
10. [Deployment](#10-deployment)

---

## 1. Project Overview

**Cinement** is a client-side movie sentiment analysis web app. A user searches for a movie by title; Cinement pulls that film's written reviews from The Movie Database (TMDB), runs them through Hugging Face Inference API models for sentiment, emotion, and summarization. The results are displayed in a styled "focus" panel alongside the film's poster, title, year, and aggregate ratings.

There is no backend. Every API call is made directly from the browser using jQuery Ajax.

**Live deployment:** https://jtledbet.github.io/Cinement/

---

## 2. Contributors & Ownership

The project was built by three collaborators. Understanding who owns what is useful when tracking down bugs or extending functionality.

| Contributor | GitHub | Primary Responsibility |
|---|---|---|
| **Jon Ledbetter** (`jtledbet`) | [@jtledbet](https://github.com/jtledbet) | API configuration, Hugging Face integration, sentiment/emotion analysis logic, ratings |
| **Devin Price** (`devingprice`) | [@devingprice](https://github.com/devingprice) | TMDB integration, data pipeline, Foundation init, event handlers, show/hide logic |
| **Cody Swank** (`codyswank`) | [@codyswank](https://github.com/codyswank) | CSS & visual design, HTML layout, collapsible UI, frosted-glass effect |

### Ownership by File

#### `assets/javascript/main.js`
| Lines | Owner | Area |
|---|---|---|
| 1–3 | Devin | Foundation init, `getTrending()` startup call |
| 8–10 | **Jon** | API keys (`apiKeyMD`, `apiKeyHF`, `HF_BASE`) |
| 13–68 | Devin + **Jon** | `getReviews`, `getFirstReview`, `getTrending` |
| 70–96 | **Jon** | `getSummary` — Hugging Face BART summarization |
| 98–145 | **Jon** | `getParallelDotsSentiment` — HF RoBERTa + classification logic |
| 147–179 | **Jon** | `getParallelDotsEmotion` — HF emotion model + sort & display |
| 181–196 | Devin + **Jon** | `getFeels` — orchestrator with `gotReview` param |
| 198–230 | **Jon** + Devin | `getRatings`, `combineReviewsText`, `updateFocus` |
| 232–271 | **Jon** | `createTrendingDiv` |
| 273–337 | Devin | All event handlers (collapsible, trending click, search, hide) |

#### `assets/css/style.css` (256 lines)
Cody Swank authored ~182 of 256 lines (the bulk of all layout, component, and responsive styling). Jon contributed text shadows and minor tweaks. Devin contributed the `#focus` slide-down and `.focus-show` class.

#### `index.html` (156 lines)
Cody Swank authored ~120 of 156 lines (full HTML scaffold). Jon contributed minor text/meta tweaks. Devin contributed the hide-button link.

---

## 3. Architecture & Data Flow

```
User types movie title → searchMovie()
        │
        ▼
getFirstReview(movieName)          [TMDB: search/movie]
        │  returns: first result's id, poster, title, release_date, overview
        │
        ├── updateFocus(imageUrl, title, year, ratings)   → updates poster / title DOM
        │
        └── getReviews(id, overView)                      [TMDB: movie/{id}/reviews]
                │
                ├── (reviews exist) combineReviewsText(reviewsRaw)
                │       └── getFeels(combinedText, true)
                │
                └── (no reviews)   getFeels(overView, false)
                                            │
                          ┌─────────────────┼─────────────────┐
                          ▼                 ▼                 ▼
                    getSummary(text)  getParallelDots-   getParallelDots-
                    [HF BART]         Sentiment(text)    Emotion(text)
                          │          [HF RoBERTa]        [HF distilRoBERTa]
                          │                │                   │
                    #review-summary   #gen-sent           #emo-reading
                       (DOM)            (DOM)               (DOM)
```

**Fallback behavior:** When TMDB returns zero reviews for a movie, `getFeels` is called with the movie's `overview` text and `gotReview = false`. In that case `getSummary` is skipped; the overview text is written directly to `#review-summary`, and sentiment/emotion analysis still runs on it.

**Rate limiting:** Hugging Face Inference API enforces free-tier rate limits. Requests that hit the limit receive an HTTP 429 response; the `.fail()` handler in each function shows a graceful "unavailable" message rather than crashing.

---

## 4. File Structure

```
Cinement/
├── index.html                        # Single-page app entry point
├── README.md                         # Brief project overview
├── DOCS.md                           # This file
│
├── assets/
│   ├── movies.jpg                    # Hero section background
│   ├── poster.jpg                    # Default/placeholder poster
│   ├── back.jpg                      # Unused background image
│   │
│   ├── css/
│   │   └── style.css                 # All custom styles
│   │
│   ├── javascript/
│   │   ├── main.js                   # All application logic
│   │   └── vendor/
│   │       └── jquery.js             # Local jQuery copy (not used; CDN version loaded instead)
│   │
│   └── images/
│       ├── favicon/                  # Favicon assets + site.webmanifest
│       ├── icon_1.png                # MeaningCloud logo (footer)
│       ├── icon_2.png / icon_2.jpg   # Parallel Dots logo (footer)
│       ├── icon_3.png                # TMDB logo (footer)
│       └── attribution/              # Attribution mockup files (not served)
│
└── auxiliary_files/                  # Project artifacts (not part of the app)
    ├── README.md
    ├── Project Proposal.docx
    ├── mockup1.png
    ├── jailbase mockups.bmpr
    ├── azure_text-analysis-api.json  # Azure API spec (never integrated)
    └── *.txt                         # Plaintext API key files for various services
```

**Note:** The `vendor/jquery.js` file is present but not referenced in `index.html`. jQuery is loaded from the jQuery CDN instead.

---

## 5. HTML Structure (`index.html`)

The page uses the [Foundation 6.5.3](https://get.foundation/sites/docs/) grid framework and is structured as a single scrollable page with three main sections.

```
<body>
  ├── #our-header (.title-bar)       — Mobile hamburger nav (hidden on medium+)
  ├── #responsive-menu (.top-bar)    — Desktop nav: "Cinement™" link + Home + Trending
  │
  ├── .hero-section                  — Full-width background image + search bar
  │     └── #search-text             — Text input
  │     └── #search-button           — Submit button
  │
  ├── #focus (.grid-x.bottom.shadow) — Movie detail panel (hidden until search/click)
  │     └── #main-cell               — display:none by default; fades in via JS
  │           ├── #focus-image       — Movie poster <img>
  │           ├── #focus-title       — Movie title + year
  │           └── .data              — "Aggregate Review Data" box
  │                 ├── #total-reviews
  │                 ├── #ratings
  │                 ├── #gen-sent    — General sentiment result
  │                 └── #emo-reading — Emotion breakdown list
  │           ├── .sum               — Review summary section
  │           │     └── #review-summary
  │           └── #focus-hide        — "Hide" link (scrolls back to top, collapses panel)
  │
  ├── .grid-x.bottom                 — Trending section
  │     └── #trending                — Dynamically populated movie cards
  │
  └── <footer>                       — API provider logos with links
```

### Key DOM IDs referenced by JavaScript

| ID | Type | Purpose |
|---|---|---|
| `#search-text` | `<input>` | Movie search input field |
| `#search-button` | `<input type="submit">` | Triggers search |
| `#focus` | `<div>` | Collapsible detail panel; gets `.focus-show` class to expand |
| `#main-cell` | `<div>` | Inner panel content; starts `display:none`, fades in |
| `#focus-image` | `<img>` | Movie poster |
| `#focus-title` | `<h1>` | Movie title + year (HTML injected) |
| `#total-reviews` | `<h4>` | "Total Number of Reviews Collected: N" |
| `#ratings` | `<p>` | Vote average + vote count (HTML injected) |
| `#gen-sent` | `<p>` | Sentiment result string, e.g. `"Positive (78%)"` |
| `#emo-reading` | `<p>` | Emotion breakdown; `<br>`-separated lines appended |
| `#review-summary` | `<p>` | MeaningCloud summary text (or raw overview if no reviews) |
| `#focus-hide` | `<a>` | Hide button; triggers `hideFocus()` |
| `#trending` | `<div>` | Container for dynamically-generated movie cards |
| `#trending-nav` | `<a>` | Nav link; clicking loads 12 trending movies |

---

## 6. JavaScript Reference (`main.js`)

`main.js` is a single flat script with no modules or classes. All state is global. The file is loaded after jQuery and Foundation in `index.html`.

> **Important:** Due to the restore/revert commits in April 2026, `main.js` currently contains **three duplicate function definitions** (`getSummary`, `getSentimentMC`, `getFeels`). In JavaScript, when two `function` declarations share the same name, the second one wins (both are hoisted, last write wins). The effective (active) version of each is noted below. See §9 for full details.

---

### 6.1 Global State & Configuration

> **Owner: Jon Ledbetter**  (`main.js` lines 8–10)

```javascript
var apiKeyMD   // The Movie Database API key (query-string format: "api_key=...")
var apiKeyHF   // Hugging Face Inference API token ("hf_...")
var HF_BASE    // "https://api-inference.huggingface.co/models/" — base URL for all HF calls
```

---

### 6.2 Initialization

> Lines 1–3; **Owner: Devin Price**

```javascript
$(document).foundation()   // Activates Foundation JS components
getTrending();              // Populates the trending section on page load (default: 4 movies)
```

---

### 6.3 API Functions

#### `getFirstReview(movieName)`
> Lines 119–138 | **Owner: Devin Price**

Searches TMDB for `movieName` and kicks off the full pipeline for the first result.

| Step | What happens |
|---|---|
| 1 | `GET https://api.themoviedb.org/3/search/movie?api_key=...&query={movieName}` |
| 2 | Extracts `results[0]` (first search result) |
| 3 | Calls `updateFocus(imageUrl, title, release_date, getRatings(firstRes))` |
| 4 | Calls `getReviews(firstRes.id, firstRes.overview)` |

No error handling for empty search results; `results[0]` will throw if TMDB returns nothing.

---

#### `getReviews(id, overView)`
> Lines 96–117 | **Owner: Devin Price** (scaffolded); **Jon Ledbetter** (added `overView` fallback)

Fetches all reviews from TMDB for a given movie ID, then routes to analysis.

| Step | What happens |
|---|---|
| 1 | `GET https://api.themoviedb.org/3/movie/{id}/reviews?api_key=...` |
| 2 | If `response.results.length > 0`: calls `combineReviewsText(reviewsRaw)` → `getFeels(combined, true)` |
| 3 | If no reviews: calls `getFeels(overView, false)` using the movie's plot overview as fallback text |

Note: `apiKeyMD` is re-declared locally inside this function (redundant given the global).

---

#### `getTrending(numTrending)`
> Lines 141–163 | **Owner: Devin Price**

Fetches popular movies from TMDB and renders them as cards.

- Default: `numTrending = 4` (called at startup)
- When `#trending-nav` is clicked: called with `numTrending = 12`
- Clears `#trending`, then appends `numTrending` cards via `createTrendingDiv()`
- Endpoint: `GET https://api.themoviedb.org/3/movie/popular?api_key=...&language=en-US&page=1`

---

#### `getSummary(text)`
> **Owner: Jon Ledbetter**

Calls the Hugging Face BART summarization model and writes the result to `#review-summary`.

- URL-decodes the input (reviews arrive URL-encoded from `combineReviewsText`); truncates to 1,000 characters (BART token limit)
- `POST https://api-inference.huggingface.co/models/facebook/bart-large-cnn`
- Headers: `Authorization: Bearer {apiKeyHF}`, `Content-Type: application/json`
- Body: `{"inputs": decodedText}`
- Response: `[{"summary_text": "..."}]`
- On success: `$("#review-summary").text(response[0].summary_text)`
- On failure (e.g. 429 rate limit): `$("#review-summary").text("Summary unavailable.")`

---

#### `getParallelDotsSentiment(text)`
> **Owner: Jon Ledbetter**

Calls a Hugging Face sentiment model (Cardiff NLP RoBERTa) and classifies the result into a human-readable label.

- URL-decodes and truncates input to 512 characters
- `POST https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest`
- Response: `[[{"label":"positive","score":0.9}, {"label":"neutral","score":0.08}, {"label":"negative","score":0.02}]]`

**Classification logic** (Jon's thresholds, unchanged from Parallel Dots version):

| Dominant score | Label |
|---|---|
| positive > 0.75 | "Very Positive" |
| positive > 0.50 | "Positive" |
| positive dominant | "Somewhat Positive" |
| neutral > 0.75 | "Very Neutral" |
| neutral > 0.50 | "Neutral" |
| neutral dominant | "Somewhat Neutral" |
| negative > 0.75 | "Very Negative" |
| negative > 0.50 | "Negative" |
| negative dominant | "Somewhat Negative" |

Output: `$("#gen-sent").text("Positive (78%)")` — percentage is the dominant score × 100.

---

#### `getParallelDotsEmotion(text)`
> **Owner: Jon Ledbetter**

Calls a Hugging Face emotion model (Jochen Hartmann distilRoBERTa), sorts results by intensity, and renders a ranked list.

- URL-decodes and truncates input to 512 characters
- `POST https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base`
- Response emotions: `anger`, `disgust`, `fear`, `joy`, `neutral`, `sadness`, `surprise` (floats 0–1)

**Display logic:**
1. Maps HF labels to capitalized strings (e.g. `joy` → `Joy`)
2. Sorts descending by score
3. For each emotion where `percentage > 1`: appends `"Joy (41%)<br>"` to `#emo-reading`
4. Emotions scoring ≤ 1% are hidden

---

#### `getFeels(text, gotReview)` *(effective version)*
> Lines 343–358 | **Owner: Jon Ledbetter** (logic) + **Devin Price** (wiring/gotReview param)

Orchestrates all three analysis calls for a given text body.

```javascript
function getFeels(text, gotReview) {
    if (gotReview) {
        getSummary(text)               // only called when real reviews exist
        getParallelDotsSentiment(text)
        getParallelDotsEmotion(text)
    } else {
        $("#review-summary").text(text) // use raw overview text instead of summarizing
        getParallelDotsSentiment(text)
        getParallelDotsEmotion(text)
    }
    $("#main-cell").fadeIn(1500, ...)
}
```

All three calls are fire-and-forget (no `Promise.all`). The fade-in animation starts immediately regardless of whether API calls have completed.

---

### 6.4 Data Processing

#### `combineReviewsText(reviewsRaw)`
> **Owner: Devin Price**

Concatenates all review `.content` strings from TMDB, URL-encodes the result, and truncates to 9,000 characters.

- Also writes `"Total Number of Reviews Collected: N"` to `#total-reviews`
- Returns the combined + encoded string
- The HF analysis functions (`getSummary`, `getParallelDotsSentiment`, `getParallelDotsEmotion`) each call `decodeURIComponent()` internally before sending the text to HF; a `try/catch` handles the plain-text overview fallback path (where no encoding was applied)

---

#### `getRatings(movieData)`
> Lines 360–368 | **Owner: Jon Ledbetter**

Extracts `vote_average` and `vote_count` from a TMDB movie object and returns an HTML string: `"Average Rating: 7.4<br>Total Votes: 3211"` — or `"N/A"` for both if `vote_count` is 0.

---

### 6.5 UI / DOM Functions

#### `updateFocus(imageUrl, imageTitle, year, rating)`
> Lines 387–393 | **Owner: Jon Ledbetter**

Updates the focus panel with movie metadata.

- Sets `#focus-image` src
- Writes `title + <span class="focus-year">(YYYY)</span>` to `#focus-title` (uses `year.substring(0, 4)` to strip the full ISO date)
- Writes rating HTML to `#ratings`

---

#### `createTrendingDiv(movieResponse, sentiment)`
> Lines 395–434 | **Owner: Jon Ledbetter**

Dynamically builds a Foundation grid cell for a trending movie card. Returns a jQuery object.

The card structure:
```
.cell.large-3.small-6.one
  └── .grid-x
  │     └── .cell.shad
  │           └── <a.trending-image-cont href="#focus">
  │                 └── <img.trending-images data-id data-title data-year data-rating>
  └── .grid-x
        └── .cell.text
              ├── <button.collapsible> "Show Summary"
              └── <div.content> (movie overview or sentiment text, hidden)
```

The `sentiment` parameter is optional. If passed, it overrides `overview` as the collapsible body text (this parameter is never actually passed at call sites — the cards always show the raw overview).

---

#### `showFocus()` / `hideFocus()`
> Lines 456–464 | **Owner: Devin Price**

Toggle the `#focus` panel open/closed via the `.focus-show` CSS class.

- `showFocus()`: adds `.focus-show` if not already present (guarded with `hasClass` check to avoid double-transition)
- `hideFocus()`: removes `.focus-show`

The CSS transition (`max-height: 0` → `max-height: 7000px`) drives the slide-down animation.

---

### 6.6 Event Handlers

> Lines 436–510 | **Owner: Devin Price** (all handlers)

| Handler | Trigger | Action |
|---|---|---|
| `.collapsible` click | Any `.collapsible` button | Toggles `.active` class on button; toggles `.content` div; toggles `.frosted` class on associated poster image |
| `.trending-images` click | Any trending poster | Calls `getReviews(id)`, `showFocus()`, `updateFocus(...)` using `data-*` attributes stored on the `<img>` |
| `#trending-nav` click | "Trending" nav link | Calls `getTrending(12)` |
| `a[href^="#"]` click | Any anchor link | Smooth scrolls to target element (500ms) |
| `#search-button` click | Search button | Calls `searchMovie(e)` |
| `#search-text` keypress | Enter key (keyCode 13) | Calls `searchMovie(e)` |
| `#focus-hide` click | "Hide" link | Calls `hideFocus()` |

#### `searchMovie(e)`
> Lines 480–497 | **Owner: Devin Price**

Validates that the search input is non-empty, then calls `getFirstReview(searchedText)`, `showFocus()`, and smooth-scrolls to `#focus`. Clears the input field after submission.

---

## 7. CSS Reference (`style.css`)

> Primary author: **Cody Swank** (~182/256 lines). Jon contributed text shadows (`* { text-shadow }` and `.hero-section-text`). Devin contributed `#focus` and `.focus-show`.

### Key Layout Classes

| Selector | Purpose |
|---|---|
| `body` | Dark gray background (`#57595d`), Kanit font |
| `.hero-section` | Full-width flexbox hero; centered vertically and horizontally; `movies.jpg` background cover |
| `.wrapper` | Constrains the focus panel content; `15em` horizontal margins on desktop, collapses to `0` on small/medium screens |
| `.data` | "Aggregate Review Data" box — gray background (`#777b7e`), 3px grey border, box shadow |
| `.shad` | Reusable box shadow utility (used on poster image and trending cards) |
| `.shadow` | Inset box shadow (used on `#focus` container) |

### Focus Panel Animation

```css
#focus {
    max-height: 0;
    overflow-y: hidden;
    transition: max-height 0.8s;
}
.focus-show {
    overflow-y: visible !important;
    max-height: 7000px !important;
    transition: max-height 0.8s;
}
```

The panel is hidden by collapsing `max-height` to `0`. Adding `.focus-show` expands it. The `7000px` value is deliberately large to avoid knowing the panel's actual height.

### Collapsible Summary Cards

```css
.collapsible   /* gray button, full-width, no border, box-shadow bottom edge */
.active        /* darker gray on active state */
.content       /* absolutely positioned overlay above image; dark bg, 0.8 opacity, scrollable, max-height 200px */
.frosted       /* blur(2px) filter applied to associated poster image when summary is open */
```

### Responsive Breakpoints (Foundation 6 + custom)

| Breakpoint | Behavior |
|---|---|
| `≤ 30.9375em` (small) | Hero shrinks to `15em` height; `.wrapper` margins collapse to `0`; focus title centers |
| `31em – 85.9375em` (medium) | `.wrapper` margins collapse to `0`; poster image centered |
| `≥ 86em` (large) | `.wrapper` `15em` side margins active; 4-column trending grid |

---

## 8. External API Reference

### The Movie Database (TMDB)

**Base URL:** `https://api.themoviedb.org/3/`
**Auth:** `api_key` query parameter

| Endpoint | Used in | Returns |
|---|---|---|
| `GET /search/movie?api_key=...&query={name}` | `getFirstReview` | Array of movie objects |
| `GET /movie/{id}/reviews?api_key=...` | `getReviews` | Array of review objects (`{content, author, ...}`) |
| `GET /movie/popular?api_key=...&language=en-US&page=1` | `getTrending` | Array of popular movie objects |
| `https://image.tmdb.org/t/p/w500{poster_path}` | `getFirstReview`, `createTrendingDiv` | Poster image (500px wide) |

Relevant movie object fields: `id`, `title`, `release_date`, `overview`, `poster_path`, `vote_average`, `vote_count`, `popularity`, `genre_ids`.

---

### Hugging Face Inference API

**Base URL:** `https://api-inference.huggingface.co/models/`
**Auth:** `Authorization: Bearer {apiKeyHF}` request header
**CORS:** Supported — callable directly from the browser.
**Rate limits:** Free tier; HTTP 429 on excess requests. The `.fail()` handler in each function displays a graceful "unavailable" message.

| Model | Used in | Request body | Response |
|---|---|---|---|
| `facebook/bart-large-cnn` | `getSummary` | `{"inputs": text}` (≤ 1,000 chars) | `[{"summary_text": "..."}]` |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | `getParallelDotsSentiment` | `{"inputs": text}` (≤ 512 chars) | `[[{"label":"positive\|neutral\|negative","score":float},...]]` |
| `j-hartmann/emotion-english-distilroberta-base` | `getParallelDotsEmotion` | `{"inputs": text}` (≤ 512 chars) | `[[{"label":"anger\|disgust\|fear\|joy\|neutral\|sadness\|surprise","score":float},...]]` |

All score values are floats in [0, 1] (probability). Each model returns scores for all its classes simultaneously, sorted by confidence.

---

## 9. Known Issues & Technical Debt

### 9.1 Duplicate Function Definitions — Resolved

~~`main.js` contained duplicate definitions of `getSummary`, `getSentimentMC`, and `getFeels` due to the revert commit `00e74e9`.~~ **Resolved April 2026** — the full rewrite removed all duplicates, dead `getSentimentMC`, and the non-functional `getParallelDotsKeyword`.

---

### 9.2 MeaningCloud Summary API — Resolved

~~MeaningCloud's summarization endpoint is blocked by CORS when called from a browser.~~ **Resolved April 2026** — `getSummary` now calls `facebook/bart-large-cnn` via Hugging Face Inference API, which supports CORS.

---

### 9.3 Parallel Dots API Keys — Resolved

~~All 8 keys in `apiKeysArrayPD` return `{"status":"Unauthorized"}` (keys from 2019, service changed ownership).~~ **Resolved April 2026** — Parallel Dots replaced with Hugging Face Inference API for both sentiment (`cardiffnlp/twitter-roberta-base-sentiment-latest`) and emotion (`j-hartmann/emotion-english-distilroberta-base`).

The rate-limit inversion bug (`b56d213`) and the key-rotation infrastructure are no longer needed and have been removed.

---

### 9.4 API Keys Hardcoded in Client-Side JS

All API keys are visible in the browser source. This is by design for a student/demo project with no backend, but is a security concern if any keys have billing attached. TMDB and Hugging Face free-tier tokens are low-risk; neither has automatic billing.

---

### 9.5 `getFeels` Calls Are Not Awaited

`getSummary`, `getParallelDotsSentiment`, and `getParallelDotsEmotion` are all called fire-and-forget inside `getFeels`. The `#main-cell` fade-in starts immediately. In practice this means the panel slides open before any API responses arrive and the data fields populate asynchronously as each call completes. This is visible behavior (fields appear to "pop in"). Using `Promise.all` would allow coordinating the fade-in with data readiness if desired.

---

## 10. Deployment

The app is deployed via **GitHub Pages** from the `master` branch of `https://github.com/jtledbet/Cinement`.

**To run locally:** No build step is required. Open `index.html` directly in a browser, or serve it with any static file server (e.g., `python -m http.server 8080`). Some browsers block cross-origin requests from `file://` — a local server avoids this.

**Note on CORS:** Because all API calls originate from the browser, they are subject to each API provider's CORS policy. TMDB and Hugging Face Inference API both support cross-origin requests from the browser.
