// Course registry + readiness math.
import apwh from './apworld.js';
import { chemistry, abm, spanish2, math3 } from './term2.js';
import { appsych, apbus, apush, aplang } from './ap11.js';
import { apecongov, physics, spanish3, precalc, busfin, persfin, english4 } from './later.js';
import { S, today, daysBetween } from '../store.js';

export const COURSES = [apwh, chemistry, abm, spanish2, math3, appsych, apbus, physics, apush, aplang, spanish3, apecongov, precalc, busfin, persfin, english4];
export const COURSE = Object.fromEntries(COURSES.map(c => [c.id, c]));

export const TERM_LABEL = { '10-T2': '10th · Term 2', '11-T1': '11th · Term 1', '11-T2': '11th · Term 2', '12-T1': '12th · Term 1', '12-T2': '12th · Term 2' };

export function termOf(c) {
  const ov = (S().courseTerms || {})[c.id];
  if (ov) return ov;
  if (c.term === 'math3') return S().profile.math3Term || '10-T2';
  return c.term;
}
export function termStart(c) { return S().profile.terms[termOf(c)]; }
export function daysUntilStart(c) { return daysBetween(today(), termStart(c)); }

// Sort by urgency: soonest term first, APs first within a term.
export function byPriority() {
  return [...COURSES].sort((a, b) => (termStart(a) > termStart(b) ? 1 : termStart(a) < termStart(b) ? -1 : (b.ap ? 1 : 0) - (a.ap ? 1 : 0)));
}

export const lessonKey = (c, u, l) => `${c.id}/${u.id}/${l.id}`;
export const qKey = (c, u, i) => `q:${c.id}/${u.id}/${i}`;

// Unit readiness = 40% lessons done + 60% question mastery (accuracy on seen questions,
// weighted by coverage). Course readiness = mean of units (+ diagnostic seed).
export function unitReadiness(c, u) {
  const st = S();
  const ls = u.lessons || [];
  const lessonPart = ls.length ? ls.filter(l => st.lessons[lessonKey(c, u, l)]?.done).length / ls.length : 0;
  const prefix = `q:${c.id}/${u.id}/`;
  const gprefix = `g:${c.id}/${u.id}/`;
  let seen = 0, right = 0;
  for (const [k, v] of Object.entries(st.qstats)) if (k.startsWith(prefix) || k.startsWith(gprefix)) { seen += v.seen; right += v.right; }
  const pool = (u.qs || []).length + (u.gen ? 8 : 0) + ((st.aiBank[`${c.id}/${u.id}`] || []).length);
  const coverage = Math.min(1, seen / Math.max(6, pool));
  const acc = seen ? right / seen : 0;
  return 0.4 * lessonPart + 0.6 * acc * coverage;
}
export function courseReadiness(c) {
  const us = c.units.map(u => unitReadiness(c, u));
  const base = us.reduce((a, b) => a + b, 0) / Math.max(1, us.length);
  const seed = (S().courseSelf[c.id] || 0) * 0.15;
  return Math.min(1, base + seed * (1 - base));
}
