import { S, save } from './store.js';
import { h, $ } from './ui.js';
import { pageIn, pageOut } from './fx.js';
import { initBackground } from './three-bg.js';
import { renderRound, unbindKeys } from './quiz.js';
import { scheduleReminders } from './ntfy.js';
import { startAutoSync } from './sync.js';
import * as dashboard from './views/dashboard.js';
import * as sprint from './views/sprint.js';
import * as learn from './views/learn.js';
import * as finance from './views/finance.js';
import * as prep from './views/prep.js';
import * as log from './views/log.js';
import * as speak from './views/speak.js';
import * as settings from './views/settings.js';
import * as placement from './views/placement.js';
import * as records from './views/records.js';

const ICON = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  sprint: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  learn: '<path d="M2 7l10-4 10 4-10 4z"/><path d="M6 9v5c0 2 3 3.5 6 3.5s6-1.5 6-3.5V9"/>',
  finance: '<path d="M4 19V10M10 19V5M16 19v-7M22 19H2"/>',
  prep: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  speak: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  log: '<path d="M5 4h11l3 3v13H5z"/><path d="M9 10h6M9 14h6"/>',
};
const TABS = [
  ['#/', 'Home', 'home'], ['#/sprint', 'Sprint', 'sprint'], ['#/learn', 'Learn', 'learn'],
  ['#/finance', 'Finance', 'finance'], ['#/prep', 'Prep', 'prep'], ['#/speak', 'Speak', 'speak'], ['#/log', 'Log', 'log'],
];
const FULL = { '#/': 'Dashboard', '#/sprint': 'Math Sprint', '#/learn': 'Learn', '#/finance': 'Business & Finance', '#/prep': 'Prep', '#/speak': 'Speak', '#/log': 'Log' };

function navLinks(full) {
  return TABS.map(([href, label, ic]) => h('a', { href, 'data-href': href, class: 'nav-a' },
    h('span', { class: 'nav-ic', html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[ic]}</svg>` }),
    h('span', { class: 'nav-l' }, full ? FULL[href] : label)));
}
$('#nav').append(...navLinks(true));
$('#tabbar').append(...navLinks(false));

const routes = [
  [/^#\/?$/, dashboard.render],
  [/^#\/sprint(?:\/(.*))?$/, sprint.render],
  [/^#\/learn(?:\/(.*))?$/, learn.render],
  [/^#\/finance(?:\/(.*))?$/, finance.render],
  [/^#\/prep(?:\/(.*))?$/, prep.render],
  [/^#\/log(?:\/(.*))?$/, log.render],
  [/^#\/speak(?:\/(.*))?$/, speak.render],
  [/^#\/settings$/, settings.render],
  [/^#\/placement$/, placement.render],
  [/^#\/records$/, records.render],
  [/^#\/round$/, root => renderRound(root)],
];

let cleanup = null;
let busy = false;
async function route() {
  if (busy) return; busy = true;
  const view = $('#view');
  const hash = location.hash || '#/';
  await pageOut(view.firstElementChild);
  if (typeof cleanup === 'function') { try { cleanup(); } catch { } }
  cleanup = null;
  unbindKeys();
  if (hash !== '#/round') document.body.classList.remove('in-round');
  view.innerHTML = '';
  const base = '#/' + (hash.split('/')[1] || '');
  document.querySelectorAll('.nav-a').forEach(a => a.classList.toggle('on', a.dataset.href === (base === '#/' ? '#/' : base)));
  for (const [re, fn] of routes) {
    const m = hash.match(re);
    if (m) {
      const page = h('div', { class: 'page' });
      view.append(page);
      try { cleanup = await fn(page, (m[1] || '').split('/').filter(Boolean)); }
      catch (e) { console.error(e); page.append(h('div', { class: 'card' }, h('h3', {}, 'Something broke on this page'), h('pre', { class: 'err' }, String(e.stack || e)))); }
      pageIn(page);
      break;
    }
  }
  view.scrollTop = 0; scrollTo(0, 0);
  busy = false;
  if ((location.hash || '#/') !== hash) route();
}
addEventListener('hashchange', route);

// boot
initBackground($('#bg'));
if (!S().profile.placementDone && !location.hash) location.hash = '#/placement';
route();
scheduleReminders();
startAutoSync();
addEventListener('online', scheduleReminders);
document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleReminders(); });

// Ask Safari to keep our storage (reduces the 7-day eviction risk).
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
save();
