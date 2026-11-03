// You: progress, history, and settings - out of the way until you want them.
import { S, rangeStats, weekStreak } from '../store.js';
import { h, card, heatmap, fmtMin, pct } from '../ui.js';
import { SKILLS } from '../math/skills.js';
import { skillState } from '../mastery.js';

export function render(root) {
  const st = S();
  const r30 = rangeStats(30);
  const rank = SKILLS.reduce((a, s) => a + skillState(s.id).level, 0);
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, st.profile.name || 'You'), h('div', { class: 'sub' }, 'Your progress and settings.'))),
    h('div', { class: 'kpis', style: { marginBottom: '12px' } },
      kpi('Streak', `${weekStreak()} wk`), kpi('Last 30 days', fmtMin(r30.ms)), kpi('Accuracy', r30.q ? pct(r30.acc) : '-'), kpi('Math levels', `${rank}/${SKILLS.length * 8}`)),
    card('Activity', heatmap(20)),
    h('div', { class: 'list-links' },
      row('#/records', '🏆', 'Records & graphs', 'PRs, score highs, trends'),
      row('#/stats', '📅', 'Calendar & stats', 'Heatmap, calendar, readiness'),
      row('#/log', '📝', 'Log', 'Tips Pace taught you + your notes'),
      row('#/learn/cards', '▤', 'Flashcards', 'Your decks'),
      row('#/settings', '⚙️', 'Settings', 'Sync, Claude key, reminders, backups')));
}
const kpi = (l, v) => h('div', { class: 'kpi' }, h('div', { class: 'kpi-l' }, l), h('div', { class: 'kpi-v' }, v));
const row = (href, ic, t, d) => h('a', { class: 'link-row', href }, h('span', { class: 'tile-ic' }, ic), h('div', {}, h('b', {}, t), h('div', { class: 'small muted' }, d)), h('span', { class: 'muted' }, '›'));
