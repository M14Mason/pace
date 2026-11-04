// Practice: free choice when you want more. Levels rise from practice; speed is a bonus.
import { S, save, dueItems } from '../store.js';
import { h, card, bar, modal, md, fmtMs } from '../ui.js';
import { SKILLS, SKILL, makeQ } from '../math/skills.js';
import { PACKS, scenarioQ } from '../math/scenarios.js';
import { startRound, onRoundFinish } from '../quiz.js';
import { skillState, levelProgress } from '../mastery.js';
import { dailyQuestions } from './sprint.js';
import { trickSheet } from '../data/tricks.js';
import { reviewRound } from './dashboard.js';
import { dueCards } from './cards.js';

onRoundFinish('practice', () => { location.hash = '#/practice'; });

const quickMix = () => startRound({ kind: 'practice', title: 'Quick math', questions: dailyQuestions(10), area: 'math', req: 'math', tags: ['math'] });
const skillRound = (id, speed = false) => {
  const L = skillState(id).level;
  startRound({ kind: 'practice', title: `${SKILL[id].name}${speed ? ' · speed run' : ''}`, questions: Array.from({ length: 10 }, () => makeQ(id, L, 'free')), area: 'math', req: 'math', tags: ['math', id], target: speed ? SKILL[id].targets[L - 1] : 0, coach: speed ? false : undefined });
};

export function render(root) {
  const due = dueItems(k => !k.startsWith('card:')).length;
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Practice'), h('div', { class: 'sub' }, 'Pick anything. Levels go up as you practice - no tests to pass.'))),
    h('div', { class: 'grid g2' },
      h('button', { class: 'tile big-tile', onclick: quickMix }, h('div', { class: 'tile-ic' }, '⚡'), h('h4', {}, 'Quick math'), h('div', { class: 'muted' }, '10 mixed questions that adapt to you')),
      h('button', { class: 'tile big-tile', disabled: !due, onclick: () => reviewRound(dueItems(k => !k.startsWith('card:'))) }, h('div', { class: 'tile-ic' }, '↻'), h('h4', {}, 'Review'), h('div', { class: 'muted' }, due ? `${due} ready - things you missed before` : 'Nothing due right now')),
      h('a', { class: 'tile big-tile', href: '#/memory', style: { gridColumn: '1 / -1' } }, h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic' }, '🧠'), dueCards().length ? h('span', { class: 'chip gold' }, `${dueCards().length} cards due`) : null), h('h4', {}, 'Memory'), h('div', { class: 'muted' }, 'Remember anything you hear: capture it, recall it, keep it. Plus the memory palace.'))),
    h('h3', { class: 'section-h' }, 'Math skills'),
    h('div', { class: 'skill-list' }, ...SKILLS.map(s => {
      const st = skillState(s.id);
      return h('button', { class: 'skill-row', onclick: () => sheet(s) },
        h('span', { class: 'tile-ic' }, s.icon),
        h('div', { class: 'skill-mid' }, h('div', { class: 'row between' }, h('b', {}, s.name), h('span', { class: 'small muted' }, `Level ${st.level}${(st.fluent || {})[st.level - 1] ? ' ⚡' : ''}`)), bar(levelProgress(s.id))));
    })),
    h('h3', { class: 'section-h' }, 'Real-life money math'),
    h('div', { class: 'grid g2' }, ...PACKS.map(p => h('button', { class: 'tile', onclick: () => startRound({ kind: 'practice', title: p.name, questions: Array.from({ length: 8 }, () => scenarioQ(p.id)), area: 'math', req: 'math', tags: ['math', p.id] }) }, h('div', { class: 'tile-ic' }, p.icon), h('h4', {}, p.name), h('div', { class: 'muted' }, p.desc)))),
    h('h3', { class: 'section-h' }, 'More'),
    h('div', { class: 'grid g3' },
      link('#/learn/factor', '(x)', 'Factoring', 'Step by step, every pattern'),
      link('#/learn/cards', '▤', 'Flashcards', 'From notes, Quizlet, misses'),
      link('#/speak', '🎙', 'Speak', 'Say it clearly'),
      link('#/learn/help', '❓', 'Homework help', 'Hints, not answers'),
      link('#/learn', '📖', 'How it works', 'Why Pace teaches this way')));
}
const link = (href, ic, t, d) => h('a', { class: 'tile', href }, h('div', { class: 'tile-ic' }, ic), h('h4', {}, t), h('div', { class: 'muted' }, d));

function sheet(s) {
  const st = skillState(s.id);
  const close = modal(h('div', { class: 'stack' },
    h('div', { class: 'row between' }, h('h2', {}, s.name), h('span', { class: 'chip acc' }, `Level ${st.level} of 8`)),
    h('div', {}, bar(levelProgress(s.id)), h('div', { class: 'small muted', style: { marginTop: '4px' } }, 'Level up = 8 of your last 10 right at this level, at a comfortable pace.')),
    h('button', { class: 'btn primary wide big', onclick: () => { close(); skillRound(s.id); } }, 'Practice 10'),
    h('button', { class: 'btn wide', onclick: () => { close(); skillRound(s.id, true); } }, `⏱ Optional speed run · beat ${fmtMs(s.targets[st.level - 1])}`),
    trickSheet(s.id, 'Tricks')));
}
