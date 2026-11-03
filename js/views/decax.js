// DECA: learn the Finance Cluster Exam by area, and practice the Financial Consulting Event.
import { S, save, recordActivity, addRecord } from '../store.js';
import { h, card, bar, pct, toast } from '../ui.js';
import { DECAX, FCEC, FCE_U, BLUEPRINT, RUBRIC, FCE } from '../data/decaexam.js';
import { renderUnit } from '../unitview.js';
import { renderLesson } from '../lesson.js';
import { renderReading, readDone } from './reading.js';
import { unitPool, buildSet } from '../pool.js';
import { startRound } from '../quiz.js';
import { unitReadiness, lessonKey } from '../data/courses.js';
import { hasAI, judgeConsult, aiErrorText } from '../ai.js';
import { dictate } from './speak.js';
import * as fx from '../fx.js';

const head = (back, backT, t, sub) => h('div', { class: 'page-head' }, h('div', {}, h('a', { href: back, class: 'muted small' }, `← ${backT}`), h('h1', {}, t), sub ? h('div', { class: 'sub' }, sub) : null));
const row = (href, n, t, d, right) => h('a', { class: 'unit-row', href }, h('span', { class: 'unit-n' }, n), h('div', {}, h('div', { style: { fontWeight: 600 } }, t), h('div', { class: 'unit-meta' }, d)), right || h('span', { class: 'muted' }, '›'));
export const examReadiness = () => DECAX.units.reduce((a, u) => a + u.w * unitReadiness(DECAX, u), 0) / DECAX.units.reduce((a, u) => a + u.w, 0);
export const fceReadiness = () => unitReadiness(FCEC, FCE_U);

// ---------- Finance Cluster Exam ----------
export function exam(root, p) {
  const u = p[0] && DECAX.units.find(x => x.id === p[0]);
  if (u) {
    const base = `#/finance/deca/exam/${u.id}`;
    if (p[1] === 'read') return renderReading(root, { c: DECAX, u, back: base, area: 'deca', tags: ['deca', u.id] });
    if (p[1] === 'lesson') { const l = u.lessons.find(x => x.id === p[2]) || u.lessons[0]; return renderLesson(root, { lesson: l, key: lessonKey(DECAX, u, l), back: base, title: 'Finance exam', sub: u.t, check: buildSet(unitPool(DECAX, u, 'decax'), 3), area: 'deca', tags: ['deca', u.id] }); }
    return renderUnit(root, { c: DECAX, u, base, back: '#/finance/deca/exam', area: 'deca', label: 'Finance exam' });
  }
  const total = DECAX.units.reduce((a, x) => a + unitPool(DECAX, x, 'decax').length, 0);
  const mock = n => {
    const qs = DECAX.units.flatMap(x => buildSet(unitPool(DECAX, x, 'decax'), Math.max(1, Math.round(n * x.w / 100))));
    startRound({ kind: 'unit-test', meta: { back: '#/finance/deca/exam' }, title: `Finance exam · mock (${qs.length})`, questions: qs.sort(() => Math.random() - 0.5), target: 36000, area: 'deca', tags: ['deca', 'exam'] });
  };
  const next = DECAX.units.find(x => !readDone(DECAX, x));
  const maxN = Math.max(...BLUEPRINT.map(b => b[1][2]));
  root.append(head('#/finance/deca', 'DECA', 'Finance exam', '100 multiple-choice questions. Learn the big areas first.'),
    next ? h('a', { class: 'card accent', href: `#/finance/deca/exam/${next.id}/read`, style: { display: 'block', textDecoration: 'none', marginBottom: '12px' } },
      h('div', { class: 'row between' }, h('h3', { style: { fontSize: '17px' } }, `Next up · ${next.t}`), h('span', { class: 'chip' }, '≈ 8 min read')),
      h('div', { class: 'small', style: { marginTop: '6px', opacity: .85 } }, 'Read & annotate, then a quick trick lesson, then practice.')) : null,
    card('Learn by area', h('div', { class: 'unit-list' }, ...DECAX.units.map((x, i) => {
      const r = unitReadiness(DECAX, x);
      return row(`#/finance/deca/exam/${x.id}`, readDone(DECAX, x) ? '✓' : i + 1, x.t, `≈ ${x.w}% of the exam`, h('span', { class: `chip ${r > 0.75 ? 'good' : ''}` }, pct(r)));
    }))),
    card('Mock exam', h('div', { class: 'stack' },
      h('p', { class: 'small muted' }, 'Questions are mixed in the same proportions as the real exam. The real test is about 36 seconds a question - Pace tracks your pace quietly.'),
      h('button', { class: 'btn primary wide', onclick: () => mock(25) }, 'Mini mock · 25 questions'),
      h('button', { class: 'btn wide', onclick: () => mock(100) }, `Full mock · ${total < 100 ? `all ${total} questions` : '100 questions'}`),
      h('p', { class: 'small muted' }, 'Want more? Open an area and tap "Generate 8 more with Claude".'))),
    card('What\'s on it (2026-27 blueprint)', h('div', { class: 'stack' },
      h('p', { class: 'small muted' }, 'Questions per area: District / Association / ICDC.'),
      ...BLUEPRINT.map(([t, n]) => h('div', {}, h('div', { class: 'row between small' }, h('span', {}, t), h('span', { class: 'muted num' }, n.join(' / '))), bar(n[2] / maxN))),
      h('p', { class: 'small muted' }, 'Source: DECA 2026-27 Finance exam blueprint and performance indicators.'))));
}

