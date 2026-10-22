// Prep: every upcoming course with units, lessons, readiness, timed practice,
// assignments/test dates, an auto study plan and adaptive review.
import { S, save, uid, today, addDays, daysBetween, dueItems, removeById } from '../store.js';
import { h, card, ring, bar, pct, toast, modal } from '../ui.js';
import { COURSE, byPriority, courseReadiness, unitReadiness, termOf, termStart, daysUntilStart, TERM_LABEL, lessonKey } from '../data/courses.js';
import { renderUnit, frqCard } from '../unitview.js';
import { renderLesson } from '../lesson.js';
import { unitPool, buildSet, resolveKey } from '../pool.js';
import { startRound } from '../quiz.js';
import { scheduleReminders } from '../ntfy.js';

const areaOf = c => c.id;
const reqOf = c => (c.ap ? 'ap' : null);

export function render(root, p) {
  if (!p.length) return list(root);
  const c = COURSE[p[0]];
  if (!c) { location.hash = '#/prep'; return; }
  if (p[1] && p[2] === 'lesson') {
    const u = c.units.find(x => x.id === p[1]); const l = u && u.lessons.find(x => x.id === p[3]);
    if (!l) return (location.hash = `#/prep/${c.id}`);
    return renderLesson(root, { lesson: l, key: lessonKey(c, u, l), back: `#/prep/${c.id}/${u.id}`, title: c.name, sub: `${c.short} · ${u.t}`, check: buildSet(unitPool(c, u), 3), area: areaOf(c), req: reqOf(c), tags: [c.id, u.id] });
  }
  if (p[1]) {
    const u = c.units.find(x => x.id === p[1]);
    if (!u) return (location.hash = `#/prep/${c.id}`);
    return renderUnit(root, { c, u, base: `#/prep/${c.id}/${u.id}`, back: `#/prep/${c.id}`, area: areaOf(c), req: reqOf(c), label: c.short });
  }
  return course(root, c);
}

function list(root) {
  const cs = byPriority();
  const terms = [...new Set(cs.map(termOf))].sort((a, b) => (S().profile.terms[a] > S().profile.terms[b] ? 1 : -1));
  const focus = cs.find(c => c.ap) || cs[0];
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Prep'), h('div', { class: 'sub' }, 'Every upcoming course, deepest for APs. AP + math are your required 4 days a week.'))),
    card('Focus now', h('div', { class: 'hero' }, ring(courseReadiness(focus), { size: 92, stroke: 9, label: pct(courseReadiness(focus)), sub: 'ready' }),
      h('div', { class: 'hero-text' }, h('h2', {}, focus.name), h('p', { class: 'muted' }, `${TERM_LABEL[termOf(focus)]} starts in ${Math.max(0, daysUntilStart(focus))} days. ${nextUnitText(focus)}`), h('a', { class: 'btn primary', href: `#/prep/${focus.id}` }, 'Open course')))),
    ...terms.map(t => h('div', {},
      h('h3', { class: 'muted', style: { margin: '20px 4px 10px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.07em' } }, `${TERM_LABEL[t]} · ${new Date(S().profile.terms[t] + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`),
      h('div', { class: 'grid g3' }, ...cs.filter(c => termOf(c) === t).map(courseTile)))));
}

function nextUnitText(c) {
  const u = c.units.find(u => unitReadiness(c, u) < 0.7);
  return u ? `Next: ${u.t}.` : 'All units above 70% - keep reviewing.';
}

function courseTile(c) {
  const r = courseReadiness(c);
  const next = S().events.filter(e => e.course === c.id && e.date >= today()).sort((a, b) => a.date.localeCompare(b.date))[0];
  return h('a', { class: 'tile', href: `#/prep/${c.id}` },
    h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic', style: { background: c.color + '1A', color: c.color } }, c.short.slice(0, 2)), c.ap ? h('span', { class: 'chip gold' }, 'AP') : h('span', { class: 'chip' }, `${c.units.length} units`)),
    h('h4', {}, c.name),
    h('div', { class: 'muted' }, next ? `${next.kind === 'test' ? 'Test' : 'Due'} ${next.date.slice(5)} · ${next.title}` : `${pct(r)} ready`),
    h('div', { style: { marginTop: '10px' } }, bar(r)));
}

