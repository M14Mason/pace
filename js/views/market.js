// Real-world finance: on-demand market brief + concept quiz, real-company analysis,
// and a stock pitch builder (written, then a spoken 2-minute version).
import { S, save, uid, recordActivity, addRecord } from '../store.js';
import { h, card, toast, md, fmtMs } from '../ui.js';
import { hasAI, marketBrief, analyzeCompany, gradePitch, analyzeSpeech, aiErrorText } from '../ai.js';
import { startRound, onRoundFinish, fromBank } from '../quiz.js';
import { addCards } from './cards.js';
import { addAIQuestions } from '../pool.js';
import { dictate, textMetrics } from './speak.js';
import { DISCLAIMER } from '../data/finance.js';
import * as fx from '../fx.js';

['market-q', 'company-q'].forEach(k => onRoundFinish(k, res => { location.hash = res.meta.back; setTimeout(() => toast(`${Math.round(res.acc * 100)}% · misses go to review`, res.acc >= 0.8 ? 'good' : ''), 400); }));

const back = h => h('a', { href: '#/finance', class: 'muted small' }, '← Business & Finance');
const disc = () => h('div', { class: 'disclaimer', style: { marginBottom: '12px' } }, DISCLAIMER.replace('Companies in cases and articles are fictional.', 'Live data is pulled by Claude via web search - double-check anything important.'));
const needKey = () => card('', h('p', {}, 'This uses Claude with live web search. Add your Claude API key in Settings first.'));
// Store generated questions in the finance AI bank so misses can come back in spaced review.
const toQs = (list, unit) => {
  const start = (S().aiBank[`fin/${unit}`] || []).length;
  const n = addAIQuestions('fin', unit, list);
  return S().aiBank[`fin/${unit}`].slice(start, start + n).map((b, i) => ({ ...fromBank(b, `a:fin/${unit}/${start + i}`), srs: true }));
};

// ---------- brief ----------
export function brief(root) {
  const last = S().lastBrief;
  const focus = h('input', { class: 'input', placeholder: 'Optional focus: e.g. banks, Fed, Nvidia earnings' });
  const out = h('div', { class: 'stack' });
  const go = h('button', { class: 'btn primary', disabled: !hasAI() }, 'Brief me');
  go.onclick = async () => {
    go.disabled = true; go.textContent = 'Reading the news…';
    try { const b = await marketBrief(focus.value.trim()); b.id = uid(); b.ts = Date.now(); S().lastBrief = b; save(); show(b); }
    catch (e) { toast(aiErrorText(e), 'bad'); }
    go.disabled = false; go.textContent = 'Brief me again';
  };
  const show = b => {
    out.innerHTML = '';
    out.append(
      h('div', { class: 'lesson-step' }, h('div', { class: 'small muted' }, `Session: ${b.asOf}`), h('h2', { style: { margin: '4px 0 10px' } }, b.headline),
        ...b.sections.map(s => h('div', { style: { marginBottom: '12px' } }, h('h4', {}, s.title), h('p', { html: md(s.body) }), h('span', { class: 'chip acc' }, s.concept)))),
      h('div', { class: 'lesson-step' }, h('h3', {}, 'Concepts in this brief'), ...b.concepts.map(c => h('p', {}, h('b', {}, c.term + ': '), c.explain, h('div', { class: 'small muted' }, c.example))),
        h('button', { class: 'btn sm ghost', onclick: () => { toast(`Added ${addCards('Market concepts', b.concepts.map(c => ({ front: c.term, back: `${c.explain}\nEx: ${c.example}` })), 'brief')} flashcards`, 'good'); } }, '+ Add concepts to flashcards')),
      h('button', { class: 'btn primary wide', onclick: () => startRound({ kind: 'market-q', meta: { back: '#/finance/market' }, title: 'Brief quiz', questions: b._qs ||= toQs(b.questions, 'market'), area: 'finance', tags: ['finance', 'market'] }) }, `Quiz me on these concepts (${b.questions.length})`));
    fx.stagger([...out.children]);
    recordActivity({ area: 'finance', ms: 2 * 60000 });
  };
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, back(h), h('h1', {}, 'Market brief'), h('div', { class: 'sub' }, 'What moved and why - then a quiz on the concepts.'))), disc(),
    hasAI() ? card('', h('div', { class: 'stack' }, focus, go, last ? h('p', { class: 'small muted' }, `Last brief: ${new Date(last.ts).toLocaleString()}`) : null)) : needKey(), out));
  if (last) show(last);
}

