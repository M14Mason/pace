import { S, save, exportData, importData, resetAll } from '../store.js';
import { h, card, toast, seg } from '../ui.js';
import { testNtfy, randomTopic, scheduleReminders } from '../ntfy.js';
import { askJSON, aiErrorText } from '../ai.js';
import { COURSES, TERM_LABEL, termOf } from '../data/courses.js';
import { bgRetheme } from '../three-bg.js';

export function applyTheme() {
  const t = S().profile.theme || 'light';
  const root = document.documentElement;
  root.removeAttribute('data-theme'); root.removeAttribute('data-follow');
  if (t === 'dark') root.setAttribute('data-theme', 'dark');
  else if (t === 'auto') root.setAttribute('data-follow', '1');
  else root.setAttribute('data-theme', 'light');
  setTimeout(bgRetheme, 50);
}
applyTheme();

export function render(root) {
  const p = S().profile;
  const field = (label, el, help) => h('div', { class: 'field' }, h('label', {}, label), el, help && h('div', { class: 'small muted' }, help));
  const inp = (key, attrs = {}) => { const el = h('input', { class: 'input', value: p[key] || '', ...attrs }); el.onchange = () => { p[key] = el.value.trim(); save(); if (key.startsWith('ntfy') || key === 'reminderTime') scheduleReminders(); toast('Saved'); }; return el; };
  const key = inp('apiKey', { type: 'password', placeholder: 'sk-ant-…', autocomplete: 'off' });
  const topic = inp('ntfyTopic', { placeholder: 'pace-yourprivatetopic' });

  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Settings'), h('div', { class: 'sub' }, 'Everything is stored only on this device.'))),
    h('div', { class: 'grid g2' },
      card('You', h('div', { class: 'stack' }, field('Name', inp('name', { placeholder: 'First name' })),
        field('Required days per week', seg([3, 4, 5, 6].map(n => ({ label: String(n), value: n })), p.weeklyGoal, v => { p.weeklyGoal = v; save(); })),
        field('Theme', seg([{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'Auto', value: 'auto' }], p.theme || 'light', v => { p.theme = v; save(); applyTheme(); })),
        field('Sounds', seg([{ label: 'On', value: true }, { label: 'Off', value: false }], p.sound, v => { p.sound = v; save(); })))),
      card('Claude', h('div', { class: 'stack' },
        field('API key', key, 'Used for FRQ grading, DECA judging, speech analysis, memo grading and generating extra questions. Stored only in this browser and sent only to Anthropic. Get one at console.anthropic.com.'),
        h('button', { class: 'btn', onclick: async e => { const b = e.currentTarget; b.disabled = true; b.textContent = 'Testing…'; try { const r = await askJSON('Reply with ok=true.', { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'], additionalProperties: false }, { effort: 'low', maxTokens: 1000 }); toast(r.ok ? 'Claude is connected' : 'Unexpected reply', 'good'); } catch (err) { toast(aiErrorText(err), 'bad'); } b.disabled = false; b.textContent = 'Test connection'; } }, 'Test connection'))),
      card('Phone reminders (ntfy)', h('div', { class: 'stack' },
        h('ol', { class: 'small' }, h('li', {}, 'Install the free ntfy app on your iPhone.'), h('li', {}, 'Tap Generate below, then in ntfy tap + and subscribe to that exact topic.'), h('li', {}, 'Tap Send test.')),
        field('Topic', topic, 'Anyone who knows the topic name can read it, so keep it random. Reminder text is generic.'),
        h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: () => { p.ntfyTopic = randomTopic(); topic.value = p.ntfyTopic; save(); scheduleReminders(); } }, 'Generate'),
          h('button', { class: 'btn sm primary', onclick: async () => { try { toast((await testNtfy()) ? 'Sent - check your phone' : 'Set a topic first', 'good'); } catch { toast('Could not reach ntfy', 'bad'); } } }, 'Send test')),
        field('Daily study reminder', inp('reminderTime', { type: 'time' })),
        field('ntfy server', inp('ntfyServer'), 'Leave as https://ntfy.sh unless you self-host.'),
        h('p', { class: 'small muted' }, 'Each time you open Pace it queues the next ~2 days of reminders (study time, plus 3-day and 1-day test warnings).'))),
      card('School calendar', h('div', { class: 'stack' },
        ...Object.keys(p.terms).map(t => field(`${TERM_LABEL[t]} starts`, (() => { const el = h('input', { class: 'input', type: 'date', value: p.terms[t] }); el.onchange = () => { p.terms[t] = el.value; save(); toast('Saved'); }; return el; })())),
        h('p', { class: 'small muted' }, 'These are estimates - set your real dates so plans and readiness urgency are right.'))),
      card('Course terms', h('div', { class: 'stack' },
        h('p', { class: 'small muted' }, 'Move a course if your schedule changes (e.g. Math 3).'),
        ...COURSES.map(c => h('div', { class: 'row between' }, h('span', {}, c.name), (() => {
          const sel = h('select', { class: 'input', style: { width: 'auto' } }, ...Object.keys(TERM_LABEL).map(t => h('option', { value: t, selected: termOf(c) === t }, TERM_LABEL[t])));
          sel.onchange = () => { (S().courseTerms ||= {})[c.id] = sel.value; if (c.id === 'math3') p.math3Term = sel.value; save(); toast('Saved'); };
          return sel;
        })())))),
      card('Data', h('div', { class: 'stack' },
        h('p', { class: 'small' }, h('b', {}, 'Add Pace to your Home Screen: '), 'in Safari tap Share → Add to Home Screen. It opens full-screen and Safari is much less likely to clear your progress.'),
        h('div', { class: 'row' }, h('button', { class: 'btn', onclick: exportData }, 'Export backup'),
          (() => { const f = h('input', { type: 'file', accept: 'application/json', style: { display: 'none' } }); f.onchange = async () => { try { await importData(f.files[0]); toast('Backup restored', 'good'); location.reload(); } catch (e) { toast(e.message, 'bad'); } }; return h('label', { class: 'btn' }, f, 'Import backup'); })()),
        h('button', { class: 'btn ghost', onclick: () => { S().profile.placementDone = false; save(); location.hash = '#/placement'; } }, 'Retake placement test'),
        h('button', { class: 'btn ghost', style: { color: 'var(--bad)' }, onclick: () => { if (confirm('Erase ALL Pace data on this device? Export a backup first.')) { resetAll(); location.hash = '#/placement'; location.reload(); } } }, 'Erase all data')))));
}
