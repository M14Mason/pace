// Homework helper: photo or text -> the concept -> small steps with a hint before each
// result -> final answer -> 3 similar problems (into spaced review) -> key idea to the Log.
import { S, save, uid, recordActivity } from '../store.js';
import { h, card, toast, md, seg } from '../ui.js';
import { hasAI, homeworkHelp, imageBlock, aiErrorText } from '../ai.js';
import { startRound, onRoundFinish, fromBank } from '../quiz.js';
import { addAIQuestions } from '../pool.js';
import * as fx from '../fx.js';

const SUBJECTS = ['Math', 'Chemistry', 'Physics', 'Spanish', 'Other'];
const TAG = { Math: 'math3', Chemistry: 'chem', Physics: 'phys', Spanish: 'span2', Other: 'general' };

onRoundFinish('hw-similar', res => { location.hash = '#/learn/help'; setTimeout(() => toast(res.acc === 1 ? 'Locked in. It will come back for review.' : 'Misses are scheduled for review.', res.acc === 1 ? 'good' : ''), 400); });

export function render(root) {
  const st = S();
  let subject = st.hwSubject || 'Math';
  const file = h('input', { type: 'file', accept: 'image/*', capture: 'environment', class: 'input' });
  const ta = h('textarea', { class: 'input', rows: 5, placeholder: 'Type or paste the problem. Add where you\'re stuck, e.g. "I got x = 4 but the answer is 2".' });
  const out = h('div', { class: 'stack' });
  const go = h('button', { class: 'btn primary wide', disabled: !hasAI() }, hasAI() ? 'Help me with this' : 'Add a Claude key in Settings first');
  go.onclick = async () => {
    if (!file.files[0] && ta.value.trim().length < 8) return toast('Add a photo or type the problem.');
    go.disabled = true; go.textContent = 'Reading the problem…';
    const t0 = Date.now();
    try {
      const image = file.files[0] ? await imageBlock(file.files[0]) : null;
      file.value = ''; // photo is not kept
      const r = await homeworkHelp({ text: ta.value, image, subject });
      showWalkthrough(out, r, subject, t0);
    } catch (e) { toast(aiErrorText(e), 'bad'); }
    go.disabled = false; go.textContent = 'Help me with another';
  };
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/learn', class: 'muted small' }, '← Learn'), h('h1', {}, 'Homework helper'), h('div', { class: 'sub' }, 'Hints first, answers last - you do the steps.'))),
    card('', h('div', { class: 'stack' },
      seg(SUBJECTS.map(s => ({ label: s, value: s })), subject, v => { subject = st.hwSubject = v; save(); }),
      h('label', { class: 'small', style: { fontWeight: 600 } }, '📷 Photo of the problem'), file,
      h('label', { class: 'small', style: { fontWeight: 600 } }, '…or type it'), ta, go,
      h('p', { class: 'small muted' }, 'Photos are sent to Claude to read and are not saved on your device.'))),
    out));
}

function showWalkthrough(out, r, subject, t0) {
  out.innerHTML = '';
  let shown = 0;
  const stepsBox = h('div', { class: 'stack' });
  const finalBox = h('div');
  const nextStep = () => {
    if (shown >= r.steps.length) return showFinal();
    const s = r.steps[shown]; const n = ++shown;
    const result = h('div', { class: 'explain', style: { display: 'none' } }, h('b', {}, 'Step result: '), h('span', { html: md(s.result) }));
    const hint = h('div', { class: 'hint', style: { display: 'none' } }, h('b', {}, 'Hint'), ' ', h('span', { html: md(s.hint) }));
    const attempt = h('input', { class: 'input', placeholder: 'Your answer for this step (optional)' });
    const hintBtn = h('button', { class: 'btn sm', onclick: () => { hint.style.display = ''; fx.pop(hint); hintBtn.remove(); } }, 'Hint');
    const checkBtn = h('button', { class: 'btn sm primary', onclick: () => {
      result.style.display = ''; fx.pop(result);
      checkBtn.remove(); hintBtn.remove();
      el.append(h('div', { class: 'row' }, h('button', { class: 'btn sm good', onclick: e => { fx.correct(el); e.currentTarget.parentElement.remove(); nextStep(); } }, 'I had it ✓'), h('button', { class: 'btn sm', onclick: e => { e.currentTarget.parentElement.remove(); nextStep(); } }, 'Got it now →')));
    } }, 'Check step');
    const el = h('div', { class: 'lesson-step' }, h('div', { class: 'worked-step' }, h('span', { class: 'ws-n' }, n), h('div', { html: md(s.ask) })), attempt, h('div', { class: 'row', style: { margin: '8px 0' } }, hintBtn, checkBtn), hint, result);
    stepsBox.append(el); fx.pop(el);
  };
  const showFinal = () => {
    finalBox.innerHTML = '';
    const qs = r.similar.slice(0, 3).filter(q => q.c && q.c.length > 1);
    finalBox.append(
      h('div', { class: 'lesson-step' }, h('h3', {}, 'Answer'), h('p', { html: md(`**${r.final}**`) })),
      h('div', { class: 'lesson-step' }, h('h3', {}, 'Lock it in'), h('p', { class: 'small muted' }, '3 similar problems now. They also go into spaced review, and the key idea goes to your Log.'),
        h('button', { class: 'btn primary', onclick: () => {
          const unit = `hw-${Date.now().toString(36)}`;
          addAIQuestions('hw', unit, qs);
          const bank = S().aiBank[`hw/${unit}`] || [];
          startRound({ kind: 'hw-similar', title: 'Similar problems', questions: bank.map((b, i) => ({ ...fromBank(b, `a:hw/${unit}/${i}`), srs: true })), area: TAG[subject], tags: [TAG[subject]] });
        } }, 'Start 3 similar problems')));
    fx.stagger([...finalBox.children]);
    S().log.unshift({ id: uid(), type: 'formula', text: `${subject}: ${r.keyIdea}\n(from: ${r.problem.slice(0, 100)})`, tags: [TAG[subject], 'homework'], ts: Date.now() });
    recordActivity({ area: TAG[subject], ms: Date.now() - t0 });
    save();
  };
  out.append(
    card('The problem', h('p', { html: md(r.problem) })),
    h('div', { class: 'lesson-step' }, h('h3', {}, 'The idea behind it'), h('p', { html: md(r.concept) })),
    stepsBox, finalBox);
  fx.stagger([...out.children]);
  nextStep();
}
