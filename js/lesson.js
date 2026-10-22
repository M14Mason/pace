// Lesson player. Order follows how the student learns: the why -> a worked example
// revealed step by step (predict each step before tapping) -> key points -> a short
// check with hints only after a miss. Guidance fades: checks have no hints up front.
import { S, save, uid } from './store.js';
import { h, md, toast } from './ui.js';
import { startRound, onRoundFinish } from './quiz.js';
import * as fx from './fx.js';

export function renderLesson(root, { lesson, key, back, title, sub, check, area, req, tags }) {
  const done = S().lessons[key]?.done;
  const steps = lesson.ex.s.map((s, i) => h('div', { class: `worked-step${i ? ' hidden-step' : ''}` }, h('span', { class: 'ws-n' }, i + 1), h('div', { html: md(s) })));
  let shown = 1;
  const nextBtn = h('button', { class: 'btn sm primary' }, steps.length > 1 ? 'Next step' : 'Show answer');
  const answer = h('div', { class: 'explain', style: { display: 'none', marginTop: '10px' } }, h('b', {}, 'Answer: '), h('span', { html: md(lesson.ex.a) }));
  nextBtn.onclick = () => {
    if (shown < steps.length) { steps[shown].classList.remove('hidden-step'); fx.pop(steps[shown]); shown++; if (shown === steps.length) nextBtn.textContent = 'Show answer'; }
    else { answer.style.display = ''; fx.pop(answer); nextBtn.remove(); }
  };
  const saveKey = () => {
    S().log.unshift({ id: uid(), type: 'formula', text: `${title}: ${lesson.t}\n- ${lesson.key.join('\n- ')}`, tags: tags || [], ts: Date.now() });
    save(); toast('Saved key points to your Log', 'good');
  };
  root.append(h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: back, class: 'muted small' }, '← Back'), h('h1', {}, lesson.t), h('div', { class: 'sub' }, sub || title)), done ? h('span', { class: 'chip good' }, '✓ done') : null),
    h('div', { class: 'lesson-step' }, h('h3', {}, '1 · Why this matters'), h('p', { html: md(lesson.why) })),
    h('div', { class: 'lesson-step' }, h('h3', {}, '2 · Worked example'), h('p', { class: 'small muted' }, 'Try to predict each step before you reveal it.'),
      h('p', { html: md(`**${lesson.ex.p}**`) }), ...steps, h('div', { class: 'row', style: { marginTop: '10px' } }, nextBtn), answer),
    h('div', { class: 'lesson-step' }, h('h3', {}, '3 · Key points'), h('ul', { class: 'keybox' }, ...lesson.key.map(k => h('li', { html: md(k) }))),
      h('button', { class: 'btn sm ghost', onclick: saveKey }, '+ Save to Log')),
    h('div', { class: 'lesson-step' }, h('h3', {}, '4 · Check for understanding'),
      h('p', {}, check.length ? `${check.length} quick questions. No hints until you miss one - then they come back with hints until you get them.` : 'No check questions for this lesson yet.'),
      check.length ? h('button', { class: 'btn primary', onclick: () => startRound({ kind: 'lesson-check', meta: { key, back }, title: `Check · ${lesson.t}`, questions: check, area, req, tags }) }, 'Start check') :
        h('button', { class: 'btn', onclick: () => { markDone(key, 1); location.hash = back; } }, 'Mark as done'))));
}

function markDone(key, score) {
  const prev = S().lessons[key];
  S().lessons[key] = { done: true, score: Math.max(score, prev?.score || 0), ts: Date.now() };
  save();
}

onRoundFinish('lesson-check', res => {
  markDone(res.meta.key, res.acc);
  location.hash = res.meta.back;
  setTimeout(() => res.acc >= 0.8 ? toast(`Lesson done · ${Math.round(res.acc * 100)}% first try`, 'good') : toast('Lesson done - missed items are scheduled for review tomorrow'), 400);
});
