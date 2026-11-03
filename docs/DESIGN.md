# Pace v2 design: why it works the way it does

v1 frustrated its user. It had gates, forced retry loops, red buzzers, a visible
clock, and seven tabs. v2 is rebuilt around what the research says.

| Finding | What Pace does now |
|---|---|
| Learning is best at about 85% success (Wilson et al., 2019, *Nature Communications*). | Difficulty adapts inside every round: two quick correct answers raise the level, and a miss lowers it. |
| Frustration and boredom loops hurt learning, while confusion that gets resolved helps (D'Mello & Graesser, 2012). | Wrong answers are resolved right away, with no endless retries. |
| After an error, immediate elaborated feedback works best (Van der Kleij et al., 2015; Educ. & Comp. 2017). | A "Here's how" card shows the answer and the steps, then a similar question comes back later in the round. |
| Time pressure can hurt mental math for some learners. The evidence is mixed (Boaler; Ashcraft; Maki 2024). | The clock is hidden and speed is measured quietly. Speed runs are optional. |
| Penalty mechanics like Duolingo's hearts are the most resented. Streak safety nets reduce resentment. | No penalties of any kind. A weekly streak counts 4 days a week. You can save and exit anytime. |
| Competence and autonomy drive motivation (self-determination theory). | Levels rise from practice, not from pass/fail tests. Nothing is locked. Hints are on demand. |
| Worked examples that fade, plus "try first, then hint" (Renkl & Atkinson; Khan Academy). | You get a short lesson the first time you meet a skill, then a tap-to-open trick chip on later questions, plus Hint buttons. |
| Choice overload adds cognitive load. | Four tabs. The Today screen has one Start button that runs a guided ~15 min session. |

## The daily session
1. Math warm-up: 8 adaptive questions.
2. AP course: the next part of the current reading (about 4 min), or unit practice once the reading is done.
3. Quick review: up to 5 items due for spaced review.

## Leveling
A skill levels up when 8 of your last 10 answers at your current level are correct (without hints) and your median time is at most 1.5× the speed target. Beating the target earns a ⚡ fluency star.

## Updates
`version.json` holds the latest version. When it changes, the app shows an "Update ready" banner, and tapping it reloads the new code. Your data lives in browser storage, so updating never touches it.
