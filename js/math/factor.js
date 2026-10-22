// Factoring practice. Two kinds of questions: the core sub-skill ("two numbers that
// multiply to c and add to b", typed on the keypad) and full factoring (multiple choice
// with the classic wrong answers: flipped signs, swapped numbers, missed GCF).
import { rnd, pick, shuffle } from '../ui.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const nz = (a, b) => { let x; do x = rnd(a, b); while (x === 0); return x; };
const sgn = (n, first = false) => (n < 0 ? (first ? '−' : ' − ') : first ? '' : ' + ');
// Format ax² + bx + c (skips zero terms, writes x instead of 1x)
function poly(a, b, c, v = 'x') {
  const t = [];
  if (a) t.push(`${sgn(a, true)}${Math.abs(a) === 1 ? '' : Math.abs(a)}${v}²`);
  if (b) t.push(`${sgn(b, !t.length)}${Math.abs(b) === 1 ? '' : Math.abs(b)}${v}`);
  if (c) t.push(`${sgn(c, !t.length)}${Math.abs(c)}`);
  return t.join('');
}
// (px + q)
const bin = (p, q, v = 'x') => `(${p === 1 ? '' : p === -1 ? '−' : p}${v}${q < 0 ? ' − ' : ' + '}${Math.abs(q)})`;
const pref = k => (k === 1 ? '' : k === -1 ? '−' : String(k));
const expand = ([p, q, r, s]) => [p * r, p * s + q * r, q * s].join(',');
// Distractors as bracket tuples [p,q,r,s] for (px+q)(rx+s); drops any that are secretly correct.
function wrongPairs(right, candidates, pre = '') {
  const target = expand(right), seen = new Set([`${bin(right[0], right[1])}${bin(right[2], right[3])}`]);
  const out = [];
  for (const t of candidates) {
    if (t.some(x => x === 0) || expand(t) === target) continue;
    const str = pre + bin(t[0], t[1]) + bin(t[2], t[3]);
    if (!seen.has(str)) { seen.add(str); out.push(str); }
  }
  return out.slice(0, 3);
}

function mc(q, a, dist, steps, hints, type) {
  const choices = shuffle([...new Set([a, ...dist])].slice(0, 4));
  return { q, a, choices, mc: true, steps, hints, explain: steps[steps.length - 1], key: `fact:${type}`, skill: 'factor', tags: ['factor'] };
}

