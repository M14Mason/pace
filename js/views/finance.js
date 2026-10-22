// Business & Finance: structured lessons, cases, annotation, DECA, and a portfolio sim.
import { S, save, uid, recordActivity, addRecord } from '../store.js';
import { h, card, bar, pct, toast, md, svg, fmtMs } from '../ui.js';
import { FIN_TRACKS, FIN_UNITS, CASES, ARTICLES, DECA, DISCLAIMER } from '../data/finance.js';
import { renderUnit } from '../unitview.js';
import { renderLesson } from '../lesson.js';
import { unitPool, buildSet } from '../pool.js';
import { startRound, onRoundFinish, fromBank } from '../quiz.js';
import { unitReadiness, lessonKey } from '../data/courses.js';
import { hasAI, gradeMemo, judgeRoleplay, annotateArticle, aiErrorText } from '../ai.js';
import { dictate } from './speak.js';
import * as market from './market.js';
import { renderReading } from './reading.js';
import * as fx from '../fx.js';

export const FINC = { id: 'fin', name: 'Business & Finance', short: 'Finance', src: 'fin', units: FIN_UNITS };
export const DECAC = { id: 'deca', name: 'DECA', short: 'DECA', src: 'deca', units: DECA.clusters };

onRoundFinish('case-q', res => { location.hash = res.meta.back; setTimeout(() => toast(`${Math.round(res.acc * 100)}% · now write the memo`), 400); });
onRoundFinish('anno-q', res => { location.hash = res.meta.back; setTimeout(() => toast(`${Math.round(res.acc * 100)}% on the questions`, res.acc >= 0.75 ? 'good' : ''), 400); });

export function render(root, p) {
  const disc = h('div', { class: 'disclaimer', style: { marginBottom: '12px' } }, DISCLAIMER);
  if (p[0] === 'unit') {
    const u = FIN_UNITS.find(x => x.id === p[1]); if (!u) return (location.hash = '#/finance');
    if (p[2] === 'read') return renderReading(root, { c: FINC, u, back: `#/finance/unit/${u.id}`, area: 'finance', tags: ['finance', u.id] });
    if (p[2] === 'lesson') { const l = u.lessons.find(x => x.id === p[3]); return renderLesson(root, { lesson: l, key: lessonKey(FINC, u, l), back: `#/finance/unit/${u.id}`, title: 'Business & Finance', sub: u.t, check: buildSet(unitPool(FINC, u, 'fin'), 3), area: 'finance', tags: ['finance', u.id] }); }
    root.append(disc);
    return renderUnit(root, { c: FINC, u, base: `#/finance/unit/${u.id}`, back: '#/finance', area: 'finance', label: 'Finance' });
  }
  if (p[0] === 'deca') return deca(root, p.slice(1));
  if (p[0] === 'case') return caseView(root, p[1]);
  if (p[0] === 'annotate') return annotate(root, p[1]);
  if (p[0] === 'lab') return lab(root, disc);
  if (p[0] === 'market') return market.brief(root);
  if (p[0] === 'company') return market.company(root);
  if (p[0] === 'pitch') return market.pitch(root, p[1] ? decodeURIComponent(p[1]) : '');
  return hub(root, disc);
}

