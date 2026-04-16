# Cinement™

![HTML](https://img.shields.io/badge/language-HTML-green.svg?logo=html5)
![CSS](https://img.shields.io/badge/language-CSS-green.svg?logo=css3)
![Javascript](https://img.shields.io/badge/language-Javascript-green.svg?logo=javascript)
![jQuery](https://img.shields.io/badge/library-jQuery-yellow.svg?logo=jQuery)

A client-side movie sentiment analysis app. Search for any film and Cinement pulls its written reviews from The Movie Database, runs them through sentiment and emotion analysis, and generates a plain-English summary — all in the browser, no backend required.

> ⚠️ **Sentiment, emotion, and summary features are currently out of service** while third-party API integrations are being updated. Movie search and trending still work. See [`DOCS.md`](DOCS.md) for details.

**[Try it live →](https://jtledbet.github.io/Cinement/)**

---

## How it works

1. User searches for a movie by title
2. [The Movie Database](https://developers.themoviedb.org) returns the film's metadata and written reviews
3. Reviews are combined and sent to sentiment/emotion analysis APIs
4. A summarization API condenses the reviews into a short paragraph
5. Results — ratings, sentiment, emotional breakdown, summary — are displayed alongside the poster

---

## Tech stack

- Vanilla HTML / CSS / JavaScript
- [jQuery 3.3.1](https://jquery.com/)
- [Foundation 6.5.3](https://get.foundation/) — responsive grid & UI components
- [Google Fonts — Kanit](https://fonts.google.com/specimen/Kanit)

---

## APIs

| Service | Purpose | Status |
|---|---|---|
| [The Movie Database](https://developers.themoviedb.org) | Movie search, reviews, ratings, trending | ✅ Working |
| [Parallel Dots](https://www.paralleldots.com/) | Sentiment & emotion analysis | ❌ Keys expired |
| [MeaningCloud](https://www.meaningcloud.com/developer/apis) | Review summarization | ❌ CORS incompatible |

---

## Running locally

No build step required — it's a static site.

```bash
# Python (built-in)
python -m http.server 8080
# then open http://localhost:8080

# or with npx
npx serve -l 3000
# then open http://localhost:3000
```

VS Code users: the **Live Server** extension (`Go Live!`) works great on port 5500.

---

## Documentation

Full developer reference — architecture, function breakdown, contributor attribution, API reference, and known issues — is in [`DOCS.md`](DOCS.md).

---

## Team

| | |
|---|---|
| [Jon Ledbetter](https://github.com/jtledbet) | API integration, sentiment logic, key management |
| [Devin Price](https://github.com/devingprice) | Data pipeline, TMDB integration, event handling |
| [Cody Swank](https://github.com/codyswank) | UI design, CSS, HTML layout |
