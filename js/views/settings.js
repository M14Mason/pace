import { S, save, exportData, importData, resetAll } from '../store.js';
import { h, card, toast, seg, bar } from '../ui.js';
import { testNtfy, randomTopic, scheduleReminders } from '../ntfy.js';
import { askJSON, aiErrorText, MODES, FEATURES, PRICES, modelFor, usageMonth, recentCalls, thisMonth } from '../ai.js';
import { COURSES, TERM_LABEL, termOf } from '../data/courses.js';
import { bgRetheme } from '../three-bg.js';
import { cfg, isLinked, setupSync, linkWithCode, linkCode, syncNow, unlink, onSyncStatus, syncStatus } from '../sync.js';

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
  const inp = (key, attrs = {}) => { const el = h('input', { class: 'input', value: p[key] || '', ...attrs }); el.onchange = () => { p[key] = el.value.trim(); p.updatedAt = Date.now(); save(); if (key.startsWith('ntfy') || key === 'reminderTime') scheduleReminders(); toast('Saved'); }; return el; };
  const key = inp('apiKey', { type: 'password', placeholder: 'sk-ant-…', autocomplete: 'off' });
  const topic = inp('ntfyTopic', { placeholder: 'pace-yourprivatetopic' });

  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Settings'), h('div', { class: 'sub' }, 'Everything is stored only on this device.'))),
    h('div', { class: 'grid g2' },
      card('You', h('div', { class: 'stack' }, field('Name', inp('name', { placeholder: 'First name' })),
        field('Required days per week', seg([3, 4, 5, 6].map(n => ({ label: String(n), value: n })), p.weeklyGoal, v => { p.weeklyGoal = v; p.updatedAt = Date.now(); save(); })),
        field('Theme', seg([{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'Auto', value: 'auto' }], p.theme || 'light', v => { p.theme = v; p.updatedAt = Date.now(); save(); applyTheme(); })),
        field('Sounds', seg([{ label: 'On', value: true }, { label: 'Off', value: false }], p.sound, v => { p.sound = v; p.updatedAt = Date.now(); save(); })))),
      card('Claude', h('div', { class: 'stack' },
        field('API key', key, 'Used for FRQ grading, DECA judging, speech analysis, memo grading and generating extra questions. Stored only in this browser and sent only to Anthropic. Get one at console.anthropic.com.'),
        h('button', { class: 'btn', onclick: async e => { const b = e.currentTarget; b.disabled = true; b.textContent = 'Testing…'; try { const r = await askJSON('Reply with ok=true.', { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'], additionalProperties: false }, { effort: 'low', maxTokens: 1000, feature: 'test' }); toast(r.ok ? 'Claude is connected' : 'Unexpected reply', 'good'); } catch (err) { toast(aiErrorText(err), 'bad'); } b.disabled = false; b.textContent = 'Test connection'; } }, 'Test connection'))),
      usageCard(p),
      syncCard(),
      card('Phone reminders (ntfy)', h('div', { class: 'stack' },
        h('ol', { class: 'small' }, h('li', {}, 'Install the free ntfy app on your iPhone.'), h('li', {}, 'Tap Generate below, then in ntfy tap + and subscribe to that exact topic.'), h('li', {}, 'Tap Send test.')),
        field('Topic', topic, 'Anyone who knows the topic name can read it, so keep it random. Reminder text is generic.'),
        h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: () => { p.ntfyTopic = randomTopic(); topic.value = p.ntfyTopic; save(); scheduleReminders(); } }, 'Generate'),
          h('button', { class: 'btn sm primary', onclick: async () => { try { toast((await testNtfy()) ? 'Sent - check your phone' : 'Set a topic first', 'good'); } catch { toast('Could not reach ntfy', 'bad'); } } }, 'Send test')),
        field('Daily study reminder', inp('reminderTime', { type: 'time' })),
        field('ntfy server', inp('ntfyServer'), 'Leave as https://ntfy.sh unless you self-host.'),
        h('p', { class: 'small muted' }, 'Each time you open Pace it queues the next ~2 days of reminders (study time, plus 3-day and 1-day test warnings).'))),
      card('School calendar', h('div', { class: 'stack' },
        ...Object.keys(p.terms).map(t => field(`${TERM_LABEL[t]} starts`, (() => { const el = h('input', { class: 'input', type: 'date', value: p.terms[t] }); el.onchange = () => { p.terms[t] = el.value; p.updatedAt = Date.now(); save(); toast('Saved'); }; return el; })())),
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

function syncCard() {
  const body = h('div', { class: 'stack' });
  const draw = () => {
    body.innerHTML = '';
    if (isLinked()) {
      const st = syncStatus();
      const code = h('textarea', { class: 'input', rows: 3, readonly: true, style: { display: 'none', fontFamily: 'ui-monospace, monospace', fontSize: '12px' } }, linkCode());
      body.append(
        h('div', { class: 'row between' }, h('span', { class: `chip ${st.state === 'error' ? 'bad' : 'good'}` }, st.state === 'syncing' ? 'Syncing…' : st.state === 'error' ? 'Sync error' : 'Sync on'),
          h('span', { class: 'small muted' }, st.at ? `${st.msg} · ${new Date(st.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Syncs automatically')),
        st.state === 'error' ? h('p', { class: 'small', style: { color: 'var(--bad)' } }, st.msg) : null,
        h('p', { class: 'small muted' }, 'Your data and Claude key sync automatically: when you open Pace and about 20 seconds after you study.'),
        h('div', { class: 'row' },
          h('button', { class: 'btn sm primary', onclick: () => { code.style.display = code.style.display ? '' : 'none'; } }, 'Show link code'),
          h('button', { class: 'btn sm', onclick: async () => { try { await navigator.clipboard.writeText(linkCode()); toast('Code copied - paste it on your other device', 'good'); } catch { code.style.display = ''; code.select(); } } }, 'Copy code'),
          h('button', { class: 'btn sm', onclick: () => syncNow() }, 'Sync now')),
        code,
        h('p', { class: 'small muted' }, 'Treat the code like a password: it contains the keys to your synced data.'),
        h('button', { class: 'btn sm ghost', onclick: () => { if (confirm('Stop syncing on this device? Your data stays here and on your other devices.')) { unlink(); draw(); } } }, 'Turn off sync on this device'));
      return;
    }
    const token = h('input', { class: 'input', type: 'password', placeholder: 'ghp_… or github_pat_…', autocomplete: 'off' });
    const codeIn = h('input', { class: 'input', placeholder: 'PACE1-…', autocomplete: 'off' });
    const go = h('button', { class: 'btn primary' }, 'Turn on sync');
    go.onclick = async () => { go.disabled = true; go.textContent = 'Setting up…'; try { await setupSync(token.value); toast('Sync is on - copy your code to link other devices', 'good'); draw(); } catch (e) { toast(e.message, 'bad'); go.disabled = false; go.textContent = 'Turn on sync'; } };
    const link = h('button', { class: 'btn' }, 'Link this device');
    link.onclick = async () => { link.disabled = true; link.textContent = 'Linking…'; try { await linkWithCode(codeIn.value); toast('Linked - your data is here', 'good'); location.reload(); } catch (e) { toast(e.message, 'bad'); link.disabled = false; link.textContent = 'Link this device'; } };
    body.append(
      h('p', { class: 'small' }, h('b', {}, 'First device: '), 'make a GitHub token with only the "gist" permission, paste it here, and Pace stores your data, encrypted, in a secret gist on your account.'),
      h('a', { class: 'btn sm ghost', href: 'https://github.com/settings/tokens/new?scopes=gist&description=Pace%20sync', target: '_blank', rel: 'noopener' }, '1 · Create GitHub token ↗'),
      h('p', { class: 'small muted' }, 'On that page: set Expiration to "No expiration" (or a long one), keep only "gist" checked, tap Generate, copy the token.'),
      token, go,
      h('div', { class: 'divider' }),
      h('p', { class: 'small' }, h('b', {}, 'Other devices: '), 'paste the link code from your first device. Its progress, Log, cards, and Claude key all come over.'),
      codeIn, link);
  };
  onSyncStatus(() => { if (body.isConnected) draw(); });
  draw();
  return card('Sync devices', body);
}

function usageCard(p) {
  const money = v => v < 0.01 && v > 0 ? '<$0.01' : `$${v.toFixed(2)}`;
  const body = h('div', { class: 'stack' });
  const draw = () => {
    body.innerHTML = '';
    const m = usageMonth(), prevKey = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15).toISOString().slice(0, 7), prev = usageMonth(prevKey);
    const cap = +p.aiCap || 0;
    const capIn = h('input', { class: 'input', type: 'number', min: 0, step: 1, inputmode: 'decimal', placeholder: 'No cap', value: cap || '', style: { width: '110px' } });
    capIn.onchange = () => { p.aiCap = Math.max(0, +capIn.value || 0); p.updatedAt = Date.now(); save(); toast(p.aiCap ? `Cap set: $${p.aiCap}/month` : 'Cap removed'); draw(); };
    const feats = Object.entries(m.byFeature).sort((a, b) => b[1].cost - a[1].cost);
    body.append(
      h('div', { class: 'row between' }, h('div', {}, h('div', { class: 'kpi-l' }, `This month (${thisMonth()})`), h('div', { class: 'kpi-v' }, money(m.total)), h('div', { class: 'small muted' }, `${m.calls} Claude calls · last month ${money(prev.total)}`)),
        h('div', { class: 'field', style: { alignItems: 'flex-end' } }, h('label', {}, 'Monthly cap ($)'), capIn)),
      cap ? h('div', {}, bar(Math.min(1, m.total / cap), { cls: m.total >= cap ? 'bad' : m.total >= cap * 0.8 ? 'gold' : 'good' }), h('div', { class: 'small muted', style: { marginTop: '4px' } }, m.total >= cap ? 'Cap reached - Claude features are paused until next month or until you raise it.' : `${money(cap - m.total)} left · Claude features pause at the cap.`)) : null,
      h('div', { class: 'field' }, h('label', {}, 'Model mode'),
        seg(Object.entries(MODES).map(([value, x]) => ({ label: x.label, value })), p.aiMode || 'best', v => { p.aiMode = v; p.updatedAt = Date.now(); save(); draw(); }),
        h('div', { class: 'small muted' }, MODES[p.aiMode || 'best'].desc)),
      feats.length ? h('div', { class: 'feedback-rows' }, ...feats.map(([k, f]) => h('div', { class: 'row between' },
        h('div', {}, h('div', { style: { fontWeight: 600 } }, FEATURES[k]?.label || k), h('div', { class: 'small muted' }, `${f.calls}× · avg ${money(f.cost / f.calls)} · ${PRICES[modelFor(k)]?.name || ''} now${f.searches ? ` · ${f.searches} searches` : ''}`)),
        h('b', { class: 'num' }, money(f.cost))))) : h('p', { class: 'small muted' }, 'No Claude usage yet this month.'),
      recentCalls().length ? h('details', {}, h('summary', { class: 'small muted' }, 'Recent calls'), h('div', { class: 'feedback-rows small' }, ...recentCalls().map(r => h('div', { class: 'row between' }, h('span', {}, `${FEATURES[r.feature]?.label || r.feature} · ${PRICES[r.model]?.name || r.model}`), h('span', { class: 'num' }, `${money(r.cost)} · ${new Date(r.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`))))) : null,
      h('p', { class: 'small muted' }, 'Calculated from the exact token counts Claude returns, at list prices (Opus 5.5 $4/$20, Sonnet 5.5 $2/$10, Haiku 5.5 $0.10/$0.50 per million tokens in/out; web search $10 per 1,000). Includes all synced devices. Your Anthropic Console bill is the official number - also set a spend limit there.'));
  };
  draw();
  return card('Claude usage & cost', body);
}