function hub(root, disc) {
  const tab = S().finTab || 'learn';
  const setTab = t => { S().finTab = t; save(); root.innerHTML = ''; hub(root, disc); };
  const total = FIN_UNITS.reduce((a, u) => a + unitReadiness(FINC, u), 0) / FIN_UNITS.length;
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Business & Finance'), h('div', { class: 'sub' }, `Internship-ready finance · ${pct(total)} through the core track`))),
    disc,
    h('div', { class: 'grid g3', style: { marginBottom: '12px' } },
      h('a', { class: 'tile', href: '#/finance/market' }, h('div', { class: 'tile-ic' }, '📈'), h('h4', {}, 'Market brief'), h('div', { class: 'muted' }, 'What moved and why, then a concept quiz')),
      h('a', { class: 'tile', href: '#/finance/company' }, h('div', { class: 'tile-ic' }, '🏢'), h('h4', {}, 'Analyze a real company'), h('div', { class: 'muted' }, 'Real numbers → P/E, margins, growth')),
      h('a', { class: 'tile', href: '#/finance/pitch' }, h('div', { class: 'tile-ic' }, '🎤'), h('h4', {}, 'Stock pitch builder'), h('div', { class: 'muted' }, 'Written pitch, then 2 minutes out loud'))),
    h('div', { class: 'tabs' }, ...[['learn', 'Lessons'], ['cases', 'Cases & memos'], ['annotate', 'Annotate'], ['deca', 'DECA'], ['lab', 'Portfolio lab']].map(([k, l]) => h('button', { class: tab === k ? 'on' : '', onclick: () => k === 'lab' ? (location.hash = '#/finance/lab') : k === 'deca' ? (location.hash = '#/finance/deca') : setTab(k) }, l))));
  if (tab === 'learn') root.append(...FIN_TRACKS.map(t => h('div', {},
    h('h3', { class: 'muted', style: { margin: '18px 4px 10px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.07em' } }, `${t.t} · ${t.sub}`),
    h('div', { class: 'grid g3' }, ...FIN_UNITS.filter(u => u.track === t.id).map(u => {
      const r = unitReadiness(FINC, u);
      return h('a', { class: 'tile', href: `#/finance/unit/${u.id}` }, h('h4', { style: { marginTop: 0 } }, u.t), h('div', { class: 'muted' }, u.topics), h('div', { style: { marginTop: '10px' } }, bar(r)));
    })))));
  if (tab === 'cases') root.append(h('div', { class: 'grid g3' }, ...CASES.map(c => h('a', { class: 'tile', href: `#/finance/case/${c.id}` },
    h('div', { class: 'tile-top' }, h('span', { class: 'chip acc' }, c.tag), (S().memos || {})[c.id] ? h('span', { class: 'chip good' }, `${S().memos[c.id].overall}/10`) : null), h('h4', {}, c.t), h('div', { class: 'muted' }, 'Numbers → 3 questions → memo graded by Claude')))));
  if (tab === 'annotate') root.append(h('div', { class: 'grid g3' },
    ...ARTICLES.concat(S().customArticles || []).map(a => h('a', { class: 'tile', href: `#/finance/annotate/${a.id}` }, h('h4', { style: { marginTop: 0 } }, a.t), h('div', { class: 'muted' }, `${a.sentences.length} sentences · label claims vs evidence`))),
    h('a', { class: 'tile', href: '#/finance/annotate/new' }, h('div', { class: 'tile-ic' }, '+'), h('h4', {}, 'Annotate your own article'), h('div', { class: 'muted' }, 'Paste a news story, earnings release or memo - Claude builds the challenge'))));
}

