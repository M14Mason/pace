// Math Sprint skills. Each skill has 8 levels; each level has a speed target
// (median ms per question) and a generator that returns a question with its
// answer, layered hints (recall -> strategy -> where-you-are), worked steps and
// plausible distractors for multiple choice.
import { rnd, pick } from '../ui.js';

const m2 = x => Math.round(x * 100) / 100;
const $ = x => '$' + (Number.isInteger(x) ? x.toString() : x.toFixed(2));
const cents = (a, b) => m2(rnd(a * 100, b * 100) / 100);
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const fr = (n, d) => { const g = gcd(n, d); return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`; };
const near = (a, ...offs) => offs.map(o => m2(a + o)).filter(x => x !== a && x >= 0);

function Q(q, a, steps, hints, dist, extra = {}) {
  return { q, a, steps, hints, dist: [...new Set(dist.map(String))].filter(d => d !== String(a)).slice(0, 3), ...extra };
}

export const SKILLS = [
  {
    id: 'add', name: 'Addition', group: 'Core', icon: '+',
    targets: [2200, 2800, 3600, 4500, 5500, 6500, 7500, 9000],
    lesson: 'Add left to right: big parts first, then the small parts. Round-and-adjust when a number is close to a ten.',
    gen(L) {
      let a, b, c;
      if (L === 1) { a = rnd(2, 9); b = rnd(2, 9); }
      else if (L === 2) { a = rnd(12, 89); b = rnd(2, 9); }
      else if (L === 3) { a = rnd(12, 89); b = rnd(12, 89); }
      else if (L === 4) { a = rnd(120, 899); b = rnd(12, 89); }
      else if (L === 5) { a = rnd(120, 899); b = rnd(120, 899); }
      else if (L === 6) { a = cents(1, 40); b = cents(1, 40); const s = m2(a + b); return Q(`${$(a)} + ${$(b)}`, s, [`Dollars: ${Math.floor(a)} + ${Math.floor(b)} = ${Math.floor(a) + Math.floor(b)}`, `Cents: ${Math.round(a % 1 * 100)} + ${Math.round(b % 1 * 100)} = ${Math.round(a % 1 * 100) + Math.round(b % 1 * 100)}¢`, `Combine: ${$(s)}`], ['Add dollars and cents separately.', 'If cents pass 100, carry $1.', `Dollars first: ${Math.floor(a) + Math.floor(b)}. Now the cents.`], near(s, 1, -1, 0.1), { unit: '$' }); }
      else if (L === 7) { a = rnd(1200, 8999); b = rnd(120, 899); }
      else { a = cents(2, 30); b = cents(2, 30); c = cents(2, 30); const s = m2(a + b + c); return Q(`${$(a)} + ${$(b)} + ${$(c)}`, s, [`Dollars: ${Math.floor(a)}+${Math.floor(b)}+${Math.floor(c)} = ${Math.floor(a) + Math.floor(b) + Math.floor(c)}`, `Cents total: ${Math.round((a % 1 + b % 1 + c % 1) * 100)}¢`, `Total ${$(s)}`], ['Group dollars, then cents.', 'Look for cents that pair to 100 (e.g. 35¢ + 65¢).', `Dollars: ${Math.floor(a) + Math.floor(b) + Math.floor(c)}. Add the cents.`], near(s, 1, -1, 0.1), { unit: '$' }); }
      const s = a + b, tens = Math.floor(b / 10) * 10;
      return Q(`${a} + ${b}`, s, [tens ? `${a} + ${tens} = ${a + tens}` : `${a} + ${b}`, tens ? `${a + tens} + ${b - tens} = ${s}` : `= ${s}`], ['Break the second number into tens and ones.', b % 10 >= 7 ? `Round ${b} up to ${Math.ceil(b / 10) * 10}, then subtract ${Math.ceil(b / 10) * 10 - b}.` : 'Add the biggest place value first.', tens ? `${a} + ${tens} = ${a + tens}. Now add ${b - tens}.` : `Count up from ${a}.`], near(s, 10, -10, 1, -1));
    },
  },
  {
    id: 'sub', name: 'Subtraction', group: 'Core', icon: '−',
    targets: [2400, 3000, 3800, 4800, 5800, 6500, 7500, 9000],
    lesson: 'Count up from the smaller number to the bigger one ("making change"), or subtract a round number and add back.',
    gen(L) {
      let a, b;
      if (L === 1) { b = rnd(2, 9); a = b + rnd(1, 9); }
      else if (L === 2) { a = rnd(21, 99); b = rnd(2, 9); }
      else if (L === 3) { a = rnd(41, 99); b = rnd(12, a - 5); }
      else if (L === 4) { a = rnd(200, 999); b = rnd(12, 99); }
      else if (L === 5) { a = rnd(400, 999); b = rnd(120, a - 50); }
      else if (L === 6 || L === 8) { const paid = L === 6 ? pick([10, 20, 50]) : pick([50, 100]); b = cents(1, paid - 1); const s = m2(paid - b); return Q(`You pay ${$(paid)} for ${$(b)}. Change?`, s, [`Count up from ${$(b)} to the next dollar: ${Math.round((Math.ceil(b) - b) * 100)}¢`, `Then to ${$(paid)}: ${$(paid - Math.ceil(b))}`, `Change = ${$(s)}`], ['Change = paid − price.', 'Count up like a cashier: to the next dollar, then to the bill.', `To the next dollar is ${Math.round((Math.ceil(b) - b) * 100)}¢. Now count to ${$(paid)}.`], near(s, 1, -1, 0.1), { unit: '$' }); }
      else { a = rnd(2000, 9999); b = rnd(300, 1999); }
      const s = a - b, r = Math.ceil(b / 10) * 10;
      if (b < 10) return Q(`${a} − ${b}`, s, [`Count up from ${b} to ${a}`, `${b} + ${s} = ${a}, so ${a} − ${b} = ${s}`], ['Subtracting asks "how far from b up to a?"', `Count up from ${b}: what do you add to reach ${a}?`, a > 10 ? `${b} up to 10 is ${10 - b}; then 10 up to ${a} is ${a - 10}.` : `${b} + ? = ${a}`], near(s, 1, -1, 2));
      return Q(`${a} − ${b}`, s, [`${a} − ${r} = ${a - r}`, `add back ${r - b}: ${s}`], ['Subtracting asks "how far from b up to a?"', `Subtract the round number ${r}, then add back ${r - b}.`, `${a} − ${r} = ${a - r}. Now adjust by ${r - b}.`], near(s, 10, -10, 1, -1));
    },
  },
  {
    id: 'mul', name: 'Multiplication', group: 'Core', icon: '×',
    targets: [2000, 2400, 2800, 4500, 4000, 7000, 7000, 9000],
    lesson: 'Split one factor: 14 × 6 = 10×6 + 4×6. For money, multiply dollars and cents separately.',
    gen(L) {
      let a, b;
      if (L === 1) { a = rnd(2, 5); b = rnd(2, 9); }
      else if (L === 2) { a = rnd(3, 9); b = rnd(3, 9); }
      else if (L === 3) { a = rnd(6, 12); b = rnd(6, 12); }
      else if (L === 4) { a = rnd(13, 49); b = rnd(3, 9); }
      else if (L === 5) { a = m2(rnd(12, 99) / 10); b = pick([10, 100, 1000]); const s = m2(a * b); return Q(`${a} × ${b}`, s, [`× ${b} moves the decimal ${String(b).length - 1} place(s) right`, `= ${s}`], ['×10 shifts digits one place left (bigger).', 'Count the zeros, move the decimal that many places.', `${b} has ${String(b).length - 1} zero(s).`], [m2(a * b / 10), m2(a * b * 10), m2(a * b + b)]); }
      else if (L === 6) { a = rnd(11, 25); b = rnd(11, 19); }
      else if (L === 7) { a = cents(1, 15); b = rnd(3, 9); const s = m2(a * b); return Q(`${b} items at ${$(a)} each`, s, [`${b} × $${Math.floor(a)} = $${b * Math.floor(a)}`, `${b} × ${Math.round(a % 1 * 100)}¢ = ${$(m2(b * (a % 1)))}`, `Total ${$(s)}`], ['Total = quantity × price.', a % 1 > 0.9 ? `Round ${$(a)} up to ${$(Math.ceil(a))}, multiply, then subtract ${b} × ${Math.round((Math.ceil(a) - a) * 100)}¢.` : 'Multiply the dollars, then the cents, then add.', `Dollars part: ${b} × ${Math.floor(a)} = ${b * Math.floor(a)}.`], near(s, b, -b, 1), { unit: '$' }); }
      else { a = rnd(21, 79); b = rnd(21, 49); }
      const s = a * b, t = Math.floor(a / 10) * 10;
      return Q(`${a} × ${b}`, s, [`${t} × ${b} = ${t * b}`, `${a - t} × ${b} = ${(a - t) * b}`, `${t * b} + ${(a - t) * b} = ${s}`], ['Break a factor into tens and ones (distributive property).', `Do ${t} × ${b}, then ${a - t} × ${b}, then add.`, `${t} × ${b} = ${t * b}. Now ${a - t} × ${b}.`], near(s, b, -b, a, 10));
    },
  },
  {
    id: 'div', name: 'Division', group: 'Core', icon: '÷',
    targets: [2400, 2800, 3200, 5000, 4500, 7500, 7000, 9000],
    lesson: 'Think "what times the divisor gives this?" Split the dividend into easy chunks: 84 ÷ 7 = 70÷7 + 14÷7.',
    gen(L) {
      let a, b, s;
      if (L <= 3) { b = rnd(2, [5, 9, 12][L - 1]); s = rnd(2, [5, 9, 12][L - 1]); a = b * s; }
      else if (L === 4) { b = rnd(3, 9); s = rnd(12, 99); a = b * s; }
      else if (L === 5) { a = rnd(12, 999); b = pick([10, 100, 1000]); s = m2(a / b); return Q(`${a} ÷ ${b}`, s, [`÷ ${b} moves the decimal ${String(b).length - 1} place(s) left`, `= ${s}`], ['Dividing by 10 makes the number 10× smaller.', 'Count the zeros; move the decimal left that many places.', `${b} has ${String(b).length - 1} zero(s).`], [m2(s * 10), m2(s / 10), m2(s + 1)]); }
      else if (L === 6) { b = rnd(11, 25); s = rnd(3, 19); a = b * s; }
      else if (L === 7) { b = rnd(2, 6); s = cents(3, 30); a = m2(s * b); return Q(`Split ${$(a)} evenly between ${b} people`, s, [`${$(a)} ÷ ${b}`, `= ${$(s)} each`], ['Each share = total ÷ people.', 'Divide the dollars first, carry the remainder into cents.', `${Math.floor(a)} ÷ ${b} is about ${Math.floor(a / b)}. Handle the rest.`], near(s, 1, -1, 0.5), { unit: '$' }); }
      else { b = rnd(12, 48); s = rnd(11, 49); a = b * s; }
      return Q(`${a} ÷ ${b}`, s, [`${b} × ${Math.floor(s / 10) * 10 || s} = ${b * (Math.floor(s / 10) * 10 || s)}`, `remaining ${a - b * (Math.floor(s / 10) * 10 || s)} ÷ ${b} = ${s - (Math.floor(s / 10) * 10 || s)}`, `Answer ${s}`], [`Ask: ${b} × ? = ${a}`, 'Pull out a big easy chunk (like 10 × the divisor), then finish the rest.', `${b} × 10 = ${b * 10}. How many more ${b}s fit?`], near(s, 1, -1, 10));
    },
  },
  {
    id: 'pct', name: 'Percentages', group: 'Percent & Money', icon: '%',
    targets: [2500, 3200, 4500, 5500, 6000, 7000, 8000, 9000],
    lesson: '10% = move the decimal one left. Build any percent from 10%, 5% and 1%: 15% = 10% + 5%. Percent of = rate × amount.',
    gen(L) {
      const easy = [[10, 'move decimal one place left'], [50, 'halve it']];
      let p, n, s;
      if (L === 1) { [p] = pick(easy); n = rnd(2, 40) * 10; }
      else if (L === 2) { p = pick([20, 25, 5]); n = rnd(2, 40) * 20; }
      else if (L === 3) { p = pick([15, 30, 75, 40]); n = rnd(2, 30) * 20; }
      else if (L === 4) { p = rnd(2, 19) * 5; n = rnd(2, 40) * 10; }
      else if (L === 5) { p = pick([1, 2.5, 12.5, 7.5, 35]); n = rnd(2, 40) * 40; }
      else if (L === 6) { p = pick([15, 20, 30, 8, 6]); n = cents(10, 120); s = m2(n * p / 100); return Q(`${p}% of ${$(n)}`, s, [`10% of ${$(n)} = ${$(m2(n / 10))}`, `${p}% = ${p / 10} × that = ${$(s)}`], ['Percent of = (p ÷ 100) × amount.', `Find 10% first (${$(m2(n / 10))}), then scale to ${p}%.`, `10% is ${$(m2(n / 10))}. Now get ${p}%.`], near(s, 1, -1, m2(n / 10)), { unit: '$', tol: 0.011 }); }
      else if (L === 7) { const b = rnd(2, 20) * 20, pp = pick([5, 10, 15, 20, 25, 30, 40, 60, 75]); const a = b * pp / 100; return Q(`${a} is what % of ${b}?`, pp, [`${a} ÷ ${b} = ${pp / 100}`, `× 100 = ${pp}%`], ['Percent = part ÷ whole × 100.', `What fraction of ${b} is ${a}? Simplify, then convert.`, `${a}/${b} simplifies to ${fr(a, b)}.`], [pp + 5, pp - 5, m2(b / a)], { unit: '%' }); }
      else { const o = rnd(4, 40) * 10, ch = pick([10, 20, 25, 15, -10, -20, -25, 40]); const nw = o * (1 + ch / 100); return Q(`Price went from $${o} to $${nw}. Percent change? (use − for a drop)`, ch, [`Change = ${nw} − ${o} = ${nw - o}`, `÷ original ${o} = ${(nw - o) / o}`, `= ${ch}%`], ['% change = (new − old) ÷ old × 100.', 'Always divide by the ORIGINAL value.', `The change is ${nw - o}. Divide by ${o}.`], [-ch, m2((nw - o) / nw * 100), ch / 2], { unit: '%' }); }
      s = m2(n * p / 100);
      return Q(`${p}% of ${n}`, s, [`10% of ${n} = ${n / 10}`, `${p}% = ${p / 10} × ${n / 10} = ${s}`], ['Percent of = (p ÷ 100) × amount.', p === 50 ? 'Half it.' : p === 25 ? 'Halve it twice.' : p === 5 ? 'Find 10%, then halve.' : `Build ${p}% from 10% and 5% pieces.`, `10% of ${n} is ${n / 10}.`], near(s, n / 10, -n / 10, n / 20));
    },
  },
  {
    id: 'tip', name: 'Tips', group: 'Percent & Money', icon: '✦',
    targets: [3000, 3500, 4500, 6000, 7000, 8000, 10000, 11000],
    lesson: '20% tip = double 10%. 15% = 10% + half of 10%. 18% ≈ 20% − 2%. Round the bill first when an estimate is fine.',
    gen(L) {
      let bill, p, s;
      if (L === 1) { bill = rnd(2, 12) * 10; p = 10; }
      else if (L === 2) { bill = rnd(2, 12) * 10; p = 20; }
      else if (L === 3) { bill = rnd(2, 12) * 10; p = 15; }
      else if (L === 4) { bill = cents(12, 90); p = 15; }
      else if (L === 5) { bill = cents(20, 120); p = 18; }
      else if (L === 6) { bill = cents(20, 120); p = 20; s = m2(bill * 1.2); return Q(`Bill ${$(bill)}, 20% tip. Total to pay?`, s, [`10% = ${$(m2(bill / 10))}`, `20% = ${$(m2(bill / 5))}`, `Total ${$(s)}`], ['Total = bill × 1.20.', 'Find 10%, double it, add to the bill.', `20% tip is ${$(m2(bill / 5))}. Add the bill.`], near(s, 1, -1, -m2(bill / 10)), { unit: '$', tol: 0.011 }); }
      else if (L === 7) { bill = rnd(6, 20) * 10; const ppl = pick([2, 3, 4]); s = m2(bill * 1.2 / ppl); return Q(`$${bill} bill, 20% tip, split ${ppl} ways. Each pays?`, s, [`Total with tip: $${m2(bill * 1.2)}`, `÷ ${ppl} = ${$(s)}`], ['Total = bill × 1.2, then divide by people.', 'Add the tip first, then split.', `Total with tip is $${m2(bill * 1.2)}.`], near(s, 1, -1, m2(bill / ppl)), { unit: '$', tol: 0.011 }); }
      else { const pre = cents(40, 100), tx = 8; bill = m2(pre * 1.08); s = m2(pre * 0.2); return Q(`Subtotal ${$(pre)}, ${tx}% tax makes it ${$(bill)}. 20% tip on the pre-tax amount?`, s, [`Tip uses subtotal ${$(pre)}`, `20% = ${$(s)}`], ['Tip is usually figured on the pre-tax subtotal.', 'Ignore the tax total; use the subtotal.', `10% of ${$(pre)} is ${$(m2(pre / 10))}.`], near(s, m2(bill * 0.2 - s), 1, -1), { unit: '$', tol: 0.011 }); }
      s = m2(bill * p / 100);
      return Q(`${p}% tip on ${$(bill)}`, s, [`10% = ${$(m2(bill / 10))}`, p === 15 ? `5% = ${$(m2(bill / 20))}` : p === 18 ? `2% = ${$(m2(bill / 50))}` : `×${p / 10}`, `Tip ${$(s)}`], ['Tip = bill × rate.', p === 15 ? '15% = 10% + half of 10%.' : p === 18 ? '18% = 20% − 2%.' : p === 20 ? 'Double 10%.' : 'Move the decimal one left.', `10% of the bill is ${$(m2(bill / 10))}.`], near(s, m2(bill / 10), 1, -1), { unit: '$', tol: 0.011 });
    },
  },
  {
    id: 'disc', name: 'Discounts', group: 'Percent & Money', icon: '↓',
    targets: [3000, 3500, 4500, 6000, 6500, 9000, 10000, 11000],
    lesson: 'Sale price = price × (1 − discount). 30% off means you pay 70%. Two discounts multiply - they do NOT add.',
    gen(L) {
      let p, d, s;
      if (L === 1) { p = rnd(2, 20) * 10; d = 50; }
      else if (L === 2) { p = rnd(2, 20) * 20; d = 25; }
      else if (L === 3) { p = rnd(2, 20) * 10; d = pick([20, 30, 40]); }
      else if (L === 4) { p = m2(rnd(10, 90) - 0.01); d = pick([10, 20, 25]); }
      else if (L === 5) { p = rnd(20, 150); d = pick([15, 35, 60]); }
      else if (L === 6) { p = rnd(5, 20) * 10; s = m2(p * 0.8 * 0.9); return Q(`$${p} item: 20% off, then an extra 10% off the sale price. Final price?`, s, [`After 20% off: $${m2(p * 0.8)}`, `10% off that: −$${m2(p * 0.08)}`, `Final ${$(s)}`], ['Stacked discounts multiply: × 0.8 × 0.9.', 'Do one discount at a time - the second applies to the NEW price.', `After the first discount: $${m2(p * 0.8)}.`], [m2(p * 0.7), m2(p * 0.8), m2(p * 0.75)], { unit: '$', tol: 0.011 }); }
      else if (L === 7) { const o = rnd(4, 30) * 10; d = pick([20, 25, 40, 50]); const sale = m2(o * (1 - d / 100)); return Q(`On sale for $${sale} after ${d}% off. Original price?`, o, [`$${sale} is ${100 - d}% of the original`, `$${sale} ÷ ${(100 - d) / 100} = $${o}`], ['Sale = original × (1 − d).', `Divide the sale price by ${(100 - d) / 100}.`, `$${sale} represents ${100 - d}% of the original.`], [m2(sale * (1 + d / 100)), m2(sale + d), o + 10], { unit: '$', tol: 0.011 }); }
      else { const a = rnd(4, 12) * 10, b = a + rnd(1, 3) * 10, da = pick([10, 15]), db = pick([25, 30, 35]); const fa = m2(a * (1 - da / 100)), fb = m2(b * (1 - db / 100)); s = m2(Math.abs(fa - fb)); return Q(`Deal A: $${a} at ${da}% off. Deal B: $${b} at ${db}% off. How much cheaper is the better deal?`, s, [`A = $${fa}`, `B = $${fb}`, `Difference $${s}`], ['Compute each final price, then subtract.', 'Pay-percent: A pays ' + (100 - da) + '%, B pays ' + (100 - db) + '%.', `Deal A costs $${fa}. Now Deal B.`], near(s, 1, -1, 5), { unit: '$', tol: 0.011 }); }
      s = m2(p * (1 - d / 100));
      return Q(`${$(p)} with ${d}% off`, s, [`You pay ${100 - d}%`, `${100 - d}% of ${$(p)} = ${$(s)}`], ['Sale price = price × (1 − discount).', `Find ${d}% and subtract, or go straight to ${100 - d}%.`, `${d}% of ${$(p)} is ${$(m2(p * d / 100))}.`], [m2(p * d / 100), m2(p - d), near(s, 1)[0]], { unit: '$', tol: 0.011 });
    },
  },
  {
    id: 'tax', name: 'Sales Tax', group: 'Percent & Money', icon: 'T',
    targets: [3000, 3500, 4500, 6000, 6500, 8000, 10000, 11000],
    lesson: 'Total = price × (1 + tax rate). 7% tax on $40: 1% is $0.40, so 7% is $2.80. Discount first, then tax.',
    gen(L) {
      let p, t, s;
      if (L === 1) { p = rnd(2, 20) * 10; t = 10; }
      else if (L === 2) { p = rnd(2, 20) * 10; t = 5; }
      else if (L === 3) { p = rnd(2, 20) * 10; t = pick([6, 7, 8]); }
      else if (L === 4) { p = rnd(2, 20) * 20; t = pick([6.5, 7.25, 8.5]); }
      else if (L === 5) { p = cents(8, 60); t = pick([6, 7, 8]); s = m2(p * (1 + t / 100)); return Q(`${$(p)} + ${t}% tax. Total?`, s, [`1% = ${$(m2(p / 100))}`, `${t}% = ${$(m2(p * t / 100))}`, `Total ${$(s)}`], ['Total = price × (1 + rate).', 'Find 1%, multiply by the rate, add.', `1% of ${$(p)} ≈ ${$(m2(p / 100))}.`], near(s, m2(-p * t / 100), 1, -1), { unit: '$', tol: 0.011 }); }
      else if (L === 6) { p = rnd(4, 20) * 10; const d = pick([20, 25]); t = 8; s = m2(p * (1 - d / 100) * 1.08); return Q(`$${p} item, ${d}% off, then 8% tax. You pay?`, s, [`Sale: $${m2(p * (1 - d / 100))}`, `Tax 8%: $${m2(p * (1 - d / 100) * 0.08)}`, `Total ${$(s)}`], ['Discount first, then tax the sale price.', `× ${(100 - d) / 100} then × 1.08.`, `Sale price is $${m2(p * (1 - d / 100))}.`], [m2(p * (1 - (d - 8) / 100)), m2(p * 1.08), m2(p * (1 - d / 100))], { unit: '$', tol: 0.011 }); }
      else if (L === 7) { p = rnd(4, 30) * 10; t = pick([5, 8, 10]); const tot = m2(p * (1 + t / 100)); return Q(`Receipt total $${tot} includes ${t}% tax. Price before tax?`, p, [`$${tot} = 1.${String(t).padStart(2, '0')} × price`, `$${tot} ÷ ${1 + t / 100} = $${p}`], ['Total = price × (1 + rate), so price = total ÷ (1 + rate).', `Divide by ${1 + t / 100}, don't subtract ${t}% of the total.`, `Set up: ${1 + t / 100} × price = ${tot}.`], [m2(tot * (1 - t / 100)), m2(tot - t), p + 1], { unit: '$', tol: 0.011 }); }
      else { p = rnd(3, 10) * 10; s = m2(p * 1.08 + p * 0.2); return Q(`$${p} dinner: 8% tax + 20% tip on pre-tax. Total?`, s, [`Tax: $${m2(p * 0.08)}`, `Tip: $${m2(p * 0.2)}`, `Total ${$(s)}`], ['Total = price + tax + tip (both on price).', 'That is price × 1.28.', `Tax is $${m2(p * 0.08)}. Now the tip.`], [m2(p * 1.08 * 1.2), m2(p * 1.2), m2(p * 1.08)], { unit: '$', tol: 0.011 }); }
      s = m2(p * (1 + t / 100));
      return Q(`$${p} + ${t}% tax. Total?`, s, [`${t}% of $${p} = $${m2(p * t / 100)}`, `Total $${s}`], ['Total = price × (1 + rate).', t === 10 ? 'Tax is 10%: move the decimal.' : t === 5 ? '5% is half of 10%.' : `1% is $${p / 100}; multiply by ${t}.`, `Tax is $${m2(p * t / 100)}. Add it.`], [m2(p * t / 100), m2(p + t), near(s, 1)[0]], { unit: '$', tol: 0.011 });
    },
  },
  {
    id: 'total', name: 'Totals', group: 'Percent & Money', icon: 'Σ',
    targets: [3500, 4500, 5500, 7000, 8000, 9000, 10000, 12000],
    lesson: 'Round each price to the nearest dollar, add, then fix the rounding (e.g. three $x.99 items: subtract 3¢).',
    gen(L) {
      const n = L <= 2 ? 2 : L <= 5 ? 3 : 4;
      const items = Array.from({ length: n }, () => L <= 1 ? rnd(2, 20) : L <= 3 ? m2(rnd(2, 20) - pick([0, 0.01, 0.5, 0.25])) : cents(1, 25));
      const qty = L >= 6 ? items.map(() => rnd(1, 3)) : items.map(() => 1);
      const s = m2(items.reduce((a, x, i) => a + x * qty[i], 0));
      const lbl = items.map((x, i) => qty[i] > 1 ? `${qty[i]}×${$(x)}` : $(x)).join(' + ');
      return Q(`Total: ${lbl}`, s, [`Rounded: ${items.map((x, i) => Math.round(x) * qty[i]).join(' + ')} = ${items.reduce((a, x, i) => a + Math.round(x) * qty[i], 0)}`, `Adjust for rounding → ${$(s)}`], ['Add the dollars, then the cents.', 'Round prices like $4.99 to $5, add, then subtract the pennies you added.', `Rounded total is about $${items.reduce((a, x, i) => a + Math.round(x) * qty[i], 0)}.`], near(s, 1, -1, 0.1), { unit: '$' });
    },
  },
  {
    id: 'frac', name: 'Fractions', group: 'Number Sense', icon: '½',
    targets: [4000, 4500, 4500, 7000, 6000, 7000, 5000, 9000],
    lesson: 'Answers as a/b in lowest terms. Same denominator: add the tops. Different: find a common denominator. Multiply: tops × tops, bottoms × bottoms. Divide: flip and multiply.',
    gen(L) {
      if (L === 1) { const d = pick([4, 6, 8, 10, 12]), k = pick([2, 3]), n = rnd(1, d - 1); return Q(`Simplify ${n * k}/${d * k}`, fr(n, d), [`Divide top and bottom by ${gcd(n * k, d * k)}`, `= ${fr(n, d)}`], ['Divide top and bottom by the same number.', 'Find the greatest common factor.', `Both are divisible by ${k}.`], [`${n}/${d * k}`, `${n * k}/${d}`, fr(n + 1, d)], { kind: 'frac' }); }
      if (L === 2) { const d = pick([5, 7, 8, 9, 12]), a = rnd(1, d - 2), b = rnd(1, d - a - 1); return Q(`${a}/${d} + ${b}/${d}`, fr(a + b, d), [`Same denominator: add tops ${a}+${b}=${a + b}`, `= ${fr(a + b, d)}`], ['Same bottom? Add the tops, keep the bottom.', 'Then simplify if you can.', `Top: ${a} + ${b}.`], [`${a + b}/${2 * d}`, fr(a + b + 1, d), fr(Math.abs(a - b) || 1, d)], { kind: 'frac' }); }
      if (L === 3) { const d = pick([3, 4, 5, 8]), n = rnd(1, d - 1), w = d * rnd(2, 12); const s = w / d * n; return Q(`${n}/${d} of ${w}`, s, [`1/${d} of ${w} = ${w / d}`, `× ${n} = ${s}`], ['"Of" means multiply.', `Divide by the bottom (${d}), multiply by the top (${n}).`, `1/${d} of ${w} is ${w / d}.`], [w / d, s + w / d, w * n], {}); }
      if (L === 4) { const [a, b] = pick([[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [2, 7]]); const x = rnd(1, a - 1) || 1, y = rnd(1, b - 1) || 1; const n = x * b + y * a, d = a * b; return Q(`${x}/${a} + ${y}/${b}`, fr(n, d), [`Common denominator ${d}`, `${x * b}/${d} + ${y * a}/${d} = ${n}/${d}`, `= ${fr(n, d)}`], ['Different bottoms: rewrite with a common denominator.', `Use ${a} × ${b} = ${d} (or the LCM).`, `${x}/${a} = ${x * b}/${d}.`], [`${x + y}/${a + b}`, fr(n + 1, d), `${x + y}/${d}`], { kind: 'frac' }); }
      if (L === 5) { const a = rnd(1, 5), b = rnd(a + 1, 9), c = rnd(1, 5), d = rnd(c + 1, 9); return Q(`${a}/${b} × ${c}/${d}`, fr(a * c, b * d), [`Tops: ${a}×${c}=${a * c}`, `Bottoms: ${b}×${d}=${b * d}`, `= ${fr(a * c, b * d)}`], ['Multiply straight across.', 'Cancel common factors first to keep numbers small.', `Top is ${a * c}.`], [fr(a * d, b * c), `${a + c}/${b + d}`, fr(a * c + 1, b * d)], { kind: 'frac' }); }
      if (L === 6) { const a = rnd(1, 5), b = rnd(a + 1, 9), c = rnd(1, 5), d = rnd(c + 1, 9); return Q(`${a}/${b} ÷ ${c}/${d}`, fr(a * d, b * c), [`Flip the second: ${d}/${c}`, `${a}/${b} × ${d}/${c} = ${a * d}/${b * c}`, `= ${fr(a * d, b * c)}`], ['Dividing by a fraction = multiplying by its reciprocal.', 'Keep, change, flip.', `Flip ${c}/${d} to ${d}/${c}.`], [fr(a * c, b * d), fr(b * c, a * d), fr(a * d + 1, b * c)], { kind: 'frac' }); }
      if (L === 7) { const [f, p] = pick([['1/8', 12.5], ['3/8', 37.5], ['5/8', 62.5], ['1/5', 20], ['3/5', 60], ['1/3', 33.3], ['2/3', 66.7], ['3/4', 75], ['7/20', 35], ['9/25', 36], ['1/6', 16.7], ['7/8', 87.5]]); return Q(`${f} as a percent (1 decimal if needed)`, p, [`${f} = ${(f.split('/')[0] / f.split('/')[1]).toFixed(3)}`, `× 100 = ${p}%`], ['Fraction → decimal: top ÷ bottom. Then × 100.', 'Memorize eighths: 1/8 = 12.5%.', `Divide ${f.split('/')[0]} by ${f.split('/')[1]}.`], [p + 5, p - 2.5, m2(p / 10)], { unit: '%', tol: 0.06 }); }
      const w = rnd(1, 3), n = rnd(1, 3), d = 4, w2 = rnd(1, 2), n2 = rnd(1, 3); const N = (w * d + n) + (w2 * d + n2); return Q(`${w} ${n}/${d} + ${w2} ${n2}/${d} (answer as improper a/b)`, fr(N, d), [`Convert: ${w * d + n}/${d} + ${w2 * d + n2}/${d}`, `= ${N}/${d} = ${fr(N, d)}`], ['Mixed → improper: whole × bottom + top.', 'Or add wholes and fractions separately, then convert.', `${w} ${n}/${d} = ${w * d + n}/${d}.`], [fr(N + 1, d), `${w + w2 + n + n2}/${d}`, fr(N - 1, d)], { kind: 'frac' });
    },
  },
  {
    id: 'ratio', name: 'Ratios & Rates', group: 'Number Sense', icon: ':',
    targets: [4000, 4500, 5000, 6000, 8000, 7000, 7000, 9000],
    lesson: 'A ratio scales: 3:5 = 6:10 = 9:15. Unit rate = total ÷ units. Split $X in a:b → each part = X ÷ (a+b).',
    gen(L) {
      if (L === 1) { const a = rnd(1, 5), b = rnd(2, 7), k = rnd(2, 6); return Q(`${a * k}:${b * k} simplifies to ${a}:?`, b, [`÷ ${k}`, `${b * k} ÷ ${k} = ${b}`], ['Divide both parts by the same number.', `${a * k} became ${a}: divided by ${k}.`, `Now ${b * k} ÷ ${k}.`], [b * k, b + 1, k]); }
      if (L === 2) { const a = rnd(2, 6), b = rnd(3, 9), k = rnd(2, 9); return Q(`${a}:${b} = ${a * k}:?`, b * k, [`${a} → ${a * k} is × ${k}`, `${b} × ${k} = ${b * k}`], ['Equivalent ratios multiply both parts by the same factor.', `What turns ${a} into ${a * k}?`, `The factor is ${k}.`], [b + k, b * k + k, a * k + b]); }
      if (L === 3) { const a = rnd(2, 9), b = rnd(2, 9), c = a * rnd(2, 8); return Q(`${a}/${b} = ${c}/x. x = ?`, c / a * b, [`${a} × ${c / a} = ${c}`, `x = ${b} × ${c / a} = ${c / a * b}`], ['Proportions: cross-multiply or find the scale factor.', `Scale factor: ${c} ÷ ${a}.`, `Factor is ${c / a}.`], [c + b - a, b * c, c / a + b]); }
      if (L === 4) { const u = rnd(3, 12), r = m2(rnd(150, 900) / 100); const tot = m2(u * r); return Q(`${u} lbs cost ${$(tot)}. Price per lb?`, r, [`Unit rate = total ÷ units`, `${$(tot)} ÷ ${u} = ${$(r)}`], ['Unit price = cost ÷ quantity.', 'Estimate first: round the cost.', `About ${$(Math.round(tot))} ÷ ${u}.`], near(r, 1, -0.5, 0.25), { unit: '$', tol: 0.011 }); }
      if (L === 5) { const s1 = rnd(8, 16), p1 = m2(s1 * rnd(18, 40) / 100), s2 = s1 + rnd(4, 12), p2 = m2(s2 * rnd(18, 40) / 100); const u1 = p1 / s1, u2 = p2 / s2; const ans = u1 < u2 ? 'A' : 'B'; return { q: `Better buy? A: ${s1} oz for ${$(p1)}   B: ${s2} oz for ${$(p2)}`, a: ans, steps: [`A: ${$(m2(u1))}/oz`, `B: ${$(m2(u2))}/oz`, `${ans} is cheaper per ounce`], hints: ['Compare cost per ounce, not total price.', 'Divide each price by its size.', `A is about ${$(m2(u1))} per oz.`], dist: [ans === 'A' ? 'B' : 'A', 'Same'], kind: 'choice', choices: ['A', 'B', 'Same'] }; }
      if (L === 6) { const a = rnd(1, 4), b = rnd(2, 5), k = rnd(5, 40); const X = (a + b) * k; return Q(`Split $${X} in the ratio ${a}:${b}. Larger share?`, Math.max(a, b) * k, [`Parts: ${a}+${b}=${a + b}`, `1 part = $${X} ÷ ${a + b} = $${k}`, `Larger share = ${Math.max(a, b)} × $${k} = $${Math.max(a, b) * k}`], ['Each part = total ÷ (sum of ratio parts).', 'Add the ratio numbers to get the number of parts.', `There are ${a + b} parts.`], [Math.min(a, b) * k, X / 2, k], { unit: '$' }); }
      if (L === 7) { const sp = rnd(30, 70), hr = pick([1.5, 2.5, 0.5, 3]); return Q(`At ${sp} mph, how far in ${hr} hours?`, m2(sp * hr), [`d = r × t`, `${sp} × ${hr} = ${m2(sp * hr)}`], ['Distance = rate × time.', hr % 1 ? `${hr} h = ${Math.floor(hr)} h + half an hour.` : 'Multiply.', `${sp} × ${Math.floor(hr)} = ${sp * Math.floor(hr)}.`], near(m2(sp * hr), sp / 2, -sp / 2, 10)); }
      const w = rnd(12, 30), r = pick([1.5, 2.5, 1.25]); return Q(`A recipe for 4 uses ${w} g of sugar. How much for ${4 * r} people?`, m2(w * r), [`Scale factor ${4 * r}/4 = ${r}`, `${w} × ${r} = ${m2(w * r)}`], ['Scale every amount by new ÷ old.', `${4 * r} ÷ 4 = ${r}.`, `Multiply ${w} by ${r}.`], near(m2(w * r), w, -w / 2, 4));
    },
  },
  {
    id: 'mental', name: 'Mental Tricks', group: 'Number Sense', icon: '⚡',
    targets: [3000, 3500, 4000, 4500, 5000, 6000, 6000, 8000],
    lesson: '×5 = ×10 ÷ 2. ×9 = ×10 − once. ×11 (2-digit): split digits, put their sum in the middle. ×25 = ×100 ÷ 4. Squares near 50: (50+a)² = 2500 + 100a + a².',
    gen(L) {
      const tricks = [
        () => { const n = rnd(12, 98); return Q(`${n} × 5`, n * 5, [`${n} × 10 = ${n * 10}`, `÷ 2 = ${n * 5}`], ['×5 = ×10 then halve.', `${n}0 halved.`, `${n} × 10 = ${n * 10}.`], [n * 5 + 5, n * 10, n * 5 - 10]); },
        () => { const n = rnd(12, 98); return Q(`${n} × 9`, n * 9, [`${n} × 10 = ${n * 10}`, `− ${n} = ${n * 9}`], ['×9 = ×10 minus one copy.', `${n}0 − ${n}.`, `${n} × 10 = ${n * 10}.`], [n * 9 + 9, n * 9 - 10, n * 10]); },
        () => { const a = rnd(1, 8), b = rnd(1, 9 - a), n = a * 10 + b; return Q(`${n} × 11`, n * 11, [`Digits ${a} _ ${b}`, `middle = ${a}+${b} = ${a + b}`, `${n * 11}`], ['×11 on 2 digits: split the digits, put their sum in the middle.', `${a}, then ${a}+${b}, then ${b}.`, `Middle digit is ${a + b}.`], [n * 11 + 10, n * 10, n * 11 - 11]); },
        () => { const n = rnd(4, 39) * 4; return Q(`${n} × 25`, n * 25, [`${n} × 100 = ${n * 100}`, `÷ 4 = ${n * 25}`], ['×25 = ×100 then ÷4.', 'Quarter of the hundred-times.', `${n} × 100 = ${n * 100}.`], [n * 25 + 25, n * 20, n * 50]); },
        () => { const n = rnd(12, 49) * 2; return Q(`Double ${n * 3 + 1}, then halve ${n}`, `${(n * 3 + 1) * 2}, ${n / 2}`, [], [], [], { kind: 'skip' }); },
        () => { const a = rnd(-6, 6) || 3, n = 50 + a; return Q(`${n}²`, n * n, [`(50 ${a < 0 ? '−' : '+'} ${Math.abs(a)})²`, `2500 ${a < 0 ? '−' : '+'} ${Math.abs(100 * a)} + ${a * a}`, `= ${n * n}`], ['(50 + a)² = 2500 + 100a + a².', `a = ${a}.`, `2500 ${a < 0 ? '−' : '+'} ${Math.abs(100 * a)} = ${2500 + 100 * a}.`], [n * n + 100, n * 50, n * n - a * a]); },
        () => { const n = rnd(3, 9) * 10 + 5; return Q(`${n}²`, n * n, [`${Math.floor(n / 10)} × ${Math.floor(n / 10) + 1} = ${Math.floor(n / 10) * (Math.floor(n / 10) + 1)}`, `append 25 → ${n * n}`], ['Squares ending in 5: n × (n+1), then write 25.', `${Math.floor(n / 10)} × ${Math.floor(n / 10) + 1}.`, `That product is ${Math.floor(n / 10) * (Math.floor(n / 10) + 1)}.`], [n * n + 100, n * n - 100, n * 10]); },
        () => { const a = rnd(31, 69), b = rnd(31, 69); const e = Math.round(a / 10) * 10 * Math.round(b / 10) * 10; const exact = a * b; return { q: `Estimate ${a} × ${b} (closest)`, a: String(exact), steps: [`≈ ${Math.round(a / 10) * 10} × ${Math.round(b / 10) * 10} = ${e}`], hints: ['Round both to the nearest ten.', 'Then pick the closest option.', `≈ ${e}`], dist: [String(exact * 2), String(Math.round(exact / 10)), String(exact + 1000)], kind: 'choice', choices: null }; },
      ].filter((_, i) => i !== 4);
      const pool = L <= 2 ? tricks.slice(0, 2) : L <= 4 ? tricks.slice(0, 4) : L <= 6 ? tricks.slice(0, 6) : tricks;
      return pick(pool)();
    },
  },
  {
    id: 'fin', name: 'Financial Math', group: 'Percent & Money', icon: '$',
    targets: [5000, 5500, 6000, 7000, 8000, 9000, 10000, 12000],
    lesson: 'Simple interest I = P·r·t. Markup: price = cost × (1 + markup). Margin = profit ÷ price. Overtime = 1.5× hourly. Break-even units = fixed costs ÷ (price − variable cost).',
    gen(L) {
      const bank = [
        () => { const h = rnd(10, 30), r = pick([12, 15, 16, 18, 20]); return Q(`Work ${h} hours at $${r}/hr. Gross pay?`, h * r, [`${h} × ${r}`, `= $${h * r}`], ['Pay = hours × rate.', `Do ${h} × ${r} by splitting ${h}.`, `${h} × 10 = ${h * 10}.`], [h * r + r, h * r - r, h + r], { unit: '$' }); },
        () => { const P = rnd(5, 40) * 100, r = pick([2, 3, 4, 5, 6]), t = rnd(1, 4); return Q(`$${P} at ${r}% simple interest for ${t} years. Interest earned?`, P * r * t / 100, [`I = P·r·t`, `${P} × ${r / 100} × ${t} = ${P * r * t / 100}`], ['Simple interest: I = P × r × t (r as a decimal).', `1 year = ${r}% of ${P} = ${P * r / 100}.`, `One year earns $${P * r / 100}.`], [P * r / 100, P * r * t / 100 + P, P * r * t / 10], { unit: '$' }); },
        () => { const c = rnd(4, 40) * 5, mk = pick([20, 25, 40, 50, 60, 100]); return Q(`Cost $${c}, markup ${mk}%. Selling price?`, m2(c * (1 + mk / 100)), [`Markup $${m2(c * mk / 100)}`, `Price $${m2(c * (1 + mk / 100))}`], ['Price = cost × (1 + markup %).', `Find ${mk}% of $${c}, add it.`, `${mk}% of ${c} is ${m2(c * mk / 100)}.`], [m2(c * mk / 100), m2(c + mk), m2(c * (1 - mk / 100))], { unit: '$' }); },
        () => { const p = rnd(4, 20) * 10, prof = pick([0.2, 0.25, 0.3, 0.4, 0.5]); const c = m2(p * (1 - prof)); return Q(`Sells for $${p}, costs $${c}. Profit margin %?`, prof * 100, [`Profit = ${p} − ${c} = ${m2(p - c)}`, `÷ price ${p} = ${prof}`, `= ${prof * 100}%`], ['Margin = profit ÷ SELLING price.', 'Not ÷ cost (that would be markup).', `Profit is $${m2(p - c)}.`], [m2((p - c) / c * 100), (prof * 100) + 10, m2(p - c)], { unit: '%', tol: 0.6 }); },
        () => { const r = pick([15, 16, 18, 20]), ot = rnd(2, 8); return Q(`$${r}/hr, 40 regular hours + ${ot} overtime hours at 1.5×. Weekly pay?`, 40 * r + ot * r * 1.5, [`Regular 40 × ${r} = ${40 * r}`, `OT ${ot} × ${r * 1.5} = ${ot * r * 1.5}`, `Total ${40 * r + ot * r * 1.5}`], ['Overtime rate = 1.5 × hourly.', 'Pay regular and overtime separately, then add.', `Overtime rate is $${r * 1.5}.`], [(40 + ot) * r, 40 * r + ot * r * 2, 40 * r], { unit: '$' }); },
        () => { const goal = rnd(6, 30) * 100, per = pick([50, 100, 150, 200, 250]); return Q(`Save $${per}/month. Months to reach $${goal}? (round up)`, Math.ceil(goal / per), [`${goal} ÷ ${per} = ${m2(goal / per)}`, `Round up: ${Math.ceil(goal / per)}`], ['Months = goal ÷ monthly saving.', 'Any remainder means one more month.', `${per} × 10 = ${per * 10}.`], [Math.floor(goal / per) - 1, Math.ceil(goal / per) + 2, goal / 100]); },
        () => { const F = rnd(5, 30) * 100, p = rnd(15, 40), v = rnd(5, p - 5); return Q(`Fixed costs $${F}. Price $${p}, variable cost $${v}/unit. Break-even units? (round up)`, Math.ceil(F / (p - v)), [`Contribution = ${p} − ${v} = ${p - v}`, `${F} ÷ ${p - v} = ${m2(F / (p - v))}`, `Round up: ${Math.ceil(F / (p - v))}`], ['Break-even = fixed ÷ (price − variable cost).', 'Each unit "contributes" price minus variable cost.', `Contribution per unit is $${p - v}.`], [Math.ceil(F / p), Math.ceil(F / v), Math.ceil(F / (p - v)) + 10]); },
        () => { const P = rnd(10, 50) * 100, r = pick([4, 5, 6, 8, 10]); return Q(`$${P} compounding ${r}% annually for 2 years. Balance? (to the cent)`, m2(P * (1 + r / 100) ** 2), [`Year 1: ${P} × ${1 + r / 100} = ${m2(P * (1 + r / 100))}`, `Year 2: × ${1 + r / 100} = ${m2(P * (1 + r / 100) ** 2)}`], ['Compound: multiply by (1 + r) each year.', 'Year 2 earns interest on year 1 interest too.', `After year 1: $${m2(P * (1 + r / 100))}.`], [m2(P * (1 + 2 * r / 100)), m2(P * (1 + r / 100)), m2(P * 2 * r / 100)], { unit: '$', tol: 0.011 }); },
        () => { const price = rnd(12, 60), eps = m2(price / pick([10, 12, 15, 20, 25])); return Q(`Stock at $${price}, EPS $${eps}. P/E ratio? (1 decimal)`, m2(price / eps), [`P/E = price ÷ EPS`, `${price} ÷ ${eps} = ${m2(price / eps)}`], ['P/E = share price ÷ earnings per share.', 'How many years of current earnings you are paying for.', `Divide ${price} by ${eps}.`], [m2(eps / price), m2(price * eps), m2(price / eps) + 5], { tol: 0.06 }); },
      ];
      const pool = bank.slice(0, Math.min(bank.length, 2 + L));
      return pick(pool)();
    },
  },
];

