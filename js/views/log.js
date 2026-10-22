// Log: tips, mistakes, formulas, strategies, reflections. Tagged entries resurface
// automatically during practice of the same skill/course.
import { S, save, uid, removeById } from '../store.js';
import { h, card, toast, seg } from '../ui.js';
import { COURSES } from '../data/courses.js';
import { SKILLS } from '../math/skills.js';
import * as fx from '../fx.js';

const TYPES = [['tip', 'Tip'], ['mistake', 'Mistake'], ['formula', 'Formula'], ['strategy', 'Strategy'], ['reflection', 'Reflection']];
const TAGS = [['math', 'Math (all)'], ...SKILLS.map(s => [s.id, `Math · ${s.name}`]), ...COURSES.map(c => [c.id, c.short]), ['finance', 'Finance'], ['deca', 'DECA'], ['speak', 'Speak']];
const TAGNAME = Object.fromEntries(TAGS);

export function render(root) {
  const st = S();
  let type = 'tip', filter = st.logFilter || 'all', q = '';
  const ta = h('textarea', { class: 'input', rows: 3, placeholder: 'e.g. "15% tip = 10% + half of it" or "I keep mixing up proactive/retroactive interference"' });
  const tagSel = h('select', { class: 'input' }, h('option', { value: '' }, 'Tag (where should this resurface?)'), ...TAGS.map(([v, l]) => h('option', { value: v }, l)));
  const listEl = h('div', { class: 'stack' });
  const add = () => {
    const text = ta.value.trim(); if (!text) return;
    st.log.unshift({ id: uid(), type, text, tags: tagSel.value ? [tagSel.value] : guessTags(text), ts: Date.now() });
    save(); ta.value = ''; draw(); toast('Saved', 'good');
    fx.pop(listEl.firstElementChild);
  };
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) add(); });
  const search = h('input', { class: 'input', placeholder: 'Search your log…', oninput: e => { q = e.target.value.toLowerCase(); draw(); } });
  function draw() {
    listEl.innerHTML = '';
    const items = st.log.filter(e => (filter === 'all' || e.type === filter) && (!q || e.text.toLowerCase().includes(q)));
    if (!items.length) listEl.append(h('p', { class: 'empty' }, 'Nothing here yet. Save tips while you study - Pace brings them back at the right moment.'));
    items.forEach(e => listEl.append(h('div', { class: 'log-item' },
      h('div', { class: 'row between' }, h('span', { class: `lt ${e.type}` }, e.type), h('span', { class: 'small muted' }, new Date(e.ts).toLocaleDateString())),
      h('div', { class: 'log-text' }, e.text),
      h('div', { class: 'row between' }, h('div', { class: 'pill-row' }, ...(e.tags || []).map(t => h('span', { class: 'chip' }, TAGNAME[t] || t))),
        h('button', { class: 'btn sm ghost', onclick: () => { if (!confirm('Delete this entry?')) return; removeById('log', e.id); draw(); } }, 'Delete')))));
  }
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Log'), h('div', { class: 'sub' }, `${st.log.length} entries · tagged entries pop up during matching practice`))),
    card('New entry', h('div', { class: 'stack' }, seg(TYPES.map(([value, label]) => ({ value, label })), type, v => (type = v)), ta, tagSel,
      h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: add }, 'Save'), h('span', { class: 'small muted' }, '⌘/Ctrl + Enter')))),
    h('div', { class: 'row', style: { margin: '14px 0 10px' } }, seg([{ value: 'all', label: 'All' }, ...TYPES.map(([value, label]) => ({ value, label }))], filter, v => { filter = v; st.logFilter = v; save(); draw(); })),
    h('div', { style: { marginBottom: '10px' } }, search),
    listEl);
  draw();
}

// Light auto-tagging when no tag is picked.
function guessTags(text) {
  const t = text.toLowerCase(), out = [];
  const kw = { tip: ['tip'], disc: ['discount', '% off', 'sale'], tax: ['tax'], pct: ['percent', '%'], frac: ['fraction'], ratio: ['ratio', 'rate', 'unit price'], mul: ['times', 'multiply'], div: ['divide'], fin: ['interest', 'markup', 'margin', 'p/e'],
    apwh: ['empire', 'dynasty', 'revolution', 'apwh', 'ap world', 'saq', 'dbq', 'leq'], chem: ['mole', 'molar', 'ph', 'gas', 'chem'], span2: ['spanish', 'preterite', 'imperfect', 'conjug'], abm: ['management', 'swot', 'maslow', 'herzberg'], finance: ['stock', 'bond', 'etf', 'cash flow', 'balance sheet'], deca: ['deca', 'roleplay', 'judge'] };
  for (const [k, ws] of Object.entries(kw)) if (ws.some(w => t.includes(w))) out.push(k);
  if (out.some(k => SKILLS.find(s => s.id === k))) out.push('math');
  return out.length ? out : ['general'];
}