// ---------- cases ----------
function caseView(root, id) {
  const c = CASES.find(x => x.id === id); if (!c) return (location.hash = '#/finance');
  const ta = h('textarea', { class: 'input', rows: 8, placeholder: 'To: ...\nFrom: ...\nRecommendation: ...' }, (S().memoDrafts || {})[id] || '');
  ta.oninput = () => { (S().memoDrafts ||= {})[id] = ta.value; save(); };
  const out = h('div', { class: 'stack' });
  const prev = (S().memos || {})[id];
  const btn = h('button', { class: 'btn primary', disabled: !hasAI() }, hasAI() ? 'Grade my memo' : 'Add a Claude key in Settings to grade');
  btn.onclick = async () => {
    if (ta.value.trim().split(/\s+/).length < 40) return toast('Aim for at least 40 words.');
    btn.disabled = true; btn.textContent = 'Judging…';
    try {
      const g = await gradeMemo({ caseTitle: c.t, caseText: c.setup, task: c.task, response: ta.value });
      if (g.overall > Math.max(0, ...Object.values(S().memos || {}).map(m => m.overall))) addRecord('score', `Case memo (${c.t}): ${g.overall}/10`, g.overall / 10);
      (S().memos ||= {})[id] = { overall: g.overall, ts: Date.now() }; save();
      recordActivity({ area: 'finance', ms: 12 * 60000 });
      showMemo(out, g);
    } catch (e) { toast(aiErrorText(e), 'bad'); }
    btn.disabled = false; btn.textContent = 'Grade again';
  };
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/finance', class: 'muted small' }, '← Business & Finance'), h('h1', {}, c.t), h('div', { class: 'sub' }, c.tag))),
    h('div', { class: 'lesson-step' }, h('h3', {}, 'The situation'), h('p', {}, c.setup)),
    h('div', { class: 'lesson-step' }, h('h3', {}, 'Step 1 · Run the numbers'), h('p', { class: 'small muted' }, 'Three questions. Misses come back with hints.'),
      h('button', { class: 'btn primary', onclick: () => startRound({ kind: 'case-q', meta: { back: `#/finance/case/${id}` }, title: c.t, questions: c.questions.map((q, i) => fromBank(q, `case:${id}:${i}`)), area: 'finance', tags: ['finance', 'case'] }) }, 'Start')),
    h('div', { class: 'lesson-step' }, h('h3', {}, 'Step 2 · Write the memo'), h('p', {}, c.task), ta, h('div', { class: 'row', style: { marginTop: '10px' } }, btn, prev ? h('span', { class: 'chip good' }, `last: ${prev.overall}/10`) : null), out)));
}
function showMemo(out, g) {
  out.innerHTML = '';
  out.append(h('h2', {}, `${g.overall} / 10`), h('div', { class: 'feedback-rows' }, ...g.scores.map(s => h('div', {}, h('div', { class: 'row between' }, h('b', {}, s.area), h('span', { class: 'chip acc' }, `${s.score}/10`)), h('p', { class: 'small' }, s.why)))),
    h('div', { class: 'hint' }, h('b', {}, 'Biggest improvement'), g.improvement), h('div', { class: 'hint worked' }, h('b', {}, 'Stronger opening'), h('p', {}, g.betterOpening)));
  fx.stagger([...out.children]);
}

