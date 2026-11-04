// Finance tab: Fundamentals → Advanced → Capstone, plus DECA.
// Each concept: guess first → learn → show me → your turn → real scenarios → lock it in.
// Then spaced, mixed review brings it back over days and weeks (see docs/DESIGN.md).
import { S, save, markQ, srsReview, dueItems, autoLog, recordActivity } from '../store.js';
import { h, card, bar, pct, toast, md, shuffle } from '../ui.js';
import { LEVELS, LEVEL, CONCEPT, CONCEPTS, FINX, finxUnit, keysOf, status, STATUS_IC, nextUp, levelProgress, isFinKey } from '../data/fin/index.js';
import { CTX } from '../data/fin/util.js';
import { unitPool, buildSet, resolveKey } from '../pool.js';
import { startRound } from '../quiz.js';
import { hasAI, gradeShort, aiErrorText } from '../ai.js';
import { DECA } from '../data/finance.js';
import { examReadiness, fceReadiness } from './decax.js';
import { unitReadiness } from '../data/courses.js';
import { DECAC } from './finance.js';
import * as fx from '../fx.js';

const back = (href, t) => h('a', { href, class: 'muted small' }, `← ${t}`);
const fin = () => (S().fin ||= {});
const due = () => dueItems(isFinKey);

function review(keys, title, backTo) {
  const qs = keys.map(resolveKey).filter(Boolean);
  if (!qs.length) return toast('Nothing to review yet - learn a concept first.');
  startRound({ kind: 'unit-practice', meta: { back: backTo }, title, questions: shuffle(qs), area: 'finance', tags: ['finance'], coach: false });
}
// Mixed (interleaved) practice across concepts you've learned.
function mixed(ids, n, title, backTo) {
  const learned = ids.filter(id => status(id) !== 'new');
  const pool = (learned.length ? learned : ids).flatMap(id => unitPool(FINX, finxUnit(id), 'finx'));
  startRound({ kind: 'unit-practice', meta: { back: backTo }, title, questions: buildSet(pool, n), area: 'finance', tags: ['finance'], coach: false });
}

// ---------- hub ----------
export function hub(root) {
  const nx = nextUp();
  const d = due();
  const tile = l => {
    const p = levelProgress(l.id);
    return h('a', { class: 'tile', href: `#/finance/l/${l.id}` },
      h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic' }, l.ic), h('span', { class: `chip ${p.learned ? 'acc' : ''}` }, `${p.learned}/${p.n}`)),
      h('h4', {}, l.t), h('div', { class: 'muted' }, l.sub),
      h('div', { style: { marginTop: '10px' } }, bar(p.learned / p.n)),
      p.remembered ? h('div', { class: 'small muted', style: { marginTop: '6px' } }, `★ ${p.remembered} remembered long-term`) : null);
  };
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Finance'), h('div', { class: 'sub' }, 'Learn it, see it, use it, remember it.'))),
    nx ? h('a', { class: 'card accent', href: `#/finance/c/${nx.id}`, style: { display: 'block', textDecoration: 'none', marginBottom: '12px' } },
      h('div', { class: 'small', style: { opacity: .85 } }, `Next up · ${LEVEL[nx.lvl].t}`),
      h('h3', { style: { fontSize: '19px', margin: '4px 0' } }, nx.t),
      h('div', { class: 'small', style: { opacity: .85 } }, '≈ 6-8 min · guess → learn → show me → your turn → scenarios')) : null,
    d.length ? h('button', { class: 'btn big wide', style: { marginBottom: '12px' }, onclick: () => review(d.slice(0, 10).map(x => x.key), 'Finance review', '#/finance') }, `↻ Review ${Math.min(10, d.length)} due card${d.length > 1 ? 's' : ''} · ≈ ${Math.max(1, Math.round(Math.min(10, d.length) * 0.4))} min`) : null,
    h('div', { class: 'grid g2' }, ...LEVELS.map(tile)),
    card('Practice', h('div', { class: 'stack' },
      h('button', { class: 'btn wide', onclick: () => mixed(CONCEPTS.map(c => c.id), 10, 'Finance · mixed practice', '#/finance') }, 'Mixed practice · 10 questions from what you\'ve learned'),
      h('p', { class: 'small muted' }, 'Mixing topics feels harder than one topic at a time - that\'s the point. It trains you to recognize WHICH tool a problem needs.'))),
    h('details', { class: 'card', style: { marginTop: '12px' } }, h('summary', { style: { fontWeight: 650, cursor: 'pointer' } }, 'How Pace makes this stick for life'),
      h('ul', { class: 'small', style: { marginTop: '8px' } },
        h('li', {}, h('b', {}, 'Guess first. '), 'Trying a question before the lesson primes your brain to notice the answer.'),
        h('li', {}, h('b', {}, 'Hook + analogy. '), 'Each idea is tied to something you already know, so it has a place to live.'),
        h('li', {}, h('b', {}, 'Worked example, then your turn. '), 'See the steps, then do it yourself with hints.'),
        h('li', {}, h('b', {}, 'Four different settings. '), 'The same idea in a small business, a big company, your own money and a DECA roleplay - that\'s what lets you use it anywhere.'),
        h('li', {}, h('b', {}, 'Explain it back. '), 'Putting it in your own words shows what you really understand.'),
        h('li', {}, h('b', {}, 'Spaced, mixed review. '), 'Cards return after 2 days, then 5, then weeks. A concept earns ★ once you\'ve recalled it on separate days.'))),
    card('Tools & labs', h('div', { class: 'list-links' },
      lrow('#/finance/market', '📈', 'Market brief', 'What moved and why, then a concept quiz'),
      lrow('#/finance/company', '🏢', 'Analyze a real company', 'Real numbers → ratios'),
      lrow('#/finance/pitch', '🎤', 'Stock pitch builder', 'Written pitch, then out loud'),
      lrow('#/finance/lab', '🧪', 'Portfolio lab', 'Simulate 20 years of investing'),
      lrow('#/finance/classic', '📚', 'Cases, memos & original lessons', 'Your earlier finance track'))));
}
const lrow = (href, ic, t, d) => h('a', { class: 'link-row', href }, h('span', { class: 'tile-ic' }, ic), h('div', {}, h('b', {}, t), h('div', { class: 'small muted' }, d)), h('span', { class: 'muted' }, '›'));

