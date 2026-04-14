# Cinement — Developer Documentation

> Branch: `docs/cinement-documentation`
> Last updated: 2026-04-10

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

**Cinement** is a client-side movie sentiment analysis web app. A user searches for a movie by title; Cinement pulls that film's written reviews from The Movie Database (TMDB), runs them through Parallel Dots for sentiment and emotion analysis, and sends them to MeaningCloud for summarization. The results are displayed in a styled "focus" panel alongside the film's poster, title, year, and aggregate ratings.

There is no backend. Every API call is made directly from the browser using jQuery Ajax.

**Live deployment:** https://jtledbet.github.io/Cinement/

---

## 2. Contributors & Ownership

The project was built by three collaborators. Understanding who owns what is useful when tracking down bugs or extending functionality.

| Contributor | GitHub | Primary Responsibility |
|---|---|---|
| **Jon Ledbetter** (`jtledbet`) | [@jtledbet](https://github.com/jtledbet) | API configuration, MeaningCloud integration, Parallel Dots analysis logic, ratings, recent 2026 API fixes |
| **Devin Price** (`devingprice`) | [@devingprice](https://github.com/devingprice) | TMDB integration, data pipeline, Foundation init, event handlers, show/hide logic |
| **Cody Swank** (`codyswank`) | [@codyswank](https://github.com/codyswank) | CSS & visual design, HTML layout, collapsible UI, frosted-glass effect |

### Ownership by File

#### `assets/javascript/main.js` (510 lines)
| Lines | Owner | Area |
|---|---|---|
| 1–3 | Devin | Foundation init, `getTrending()` startup call |
| 8–38 | **Jon** | All API keys, `ajaxOptions` template |
| 44–52 | **Jon** | First `getFeels` definition *(shadowed — see §9)* |
| 54–65 | **Jon** | First `getSummary` definition *(shadowed — see §9)* |
| 67–94 | **Jon** | First `getSentimentMC` definition *(shadowed — see §9)* |
| 96–117 | Devin + **Jon** | `getReviews` — Devin scaffolded TMDB call; Jon added the `overView` fallback |
| 119–163 | Devin | `getFirstReview`, `getTrending` |
| 165–176 | Devin | **Effective** `getSummary` *(wins over duplicate above)* |
| 178–205 | **Jon** | **Effective** `getSentimentMC` *(currently unused dead code)* |
| 207–266 | **Jon** | `getParallelDotsSentiment` — full classification logic |
| 268–281 | **Jon** | `getParallelDotsKeyword` *(broken/disabled, error 500)* |
| 283–338 | **Jon** | `getParallelDotsEmotion` — emotion sort & display |
| 343–358 | Devin + **Jon** | **Effective** `getFeels` — orchestrator with `gotReview` param |
| 360–393 | **Jon** + Devin | `getRatings`, `combineReviewsText`, `updateFocus` |
| 395–434 | **Jon** | `createTrendingDiv` |
| 436–510 | Devin | All event handlers (collapsible, trending click, search, hide) |

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
                    [MeaningCloud]    Sentiment(text)    Emotion(text)
                          │          [ParallelDots]      [ParallelDots]
                          │                │                   │
                    #review-summary   #gen-sent           #emo-reading
                       (DOM)            (DOM)               (DOM)
```

**Fallback behavior:** When TMDB returns zero reviews for a movie, `getFeels` is called with the movie's `overview` text and `gotReview = false`. In that case `getSummary` is skipped; the overview text is written directly to `#review-summary`, and sentiment/emotion analysis still runs on it.

**Rate limiting:** Parallel Dots enforces per-key rate limits. Jon built an 8-key rotation array (`apiKeysArrayPD`). Both `getParallelDotsSentiment` and `getParallelDotsEmotion` detect a rate-limit response (using the `code` field) and re-call themselves with the next key. See §9 for a bug in this logic.

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

> **Owner: Jon Ledbetter**  (`main.js` lines 8–38)

```javascript
var apiKeyMC     // MeaningCloud API key
var apiKeyMD     // The Movie Database API key (query-string format: "api_key=...")
var apiKeysArrayPD   // Array of 8 Parallel Dots API keys
var apiKeyIndex      // Current index into apiKeysArrayPD
var apiKeyPD         // Active Parallel Dots key (= apiKeysArrayPD[apiKeyIndex])

var baseURL      // "https://api.meaningcloud.com/"
var summaryURL   // "summarization-1.0/"
var sentimentURL // "sentiment-2.1"
var numSentences // 5 — number of sentences in MeaningCloud summaries

var queryURL     // Placeholder URL string (unused at runtime)
var ajaxOptions  // Template Ajax options object (crossDomain, Content-Type headers)
                 // Not used directly; individual calls construct their own options
```

**API key rotation (Parallel Dots):** `apiKeyIndex` and `apiKeysArrayPD` together power the rate-limit rotation. When a Parallel Dots call detects a rate-limit response, it increments `apiKeyIndex` and sets `apiKeyPD` to the next key before retrying. See §9 for a logic bug in this system.

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

#### `getSummary(text)` *(effective version)*
> Lines 165–176 | **Owner: Devin Price** (refactor); original by **Jon Ledbetter** (lines 54–65, shadowed)

Calls MeaningCloud's summarization API and writes the result to `#review-summary`.

- Truncates input to 6,000 characters before sending
- `POST https://api.meaningcloud.com/summarization-1.0/?key={apiKeyMC}&txt={text}&sentences=5`
- On success: `$("#review-summary").text(response.summary)`
- Returns the jQuery promise (not currently awaited by `getFeels`)

**API status:** MeaningCloud summarization is the primary area of recent API breakage. The summary endpoint was broken (returning no summary) as of 2026. See §9.

---

#### `getSentimentMC(text)` *(effective version — currently dead code)*
> Lines 178–205 | **Owner: Jon Ledbetter**

Calls MeaningCloud's sentiment analysis endpoint.

- `POST https://api.meaningcloud.com/sentiment-2.1?key={apiKeyMC}&txt={text}&lang=en`
- Returns: `score_tag` (P+/P/NEU/N/N+), `agreement`, `irony`, `subjectivity`, `confidence`
- **Not called anywhere in the current execution path.** Jon's note in the code: *"EVIDENTLY ONLY WORKS ON SINGLE SENTENCES?"*

This function was written as an alternative sentiment source but was never wired into `getFeels`. Parallel Dots is used for sentiment instead.

---

#### `getParallelDotsSentiment(text)`
> Lines 207–266 | **Owner: Jon Ledbetter**

Calls Parallel Dots sentiment API and classifies the result into a human-readable label.

- `POST https://apis.paralleldots.com/v4/sentiment` with `{api_key, text}`
- Response: `{sentiment: {positive, neutral, negative}}` (floats 0–1)

**Classification logic** (Jon's thresholds):

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

**Rate-limit handling:** If `response.code <= 200 || response.code >= 400`, rotates to the next key and retries recursively. See §9 for the bug in this condition.

---

#### `getParallelDotsEmotion(text)`
> Lines 283–338 | **Owner: Jon Ledbetter**

Calls Parallel Dots emotion API, sorts results by intensity, and renders a ranked list.

- `POST https://apis.paralleldots.com/v4/emotion` with `{api_key, text}`
- Response emotions: `Angry`, `Bored`, `Excited`, `Fear`, `Happy`, `Sad` (floats 0–1)

**Display logic:**
1. Builds array of `{emotion, num}` objects
2. Sorts descending by score
3. For each emotion where `percentage > 1`: appends `"Happy (41%)<br>"` to `#emo-reading`
4. Emotions scoring ≤ 1% are hidden

Same rate-limit rotation logic as `getParallelDotsSentiment`.

A comment in the code reads `// Morgan wrote this:` above the sort logic — this refers to an algorithm snippet, not a collaborator listed in the README.

---

#### `getParallelDotsKeyword(text)` *(broken — not called)*
> Lines 268–281 | **Owner: Jon Ledbetter**

Calls Parallel Dots keyword extraction API. Currently always returns HTTP 500. Not wired into any call path. Code comment: *"currently does not work (error 500)"*.

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
> Lines 371–385 | **Owner: Devin Price**

Concatenates all review `.content` strings from TMDB, URL-encodes the result, and truncates to 9,000 characters.

- Also writes `"Total Number of Reviews Collected: N"` to `#total-reviews`
- Returns the combined + encoded string, ready for API submission

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

### MeaningCloud

**Base URL:** `https://api.meaningcloud.com/`
**Auth:** `key` query parameter

| Endpoint | Used in | Notes |
|---|---|---|
| `POST /summarization-1.0/?key=...&txt=...&sentences=5` | `getSummary` | Returns `{summary: "..."}`. Text truncated to 6,000 chars before sending. **Currently broken — see §9.** |
| `POST /sentiment-2.1?key=...&txt=...&lang=en` | `getSentimentMC` | Returns `score_tag`, `agreement`, `irony`, `subjectivity`, `confidence`. **Not called — dead code.** |

---

### Parallel Dots

**Base URL:** `https://apis.paralleldots.com/v4/`
**Auth:** `api_key` POST body parameter

| Endpoint | Used in | Returns |
|---|---|---|
| `POST /sentiment` | `getParallelDotsSentiment` | `{sentiment: {positive, neutral, negative}}` |
| `POST /emotion` | `getParallelDotsEmotion` | `{emotion: {Angry, Bored, Excited, Fear, Happy, Sad}}` |
| `POST /keywords` | `getParallelDotsKeyword` | Keywords — **HTTP 500, non-functional** |

All values are floats in [0, 1] representing probability/confidence.

---

## 9. Known Issues & Technical Debt

These are the existing problems you'll want to understand when continuing to fix the API issues.

### 9.1 Duplicate Function Definitions

`main.js` currently defines three functions twice each:

| Function | First def (lines) | Second def (lines) | Effective version |
|---|---|---|---|
| `getSummary` | 54–65 (Jon) | 165–176 (Devin) | **Lines 165–176** |
| `getSentimentMC` | 67–94 (Jon) | 178–205 (Jon) | **Lines 178–205** (identical) |
| `getFeels` | 44–52 (Jon) | 343–358 (Devin+Jon) | **Lines 343–358** |

**Why this happened:** The commit `00e74e9` ("restore main.js and index.html to pre-summary-fix state") on 2026-04-09 reverted `main.js` to a pre-patch state that contained earlier versions of these functions, but didn't fully remove the original/later definitions, resulting in both copies coexisting. In JavaScript, function declarations are hoisted; when two declarations share the same name, the last one in source order takes effect.

**The dead first definitions have no runtime effect.** They are purely cosmetic clutter but could mislead someone reading the code. The first `getFeels` (lines 44–52) in particular is missing the `gotReview` parameter, which would make analysis silently wrong if it were the active version.

---

### 9.2 MeaningCloud Summary API — Primary Active Issue

**Symptom:** `#review-summary` shows no text or stale placeholder after a search.

**History (from git log):**
- `94282ba` — "Replace dead MeaningCloud summary call with local summarizer" — Devin rewrote `getSummary` to use a local alternative because the MC endpoint stopped working.
- `7f0438d` — "patch broken client-side summary feature" — Jon patched it.
- `640ac96` — "Revert 'patch broken client-side summary feature'" — patch reverted.
- `167221f` — "remove broken patch-summary override"
- `00e74e9` — "restore main.js and index.html to pre-summary-fix state" — code restored to pre-patch, meaning the MeaningCloud POST call is back as-is.

**Current state:** `getSummary` (lines 165–176) calls `POST https://api.meaningcloud.com/summarization-1.0/` directly from the browser. The most likely failure modes are:
1. **CORS:** MeaningCloud may not allow cross-origin POST from a GitHub Pages domain
2. **API key exhaustion / account inactive:** The embedded key may be out of credits
3. **API deprecation:** MeaningCloud has changed pricing/endpoints since 2019

The `getSentimentMC` function Jon wrote (lines 178–205) suffers from the same CORS/key issues and is additionally never called.

---

### 9.3 Rate-Limit Detection Logic Bug (Parallel Dots)

Both `getParallelDotsSentiment` and `getParallelDotsEmotion` contain:

```javascript
if (response.code <= 200 || response.code >= 400) {
    // rotate key and retry
}
```

**This condition is inverted.** A successful Parallel Dots response has `code: 200`. The intent is clearly to rotate on error codes (≥ 400), but `<= 200` catches the success case too, meaning the key rotation fires on every successful call — burning through the key array even when nothing is wrong.

The condition should be `response.code >= 400` (or equivalently, check for `!== 200`).

---

### 9.4 `getParallelDotsKeyword` — Non-Functional

Always returns HTTP 500. Code comment acknowledges this. Not wired into `getFeels`. Can be removed or debugged separately from the rest.

---

### 9.5 API Keys Hardcoded in Client-Side JS

All API keys are visible in the browser source. This is by design for a student/demo project with no backend, but is a security concern if any of these keys have billing attached. TMDB keys in particular are tied to accounts.

---

### 9.6 `getFeels` Calls Are Not Awaited

`getSummary`, `getParallelDotsSentiment`, and `getParallelDotsEmotion` are all called fire-and-forget inside `getFeels`. The `#main-cell` fade-in starts immediately. In practice this means the panel slides open before any API responses arrive and the data fields populate asynchronously as each call completes. This is visible behavior (fields appear to "pop in"). Using `Promise.all` would allow coordinating the fade-in with data readiness if desired.

---

### 9.7 Minor: `ajaxOptions` Object is Unused

The global `ajaxOptions` template object (lines 28–38, Jon) sets `Content-Type: application/json` and `Accept: JSON` headers. None of the actual Ajax calls reference it; they each construct their own `$.ajax({})` or `$.post()` call independently.

---

## 10. Deployment

The app is deployed via **GitHub Pages** from the `master` branch of `https://github.com/jtledbet/Cinement`.

**To run locally:** No build step is required. Open `index.html` directly in a browser, or serve it with any static file server (e.g., `python -m http.server 8080`). Some browsers block cross-origin requests from `file://` — a local server avoids this.

**Note on CORS:** Because all API calls originate from the browser, they are subject to each API provider's CORS policy. TMDB and Parallel Dots permit cross-origin requests. MeaningCloud's behavior in this regard is a likely contributor to the summary feature's broken state.