function course(root, c) {
  const tab = (S().prepTab ||= {})[c.id] || 'units';
  const r = courseReadiness(c);
  const setTab = t => { S().prepTab[c.id] = t; save(); root.innerHTML = ''; course(root, c); };
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/prep', class: 'muted small' }, '← Prep'), h('h1', {}, c.name), h('div', { class: 'sub' }, `${TERM_LABEL[termOf(c)]} · starts ${termStart(c)}${c.examNote ? ' · ' + c.examNote : ''}`))),
    h('div', { class: 'course-head card', style: { marginBottom: '12px' } }, ring(r, { size: 96, stroke: 9, label: pct(r), sub: 'ready' }),
      h('div', { class: 'stack', style: { flex: 1, minWidth: 0 } },
        h('div', {}, h('b', {}, `${c.units.filter(u => unitReadiness(c, u) >= 0.7).length}/${c.units.length}`), ' units ready'),
        h('div', { class: 'small muted' }, `${Object.keys(S().lessons).filter(k => k.startsWith(c.id + '/') && S().lessons[k].done).length} of ${c.units.reduce((a, u) => a + (u.lessons || []).length, 0)} lessons done`),
        h('div', { class: 'row' }, h('button', { class: 'btn sm primary', onclick: () => adaptiveReview(c) }, 'Adaptive review'), h('button', { class: 'btn sm', onclick: () => timedMixed(c) }, 'Timed mixed set')))),
    h('div', { class: 'tabs' }, ...[['units', 'Units'], ['plan', 'Study plan'], ['dates', 'Tests & assignments'], ['frq', 'Free response']].map(([k, l]) => h('button', { class: tab === k ? 'on' : '', onclick: () => setTab(k) }, l))));
  if (tab === 'units') root.append(h('div', { class: 'unit-list' }, ...c.units.map((u, i) => {
    const ur = unitReadiness(c, u);
    return h('a', { class: `unit-row${ur >= 0.7 ? ' done' : ''}`, href: `#/prep/${c.id}/${u.id}` }, h('span', { class: 'unit-n' }, i + 1),
      h('div', { style: { minWidth: 0 } }, h('div', { style: { fontWeight: 600 } }, u.t), h('div', { class: 'unit-meta' }, u.topics), h('div', { style: { marginTop: '6px' } }, bar(ur, { cls: ur >= 0.7 ? 'good' : '' }))), h('span', { class: 'muted small' }, pct(ur)));
  })));
  if (tab === 'plan') root.append(plan(c));
  if (tab === 'dates') root.append(dates(c, () => setTab('dates')));
  if (tab === 'frq') {
    const fs = [...c.units.flatMap(u => u.frq || []), ...(c.frqTemplates || [])];
    root.append(fs.length ? h('div', { class: 'stack' }, ...fs.map(f => frqCard(c, f, c.id, reqOf(c)))) : card('', h('p', { class: 'empty' }, 'This course is mostly multiple choice and problem sets. Use unit practice and timed sets.')));
  }
}

function adaptiveReview(c) {
  const due = dueItems(k => k.includes(`:${c.id}/`)).map(i => resolveKey(i.key)).filter(Boolean);
  // add weakest-unit questions to fill to 10
  const weakest = [...c.units].sort((a, b) => unitReadiness(c, a) - unitReadiness(c, b))[0];
  const fill = buildSet(unitPool(c, weakest), Math.max(0, 10 - due.length));
  const qs = [...due.slice(0, 10), ...fill].slice(0, 10);
  if (!qs.length) return toast('Nothing to review yet.');
  startRound({ kind: 'review', meta: { back: `#/prep/${c.id}` }, title: `${c.short} · Adaptive review`, questions: qs, area: c.id, req: reqOf(c), tags: [c.id] });
}
function timedMixed(c) {
  const qs = c.units.flatMap(u => buildSet(unitPool(c, u), 2)).sort(() => Math.random() - 0.5).slice(0, 15);
  startRound({ kind: 'course-mixed', meta: { back: `#/prep/${c.id}` }, title: `${c.short} · Timed mixed`, questions: qs, target: c.ap ? 60000 : 50000, area: c.id, req: reqOf(c), tags: [c.id] });
}