// ---------- level ----------
export function level(root, lvl) {
  const L = LEVEL[lvl]; if (!L) return (location.hash = '#/finance');
  const list = CONCEPTS.filter(c => c.lvl === lvl);
  const p = levelProgress(lvl);
  const nx = nextUp(lvl);
  const groups = [...new Set(list.map(c => c.g))];
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, back('#/finance', 'Finance'), h('h1', {}, L.t), h('div', { class: 'sub' }, L.sub))),
    lvl === 'deca' ? decaExtras() : null,
    h('div', { class: 'kpis', style: { marginBottom: '12px' } },
      h('div', { class: 'kpi' }, h('div', { class: 'kpi-l' }, 'Learned'), h('div', { class: 'kpi-v' }, `${p.learned}/${p.n}`)),
      h('div', { class: 'kpi' }, h('div', { class: 'kpi-l' }, '★ Remembered'), h('div', { class: 'kpi-v' }, `${p.remembered}`))),
    nx ? h('a', { class: 'btn primary big wide', href: `#/finance/c/${nx.id}`, style: { marginBottom: '12px' } }, `▶ Next: ${nx.t}`) : h('p', { class: 'small muted' }, 'Every concept here is learned. Keep reviewing to earn ★.'),
    p.learned ? h('button', { class: 'btn wide', style: { marginBottom: '12px' }, onclick: () => mixed(list.map(c => c.id), 10, `${L.t} · mixed practice`, `#/finance/l/${lvl}`) }, `Mixed practice · ${L.t}`) : null,
    ...groups.map(g => card(g, h('div', { class: 'unit-list' }, ...list.filter(c => c.g === g).map(c => {
      const s = status(c.id);
      return h('a', { class: `unit-row${s !== 'new' ? ' done' : ''}`, href: `#/finance/c/${c.id}` }, h('span', { class: 'unit-n' }, STATUS_IC[s]),
        h('div', {}, h('div', { style: { fontWeight: 600 } }, c.t), h('div', { class: 'unit-meta' }, c.moved || c.added || c.fixed ? (c.moved || c.added || c.fixed).split(':')[0] : c.def.split('. ')[0].slice(0, 80) + '…')),
        h('span', { class: 'muted' }, '›'));
    })))),
    lvl === 'deca' ? card('Also on the Finance exam', h('div', { class: 'unit-list' }, ...CONCEPTS.filter(c => c.deca).map(c => h('a', { class: 'unit-row', href: `#/finance/c/${c.id}` }, h('span', { class: 'unit-n' }, STATUS_IC[status(c.id)]), h('div', {}, h('div', { style: { fontWeight: 600 } }, c.t), h('div', { class: 'unit-meta' }, `In ${LEVEL[c.lvl].t} - it powers NPV and valuation`)), h('span', { class: 'muted' }, '›'))))) : null,
    lvl === 'deca' ? decaClusters() : null);
}