export const TYPES = [
  {
    id: 'pair', name: 'Find the pair', desc: 'The core move: multiply to c, add to b',
    lesson: 'List factor pairs of c. If c is negative, the signs are different; if c is positive, they match the sign of b. Pick the pair that adds to b.',
    gen() {
      const r = nz(-9, 9), s = nz(-9, 9); const prod = r * s, sum = r + s;
      const big = Math.max(r, s);
      return {
        q: `Two numbers multiply to **${prod}** and add to **${sum}**. What is the LARGER one?`, a: big, unit: '', tol: 0.001, key: 'fact:pair', skill: 'factor', tags: ['factor'],
        steps: [`Factor pairs of ${Math.abs(prod)}: ${pairs(Math.abs(prod)).map(p => p.join('·')).join(', ')}`, prod < 0 ? 'Product is negative → one positive, one negative.' : `Product is positive → both have the sign of ${sum} (${sum < 0 ? 'both negative' : 'both positive'}).`, `${r} and ${s}: ${r}·${s} = ${prod}, ${r} + ${s} = ${sum}. Larger: ${big}`],
        hints: ['List every factor pair of the product first.', prod < 0 ? 'Negative product: signs differ, so you want pairs whose DIFFERENCE is the sum.' : 'Positive product: same signs, so you want pairs whose SUM matches.', `Pairs for ${Math.abs(prod)}: ${pairs(Math.abs(prod)).map(p => p.join('·')).join(', ')}.`],
        dist: [],
      };
    },
  },
  {
    id: 'gcf', name: 'Pull out the GCF', desc: 'Always check this first',
    lesson: 'Find the greatest common factor of every term (number AND variable), write it outside, divide each term by it.',
    gen() {
      let g, a, b, c;
      do { g = pick([2, 3, 4, 5, 6]); a = nz(1, 5); b = nz(-7, 7); c = nz(-9, 9); } while (gcd(gcd(a, b), c) !== 1);
      const useX = Math.random() < 0.5;
      if (useX) {
        const inner = `${pref(a)}x${sgn(b)}${Math.abs(b)}`;
        const ans = `${g}x(${inner})`;
        return mc(`Factor completely: **${poly(g * a, g * b, 0)}**`, ans, [`${g}(${poly(a, b, 0)})`, `x(${pref(g * a)}x${sgn(g * b)}${Math.abs(g * b)})`, `${g}x(${pref(a)}x${sgn(-b)}${Math.abs(b)})`],
          [`Both terms have ${g} and x in common.`, `Divide each term by ${g}x: ${inner}.`, ans], ['GCF = biggest number AND variable in every term.', 'Both terms contain x - pull it out too.', `The GCF is ${g}x.`], 'gcf');
      }
      const inner = poly(a, b, c);
      const ans = `${g}(${inner})`;
      return mc(`Factor completely: **${poly(g * a, g * b, g * c)}**`, ans, [`${g}(${poly(a, -b, c)})`, `${g}(${poly(a, b, -c)})`, `${g}x(${poly(a, b, c)})`],
        [`Every coefficient is divisible by ${g}.`, `Divide each term by ${g}: ${inner}.`, ans], ['GCF = biggest number that divides every term.', `Look at ${Math.abs(g * a)}, ${Math.abs(g * b)}, ${Math.abs(g * c)}.`, `The GCF is ${g}. Divide each term by it - keep the signs.`], 'gcf');
    },
  },
  {
    id: 'simple', name: 'x² + bx + c', desc: 'Leading coefficient 1',
    lesson: 'Find two numbers that multiply to c and add to b. Those are the numbers in (x + _)(x + _).',
    gen() {
      const r = nz(-9, 9), s = nz(-9, 9);
      const b = r + s, c = r * s;
      if (b === 0) return this.gen();
      const right = [1, r, 1, s];
      const dist = wrongPairs(right, [[1, -r, 1, -s], [1, r, 1, -s], [1, -r, 1, s], [1, r + 1, 1, s - 1], [1, c, 1, 1], [1, b, 1, 1]]);
      return mc(`Factor: **${poly(1, b, c)}**`, `${bin(1, r)}${bin(1, s)}`, dist, [`Need two numbers: product ${c}, sum ${b}.`, `${r} and ${s} work (${r}·${s} = ${c}, ${r} + ${s} = ${b}).`, `${bin(1, r)}${bin(1, s)}`], ['Product = c, sum = b.', c < 0 ? 'c is negative → the signs in the two brackets are different.' : `c is positive → both signs match b (${b < 0 ? 'both −' : 'both +'}).`, `Product ${c}, sum ${b}. Check: does your answer FOIL back?`], 'simple');
    },
  },
  {
    id: 'ac', name: 'ax² + bx + c', desc: 'AC method / grouping',
    lesson: 'Multiply a·c. Find two numbers that multiply to a·c and add to b. Split the middle term with them, then factor by grouping.',
    gen() {
      let p, q, r, s;
      do { p = pick([2, 3, 5]); r = pick([1, 1, 2]); q = nz(-6, 6); s = nz(-6, 6); } while (gcd(p, q) !== 1 || gcd(r, s) !== 1 || p * s + q * r === 0);
      const a = p * r, b = p * s + q * r, c = q * s;
      const m = p * s, n = q * r;
      const right = [p, q, r, s];
      const dist = wrongPairs(right, [[p, -q, r, -s], [p, s, r, q], [p, -q, r, s], [p, q, r, -s], [r, q, p, s], [p * r, q, 1, s], [1, q, p * r, s]]);
      return mc(`Factor: **${poly(a, b, c)}**`, `${bin(p, q)}${bin(r, s)}`, dist, [`a·c = ${a}·${c} = ${a * c}. Need two numbers: product ${a * c}, sum ${b} → ${m} and ${n}.`, `Split: ${poly(a, 0, 0)}${sgn(m)}${Math.abs(m)}x${sgn(n)}${Math.abs(n)}x${sgn(c)}${Math.abs(c)}, then group.`, `${bin(p, q)}${bin(r, s)}`], ['AC method: multiply a and c first.', `Find two numbers with product ${a * c} and sum ${b}, then split the middle term.`, `The numbers are ${m} and ${n}. Group the first two terms and the last two.`], 'ac');
    },
  },
  {
    id: 'special', name: 'Special patterns', desc: 'a² − b², perfect squares',
    lesson: 'a² − b² = (a − b)(a + b). a² + 2ab + b² = (a + b)². a² − 2ab + b² = (a − b)². Sum of squares a² + b² does NOT factor (over the reals).',
    gen() {
      const k = rnd(1, 3), m = rnd(1, 9);
      const kind = pick(['diff', 'diff', 'sqp', 'sqm']);
      const kx = `${k === 1 ? '' : k}x`;
      if (kind === 'diff') {
        const ans = `(${kx} − ${m})(${kx} + ${m})`;
        return mc(`Factor: **${k * k === 1 ? '' : k * k}x² − ${m * m}**`, ans, [`(${kx} − ${m})²`, `(${kx} + ${m})²`, `Doesn't factor`], [`${k * k === 1 ? '' : k * k}x² = (${kx})² and ${m * m} = ${m}².`, 'Difference of squares → (a − b)(a + b).', ans], ['Two perfect squares with a minus between them?', 'a² − b² = (a − b)(a + b).', `a = ${kx}, b = ${m}.`], 'special');
      }
      const plus = kind === 'sqp';
      const ans = `(${kx} ${plus ? '+' : '−'} ${m})²`;
      return mc(`Factor: **${poly(k * k, (plus ? 2 : -2) * k * m, m * m)}**`, ans, [`(${kx} ${plus ? '−' : '+'} ${m})²`, `(${kx} − ${m})(${kx} + ${m})`, `(${kx} ${plus ? '+' : '−'} ${m * m})²`], [`First and last terms are squares: (${kx})² and ${m}².`, `Middle term = 2·${kx}·${m} = ${2 * k * m}x → perfect square.`, ans], ['Are the first and last terms perfect squares?', 'Check if the middle term is 2 × (√first) × (√last).', `√first = ${kx}, √last = ${m}. Sign of the middle term picks + or −.`], 'special');
    },
  },
  {
    id: 'full', name: 'Factor completely', desc: 'GCF first, then the rest',
    lesson: 'Always: 1) pull out the GCF, 2) look at what\'s left - two terms? try difference of squares; three terms? pair numbers or AC method, 3) check each bracket can\'t factor further.',
    gen() {
      const g = pick([2, 3, 4, 5]);
      if (Math.random() < 0.4) { const m = rnd(1, 7); const ans = `${g}(x − ${m})(x + ${m})`; return mc(`Factor completely: **${g}x² − ${g * m * m}**`, ans, [`${g}(x² − ${m * m})`, `(${g}x − ${m})(x + ${m})`, `${g}(x − ${m})²`], [`GCF ${g}: ${g}(x² − ${m * m}).`, `x² − ${m * m} is a difference of squares.`, ans], ['GCF first.', 'What\'s left is two squares with a minus.', `After the GCF: x² − ${m * m}.`], 'full'); }
      const r = nz(-7, 7), s = nz(-7, 7);
      const ans = `${g}${bin(1, r)}${bin(1, s)}`;
      if (r + s === 0) return this.gen();
      return mc(`Factor completely: **${poly(g, g * (r + s), g * r * s)}**`, ans, [`${g}(${poly(1, r + s, r * s)})`, ...wrongPairs([1, r, 1, s], [[1, -r, 1, -s], [1, r, 1, -s]], String(g)).slice(0, 1), `${bin(g, r)}${bin(1, s)}`], [`GCF ${g}: ${g}(${poly(1, r + s, r * s)}).`, `Inside: product ${r * s}, sum ${r + s} → ${r} and ${s}.`, ans], ['Check for a GCF before anything else.', `After pulling out ${g}, factor the trinomial inside.`, `Inside: x² ${r + s < 0 ? '−' : '+'} ... needs product ${r * s}, sum ${r + s}.`], 'full');
    },
  },
];
export const TYPE = Object.fromEntries(TYPES.map(t => [t.id, t]));

function pairs(n) { const out = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) out.push([i, n / i]); return out; }

export function factorQ(type = 'mixed') {
  const t = type === 'mixed' ? pick(TYPES) : TYPE[type];
  const q = t.gen.call(t);
  q.level = 1;
  return q;
}