// ---------- real company ----------
export function company(root) {
  const t = h('input', { class: 'input', placeholder: 'Ticker, e.g. AAPL, JPM, COST', style: { textTransform: 'uppercase' } });
  const out = h('div', { class: 'stack' });
  const go = h('button', { class: 'btn primary', disabled: !hasAI() }, 'Pull the numbers');
  go.onclick = async () => {
    const tk = t.value.trim().toUpperCase(); if (!/^[A-Z.\-]{1,6}$/.test(tk)) return toast('Enter a ticker symbol');
    go.disabled = true; go.textContent = 'Reading filings…';
    try { const r = await analyzeCompany(tk); r.id = uid(); r.ts = Date.now(); (S().companies ||= []).unshift(r); S().companies = S().companies.slice(0, 15); save(); show(r); }
    catch (e) { toast(aiErrorText(e), 'bad'); }
    go.disabled = false; go.textContent = 'Pull the numbers';
  };
  const show = r => {
    out.innerHTML = '';
    out.append(
      card(`${r.company} (${r.ticker})`, h('div', { class: 'stack' }, h('div', { class: 'small muted' }, `As of ${r.asOf} · ${r.source}`),
        h('div', { class: 'feedback-rows' }, ...r.facts.map(f => h('div', { class: 'row between' }, h('span', {}, f.label, f.note ? h('div', { class: 'small muted' }, f.note) : null), h('b', { class: 'num' }, f.value)))),
        h('p', {}, r.story))),
      h('button', { class: 'btn primary wide', onclick: () => startRound({ kind: 'company-q', meta: { back: '#/finance/company' }, title: `${r.ticker} analysis`, questions: r._qs ||= toQs(r.questions, 'company'), area: 'finance', tags: ['finance', 'valuation'] }) }, `Analyze it: ${r.questions.length} questions on the real numbers`),
      card('Think like an analyst', h('ul', {}, ...r.thinkAbout.map(x => h('li', {}, x)))),
      h('a', { class: 'btn', href: `#/finance/pitch/${encodeURIComponent(r.ticker)}` }, `Pitch ${r.ticker} →`));
    fx.stagger([...out.children]);
    recordActivity({ area: 'finance', ms: 3 * 60000 });
  };
  const recent = (S().companies || []);
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, back(h), h('h1', {}, 'Analyze a real company'), h('div', { class: 'sub' }, 'Real reported numbers → valuation and margin practice.'))), disc(),
    hasAI() ? card('', h('div', { class: 'stack' }, t, go, recent.length ? h('div', { class: 'pill-row' }, ...recent.map(r => h('button', { class: 'btn sm', onclick: () => show(r) }, `${r.ticker} · ${new Date(r.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`))) : null)) : needKey(), out));
}

