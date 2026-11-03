// Mastery: levels go up from everyday practice, not pass/fail tests.
// A level is mastered when 8 of your last 10 answers at that level are right
// at a comfortable pace (median ≤ 1.5× the speed target). Speed beyond that is a
// bonus "fluency" star, never a gate.
import { S, save, addRecord } from './store.js';
import { SKILL } from './math/skills.js';

export const skillState = id => (S().skills[id] ||= { level: 1, rounds: [], gate: null, best: {}, recent: [] });

const median = a => { if (!a.length) return Infinity; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };

// Record one first-try math answer; returns a level-up event or null.
export function recordMathAnswer(skill, level, ok, ms) {
  if (!SKILL[skill]) return null;
  const st = skillState(skill);
  (st.recent ||= []).push({ L: level, ok, ms, ts: Date.now() });
  st.recent = st.recent.slice(-40);
  st.gate = null; // old gate screens are gone
  if (level !== st.level) return null;
  const atLevel = st.recent.filter(r => r.L === st.level).slice(-10);
  if (atLevel.length < 10) return null;
  const right = atLevel.filter(r => r.ok);
  const target = SKILL[skill].targets[st.level - 1];
  const med = median(right.map(r => r.ms));
  if (right.length >= 8 && med <= target * 1.5) {
    if (med <= target) (st.fluent ||= {})[st.level] = true; // ⚡ fluency star
    st.best[st.level] = Math.min(st.best[st.level] ?? Infinity, med);
    if (st.level < 8) {
      st.level++;
      addRecord('level', `${SKILL[skill].name} reached Level ${st.level}`, st.level);
      save();
      return { skill, name: SKILL[skill].name, level: st.level };
    }
  }
  save();
  return null;
}

// Progress toward the next level, 0..1 (for progress bars).
export function levelProgress(id) {
  const st = skillState(id);
  const at = (st.recent || []).filter(r => r.L === st.level).slice(-10);
  return Math.min(1, at.filter(r => r.ok).length / 8);
}

// One-time cleanup of the old gate system (keeps all data).
export function migrateMastery() {
  for (const st of Object.values(S().skills || {})) { st.gate = null; st.recent ||= []; }
}
