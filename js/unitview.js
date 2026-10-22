// Shared unit page (used by Prep courses, Business & Finance units, DECA clusters).
import { S, save } from './store.js';
import { h, card, bar, pct, md, toast, fmtMs } from './ui.js';
import { startRound, onRoundFinish, relevantTips } from './quiz.js';
import { unitPool, buildSet, addAIQuestions } from './pool.js';
import { hasAI, genQuestions, gradeFRQ, aiErrorText } from './ai.js';
import { unitReadiness, lessonKey } from './data/courses.js';
import * as fx from './fx.js';

['unit-practice', 'unit-test', 'course-mixed', 'review'].forEach(k => onRoundFinish(k, res => {
  location.hash = res.meta.back || '#/';
  setTimeout(() => toast(`${Math.round(res.acc * 100)}% first try · ${res.misses.length ? 'misses scheduled for review' : 'clean'}`, res.acc >= 0.8 ? 'good' : ''), 400);
}));

export function renderUnit(root, { c, u, base, back, area, req, label }) {
  const pool = unitPool(c, u, c.src);
  const tags = [c.id, u.id];
  const tips = relevantTips(tags);
  const r = unitReadiness(c, u);
  const aiCount = (S().aiBank[`${c.id}/${u.id}`] || []).length;
  const fixedCount = (u.qs || []).length + aiCount;
  const run = (kind, n, target) => {
    const qs = buildSet(pool, n);
    if (!qs.length) return toast('No questions yet - generate some with Claude below.');
    startRound({ kind, meta: { back: location.hash }, title: `${label || c.short} · ${u.t}`, questions: qs, target, area, req, tags });
  };
  const genBtn = h('button', { class: 'btn', disabled: !hasAI() }, hasAI() ? '✦ Generate 8 more with Claude' : '✦ Add a Claude key in Settings to generate more');
  genBtn.onclick = async () => {
    genBtn.disabled = true; genBtn.textContent = 'Writing questions…';
    try {
      const res = await genQuestions({ course: c.name, unit: u.t, topics: u.topics || '', n: 8, level: c.ap ? 'AP exam' : c.src === 'deca' ? 'DECA cluster exam' : 'high-school honors / internship-ready' });
      const n = addAIQuestions(c.id, u.id, res.questions || []);
      toast(`Added ${n} questions`, 'good');
      root.innerHTML = ''; renderUnit(root, { c, u, base, back, area, req, label });
    } catch (e) { toast(aiErrorText(e), 'bad'); genBtn.disabled = false; genBtn.textContent = '✦ Generate 8 more with Claude'; }
  };
  const frqs = [...(u.frq || []), ...((c.frqTemplates || []).filter(() => u === c.units[0]))];
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: back, class: 'muted small' }, '← Back'), h('h1', {}, u.t), h('div', { class: 'sub' }, u.topics || ''))),
    h('div', { class: 'grid g2' },
      card('Unit readiness', h('div', { class: 'stack' }, h('div', { class: 'kpi-v' }, pct(r)), bar(r, { cls: r > 0.75 ? 'good' : '' }), h('div', { class: 'small muted' }, `${(u.lessons || []).length} lesson(s) · ${fixedCount} bank questions${u.gen ? ' + endless generated practice' : ''}`))),
      card('Practice', h('div', { class: 'stack' },
        h('button', { class: 'btn primary wide', onclick: () => run('unit-practice', 8, 0) }, 'Practice · 8 questions'),
        h('button', { class: 'btn wide', onclick: () => run('unit-test', Math.min(15, Math.max(8, fixedCount + (u.gen ? 6 : 0))), c.ap ? 60000 : 50000) }, `Timed unit test · ${c.ap ? '60s' : '50s'}/question pace`),
        genBtn))),
    card('Lessons', h('div', { class: 'unit-list' }, ...(u.lessons || []).map((l, i) => {
      const k = lessonKey(c, u, l); const d = S().lessons[k];
      return h('a', { class: `unit-row${d?.done ? ' done' : ''}`, href: `${base}/lesson/${l.id}` }, h('span', { class: 'unit-n' }, d?.done ? '✓' : i + 1), h('div', {}, h('div', { style: { fontWeight: 600 } }, l.t), h('div', { class: 'unit-meta' }, 'why → worked example → key points → check')), h('span', { class: 'muted' }, '›'));
    }))),
    tips.length ? card('From your Log', h('div', { class: 'stack' }, ...tips.map(t => h('p', {}, t.text)))) : null,
    ...frqs.map(f => frqCard(c, f, area, req)));
}

