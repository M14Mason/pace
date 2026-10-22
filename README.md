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
- `js/quiz.js`: round engine (finish the round, then clear every miss with escalating hints)
- `js/math/skills.js`: 13 Math Sprint skills × 8 levels, each with speed targets
- `js/data/*`: course units, lessons, question banks, and generators
- `js/views/*`: Dashboard, Sprint, Learn, Business & Finance, Prep, Speak, Log, Settings, Placement
- `js/ai.js`: Claude API (grading, judging, speech analysis, question generation)
- `js/ntfy.js`: phone reminders through ntfy

Investing content is education and simulated practice only. It is not financial advice.
