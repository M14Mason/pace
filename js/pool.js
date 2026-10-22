// Question pools: turns course banks, generators and Claude-generated questions into
// engine questions with stable keys (so stats + spaced review work across sessions).
import { S, save, uid } from './store.js';
import { fromBank } from './quiz.js';
import { COURSE } from './data/courses.js';
import { FIN_UNITS, DECA } from './data/finance.js';
import { makeQ } from './math/skills.js';
import { scenarioQ, PACK } from './math/scenarios.js';
import { shuffle } from './ui.js';

function unitOf(src, cid, uid_) {
  if (src === 'fin') return FIN_UNITS.find(u => u.id === uid_);
  if (src === 'deca') return DECA.clusters.find(u => u.id === uid_);
  const c = COURSE[cid]; return c && c.units.find(u => u.id === uid_);
}

// Pool entries: { key, make: () => engineQ }
export function unitPool(c, u, src = 'course') {
  const cid = c ? c.id : src;
  const out = [];
  (u.qs || []).forEach((b, i) => out.push({ key: `q:${cid}/${u.id}/${i}`, make: () => ({ ...fromBank(b, `q:${cid}/${u.id}/${i}`), srs: true, src: cid }) }));
  (u.gen || []).forEach((g, gi) => out.push({ key: `g:${cid}/${u.id}/${gi}`, gen: true, make: () => ({ ...fromBank(g(), `g:${cid}/${u.id}/${gi}`), srs: true, src: cid }) }));
  (S().aiBank[`${cid}/${u.id}`] || []).forEach((b, i) => out.push({ key: `a:${cid}/${u.id}/${i}`, make: () => ({ ...fromBank(b, `a:${cid}/${u.id}/${i}`), srs: true, src: cid }) }));
  return out;
}

// Build n questions: prioritise unseen + low-accuracy, include generators repeatedly.
export function buildSet(pool, n) {
  const st = S().qstats;
  const score = p => { const s = st[p.key]; if (!s) return -1 + Math.random() * 0.2; return s.right / s.seen + Math.random() * 0.25; };
  const fixed = pool.filter(p => !p.gen).sort((a, b) => score(a) - score(b));
  const gens = pool.filter(p => p.gen);
  const out = fixed.slice(0, gens.length ? Math.ceil(n * 0.6) : n).map(p => p.make());
  for (let i = 0; out.length < n && gens.length; i++) out.push(gens[i % gens.length].make());
  for (let i = out.length; out.length < n && i < fixed.length; i++) out.push(fixed[i].make());
  return shuffle(out);
}

// Recreate a question from its key (for spaced review).
export function resolveKey(key) {
  const [kind, rest] = [key.slice(0, 1), key.slice(2)];
  if (key.startsWith('scen:')) { const id = key.split(':')[1]; return PACK[id] ? { ...scenarioQ(id), srs: true } : null; }
  if (key.startsWith('math:')) { const [, skill, L] = key.split(':'); return { ...makeQ(skill, +L, 'free'), key, srs: true }; }
  const [cid, uidv, idx] = rest.split('/');
  if (kind === 'a') { const b = (S().aiBank[`${cid}/${uidv}`] || [])[idx]; if (b) return { ...fromBank(b, key), srs: true, src: cid }; }
  const src = cid === 'fin' ? 'fin' : cid === 'deca' ? 'deca' : 'course';
  const u = unitOf(src, cid, uidv);
  if (!u) return null;
  if (kind === 'q' && u.qs && u.qs[idx]) return { ...fromBank(u.qs[idx], key), srs: true, src: cid };
  if (kind === 'g' && u.gen && u.gen[idx]) return { ...fromBank(u.gen[idx](), key), srs: true, src: cid };
  if (kind === 'a') { const b = (S().aiBank[`${cid}/${uidv}`] || [])[idx]; if (b) return { ...fromBank(b, key), srs: true, src: cid }; }
  return null;
}

export function addAIQuestions(cid, unitId, qs) {
  const k = `${cid}/${unitId}`;
  const valid = qs.filter(q => q && q.q && Array.isArray(q.c) && q.c.length >= 2 && Number.isInteger(q.a) && q.a >= 0 && q.a < q.c.length)
    .map(q => ({ q: q.q, c: [q.c[q.a], ...q.c.filter((_, i) => i !== q.a)], a: 0, e: q.e, h: q.h || [], ai: true, id: uid() }));
  S().aiBank[k] = [...(S().aiBank[k] || []), ...valid];
  save();
  return valid.length;
}
