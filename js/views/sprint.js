// Math Sprint: skill levels, timed rounds, and the accuracy + speed gate.
import { S, save, addRecord, autoLog } from '../store.js';
import { h, card, bar, fmtMs, pct, modal, seg, md, shuffle, pick, toast } from '../ui.js';
import { SKILLS, SKILL, GROUPS, makeQ, evaluateRound, fmtAns } from '../math/skills.js';
import { startRound, onRoundFinish, relevantTips } from '../quiz.js';
import * as fx from '../fx.js';
import { bgLevel } from '../three-bg.js';
import { PACKS, PACK, scenarioQ } from '../math/scenarios.js';

export const sk = id => (S().skills[id] ||= { level: 1, rounds: [], gate: null, best: {} });
const prefs = () => (S().sprintPrefs ||= { mode: 'mixed', len: 10 });

export function gatedSkills() { return SKILLS.filter(s => sk(s.id).gate); }

export function dailyQuestions(len = 12) {
  const mode = prefs().mode;
  const gated = gatedSkills();
  const order = SKILLS.map(s => ({ s, L: sk(s.id).level, acc: recentAcc(s.id) })).sort((a, b) => a.acc - b.acc || a.L - b.L);
  const picks = [];
  if (gated.length) for (let i = 0; i < Math.ceil(len / 2); i++) picks.push(gated[i % gated.length].id);
  const weak = order.slice(0, 2).map(o => o.s.id);
  while (picks.length < Math.ceil(len * 0.75)) picks.push(weak[picks.length % weak.length]);
  while (picks.length < len) picks.push(pick(SKILLS).id); // interleave everything else
  return shuffle(picks).map(id => makeQ(id, sk(id).level, mode));
}
function recentAcc(id) {
  const r = sk(id).rounds.slice(-3);
  return r.length ? r.reduce((a, x) => a + x.acc, 0) / r.length : 0.5;
}
const medianTarget = qs => { const t = qs.map(q => SKILL[q.skill].targets[q.level - 1]).sort((a, b) => a - b); return t[t.length >> 1]; };

export function startDaily() {
  const qs = dailyQuestions(12);
  startRound({ kind: 'sprint-daily', title: "Today's Sprint", questions: qs, target: medianTarget(qs), area: 'math', req: 'math', tags: ['math', ...new Set(qs.map(q => q.skill))] });
}
function startTest(id) {
  const L = sk(id).level;
  startRound({ kind: 'sprint-test', meta: { skill: id, level: L }, title: `${SKILL[id].name} · Level ${L} test`, questions: Array.from({ length: prefs().len }, () => makeQ(id, L, prefs().mode)), target: SKILL[id].targets[L - 1], area: 'math', req: 'math', tags: ['math', id] });
}
function startDrill(id) {
  const s = sk(id), L = s.level, g = s.gate;
  // Speed drills: same level, slightly easier mix + timer pressure. Accuracy drills: one level down warm-up then current level.
  const qs = Array.from({ length: 12 }, (_, i) => makeQ(id, g && g.type === 'accuracy' && i < 4 ? Math.max(1, L - 1) : L, g && g.type === 'accuracy' ? 'free' : prefs().mode));
  startRound({ kind: 'sprint-drill', meta: { skill: id, level: L }, title: `${SKILL[id].name} · ${g && g.type === 'speed' ? 'Speed' : 'Accuracy'} drill`, questions: qs, target: SKILL[id].targets[L - 1], area: 'math', req: 'math', tags: ['math', id] });
}