// ---------- annotation ----------
const LABELS = ['claim', 'evidence', 'number', 'assumption', 'opinion', 'context'];
function annotate(root, id) {
  if (id === 'new') return annotateNew(root);
  const a = ARTICLES.concat(S().customArticles || []).find(x => x.id === id); if (!a) return (location.hash = '#/finance');
  let cur = 'claim';
  const marks = a.sentences.map(() => null);
  const legend = h('div', { class: 'legend' }, ...LABELS.map(l => h('button', { class: `anno-s${l === cur ? ' on' : ''}`, 'data-l': l, onclick: e => { cur = l; [...legend.children].forEach(b => b.classList.toggle('on', b.dataset.l === l)); } }, l)));
  const text = h('div', { class: 'anno' }, ...a.sentences.map(([s], i) => {
    const sp = h('span', { class: 'anno-s', onclick: () => { marks[i] = marks[i] === cur ? null : cur; marks[i] ? sp.setAttribute('data-l', marks[i]) : sp.removeAttribute('data-l'); sp.classList.remove('wrongl', 'rightl'); fx.press(sp); } }, s + ' ');
    return sp;
  }));
  const result = h('div', { class: 'stack' });
  const check = () => {
    let right = 0;
    [...text.children].forEach((sp, i) => { const ok = marks[i] === a.sentences[i][1]; if (ok) right++; sp.classList.toggle('rightl', ok); sp.classList.toggle('wrongl', !ok); if (!ok) { sp.title = `Answer: ${a.sentences[i][1]}${a.sentences[i][2] ? ' - ' + a.sentences[i][2] : ''}`; } });
    result.innerHTML = '';
    result.append(h('p', {}, h('b', {}, `${right}/${a.sentences.length} labeled correctly. `), 'Tap any red-outlined sentence and hover/long-press to see the right label.'),
      h('ul', { class: 'small' }, ...a.sentences.map(([s, l, why], i) => marks[i] !== l ? h('li', {}, h('b', {}, l), ` - "${s.slice(0, 70)}${s.length > 70 ? '…' : ''}"${why ? ' · ' + why : ''}`) : null)),
      h('button', { class: 'btn primary', onclick: () => startRound({ kind: 'anno-q', meta: { back: `#/finance/annotate/${id}` }, title: a.t, questions: a.questions.map((q, k) => fromBank(q, `anno:${id}:${k}`)), area: 'finance', tags: ['finance', 'annotate'] }) }, 'Answer the comprehension questions'));
    recordActivity({ area: 'finance', ms: 4 * 60000, q: a.sentences.length, correct: right });
    fx.stagger([...result.children]);
  };
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/finance', class: 'muted small' }, '← Business & Finance'), h('h1', {}, a.t), h('div', { class: 'sub' }, 'Pick a label, then tap sentences. Separate what is claimed from what is shown.'))),
    h('div', { class: 'lesson-step' }, h('h3', {}, 'Labels'), legend, h('p', { class: 'small muted', style: { marginTop: '8px' } }, 'Claim = what someone asserts. Evidence = facts that support/contradict. Number = data point. Assumption = what must be true. Opinion = judgment. Context = background.')),
    h('div', { class: 'lesson-step' }, text, h('div', { class: 'row', style: { marginTop: '12px' } }, h('button', { class: 'btn primary', onclick: check }, 'Check my labels'))),
    a.terms ? h('div', { class: 'lesson-step' }, h('h3', {}, 'Key terms'), ...a.terms.map(t => h('p', {}, h('b', {}, t.term + ': '), t.def))) : null,
    result));
}
function annotateNew(root) {
  const ta = h('textarea', { class: 'input', rows: 10, placeholder: 'Paste a news article, earnings release excerpt, or business memo…' });
  const btn = h('button', { class: 'btn primary', disabled: !hasAI() }, hasAI() ? 'Build the challenge' : 'Add a Claude key in Settings first');
  btn.onclick = async () => {
    if (ta.value.trim().length < 200) return toast('Paste at least a paragraph.');
    btn.disabled = true; btn.textContent = 'Reading it…';
    try {
      const r = await annotateArticle(ta.value);
      const a = { id: 'x' + uid(), t: r.title, sentences: r.sentences.map(s => [s.s, s.label, s.why]), questions: r.questions.map(q => ({ q: q.q, c: [q.c[q.a], ...q.c.filter((_, i) => i !== q.a)], a: 0, e: q.e, h: [] })), terms: r.terms };
      (S().customArticles ||= []).unshift(a); save();
      location.hash = `#/finance/annotate/${a.id}`;
    } catch (e) { toast(aiErrorText(e), 'bad'); btn.disabled = false; btn.textContent = 'Build the challenge'; }
  };
  root.append(h('div', { class: 'lesson' }, h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/finance', class: 'muted small' }, '← Business & Finance'), h('h1', {}, 'Annotate your own'))),
    card('', h('div', { class: 'stack' }, ta, btn, h('p', { class: 'small muted' }, 'The text is sent to Claude to build sentence labels and questions.')))));
}