function decaExtras() {
  return h('div', { class: 'grid g2', style: { marginBottom: '12px' } },
    h('a', { class: 'tile', href: '#/finance/deca/exam' }, h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic' }, '📘'), h('span', { class: 'chip acc' }, `${pct(examReadiness())} ready`)),
      h('h4', {}, 'Finance exam course'), h('div', { class: 'muted' }, '9 areas weighted like the real test · mock exams'), h('div', { style: { marginTop: '10px' } }, bar(examReadiness()))),
    h('a', { class: 'tile', href: '#/finance/deca/fce' }, h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic' }, '🤝'), h('span', { class: 'chip acc' }, `${pct(fceReadiness())} ready`)),
      h('h4', {}, 'Financial Consulting'), h('div', { class: 'muted' }, '2026-27 case · plan, present, get judged'), h('div', { style: { marginTop: '10px' } }, bar(fceReadiness()))));
}
function decaClusters() {
  return card('Roleplay practice', h('div', { class: 'unit-list' }, ...DECA.clusters.map(cl => h('a', { class: 'unit-row', href: `#/finance/deca/${cl.id}` },
    h('span', { class: 'unit-n' }, cl.id === 'fin' ? '$' : 'M'), h('div', {}, h('div', { style: { fontWeight: 600 } }, cl.t), h('div', { class: 'unit-meta' }, `${cl.roleplays.length} roleplays · ${pct(unitReadiness(DECAC, cl))} ready`)), h('span', { class: 'muted' }, '›')))));
}

// ---------- concept player ----------
function mc(q, key, { onDone, record = true } = {}) {
  // Inline multiple choice: hint on demand, calm "here's why" after any answer.
  const opts = shuffle(q.c.map((t, i) => ({ t, ok: i === q.a })));
  const fb = h('div');
  let hinted = 0, answered = false;
  const hintBox = h('div');
  const hintBtn = q.h && q.h.length ? h('button', { class: 'hint-btn', onclick: () => { if (hinted >= q.h.length) return; hintBox.append(h('div', { class: 'hint', style: { marginTop: '8px' } }, h('b', {}, 'Hint'), q.h[hinted])); hinted++; if (hinted >= q.h.length) hintBtn.remove(); } }, '💡 Hint') : null;
  const btns = opts.map((o, i) => h('button', { class: 'choice', onclick: e => {
    if (answered) return; answered = true;
    btns.forEach((b, j) => { b.classList.toggle('is-answer', opts[j].ok); if (!opts[j].ok && b !== e.currentTarget) b.classList.add('dim'); });
    if (record && key) { markQ(key, o.ok); srsReview(key, o.ok ? (hinted ? 1 : 2) : 0, 'finx'); save(); }
    if (o.ok) fx.correct(e.currentTarget); else fx.wrong(e.currentTarget);
    hintBtn?.remove();
    fb.append(h('div', { class: o.ok ? 'explain' : 'hint', style: { marginTop: '10px' } }, h('b', {}, o.ok ? (hinted ? 'Got it' : 'Yes!') : 'Here\'s why'), h('span', { html: md(q.e) })));
    fx.pop(fb.lastChild);
    onDone && onDone(o.ok);
  } }, h('span', { class: 'choice-k' }, 'ABCD'[i]), h('span', { class: 'choice-t', html: md(o.t) })));
  return h('div', { class: 'stack' }, h('p', { style: { fontWeight: 600 }, html: md(q.q) }), h('div', { class: 'choices', style: { marginTop: 0 } }, ...btns), hintBtn ? h('div', {}, hintBtn) : null, hintBox, fb);
}

