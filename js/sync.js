// Device sync through a secret GitHub gist. The whole state (including the Claude key)
// is encrypted with AES-GCM before upload; the key only exists inside the sync code.
// Each device uploads its own study days separately so totals add up correctly, and
// everything else is merged per item (newest wins, unions for lists, tombstones for deletes).
import { S, save, replaceState, rebuildAllDays, onChange } from './store.js';

const LOCAL = 'pace.sync';
const FILE = 'pace.sync.enc';
const API = 'https://api.github.com';
const LOCAL_ONLY = ['activeRound', 'ntfySent', 'myDays', 'remoteDays', 'days', 'lastRound'];

export const cfg = () => { try { return JSON.parse(localStorage.getItem(LOCAL) || 'null'); } catch { return null; } };
const setCfg = c => { if (c) localStorage.setItem(LOCAL, JSON.stringify(c)); else localStorage.removeItem(LOCAL); notify(); };
export const isLinked = () => !!cfg();

function deviceId() {
  let id = localStorage.getItem('pace.device');
  if (!id) { id = 'd' + Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(16).padStart(2, '0')).join(''); localStorage.setItem('pace.device', id); }
  return id;
}
const deviceName = () => /iPhone|iPad|Android/.test(navigator.userAgent) ? (navigator.userAgent.match(/iPhone|iPad|Android/) || ['Phone'])[0] : 'Computer';

// ---- status for the UI ----
let status = { state: 'idle', at: 0, msg: '' };
const listeners = new Set();
export const onSyncStatus = f => (listeners.add(f), () => listeners.delete(f));
function notify(st) { if (st) status = { ...status, ...st, at: Date.now() }; listeners.forEach(f => f(status, cfg())); }
export const syncStatus = () => status;

// ---- crypto ----
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const b64url = s => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = s => atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
async function aesKey(raw) { return crypto.subtle.importKey('raw', unb64(raw), 'AES-GCM', false, ['encrypt', 'decrypt']); }
async function gzip(str) {
  if (!window.CompressionStream) return new TextEncoder().encode(str);
  return new Uint8Array(await new Response(new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
}
async function gunzip(bytes, zipped) {
  if (!zipped) return new TextDecoder().decode(bytes);
  return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
}
async function encrypt(obj, rawKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const zipped = !!window.CompressionStream;
  const data = await gzip(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(rawKey), data);
  return JSON.stringify({ v: 1, z: zipped ? 1 : 0, iv: b64(iv), ct: b64(ct) });
}
async function decrypt(text, rawKey) {
  const p = JSON.parse(text);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(p.iv) }, await aesKey(rawKey), unb64(p.ct));
  return JSON.parse(await gunzip(new Uint8Array(pt), p.z));
}