// ---------- DECA ----------
function deca(root, p) {
  if (p[0]) {
    const cl = DECA.clusters.find(x => x.id === p[0]); if (!cl) return (location.hash = '#/finance/deca');
    if (p[1] === 'read') return renderReading(root, { c: DECAC, u: cl, back: `#/finance/deca/${cl.id}`, area: 'deca', tags: ['deca', cl.id] });
    if (p[1] === 'lesson') { const l = cl.lessons[0]; return renderLesson(root, { lesson: l, key: lessonKey(DECAC, cl, l), back: `#/finance/deca/${cl.id}`, title: 'DECA', sub: cl.t, check: buildSet(unitPool(DECAC, cl, 'deca'), 3), area: 'deca', tags: ['deca', cl.id] }); }
    if (p[1] === 'roleplay') return roleplay(root, cl, cl.roleplays.find(r => r.id === p[2]));
    root.append(h('div', { class: 'disclaimer', style: { marginBottom: '12px' } }, DECA.note));
    renderUnit(root, { c: DECAC, u: cl, base: `#/finance/deca/${cl.id}`, back: '#/finance/deca', area: 'deca', label: 'DECA' });
    // lesson link base differs: renderUnit links to `${base}/lesson/l1`, matching p[1] === 'lesson'.
    root.append(card('Roleplays', h('div', { class: 'unit-list' }, ...cl.roleplays.map(r => {
      const last = (S().roleplays || []).find(x => x.rid === r.id);
      return h('a', { class: 'unit-row', href: `#/finance/deca/${cl.id}/roleplay/${r.id}` }, h('span', { class: 'unit-n' }, 'RP'), h('div', {}, h('div', { style: { fontWeight: 600 } }, r.event), h('div', { class: 'unit-meta' }, r.scenario.slice(0, 90) + '…')), last ? h('span', { class: 'chip good' }, `${last.total}/${last.max}`) : h('span', { class: 'muted' }, '›'));
    }))));
    return;
  }
  root.append(h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/finance', class: 'muted small' }, '← Business & Finance'), h('h1', {}, 'DECA'), h('div', { class: 'sub' }, 'Finance this year, Business Management & Administration next.'))),
    h('div', { class: 'disclaimer', style: { marginBottom: '12px' } }, DECA.note),
    h('div', { class: 'grid g2' }, ...DECA.clusters.map(cl => h('a', { class: 'tile', href: `#/finance/deca/${cl.id}` },
      h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic' }, cl.id === 'fin' ? '$' : 'M'), h('span', { class: 'chip acc' }, `${pct(unitReadiness(DECAC, cl))} ready`)),
      h('h4', {}, cl.t), h('div', { class: 'muted' }, cl.events.join(' · ')), h('div', { style: { marginTop: '10px' } }, bar(unitReadiness(DECAC, cl)))))));
}

