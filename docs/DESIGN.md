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

## Finance tab (v2.2)

Four levels - Fundamentals, Advanced, Capstone, DECA - with 107 concepts. Each concept runs the same six steps:

| Step | What happens | Why (research) |
|---|---|---|
| 1 Guess first | One unscored question before teaching | Prequestions improve learning of the targeted content, especially when you generate an answer (St. Hilaire et al., 2024 meta-analysis) |
| 2 Learn it | Plain definition, why it exists, analogy, formula, memory hook | Elaboration: connecting new ideas to what you already know |
| 3 Show me how | Worked example revealed step by step | Worked examples before practice reduce cognitive load for novices |
| 4 Your turn | Generated problems + concept checks, hints on demand, calm "here's why" | Retrieval practice with immediate, explanatory feedback |
| 5 Real scenarios | The same idea in a small business, a big company, your own money and a DECA roleplay | Varied contexts and comparing cases are what make far transfer possible |
| 6 Lock it in | Explain it back, "spot it in real life," links to related concepts | Self-explanation; deliberately connecting ideas across domains |

After that, every question enters spaced review (first in ~2 days, then 5, then weeks). The daily Start session adds a short, interleaved Finance review. A concept earns ★ "remembered" once at least two of its cards have been recalled on separate later reviews - a light version of successive relearning (Rawson & Dunlosky).

Reassignments: Time value of money, simple and compound interest, and present value moved into Fundamentals (they power NPV and DCF) and are still listed under DECA. Debt refinancing moved from Capstone to Advanced. Added: balance sheet, income statement, present value, comparable company analysis, banks, retirement accounts, budgeting & net worth. Fixed: DECA "performance indicators" are the skills judges score, not profit ratios; Modigliani-Miller is described with its no-tax and with-tax versions and the trade-off theory.