// ---- GitHub ----
async function gh(path, { token, method = 'GET', body } = {}) {
  const r = await fetch(API + path, { method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  if (r.status === 401) throw new Error('GitHub rejected the token - make a new one with the "gist" scope.');
  if (r.status === 404) throw new Error('Sync gist not found - it may have been deleted.');
  if (!r.ok) throw new Error(`GitHub error ${r.status}`);
  return r.json();
}
async function readGist(c) {
  const g = await gh(`/gists/${c.gist}`, { token: c.token });
  const f = g.files[FILE];
  if (!f) return null;
  const text = f.truncated ? await (await fetch(f.raw_url, { cache: 'no-store' })).text() : f.content;
  return decrypt(text, c.key);
}
async function writeGist(c, blob) {
  await gh(`/gists/${c.gist}`, { token: c.token, method: 'PATCH', body: { files: { [FILE]: { content: await encrypt(blob, c.key) } } } });
}

// ---- blob <-> state ----
function toBlob(st, prev) {
  const shared = {};
  for (const [k, v] of Object.entries(st)) if (!LOCAL_ONLY.includes(k)) shared[k] = v;
  const devices = { ...(prev?.devices || {}) };
  devices[deviceId()] = { name: deviceName(), ts: Date.now(), days: st.myDays };
  return { v: 1, ts: Date.now(), shared, devices };
}

const byId = (a = [], b = [], deleted = {}) => {
  const m = new Map();
  for (const x of [...a, ...b]) { if (!x || deleted[x.id]) continue; const cur = m.get(x.id); if (!cur || (x.ts || 0) >= (cur.ts || 0)) m.set(x.id, x); }
  return [...m.values()].sort((x, y) => (y.ts || 0) - (x.ts || 0));
};
const newest = (a, b, f = x => x?.ts || 0) => (!a ? b : !b ? a : f(b) > f(a) ? b : a);

export function mergeShared(L, R) {
  const out = { ...R, ...L };
  const deleted = { ...(R.deleted || {}), ...(L.deleted || {}) };
  out.deleted = deleted;
  // profile: newest edit wins, but never lose a key/topic that only one side has
  const pl = L.profile || {}, pr = R.profile || {};
  // a device that never edited settings (e.g. just linked) takes the other side's profile
  out.profile = !pl.updatedAt || (pr.updatedAt || 0) > pl.updatedAt ? { ...pl, ...pr } : { ...pr, ...pl };
  for (const k of ['apiKey', 'ntfyTopic', 'name']) out.profile[k] ||= pl[k] || pr[k] || '';
  out.profile.placementDone = !!(pl.placementDone || pr.placementDone);
  for (const list of ['log', 'events', 'speak', 'cards', 'customArticles', 'records']) out[list] = byId(L[list], R[list], deleted);
  for (const list of ['missLog', 'frqLog', 'roleplays']) out[list] = [...(L[list] || []), ...(R[list] || [])].filter((x, i, a) => a.findIndex(y => y.ts === x.ts && JSON.stringify(y) === JSON.stringify(x)) === i).sort((a, b) => b.ts - a.ts).slice(0, 100);
  // skills: higher level wins; keep all rounds; best = fastest
  out.skills = {};
  for (const id of new Set([...Object.keys(L.skills || {}), ...Object.keys(R.skills || {})])) {
    const a = L.skills?.[id], b = R.skills?.[id];
    if (!a || !b) { out.skills[id] = a || b; continue; }
    const rounds = [...a.rounds, ...b.rounds].filter((x, i, arr) => arr.findIndex(y => y.ts === x.ts) === i).sort((x, y) => x.ts - y.ts).slice(-200);
    const best = { ...a.best }; for (const [L2, ms] of Object.entries(b.best || {})) best[L2] = Math.min(best[L2] ?? Infinity, ms);
    const level = Math.max(a.level, b.level);
    const gate = [a, b].filter(s => s.level === level).map(s => s.gate).filter(Boolean).sort((x, y) => (y.ts || 0) - (x.ts || 0))[0] || null;
    out.skills[id] = { level, rounds, best, gate };
  }
  const perKey = (name, pick) => { out[name] = {}; for (const k of new Set([...Object.keys(L[name] || {}), ...Object.keys(R[name] || {})])) out[name][k] = pick(L[name]?.[k], R[name]?.[k]); };
  perKey('srs', (a, b) => newest(a, b));
  perKey('lessons', (a, b) => (!a ? b : !b ? a : { done: a.done || b.done, score: Math.max(a.score || 0, b.score || 0), ts: Math.max(a.ts || 0, b.ts || 0) }));
  perKey('qstats', (a, b) => (!a ? b : !b ? a : (a.seen >= b.seen ? a : b)));
  perKey('courseSelf', (a, b) => Math.max(a || 0, b || 0));
  perKey('memos', (a, b) => newest(a, b));
  perKey('aiBank', (a, b) => byId(a, b, deleted).reverse());
  perKey('courseTerms', (a, b) => a || b);
  perKey('readDone', (a, b) => Math.max(a || 0, b || 0) || undefined);
  perKey('marks', (a, b) => newest(a, b));
  perKey('summaries', (a, b) => (a && b ? (a.length >= b.length ? a : b) : a || b));
  perKey('aiUsage', (a, b) => newest(a, b, x => x?.updatedAt || 0)); // one entry per device
  return out;
}

function applyBlob(blob) {
  applying = true;
  try { applyBlobInner(blob); } finally { applying = false; }
}
function applyBlobInner(blob) {
  const st = S();
  const merged = mergeShared(toBlob(st).shared, blob.shared || {});
  const next = { ...st, ...merged };
  next.remoteDays = {};
  for (const [id, d] of Object.entries(blob.devices || {})) if (id !== deviceId()) next.remoteDays[id] = d.days || {};
  replaceState(next);
  rebuildAllDays();
  save();
}

// ---- public API ----
export async function setupSync(token) {
  token = token.trim();
  if (!/^(gh[pousr]_|github_pat_)/.test(token)) throw new Error('That doesn\'t look like a GitHub token.');
  const raw = b64(crypto.getRandomValues(new Uint8Array(32)));
  const g = await gh('/gists', { token, method: 'POST', body: { description: 'Pace sync (encrypted)', public: false, files: { [FILE]: { content: 'init' } } } });
  const c = { token, gist: g.id, key: raw };
  await writeGist(c, toBlob(S()));
  setCfg(c);
  notify({ state: 'ok', msg: 'Sync is on' });
  return linkCode();
}

export function linkCode() {
  const c = cfg(); if (!c) return '';
  return 'PACE1-' + b64url(JSON.stringify({ t: c.token, g: c.gist, k: c.key }));
}

export async function linkWithCode(code) {
  const m = code.trim().match(/^PACE1-([A-Za-z0-9_-]+)$/);
  if (!m) throw new Error('That isn\'t a Pace sync code.');
  let p; try { p = JSON.parse(unb64url(m[1])); } catch { throw new Error('The code is incomplete - copy the whole thing.'); }
  const c = { token: p.t, gist: p.g, key: p.k };
  const blob = await readGist(c);
  setCfg(c);
  if (blob && blob.v === 1) applyBlob(blob);
  await pushNow();
  notify({ state: 'ok', msg: 'Linked' });
}

export function unlink() { setCfg(null); S().remoteDays = {}; rebuildAllDays(); save(); notify({ state: 'idle', msg: 'Sync off' }); }

let busy = false, pending = false, lastLocalChange = 0, applying = false;
export async function syncNow() {
  const c = cfg(); if (!c || !navigator.onLine) return;
  if (busy) { pending = true; return; }
  busy = true; notify({ state: 'syncing' });
  try {
    const remote = await readGist(c);
    if (remote && remote.v === 1) applyBlob(remote);
    await writeGist(c, toBlob(S(), remote));
    lastLocalChange = 0;
    notify({ state: 'ok', msg: 'Synced' });
  } catch (e) { notify({ state: 'error', msg: e.message }); }
  busy = false;
  if (pending) { pending = false; syncNow(); }
}
async function pushNow() {
  const c = cfg(); if (!c) return;
  try { const remote = await readGist(c); await writeGist(c, toBlob(S(), remote)); } catch (e) { notify({ state: 'error', msg: e.message }); }
}

// Automatic: pull+push on open and when the app comes back; push ~20s after changes.
let timer;
export function startAutoSync() {
  onChange(() => {
    if (!cfg() || applying) return;
    lastLocalChange = Date.now();
    clearTimeout(timer);
    timer = setTimeout(syncNow, 20000);
  });
  document.addEventListener('visibilitychange', () => {
    if (!cfg()) return;
    if (document.hidden && lastLocalChange) { clearTimeout(timer); syncNow(); }
    else if (!document.hidden) syncNow();
  });
  addEventListener('online', syncNow);
  if (cfg()) setTimeout(syncNow, 800);
}
