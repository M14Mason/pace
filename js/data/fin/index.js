// Finance tab: four levels of concepts. Each concept is also a "unit" for the question pool,
// so spaced review, stats and the daily session work on it like any course unit.
import fundamentals from './fundamentals.js';
import advanced from './advanced.js';
import capstone from './capstone.js';
import deca from './deca.js';
import { S } from '../../store.js';

export const LEVELS = [
  { id: 'fund', t: 'Fundamentals', ic: '①', sub: 'Keep a business alive: liquidity, records, costs and cash.', list: fundamentals },
  { id: 'adv', t: 'Advanced', ic: '②', sub: 'Grow profitably: margins, returns, funding and risk.', list: advanced },
  { id: 'cap', t: 'Capstone', ic: '③', sub: 'Think like a CFO: valuation, capital allocation and deals.', list: capstone },
  { id: 'deca', t: 'DECA', ic: 'D', sub: 'Finance exam concepts, roleplays, the exam course and Financial Consulting.', list: deca },
];
export const LEVEL = Object.fromEntries(LEVELS.map(l => [l.id, l]));
export const CONCEPTS = LEVELS.flatMap(l => l.list.map(c => ({ ...c, lvl: l.id })));
export const CONCEPT = Object.fromEntries(CONCEPTS.map(c => [c.id, c]));

// Pool adapter: concept questions + scenario questions are the bank; the generator is endless practice.
export const FINX = { id: 'finx', name: 'Finance', short: 'Finance', src: 'finx' };
const units = {};
export function finxUnit(id) {
  const c = CONCEPT[id]; if (!c) return null;
  return units[id] ||= { id, t: c.t, topics: c.def, qs: [...c.qs, ...c.sc.map(s => ({ ...s.q, q: `${s.s} ${s.q.q}` }))], gen: c.gen ? [c.gen] : [] };
}
export const keysOf = id => { const u = finxUnit(id); return [...u.qs.map((_, i) => `q:finx/${id}/${i}`), ...u.gen.map((_, i) => `g:finx/${id}/${i}`)]; };

// Status: new → learning (completed the lesson) → remembered (recalled on spaced reviews across days).
export function status(id) {
  const st = S();
  if (!(st.fin || {})[id]?.done) return 'new';
  const strong = keysOf(id).filter(k => (st.srs[k]?.reps || 0) >= 2).length;
  return strong >= 2 ? 'remembered' : 'learning';
}
export const STATUS_IC = { new: '○', learning: '◐', remembered: '★' };

// Suggested path: Fundamentals → Advanced → Capstone (DECA is its own track).
export const PATH = CONCEPTS.filter(c => c.lvl !== 'deca');
export const nextUp = (lvl = null) => (lvl ? CONCEPTS.filter(c => c.lvl === lvl) : PATH).find(c => status(c.id) === 'new');
export const levelProgress = lvl => { const l = CONCEPTS.filter(c => c.lvl === lvl); const s = l.map(c => status(c.id)); return { n: l.length, learned: s.filter(x => x !== 'new').length, remembered: s.filter(x => x === 'remembered').length }; };
export const isFinKey = k => k.includes(':finx/');
