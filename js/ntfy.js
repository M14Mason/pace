// Reminders through ntfy (https://ntfy.sh). A static site can't wake itself up,
// so each time Pace opens it queues the next ~48h of reminders as delayed ntfy
// messages. Message text stays generic because it passes through ntfy's server.
import { S, save, today, addDays, day, dayDone } from './store.js';

async function publish({ title, message, at, tags = ['books'] }) {
  const p = S().profile;
  if (!p.ntfyTopic) return false;
  const body = { topic: p.ntfyTopic, title, message, tags, click: location.href.split('#')[0] };
  if (at) body.delay = String(Math.floor(at / 1000));
  const r = await fetch(p.ntfyServer.replace(/\/$/, ''), { method: 'POST', body: JSON.stringify(body) });
  return r.ok;
}

export async function testNtfy() {
  return publish({ title: 'Pace', message: 'Notifications are connected.', tags: ['white_check_mark'] });
}

function atTime(k, hhmm) {
  const [hh, mm] = hhmm.split(':').map(Number);
  const d = new Date(k + 'T00:00'); d.setHours(hh, mm, 0, 0);
  return d.getTime();
}

export async function scheduleReminders() {
  const st = S(), p = st.profile;
  if (!p.ntfyTopic || !navigator.onLine) return;
  const now = Date.now();
  const jobs = [];
  for (let i = 0; i <= 1; i++) {
    const k = addDays(today(), i);
    if (i === 0 && dayDone(day(k))) continue;
    const at = atTime(k, p.reminderTime);
    if (at > now + 60000) jobs.push({ key: `study:${k}`, title: 'Pace', message: 'Your 15-minute session is ready (math + AP). Skip this if you already did it.', at });
  }
  for (const e of st.events) {
    const d1 = addDays(e.date, -1), d3 = addDays(e.date, -3);
    for (const [k, msg] of [[d3, `${e.kind === 'test' ? 'Test' : 'Due'} in 3 days - review plan is ready.`], [d1, `${e.kind === 'test' ? 'Test' : 'Due'} tomorrow - do a timed review tonight.`]]) {
      const at = atTime(k, '16:00');
      if (at > now + 60000 && at < now + 2.2 * 864e5) jobs.push({ key: `ev:${e.id}:${k}`, title: `Pace: ${e.course || 'reminder'}`, message: msg, at });
    }
  }
  for (const j of jobs) {
    if (st.ntfySent[j.key]) continue;
    try { if (await publish(j)) st.ntfySent[j.key] = now; } catch { /* offline */ }
  }
  // prune old keys
  for (const [k, ts] of Object.entries(st.ntfySent)) if (now - ts > 10 * 864e5) delete st.ntfySent[k];
  save();
}

export function randomTopic() {
  return 'pace-' + Array.from(crypto.getRandomValues(new Uint8Array(9)), b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
}