// ---------- pitch builder ----------
const SECTIONS = [
  ['company', 'Company & what it does', 'One or two sentences a non-finance person would understand.'],
  ['thesis', 'Investment thesis (3 reasons)', 'Why is the market wrong or early? Number your three reasons.'],
  ['valuation', 'Valuation', 'P/E vs peers, growth, a price target with simple math.'],
  ['catalysts', 'Catalysts', 'What specific events in the next 6-18 months could prove the thesis?'],
  ['risks', 'Risks & mitigants', 'Top 2-3 risks and why they don\'t break the thesis.'],
  ['rec', 'Recommendation', 'Buy/hold/sell (simulated), target, time horizon.'],
];
export function pitch(root, tickerParam) {
  const drafts = (S().pitchDrafts ||= {});
  const tk = h('input', { class: 'input', placeholder: 'Ticker', value: tickerParam || S().pitchTicker || '' , style: { textTransform: 'uppercase' } });
  const key = () => (tk.value.trim().toUpperCase() || 'DRAFT');
  const fields = {};
  const sections = SECTIONS.map(([k, label, help]) => {
    const ta = h('textarea', { class: 'input', rows: 3, placeholder: help });
    ta.value = (drafts[key()] || {})[k] || '';
    ta.oninput = () => { (drafts[key()] ||= {})[k] = ta.value; S().pitchTicker = key(); save(); };
    fields[k] = ta;
    return h('div', { class: 'field' }, h('label', {}, label), ta);
  });
  tk.onchange = () => { for (const [k] of SECTIONS) fields[k].value = (drafts[key()] || {})[k] || ''; S().pitchTicker = key(); save(); };
  const out = h('div', { class: 'stack' });
  const go = h('button', { class: 'btn primary', disabled: !hasAI() }, hasAI() ? 'Grade my written pitch' : 'Add a Claude key in Settings to be graded');
  go.onclick = async () => {
    const p = Object.fromEntries(SECTIONS.map(([k]) => [k, fields[k].value.trim()]));
    if (Object.values(p).filter(Boolean).length < 4) return toast('Fill in at least 4 sections first.');
    go.disabled = true; go.textContent = 'Judging…';
    try {
      const g = await gradePitch({ pitch: p, ticker: key() });
      if (g.overall > Math.max(0, ...(S().pitchScores || []).map(x => x.overall))) addRecord('score', `Stock pitch (${key()}): ${g.overall}/10`, g.overall / 10);
      (S().pitchScores ||= []).unshift({ ticker: key(), overall: g.overall, ts: Date.now() }); save();
      recordActivity({ area: 'finance', ms: 15 * 60000 });
      out.innerHTML = '';
      out.append(h('h2', {}, `${g.overall} / 10`), h('div', { class: 'feedback-rows' }, ...g.scores.map(s => h('div', {}, h('div', { class: 'row between' }, h('b', {}, s.area), h('span', { class: 'chip acc' }, `${s.score}/10`)), h('p', { class: 'small' }, s.why)))),
        g.unsupported.length ? h('div', { class: 'hint' }, h('b', {}, 'Needs support'), h('ul', {}, ...g.unsupported.map(x => h('li', {}, x)))) : null,
        h('div', { class: 'hint' }, h('b', {}, 'Biggest improvement'), g.improvement), h('div', { class: 'hint worked' }, h('b', {}, 'Sharper hook'), h('p', {}, g.hook)));
      fx.stagger([...out.children]);
    } catch (e) { toast(aiErrorText(e), 'bad'); }
    go.disabled = false; go.textContent = 'Grade again';
  };
  // spoken 2-minute version
  const spoken = h('textarea', { class: 'input', rows: 5, placeholder: 'Tap Speak, start the 2:00 timer, and pitch it out loud…' });
  const clock = h('span', { class: 'kpi-v num' }, '2:00');
  let iv, left = 120, t0 = 0;
  const timerBtn = h('button', { class: 'btn sm', onclick: () => { clearInterval(iv); left = 120; t0 = Date.now(); iv = setInterval(() => { left--; clock.textContent = `${Math.floor(Math.max(0, left) / 60)}:${String(Math.max(0, left) % 60).padStart(2, '0')}`; if (left <= 0) { clearInterval(iv); fx.sfx.level(); toast('Time - wrap up in one sentence'); } if (!clock.isConnected) clearInterval(iv); }, 1000); } }, 'Start 2:00');
  const sOut = h('div', { class: 'stack' });
  const sGo = h('button', { class: 'btn primary', disabled: !hasAI() }, 'Analyze my spoken pitch');
  sGo.onclick = async () => {
    if (spoken.value.trim().split(/\s+/).length < 60) return toast('Pitch for at least a minute first.');
    sGo.disabled = true; sGo.textContent = 'Listening back…';
    const dur = t0 ? Math.min(Date.now() - t0, 150000) : 120000;
    try {
      const ai = await analyzeSpeech({ prompt: `2-minute spoken stock pitch for ${key()} (internship interview / competition)`, transcript: spoken.value, metrics: { ...textMetrics(spoken.value, dur), durationMs: dur } });
      sOut.innerHTML = '';
      sOut.append(h('div', { class: 'score-grid' }, ...Object.entries(ai.scores).map(([k, v]) => h('div', { class: 'score-cell' }, h('div', { class: 'v' }, v), h('div', { class: 'l' }, k)))),
        h('p', {}, ai.summary), h('div', { class: 'feedback-rows' }, ...ai.fixes.map(f => h('div', {}, h('div', { class: 'q-quote' }, `"${f.quote}"`), h('div', {}, h('b', {}, '→ '), f.better)))));
      fx.stagger([...sOut.children]);
    } catch (e) { toast(aiErrorText(e), 'bad'); }
    sGo.disabled = false; sGo.textContent = 'Analyze again';
  };
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, back(h), h('h1', {}, 'Stock pitch builder'), h('div', { class: 'sub' }, 'Write it, get judged, then say it in 2 minutes.'))), disc(),
    h('div', { class: 'lesson-step' }, h('h3', {}, '1 · Written pitch'), h('div', { class: 'stack' }, tk, h('a', { class: 'small', href: '#/finance/company' }, 'Need real numbers? Analyze the company first →'), ...sections, go, out)),
    h('div', { class: 'lesson-step' }, h('h3', {}, '2 · Spoken 2-minute version'), h('p', { class: 'small muted' }, 'Hook → 3 reasons → valuation → risk → ask. Interviewers stop you at 2 minutes.'),
      h('div', { class: 'row between' }, timerBtn, clock), spoken, h('div', { class: 'row' }, dictate(spoken), sGo), sOut)));
}