onRoundFinish('sprint-test', res => {
  const { skill: id, level: L } = res.meta;
  const s = sk(id);
  const ev = evaluateRound(id, L, res.acc, res.med);
  s.rounds.push({ acc: res.acc, med: res.med, ts: Date.now(), level: L, test: true });
  const pb = s.best[L];
  if (res.acc >= 0.9 && (!pb || res.med < pb)) { s.best[L] = res.med; addRecord('speed', `${SKILL[id].name} L${L}: ${fmtMs(res.med)} median`, res.med); if (pb) setTimeout(() => toast(`Personal best: ${fmtMs(res.med)} median at L${L}`, 'good'), 2300); }
  if (ev.result === 'advance') {
    s.gate = null;
    if (L < 8) s.level = L + 1;
    addRecord('level', `${SKILL[id].name} reached Level ${Math.min(8, L + 1)}`, L + 1);
    save();
    location.hash = '#/sprint';
    setTimeout(() => fx.levelUp(L < 8 ? `${SKILL[id].name} → Level ${L + 1}` : `${SKILL[id].name} mastered`, `${pct(res.acc)} at ${fmtMs(res.med)} median (target ${fmtMs(ev.target)})`), 450);
    bgLevel(Math.min(1, totalLevel() / 60));
  } else {
    autoLog('strategy', `${SKILL[id].name}: ${SKILL[id].lesson}`, ['math', id], 'gate:' + id);
    s.gate = { type: ev.result, target: ev.target, acc: res.acc, med: res.med, step: 'example', ts: Date.now(), level: L };
    save();
    location.hash = `#/sprint/gate/${id}`;
  }
});
onRoundFinish('sprint-drill', res => {
  const { skill: id } = res.meta;
  const s = sk(id);
  s.rounds.push({ acc: res.acc, med: res.med, ts: Date.now(), level: res.meta.level, drill: true });
  if (s.gate) { s.gate.step = 'retest'; s.gate.lastDrill = { acc: res.acc, med: res.med }; }
  save();
  location.hash = `#/sprint/gate/${id}`;
});
onRoundFinish('sprint-daily', res => {
  // per-skill accuracy bookkeeping (no level changes from mixed rounds)
  const by = {};
  res.questions.forEach((q, i) => { (by[q.skill] ||= []).push(res.answers[i]); });
  for (const [id, a] of Object.entries(by)) {
    const ok = a.filter(x => x.ok);
    sk(id).rounds.push({ acc: ok.length / a.length, med: ok.length ? ok.map(x => x.ms).sort((x, y) => x - y)[ok.length >> 1] : 99999, ts: Date.now(), level: sk(id).level, mixed: true });
  }
  save();
  location.hash = '#/';
  if (res.acc === 1) setTimeout(() => toast('Clean sprint. 12 for 12.', 'good'), 500);
});

function startScenario(id) {
  startRound({ kind: 'scenario', meta: { pack: id }, title: PACK[id].name, questions: Array.from({ length: 8 }, () => scenarioQ(id)), target: 30000, area: 'math', req: 'math', tags: ['math', 'scen', id] });
}
onRoundFinish('scenario', res => {
  const best = (S().scenBest ||= {})[res.meta.pack];
  if (!best || res.acc > best.acc || (res.acc === best.acc && res.med < best.med)) { S().scenBest[res.meta.pack] = { acc: res.acc, med: res.med, ts: Date.now() }; addRecord('speed', `${PACK[res.meta.pack].name}: ${pct(res.acc)} at ${fmtMs(res.med)}`, res.med); if (best) setTimeout(() => toast(`New best on ${PACK[res.meta.pack].name}`, 'good'), 500); }
  save(); location.hash = '#/sprint';
});

export const totalLevel = () => SKILLS.reduce((a, s) => a + sk(s.id).level, 0);

