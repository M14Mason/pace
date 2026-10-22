// Claude API, called straight from the browser with the student's own key
// (stored only in this browser's localStorage). Used for grading free responses,
// judging roleplays, analysing speech, and generating extra practice.
import { S, save } from './store.js';

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

// ---- models, prices, cost modes ----
// List prices in USD per million tokens (platform.claude.com pricing, Oct 2026).
export const PRICES = {
  'claude-opus-5-5': { name: 'Opus 5.5', in: 4, out: 20, cacheRead: 0.20, cacheWrite: 5 },
  'claude-sonnet-5-5': { name: 'Sonnet 5.5', in: 2, out: 10, cacheRead: 0.20, cacheWrite: 2.5 },
  'claude-haiku-5-5': { name: 'Haiku 5.5', in: 0.10, out: 0.50, cacheRead: 0.01, cacheWrite: 0.125 },
  'claude-opus-4-8': { name: 'Opus 4.8', in: 5, out: 25, cacheRead: 0.50, cacheWrite: 6.25 }, // possible server-side fallback
};
export const SEARCH_PRICE = 0.01; // $10 per 1,000 web searches

// Each feature has a tier. Modes decide which model serves each tier.
export const FEATURES = {
  gen: { label: 'Generate questions', tier: 'routine' },
  drill: { label: 'Speak drill check', tier: 'routine' },
  cards: { label: 'Flashcards from notes', tier: 'routine' },
  annotate: { label: 'Article annotation', tier: 'routine' },
  short: { label: 'Short-answer grading', tier: 'routine' },
  brief: { label: 'Market brief', tier: 'web' },
  frq: { label: 'FRQ grading', tier: 'grading' },
  roleplay: { label: 'DECA judging', tier: 'grading' },
  speech: { label: 'Speak analysis', tier: 'grading' },
  memo: { label: 'Memo grading', tier: 'grading' },
  pitch: { label: 'Pitch grading', tier: 'grading' },
  homework: { label: 'Homework helper', tier: 'grading' },
  company: { label: 'Company analysis', tier: 'webdeep' },
  test: { label: 'Connection test', tier: 'routine' },
};
export const MODES = {
  best: { label: 'Best', desc: 'Opus 5.5 for everything.', tiers: { routine: 'claude-opus-5-5', web: 'claude-opus-5-5', grading: 'claude-opus-5-5', webdeep: 'claude-opus-5-5' } },
  balanced: { label: 'Balanced', desc: 'Sonnet 5.5 for routine work and the market brief; Opus 5.5 for grading, homework, Speak and company analysis.', tiers: { routine: 'claude-sonnet-5-5', web: 'claude-sonnet-5-5', grading: 'claude-opus-5-5', webdeep: 'claude-opus-5-5' } },
  saver: { label: 'Saver', desc: 'Haiku 5.5 for routine work; Sonnet 5.5 for grading and web research.', tiers: { routine: 'claude-haiku-5-5', web: 'claude-sonnet-5-5', grading: 'claude-sonnet-5-5', webdeep: 'claude-sonnet-5-5' } },
};
export const modelFor = feature => MODES[S().profile.aiMode || 'best'].tiers[FEATURES[feature]?.tier || 'grading'];

// ---- usage meter ----
const month = (t = Date.now()) => new Date(t).toISOString().slice(0, 7);
function deviceId() { let id = localStorage.getItem('pace.device'); if (!id) { id = 'd' + Math.random().toString(16).slice(2, 14); localStorage.setItem('pace.device', id); } return id; }

