// Read & annotate: the teaching step before any quiz.
// Why it matters -> guiding questions -> short sections (bold key terms, teacher margin
// notes, worked examples revealed step by step) -> "recall it" after each section ->
// recap -> your own 3-sentence summary. Tap sentences with a pen to highlight.
import { S, save, uid, autoLog, recordActivity } from '../store.js';
import { h, md, toast, card } from '../ui.js';
import { READINGS } from '../data/readings/index.js';
import { hasAI, gradeShort, aiErrorText } from '../ai.js';
import { addCards } from './cards.js';
import * as fx from '../fx.js';

export const readKey = (c, u) => `${c.id}/${u.id}`;
export const readDone = (c, u) => !!(S().readDone || {})[readKey(c, u)];
export const hasReading = (c, u) => !!READINGS[readKey(c, u)] || (u.lessons || []).length > 0;

const PENS = [
  { id: 'key', label: 'Key idea', cls: 'pen-key' },
  { id: 'ex', label: 'Example', cls: 'pen-ex' },
  { id: 'q', label: 'Confused', cls: 'pen-q' },
  { id: 'note', label: 'Note', cls: 'pen-note' },
  { id: 'off', label: 'Erase', cls: '' },
];
const sentences = p => p.split(/(?<=[.!?])\s+(?=[A-Z0-9"(“¿¡*])/);

// Build a reading from hand-written text, folding in the unit's worked examples.
function build(c, u) {
  const r = READINGS[readKey(c, u)];
  const lessons = u.lessons || [];
  if (r) return { ...r, examples: lessons.map(l => l.ex).filter(Boolean), keys: lessons.flatMap(l => l.key || []) };
  // fallback (should be rare): teach from the lessons themselves
  return {
    why: lessons[0]?.why || u.topics, guide: lessons.map(l => `What is the main idea of "${l.t}"?`).slice(0, 3),
    s: lessons.map(l => [l.t, l.why, ...l.key.map(k => k)]), notes: {}, recall: lessons.map(l => [`Explain "${l.t}" in one sentence.`, l.key[0]]), recap: lessons.flatMap(l => l.key).slice(0, 5),
    examples: lessons.map(l => l.ex).filter(Boolean), keys: [],
  };
}

export function renderReading(root, { c, u, back, area, tags }) {
  const key = readKey(c, u);
  const R = build(c, u);
  const marks = ((S().marks ||= {})[key] ||= { ts: 0, m: {} });
  let pen = 'key';
  const t0 = Date.now();
  const noteNodes = {};

  const penBar = h('div', { class: 'penbar' }, ...PENS.map(p => h('button', { class: `pen ${p.cls}${p.id === pen ? ' on' : ''}`, 'data-pen': p.id, onclick: e => { pen = p.id; penBar.querySelectorAll('.pen').forEach(b => b.classList.toggle('on', b.dataset.pen === pen)); fx.press(e.currentTarget); } }, p.label)));

  function paint(span, id) {
    const mk = marks.m[id];
    span.className = 'sent' + (mk ? ' ' + (PENS.find(p => p.id === mk.pen)?.cls || '') : '');
    noteNodes[id]?.remove(); delete noteNodes[id];
    if (mk && mk.note) { const n = h('div', { class: 'mynote' }, '✎ ', mk.note); span.after(n); noteNodes[id] = n; }
    if (mk && mk.pen === 'q') {
      const n = h('div', { class: 'mynote q' }, h('button', { class: 'btn sm', onclick: () => explain(span.textContent, n) }, hasAI() ? 'Re-explain this simpler' : 'Flagged - ask in Homework helper or add a note'));
      span.after(n); noteNodes[id] = n;
    }
  }
  async function explain(text, box) {
    if (!hasAI()) return toast('Add a Claude key in Settings for re-explanations.');
    box.innerHTML = 'Thinking…';
    try {
      const r = await gradeShort({ context: `${c.name} - ${u.t}. The student flagged this sentence as confusing while reading.`, question: `Re-explain this simply, with an everyday analogy and one concrete example: "${text}"`, answer: '(student is asking for help)', key: 'Give the clearest explanation in "better".' });
      box.innerHTML = ''; box.append(h('div', { html: md(r.better) }));
    } catch (e) { box.textContent = aiErrorText(e); }
  }
  function tapSentence(span, id) {
    const prev = marks.m[id];
    if (pen === 'off') delete marks.m[id];
    else if (pen === 'note') { const t = prompt('Your note for this sentence:', prev?.note || ''); if (t == null) return; marks.m[id] = { pen: prev?.pen || 'note', note: t.trim() }; }
    else if (prev && prev.pen === pen && !prev.note) delete marks.m[id];
    else marks.m[id] = { ...(prev || {}), pen };
    marks.ts = Date.now(); save();
    if (pen === 'key' && marks.m[id]) autoLog('tip', span.textContent.replace(/\*\*/g, ''), [c.id, u.id], 'hl:' + key + id);
    paint(span, id); fx.pop(span);
  }

  const noteFor = text => Object.entries(R.notes || {}).find(([phrase]) => text.includes(phrase));
  const para = (text, sid) => {
    const p = h('p', { class: 'reading-p' });
    sentences(text).forEach((s, i) => {
      const id = `${sid}.${i}`;
      const span = h('span', { class: 'sent', html: md(s) + ' ', onclick: () => tapSentence(span, id) });
      p.append(span);
      const n = noteFor(s);
      if (n) p.append(h('button', { class: 'margin-dot', title: 'Teacher note', onclick: e => { const box = e.currentTarget.nextElementSibling; box.hidden = !box.hidden; if (!box.hidden) fx.pop(box); } }, 'i'), h('span', { class: 'margin-note', hidden: true, html: md(n[1]) }));
      requestAnimationFrame(() => paint(span, id));
    });
    return p;
  };
  const exampleBlock = ex => {
    const steps = ex.s.map((s, i) => h('div', { class: `worked-step${i ? ' hidden-step' : ''}` }, h('span', { class: 'ws-n' }, i + 1), h('div', { html: md(s) })));
    let shown = 1;
    const btn = h('button', { class: 'btn sm primary', onclick: () => { if (shown < steps.length) { steps[shown].classList.remove('hidden-step'); fx.pop(steps[shown]); shown++; if (shown === steps.length) btn.textContent = 'Show answer'; } else { btn.replaceWith(h('div', { class: 'explain', html: md('**Answer:** ' + ex.a) })); } } }, steps.length > 1 ? 'Next step' : 'Show answer');
    return h('div', { class: 'reading-ex' }, h('div', { class: 'small muted', style: { fontWeight: 600, marginBottom: '4px' } }, 'WORKED EXAMPLE - predict each step first'), h('p', { html: md(`**${ex.p}**`) }), ...steps, h('div', { style: { marginTop: '8px' } }, btn));
  };
  const recallBlock = ([q, a]) => {
    const ans = h('div', { class: 'explain', hidden: true, html: md(a) });
    const b = h('button', { class: 'btn sm', onclick: () => { ans.hidden = false; fx.pop(ans); b.remove(); } }, 'Reveal');
    return h('div', { class: 'recall' }, h('div', { class: 'small', style: { fontWeight: 700, color: 'var(--accent)' } }, 'RECALL IT - answer in your head before revealing'), h('p', { html: md(q) }), b, ans);
  };

  const body = h('div', { class: 'reading' });
  R.s.forEach(([heading, ...paras], si) => {
    body.append(h('h3', { class: 'reading-h' }, heading), ...paras.map((t, pi) => para(t, `${si}.${pi}`)));
    if (si === 0 && R.examples[0]) body.append(exampleBlock(R.examples[0]));
    if (si === R.s.length - 1) R.examples.slice(1).forEach(ex => body.append(exampleBlock(ex)));
    if (R.recall[si]) body.append(recallBlock(R.recall[si]));
  });

  const sumTa = h('textarea', { class: 'input', rows: 4, placeholder: 'In your own words: what are the 3 most important ideas, and how do they connect?' }, (S().summaries || {})[key] || '');
  sumTa.oninput = () => { (S().summaries ||= {})[key] = sumTa.value; save(); };
  const fb = h('div');
  const finish = h('button', { class: 'btn primary wide' }, readDone(c, u) ? 'Reading done ✓ - go practice' : 'Finish reading → unlock practice');
  finish.onclick = async () => {
    if (sumTa.value.trim().split(/\s+/).length < 12) return toast('Write your summary first (2-3 sentences) - it\'s what makes it stick.');
    (S().readDone ||= {})[key] = Date.now();
    recordActivity({ area, ms: Date.now() - t0, req: c.ap ? 'ap' : null });
    autoLog('reflection', `${c.short} · ${u.t} - my summary:\n${sumTa.value.trim()}`, [c.id, u.id], 'sum:' + key);
    save();
    if (hasAI() && !fb.dataset.done) {
      fb.dataset.done = 1; finish.disabled = true; finish.textContent = 'Checking your summary…';
      try {
        const g = await gradeShort({ context: `${c.name}: ${u.t}. Key ideas: ${R.recap.join(' | ')}`, question: 'Summarize the most important ideas of this reading in your own words.', answer: sumTa.value, key: R.recap.join(' ') });
        fb.append(h('div', { class: 'hint worked' }, h('b', {}, `Summary: ${g.score}/100`), g.missing.length ? h('div', {}, 'Missing: ', g.missing.join('; ')) : null, h('div', { class: 'small', style: { marginTop: '6px' } }, 'Stronger version: ', g.better)));
      } catch (e) { /* summary feedback is optional */ }
      finish.disabled = false; finish.textContent = 'Go practice →';
      finish.onclick = () => (location.hash = back);
      return;
    }
    location.hash = back;
    setTimeout(() => toast('Reading done - practice is unlocked', 'good'), 400);
  };

  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: back, class: 'muted small' }, '← Unit'), h('h1', {}, u.t), h('div', { class: 'sub' }, `${c.name} · Read & annotate`))),
    h('div', { class: 'lesson-step' }, h('h3', {}, 'Why this matters'), h('p', { html: md(R.why) }),
      h('h3', { style: { marginTop: '12px' } }, 'Keep these questions in mind'), h('ol', {}, ...R.guide.map(g => h('li', { html: md(g) })))),
    h('div', { class: 'pen-sticky' }, penBar, h('div', { class: 'small muted', style: { marginTop: '4px' } }, 'Pick a pen, then tap any sentence. Tap again to remove. ⓘ = teacher note.')),
    body,
    h('div', { class: 'lesson-step' }, h('h3', {}, 'Recap'), h('ul', { class: 'keybox' }, ...R.recap.map(k => h('li', { html: md(k) })))),
    h('div', { class: 'lesson-step' }, h('h3', {}, 'Your summary (3 sentences)'), sumTa, h('div', { class: 'row', style: { margin: '10px 0' } },
      h('button', { class: 'btn sm ghost', onclick: () => {
        const spans = [...body.querySelectorAll('.sent')].filter(s => /pen-key|pen-ex/.test(s.className));
        if (!spans.length) return toast('Highlight some key ideas first.');
        // front = the sentence with its bold key term blanked out; back = the full sentence
        const cards = spans.map(s => { const term = s.querySelector('b')?.textContent; const t = s.textContent.trim(); return term ? { front: t.replace(term, '_____'), back: `${term} - ${t}` } : { front: `Explain: ${t.split(' ').slice(0, 6).join(' ')}…`, back: t }; });
        toast(`Made ${addCards(`${c.short} · ${u.t}`, cards, 'highlights')} flashcards from your highlights`, 'good');
      } }, 'Make flashcards from my highlights')), fb, finish)));
}