export function concept(root, id) {
  const c = CONCEPT[id]; if (!c) return (location.hash = '#/finance');
  const st = (fin()[id] ||= { stage: 1 });
  const seenAll = !!st.done;
  const u = finxUnit(id);
  const t0 = Date.now();
  const stages = [];
  const advance = n => { if (st.stage < n) { st.stage = n; save(); } stages.slice(0, n).forEach(s => s.show()); stages[n - 1]?.el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const nextBtn = (n, label = 'Next →') => h('button', { class: 'btn primary', style: { marginTop: '12px' }, onclick: e => { e.currentTarget.remove(); advance(n); } }, label);
  const stage = (n, ic, title, body) => {
    const el = h('section', { class: 'lesson-step fin-stage', style: { display: 'none' } }, h('h3', {}, `${ic} ${n} · ${title}`), body);
    const s = { el, show: () => { if (el.style.display === 'none') { el.style.display = ''; fx.pop(el); } } };
    stages.push(s); return el;
  };

  // 1 Guess first (not scored)
  const guessRes = h('div');
  const s1 = stage(1, '🤔', 'Guess first', h('div', {}, h('p', { class: 'small muted' }, 'Take a guess - it\'s not scored. Guessing first helps you remember the answer.'),
    mc(c.qs[0], null, { record: false, onDone: ok => { guessRes.append(h('div', { class: ok ? 'explain' : 'hint' }, h('b', {}, ok ? 'Your guess was right' : 'About your guess'), h('span', { html: md(ok ? 'Now you know why.' : `The answer was **${c.qs[0].c[0]}**. ${c.qs[0].e}`) }))); if (st.stage < 2) s1.append(nextBtn(2, 'Now learn it →')); } })));

  // 2 Learn
  const s2 = stage(2, '📖', 'Learn it', h('div', { class: 'stack' },
    c.moved || c.added || c.fixed ? h('div', { class: 'chip gold', style: { whiteSpace: 'normal' } }, c.moved || c.added || c.fixed) : null,
    h('p', { style: { fontSize: '17px' }, html: md(`**${c.t}:** ${c.def}`) }),
    h('p', { html: md(`**Why it exists:** ${c.why}`) }),
    h('div', { class: 'hint worked' }, h('b', {}, 'Think of it like'), h('span', {}, c.an)),
    c.f ? h('div', { class: 'fin-formula' }, c.f) : null,
    h('div', { class: 'hint mine' }, h('b', {}, 'Remember it'), h('span', {}, c.hook)),
    guessRes,
    !seenAll && (st.stage || 1) < 3 ? nextBtn(3, 'Show me how →') : null));
  // 3 Show me
  const steps = c.ex.s.map((s, i) => h('div', { class: `worked-step${i ? ' hidden-step' : ''}` }, h('span', { class: 'ws-n' }, i + 1), h('div', { html: md(s) })));
  let shown = 1;
  const ans = h('div', { class: 'explain', style: { display: 'none', marginTop: '10px' } }, h('b', {}, 'Answer: '), h('span', { html: md(c.ex.a) }));
  const stepBtn = h('button', { class: 'btn sm primary', style: { marginTop: '10px' } }, steps.length > 1 ? 'Next step' : 'Show answer');
  const s3 = stage(3, '👀', 'Show me how', h('div', {}, h('p', { style: { fontWeight: 600 }, html: md(c.ex.p) }), ...steps, ans, stepBtn));
  stepBtn.onclick = () => {
    if (shown < steps.length) { steps[shown].classList.remove('hidden-step'); fx.pop(steps[shown]); shown++; if (shown === steps.length) stepBtn.textContent = 'Show answer'; }
    else { ans.style.display = ''; fx.pop(ans); stepBtn.replaceWith(nextBtn(4, 'My turn →')); }
  };
  // 4 Your turn: 1-2 generated reps + a concept check
  const turn = [];
  if (u.gen.length) turn.push([c.gen(), `g:finx/${id}/0`], [c.gen(), `g:finx/${id}/0`]);
  c.qs.slice(1).forEach((q, i) => turn.push([q, `q:finx/${id}/${i + 1}`]));
  if (turn.length < 3) turn.unshift([c.qs[0], `q:finx/${id}/0`]);
  let left = turn.length;
  const s4 = stage(4, '✍️', 'Your turn', h('div', { class: 'stack' }, h('p', { class: 'small muted' }, 'Use the hook. Hints are free.'),
    ...turn.map(([q, k], i) => h('div', { style: { paddingTop: i ? '12px' : 0, borderTop: i ? '1px dashed var(--line)' : 0 } }, mc(q, k, { onDone: () => { if (--left === 0) s4.append(nextBtn(5, 'Use it for real →')); } })))));
  // 5 Scenarios
  let sl = c.sc.length;
  const s5 = stage(5, '🌍', 'Real scenarios', h('div', { class: 'stack' },
    ...c.sc.map((s, i) => {
      const say = s.say ? h('div', { class: 'hint worked', style: { display: 'none', marginTop: '8px' } }, h('b', {}, 'Say it like a pro'), h('span', {}, s.say)) : null;
      return h('div', { class: 'fin-scen' },
        h('div', { class: 'row', style: { gap: '8px', marginBottom: '6px' } }, h('span', { class: 'chip acc' }, `${CTX[s.x][0]} ${CTX[s.x][1]}`), h('b', {}, s.t)),
        h('p', {}, s.s),
        mc(s.q, `q:finx/${id}/${c.qs.length + i}`, { onDone: () => { if (say) { say.style.display = ''; fx.pop(say); } if (--sl === 0) s5.append(nextBtn(6, 'Lock it in →')); } }), say);
    })));
  // 6 Lock it in
  const ta = h('textarea', { class: 'input', rows: 3, placeholder: 'Explain it like you\'re teaching a friend: what it is, why it matters, one example.' }, st.explain || '');
  ta.oninput = () => { st.explain = ta.value; save(); };
  const aiOut = h('div');
  const aiBtn = hasAI() ? h('button', { class: 'btn sm ghost', onclick: async () => {
    if (ta.value.trim().split(/\s+/).length < 12) return toast('Write a couple of sentences first.');
    aiBtn.disabled = true; aiBtn.textContent = 'Checking…';
    try { const r = await gradeShort({ context: `Finance concept: ${c.t}. A high school student is explaining it in their own words.`, question: `Explain ${c.t}`, answer: ta.value, key: `${c.def} Why: ${c.why} Example: ${c.ex.a}` });
      aiOut.innerHTML = ''; aiOut.append(h('div', { class: 'hint', style: { marginTop: '8px' } }, h('b', {}, `${r.score}/100`), r.right.length ? h('div', {}, '✓ ', r.right.join(' · ')) : null, r.missing.length ? h('div', {}, '+ ', r.missing.join(' · ')) : null, h('div', { style: { marginTop: '6px' } }, h('i', {}, r.better))));
    } catch (e) { toast(aiErrorText(e), 'bad'); }
    aiBtn.disabled = false; aiBtn.textContent = 'Check my explanation';
  } }, 'Check my explanation') : null;
  const doneBtn = h('button', { class: 'btn primary big wide', style: { marginTop: '12px' } }, seenAll ? '✓ Learned - review again anytime' : 'Done ✓ - schedule my reviews');
  doneBtn.onclick = () => {
    const first = !st.done;
    st.done = st.done || Date.now(); st.stage = 6;
    // every card of this concept enters spaced review (first review in ~2 days)
    keysOf(id).forEach(k => { if (!S().srs[k]) srsReview(k, 2, 'finx'); });
    autoLog('tip', `${c.t}: ${c.hook}`, ['finance', id], 'fin:' + id);
    recordActivity({ area: 'finance', ms: Math.min(15 * 60000, Date.now() - t0) });
    save(); fx.burst(doneBtn);
    toast(first ? 'Learned! It\'ll come back for review in about 2 days.' : 'Saved.', 'good');
    const nx = nextUp(c.lvl === 'deca' ? 'deca' : null);
    setTimeout(() => { location.hash = nx ? `#/finance/c/${nx.id}` : `#/finance/l/${c.lvl}`; }, 900);
  };
  const s6 = stage(6, '🧠', 'Lock it in', h('div', { class: 'stack' },
    h('p', { style: { fontWeight: 600 } }, 'Explain it back'), ta, aiBtn ? h('div', {}, aiBtn) : null, aiOut,
    h('div', { class: 'hint worked' }, h('b', {}, 'Spot it in real life'), h('span', {}, c.wild)),
    c.links?.length ? h('div', {}, h('div', { class: 'small muted', style: { marginBottom: '6px' } }, 'Connects to'), h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } }, ...c.links.filter(l => CONCEPT[l]).map(l => h('a', { class: 'chip', href: `#/finance/c/${l}` }, `${STATUS_IC[status(l)]} ${CONCEPT[l].t}`)))) : null,
    doneBtn));

  const L = LEVEL[c.lvl];
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, back(`#/finance/l/${c.lvl}`, L.t), h('h1', {}, c.t), h('div', { class: 'sub' }, `${c.g} · ${STATUS_IC[status(id)]} ${status(id)}`))),
    s1, s2, s3, s4, s5, s6));
  // returning learners see everything; new learners continue where they stopped
  const upTo = seenAll ? 6 : Math.max(1, st.stage || 1);
  stages.slice(0, upTo).forEach(s => s.show());
  if (upTo >= 3) { steps.forEach(s => s.classList.remove('hidden-step')); ans.style.display = ''; stepBtn.remove(); }
}