export const SKILL = Object.fromEntries(SKILLS.map(s => [s.id, s]));
export const GROUPS = [...new Set(SKILLS.map(s => s.group))];

// Build a question; normalises choices for MC mode.
export function makeQ(skillId, level, mode = 'free') {
  let q, tries = 0;
  do { q = SKILL[skillId].gen(level); tries++; } while ((q.kind === 'skip' || !q.steps) && tries < 10);
  q.skill = skillId; q.level = level; q.key = `math:${skillId}:${level}`;
  const isChoice = q.kind === 'choice';
  if (isChoice || mode === 'mc' || (mode === 'mixed' && Math.random() < 0.35)) {
    const opts = q.choices || [String(q.a), ...q.dist].slice(0, 4);
    while (opts.length < (q.choices ? opts.length : 4)) opts.push(String(Number(q.a) + opts.length));
    q.choices = isChoice && q.choices ? q.choices : shuffleArr([...new Set(opts)]);
    q.mc = true;
  }
  return q;
}
function shuffleArr(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export function check(q, input) {
  const raw = String(input).trim().replace(/[$,%\s]/g, '');
  if (q.mc || q.kind === 'choice') return String(input) === String(q.a);
  if (q.kind === 'frac') {
    const norm = s => { const m = s.match(/^(-?\d+)\/(\d+)$/); if (!m) return isFinite(+s) ? s : null; const g = gcd(+m[1], +m[2]); return +m[2] / g === 1 ? String(+m[1] / g) : `${+m[1] / g}/${+m[2] / g}`; };
    return norm(raw) === norm(String(q.a)) && /^-?\d+(\/\d+)?$/.test(raw) && (raw.includes('/') ? gcd(+raw.split('/')[0], +raw.split('/')[1]) === 1 : true);
  }
  const n = Number(raw);
  if (!isFinite(n) || raw === '') return false;
  return Math.abs(n - Number(q.a)) <= (q.tol ?? 0.0001) + 1e-9;
}

export function fmtAns(q) {
  if (q.unit === '$' && isFinite(q.a)) return '$' + Number(q.a).toFixed(Number.isInteger(+q.a) ? 0 : 2);
  if (q.unit === '%') return q.a + '%';
  return String(q.a);
}

// Gate decision after a round at the skill's current level.
export function evaluateRound(skillId, level, acc, med) {
  const target = SKILL[skillId].targets[level - 1];
  if (acc >= 0.9 && med <= target) return { result: 'advance', target };
  if (acc >= 0.9) return { result: 'speed', target, gap: med - target };
  return { result: 'accuracy', target };
}
