// Helpers for writing finance concepts compactly.
export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const $ = n => (n < 0 ? '−$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US');
export const $2 = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pc = (n, d = 1) => `${(n * 100).toFixed(d).replace(/\.0+$/, '')}%`;
export const x = (n, d = 2) => `${n.toFixed(d).replace(/\.?0+$/, '')}`;

// Bank question: correct answer first (the engine shuffles choices).
export const Q = (q, c, e, h = []) => ({ q, c, a: 0, e, h: [].concat(h) });

// Numeric multiple choice: right answer + common-mistake answers, de-duplicated.
export function N(q, right, wrongs, e, h) {
  const c = [right];
  for (const w of wrongs) if (c.length < 4 && !c.includes(w)) c.push(w);
  // pad with nearby values in the same format as the right answer
  const m = right.match(/^(.*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (m) {
    const v = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length;
    for (const k of [1.25, 0.8, 1.5, 0.6, 2, 0.4, 3]) {
      if (c.length >= 4) break;
      const n = v * k, t = m[1] + (dec ? n.toFixed(dec) : Math.round(n).toLocaleString('en-US')) + m[3];
      if (!c.includes(t)) c.push(t);
    }
    for (let k = 1; c.length < 4; k++) { const t = m[1] + (v + k * 5) + m[3]; if (!c.includes(t)) c.push(t); }
  }
  return Q(q, c, e, h);
}

// Scenario contexts (varied settings help ideas transfer beyond one example).
export const CTX = { small: ['☕', 'Small business'], big: ['🏢', 'Big company'], you: ['🧑', 'Your money'], deca: ['🎤', 'DECA roleplay'] };
