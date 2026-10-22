// Factoring practice: pick a pattern (or mixed), see the method, run 10.
import { S, save } from '../store.js';
import { h, card, seg, md, pct, fmtMs, toast } from '../ui.js';
import { TYPES, TYPE, factorQ } from '../math/factor.js';
import { startRound, onRoundFinish } from '../quiz.js';
import * as fx from '../fx.js';

onRoundFinish('factor', res => {
  const best = (S().factorBest ||= {});
  const k = res.meta.type, b = best[k];
  if (!b || res.acc > b.acc || (res.acc === b.acc && res.med < b.med)) { best[k] = { acc: res.acc, med: res.med, ts: Date.now() }; if (b) setTimeout(() => toast('New factoring best', 'good'), 500); }
  save(); location.hash = '#/learn/factor';
});

export function render(root) {
  let type = S().factorType || 'mixed';
  const box = h('div', { class: 'stack' });
  const draw = () => {
    box.innerHTML = '';
    const t = type === 'mixed' ? null : TYPE[type];
    const b = (S().factorBest || {})[type];
    const ex = factorQ(type);
    const steps = ex.steps.map((x, i) => h('div', { class: `worked-step${i ? ' hidden-step' : ''}` }, h('span', { class: 'ws-n' }, i + 1), h('div', { html: md(x) })));
    let shown = 1;
    box.append(
      h('p', { class: 'small', html: md(t ? t.lesson : 'A mix of every pattern - you have to recognize which one it is. Order to check: GCF → two terms (difference of squares) → three terms (pair numbers or AC).') }),
      h('details', {}, h('summary', { class: 'small muted' }, 'Worked example'),
        h('div', { style: { marginTop: '8px' } }, h('div', { html: md(ex.q) }), ...steps,
          h('button', { class: 'btn sm', style: { marginTop: '6px' }, onclick: e => { if (shown < steps.length) { steps[shown].classList.remove('hidden-step'); fx.pop(steps[shown]); shown++; } if (shown >= steps.length) e.currentTarget.remove(); } }, 'Next step'))),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: () => startRound({ kind: 'factor', meta: { type }, title: `Factoring · ${t ? t.name : 'Mixed'}`, questions: Array.from({ length: 10 }, () => factorQ(type)), area: 'math', req: 'math', tags: ['factor', 'math3'] }) }, 'Practice 10'),
        b ? h('span', { class: 'chip good' }, `best ${pct(b.acc)} · ${fmtMs(b.med)}`) : null));
  };
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/learn', class: 'muted small' }, '← Learn'), h('h1', {}, 'Factoring'), h('div', { class: 'sub' }, 'Misses come back with the pattern hint, then the steps.'))),
    card('', h('div', { class: 'stack' },
      seg([{ label: 'Mixed', value: 'mixed' }, ...TYPES.map(t => ({ label: t.name, value: t.id }))], type, v => { type = S().factorType = v; save(); draw(); }),
      box))));
  draw();
}