export function costOf(model, u = {}) {
  const p = PRICES[model] || PRICES['claude-opus-5-5'];
  return ((u.input_tokens || 0) * p.in + (u.output_tokens || 0) * p.out + (u.cache_read_input_tokens || 0) * p.cacheRead + (u.cache_creation_input_tokens || 0) * p.cacheWrite) / 1e6
    + (u.server_tool_use?.web_search_requests || 0) * SEARCH_PRICE;
}
function record(feature, res) {
  const u = res.usage || {};
  const cost = costOf(res.model, u);
  const all = (S().aiUsage ||= {});
  const dev = (all[deviceId()] ||= { months: {}, recent: [] });
  const m = (dev.months[month()] ||= { total: 0, calls: 0, byFeature: {} });
  const f = (m.byFeature[feature] ||= { calls: 0, cost: 0, inTok: 0, outTok: 0, searches: 0 });
  m.total += cost; m.calls++;
  f.calls++; f.cost += cost; f.inTok += (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0); f.outTok += u.output_tokens || 0; f.searches += u.server_tool_use?.web_search_requests || 0;
  dev.recent = [{ feature, model: res.model, cost, ts: Date.now() }, ...dev.recent].slice(0, 40);
  dev.updatedAt = Date.now();
  save();
  return cost;
}
// Month totals across every synced device.
export function usageMonth(mk = month()) {
  const out = { total: 0, calls: 0, byFeature: {} };
  for (const dev of Object.values(S().aiUsage || {})) {
    const m = dev.months?.[mk]; if (!m) continue;
    out.total += m.total; out.calls += m.calls;
    for (const [k, f] of Object.entries(m.byFeature)) { const o = (out.byFeature[k] ||= { calls: 0, cost: 0, inTok: 0, outTok: 0, searches: 0 }); for (const x of Object.keys(o)) o[x] += f[x] || 0; }
  }
  return out;
}
export const recentCalls = () => Object.values(S().aiUsage || {}).flatMap(d => d.recent || []).sort((a, b) => b.ts - a.ts).slice(0, 25);
export const thisMonth = month;

function checkCap() {
  const cap = +S().profile.aiCap || 0;
  if (cap > 0 && usageMonth().total >= cap) { const e = new Error(`Monthly Claude cap of $${cap.toFixed(2)} reached. Raise it in Settings → Claude usage.`); e.cap = true; throw e; }
}
let warned = '';
function maybeWarn(toastFn) {
  const cap = +S().profile.aiCap || 0; if (!cap) return;
  const t = usageMonth().total;
  if (t >= cap * 0.8 && warned !== month()) { warned = month(); import('./ui.js').then(m => m.toast(`Claude spend this month: $${t.toFixed(2)} of your $${cap.toFixed(2)} cap`)); }
}

// Request params that differ by model.
function params(model) {
  const p = { model };
  if (model !== 'claude-haiku-5-5') { p.betas = ['server-side-fallback-2026-07-01']; p.fallbacks = 'default'; }
  return p;
}

const SYSTEM = `You are the tutor inside Pace, a study app for one ambitious high-school student (10th grade, block schedule) who wants a finance internship, 5s on AP exams, and to compete in DECA (finance + business management clusters).
How this student learns best: a concise worked example first, then a hint (not the answer) when stuck, the "why" behind every rule, then lots of quick reps. Keep feedback direct, specific, mature and encouraging - never childish, never corporate. Short sentences. Point to the exact phrase or step that needs to change.
Investing content is education and simulated practice, never personal financial advice.`;

// Ask for JSON that matches `schema`. Returns the parsed object.
// `prompt` may be a string or a content-block array (text + images).
export async function askJSON(prompt, schema, { effort = 'medium', maxTokens = 8000, feature = 'gen' } = {}) {
  checkCap();
  const c = await client();
  const res = await c.beta.messages.create({
    ...params(modelFor(feature)),
    max_tokens: maxTokens,
    system: SYSTEM,
    output_config: { effort, format: { type: 'json_schema', schema } },
    messages: [{ role: 'user', content: prompt }],
  });
  record(feature, res); maybeWarn();
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
    }), { effort: 'high', feature: 'frq' });
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
    }), { effort: 'high', feature: 'roleplay' });
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
    }), { effort: 'high', feature: 'speech' });
}

export function checkDrill({ instruction, original, attempt }) {
  return askJSON(
    `Articulation drill. Instruction: "${instruction}". Original: "${original}". Student's spoken attempt: "${attempt}". Did they meet the instruction? Be brief.`,
    obj({ pass: { type: 'boolean' }, feedback: str, model: str }), { effort: 'low', maxTokens: 2000, feature: 'drill' });
}

