// Claude API, called straight from the browser with the student's own key
// (stored only in this browser's localStorage). Used for grading free responses,
// judging roleplays, analysing speech, and generating extra practice.
import { S } from './store.js';

const MODEL = 'claude-opus-5-5';
let clientP = null, clientKey = '';

async function client() {
  const key = S().profile.apiKey;
  if (!key) throw new Error('NO_KEY');
  if (!clientP || clientKey !== key) {
    clientKey = key;
    clientP = import('https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.128.0/+esm')
      .then(m => new m.default({ apiKey: key, dangerouslyAllowBrowser: true }));
  }
  return clientP;
}

export const hasAI = () => !!S().profile.apiKey;

const SYSTEM = `You are the tutor inside Pace, a study app for one ambitious high-school student (10th grade, block schedule) who wants a finance internship, 5s on AP exams, and to compete in DECA (finance + business management clusters).
How this student learns best: a concise worked example first, then a hint (not the answer) when stuck, the "why" behind every rule, then lots of quick reps. Keep feedback direct, specific, mature and encouraging - never childish, never corporate. Short sentences. Point to the exact phrase or step that needs to change.
Investing content is education and simulated practice, never personal financial advice.`;

// Ask for JSON that matches `schema`. Returns the parsed object.
export async function askJSON(prompt, schema, { effort = 'medium', maxTokens = 8000 } = {}) {
  const c = await client();
  const res = await c.beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: SYSTEM,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort, format: { type: 'json_schema', schema } },
    messages: [{ role: 'user', content: prompt }],
  });
  if (res.stop_reason === 'refusal') throw new Error('Claude declined this request.');
  if (res.stop_reason === 'max_tokens') throw new Error('Response was cut off - try a shorter input.');
  const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return JSON.parse(text);
}

export function aiErrorText(e) {
  if (e.message === 'NO_KEY') return 'Add your Claude API key in Settings to use this.';
  const s = e.status || e?.error?.status;
  if (s === 401) return 'Your Claude API key was rejected - check it in Settings.';
  if (s === 429) return 'Claude is rate-limited right now. Try again in a minute.';
  if (s >= 500) return 'Claude is having trouble right now. Try again shortly.';
  if (e.name === 'TypeError' || /fetch|network/i.test(e.message)) return 'No connection - this feature needs internet.';
  return e.message || 'Something went wrong.';
}

const obj = (props, req = Object.keys(props)) => ({ type: 'object', properties: props, required: req, additionalProperties: false });
const str = { type: 'string' }, num = { type: 'number' }, int = { type: 'integer' };
const arr = items => ({ type: 'array', items });

// --- graders ---

export function gradeFRQ({ course, kind, prompt, rubric, response }) {
  return askJSON(
    `Grade this ${course} ${kind} response against the rubric. Be accurate like a real AP reader: award a point only when earned.
PROMPT:\n${prompt}\n\nRUBRIC:\n${rubric}\n\nSTUDENT RESPONSE:\n${response}\n
Return: total points earned, max points, a per-row breakdown (earned?, why, with a quote from their response), the single highest-leverage fix, and a revised version of their weakest sentence.`,
    obj({
      earned: int, max: int,
      rows: arr(obj({ criterion: str, earned: { type: 'boolean' }, why: str, quote: str })),
      topFix: str, rewrite: str, encouragement: str,
    }), { effort: 'high' });
}

export function judgeRoleplay({ event, scenario, pis, response }) {
  return askJSON(
    `You are a DECA judge for ${event}. Score the participant's roleplay response like a real judge.
SCENARIO:\n${scenario}\n\nPERFORMANCE INDICATORS:\n${pis.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nRESPONSE (spoken or written):\n${response}\n
Score each PI 0-14 (DECA scale: 0-3 little/no, 4-7 below, 8-11 meets, 12-14 exceeds) and the 21st-century skills (0-6 each: reasoning, communication, poise/professionalism). Give concrete fixes and one stronger line they could have said.`,
    obj({
      pis: arr(obj({ pi: str, score: int, why: str })),
      skills: arr(obj({ skill: str, score: int, why: str })),
      total: int, max: int, strongerLine: str, fixes: arr(str),
    }), { effort: 'high' });
}