export function frqCard(c, f, area, req) {
  const ta = h('textarea', { class: 'input', placeholder: 'Write your response here. Timed? Start the timer first.', rows: 8 });
  const out = h('div', { class: 'stack' });
  let t0 = 0, timerEl = h('span', { class: 'chip' }, 'untimed'), iv;
  const timerBtn = h('button', { class: 'btn sm ghost', onclick: () => { t0 = Date.now(); clearInterval(iv); iv = setInterval(() => { if (!timerEl.isConnected) return clearInterval(iv); timerEl.textContent = fmtMs(Date.now() - t0); }, 1000); } }, 'Start timer');
  const btn = h('button', { class: 'btn primary', disabled: !hasAI() }, hasAI() ? 'Grade with Claude' : 'Add a Claude key in Settings to get graded');
  btn.onclick = async () => {
    if (ta.value.trim().length < 40) return toast('Write a bit more first.');
    btn.disabled = true; btn.textContent = 'Grading…';
    try {
      const g = await gradeFRQ({ course: c.name, kind: f.kind, prompt: f.prompt, rubric: f.rubric, response: ta.value });
      clearInterval(iv);
      out.innerHTML = '';
      out.append(h('div', { class: 'row between' }, h('h2', {}, `${g.earned} / ${g.max}`), h('span', { class: 'chip acc' }, f.kind)),
        h('div', { class: 'feedback-rows' }, ...g.rows.map(r => h('div', {}, h('div', { class: 'row' }, h('span', { class: `chip ${r.earned ? 'good' : 'bad'}` }, r.earned ? '✓' : '✗'), h('b', {}, r.criterion)), h('p', { class: 'small' }, r.why), r.quote ? h('div', { class: 'q-quote small' }, r.quote) : null))),
        h('div', { class: 'hint' }, h('b', {}, 'Top fix'), g.topFix), h('div', { class: 'hint worked' }, h('b', {}, 'Stronger version'), h('p', {}, g.rewrite)), h('p', { class: 'small muted' }, g.encouragement));
      fx.stagger([...out.children]);
      const prevBest = Math.max(0, ...(S().frqLog || []).filter(x => x.course === c.id && x.kind === f.kind).map(x => x.earned / x.max));
      if (g.earned / g.max > prevBest) import('./store.js').then(m => m.addRecord('score', `${c.short} ${f.kind}: ${g.earned}/${g.max}`, g.earned / g.max));
      S().frqLog = [{ course: c.id, kind: f.kind, earned: g.earned, max: g.max, ts: Date.now() }, ...(S().frqLog || [])].slice(0, 100);
      import('./store.js').then(m => m.recordActivity({ area, ms: t0 ? Date.now() - t0 : 15 * 60000, q: 0, correct: 0, req }));
      save();
    } catch (e) { toast(aiErrorText(e), 'bad'); }
    btn.disabled = false; btn.textContent = 'Grade again';
  };
  return card(`${f.kind} practice`, h('div', { class: 'stack' }, h('p', { html: md(f.prompt) }), h('details', {}, h('summary', { class: 'small muted' }, 'Rubric'), h('p', { class: 'small', html: md(f.rubric) })), h('div', { class: 'row' }, timerBtn, timerEl), ta, btn, out));
}