export function genQuestions({ course, unit, topics, n = 8, level = 'AP exam' }) {
  return askJSON(
    `Write ${n} new multiple-choice practice questions for ${course}, unit "${unit}". Topics: ${topics}. Difficulty: ${level}. Use stimulus-based questions where the real exam does (short source/excerpt/data inside the question text). Each has 4 choices, one correct, a 1-2 sentence explanation of WHY, and two layered hints (first a memory cue, second a strategy cue) that do not reveal the answer. Vary which letter is correct.`,
    obj({ questions: arr(obj({ q: str, c: arr(str), a: int, e: str, h: arr(str) })) }), { effort: 'medium', maxTokens: 12000, feature: 'gen' });
}

export function gradeShort({ context, question, answer, key }) {
  return askJSON(
    `Context: ${context}\nQuestion: ${question}\nModel answer / key points: ${key}\nStudent answer: ${answer}\nGrade 0-100 for correctness and completeness. List what was right, what was missing, and give a one-line better answer.`,
    obj({ score: int, right: arr(str), missing: arr(str), better: str }), { effort: 'medium', maxTokens: 3000, feature: 'short' });
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
    }), { effort: 'medium', maxTokens: 12000, feature: 'annotate' });
}

export function gradeMemo({ caseTitle, caseText, task, response }) {
  return askJSON(
    `Business case: ${caseTitle}\n${caseText}\nTask: ${task}\nStudent memo/answer:\n${response}\nGrade like a case-competition judge: recommendation clarity, use of numbers/evidence, risks considered, structure, and professionalism (each 0-10). Give the strongest improvement and an example opening line for a better memo.`,
    obj({ scores: arr(obj({ area: str, score: int, why: str })), overall: int, improvement: str, betterOpening: str }), { effort: 'high', feature: 'memo' });
}

// ---- images (homework photos, notes) ----
// Downscale a photo to <= 1568px on the long side and return a base64 JPEG content block.
export async function imageBlock(file) {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 1568 / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  const data = c.toDataURL('image/jpeg', 0.85).split(',')[1];
  img.close && img.close();
  return { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data } };
}
const withImage = (text, image) => (image ? [image, { type: 'text', text }] : text);

export function cardsFromNotes({ text, image, deck }) {
  return askJSON(withImage(
    `Turn ${image ? 'these class notes (photo above)' : 'these notes'} into high-quality flashcards for spaced repetition${deck ? ` for the deck "${deck}"` : ''}.
Rules: one fact or idea per card; fronts are questions or cues (not just a word when a question works better); backs are short (under 25 words) and exact; include the "why" on concept cards; cover every important term, date, formula and cause/effect; skip filler. 8-30 cards depending on content.${text ? `\n\nNOTES:\n"""${text.slice(0, 15000)}"""` : ''}`, image),
    obj({ deck: str, cards: arr(obj({ front: str, back: str })) }), { effort: 'medium', maxTokens: 12000, feature: 'cards' });
}

export function homeworkHelp({ text, image, subject }) {
  return askJSON(withImage(
    `A student needs help with a ${subject} homework problem${image ? ' (photo above)' : ''}. They learn best like this: understand the why, then a worked path broken into small steps, with a HINT before any answer. Do NOT just give the final answer up front.
${text ? `PROBLEM / WHERE THEY ARE STUCK:\n"""${text.slice(0, 6000)}"""\n` : ''}
Return:
- problem: the problem transcribed cleanly (if a photo, read it carefully; if several problems, pick the first unless the text says which).
- concept: the core idea in 1-2 sentences ("why this works").
- steps: 3-7 small steps. For each: "ask" = a question prompting the student to do this step themself; "hint" = a nudge that doesn't give it away; "result" = the correct result of that step with a one-line reason.
- final: the final answer.
- keyIdea: one reusable tip/formula worth saving.
- similar: exactly 3 new practice problems on the same skill, slightly varied, each multiple choice with 4 choices (index "a" of the correct one), a short explanation "e", and two hints "h".${subject === 'Spanish' ? ' For Spanish, problems can be conjugation/translation/sentence completion.' : ''}`, image),
    obj({ problem: str, concept: str, steps: arr(obj({ ask: str, hint: str, result: str })), final: str, keyIdea: str, similar: arr(obj({ q: str, c: arr(str), a: int, e: str, h: arr(str) })) }), { effort: 'high', maxTokens: 16000, feature: 'homework' });
}

