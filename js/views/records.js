// Records: progress graphs, speed PRs, score highs, streaks & volume, and a PR feed.
import { S, today, addDays, weekStart, weekCount, dayActive, paceScore } from '../store.js';
import { h, card, svg, fmtMs, fmtMin, pct, lineChart, seg } from '../ui.js';
import { SKILLS, SKILL } from '../math/skills.js';
import { PACKS } from '../math/scenarios.js';
import { COURSE, byPriority } from '../data/courses.js';
import { sk } from './sprint.js';
import * as fx from '../fx.js';

function barChart(vals, { height = 110, labelEvery = 7, fmt = v => v } = {}) {
  const W = 320, H = height, n = vals.length, max = Math.max(1, ...vals.map(v => v.y));
  const bw = W / n;
  const el = svg('svg', { viewBox: `0 0 ${W} ${H + 14}`, class: 'linechart', style: `height:${height + 14}px`, preserveAspectRatio: 'none' },
    ...vals.map((v, i) => { const bh = (v.y / max) * H; return svg('rect', { x: i * bw + 1, y: H - bh, width: Math.max(1, bw - 2), height: Math.max(v.y ? 2 : 0, bh), rx: 2, fill: v.today ? 'var(--accent)' : 'var(--h3)', class: 'rbar' }); }));
  requestAnimationFrame(() => { if (window.gsap) gsap.from(el.querySelectorAll('.rbar'), { scaleY: 0, transformOrigin: 'bottom', duration: 0.6, stagger: 0.012, ease: 'power3.out' }); });
  return el;
}

function series(n, f) { return Array.from({ length: n }, (_, i) => { const k = addDays(today(), i - n + 1); return { x: k, y: f(S().days[k], k), today: k === today() }; }); }

function longestWeekStreak() {
  const goal = S().profile.weeklyGoal;
  const keys = Object.keys(S().days).sort();
  if (!keys.length) return 0;
  let ws = weekStart(keys[0]), best = 0, cur = 0;
  while (ws <= today()) { if (weekCount(ws) >= goal) { cur++; best = Math.max(best, cur); } else if (ws !== weekStart()) cur = 0; ws = addDays(ws, 7); }
  return best;
}
function longestDayRun() {
  const keys = Object.keys(S().days).filter(k => dayActive(S().days[k])).sort();
  let best = 0, cur = 0, prev = null;
  for (const k of keys) { cur = prev && addDays(prev, 1) === k ? cur + 1 : 1; best = Math.max(best, cur); prev = k; }
  return best;
}

