// Today's session: one button, ~15 minutes, no decisions.
// warm-up math (adaptive) -> AP: next reading section (or unit practice once read) -> spaced review.
import { S, save, today, dueItems } from './store.js';
import { h, toast } from './ui.js';
import { startRound, onRoundFinish } from './quiz.js';
import { dailyQuestions } from './views/sprint.js';
import { byPriority } from './data/courses.js';
import { READINGS } from './data/readings/index.js';
import { unitPool, buildSet, resolveKey } from './pool.js';
import * as fx from './fx.js';
import { renderReading } from './views/reading.js';
import { COURSE } from './data/courses.js';

const apCourse = () => byPriority().find(c => c.ap);
function nextAPStep() {
  const c = apCourse();
  const rd = S().readDone || {};
  const unit = c.units.find(u => !rd[`${c.id}/${u.id}`]);
  if (unit && READINGS[`${c.id}/${unit.id}`]) {
    const sec = ((S().readProg || {})[`${c.id}/${unit.id}`]) || 0;
    const total = READINGS[`${c.id}/${unit.id}`].s.length;
    return { type: 'read', cid: c.id, uid: unit.id, section: Math.min(sec, total - 1), label: `${c.short}: read "${unit.t}" (part ${Math.min(sec, total - 1) + 1} of ${total})`, mins: 4 };
  }
  const weakest = [...c.units].reverse().find(u => rd[`${c.id}/${u.id}`]) || c.units[0];
  return { type: 'round', build: 'ap', cid: c.id, uid: weakest.id, label: `${c.short}: practice "${weakest.t}"`, mins: 4 };
}

export function planToday() {
  const steps = [
    { type: 'round', build: 'math', label: 'Math warm-up · 8 questions that adapt to you', mins: 3 },
    nextAPStep(),
  ];
  const due = dueItems(k => !k.startsWith('card:'));
  if (due.length) steps.push({ type: 'round', build: 'review', label: `Quick review · ${Math.min(5, due.length)} things you missed before`, mins: 2 });
  return steps;
}

export function session() {
  const st = S();
  if (!st.session || st.session.date !== today()) st.session = { date: today(), steps: planToday(), i: 0 };
  return st.session;
}
export const sessionDone = () => { const s = S().session; return !!(s && s.date === today() && s.i >= s.steps.length); };

export function runNext() {
  const ss = session();
  const step = ss.steps[ss.i];
  if (!step) { location.hash = '#/session'; return; }
  if (step.type === 'read') { location.hash = `#/session/read`; return; }
  let qs = [], title = step.label.split(' · ')[0], area = 'math', req = 'math', tags = ['math'];
  if (step.build === 'math') qs = dailyQuestions(8);
  else if (step.build === 'ap') {
    const c = byPriority().find(x => x.id === step.cid); const u = c.units.find(x => x.id === step.uid);
    qs = buildSet(unitPool(c, u), 6); area = c.id; req = 'ap'; tags = [c.id, u.id];
  } else if (step.build === 'review') {
    qs = dueItems(k => !k.startsWith('card:')).sort(() => Math.random() - 0.5).slice(0, 5).map(i => resolveKey(i.key)).filter(Boolean); area = 'review'; req = null; tags = ['review'];
  }
  if (!qs.length) { stepDone(); return runNext(); }
  startRound({ kind: 'session-step', title, questions: qs, area, req, tags, meta: { back: '#/session' } });
}

export function stepDone() {
  const ss = session();
  ss.i = Math.min(ss.steps.length, ss.i + 1);
  save();
}
onRoundFinish('session-step', () => { stepDone(); location.hash = '#/session'; });

// Session page: progress through the steps, then a clear finish line.
export function renderSession(root, p = []) {
  const ss = session();
  const step = ss.steps[ss.i];
  if (p[0] === 'read' && step && step.type === 'read') {
    const c = COURSE[step.cid], u = c.units.find(x => x.id === step.uid);
    return renderReading(root, { c, u, back: '#/', area: c.id, tags: [c.id, u.id], section: step.section, onDone: () => { stepDone(); location.hash = '#/session'; } });
  }
  if (ss.i >= ss.steps.length) {
    root.append(h('div', { class: 'done-wrap' },
      h('div', { class: 'done-badge' }, '✓'),
      h('h1', {}, 'Done for today'),
      h('p', { class: 'muted' }, 'That counts toward your week. Come back tomorrow - or keep going if you want.'),
      h('div', { class: 'stack', style: { width: '100%', maxWidth: '360px' } },
        h('a', { class: 'btn primary wide big', href: '#/' }, 'Back to Today'),
        h('a', { class: 'btn wide', href: '#/practice' }, 'Bonus practice'))));
    requestAnimationFrame(() => { fx.levelUp('Session complete', 'Nice work today'); });
    return;
  }
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/', class: 'muted small' }, '← Today'), h('h1', {}, 'Today\'s session'), h('div', { class: 'sub' }, `Step ${ss.i + 1} of ${ss.steps.length}`))),
    h('div', { class: 'steps' }, ...ss.steps.map((s, k) => h('div', { class: `step${k < ss.i ? ' done' : k === ss.i ? ' cur' : ''}` },
      h('span', { class: 'step-dot' }, k < ss.i ? '✓' : k + 1), h('div', {}, h('div', { class: 'step-t' }, s.label), h('div', { class: 'small muted' }, `~${s.mins} min`))))),
    h('button', { class: 'btn primary wide big', onclick: runNext }, ss.i === 0 ? 'Start ▶' : 'Continue ▶')));
}
