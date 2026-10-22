// Tiny DOM helpers + shared visual components (rings, heatmap, calendar, charts).

// Views pass optional sections as null/false; skip them instead of rendering the text "null".
const nativeAppend = Element.prototype.append;
Element.prototype.append = function (...k) { return nativeAppend.apply(this, k.flat().filter(x => x != null && x !== false)); };
import { S, today, addDays, dkey, dayDone, paceScore } from './store.js';

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const fmtMs = ms => ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
export const fmtMin = ms => { const m = Math.round(ms / 60000); return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`; };
export const pct = x => `${Math.round(x * 100)}%`;

const SVGNS = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  kids.flat().forEach(k => k && el.append(k));
  return el;
}

// Progress ring. value 0..1
export function ring(value, { size = 120, stroke = 10, label = '', sub = '', cls = '' } = {}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const fg = svg('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', 'stroke-width': stroke, class: 'ring-fg', 'stroke-linecap': 'round', 'stroke-dasharray': c, 'stroke-dashoffset': c, transform: `rotate(-90 ${size / 2} ${size / 2})` });
  const el = h('div', { class: `ring ${cls}`, style: { width: size + 'px', height: size + 'px' } },
    svg('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}` },
      svg('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', 'stroke-width': stroke, class: 'ring-bg' }), fg),
    h('div', { class: 'ring-label' }, h('div', { class: 'ring-num' }, label), sub && h('div', { class: 'ring-sub' }, sub)));
  requestAnimationFrame(() => {
    const target = c * (1 - Math.max(0, Math.min(1, value)));
    if (window.gsap) gsap.to(fg, { attr: { 'stroke-dashoffset': target }, duration: 1.1, ease: 'power3.out', delay: 0.1 });
    else fg.setAttribute('stroke-dashoffset', target);
  });
  return el;
}

