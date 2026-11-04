# Pace

A personal study app for fast, accurate practical math, finance and business analysis, and upcoming high-school coursework (deepest for APs).

It's a static site with no build step. Progress is saved in the browser on your own device (localStorage, plus IndexedDB for speech audio). Claude features need your own API key, entered in Settings, and that key never leaves your browser except to go to Anthropic.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Structure

- `js/main.js`: router, navigation, boot
- `js/store.js`: local persistence, streaks, Pace Score, spaced repetition
- `js/quiz.js`: round engine (adaptive difficulty, instant "here's how" feedback, hints on demand)
- `js/session.js`: the daily guided session; `js/mastery.js`: leveling from practice
- `js/math/skills.js`: 13 math skills × 8 levels, each with a speed target
- `js/data/*`: course units, lessons, question banks, and generators
- `js/views/*`: Today, Practice, Courses, You, plus the deeper pages (course units, readings, finance, Speak, Log, Settings)
- `js/data/fin/*` + `js/views/fin.js`: the Finance tab (Fundamentals, Advanced, Capstone, DECA)
- `js/ai.js`: Claude API (grading, judging, speech analysis, question generation)
- `js/ntfy.js`: phone reminders through ntfy

Investing content is education and simulated practice only. It is not financial advice.

## Updating

On your phone, just open Pace. When a new version is live, an **"Update ready"** banner appears at the top. Tap it and you're done. Your data is never touched, because it lives in your phone's browser storage, not in the app's code.

If you don't see the banner, close Pace completely (swipe it away) and open it again.

The design rationale is in [docs/DESIGN.md](docs/DESIGN.md).