export function render(root, params) {
  if (params[0] === 'gate') return renderGate(root, params[1]);
  const p = prefs();
  const gated = gatedSkills();
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Math Sprint'), h('div', { class: 'sub' }, `Sprint rank ${totalLevel()} / ${SKILLS.length * 8} · advance = 90% accuracy + speed target`))),
    gated.length ? h('div', { class: 'stack', style: { marginBottom: '12px' } }, ...gated.map(gateCard)) : null,
    h('div', { class: 'grid g2' },
      card("Today's Sprint", h('div', { class: 'stack' },
        h('p', { class: 'muted' }, gated.length ? `12 questions: half target ${gated.map(g => g.name).join(', ')}, the rest mixed from all skills.` : '12 mixed questions weighted to your two weakest skills, interleaved with everything else.'),
        h('button', { class: 'btn primary wide', onclick: startDaily }, 'Start · about 2 min'))),
      card('Round settings', h('div', { class: 'stack' },
        h('div', { class: 'row between' }, h('span', {}, 'Answer style'), seg([{ label: 'Keypad', value: 'free' }, { label: 'Mixed', value: 'mixed' }, { label: 'Choices', value: 'mc' }], p.mode, v => { p.mode = v; save(); })),
        h('div', { class: 'row between' }, h('span', {}, 'Level-test length'), seg([{ label: '10', value: 10 }, { label: '15', value: 15 }, { label: '20', value: 20 }], p.len, v => { p.len = v; save(); })),
        h('p', { class: 'small muted' }, 'Keyboard works too: type the number, Enter to submit, 1-4 for choices.')))),
    h('h3', { class: 'muted', style: { margin: '20px 4px 10px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.07em' } }, 'Real-life scenarios'),
    h('div', { class: 'grid g2' }, ...PACKS.map(p => { const b = (S().scenBest || {})[p.id]; return h('button', { class: 'tile', onclick: () => startScenario(p.id) },
      h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic' }, p.icon), b ? h('span', { class: 'chip good' }, `best ${pct(b.acc)} · ${fmtMs(b.med)}`) : h('span', { class: 'chip' }, '8 questions')),
      h('h4', {}, p.name), h('div', { class: 'muted' }, p.desc)); })),
    ...GROUPS.map(g => h('div', {},
      h('h3', { class: 'muted', style: { margin: '20px 4px 10px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.07em' } }, g),
      h('div', { class: 'grid g3' }, ...SKILLS.filter(s => s.group === g).map(skillTile)))));
}

function skillTile(s) {
  const st = sk(s.id), L = st.level;
  const last = st.rounds.filter(r => r.level === L).slice(-1)[0];
  const target = s.targets[L - 1];
  const prog = last ? Math.min(1, (Math.min(1, last.acc / 0.9) * 0.5 + Math.min(1, target / Math.max(1, last.med)) * 0.5)) : 0;
  return h('button', { class: 'tile', onclick: () => skillSheet(s) },
    h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic' }, s.icon), st.gate ? h('span', { class: 'chip gold' }, st.gate.type === 'speed' ? 'Speed drill' : 'Accuracy drill') : h('span', { class: 'chip acc' }, `L${L}`)),
    h('h4', {}, s.name),
    h('div', { class: 'muted' }, `Target ${fmtMs(target)} · ${st.best[L] ? 'PB ' + fmtMs(st.best[L]) : 'no PB yet'}`),
    h('div', { style: { marginTop: '10px' } }, bar(prog, { cls: st.gate ? 'gold' : '' })));
}

function skillSheet(s) {
  const st = sk(s.id), L = st.level;
  const ex = makeQ(s.id, L, 'free');
  const close = modal(h('div', { class: 'stack' },
    h('div', { class: 'row between' }, h('h2', {}, s.name), h('span', { class: 'chip acc' }, `Level ${L} of 8`)),
    h('p', { html: md(s.lesson) }),
    h('div', { class: 'card flat' }, h('div', { class: 'small muted' }, 'Example at this level'), h('div', { style: { font: '700 20px var(--num)', margin: '4px 0' } }, ex.q),
      h('ol', { class: 'list-plain small' }, ...ex.steps.map(x => h('li', {}, x))), h('div', { class: 'small' }, 'Answer: ', h('b', {}, fmtAns(ex)))),
    h('div', { class: 'small muted' }, `To advance: ≥ 90% correct and median ≤ ${fmtMs(s.targets[L - 1])} per question.`),
    h('div', { class: 'row' },
      h('button', { class: 'btn primary', onclick: () => { close(); startTest(s.id); } }, `Level ${L} test`),
      h('button', { class: 'btn', onclick: () => { close(); startDrill(s.id); } }, 'Practice drill'),
      h('a', { class: 'btn ghost', href: `#/learn/math/${s.id}`, onclick: () => close() }, 'Learn the why'))));
}

function gateCard(s) {
  const g = sk(s.id).gate;
  return h('section', { class: 'card gate' },
    h('div', { class: 'row between' }, h('h3', {}, `${s.name} L${g.level}: ${g.type === 'speed' ? 'accurate, not fast yet' : 'accuracy first'}`), h('a', { class: 'btn sm primary', href: `#/sprint/gate/${s.id}` }, g.step === 'retest' ? 'Retest' : 'Continue')),
    h('div', { class: 'small', style: { marginTop: '6px' } }, gateLine(g)));
}
function gateLine(g) {
  return g.type === 'speed'
    ? `Accuracy ${pct(g.acc)} ✓ · median ${fmtMs(g.med)} vs target ${fmtMs(g.target)} - ${fmtMs(g.med - g.target)} to cut.`
    : `Accuracy ${pct(g.acc)} (need 90%) · speed comes after accuracy is reliable.`;
}