// Spread remaining units across the weeks before the term starts (or the next test).
export function studyPlan(c) {
  const start = termStart(c);
  const nextTest = S().events.filter(e => e.course === c.id && e.kind === 'test' && e.date >= today()).sort((a, b) => a.date.localeCompare(b.date))[0];
  const deadline = nextTest ? nextTest.date : start;
  const weeks = Math.max(1, Math.ceil(Math.max(7, daysBetween(today(), deadline)) / 7));
  const todo = c.units.filter(u => unitReadiness(c, u) < 0.7);
  const perWeek = Math.max(1, Math.ceil(todo.length / weeks));
  const out = [];
  for (let w = 0; w < weeks && out.length * perWeek < todo.length + perWeek; w++) out.push({ week: w, from: addDays(today(), w * 7), units: todo.slice(w * perWeek, (w + 1) * perWeek) });
  return { deadline, label: nextTest ? `test: ${nextTest.title}` : 'term start', weeks: out.filter(x => x.units.length), perWeek };
}
function plan(c) {
  const sp = studyPlan(c);
  return card(`Plan to ${sp.label} (${sp.deadline})`, h('div', { class: 'stack' },
    h('p', { class: 'small muted' }, `${sp.perWeek} unit(s) per week. Each unit: lessons first (understanding), then practice, then a timed test (speed). Reviews come back automatically.`),
    ...(sp.weeks.length ? sp.weeks.map(w => h('div', { class: 'plan-item' }, h('span', { class: 'check' }, ''), h('div', { class: 'pi-body' }, h('div', { class: 'pi-t' }, w.week === 0 ? 'This week' : `Week of ${w.from.slice(5)}`), h('div', { class: 'pi-s' }, w.units.map(u => u.t).join(' · '))))) : [h('p', { class: 'empty' }, 'Every unit is above 70%. Keep the adaptive review going.')])));
}

function dates(c, refresh) {
  const evs = S().events.filter(e => e.course === c.id).sort((a, b) => a.date.localeCompare(b.date));
  const title = h('input', { class: 'input', placeholder: 'e.g. Unit 3 test, DBQ due' });
  const date = h('input', { class: 'input', type: 'date', value: addDays(today(), 7) });
  const kind = h('select', { class: 'input' }, h('option', { value: 'test' }, 'Test'), h('option', { value: 'assignment' }, 'Assignment'), h('option', { value: 'reminder' }, 'Reminder'));
  return h('div', { class: 'stack' },
    card('Add a date', h('div', { class: 'stack' }, title, h('div', { class: 'row' }, h('div', { style: { flex: 1 } }, date), h('div', { style: { flex: 1 } }, kind)),
      h('button', { class: 'btn primary', onclick: () => { if (!title.value.trim()) return toast('Add a title'); S().events.push({ id: uid(), title: title.value.trim(), date: date.value, course: c.id, kind: kind.value, ts: Date.now() }); save(); scheduleReminders(); toast('Added - reminders queued', 'good'); refresh(); } }, 'Add'),
      h('p', { class: 'small muted' }, 'Tests reshape the study plan and get ntfy reminders 3 days and 1 day before.'))),
    card('Upcoming', evs.length ? h('div', { class: 'plan' }, ...evs.map(e => h('div', { class: 'plan-item' }, h('span', { class: `chip ${e.kind === 'test' ? 'bad' : e.kind === 'assignment' ? 'gold' : 'good'}` }, e.kind),
      h('div', { class: 'pi-body' }, h('div', { class: 'pi-t' }, e.title), h('div', { class: 'pi-s' }, `${e.date} · ${daysBetween(today(), e.date) >= 0 ? `in ${daysBetween(today(), e.date)} days` : 'past'}`)),
      h('button', { class: 'btn sm ghost pi-tag', onclick: () => { removeById('events', e.id); refresh(); } }, 'Remove')))) : h('p', { class: 'empty' }, 'No dates yet.')));
}
