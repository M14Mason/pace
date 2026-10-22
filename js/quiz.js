// The round engine used everywhere (math sprints, lesson checks, unit tests, DECA exams).
// Rules (from the student): never stop for a mistake. Finish the round, see the score
// and the misses, then the ONLY way out is to clear every miss. Each miss comes back
// with hints that escalate: recall the rule -> strategy -> where you are in the problem
// -> full worked steps. A round in progress survives reloads.
import { S, save, recordActivity, markQ, srsReview, recordSpeed } from './store.js';
import { h, $, fmtMs, pct, rich, shuffle, md } from './ui.js';
import * as fx from './fx.js';
import { check as mathCheck, fmtAns } from './math/skills.js';
import { cardsFromRepeatedMisses } from './views/cards.js';

const finishers = {};
export const onRoundFinish = (kind, fn) => (finishers[kind] = fn);

// Convert a bank question {q,c,a,e,h} into an engine question.
export function fromBank(b, key) {
  return { key, q: b.q, choices: shuffle(b.c), a: b.c[b.a], mc: true, hints: b.h || [], steps: [b.e], explain: b.e, tags: b.tags };
}

const median = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

function isRight(q, input) {
  if (q.mc) return String(input) === String(q.a);
  return mathCheck(q, input);
}
const answerText = q => (q.mc ? q.a : fmtAns(q));

// Start a new round. opts: { kind, meta, title, questions, target (ms), area, req, tags, timed }
export function startRound(opts) {
  S().activeRound = {
    kind: opts.kind, meta: opts.meta || {}, title: opts.title, area: opts.area || 'math', req: opts.req || null,
    target: opts.target || 0, tags: opts.tags || [], intro: opts.intro || null,
    questions: opts.questions, stage: 'answer', i: 0, answers: [], misses: [], mi: 0, started: Date.now(), msTotal: 0,
  };
  save();
  location.hash = '#/round';
}