function roleplay(root, cl, r) {
  if (!r) return (location.hash = `#/finance/deca/${cl.id}`);
  let left = 600, iv = null;
  const clock = h('div', { class: 'kpi-v num' }, '10:00');
  const tick = () => { left--; clock.textContent = `${Math.floor(Math.max(0, left) / 60)}:${String(Math.max(0, left) % 60).padStart(2, '0')}`; if (left <= 0) { clearInterval(iv); fx.sfx.level(); toast('Prep time is up - present now'); } if (!clock.isConnected) clearInterval(iv); };
  const notes = h('textarea', { class: 'input', rows: 6, placeholder: 'Prep notes: one line per PI…' }, r.pis.map(p => `• ${p}: `).join('\n'));
  const resp = h('textarea', { class: 'input', rows: 9, placeholder: 'Your response to the judge (type it, or tap Speak to dictate)…' });
  const out = h('div', { class: 'stack' });
  const judge = h('button', { class: 'btn primary', disabled: !hasAI() }, hasAI() ? 'Get judged' : 'Add a Claude key in Settings to be judged');
  judge.onclick = async () => {
    if (resp.value.trim().split(/\s+/).length < 60) return toast('Give a fuller answer (60+ words) - judges expect every PI covered.');
    judge.disabled = true; judge.textContent = 'Judge is scoring…';
    try {
      const g = await judgeRoleplay({ event: r.event, scenario: `${r.role}\n${r.scenario}`, pis: r.pis, response: resp.value });
      if (g.total / g.max > Math.max(0, ...(S().roleplays || []).map(x => x.total / x.max))) addRecord('score', `DECA roleplay (${r.event}): ${g.total}/${g.max}`, g.total / g.max);
      S().roleplays = [{ rid: r.id, total: g.total, max: g.max, ts: Date.now() }, ...(S().roleplays || [])].slice(0, 50); save();
      recordActivity({ area: 'deca', ms: 20 * 60000 });
      out.innerHTML = '';
      out.append(h('h2', {}, `${g.total} / ${g.max}`),
        h('div', { class: 'feedback-rows' }, ...g.pis.map(p => h('div', {}, h('div', { class: 'row between' }, h('b', {}, p.pi), h('span', { class: `chip ${p.score >= 12 ? 'good' : p.score >= 8 ? 'acc' : 'bad'}` }, `${p.score}/14`)), h('p', { class: 'small' }, p.why))),
          ...g.skills.map(s => h('div', {}, h('div', { class: 'row between' }, h('b', {}, s.skill), h('span', { class: 'chip' }, `${s.score}/6`)), h('p', { class: 'small' }, s.why)))),
        h('div', { class: 'hint worked' }, h('b', {}, 'A stronger line'), h('p', {}, g.strongerLine)),
        h('div', { class: 'hint' }, h('b', {}, 'Fixes'), h('ul', {}, ...g.fixes.map(f => h('li', {}, f)))));
      fx.stagger([...out.children]);
    } catch (e) { toast(aiErrorText(e), 'bad'); }
    judge.disabled = false; judge.textContent = 'Judge again';
  };
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: `#/finance/deca/${cl.id}`, class: 'muted small' }, `← ${cl.t}`), h('h1', {}, r.event), h('div', { class: 'sub' }, 'Roleplay · 10 min prep · up to 10 min presentation'))),
    h('div', { class: 'lesson-step' }, h('h3', {}, 'Your role'), h('p', {}, r.role), h('h3', {}, 'Situation'), h('p', {}, r.scenario),
      h('h3', {}, 'Performance indicators'), h('ol', {}, ...r.pis.map(p => h('li', {}, p)))),
    h('div', { class: 'lesson-step' }, h('div', { class: 'row between' }, h('h3', { style: { margin: 0 } }, 'Prep'), clock),
      h('div', { class: 'row', style: { margin: '8px 0' } }, h('button', { class: 'btn sm', onclick: () => { clearInterval(iv); left = 600; iv = setInterval(tick, 1000); } }, 'Start 10:00 prep')), notes),
    h('div', { class: 'lesson-step' }, h('h3', {}, 'Present'), resp, h('div', { class: 'row', style: { marginTop: '10px' } }, dictate(resp), judge), out)));
}

