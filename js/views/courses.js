// Courses: everything you study, in the order you'll need it.
import { S } from '../store.js';
import { h, bar, pct } from '../ui.js';
import { byPriority, courseReadiness, termOf, TERM_LABEL, unitReadiness } from '../data/courses.js';

export function render(root) {
  const cs = byPriority();
  const firstTerm = termOf(cs[0]);
  const now = cs.filter(c => termOf(c) === firstTerm);
  const later = cs.filter(c => termOf(c) !== firstTerm);
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Courses'), h('div', { class: 'sub' }, 'Read first, then practice. Your daily session picks the next step for you.'))),
    h('h3', { class: 'section-h' }, `Up next · ${TERM_LABEL[firstTerm]}`),
    h('div', { class: 'grid g2' }, ...now.map(courseTile)),
    h('a', { class: 'link-row', href: '#/finance', style: { marginTop: '16px' } }, h('span', { class: 'tile-ic' }, '💹'), h('div', {}, h('b', {}, 'Finance & DECA'), h('div', { class: 'small muted' }, 'Now in its own Finance tab')), h('span', { class: 'muted' }, '›')),
    h('details', { class: 'later' }, h('summary', { class: 'section-h' }, `Later courses (${later.length})`),
      h('div', { class: 'grid g2', style: { marginTop: '10px' } }, ...later.map(courseTile))));
}

function courseTile(c) {
  const r = courseReadiness(c);
  const rd = S().readDone || {};
  const next = c.units.find(u => !rd[`${c.id}/${u.id}`]);
  return h('a', { class: 'tile', href: `#/prep/${c.id}` },
    h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic', style: { background: c.color + '1A', color: c.color } }, c.short.slice(0, 2)), c.ap ? h('span', { class: 'chip gold' }, 'AP') : h('span', { class: 'chip' }, pct(r))),
    h('h4', {}, c.name),
    h('div', { class: 'muted' }, next ? `Next: ${next.t}` : 'All units read - keep practicing'),
    h('div', { style: { marginTop: '10px' } }, bar(r)));
}
