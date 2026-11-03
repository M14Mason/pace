// Round engine v2 - designed to keep practice challenging but never infuriating.
// Research basis (see docs/DESIGN.md):
//  - ~85% success is the sweet spot -> difficulty adapts inside the round.
//  - Wrong answers get immediate, elaborated feedback ("here's how"), not a
//    retry loop. The missed idea comes back once later in the round (spaced).
//  - Hints are on demand (try first, then ask). No penalties, no red, no buzzer.
//  - You can save & exit at any time. The clock is measured, not shown.
//  - Tricks are taught the first time you meet a skill; after that a one-line
//    trick chip sits on every question (tap to expand).
import { S, save, recordActivity, markQ, srsReview, recordSpeed, autoLog } from './store.js';
import { h, $, fmtMs, pct, shuffle, md, toast } from './ui.js';
import * as fx from './fx.js';
import { check as mathCheck, fmtAns, makeQ, SKILL } from './math/skills.js';
import { cardsFromRepeatedMisses } from './views/cards.js';
import { TRICKS } from './data/tricks.js';
import { READINGS } from './data/readings/index.js';
import { COURSE } from './data/courses.js';
import { recordMathAnswer } from './mastery.js';

const finishers = {};
export const onRoundFinish = (kind, fn) => (finishers[kind] = fn);

export function fromBank(b, key) {
  return { key, q: b.q, choices: shuffle(b.c), a: b.c[b.a], mc: true, hints: b.h || [], steps: [b.e], explain: b.e, tags: b.tags };
}

