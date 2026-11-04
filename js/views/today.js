// Today: one obvious next step. Everything else is one tap away, never in the way.
import { S, today, day, dayDone, weekStart, weekCount, weekStreak, daysBetween } from '../store.js';
import { h, ring, md } from '../ui.js';
import { session, sessionDone, runNext } from '../session.js';
import { COURSE } from '../data/courses.js';
import { dueCards } from './cards.js';

export function render(root) {
  const st = S(), d = day();
  const ss = session();
  const done = sessionDone();
  const goal = st.profile.weeklyGoal, wc = weekCount(weekStart());
  const hr = new Date().getHours();
  const hello = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const mins = ss.steps.slice(ss.i).reduce((a, s) => a + s.mins, 0);
  const next = st.events.filter(e => e.date >= today()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2);
  const cardsDue = dueCards().length;

  const startBtn = st.activeRound
    ? h('a', { class: 'btn primary wide big', href: '#/round' }, '▶ Resume where you left off')
    : done
      ? h('a', { class: 'btn wide big', href: '#/practice' }, 'Done for today ✓ - bonus practice?')
      : h('button', { class: 'btn primary wide big', onclick: () => (ss.i === 0 ? (location.hash = '#/session') : runNext()) }, ss.i === 0 ? `▶ Start today · ~${mins} min` : `▶ Continue · step ${ss.i + 1} of ${ss.steps.length}`);

  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, `${hello}${st.profile.name ? ', ' + st.profile.name : ''}`), h('div', { class: 'sub' }, done ? 'You\'re done for today. Nice.' : 'One session a day. That\'s the whole plan.'))),
    !st.profile.placementDone ? h('a', { class: 'card accent', href: '#/placement', style: { display: 'block', textDecoration: 'none', marginBottom: '12px' } }, h('h3', {}, 'First: a 3-minute check-in'), h('div', { class: 'small', style: { opacity: .85 } }, 'So Pace starts at the right level for you.')) : null,
    h('section', { class: 'card today-hero' },
      h('div', { class: 'hero' },
        ring(Math.min(1, wc / goal), { size: 104, stroke: 10, label: `${wc}/${goal}`, sub: 'this week', cls: wc >= goal ? 'good' : '' }),
        h('div', { class: 'hero-text stack' },
          h('div', { class: 'small muted' }, dayDone(d) ? '✓ Today counts' : `${goal} days a week keeps your streak`),
          h('div', { class: 'row' }, h('span', { class: 'chip gold' }, `🔥 ${weekStreak()} week streak`)))),
      !done && !st.activeRound ? h('div', { class: 'steps compact' }, ...ss.steps.map((s, k) => h('div', { class: `step${k < ss.i ? ' done' : k === ss.i ? ' cur' : ''}` }, h('span', { class: 'step-dot' }, k < ss.i ? '✓' : k + 1), h('div', { class: 'step-t' }, s.label)))) : null,
      startBtn),
    h('div', { class: 'quick' },
      quick('#/memory/add', '🧠', 'Remember it'),
      quick('#/learn/help', '❓', 'Homework help'),
      quick('#/memory', '▤', cardsDue ? `Recall · ${cardsDue}` : 'Recall'),
      quick('#/speak', '🎙', 'Speak'),
      quick('#/finance/market', '📈', 'Market brief')),
    next.length ? h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h3', {}, 'Coming up')),
      ...next.map(e => h('div', { class: 'row between', style: { padding: '6px 0' } }, h('span', {}, `${e.kind === 'test' ? '📝' : '📌'} ${e.title}`), h('span', { class: 'small muted' }, `${COURSE[e.course]?.short || ''} · ${daysBetween(today(), e.date) === 0 ? 'today' : `in ${daysBetween(today(), e.date)}d`}`)))) : null);
}

const quick = (href, ic, label) => h('a', { class: 'quick-a', href }, h('span', { class: 'quick-ic' }, ic), h('span', {}, label));