// ---------- Financial Consulting Event ----------
export function fce(root, p) {
  const base = '#/finance/deca/fce';
  if (p[0] === 'read') return renderReading(root, { c: FCEC, u: FCE_U, back: base, area: 'deca', tags: ['deca', 'fce'] });
  if (p[0] === 'lesson') { const l = FCE_U.lessons[0]; return renderLesson(root, { lesson: l, key: lessonKey(FCEC, FCE_U, l), back: base, title: 'Financial Consulting', sub: 'Financial Consulting', check: buildSet(unitPool(FCEC, FCE_U, 'decax'), 3), area: 'deca', tags: ['deca', 'fce'] }); }
  if (p[0] === 'plan') return plan(root, base);
  if (p[0] === 'qs') return judgeDrill(root, base);
  if (p[0] === 'client') return client(root, base, FCE.clients.find(c => c.id === p[1]));
  const st = S();
  const read = readDone(FCEC, FCE_U);
  const lessonDone = st.lessons[lessonKey(FCEC, FCE_U, FCE_U.lessons[0])]?.done;
  const planned = Object.values(st.fcePlan || {}).filter(v => (v || '').trim().length > 20).length;
  const runs = st.fceRuns || [];
  const best = runs.length ? Math.max(...runs.map(r => r.total)) : 0;
  const practice = () => startRound({ kind: 'unit-practice', meta: { back: base }, title: 'Financial Consulting · concepts', questions: buildSet(unitPool(FCEC, FCE_U, 'decax'), 8), area: 'deca', tags: ['deca', 'fce'] });
  const step = (done, n, t, d, href, onclick) => h(href ? 'a' : 'button', { class: `unit-row${done ? ' done' : ''}`, href, onclick, style: href ? null : { width: '100%', textAlign: 'left', background: 'none', border: 0, font: 'inherit', color: 'inherit', cursor: 'pointer' } },
    h('span', { class: 'unit-n' }, done ? '✓' : n), h('div', {}, h('div', { style: { fontWeight: 600 } }, t), h('div', { class: 'unit-meta' }, d)), h('span', { class: 'muted' }, '›'));
  root.append(head('#/finance/deca', 'DECA', 'Financial Consulting', '2026-27 · retirement & succession planning'),
    card('Your path', h('div', { class: 'unit-list' },
      step(read, 1, 'Read & annotate: exit options, value, retirement income', 'The finance you need to sound like a real consultant · ≈ 12 min', `${base}/read`),
      step(lessonDone, 2, 'The 5-part consult that matches the rubric', 'Worked example of a full 15 minutes', `${base}/lesson/l1`),
      step(false, 3, 'Concept check', '8 quick questions on succession and retirement', null, practice),
      step(planned >= 5, 4, 'Build your consultation', planned ? `${planned}/7 parts drafted` : 'Fill in each rubric part, saved as you type', `${base}/plan`),
      step(runs.length > 0, 5, 'Practice with a client', best ? `Best score ${best}/100` : '4 fictional clients · Claude judges with the real rubric', null, () => document.getElementById('client-list')?.scrollIntoView({ behavior: 'smooth' })),
      step(false, 6, 'Judge-questions drill', 'The questions judges ask in the last few minutes', `${base}/qs`))),
    card('This year\'s case', h('div', { class: 'stack' }, h('p', {}, FCE.scenario), h('details', {}, h('summary', { class: 'small muted' }, 'Event rules'), h('ul', { class: 'small' }, ...FCE.format.map(f => h('li', {}, f)))))),
    h('div', { id: 'client-list' }, card('Practice clients', h('div', { class: 'unit-list' }, ...FCE.clients.map(c => {
      const last = runs.find(r => r.cid === c.id);
      return row(`${base}/client/${c.id}`, c.name.split(' ')[0][0], c.name, c.biz, last ? h('span', { class: 'chip good' }, `${last.total}/100`) : null);
    })))),
    card('How you\'re scored (100 points)', h('div', { class: 'feedback-rows' }, ...RUBRIC.map(r => h('div', {},
      h('div', { class: 'row between' }, h('b', {}, `${r.n}. ${r.t}`), h('span', { class: 'chip' }, `${r.max}`)),
      h('p', { class: 'small' }, r.d), h('p', { class: 'small muted' }, '→ ', r.do))))));
}

