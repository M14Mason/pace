// Placement test: 2 adaptive questions per math skill set the starting level,
// then a short course check seeds readiness and shapes the plan.
import { S, save, recordActivity } from '../store.js';
import { h, card, fmtMs, pct, shuffle, md } from '../ui.js';
import { SKILLS, SKILL, makeQ, check, fmtAns } from '../math/skills.js';
import { keypad, choices, unbindKeys, fromBank } from '../quiz.js';
import { COURSE } from '../data/courses.js';
import { sk } from './sprint.js';
import * as fx from '../fx.js';

export function render(root) {
  // One question per core skill; the rest are derived (totals≈addition, mental≈multiplication, tax≈discounts, finance≈percent).
  const order = ['add', 'sub', 'mul', 'div', 'pct', 'tip', 'disc', 'frac', 'ratio'];
  const DERIVED = { total: 'add', mental: 'mul', tax: 'disc', fin: 'pct' };
  const results = {};
  let si = 0, step = 0, firstOk = false, t0 = 0, cur = null;
  const courseQs = [
    ['apwh', 0, 0], ['chem', 1, 0], ['span2', 2, 0], ['abm', 1, 0],
  ].map(([cid, ui, qi]) => ({ cid, q: fromBank(COURSE[cid].units[ui].qs[qi], null) }));
  const course = {};
  let ci = 0;

  const intro = () => {
    root.innerHTML = '';
    root.append(h('div', { class: 'lesson' },
      h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Placement'), h('div', { class: 'sub' }, 'About 3 minutes. No hints, no pressure - this just finds your starting point.'))),
      card('', h('div', { class: 'stack' },
        h('p', {}, h('b', {}, 'Part 1 · Mental math (9 questions). '), 'One per skill, about 2 minutes. Use the keypad or your keyboard. Don\'t use a calculator - the point is to find where to start.'),
        h('p', {}, h('b', {}, 'Part 2 · Course check (4 questions). '), 'A quick read on AP World, Chemistry, Spanish and management.'),
        h('p', { class: 'small muted' }, 'Guess if you have no idea. "I don\'t know" is fine too - type 0.'),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: next }, 'Start'), h('button', { class: 'btn ghost', onclick: skip }, 'Skip for now'))))));
  };
  const skip = () => { S().profile.placementDone = true; save(); location.hash = '#/'; };

  function next() {
    if (si >= order.length) return coursePart();
    const id = order[si];
    const L = 3;
    cur = makeQ(id, L, 'free');
    t0 = performance.now();
    root.innerHTML = '';
    const qc = h('div', { class: 'qcard' }, h('div', { class: 'q-count' }, `Math ${si + 1} / ${order.length} · ${SKILL[id].name}`), h('div', { class: 'q-prompt', html: md(cur.q) }));
    root.append(h('div', { class: 'round' }, h('div', { class: 'round-dots' }, ...order.map((_, k) => h('i', { class: k < si ? 'ok' : k === si ? 'cur' : '' }))), h('div', { class: 'round-stage' }, qc,
      keypad(cur, v => {
        const ok = check(cur, v), ms = performance.now() - t0;
        const fast = ms <= SKILL[id].targets[L - 1] * 1.4;
        ok ? fx.correct(qc) : fx.wrong(qc);
        results[id] = ok ? (fast ? 4 : 3) : 1;
        si++;
        setTimeout(next, 250);
      }))));
    fx.pop(qc);
  }

  function coursePart() {
    if (ci >= courseQs.length) return finish();
    const { cid, q } = courseQs[ci];
    root.innerHTML = '';
    const qc = h('div', { class: 'qcard text' }, h('div', { class: 'q-count' }, `Course check ${ci + 1} / ${courseQs.length} · ${COURSE[cid].short}`), h('div', { class: 'q-prompt', html: md(q.q) }));
    root.append(h('div', { class: 'round' }, h('div', { class: 'round-stage' }, qc,
      choices(q, v => { const ok = v === q.a; ok ? fx.correct(qc) : fx.wrong(qc); (course[cid] ||= []).push(ok); ci++; setTimeout(coursePart, 250); }))));
  }

  function finish() {
    unbindKeys();
    for (const [d, from] of Object.entries(DERIVED)) results[d] = Math.max(1, (results[from] || 1) - 1);
    for (const [id, L] of Object.entries(results)) sk(id).level = L;
    for (const [cid, arr] of Object.entries(course)) S().courseSelf[cid] = arr.filter(Boolean).length / arr.length;
    S().profile.placementDone = true;
    recordActivity({ area: 'math', ms: 3 * 60000 });
    save();
    const weak = Object.entries(results).sort((a, b) => a[1] - b[1]).slice(0, 3);
    root.innerHTML = '';
    root.append(h('div', { class: 'lesson' },
      h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Your starting point'), h('div', { class: 'sub' }, 'Levels are set. Your plan now weights your weakest skills.'))),
      card('Math levels', h('div', { class: 'score-grid' }, ...Object.keys(results).map(id => h('div', { class: 'score-cell' }, h('div', { class: 'v' }, `L${results[id]}`), h('div', { class: 'l' }, SKILL[id].name))))),
      card('Focus first', h('ul', {}, ...weak.map(([id, L]) => h('li', {}, h('b', {}, SKILL[id].name), ` - Level ${L}. Start with "Learn the why", then sprint.`)))),
      card('Courses', h('div', { class: 'stack' }, ...Object.entries(course).map(([cid, arr]) => h('div', { class: 'row between' }, h('span', {}, COURSE[cid].name), h('span', { class: 'chip' }, `${arr.filter(Boolean).length}/${arr.length}`))))),
      h('a', { class: 'btn primary wide', href: '#/' }, 'Go to Dashboard')));
    fx.levelUp('Placement complete', 'Your plan is ready');
  }

  intro();
  return () => unbindKeys();
}