export function renderRound(root) {
  const R = S().activeRound;
  if (!R) { location.hash = '#/'; return; }
  document.body.classList.add('in-round');
  root.innerHTML = '';
  const tips = relevantTips(R.tags);

  const top = h('div', { class: 'round-top' },
    h('button', { class: 'icon-btn', title: 'Pause (progress is kept)', onclick: () => { document.body.classList.remove('in-round'); location.hash = '#/'; } }, '❚❚'),
    h('div', { class: 'round-title' }, R.title),
    h('div', { class: 'round-clock', id: 'rclock' }, '0:00'));
  const dots = h('div', { class: 'round-dots' }, ...R.questions.map((_, k) => h('i', { class: dotCls(R, k) })));
  const stage = h('div', { class: 'round-stage' });
  root.append(h('div', { class: 'round' }, top, dots, stage));

  const clock = setInterval(() => {
    const el = $('#rclock'); if (!el) return clearInterval(clock);
    const s = Math.floor((Date.now() - R.started) / 1000);
    el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }, 500);

  if (R.stage === 'answer') answerStage();
  else if (R.stage === 'summary') summaryStage();
  else missStage();

  function answerStage() {
    if (R.i >= R.questions.length) { R.stage = 'summary'; save(); return summaryStage(); }
    const q = R.questions[R.i];
    const t0 = performance.now();
    let locked = false;
    stage.innerHTML = '';
    const tip = R.i === 0 && tips[0] ? h('div', { class: 'tip-chip' }, h('b', {}, 'Your tip: '), tips[0].text) : null;
    const timer = h('div', { class: 'qtimer' }, h('div', { class: 'qtimer-fill' }));
    const prompt = h('div', { class: 'q-prompt', html: md(q.q) });
    const qcount = h('div', { class: 'q-count' }, `${R.i + 1} / ${R.questions.length}`);
    stage.append(h('div', { class: 'qcard' }, qcount, R.target ? timer : null, prompt), tip);
    if (R.target && window.gsap) {
      const f = timer.firstChild;
      gsap.fromTo(f, { width: '0%' }, { width: '100%', duration: R.target / 1000, ease: 'none', onComplete: () => f.classList.add('over') });
    }
    fx.pop(prompt);
    const submit = val => {
      if (locked || val === '' || val == null) return;
      locked = true;
      const ms = performance.now() - t0;
      const ok = isRight(q, val);
      R.answers.push({ ok, ms, given: String(val) });
      if (!ok) R.misses.push({ qi: R.i, hints: 0, tries: 0 });
      if (q.key) markQ(q.key, ok);
      const card = $('.qcard', stage);
      ok ? fx.correct(card) : fx.wrong(card);
      dots.children[R.i].className = ok ? 'ok' : 'bad';
      if (ok && window.gsap) gsap.fromTo(dots.children[R.i], { scale: 1.8 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
      R.i++; save();
      setTimeout(answerStage, ok ? 260 : 420);
    };
    stage.append(q.mc ? choices(q, submit) : keypad(q, submit));
  }

  function summaryStage() {
    stage.innerHTML = '';
    const n = R.answers.length, c = R.answers.filter(a => a.ok).length;
    const med = median(R.answers.filter(a => a.ok).map(a => a.ms));
    const acc = n ? c / n : 0;
    R.result = R.result || { acc, med, n, c };
    const fastEnough = !R.target || med <= R.target;
    const missesLeft = R.misses.length;
    stage.append(h('div', { class: 'summary' },
      h('div', { class: 'sum-score' }, h('span', { class: 'big' }, `${c}/${n}`), h('span', {}, pct(acc))),
      h('div', { class: 'sum-stats' },
        stat('Median', fmtMs(med || 0), R.target ? (fastEnough ? 'on target' : `target ${fmtMs(R.target)}`) : ''),
        stat('Accuracy', pct(acc), acc >= 0.9 ? 'solid' : 'need 90%'),
        stat('Time', fmtMs(Date.now() - R.started), '')),
      missesLeft ? h('div', { class: 'sum-misses' }, h('h4', {}, `Clear ${missesLeft} miss${missesLeft > 1 ? 'es' : ''} to finish`),
        ...R.misses.map(m => h('div', { class: 'miss-row' }, h('span', { html: md(R.questions[m.qi].q) }), h('span', { class: 'given' }, `you: ${R.answers[m.qi].given}`)))) :
        h('div', { class: 'sum-clean' }, 'Clean round. Nothing to clear.'),
      h('button', { class: 'btn primary wide', onclick: () => { if (missesLeft) { R.stage = 'misses'; save(); missStage(); } else finish(); } }, missesLeft ? 'Clear misses →' : 'Finish')));
    fx.stagger([...stage.querySelectorAll('.stat, .miss-row')]);
    if (!missesLeft) fx.burst($('.sum-score', stage));
  }

  function missStage() {
    if (R.mi >= R.misses.length) return finish();
    const m = R.misses[R.mi];
    const q = R.questions[m.qi];
    stage.innerHTML = '';
    const hintBox = h('div', { class: 'hints' });
    const tip = relevantTips([...(R.tags || []), q.skill].filter(Boolean))[0];
    const showHints = () => {
      hintBox.innerHTML = '';
      const levels = [...(q.hints || [])];
      for (let k = 0; k < Math.min(m.hints, levels.length); k++) hintBox.append(h('div', { class: `hint h${k}` }, h('b', {}, ['Remember', 'Strategy', 'Where you are'][k] || 'Hint'), ' ', h('span', { html: md(levels[k]) })));
      if (m.hints > levels.length && q.steps && q.steps.length) {
        hintBox.append(h('div', { class: 'hint worked' }, h('b', {}, 'Worked steps'), h('ol', {}, ...q.steps.map(s => h('li', { html: md(s) })))));
      }
      if (tip && m.hints >= 1) hintBox.append(h('div', { class: 'hint mine' }, h('b', {}, 'From your Log'), ' ', tip.text));
      fx.stagger([...hintBox.children]);
    };
    if (m.hints === 0) m.hints = 1; // every miss comes back with at least the first cue
    showHints();
    stage.append(
      h('div', { class: 'miss-head' }, `Miss ${R.mi + 1} of ${R.misses.length}`, h('span', { class: 'muted' }, ' · get it right to move on')),
      h('div', { class: 'qcard' }, h('div', { class: 'q-prompt', html: md(q.q) })), hintBox);
    let locked = false;
    const submit = val => {
      if (locked || val === '' || val == null) return;
      m.tries++;
      if (isRight(q, val)) {
        locked = true;
        fx.correct($('.qcard', stage));
        const explain = q.explain && q.mc ? h('div', { class: 'explain' }, h('b', {}, 'Why: '), h('span', { html: md(q.explain) })) : null;
        if (explain) { stage.append(explain); fx.pop(explain); }
        R.mi++; save();
        setTimeout(missStage, explain ? 1600 : 500);
      } else {
        fx.wrong($('.qcard', stage));
        m.hints++; save();
        showHints();
        if (m.hints > (q.hints || []).length + 1) {
          // after full steps, show the answer so they can type it and lock it in
          hintBox.append(h('div', { class: 'hint answer' }, h('b', {}, 'Answer'), ' ', answerText(q), ' - enter it to lock it in.'));
        }
      }
    };
    stage.append(q.mc ? choices(q, submit, true) : keypad(q, submit));
  }

  function finish() {
    clearInterval(clock);
    const res = R.result || {};
    const hinted = new Set(R.misses.map(m => m.qi));
    const rtSum = R.answers.reduce((a, x) => a + x.ms, 0);
    const msTotal = Date.now() - R.started;
    // SRS: every question with a key gets graded; hinted ones come back tomorrow.
    R.questions.forEach((q, k) => {
      if (!q.key) return;
      const a = R.answers[k];
      const grade = hinted.has(k) ? (R.misses.find(m => m.qi === k).hints > 1 ? 0 : 1) : (R.target && a.ms < R.target * 0.7 ? 3 : 2);
      if (q.srs || (hinted.has(k) && /^(q|g|a|math|scen|fact):/.test(q.key))) srsReview(q.key, grade, q.src || R.area);
    });
    if (R.area === 'math' && R.target) recordSpeed(Math.min(1.2, R.target / Math.max(1, res.med || R.target)));
    recordActivity({ area: R.area, ms: msTotal, q: R.answers.length, correct: res.c || 0, rtSum, req: R.req });
    const fin = finishers[R.kind];
    const out = { ...res, misses: R.misses.map(m => ({ q: R.questions[m.qi], hints: m.hints, tries: m.tries, given: R.answers[m.qi].given })), answers: R.answers, meta: R.meta, msTotal, questions: R.questions };
    S().missLog = [...R.misses.map(m => { const q = R.questions[m.qi]; return { q: q.q, a: answerText(q), given: R.answers[m.qi].given, hints: m.hints, ts: Date.now(), area: R.area, tags: [...(R.tags || []), q.skill].filter(Boolean), key: q.key || null }; }), ...(S().missLog || [])].slice(0, 80);
    if (res.acc === 1 && res.n >= 10) { const fr = (S().fastRound ||= {}); const k = R.kind; if (!fr[k] || msTotal < fr[k]) { fr[k] = msTotal; import('./store.js').then(m => m.addRecord('clean', `Fastest clean ${R.title}: ${Math.round(msTotal / 1000)}s`, msTotal)); } }
    S().activeRound = null;
    S().lastRound = { kind: R.kind, acc: res.acc, med: res.med, ts: Date.now() };
    save();
    document.body.classList.remove('in-round');
    try { cardsFromRepeatedMisses(out.misses); } catch (e) { console.warn(e); }
    if (fin) fin(out); else location.hash = '#/';
  }
}

function dotCls(R, k) {
  const a = R.answers[k];
  return a ? (a.ok ? 'ok' : 'bad') : k === R.i ? 'cur' : '';
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
  const pad = h('div', { class: 'kp' }, ...keys.map(k => h('button', { class: 'kp-key', onpointerdown: e => { e.preventDefault(); fx.press(e.currentTarget); press(k); } }, k)));
  const go = h('button', { class: 'kp-go', onpointerdown: e => { e.preventDefault(); fx.press(e.currentTarget); press('go'); } }, 'Enter ↵');
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

export function choices(q, submit, keepOpen = false) {
  const btns = q.choices.map((c, i) => h('button', {
    class: 'choice', onclick: e => {
      fx.press(e.currentTarget);
      if (keepOpen && !isRight(q, c)) e.currentTarget.classList.add('struck');
      submit(c);
    },
  }, h('span', { class: 'choice-k' }, 'ABCD'[i] || i + 1), h('span', { class: 'choice-t', html: md(String(c)) })));
  bindKeys(e => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    const k = e.key.toLowerCase();
    const idx = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
    if (idx >= 0 && btns[idx]) { e.preventDefault(); btns[idx].click(); }
  });
  return h('div', { class: 'choices' }, ...btns);
}