export function bar(value, { cls = '' } = {}) {
  const fill = h('div', { class: 'bar-fill', style: { width: '0%' } });
  requestAnimationFrame(() => { fill.style.width = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`; });
  return h('div', { class: `bar ${cls}` }, fill);
}

// Count-up number
export function countUp(el, to, { dur = 0.9, fmt = v => Math.round(v) } = {}) {
  if (!window.gsap) { el.textContent = fmt(to); return; }
  const o = { v: 0 };
  gsap.to(o, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => (el.textContent = fmt(o.v)) });
}

// GitHub-style heatmap; one colour, intensity = minutes studied.
export function heatmap(weeks = 26) {
  const days = S().days;
  const end = today();
  const endD = new Date(end + 'T12:00');
  const startOffset = (endD.getDay() + 6) % 7; // Monday-based column
  const start = addDays(end, -(weeks - 1) * 7 - startOffset);
  const grid = h('div', { class: 'heat', style: { gridTemplateColumns: `repeat(${weeks}, 1fr)` } });
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const k = addDays(start, w * 7 + d);
      const x = days[k];
      const mins = x ? x.ms / 60000 : 0;
      const lvl = k > end ? -1 : mins === 0 ? 0 : mins < 5 ? 1 : mins < 12 ? 2 : mins < 20 ? 3 : 4;
      grid.append(h('div', { class: `hc l${lvl}${dayDone(x) ? ' done' : ''}`, title: `${k}: ${Math.round(mins)} min`, style: { gridColumn: w + 1, gridRow: d + 1 } }));
    }
  }
  return h('div', { class: 'heat-wrap' }, grid,
    h('div', { class: 'heat-legend' }, 'Less', ...[0, 1, 2, 3, 4].map(l => h('span', { class: `hc l${l}` })), 'More'));
}

// Month calendar with study days + events.
export function calendar(monthOffset = 0, onPick) {
  const now = new Date();
  const m = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const first = (m.getDay() + 6) % 7;
  const daysIn = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  const evs = S().events;
  const grid = h('div', { class: 'cal-grid' }, ...['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => h('div', { class: 'cal-dow' }, d)));
  for (let i = 0; i < first; i++) grid.append(h('div'));
  for (let d = 1; d <= daysIn; d++) {
    const k = dkey(new Date(m.getFullYear(), m.getMonth(), d));
    const x = S().days[k];
    const ev = evs.filter(e => e.date === k);
    grid.append(h('button', {
      class: `cal-day${k === today() ? ' today' : ''}${dayDone(x) ? ' done' : x && x.q ? ' some' : ''}${ev.length ? ' has-ev' : ''}`,
      onclick: () => onPick && onPick(k),
      title: ev.map(e => e.title).join(', '),
    }, h('span', {}, d), ev.length ? h('i', { class: `ev-dot ${ev[0].kind}` }) : null));
  }
  return h('div', { class: 'cal' },
    h('div', { class: 'cal-head' }, m.toLocaleString(undefined, { month: 'long', year: 'numeric' })), grid);
}

// Line chart (SVG) of a series of {x,y}; y 0..max
export function lineChart(series, { height = 120, max = 100, color = 'var(--accent)', label = '' } = {}) {
  const w = 320, hgt = height, pad = 6;
  const n = series.length;
  const pts = series.map((p, i) => [pad + (i / Math.max(1, n - 1)) * (w - pad * 2), hgt - pad - (p.y / max) * (hgt - pad * 2)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${d} L${w - pad},${hgt - pad} L${pad},${hgt - pad} Z`;
  const path = svg('path', { d, fill: 'none', stroke: color, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', class: 'lc-line' });
  const el = svg('svg', { viewBox: `0 0 ${w} ${hgt}`, class: 'linechart', preserveAspectRatio: 'none', 'aria-label': label },
    svg('defs', {}, svg('linearGradient', { id: 'lcg', x1: 0, x2: 0, y1: 0, y2: 1 },
      svg('stop', { offset: '0%', 'stop-color': 'var(--accent)', 'stop-opacity': 0.22 }),
      svg('stop', { offset: '100%', 'stop-color': 'var(--accent)', 'stop-opacity': 0 }))),
    svg('path', { d: area, fill: 'url(#lcg)', class: 'lc-area' }), path,
    ...pts.filter((_, i) => series[i].y > 0).map(p => svg('circle', { cx: p[0], cy: p[1], r: 2.4, fill: color })));
  requestAnimationFrame(() => {
    try {
      const L = path.getTotalLength();
      path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
      if (window.gsap) gsap.to(path.style, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' });
      else path.style.strokeDashoffset = 0;
    } catch { /* not in DOM yet */ }
  });
  return el;
}

export function scoreSeries(n = 30) {
  return Array.from({ length: n }, (_, i) => { const k = addDays(today(), i - n + 1); return { x: k, y: paceScore(k) }; });
}

// Sumday-style week board: 7 dots per row.
export function weekBoard(rows) {
  const ws = (() => { const d = new Date(today() + 'T12:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dkey(d); })();
  return h('div', { class: 'wb' },
    h('div', { class: 'wb-row wb-head' }, h('span'), ...['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => h('span', { class: addDays(ws, i) === today() ? 'is-today' : '' }, d))),
    ...rows.map(r => h('div', { class: 'wb-row' }, h('span', { class: 'wb-label' }, r.label),
      ...Array.from({ length: 7 }, (_, i) => { const k = addDays(ws, i); return h('span', { class: `wb-dot${r.test(S().days[k], k) ? ' on' : ''}${k > today() ? ' future' : ''}` }); }))));
}

export function toast(msg, kind = '') {
  const t = h('div', { class: `toast ${kind}` }, msg);
  document.body.append(t);
  if (window.gsap) {
    gsap.fromTo(t, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'back.out(2)' });
    gsap.to(t, { y: 20, opacity: 0, delay: 2.6, duration: 0.3, onComplete: () => t.remove() });
  } else setTimeout(() => t.remove(), 3000);
}

export function modal(content, { onClose } = {}) {
  const box = h('div', { class: 'modal-card' }, content);
  const wrap = h('div', { class: 'modal', onclick: e => { if (e.target === wrap) close(); } }, box);
  function close() {
    if (window.gsap) gsap.to(wrap, { opacity: 0, duration: 0.2, onComplete: () => wrap.remove() });
    else wrap.remove();
    onClose && onClose();
  }
  document.body.append(wrap);
  if (window.gsap) { gsap.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: 0.2 }); gsap.fromTo(box, { y: 40, scale: 0.97 }, { y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }); }
  return close;
}

export function card(title, body, { cls = '', action } = {}) {
  return h('section', { class: `card ${cls}` },
    title && h('div', { class: 'card-head' }, h('h3', {}, title), action || null), body);
}

export function seg(options, value, onPick) {
  const el = h('div', { class: 'seg' }, ...options.map(o => h('button', {
    class: o.value === value ? 'on' : '', onclick: e => { $$('button', el).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); onPick(o.value); },
  }, o.label)));
  return el;
}

// Minimal, safe markdown-ish rendering for lesson text: **bold**, `code`, line breaks.
export function md(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
}
export const rich = (s, tag = 'p', cls = '') => h(tag, { class: cls, html: md(s) });

export function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