// ---- live web data (market brief, real companies) ----
// Uses Claude's server-side web search. Structured-output mode can't be combined with
// search citations, so the JSON comes back as the final text block and is parsed here.
export async function askWeb(prompt, { effort = 'medium', maxTokens = 16000, maxSearches = 6, feature = 'brief' } = {}) {
  checkCap();
  const c = await client();
  const messages = [{ role: 'user', content: prompt + '\n\nAfter researching, reply with ONLY one JSON object (no prose, no code fence) matching the requested shape.' }];
  for (let turn = 0; turn < 4; turn++) {
    const res = await c.beta.messages.create({
      ...params(modelFor(feature)), max_tokens: maxTokens, system: SYSTEM,
      output_config: { effort },
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: maxSearches }],
      messages,
    });
    record(feature, res); maybeWarn();
    if (res.stop_reason === 'refusal') throw new Error('Claude declined this request.');
    if (res.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: res.content }); continue; }
    const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = fenced ? fenced[1] : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    try { return JSON.parse(raw); } catch { throw new Error('Couldn\'t read Claude\'s answer - try again.'); }
  }
  throw new Error('The search took too long - try again.');
}

export function marketBrief(focus) {
  return askWeb(`Today is ${new Date().toDateString()}. Build a 2-minute market brief for a high-school student learning finance (aiming for a wealth-management internship). Search for the most recent U.S. market session and major business news${focus ? `, with extra attention to: ${focus}` : ''}.
Shape: {"asOf": string date of the session covered, "headline": string, "sections": [{"title": string, "body": 2-4 plain sentences on what moved and WHY, "concept": the finance concept it illustrates}] (3-5 sections: indexes/rates, 1-2 notable companies/earnings, macro/Fed/data, one wildcard), "concepts": [{"term": string, "explain": one clear sentence, "example": from today's news}] (4-6), "questions": [{"q": string, "c": [4 strings], "a": index of correct, "e": why, "h": [2 hints]}] (5 questions that test the CONCEPTS using today's examples, not trivia like exact prices)}.
Education only - no buy/sell advice.`, { effort: 'medium', maxSearches: 6, feature: 'brief' });
}

export function analyzeCompany(ticker) {
  return askWeb(`Find the most recent quarterly AND annual results for the public company with ticker "${ticker}" (latest 10-Q/10-K or earnings release) and its approximate current share price.
Shape: {"company": string, "ticker": string, "asOf": string, "source": string (where the numbers came from), "price": number, "facts": [{"label": string, "value": string, "note": string}] (8-12 items: revenue (latest FY and prior FY), gross margin, operating income, net income, diluted EPS (TTM), shares outstanding, cash, total debt, free cash flow, revenue growth %), "story": 3-4 sentences on what drives the business and the latest quarter, "questions": [{"q": string, "c": [4 strings], "a": index, "e": worked calculation or reasoning, "h": [2 hints]}] (6 questions computing or interpreting real metrics: P/E from price and EPS, margins, growth rate, net cash, what the trend suggests), "thinkAbout": [3 open analyst questions]}.
Use real reported numbers; round sensibly; say in source if any number is estimated. Education only, not advice.`, { effort: 'high', maxSearches: 8, feature: 'company' });
}

export function gradePitch({ pitch, ticker }) {
  return askJSON(`Grade this stock pitch on ${ticker} like a competition judge AND an internship interviewer. Educational exercise.
PITCH:\n${JSON.stringify(pitch, null, 2)}
Score 0-10: thesis clarity, evidence & numbers, valuation reasoning, catalysts, risks & mitigants, structure/persuasiveness. Point out any claim that needs support. Give the single biggest improvement and a sharper 2-sentence opening hook.`,
    obj({ scores: arr(obj({ area: str, score: int, why: str })), overall: int, unsupported: arr(str), improvement: str, hook: str }), { effort: 'high', feature: 'pitch' });
}
