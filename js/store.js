// Local-only persistence. Everything lives in localStorage under one key;
// speech audio lives in IndexedDB (see audioDB below).
const KEY = 'pace.v1';

const blank = () => ({
  v: 1,
  created: Date.now(),
  profile: {
    name: '',
    placementDone: false,
    ntfyTopic: '',
    ntfyServer: 'https://ntfy.sh',
    reminderTime: '19:30',
    apiKey: '',
    sound: true,
    weeklyGoal: 4,
    terms: { '10-T2': '2027-01-25', '11-T1': '2027-08-23', '11-T2': '2028-01-24', '12-T1': '2028-08-21', '12-T2': '2029-01-22' },
    math3Term: '10-T2',
  },
  days: {},        // merged view across devices: 'YYYY-MM-DD' -> { ms, q, correct, rt, req: {math, ap, min}, areas: {} }
  myDays: null,    // this device's own days (what sync uploads for this device)
  remoteDays: {},  // deviceId -> days from other linked devices
  deleted: {},     // id -> ts tombstones so deletions survive sync merges
  cards: [],       // flashcards { id, deck, front, back, src, ts }
  skills: {},      // math skill id -> { level, rounds: [{acc, med, ts, level}], gate }
  srs: {},         // item key -> { due, ivl, ease, reps, lapses, src }
  lessons: {},     // lesson id -> { done, score, ts }
  qstats: {},      // question key -> { seen, right, last }
  log: [],         // { id, type, text, tags, ts }
  events: [],      // { id, title, date, course, kind }
  speak: [],       // { id, ts, prompt, lang, transcript, metrics, ai }
  pbs: {},         // skill -> { med, acc, streak }
  aiBank: {},      // unitId -> generated questions
  ntfySent: {},    // key -> ts
  activeRound: null,
  courseSelf: {},  // course id -> placement self/diagnostic score 0-1
});

let state;
try { state = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || 'null') || {}); }
catch { state = blank(); }
state.profile = Object.assign(blank().profile, state.profile);
if (!state.myDays) state.myDays = JSON.parse(JSON.stringify(state.days || {})); // data before sync belongs to this device

const subs = new Set();
let saveTimer;
export function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('save failed', e); }
  }, 120);
  subs.forEach(f => f(state));
}
export const S = () => state;
export const onChange = f => (subs.add(f), () => subs.delete(f));
export const uid = () => Math.random().toString(36).slice(2, 10);

