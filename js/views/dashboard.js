// Dashboard: today's plan, Pace Score, streaks, stats over time, calendar, heatmap.
import { S, save, snapshotReadiness, today, day, dayDone, weekStart, weekCount, weekStreak, dayStreak, paceScore, rangeStats, dueItems, addDays, daysBetween } from '../store.js';
import { h, card, ring, bar, pct, fmtMs, fmtMin, heatmap, calendar, lineChart, scoreSeries, weekBoard, countUp, modal } from '../ui.js';
import { skyline, orb } from '../three-bg.js';
import { COURSES, byPriority, courseReadiness, COURSE } from '../data/courses.js';
import { startDaily, gatedSkills, totalLevel, dailyQuestions } from './sprint.js';
import { resolveKey } from '../pool.js';
import { startRound, onRoundFinish } from '../quiz.js';
import { unitPool, buildSet } from '../pool.js';
import { toast } from '../ui.js';
import { relevantTips } from '../quiz.js';
import { hasAI } from '../ai.js';

export function todaysPlan() {
  const d = day();
  const ap = byPriority().find(c => c.ap);
  const nextUnit = ap.units.find(u => !u.lessons.every(l => S().lessons[`${ap.id}/${u.id}/${l.id}`]?.done)) || ap.units[0];
  const nextLesson = nextUnit.lessons.find(l => !S().lessons[`${ap.id}/${nextUnit.id}/${l.id}`]?.done);
  const due = dueItems(k => !k.startsWith('card:'));
  const gated = gatedSkills();
  const term2 = byPriority().filter(c => !c.ap && (c.term === '10-T2' || c.id === 'math3')).slice(0, 3);
  const items = [
    { t: gated.length ? `Math Sprint · ${gated[0].name} drill` : "Math Sprint · today's 12", s: gated.length ? 'Gate: fix speed/accuracy, then retest' : '≈ 2-4 min · interleaved, weighted to weak skills', done: d.req.math, req: true, tag: 'required', go: () => gated.length ? (location.hash = `#/sprint/gate/${gated[0].id}`) : startDaily() },
    { t: nextLesson ? `${ap.short} · ${nextLesson.t}` : `${ap.short} · ${nextUnit.t} practice`, s: `${nextUnit.t} · ≈ 6-8 min`, done: d.req.ap, req: true, tag: 'required', href: nextLesson ? `#/prep/${ap.id}/${nextUnit.id}/lesson/${nextLesson.id}` : `#/prep/${ap.id}/${nextUnit.id}` },
    due.length ? { t: `Spaced review · ${Math.min(10, due.length)} due`, s: 'Things you missed or needed hints on', done: false, tag: 'review', go: () => reviewRound(due) } : null,
    { t: `Optional · ${term2.map(c => c.short).join(' / ')}`, s: 'Term 2 head start', done: term2.some(c => d.areas[c.id]), tag: 'bonus', href: '#/prep' },
    { t: 'Optional · Business & Finance or DECA', s: 'One lesson, case, or roleplay', done: !!(d.areas.finance || d.areas.deca), tag: 'bonus', href: '#/finance' },
  ].filter(Boolean);
  return items;
}

export function reviewRound(due) {
  const qs = due.sort(() => Math.random() - 0.5).slice(0, 10).map(i => resolveKey(i.key)).filter(Boolean);
  if (!qs.length) return;
  const isAP = k => COURSES.some(c => c.ap && k.includes(`:${c.id}/`));
  startRound({ kind: 'review', meta: { back: '#/' }, title: 'Spaced review', questions: qs, area: 'review', req: qs.some(q => isAP(q.key)) ? 'ap' : null, tags: ['review'] });
}

// Tired-day minimum: 6 sprint questions + 4 AP questions, about 5 minutes. Counts as a required day.
export function startMinimumDay() {
  const ap = byPriority().find(c => c.ap);
  const due = dueItems(k => k.includes(`:${ap.id}/`)).map(i => resolveKey(i.key)).filter(Boolean).slice(0, 4);
  const unit = ap.units.find(u => u.lessons.some(l => S().lessons[`${ap.id}/${u.id}/${l.id}`]?.done)) || ap.units[0];
  const apQs = [...due, ...buildSet(unitPool(ap, unit), 4 - due.length)].slice(0, 4);
  const qs = [...dailyQuestions(6), ...apQs];
  startRound({ kind: 'min-day', meta: { back: '#/' }, title: '5-minute minimum', questions: qs, target: 0, area: 'math', req: 'min', tags: ['math', ap.id] });
}
onRoundFinish('min-day', () => { location.hash = '#/'; setTimeout(() => toast('Minimum day done - it counts. Rest up.', 'good'), 400); });

// One tap: whatever is next.
export function continueNext() {
  if (S().activeRound) return (location.hash = '#/round');
  const next = todaysPlan().find(p => !p.done);
  if (!next) return toast('Everything for today is done. Bonus: Speak or a Finance case.');
  next.go ? next.go() : (location.hash = next.href);
}

