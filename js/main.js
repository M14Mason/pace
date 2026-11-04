import { S, save } from './store.js';
import { h, $ } from './ui.js';
import { pageIn, pageOut } from './fx.js';
import { initBackground, bgMood } from './three-bg.js';
import { reveal } from './fx.js';
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
import * as today from './views/today.js';
import * as practice from './views/practice.js';
import * as courses from './views/courses.js';
import * as you from './views/you.js';
import { renderSession } from './session.js';
import { migrateMastery } from './mastery.js';
import { checkForUpdate, APP_VERSION } from './update.js';

const ICON = {
  today: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  practice: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  courses: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
  finance: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  you: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
};
const TABS = [['#/', 'Today', 'today'], ['#/practice', 'Practice', 'practice'], ['#/courses', 'Courses', 'courses'], ['#/finance', 'Finance', 'finance'], ['#/you', 'You', 'you']];
const FULL = { '#/': 'Today', '#/practice': 'Practice', '#/courses': 'Courses', '#/finance': 'Finance', '#/you': 'You' };
// Which tab lights up for deeper pages.
const TAB_OF = { '#/': '#/', '#/session': '#/', '#/practice': '#/practice', '#/sprint': '#/practice', '#/learn': '#/practice', '#/speak': '#/practice', '#/courses': '#/courses', '#/prep': '#/courses', '#/finance': '#/finance', '#/you': '#/you', '#/log': '#/you', '#/records': '#/you', '#/stats': '#/you', '#/settings': '#/you' };

function navLinks(full) {
  return TABS.map(([href, label, ic]) => h('a', { href, 'data-href': href, class: 'nav-a' },
    h('span', { class: 'nav-ic', html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[ic]}</svg>` }),
    h('span', { class: 'nav-l' }, full ? FULL[href] : label)));
}
$('#nav').append(...navLinks(true));
$('#tabbar').append(h('div', { class: 'dock-ind' }), ...navLinks(false));

// Dock animation: grow the active tab and slide the indicator under it (GSAP).
let dockReady = false;
function moveDock(href) {
  const bar = $('#tabbar'), ind = $('.dock-ind', bar);
  const links = [...bar.querySelectorAll('.nav-a')];
  const prev = links.map(l => parseFloat(getComputedStyle(l).flexGrow) || 1);
  links.forEach(l => l.classList.toggle('on', l.dataset.href === href));
  const target = links.map(l => (l.classList.contains('on') ? 2.3 : 1));
  links.forEach((l, i) => (l.style.flexGrow = target[i]));
  const on = links.find(l => l.classList.contains('on'));
  if (window.gsap) gsap.to(ind, { opacity: on ? 1 : 0, duration: 0.2 }); else ind.style.opacity = on ? 1 : 0;
  if (!on || getComputedStyle(bar).display === 'none') { dockReady = false; return; }
  const br = bar.getBoundingClientRect(), r = on.getBoundingClientRect();
  const x = r.left - br.left, w = r.width;
  if (!window.gsap || !dockReady) { links.forEach((l, i) => (l.style.flexGrow = target[i])); if (window.gsap) gsap.set(ind, { x, width: w }); else Object.assign(ind.style, { transform: `translateX(${x}px)`, width: w + 'px' }); dockReady = !!window.gsap; return; }
  links.forEach((l, i) => (l.style.flexGrow = prev[i]));
  gsap.to(links, { flexGrow: i => target[i], duration: 0.5, ease: 'back.out(1.5)' });
  gsap.to(ind, { x, width: w, duration: 0.5, ease: 'back.out(1.5)' });
  gsap.fromTo(ind, { scaleY: 0.86 }, { scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
  gsap.fromTo(on.querySelector('.nav-ic'), { y: 4, rotate: -12 }, { y: 0, rotate: 0, duration: 0.6, ease: 'elastic.out(1.1, 0.45)' });
}
addEventListener('resize', () => { dockReady = false; moveDock($('#tabbar .nav-a.on')?.dataset.href || '#/'); });

const routes = [
  [/^#\/?$/, today.render],
  [/^#\/session(?:\/(.*))?$/, renderSession],
  [/^#\/practice$/, practice.render],
  [/^#\/courses$/, courses.render],
  [/^#\/you$/, you.render],
  [/^#\/stats$/, dashboard.render],
  [/^#\/sprint(?:\/(.*))?$/, practice.render],
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
  document.body.classList.toggle('in-round', hash === '#/round' || hash === '#/placement');
  view.innerHTML = '';
  const base = '#/' + (hash.split('/')[1] || '');
  const tab = TAB_OF[base] || '#/';
  document.querySelectorAll('#nav .nav-a').forEach(a => a.classList.toggle('on', a.dataset.href === tab));
  moveDock(hash === '#/round' || hash === '#/placement' ? null : tab);
  for (const [re, fn] of routes) {
    const m = hash.match(re);
    if (m) {
      const page = h('div', { class: 'page' });
      view.append(page);
      try { cleanup = await fn(page, (m[1] || '').split('/').filter(Boolean)); }
      catch (e) { console.error(e); page.append(h('div', { class: 'card' }, h('h3', {}, 'Something broke on this page'), h('pre', { class: 'err' }, String(e.stack || e)))); }
      pageIn(page);
      setTimeout(() => page.isConnected && reveal(page), 900); // after pageIn finishes, so its clearProps cannot wipe tilt/reveal state
      bgMood(hash === '#/round' ? 'round' : hash.startsWith('#/records') ? 'records' : ({ '#/': 'home', '#/practice': 'sprint', '#/sprint': 'sprint', '#/learn': 'learn', '#/courses': 'prep', '#/finance': 'finance', '#/prep': 'prep', '#/speak': 'speak', '#/you': 'log', '#/log': 'log' })[base] || 'home');
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
migrateMastery(); // v2: levels from practice, old gates removed - all data kept
setTimeout(checkForUpdate, 3000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkForUpdate(); });
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