const PLAN = [
  ['firm', 'The firm you represent', 'Research a real financial firm and the real services you\'ll recommend (planning, valuation partners, retirement accounts).'],
  ['open', '1 · Opening (15)', 'Your greeting, credibility line and agenda.'],
  ['needs', '2 · Assessing needs (15)', 'The 3-4 questions you\'ll ask, and how you\'ll summarize their answers.'],
  ['value', '3 · Positioning value (15)', 'For each option (outside sale, family, MBO/ESOP, wind down): feature → benefit → value to this client.'],
  ['rec', '4 · Recommendation (15)', 'Your one recommended path with numbers and a timeline, plus the objection you\'ll handle.'],
  ['close', '5 · Closing & follow-up (15)', 'Your summary, the commitment you ask for, and a dated next step.'],
  ['visuals', 'Visuals (design · 5)', 'What you\'ll hand-carry: e.g., options table, timeline, retirement income chart, a leave-behind.'],
];
function plan(root, base) {
  const pl = (S().fcePlan ||= {});
  let t;
  root.append(head(base, 'Financial Consulting', 'Build your consultation', 'Saved as you type. Write it in your own words - bullet points are fine.'),
    ...PLAN.map(([k, t0, d]) => {
      const ta = h('textarea', { class: 'input', rows: k === 'value' || k === 'rec' ? 6 : 4, placeholder: d }, pl[k] || '');
      ta.oninput = () => { pl[k] = ta.value; clearTimeout(t); t = setTimeout(save, 400); };
      const tip = RUBRIC.find(r => t0.startsWith(String(r.n) + ' '));
      return card(t0, h('div', { class: 'stack' }, tip ? h('p', { class: 'small muted' }, tip.do) : null, ta));
    }),
    h('a', { class: 'btn primary wide', href: base }, 'Done - practice it with a client →'));
}