export function render(root) {
  const st = S(), d = day(), score = paceScore();
  const ws = weekStart(), wc = weekCount(ws), goal = st.profile.weeklyGoal;
  const r7 = rangeStats(7), r30 = rangeStats(30);
  const plan = todaysPlan();
  const events = st.events.filter(e => e.date >= today()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const greeting = (() => { const hr = new Date().getHours(); return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'; })();
  const resume = st.activeRound;

  const scoreNum = h('span');
  const scoreRing = ring(score / 100, { size: 132, stroke: 12, label: '', sub: 'Pace Score', cls: score >= 80 ? 'good' : '' });
  scoreRing.querySelector('.ring-num').append(scoreNum);
  requestAnimationFrame(() => countUp(scoreNum, score));

  const tips = relevantTips(['math', 'apwh', 'finance', 'speak']).slice(0, 1);
  const sky = h('div', { class: 'skyline' });
  if (!(st.readinessLog || {})[today()]) snapshotReadiness(Object.fromEntries(COURSES.map(c => [c.id, Math.round(courseReadiness(c) * 1000) / 1000])));

  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, `${greeting}${st.profile.name ? ', ' + st.profile.name : ''}`), h('div', { class: 'sub' }, new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))),
      h('div', { class: 'row' }, h('a', { class: 'btn sm', href: '#/records' }, '🏆 Records'), h('a', { class: 'icon-btn', href: '#/settings', title: 'Settings', html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>' }))),
    resume ? h('a', { class: 'card gate', href: '#/round', style: { display: 'block', textDecoration: 'none', marginBottom: '12px' } }, h('h3', {}, `Finish your round: ${resume.title}`), h('div', { class: 'small' }, 'Rounds only count once you clear every miss.')) : null,
    h('div', { class: 'row', style: { marginBottom: '12px' } },
      h('button', { class: 'btn primary', style: { flex: 2, minHeight: '54px', fontSize: '16px' }, onclick: continueNext }, resume ? '▶ Resume round' : dayDone(d) ? '▶ Keep going' : '▶ Continue'),
      dayDone(d) ? null : h('button', { class: 'btn', style: { flex: 1, minHeight: '54px' }, onclick: startMinimumDay, title: '6 math + 4 AP questions, counts as a required day' }, 'Tired? 5 min')),
    !st.profile.placementDone ? h('a', { class: 'card accent', href: '#/placement', style: { display: 'block', textDecoration: 'none', marginBottom: '12px' } }, h('h3', {}, 'Take the placement test (≈ 6 min)'), h('div', { class: 'small muted' }, 'Sets your starting levels and shapes your plan.')) : null,
    h('div', { class: 'grid g2' },
      card('Today', h('div', { class: 'hero' }, scoreRing, h('div', { class: 'hero-text stack' },
        h('div', {}, h('div', { class: 'kpi-l' }, 'This week'), h('div', { class: 'kpi-v' }, `${wc}/${goal}`, h('span', { class: 'small muted' }, ' required days')), bar(wc / goal, { cls: wc >= goal ? 'good' : '' })),
        h('div', { class: 'row' }, h('span', { class: 'chip gold' }, `🔥 ${weekStreak()} wk streak`), h('span', { class: 'chip' }, `${dayStreak()} day run`)),
        h('div', { class: 'small muted' }, dayDone(d) ? (d.req.min && !(d.req.math && d.req.ap) ? 'Minimum day done ✓' : 'Required work done today ✓') : `${d.req.math ? '✓' : '○'} Math  ${d.req.ap ? '✓' : '○'} AP`)))),
      card("Today's plan", h('div', { class: 'plan' }, ...plan.map(p => {
        const el = h(p.href ? 'a' : 'button', { class: `plan-item${p.done ? ' done' : ''}`, href: p.href, onclick: p.go, style: { width: '100%', textAlign: 'left' } },
          h('span', { class: 'check' }, '✓'), h('div', { class: 'pi-body' }, h('div', { class: 'pi-t' }, p.t), h('div', { class: 'pi-s' }, p.s)),
          h('span', { class: `chip pi-tag ${p.tag === 'required' ? 'acc' : p.tag === 'review' ? 'gold' : ''}` }, p.tag));
        return el;
      })))),
    h('div', { class: 'kpis', style: { margin: '12px 0' } },
      kpi('Time today', fmtMin(d.ms), `${fmtMin(r7.ms)} this week`),
      kpi('Accuracy', d.q ? pct(d.correct / d.q) : '-', `7-day ${r7.q ? pct(r7.acc) : '-'}`),
      kpi('Avg response', d.q ? fmtMs(d.rt / d.q) : '-', `7-day ${r7.q ? fmtMs(r7.avgRt) : '-'}`),
      kpi('Sprint rank', totalLevel(), `${gatedSkills().length} skill(s) gated`)),
    h('div', { class: 'grid g2' },
      card('Pace Score · 30 days', h('div', {}, lineChart(scoreSeries(30), { max: 100 }), h('div', { class: 'row between small muted' }, h('span', {}, '30 days ago'), h('span', {}, `avg ${Math.round(scoreSeries(30).filter(p => p.y).reduce((a, p, _, A) => a + p.y / A.length, 0)) || 0}`), h('span', {}, 'today')))),
      card('Last 30 days in 3D', h('div', {}, sky, h('div', { class: 'small muted' }, 'Drag to rotate. Taller = higher Pace Score.')))),
    h('div', { class: 'grid g2', style: { marginTop: '12px' } },
      card('Course readiness', h('div', { class: 'stack' }, ...byPriority().slice(0, 7).map(c => h('a', { href: `#/prep/${c.id}`, style: { textDecoration: 'none', display: 'block' } },
        h('div', { class: 'row between small' }, h('span', {}, c.ap ? h('b', {}, c.short) : c.short), h('span', { class: 'muted' }, pct(courseReadiness(c)))), bar(courseReadiness(c))))), { action: h('a', { class: 'small', href: '#/prep' }, 'All') }),
      card('Deadlines & reminders', h('div', { class: 'plan' },
        ...(events.length ? events.map(e => h('div', { class: 'plan-item' }, h('span', { class: `chip ${e.kind === 'test' ? 'bad' : e.kind === 'assignment' ? 'gold' : 'good'}` }, e.kind), h('div', { class: 'pi-body' }, h('div', { class: 'pi-t' }, e.title), h('div', { class: 'pi-s' }, `${COURSE[e.course]?.short || ''} · ${e.date} · ${daysBetween(today(), e.date) === 0 ? 'today' : `in ${daysBetween(today(), e.date)}d`}`)))) :
          [h('p', { class: 'empty' }, 'No dates yet. Add tests and assignments in Prep → a course → Tests & assignments.')]),
        st.profile.ntfyTopic ? h('div', { class: 'small muted' }, `ntfy reminders on · daily at ${st.profile.reminderTime}`) : h('a', { class: 'small', href: '#/settings' }, 'Turn on ntfy phone reminders →')))),
    h('div', { class: 'grid g2', style: { marginTop: '12px' } },
      card('This week', weekBoard([
        { label: 'Math', test: x => x && x.req.math }, { label: 'AP', test: x => x && x.req.ap },
        { label: 'Review', test: x => x && x.areas.review }, { label: 'Finance', test: x => x && (x.areas.finance || x.areas.deca) }, { label: 'Speak', test: x => x && x.areas.speak },
      ])),
      card('Calendar', calWrap())),
    card('Activity · 26 weeks', heatmap(26), { cls: '' }),
    tips.length ? card('A tip you saved', h('p', {}, tips[0].text)) : null,
    !hasAI() ? card('Unlock Claude features', h('p', { class: 'small' }, 'Add your Claude API key in Settings for FRQ grading, DECA judging, speech analysis and unlimited generated practice.')) : null,
  );
  const dispose = skyline(sky, scoreSeries(30).map(p => p.y));
  const orbBox = h('div', { class: 'orb' }); scoreRing.prepend(orbBox);
  const disposeOrb = orb(orbBox, score);
  return () => { dispose(); disposeOrb(); };
}

const kpi = (l, v, s) => h('div', { class: 'kpi' }, h('div', { class: 'kpi-l' }, l), h('div', { class: 'kpi-v' }, v), h('div', { class: 'kpi-s' }, s));

function calWrap() {
  let off = 0;
  const box = h('div');
  const draw = () => { box.innerHTML = ''; box.append(h('div', { class: 'row between', style: { marginBottom: '6px' } }, h('button', { class: 'btn sm ghost', onclick: () => { off--; draw(); } }, '‹'), h('button', { class: 'btn sm ghost', onclick: () => { off++; draw(); } }, '›')), calendar(off, showDay)); };
  draw();
  return box;
}
function showDay(k) {
  const d = S().days[k];
  const ev = S().events.filter(e => e.date === k);
  modal(h('div', { class: 'stack' }, h('h2', {}, new Date(k + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })),
    d ? h('div', { class: 'kpis' }, kpi('Time', fmtMin(d.ms), ''), kpi('Questions', d.q, ''), kpi('Accuracy', d.q ? pct(d.correct / d.q) : '-', ''), kpi('Score', paceScore(k), '')) : h('p', { class: 'muted' }, 'No study logged.'),
    d ? h('div', { class: 'pill-row' }, ...Object.entries(d.areas).map(([a, m]) => h('span', { class: 'chip' }, `${COURSE[a]?.short || a} · ${m}m`))) : null,
    ev.length ? h('div', {}, h('h4', {}, 'Due'), ...ev.map(e => h('p', {}, `${e.kind}: ${e.title}`))) : null));
}