export function render(root) {
  const st = S();
  const days = Object.values(st.days);
  const totQ = days.reduce((a, d) => a + d.q, 0), totC = days.reduce((a, d) => a + d.correct, 0), totMs = days.reduce((a, d) => a + d.ms, 0);
  const activeDays = days.filter(dayActive).length;
  let range = st.recRange || 30;

  const graphs = h('div', { class: 'grid g2' });
  const drawGraphs = () => {
    graphs.innerHTML = '';
    const mins = series(range, d => d ? Math.round(d.ms / 60000) : 0);
    const acc = series(range, d => (d && d.q ? Math.round(d.correct / d.q * 100) : 0));
    const rt = series(range, d => (d && d.q ? d.rt / d.q / 1000 : 0));
    const rtMax = Math.max(5, ...rt.map(p => p.y));
    graphs.append(
      card(`Minutes studied · ${range} days`, h('div', {}, barChart(mins), h('div', { class: 'small muted' }, `${fmtMin(mins.reduce((a, p) => a + p.y, 0) * 60000)} total`))),
      card('Pace Score', lineChart(series(range, (d, k) => paceScore(k)), { max: 100 })),
      card('Accuracy %', lineChart(acc, { max: 100 })),
      card('Avg response time (s, lower is better)', h('div', {}, lineChart(rt, { max: rtMax }), h('div', { class: 'small muted' }, `scale 0-${rtMax.toFixed(1)}s`))));
    fx.stagger([...graphs.children]);
  };
  drawGraphs();

  // per-skill speed history
  let skillId = st.recSkill || SKILLS[0].id;
  const skillBox = h('div');
  const drawSkill = () => {
    skillBox.innerHTML = '';
    const rounds = sk(skillId).rounds.filter(r => r.med < 60000).slice(-30);
    const target = SKILL[skillId].targets[sk(skillId).level - 1];
    if (rounds.length < 2) { skillBox.append(h('p', { class: 'empty' }, 'Do a few rounds of this skill to see your speed trend.')); return; }
    const max = Math.max(target * 1.5, ...rounds.map(r => r.med));
    skillBox.append(lineChart(rounds.map(r => ({ y: r.med })), { max }), h('div', { class: 'small muted' }, `Median per round (last ${rounds.length}). Current target ${fmtMs(target)} at L${sk(skillId).level}. Lower is faster.`));
  };
  const sel = h('select', { class: 'input', style: { width: 'auto' } }, ...SKILLS.map(s => h('option', { value: s.id, selected: s.id === skillId }, s.name)));
  sel.onchange = () => { skillId = st.recSkill = sel.value; drawSkill(); };
  drawSkill();

  // readiness climb
  const rl = st.readinessLog || {};
  const rKeys = Object.keys(rl).sort().slice(-60);
  const apCourses = byPriority().filter(c => c.ap).slice(0, 3);

  const speedPRs = SKILLS.flatMap(s => Object.entries(sk(s.id).best || {}).map(([L, ms]) => ({ s, L: +L, ms }))).sort((a, b) => b.L - a.L || a.ms - b.ms).slice(0, 12);
  const fast = st.fastRound || {};
  const frqBest = {};
  (st.frqLog || []).forEach(f => { const k = `${f.course}·${f.kind}`; if (!frqBest[k] || f.earned / f.max > frqBest[k].earned / frqBest[k].max) frqBest[k] = f; });
  const rpBest = (st.roleplays || []).reduce((b, r) => (!b || r.total / r.max > b.total / b.max ? r : b), null);
  const memoBest = Object.values(st.memos || {}).reduce((b, m) => Math.max(b, m.overall), 0);
  const speakBest = st.speak.filter(s => s.ai).reduce((b, s) => Math.max(b, Object.values(s.ai.scores).reduce((a, x) => a + x, 0) / 7), 0);

  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/', class: 'muted small' }, '← Dashboard'), h('h1', {}, 'Records'), h('div', { class: 'sub' }, 'Your progress, PRs and highs.')),
      seg([{ label: '30d', value: 30 }, { label: '90d', value: 90 }], range, v => { range = st.recRange = v; drawGraphs(); })),
    h('div', { class: 'kpis', style: { marginBottom: '12px' } },
      kpi('Longest streak', `${longestWeekStreak()} wk`, `${longestDayRun()}-day best run`),
      kpi('Questions', totQ.toLocaleString(), totQ ? `${pct(totC / totQ)} correct` : ''),
      kpi('Time studied', fmtMin(totMs), `${activeDays} active days`),
      kpi('Sprint rank', SKILLS.reduce((a, s) => a + sk(s.id).level, 0), `of ${SKILLS.length * 8}`)),
    graphs,
    h('div', { class: 'grid g2', style: { marginTop: '12px' } },
      card('Speed trend by skill', h('div', { class: 'stack' }, sel, skillBox)),
      card('Readiness climb', rKeys.length < 2 ? h('p', { class: 'empty' }, 'Readiness is recorded once a day - check back tomorrow.') :
        h('div', { class: 'stack' }, ...apCourses.map(c => h('div', {}, h('div', { class: 'small', style: { fontWeight: 600 } }, `${c.short} · ${pct((rl[rKeys[rKeys.length - 1]] || {})[c.id] || 0)}`), lineChart(rKeys.map(k => ({ y: Math.round(((rl[k] || {})[c.id] || 0) * 100) })), { max: 100, height: 60 })))))),
    h('div', { class: 'grid g2', style: { marginTop: '12px' } },
      card('Speed PRs', speedPRs.length ? h('div', { class: 'feedback-rows' }, ...speedPRs.map(p => h('div', { class: 'row between' }, h('span', {}, `${p.s.name} · L${p.L}`), h('b', { class: 'num' }, fmtMs(p.ms)))),
        ...Object.entries(fast).map(([k, ms]) => h('div', { class: 'row between' }, h('span', {}, `Fastest clean ${k.replace('sprint-', '').replace('-', ' ')} round`), h('b', { class: 'num' }, `${Math.round(ms / 1000)}s`))),
        ...PACKS.filter(p => (st.scenBest || {})[p.id]).map(p => h('div', { class: 'row between' }, h('span', {}, p.name), h('b', { class: 'num' }, `${pct(st.scenBest[p.id].acc)} · ${fmtMs(st.scenBest[p.id].med)}`)))) : h('p', { class: 'empty' }, 'Pass a level test with 90%+ to set your first speed PR.')),
      card('Score highs', h('div', { class: 'feedback-rows' },
        ...Object.entries(frqBest).map(([k, f]) => h('div', { class: 'row between' }, h('span', {}, `${COURSE[f.course]?.short || f.course} ${f.kind}`), h('b', {}, `${f.earned}/${f.max}`))),
        rpBest ? h('div', { class: 'row between' }, h('span', {}, 'DECA roleplay'), h('b', {}, `${rpBest.total}/${rpBest.max}`)) : null,
        memoBest ? h('div', { class: 'row between' }, h('span', {}, 'Case memo'), h('b', {}, `${memoBest}/10`)) : null,
        speakBest ? h('div', { class: 'row between' }, h('span', {}, 'Speak articulation'), h('b', {}, `${speakBest.toFixed(1)}/10`)) : null,
        !Object.keys(frqBest).length && !rpBest && !memoBest && !speakBest ? h('p', { class: 'empty' }, 'Graded FRQs, roleplays, memos and Speak sessions show up here.') : null))),
    card('Feed', (st.records || []).length ? h('div', { class: 'feedback-rows' }, ...(st.records || []).slice(0, 40).map(r => h('div', { class: 'row between' },
      h('span', {}, h('span', { class: `chip ${r.kind === 'speed' ? 'acc' : r.kind === 'score' ? 'good' : r.kind === 'level' ? 'gold' : ''}`, style: { marginRight: '8px' } }, r.kind), r.text),
      h('span', { class: 'small muted' }, new Date(r.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))))) : h('p', { class: 'empty' }, 'PRs, level-ups and high scores will stack up here.')));
  return () => {};
}
const kpi = (l, v, s) => h('div', { class: 'kpi' }, h('div', { class: 'kpi-l' }, l), h('div', { class: 'kpi-v' }, v), h('div', { class: 'kpi-s' }, s));