export function analyzeSpeech({ prompt, transcript, metrics, lang = 'en' }) {
  return askJSON(
    `Analyse this ${lang === 'es' ? 'Spanish' : 'English'} spoken answer for ARTICULATION - how precisely, clearly and fluently the student expresses ideas (not the topic itself). The student wants to genuinely improve wording for interviews, DECA roleplays, class and everyday explaining.
Prompt they answered: "${prompt}"
Auto-transcript (speech recognition - ignore obvious recognition glitches):\n"""${transcript}"""
Measured delivery metrics: ${JSON.stringify(metrics)}
Score 1-10 on: clarity, structure, precision (specific words vs vague), concision, fluency, vocabulary range, and delivery (use the metrics). For each weak spot, quote their exact words and give an upgraded version. Give 3 short "say it sharper" drills built from their own sentences, and 5 vocabulary upgrades (weak word -> stronger words, with a sample sentence).${lang === 'es' ? ' Also flag grammar/conjugation errors with corrections.' : ''}`,
    obj({
      scores: obj({ clarity: int, structure: int, precision: int, concision: int, fluency: int, vocabulary: int, delivery: int }),
      summary: str,
      fixes: arr(obj({ quote: str, issue: str, better: str })),
      drills: arr(obj({ instruction: str, original: str, target: str })),
      vocab: arr(obj({ weak: str, stronger: arr(str), example: str })),
      grammar: arr(obj({ quote: str, correction: str, rule: str })),
      nextFocus: str,
    }), { effort: 'high' });
}

export function checkDrill({ instruction, original, attempt }) {
  return askJSON(
    `Articulation drill. Instruction: "${instruction}". Original: "${original}". Student's spoken attempt: "${attempt}". Did they meet the instruction? Be brief.`,
    obj({ pass: { type: 'boolean' }, feedback: str, model: str }), { effort: 'low', maxTokens: 2000 });
}

export function genQuestions({ course, unit, topics, n = 8, level = 'AP exam' }) {
  return askJSON(
    `Write ${n} new multiple-choice practice questions for ${course}, unit "${unit}". Topics: ${topics}. Difficulty: ${level}. Use stimulus-based questions where the real exam does (short source/excerpt/data inside the question text). Each has 4 choices, one correct, a 1-2 sentence explanation of WHY, and two layered hints (first a memory cue, second a strategy cue) that do not reveal the answer. Vary which letter is correct.`,
    obj({ questions: arr(obj({ q: str, c: arr(str), a: int, e: str, h: arr(str) })) }), { effort: 'medium', maxTokens: 12000 });
}

export function gradeShort({ context, question, answer, key }) {
  return askJSON(
    `Context: ${context}\nQuestion: ${question}\nModel answer / key points: ${key}\nStudent answer: ${answer}\nGrade 0-100 for correctness and completeness. List what was right, what was missing, and give a one-line better answer.`,
    obj({ score: int, right: arr(str), missing: arr(str), better: str }), { effort: 'medium', maxTokens: 3000 });
}

export function annotateArticle(text) {
  return askJSON(
    `Turn this article/report excerpt into an annotation challenge for a student learning to read business and market news critically.
TEXT:\n"""${text.slice(0, 12000)}"""
Split into its sentences (keep original wording). Label each: "claim", "evidence", "number", "assumption", "opinion", or "context". Then write 4 multiple-choice questions testing understanding (main claim, what evidence supports it, what's missing, what it means for a company/investor), and 3 key terms with plain definitions.`,
    obj({
      title: str,
      sentences: arr(obj({ s: str, label: { type: 'string', enum: ['claim', 'evidence', 'number', 'assumption', 'opinion', 'context'] }, why: str })),
      questions: arr(obj({ q: str, c: arr(str), a: int, e: str })),
      terms: arr(obj({ term: str, def: str })),
    }), { effort: 'medium', maxTokens: 12000 });
}

export function gradeMemo({ caseTitle, caseText, task, response }) {
  return askJSON(
    `Business case: ${caseTitle}\n${caseText}\nTask: ${task}\nStudent memo/answer:\n${response}\nGrade like a case-competition judge: recommendation clarity, use of numbers/evidence, risks considered, structure, and professionalism (each 0-10). Give the strongest improvement and an example opening line for a better memo.`,
    obj({ scores: arr(obj({ area: str, score: int, why: str })), overall: int, improvement: str, betterOpening: str }), { effort: 'high' });
}
