// Learn: the "understand first, then speed" hub - spaced review, interleaving,
// math concept lessons with faded worked examples, and mistake reflection.
import { S, save, uid, dueItems } from '../store.js';
import { h, card, toast, modal, md, fmtMs } from '../ui.js';
import { SKILLS, SKILL, GROUPS, makeQ, fmtAns, check } from '../math/skills.js';
import { startRound, onRoundFinish, keypad, unbindKeys } from '../quiz.js';
import { reviewRound } from './dashboard.js';
import { sk } from './sprint.js';
import { byPriority } from '../data/courses.js';
import { unitPool, buildSet } from '../pool.js';
import * as fx from '../fx.js';
import * as cards from './cards.js';
import * as homework from './homework.js';
import * as factoring from './factoring.js';

onRoundFinish('learn-math', res => { location.hash = '#/learn'; setTimeout(() => toast(res.acc >= 0.8 ? 'Understanding is solid - now build speed in Sprint.' : 'Missed ones are scheduled for review.', res.acc >= 0.8 ? 'good' : ''), 400); });
onRoundFinish('interleave', res => { location.hash = '#/learn'; setTimeout(() => toast(`${Math.round(res.acc * 100)}% across mixed topics`), 400); });

export function render(root, p) {
  if (p[0] === 'math' && SKILL[p[1]]) return mathConcept(root, SKILL[p[1]]);
  if (p[0] === 'cards') return cards.render(root, p.slice(1));
  if (p[0] === 'help') return homework.render(root);
  if (p[0] === 'factor') return factoring.render(root);
  const due = dueItems(k => !k.startsWith('card:'));
  const misses = (S().missLog || []).slice(0, 8);
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Learn'), h('div', { class: 'sub' }, 'Understand it first. Speed comes after.'))),
    h('div', { class: 'grid g2', style: { marginBottom: '12px' } },
      h('a', { class: 'tile', href: '#/learn/help' }, h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic' }, '?'), h('span', { class: 'chip acc' }, 'photo or text')), h('h4', {}, 'Homework helper'), h('div', { class: 'muted' }, 'Stuck? Hints step by step, then 3 similar problems.')),
      h('a', { class: 'tile', href: '#/learn/cards' }, h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic' }, '▤'), h('span', { class: 'chip gold' }, `${cards.dueCards().length} due`)), h('h4', {}, 'Flashcards'), h('div', { class: 'muted' }, 'From photos, notes, Quizlet, and anything you miss twice.'))),
    h('div', { class: 'grid g2' },
      card('Spaced review', h('div', { class: 'stack' },
        h('div', { class: 'kpi-v' }, due.length, h('span', { class: 'small muted' }, ' items due')),
        h('p', { class: 'small muted' }, 'Anything you missed or needed hints on comes back tomorrow, then in 2, 5, 12+ days as you get it right.'),
        h('button', { class: 'btn primary', disabled: !due.length, onclick: () => reviewRound(due) }, due.length ? `Review ${Math.min(10, due.length)}` : 'All caught up'))),
      card('Interleaved practice', h('div', { class: 'stack' },
        h('p', { class: 'small muted' }, 'Mixed topics in one set. Harder than blocked practice - and that\'s why it sticks: you have to pick the method, not just run it.'),
        h('button', { class: 'btn', onclick: interleave }, 'Mixed set · 10')))),
    card('How Pace teaches you', h('ol', { class: 'small' },
      h('li', {}, h('b', {}, 'Why first: '), 'every lesson opens with the idea behind the rule.'),
      h('li', {}, h('b', {}, 'Worked example, step by step: '), 'predict each step before revealing it.'),
      h('li', {}, h('b', {}, 'Hints before answers: '), 'misses come back with a memory cue, then a strategy, then where you are in the problem.'),
      h('li', {}, h('b', {}, 'Guidance fades: '), 'faded examples, then checks with no hints up front.'),
      h('li', {}, h('b', {}, 'Then speed: '), 'Sprint levels only open with 90% accuracy AND the speed target.'),
      h('li', {}, h('b', {}, 'Spaced + interleaved review, plus reflection '), 'on your own mistakes.'))),
    card('Math: learn the why', h('div', { class: 'stack' }, ...GROUPS.map(g => h('div', {}, h('div', { class: 'small muted', style: { margin: '4px 0 6px', fontWeight: 600 } }, g),
      h('div', { class: 'pill-row' }, ...SKILLS.filter(s => s.group === g).map(s => h('a', { class: 'btn sm', href: `#/learn/math/${s.id}` }, `${s.icon} ${s.name}`))))),
      h('div', {}, h('div', { class: 'small muted', style: { margin: '4px 0 6px', fontWeight: 600 } }, 'Algebra'), h('a', { class: 'btn sm', href: '#/learn/factor' }, '(x+a)(x+b) Factoring')))),
    card('Reflect on recent mistakes', misses.length ? h('div', { class: 'feedback-rows' }, ...misses.map(m => h('div', {},
      h('div', { class: 'row between' }, h('span', { html: md(m.q.length > 120 ? m.q.slice(0, 120) + '…' : m.q) }), h('button', { class: 'btn sm ghost', onclick: () => reflect(m) }, 'Reflect')),
      h('div', { class: 'small muted' }, `you: ${m.given} · answer: ${m.a}${m.hints > 1 ? ` · needed ${m.hints} hints` : ''}`)))) : h('p', { class: 'empty' }, 'No misses yet. They\'ll show up here after rounds.')));
}

function interleave() {
  const qs = [];
  for (let i = 0; i < 4; i++) { const s = SKILLS[Math.floor(Math.random() * SKILLS.length)]; qs.push(makeQ(s.id, sk(s.id).level, 'free')); }
  const cs = byPriority().slice(0, 4);
  cs.forEach(c => { const u = c.units[Math.floor(Math.random() * Math.min(3, c.units.length))]; qs.push(...buildSet(unitPool(c, u), c.ap ? 2 : 1)); });
  startRound({ kind: 'interleave', title: 'Interleaved set', questions: qs.sort(() => Math.random() - 0.5).slice(0, 10), area: 'review', req: null, tags: ['review'] });
}

function reflect(m) {
  let cause = '';
  const ta = h('textarea', { class: 'input', rows: 3, placeholder: 'Next time I will…' });
  const close = modal(h('div', { class: 'stack' }, h('h2', {}, 'What happened?'), h('div', { class: 'q-quote', html: md(m.q) }),
    h('div', { class: 'pill-row' }, ...[['concept', 'Didn\'t know the concept'], ['careless', 'Careless slip'], ['slow', 'Ran out of time / rushed'], ['misread', 'Misread the question']].map(([k, l]) => h('button', { class: 'btn sm', onclick: e => { cause = k; e.currentTarget.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('primary')); e.currentTarget.classList.add('primary'); } }, l))),
    ta, h('button', { class: 'btn primary', onclick: () => {
      if (!cause || !ta.value.trim()) return toast('Pick a cause and write one line.');
      S().log.unshift({ id: uid(), type: 'mistake', text: `${ta.value.trim()} (${cause}: ${m.q.replace(/\*\*/g, '').slice(0, 80)} → ${m.a})`, tags: m.tags || [], ts: Date.now() });
      save(); close(); toast('Saved - Pace will show this next time you practice it', 'good');
    } }, 'Save reflection')));
}

function mathConcept(root, s) {
  const L = Math.max(1, sk(s.id).level);
  const ex = makeQ(s.id, L, 'free');
  const steps = ex.steps.map((x, i) => h('div', { class: `worked-step${i ? ' hidden-step' : ''}` }, h('span', { class: 'ws-n' }, i + 1), h('div', {}, x)));
  let shown = 1;
  const next = h('button', { class: 'btn sm primary', onclick: () => { if (shown < steps.length) { steps[shown].classList.remove('hidden-step'); fx.pop(steps[shown]); shown++; } else { next.textContent = `Answer: ${fmtAns(ex)}`; next.disabled = true; } } }, 'Next step');
  // Faded example: first step given, student finishes it.
  const fq = makeQ(s.id, L, 'free');
  const fadedBox = h('div', { class: 'stack' });
  const fadedResult = h('div');
  let tries = 0;
  const pad = keypad(fq, v => {
    if (check(fq, v)) { fadedResult.innerHTML = ''; fadedResult.append(h('div', { class: 'explain' }, 'Correct. Now do 5 on your own - no steps given.')); fx.correct(fadedBox); unbindKeys(); pad.remove(); }
    else { tries++; fx.wrong(fadedBox); fadedResult.innerHTML = ''; fadedResult.append(h('div', { class: 'hint' }, h('b', {}, tries === 1 ? 'Strategy' : 'Where you are'), ' ', fq.hints[Math.min(tries, fq.hints.length - 1)] || fq.steps[1] || '')); }
  });
  fadedBox.append(h('div', { style: { font: '700 22px var(--num)' } }, fq.q), h('div', { class: 'worked-step' }, h('span', { class: 'ws-n' }, 1), h('div', {}, fq.steps[0])), h('div', { class: 'worked-step' }, h('span', { class: 'ws-n' }, '…'), h('div', { class: 'muted' }, 'You finish it.')), fadedResult);
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/learn', class: 'muted small' }, '← Learn'), h('h1', {}, s.name), h('div', { class: 'sub' }, `Level ${L} · understand the method before timing it`))),
    h('div', { class: 'lesson-step' }, h('h3', {}, '1 · The idea'), h('p', { html: md(s.lesson) })),
    h('div', { class: 'lesson-step' }, h('h3', {}, '2 · Worked example'), h('div', { style: { font: '700 22px var(--num)', marginBottom: '8px' } }, ex.q), ...steps, h('div', { class: 'row', style: { marginTop: '10px' } }, next)),
    h('div', { class: 'lesson-step' }, h('h3', {}, '3 · Faded example - you finish it'), fadedBox, h('div', { style: { marginTop: '10px' } }, pad)),
    h('div', { class: 'lesson-step' }, h('h3', {}, '4 · On your own'), h('p', { class: 'small muted' }, 'Five questions, untimed. Misses come back with hints.'),
      h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => startRound({ kind: 'learn-math', title: `${s.name} · check`, questions: Array.from({ length: 5 }, () => ({ ...makeQ(s.id, L, 'free'), srs: true })), area: 'math', req: null, tags: ['math', s.id] }) }, 'Start'),
        h('a', { class: 'btn ghost', href: '#/sprint' }, 'Go to Sprint')))));
}