const median = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const isRight = (q, input) => (q.mc ? String(input) === String(q.a) : mathCheck(q, input));
const answerText = q => (q.mc ? q.a : fmtAns(q));
const trickKey = q => { const k = q.key || ''; if (k.startsWith('scen:') || k.startsWith('fact:')) return k.split(':').slice(0, 2).join(':'); return q.skill && TRICKS[q.skill] ? q.skill : null; };
const unitKey = q => { const m = (q.key || '').match(/^[qga]:([^/]+)\/([^/]+)\//); return m ? `${m[1]}/${m[2]}` : null; };

// Full teaching card only for skills/units you haven't been taught yet.
function buildCoach(questions) {
  const taught = (S().taught ||= {});
  const out = [];
  const tk = [...new Set(questions.map(trickKey).filter(Boolean))];
  for (const k of tk) if (!taught[k]) { const t = TRICKS[k]; out.push({ key: k, title: t.title, tricks: t.tricks.slice(0, 3), trap: t.traps[0] }); }
  for (const uk of [...new Set(questions.map(unitKey).filter(Boolean))]) {
    if (taught[uk]) continue;
    const r = READINGS[uk]; if (!r) continue;
    const [cid, uid] = uk.split('/'); const c = COURSE[cid]; const u = c && c.units.find(x => x.id === uid);
    out.push({ key: uk, title: c ? `${c.short} · ${u ? u.t : ''}` : 'Before you start', tips: [...Object.values(r.notes || {}), ...r.recap].slice(0, 4) });
  }
  return out.slice(0, 3);
}

export function startRound(opts) {
  const coach = opts.coach === false ? [] : buildCoach(opts.questions);
  S().activeRound = {
    v: 2, kind: opts.kind, meta: opts.meta || {}, title: opts.title, area: opts.area || 'math', req: opts.req || null,
    target: opts.target || 0, tags: opts.tags || [],
    questions: opts.questions, coach, stage: coach.length ? 'coach' : 'answer', i: 0, answers: [], started: Date.now(), levelUps: [],
  };
  save();
  location.hash = '#/round';
}

export function renderRound(root) {
  const R = S().activeRound;
  if (!R) { location.hash = '#/'; return; }
  if (R.v !== 2) { R.v = 2; R.stage = R.i >= R.questions.length ? 'summary' : 'answer'; R.answers = (R.answers || []).map((a, qi) => ({ ...a, qi })); R.levelUps = []; }
  document.body.classList.add('in-round');
  root.innerHTML = '';

  const exit = () => { save(); document.body.classList.remove('in-round'); location.hash = R.meta.back || (R.kind.startsWith('session') ? '#/' : '#/'); toast('Saved - pick up where you left off anytime'); };
  const top = h('div', { class: 'round-top' },
    h('button', { class: 'icon-btn', title: 'Save & exit', onclick: exit }, '✕'),
    h('div', { class: 'round-title' }, R.title),
    h('div', { class: 'round-count', id: 'rcount' }, ''));
  const bar = h('div', { class: 'round-progress' }, h('div', { class: 'round-progress-fill' }));
  const stage = h('div', { class: 'round-stage' });
  root.append(h('div', { class: 'round' }, top, bar, stage));
  const setProgress = () => {
    const done = R.answers.length, total = R.questions.length;
    bar.firstChild.style.width = `${Math.round(done / Math.max(1, total) * 100)}%`;
    const c = $('#rcount'); if (c) c.textContent = `${Math.min(done + 1, total)}/${total}`;
  };

  if (R.stage === 'coach') coachStage();
  else if (R.stage === 'summary') summaryStage();
  else answerStage();

  function coachStage() {
    stage.innerHTML = '';
    const taught = (S().taught ||= {});
    const cards = R.coach.map(sec => h('div', { class: 'coach-card' },
      h('div', { class: 'coach-title' }, sec.title),
      ...(sec.tricks || []).map(([name, how, ex]) => {
        autoLog('strategy', `${sec.title} - ${name}: ${how}\nEx: ${ex.replace(/\*\*/g, '')}`, [...(R.tags || []), sec.key.replace(/^(scen|fact):/, '')], 'trick:' + sec.key + name);
        return h('div', { class: 'coach-trick' }, h('div', { class: 'coach-name' }, '⚡ ', name), h('div', { html: md(how) }), h('div', { class: 'coach-ex', html: md(ex) }));
      }),
      ...(sec.tips || []).map(t => h('div', { class: 'coach-trick' }, h('div', { html: md('💡 ' + t) }))),
      sec.trap ? h('div', { class: 'coach-trap', html: md('Watch out: ' + sec.trap) }) : null));
    const go = () => { R.coach.forEach(s => (taught[s.key] = Date.now())); R.stage = 'answer'; R.started = Date.now(); save(); answerStage(); };
    stage.append(
      h('div', { class: 'coach-head' }, h('div', { class: 'eyebrow' }, 'NEW FOR YOU'), h('h2', {}, 'Quick lesson first')),
      ...cards,
      h('button', { class: 'btn primary wide big', style: { marginTop: 'auto' }, onclick: go }, 'Got it - let\'s go'));
    fx.stagger([...stage.querySelectorAll('.coach-card')]);
    bindKeys(e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  }

  // Adapt: after 2 quick right answers on a skill, the next one of that skill goes up a level;
  // after a miss it comes down a level. Keeps you near the ~85% sweet spot.
  function adapt(q, ok, ms) {
    if (!q.skill || !SKILL[q.skill]) return;
    const hist = R.answers.filter(a => R.questions[a.qi].skill === q.skill && !a.retry);
    const last2 = hist.slice(-2);
    const target = SKILL[q.skill].targets[q.level - 1];
    let delta = 0;
    if (!ok) delta = -1;
    else if (last2.length === 2 && last2.every(a => a.ok && a.ms <= target * 1.2)) delta = 1;
    if (!delta) return;
    const nextIdx = R.questions.findIndex((x, k) => k > R.i && x.skill === q.skill && !x._retry);
    if (nextIdx < 0) return;
    const L = Math.max(1, Math.min(8, q.level + delta));
    if (L === R.questions[nextIdx].level) return;
    R.questions[nextIdx] = makeQ(q.skill, L, R.questions[nextIdx].mc ? 'mc' : 'free');
  }

  function trickChip(q) {
    const k = trickKey(q); const t = k && TRICKS[k];
    if (!t) return null;
    // easy levels get the basic trick; harder levels rotate through the rest
    const pool = (q.level || 1) <= 3 ? t.tricks.slice(0, 2) : t.tricks.slice(1);
    const tr = pool[R.i % pool.length];
    const body = h('div', { class: 'trick-body', hidden: true }, h('div', { html: md(tr[1]) }), h('div', { class: 'coach-ex', html: md(tr[2]) }));
    return h('button', { class: 'trick-chip', onclick: e => { body.hidden = !body.hidden; e.currentTarget.classList.toggle('open'); } }, h('span', {}, `⚡ Trick: ${tr[0]}`), body);
  }

  function answerStage() {
    setProgress();
    if (R.i >= R.questions.length) { R.stage = 'summary'; save(); return summaryStage(); }
    const q = R.questions[R.i];
    const t0 = performance.now();
    let locked = false, hintsShown = 0;
    stage.innerHTML = '';
    const prompt = h('div', { class: `q-prompt${q.mc && q.q.length > 60 ? ' long' : ''}`, html: md(q.q) });
    const hintBox = h('div', { class: 'hints' });
    const hintBtn = (q.hints && q.hints.length) ? h('button', { class: 'hint-btn', onclick: () => {
      if (hintsShown >= q.hints.length) return;
      hintBox.append(h('div', { class: 'hint' }, h('b', {}, hintsShown ? 'Next step' : 'Hint'), ' ', h('span', { html: md(q.hints[hintsShown]) })));
      hintsShown++; fx.pop(hintBox.lastChild);
      if (hintsShown >= q.hints.length) hintBtn.remove(); else hintBtn.textContent = '💡 Another hint';
    } }, '💡 Hint') : null;
    const card = h('div', { class: `qcard${q.mc ? ' text' : ''}` }, q._retry ? h('div', { class: 'retry-tag' }, 'Second chance') : null, prompt);
    stage.append(trickChip(q), card, hintBox);
    fx.pop(prompt);

    const submit = val => {
      if (locked || val === '' || val == null) return;
      locked = true;
      const ms = performance.now() - t0;
      const ok = val !== '?' && isRight(q, val);
      const entry = { qi: R.i, ok, ms, given: val === '?' ? 'skipped' : String(val), hinted: hintsShown > 0, retry: !!q._retry };
      R.answers.push(entry);
      if (q.key && !q._retry) markQ(q.key, ok);
      if (!q._retry && !hintsShown && q.skill && q.level) { const up = recordMathAnswer(q.skill, q.level, ok, ms); if (up) { R.levelUps.push(up); fx.levelUp(`${up.name} → Level ${up.level}`, 'Leveled up from your practice'); } }
      if (!q._retry) adapt(q, ok, ms);
      save();
      if (ok) {
        if (q._note) toast(q._note, 'good');
        fx.correct(card);
        R.i++; save();
        setTimeout(answerStage, 280);
      } else {
        // Second chance later: a fresh, similar question (math) or the same one (facts).
        if (!q._retry && R.questions.filter(x => x._retry).length < 4) {
          const again = q.skill && SKILL[q.skill] ? makeQ(q.skill, Math.max(1, q.level - (hintsShown ? 0 : 1)), q.mc ? 'mc' : 'free') : { ...q, choices: q.choices ? shuffle(q.choices) : q.choices };
          again._retry = true;
          R.questions.splice(Math.min(R.questions.length, R.i + 3), 0, again);
        }
        showHow(q, val, card);
      }
    };
    const input = q.mc ? choices(q, submit) : keypad(q, submit);
    stage.append(h('div', { class: 'answer-tools' }, hintBtn, h('button', { class: 'idk', onclick: () => submit('?') }, 'Show me how')), input);
  }

  // Immediate, elaborated feedback - the most effective response to an error.
  function showHow(q, val, card) {
    fx.wrong(card);
    if (q.mc) stage.querySelectorAll('.choice').forEach(b => { const t = b.querySelector('.choice-t').textContent; if (t === String(q.a)) b.classList.add('is-answer'); else b.classList.add('dim'); });
    const steps = (q.steps || []).filter(Boolean);
    const how = h('div', { class: 'howcard' },
      h('div', { class: 'how-title' }, val === '?' ? 'Here\'s how' : 'Not quite - here\'s how'),
      h('div', { class: 'how-answer' }, 'Answer: ', h('b', {}, answerText(q))),
      steps.length ? h('ol', { class: 'how-steps' }, ...steps.map(s => h('li', { html: md(s) }))) : null,
      h('div', { class: 'small muted' }, 'A similar one comes back in a moment.'));
    const next = h('button', { class: 'btn primary wide big', onclick: () => { R.i++; save(); answerStage(); } }, 'Next →');
    stage.querySelector('.kp-wrap')?.remove();
    stage.querySelector('.answer-tools')?.remove();
    if (!q.mc) stage.append(how, next); else { stage.querySelector('.choices').after(how); stage.append(next); }
    fx.pop(how);
    bindKeys(e => { if (e.key === 'Enter') { e.preventDefault(); next.click(); } });
  }

  function summaryStage() {
    setProgress();
    stage.innerHTML = '';
    const first = R.answers.filter(a => !a.retry);
    const c = first.filter(a => a.ok).length, n = first.length;
    const acc = n ? c / n : 0;
    const recovered = R.answers.filter(a => a.retry && a.ok).length;
    const med = median(first.filter(a => a.ok).map(a => a.ms));
    R.result = { acc, med, n, c };
    const msg = acc >= 0.9 ? 'Excellent - that was sharp.' : acc >= 0.75 ? 'Solid round. Right in the learning zone.' : acc >= 0.5 ? 'Good work - the misses are exactly where the learning happens.' : 'Tough set - that\'s okay. Pace will ease the difficulty next time.';
    const missed = R.answers.filter(a => !a.ok && !a.retry).map(a => R.questions[a.qi]);
    stage.append(h('div', { class: 'summary' },
      h('div', { class: 'sum-score' }, h('span', { class: 'big' }, `${c}/${n}`), h('span', {}, msg)),
      h('div', { class: 'sum-stats' },
        stat('Accuracy', pct(acc), ''), stat('Avg speed', med ? fmtMs(med) : '-', ''), stat('Second chances', `${recovered}`, 'fixed')),
      R.levelUps.length ? h('div', { class: 'sum-clean' }, '▲ ', R.levelUps.map(u => `${u.name} → L${u.level}`).join(', ')) : null,
      missed.length ? h('details', { class: 'sum-misses' }, h('summary', {}, `Review list (${missed.length}) - these come back in spaced review`),
        ...missed.map(q => h('div', { class: 'miss-row' }, h('span', { html: md(q.q) }), h('b', {}, answerText(q))))) : null,
      h('button', { class: 'btn primary wide big', onclick: finish }, 'Done ✓')));
    fx.stagger([...stage.querySelectorAll('.stat')]);
    if (acc >= 0.8) fx.burst($('.sum-score', stage));
    bindKeys(e => { if (e.key === 'Enter') { e.preventDefault(); finish(); } });
  }

  function finish() {
    const res = R.result || {};
    const rtSum = R.answers.reduce((a, x) => a + x.ms, 0);
    const msTotal = Date.now() - R.started;
    // Spaced review: missed -> tomorrow; hinted -> soon; right -> normal schedule.
    R.answers.filter(a => !a.retry).forEach(a => {
      const q = R.questions[a.qi]; if (!q.key) return;
      const recovered = R.answers.some(b => b.retry && b.ok && R.questions[b.qi].skill === q.skill && R.questions[b.qi].q === q.q);
      const grade = !a.ok ? (recovered ? 1 : 0) : a.hinted ? 1 : (R.target && a.ms < R.target * 0.7 ? 3 : 2);
      if (q.srs || (!a.ok && /^(q|g|a|math|scen|fact):/.test(q.key))) srsReview(q.key, grade, q.src || R.area);
    });
    if (R.area === 'math' && R.target && res.med) recordSpeed(Math.min(1.2, R.target / Math.max(1, res.med)));
    recordActivity({ area: R.area, ms: msTotal, q: res.n || 0, correct: res.c || 0, rtSum, req: R.req });
    const misses = R.answers.filter(a => !a.ok && !a.retry).map(a => ({ q: R.questions[a.qi], hints: a.hinted ? 1 : 0, tries: 1, given: a.given }));
    const out = { ...res, misses, answers: R.answers, meta: R.meta, msTotal, questions: R.questions, levelUps: R.levelUps };
    S().missLog = [...misses.map(m => ({ q: m.q.q, a: answerText(m.q), given: m.given, hints: m.hints, ts: Date.now(), area: R.area, tags: [...(R.tags || []), m.q.skill].filter(Boolean), key: m.q.key || null })), ...(S().missLog || [])].slice(0, 80);
    const fin = finishers[R.kind];
    S().activeRound = null;
    S().lastRound = { kind: R.kind, acc: res.acc, med: res.med, ts: Date.now() };
    save();
    document.body.classList.remove('in-round');
    try { cardsFromRepeatedMisses(misses); } catch (e) { console.warn(e); }
    if (fin) fin(out); else location.hash = '#/';
  }
}

const stat = (l, v, s) => h('div', { class: 'stat' }, h('div', { class: 'stat-l' }, l), h('div', { class: 'stat-v' }, v), s && h('div', { class: 'stat-s' }, s));

export function relevantTips(tags) {
  if (!tags || !tags.length) return [];
  const t = new Set(tags.map(String));
  return S().log.filter(e => (e.tags || []).some(x => t.has(x)) && (e.type === 'tip' || e.type === 'strategy' || e.type === 'formula' || e.type === 'mistake'))
    .sort((a, b) => b.ts - a.ts).slice(0, 3);
}

// ---------- inputs ----------
let activeKeyHandler = null;
function bindKeys(fn) {
  if (activeKeyHandler) removeEventListener('keydown', activeKeyHandler);
  activeKeyHandler = fn;
  addEventListener('keydown', fn);
}
export function unbindKeys() { if (activeKeyHandler) removeEventListener('keydown', activeKeyHandler); activeKeyHandler = null; }

export function keypad(q, submit) {
  let val = '';
  const disp = h('div', { class: 'kp-display' }, h('span', { class: 'kp-unit' }, q.unit === '$' ? '$' : ''), h('span', { class: 'kp-val' }, ''), h('span', { class: 'kp-unit' }, q.unit === '%' ? '%' : ''), h('span', { class: 'kp-caret' }));
  const set = v => { val = v; disp.querySelector('.kp-val').textContent = val; };
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', q.kind === 'frac' ? '/' : '.', '0', '⌫'];
  const extra = h('div', { class: 'kp-extra' },
    h('button', { class: 'kp-key small', onclick: () => set(val.startsWith('-') ? val.slice(1) : '-' + val) }, '±'),
    q.kind === 'frac' ? h('button', { class: 'kp-key small', onclick: () => set(val + '.') }, '.') : h('button', { class: 'kp-key small', onclick: () => set(val + '/') }, '/'));
  const press = k => {
    fx.sfx.tap();
    if (k === '⌫') set(val.slice(0, -1));
    else if (k === 'go') { const v = val; if (v) { set(''); submit(v); } }
    else if (val.length < 12) set(val + k);
  };
  const pad = h('div', { class: 'kp' }, ...keys.map(k => h('button', { class: 'kp-key', onpointerdown: e => { e.preventDefault(); fx.press(e.currentTarget); fx.ripple(e.currentTarget, e); press(k); } }, k)));
  const go = h('button', { class: 'kp-go', onpointerdown: e => { e.preventDefault(); fx.press(e.currentTarget); press('go'); } }, 'Check ↵');
  bindKeys(e => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key === '-') set(val.startsWith('-') ? val.slice(1) : '-' + val);
    else if (/^[0-9./]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('⌫');
    else if (e.key === 'Enter') press('go');
    else return;
    e.preventDefault();
  });
  return h('div', { class: 'kp-wrap' }, disp, pad, h('div', { class: 'kp-bottom' }, extra, go));
}

export function choices(q, submit) {
  const btns = q.choices.map((c, i) => h('button', {
    class: 'choice', onclick: e => { fx.press(e.currentTarget); fx.ripple(e.currentTarget, e); submit(c); },
  }, h('span', { class: 'choice-k' }, 'ABCD'[i] || i + 1), h('span', { class: 'choice-t', html: md(String(c)) })));
  bindKeys(e => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    const k = e.key.toLowerCase();
    const idx = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
    if (idx >= 0 && btns[idx]) { e.preventDefault(); btns[idx].click(); }
  });
  return h('div', { class: 'choices' }, ...btns);
}
