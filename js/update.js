// Easy updates: the app checks version.json and shows a one-tap "Update" banner.
// Updating only swaps the code - your data (localStorage + IndexedDB) is never touched.
import { h } from './ui.js';
export const APP_VERSION = '2.1.0';

let shown = false;
export async function checkForUpdate() {
  if (shown || !navigator.onLine) return;
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return;
    const { version, notes } = await r.json();
    if (version && version !== APP_VERSION) showBanner(version, notes);
  } catch { /* offline */ }
}
function showBanner(version, notes) {
  shown = true;
  const b = h('button', { class: 'update-banner', onclick: applyUpdate }, h('b', {}, '✨ Update ready'), h('span', {}, notes || `Version ${version}`), h('span', { class: 'update-cta' }, 'Tap to update'));
  document.body.append(b);
  if (window.gsap) gsap.from(b, { y: -60, opacity: 0, duration: 0.5, ease: 'back.out(1.6)' });
}
export async function applyUpdate() {
  try {
    if ('caches' in window) for (const k of await caches.keys()) await caches.delete(k);
    const reg = await navigator.serviceWorker?.getRegistration(); await reg?.update();
  } catch { }
  location.reload();
}
