// Motion + sound feedback. Everything is short (<400ms) so it never slows answering.
import { S } from './store.js';
import { bgPulse, bgBurst } from './three-bg.js';
import { h } from './ui.js';

const G = () => window.gsap;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

let ac;
function tone(freqs, { dur = 0.09, type = 'sine', gain = 0.05 } = {}) {
  if (!S().profile.sound) return;
  try {
    ac ||= new (window.AudioContext || window.webkitAudioContext)();
    const t = ac.currentTime;
    freqs.forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, t + i * dur * 0.7);
      g.gain.linearRampToValueAtTime(gain, t + i * dur * 0.7 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * dur * 0.7 + dur);
      o.connect(g).connect(ac.destination);
      o.start(t + i * dur * 0.7); o.stop(t + i * dur * 0.7 + dur + 0.02);
    });
  } catch { /* audio blocked */ }
}
export const sfx = {
  tap: () => tone([660], { dur: 0.03, gain: 0.02, type: 'triangle' }),
  good: () => tone([660, 990], { dur: 0.08, gain: 0.045 }),
  bad: () => tone([220], { dur: 0.14, gain: 0.04, type: 'triangle' }),
  level: () => tone([523, 659, 784, 1047], { dur: 0.12, gain: 0.05 }),
};

const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
export function correct(el) {
  sfx.good(); bgPulse('good'); if (el) bgBurst(...center(el), 'good');
  if (!G() || !el) return;
  G().fromTo(el, { scale: 1 }, { scale: 1.035, duration: 0.11, yoyo: true, repeat: 1, ease: 'power2.out' });
  flash(el, 'var(--good)');
}
export function wrong(el) {
  sfx.bad(); bgPulse('bad');
  if (!G() || !el) return;
  G().fromTo(el, { x: 0 }, { x: 7, duration: 0.05, repeat: 5, yoyo: true, ease: 'none', clearProps: 'x' });
  flash(el, 'var(--bad)');
}
function flash(el, color) {
  const f = h('div', { class: 'flash', style: { background: color } });
  el.style.position ||= 'relative';
  el.append(f);
  G().fromTo(f, { opacity: 0.22 }, { opacity: 0, duration: 0.45, onComplete: () => f.remove() });
}

export function pop(el) {
  if (!G() || !el) return;
  G().fromTo(el, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.2)' });
}

export function stagger(els, opts = {}) {
  if (!G() || reduce || !els.length) return;
  G().from(els, { y: 14, opacity: 0, duration: 0.45, ease: 'power3.out', stagger: 0.045, clearProps: 'transform,opacity', ...opts });
}

// Burst of small squares/circles from an element: reward for level-ups and clean rounds.
export function burst(el, { n = 26, colors = ['var(--accent)', 'var(--good)', 'var(--gold)'] } = {}) {
  if (!G() || reduce) return;
  const r = (el || document.body).getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < n; i++) {
    const p = h('div', { class: 'particle', style: { left: cx + 'px', top: cy + 'px', background: colors[i % colors.length], borderRadius: i % 2 ? '50%' : '2px' } });
    document.body.append(p);
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 120;
    G().to(p, { x: Math.cos(a) * d, y: Math.sin(a) * d - 40, rotation: Math.random() * 360, opacity: 0, duration: 0.9 + Math.random() * 0.4, ease: 'power3.out', onComplete: () => p.remove() });
  }
}

export function levelUp(title, sub) {
  sfx.level(); bgPulse('gold'); bgBurst(innerWidth / 2, innerHeight / 2, 'gold', true);
  const el = h('div', { class: 'levelup' }, h('div', { class: 'lu-badge' }, '▲'), h('div', { class: 'lu-title' }, title), h('div', { class: 'lu-sub' }, sub));
  document.body.append(el);
  if (!G()) { setTimeout(() => el.remove(), 1800); return; }
  const tl = G().timeline({ onComplete: () => el.remove() });
  tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    .fromTo(el.querySelector('.lu-badge'), { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' }, 0)
    .from(el.querySelectorAll('.lu-title,.lu-sub'), { y: 16, opacity: 0, stagger: 0.08, duration: 0.4 }, 0.15)
    .add(() => burst(el.querySelector('.lu-badge'), { n: 40 }), 0.3)
    .to(el, { opacity: 0, duration: 0.35 }, 1.9);
}

export function pageIn(el) {
  if (!G() || reduce) return;
  G().fromTo(el, { opacity: 0, y: 18, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.42, ease: 'power3.out', clearProps: 'filter,transform' });
  stagger([...el.querySelectorAll('.card, .tile')].slice(0, 14), { delay: 0.06 });
}
export function pageOut(el) {
  return new Promise(res => {
    if (!G() || reduce || !el || document.hidden) return res();
    G().to(el, { opacity: 0, y: -10, duration: 0.16, ease: 'power2.in', onComplete: res });
    setTimeout(res, 260); // GSAP pauses when the tab is hidden; never block navigation on it
  });
}

// Press effect for any keypad-like button
export function press(btn) {
  if (!G()) return;
  G().fromTo(btn, { scale: 0.92 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
}

// 3D tilt + press for tiles (pointer-following, GSAP quickTo).
export function tilt(el) {
  if (!G() || reduce || el.dataset.tilt) return;
  el.dataset.tilt = 1;
  G().set(el, { transformPerspective: 700 });
  const rx = G().quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3' }), ry = G().quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3' });
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 10); rx(-((e.clientY - r.top) / r.height - 0.5) * 10); });
  el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  el.addEventListener('pointerdown', () => G().to(el, { scale: 0.97, duration: 0.12 }));
  el.addEventListener('pointerup', () => G().to(el, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }));
}
// Reveal cards as they scroll into view.
let io;
export function reveal(root) {
  if (!G() || reduce || !('IntersectionObserver' in window)) return;
  io ||= new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); G().to(e.target, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }); } }), { rootMargin: '0px 0px -8% 0px' });
  const vh = innerHeight;
  root.querySelectorAll('.card, .kpi, .unit-row, .tile').forEach(el => { if (el.getBoundingClientRect().top > vh) { G().set(el, { opacity: 0, y: 28, scale: 0.98 }); io.observe(el); } });
  root.querySelectorAll('.tile').forEach(tilt);
}
// Ripple from the press point (keypad, choices, buttons).
export function ripple(btn, e) {
  if (!G() || reduce) return;
  const r = btn.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
  const s = h('span', { class: 'ripple', style: { width: d + 'px', height: d + 'px', left: (e.clientX - r.left - d / 2) + 'px', top: (e.clientY - r.top - d / 2) + 'px' } });
  btn.append(s);
  G().fromTo(s, { scale: 0, opacity: 0.35 }, { scale: 1, opacity: 0, duration: 0.55, ease: 'power2.out', onComplete: () => s.remove() });
}