export function exportData() {
  const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pace-backup-${today()}.json`;
  a.click();
}
export async function importData(file) {
  const data = JSON.parse(await file.text());
  if (!data || data.v !== 1) throw new Error('Not a Pace backup');
  state = Object.assign(blank(), data);
  if (!state.myDays) state.myDays = JSON.parse(JSON.stringify(state.days || {}));
  save();
}
export function resetAll() { state = blank(); state.myDays = {}; save(); }
export function replaceState(next) { state = next; save(); }

// Remove an item from a list and leave a tombstone so sync doesn't resurrect it.
export function removeById(list, id) {
  state[list] = (state[list] || []).filter(x => x.id !== id);
  state.deleted[id] = Date.now();
  save();
}

// ---------- dates ----------
export const dkey = d => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
export const today = () => dkey(Date.now());
export const addDays = (k, n) => { const d = new Date(k + 'T12:00'); d.setDate(d.getDate() + n); return dkey(d); };
export const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);

const emptyDay = () => ({ ms: 0, q: 0, correct: 0, rt: 0, req: { math: false, ap: false }, areas: {} });
// Merged (all devices) view of a day - use for reading.
export function day(k = today()) {
  return state.days[k] ||= emptyDay();
}
function myDay(k = today()) { return state.myDays[k] ||= emptyDay(); }
// Recompute the merged view of one day from this device + linked devices.
export function rebuildDay(k) {
  const parts = [state.myDays[k], ...Object.values(state.remoteDays || {}).map(d => d && d[k])].filter(Boolean);
  if (!parts.length) { delete state.days[k]; return; }
  const m = emptyDay();
  let sw = 0;
  for (const p of parts) {
    m.ms += p.ms || 0; m.q += p.q || 0; m.correct += p.correct || 0; m.rt += p.rt || 0;
    for (const r of Object.keys(p.req || {})) if (p.req[r]) m.req[r] = true;
    for (const [a, v] of Object.entries(p.areas || {})) m.areas[a] = (m.areas[a] || 0) + v;
    if (p.speedIdx != null) { m.speedIdx = ((m.speedIdx || 0) * sw + p.speedIdx * (p.q || 1)) / (sw + (p.q || 1)); sw += p.q || 1; }
  }
  state.days[k] = m;
}
export function rebuildAllDays() {
  const keys = new Set([...Object.keys(state.myDays), ...Object.values(state.remoteDays || {}).flatMap(d => Object.keys(d || {}))]);
  state.days = {};
  keys.forEach(rebuildDay);
}

// Record answered questions + time into today's totals.
export function recordActivity({ area, ms = 0, q = 0, correct = 0, rtSum = 0, req }) {
  const d = myDay();
  d.ms += ms; d.q += q; d.correct += correct; d.rt += rtSum;
  d.areas[area] = (d.areas[area] || 0) + Math.max(1, Math.round(ms / 60000));
  if (req) [].concat(req).forEach(r => (d.req[r] = true));
  rebuildDay(today());
  save();
}

// ---------- stats ----------
export function weekStart(k = today()) {
  const d = new Date(k + 'T12:00');
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow);
  return dkey(d);
}
// A required day = math + AP, or the 5-minute minimum day on tired days.
export const dayDone = d => !!(d && ((d.req.math && d.req.ap) || d.req.min));
export const dayActive = d => !!(d && (d.q > 0 || d.ms > 60000));

export function weekCount(ws) {
  let n = 0;
  for (let i = 0; i < 7; i++) if (dayDone(state.days[addDays(ws, i)])) n++;
  return n;
}
// Streak = consecutive weeks that hit the weekly goal (current week counts if already hit,
// and doesn't break while it's still in progress).
export function weekStreak() {
  const goal = state.profile.weeklyGoal;
  let ws = weekStart(), n = 0;
  if (weekCount(ws) >= goal) n++;
  ws = addDays(ws, -7);
  while (weekCount(ws) >= goal) { n++; ws = addDays(ws, -7); }
  return n;
}
export function dayStreak() {
  let k = today(), n = 0;
  if (!dayActive(state.days[k])) k = addDays(k, -1);
  while (dayActive(state.days[k])) { n++; k = addDays(k, -1); }
  return n;
}

// Pace Score: 40% accuracy, 30% speed vs targets, 30% plan completion.
export function paceScore(k = today()) {
  const d = state.days[k];
  if (!d || !d.q && !d.ms) return 0;
  const acc = d.q ? d.correct / d.q : 0;
  const speed = d.speedIdx ?? (d.q ? 0.6 : 0);
  const plan = Math.max((d.req.math ? 0.4 : 0) + (d.req.ap ? 0.4 : 0), d.req.min ? 0.6 : 0) + (Object.keys(d.areas).length > 2 ? 0.2 : Math.min(0.2, d.ms / 6e5 * 0.2));
  return Math.round(100 * (0.4 * acc + 0.3 * Math.min(1, speed) + 0.3 * Math.min(1, plan)));
}
export function recordSpeed(idx) {
  const d = myDay();
  d.speedIdx = d.speedIdx == null ? idx : (d.speedIdx * 0.6 + idx * 0.4);
  rebuildDay(today());
  save();
}

export function rangeStats(n = 7) {
  let ms = 0, q = 0, c = 0, rt = 0;
  for (let i = 0; i < n; i++) {
    const d = state.days[addDays(today(), -i)];
    if (!d) continue;
    ms += d.ms; q += d.q; c += d.correct; rt += d.rt;
  }
  return { ms, q, acc: q ? c / q : 0, avgRt: q ? rt / q : 0 };
}

// ---------- question stats & SRS ----------
export function markQ(key, right) {
  const s = state.qstats[key] ||= { seen: 0, right: 0, last: 0 };
  s.seen++; if (right) s.right++; s.last = Date.now();
}

// SM-2-lite. grade: 0 = missed, 1 = needed hints, 2 = right, 3 = right + fast
export function srsReview(key, grade, src) {
  const it = state.srs[key] ||= { due: today(), ivl: 0, ease: 2.4, reps: 0, lapses: 0, src };
  if (src) it.src = src;
  it.ts = Date.now();
  if (grade <= 1) {
    it.lapses += grade === 0 ? 1 : 0;
    it.reps = 0; it.ivl = 1;
    it.ease = Math.max(1.3, it.ease - (grade === 0 ? 0.25 : 0.1));
  } else {
    it.reps++;
    it.ivl = it.reps === 1 ? 2 : it.reps === 2 ? 5 : Math.round(it.ivl * it.ease * (grade === 3 ? 1.15 : 1));
    it.ease = Math.min(3, it.ease + (grade === 3 ? 0.05 : 0));
  }
  it.due = addDays(today(), it.ivl);
  save();
}
export function dueItems(filter = () => true) {
  const t = today();
  return Object.entries(state.srs).filter(([k, v]) => v.due <= t && filter(k, v)).map(([k, v]) => ({ key: k, ...v }));
}

// ---------- audio (IndexedDB) ----------
let dbp;
function db() {
  return dbp ||= new Promise((res, rej) => {
    const r = indexedDB.open('pace-audio', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('clips');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
export const audioDB = {
  async put(id, blob) { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('clips', 'readwrite'); t.objectStore('clips').put(blob, id); t.oncomplete = res; t.onerror = () => rej(t.error); }); },
  async get(id) { const d = await db(); return new Promise((res, rej) => { const r = d.transaction('clips').objectStore('clips').get(id); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  async del(id) { const d = await db(); return new Promise(res => { const t = d.transaction('clips', 'readwrite'); t.objectStore('clips').delete(id); t.oncomplete = res; }); },
};

// Personal-records feed (Strava-style). Synced.
export function addRecord(kind, text, value) {
  (state.records ||= []).unshift({ id: uid(), kind, text, value, ts: Date.now() });
  state.records = state.records.slice(0, 300);
  save();
}
// One readiness snapshot per day so the Records page can graph it climbing.
export function snapshotReadiness(map) {
  (state.readinessLog ||= {})[today()] = map;
  save();
}

// Automatic Log entries (deduped by key) - things Pace taught you and what fixed a miss.
export function autoLog(type, text, tags = [], key = text) {
  if (!text) return;
  const k = 'auto:' + key;
  if (state.log.some(e => e.autoKey === k)) return;
  state.log.unshift({ id: uid(), type, text, tags, ts: Date.now(), auto: true, autoKey: k });
  state.log = state.log.slice(0, 600);
  save();
}