function renderGate(root, id) {
  const s = SKILL[id], st = sk(id), g = st.gate;
  if (!g) { location.hash = '#/sprint'; return; }
  const ex = makeQ(id, g.level, 'free');
  const steps = ex.steps.map((x, i) => h('div', { class: `worked-step${i ? ' hidden-step' : ''}` }, h('span', { class: 'ws-n' }, i + 1), h('div', {}, x)));
  let shown = 1;
  const tips = relevantTips([id]);
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/sprint', class: 'muted small' }, '← Sprint'), h('h1', {}, `${s.name} · Level ${g.level}`), h('div', { class: 'sub' }, 'Not advancing yet - here is exactly what to fix.'))),
    h('div', { class: 'lesson-step gate' },
      h('h3', {}, 'What needs to improve'),
      h('div', { class: 'grid g2' },
        h('div', {}, h('div', { class: 'small muted' }, 'Accuracy'), h('div', { class: 'kpi-v' }, pct(g.acc)), bar(g.acc / 0.9, { cls: g.acc >= 0.9 ? 'good' : 'bad' }), h('div', { class: 'small muted' }, 'need 90%')),
        h('div', {}, h('div', { class: 'small muted' }, 'Median speed'), h('div', { class: 'kpi-v' }, fmtMs(g.med)), bar(Math.min(1, g.target / g.med), { cls: g.med <= g.target ? 'good' : 'gold' }), h('div', { class: 'small muted' }, `target ${fmtMs(g.target)}`))),
      g.lastDrill ? h('p', { class: 'small', style: { marginTop: '10px' } }, `Last drill: ${pct(g.lastDrill.acc)} at ${fmtMs(g.lastDrill.med)}.`) : null),
    h('div', { class: 'lesson-step' },
      h('h3', {}, g.type === 'speed' ? 'The faster way' : 'The method'),
      h('p', { html: md(s.lesson) }),
      g.type === 'speed' ? h('p', { class: 'small muted' }, 'Speed comes from doing fewer steps, not rushing the same steps. Use the shortcut below on every drill question - say the steps in your head.') : h('p', { class: 'small muted' }, 'Slow down and get every one right. Your drill starts with a few easier warm-ups.')),
    h('div', { class: 'lesson-step' },
      h('h3', {}, 'Worked example'),
      h('div', { style: { font: '700 22px var(--num)', marginBottom: '8px' } }, ex.q),
      ...steps,
      h('div', { class: 'row', style: { marginTop: '10px' } },
        h('button', { class: 'btn sm', onclick: e => { if (shown < steps.length) { steps[shown].classList.remove('hidden-step'); fx.pop(steps[shown]); shown++; } if (shown >= steps.length) { e.currentTarget.textContent = `Answer: ${fmtAns(ex)}`; } } }, 'Next step'))),
    tips.length ? h('div', { class: 'lesson-step' }, h('h3', {}, 'From your Log'), ...tips.map(t => h('p', {}, t.text))) : null,
    h('div', { class: 'lesson-step' },
      h('h3', {}, 'Plan'),
      h('ol', {}, h('li', { class: g.step !== 'example' ? 'muted' : '' }, 'Read the example (done when you tap through it)'), h('li', { class: g.step === 'retest' ? 'muted' : '' }, `Drill: 12 targeted questions${g.type === 'speed' ? ' with the timer' : ''}`), h('li', {}, 'Retest the level')),
      h('div', { class: 'row', style: { marginTop: '10px' } },
        h('button', { class: `btn ${g.step !== 'retest' ? 'primary' : ''}`, onclick: () => { g.step = 'drill'; save(); startDrill(id); } }, g.step === 'retest' ? 'Drill again' : 'Start drill'),
        h('button', { class: `btn ${g.step === 'retest' ? 'primary' : 'ghost'}`, onclick: () => startTest(id) }, 'Retest level')))));
}