// ---------- portfolio lab ----------
const ASSETS = [
  { k: 'us', t: 'U.S. stocks', mu: 0.07, sd: 0.16 }, { k: 'intl', t: 'Intl stocks', mu: 0.065, sd: 0.18 },
  { k: 'bond', t: 'Bonds', mu: 0.035, sd: 0.06 }, { k: 'cash', t: 'Cash', mu: 0.02, sd: 0.01 },
];
function randn() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function simulate(w, years = 20, start = 10000, paths = 400) {
  const all = [];
  for (let p = 0; p < paths; p++) {
    let v = start; const series = [v];
    for (let y = 0; y < years; y++) {
      const mkt = randn(); // shared equity shock -> correlation between U.S. and intl
      const r = ASSETS.reduce((a, A) => {
        const z = A.k === 'us' || A.k === 'intl' ? 0.85 * mkt + 0.53 * randn() : randn();
        return a + w[A.k] * (A.mu + A.sd * z);
      }, 0);
      v *= 1 + r; series.push(v);
    }
    all.push(series);
  }
  const pctile = (arr, q) => { const s = [...arr].sort((a, b) => a - b); return s[Math.floor(q * (s.length - 1))]; };
  const bands = Array.from({ length: years + 1 }, (_, y) => ({ p10: pctile(all.map(s => s[y]), 0.1), p50: pctile(all.map(s => s[y]), 0.5), p90: pctile(all.map(s => s[y]), 0.9) }));
  const worstYear = Math.min(...all.flatMap(s => s.slice(1).map((v, i) => v / s[i] - 1)));
  return { bands, worstYear };
}
function lab(root, disc) {
  const w = S().labW ||= { us: 0.6, intl: 0.2, bond: 0.15, cash: 0.05 };
  const chartBox = h('div');
  const stats = h('div', { class: 'kpis' });
  const sliders = ASSETS.map(A => {
    const val = h('span', { class: 'num' }, pct(w[A.k]));
    const inp = h('input', { type: 'range', min: 0, max: 100, step: 5, value: Math.round(w[A.k] * 100), style: { width: '100%' } });
    inp.oninput = () => { w[A.k] = inp.value / 100; normalize(A.k); sliders.forEach(s => { s.inp.value = Math.round(w[s.k] * 100); s.val.textContent = pct(w[s.k]); }); draw(); };
    return { k: A.k, inp, val, el: h('div', { class: 'field' }, h('div', { class: 'row between' }, h('label', {}, A.t), val), inp) };
  });
  function normalize(changed) {
    const others = ASSETS.filter(A => A.k !== changed);
    const rest = 1 - w[changed]; const sum = others.reduce((a, A) => a + w[A.k], 0) || 1;
    others.forEach(A => { w[A.k] = Math.round((sum ? w[A.k] / sum : 1 / others.length) * rest * 100) / 100; });
    save();
  }
  let tmr;
  function draw() {
    clearTimeout(tmr);
    tmr = setTimeout(() => {
      const { bands, worstYear } = simulate(w);
      const max = bands[bands.length - 1].p90 * 1.05, W = 320, H = 160;
      const x = i => (i / (bands.length - 1)) * W, y = v => H - (v / max) * H;
      const area = `M${bands.map((b, i) => `${x(i)},${y(b.p90)}`).join(' L')} L${[...bands].reverse().map((b, i) => `${x(bands.length - 1 - i)},${y(b.p10)}`).join(' L')} Z`;
      chartBox.innerHTML = '';
      chartBox.append(svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'linechart', style: 'height:180px', preserveAspectRatio: 'none' },
        svg('path', { d: area, fill: 'var(--accent)', 'fill-opacity': 0.15 }),
        svg('path', { d: `M${bands.map((b, i) => `${x(i)},${y(b.p50)}`).join(' L')}`, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5 })));
      const f = bands[bands.length - 1];
      const money = v => '$' + Math.round(v).toLocaleString();
      stats.innerHTML = '';
      [['Median after 20 yrs', money(f.p50)], ['Bad case (10th pct)', money(f.p10)], ['Good case (90th pct)', money(f.p90)], ['Worst single year', pct(worstYear)]].forEach(([l, v]) => stats.append(h('div', { class: 'kpi' }, h('div', { class: 'kpi-l' }, l), h('div', { class: 'kpi-v' }, v))));
    }, 60);
  }
  root.append(h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/finance', class: 'muted small' }, '← Business & Finance'), h('h1', {}, 'Portfolio lab'), h('div', { class: 'sub' }, '$10,000 · 20 years · 400 simulated paths'))), disc,
    h('div', { class: 'grid g2' }, card('Allocation', h('div', { class: 'stack' }, ...sliders.map(s => s.el), h('p', { class: 'small muted' }, 'Assumed annual return / volatility: U.S. 7%/16%, Intl 6.5%/18%, Bonds 3.5%/6%, Cash 2%/1%. Illustrative only.'))),
      card('Range of outcomes', h('div', { class: 'stack' }, chartBox, h('p', { class: 'small muted' }, 'Line = median path. Band = 10th to 90th percentile. Notice how more stocks widens the band: higher expected value, more uncertainty.')))),
    h('div', { style: { marginTop: '12px' } }, stats),
    card('Try this', h('ul', {}, h('li', {}, 'Set 100% U.S. stocks, note the worst year. Then 60/40 stocks/bonds. How much median do you give up for a smaller worst year?'), h('li', {}, 'Split U.S. into U.S. + Intl. Why does the band barely narrow? (They\'re correlated.)'), h('li', {}, 'Write one takeaway in your Log.'))));
  draw();
}