function client(root, base, c) {
  if (!c) return (location.hash = base);
  let left = 900, iv = null;
  const clock = h('span', { class: 'chip' }, 'untimed');
  const tick = () => { left--; clock.textContent = `${Math.floor(Math.max(0, left) / 60)}:${String(Math.max(0, left) % 60).padStart(2, '0')} left`; if (left === 180) toast('3 minutes left - start wrapping up for judge questions'); if (left <= 0) { clearInterval(iv); clock.textContent = 'time'; } if (!clock.isConnected) clearInterval(iv); };
  const resp = h('textarea', { class: 'input', rows: 12, placeholder: 'Your consultation, start to finish. Type it, or tap Speak and present out loud…' });
  const pl = S().fcePlan || {};
  const fromPlan = Object.keys(pl).some(k => (pl[k] || '').trim());
  const out = h('div', { class: 'stack' });
  const judge = h('button', { class: 'btn primary', disabled: !hasAI() }, hasAI() ? 'Get judged' : 'Add a Claude key in Settings to be judged');
  judge.onclick = async () => {
    if (resp.value.trim().split(/\s+/).length < 120) return toast('Give the full consultation (120+ words) so every rubric part can be scored.');
    judge.disabled = true; judge.textContent = 'Judge is scoring…';
    try {
      const g = await judgeConsult({ scenario: FCE.scenario, client: `${c.name}, ${c.biz}. ${c.facts.join('; ')}. Concern: ${c.twist}`, rubric: RUBRIC, response: resp.value });
      const total = Math.min(100, g.items.reduce((a, it) => a + Math.max(0, Math.min(RUBRIC.find(r => r.n === it.n)?.max || 0, it.score)), 0));
      const runs = (S().fceRuns ||= []);
      if (total > Math.max(0, ...runs.map(r => r.total))) addRecord('score', `DECA Financial Consulting: ${total}/100`, total / 100);
      runs.unshift({ cid: c.id, total, ts: Date.now() }); S().fceRuns = runs.slice(0, 50); save();
      recordActivity({ area: 'deca', ms: 20 * 60000 });
      out.innerHTML = '';
      out.append(h('h2', {}, `${total} / 100`),
        h('div', { class: 'feedback-rows' }, ...g.items.map(it => { const r = RUBRIC.find(x => x.n === it.n); if (!r) return null; const f = it.score / r.max; return h('div', {}, h('div', { class: 'row between' }, h('b', {}, `${r.n}. ${r.t}`), h('span', { class: `chip ${f >= 0.73 ? 'good' : f >= 0.4 ? 'acc' : ''}` }, `${it.score}/${r.max}`)), h('p', { class: 'small' }, it.why)); })),
        g.accuracy.length ? h('div', { class: 'hint' }, h('b', {}, 'Finance check'), h('ul', {}, ...g.accuracy.map(a => h('li', {}, a)))) : null,
        h('div', { class: 'hint worked' }, h('b', {}, 'A stronger line'), h('p', {}, g.strongerLine)),
        h('div', { class: 'hint' }, h('b', {}, 'Top fixes'), h('ul', {}, ...g.fixes.map(f => h('li', {}, f)))),
        h('div', { class: 'hint' }, h('b', {}, 'The judge would now ask…'), h('ul', {}, ...g.judgeQs.map(q => h('li', {}, q))), h('p', { class: 'small muted' }, 'Answer them out loud - or practice in the Judge-questions drill.')));
      fx.stagger([...out.children].filter(Boolean));
    } catch (e) { toast(aiErrorText(e), 'bad'); }
    judge.disabled = false; judge.textContent = 'Judge again';
  };
  root.append(h('div', { class: 'lesson' }, head(base, 'Financial Consulting', c.name, c.biz),
    h('div', { class: 'lesson-step' }, h('h3', {}, 'Your client'), h('ul', {}, ...c.facts.map(f => h('li', {}, f))), h('p', {}, h('b', {}, 'On their mind: '), c.twist),
      h('p', { class: 'small muted' }, 'Fictional client. You play the consultant from the firm you chose in your plan.')),
    h('div', { class: 'lesson-step' }, h('div', { class: 'row between' }, h('h3', { style: { margin: 0 } }, 'Present'), clock),
      h('p', { class: 'small muted' }, 'Hit all five content parts in order. Aim for 11-12 minutes so there\'s time for questions.'),
      h('div', { class: 'row', style: { margin: '8px 0', flexWrap: 'wrap', gap: '8px' } },
        h('button', { class: 'btn sm', onclick: () => { clearInterval(iv); left = 900; tick(); iv = setInterval(tick, 1000); } }, 'Start 15:00 (optional)'),
        fromPlan ? h('button', { class: 'btn sm ghost', onclick: () => { resp.value = PLAN.filter(([k]) => k !== 'firm' && k !== 'visuals' && (pl[k] || '').trim()).map(([k]) => pl[k].trim()).join('\n\n'); toast('Your plan is in - now adapt it to this client'); } }, 'Start from my plan') : null),
      resp, h('div', { class: 'row', style: { marginTop: '10px' } }, dictate(resp), judge), out)));
}

function judgeDrill(root, base) {
  const qs = [...FCE.judgeQs].sort(() => Math.random() - 0.5);
  let i = 0;
  const box = h('div');
  const show = () => {
    box.innerHTML = '';
    if (i >= qs.length) { recordActivity({ area: 'deca', ms: qs.length * 60000 }); box.append(card('Done', h('div', { class: 'stack' }, h('p', {}, 'Nice - those are the questions judges ask most. Run it again anytime; they come in a new order.'), h('a', { class: 'btn primary', href: base }, 'Back to Financial Consulting')))); return; }
    const [q, a] = qs[i];
    const ta = h('textarea', { class: 'input', rows: 4, placeholder: 'Answer like you would to the judge (or tap Speak)…' });
    const ans = h('div', { class: 'hint worked', style: { display: 'none' } }, h('b', {}, 'A strong answer covers'), h('p', {}, a));
    const reveal = h('button', { class: 'btn primary' }, 'Show a strong answer');
    reveal.onclick = () => { ans.style.display = ''; fx.pop(ans); reveal.remove(); nextB.style.display = ''; };
    const nextB = h('button', { class: 'btn primary', style: { display: 'none' }, onclick: () => { i++; show(); } }, i + 1 < qs.length ? 'Next question →' : 'Finish');
    box.append(h('div', { class: 'lesson-step' }, h('div', { class: 'small muted' }, `Question ${i + 1} of ${qs.length}`), h('h3', {}, `"${q}"`), ta,
      h('div', { class: 'row', style: { marginTop: '10px', gap: '8px' } }, dictate(ta), reveal, nextB), ans));
    fx.stagger([box.firstChild]);
  };
  root.append(h('div', { class: 'lesson' }, head(base, 'Financial Consulting', 'Judge-questions drill', 'Answer first, then compare. No scoring - just reps.'), box));
  show();
}
