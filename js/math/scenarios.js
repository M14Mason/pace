// Real-life scenario packs: multi-step money math in context. Same question shape as skills.js.
import { rnd, pick } from '../ui.js';

const m2 = x => Math.round(x * 100) / 100;
const $ = x => '$' + (Number.isInteger(x) ? x.toLocaleString() : x.toFixed(2));
const cents = (a, b) => m2(rnd(a * 100, b * 100) / 100);
const near = (a, ...o) => o.map(x => m2(a + x)).filter(x => x !== a && x >= 0);
const Q = (q, a, steps, hints, dist, unit = '$', tol = 0.011) => ({ q, a: m2(a), steps, hints, dist: [...new Set(dist.map(d => String(m2(d))))].filter(d => d !== String(m2(a))).slice(0, 3), unit, tol });

const NAMES = ['Maya', 'Jordan', 'Sam', 'Priya', 'Leo', 'Ava', 'Marcus', 'Elena'];
const FOOD = [['burrito bowl', 11, 15], ['pizza', 14, 22], ['ramen', 13, 18], ['burger and fries', 12, 17], ['pad thai', 12, 16], ['sushi combo', 16, 24]];

export const PACKS = [
  {
    id: 'dining', name: 'Eating out & shopping', icon: '🍽', desc: 'Bills, tips, splits, sales, coupons, unit prices',
    gens: [
      () => { const items = [pick(FOOD), pick(FOOD), pick(FOOD)].map(([n, a, b]) => [n, cents(a, b)]); const sub = m2(items.reduce((s, i) => s + i[1], 0)); const tip = pick([15, 18, 20]); const tot = m2(sub * (1 + tip / 100)); const ppl = 3;
        return Q(`Three friends order ${items.map(([n, p]) => `${n} (${$(p)})`).join(', ')}. They tip ${tip}% on the total and split evenly. Each pays?`, tot / ppl, [`Subtotal ${$(sub)}`, `${tip}% tip: ${$(m2(sub * tip / 100))}`, `Total ${$(tot)} ÷ 3 = ${$(m2(tot / 3))}`], ['Total = subtotal × (1 + tip). Then divide by people.', 'Round each price to the dollar first to estimate.', `Subtotal is ${$(sub)}.`], near(tot / ppl, 1, -1, -m2(sub * tip / 300))); },
      () => { const p = rnd(40, 120), d = pick([20, 25, 30, 40]), c = pick([5, 10]); const after = m2(p * (1 - d / 100) - c);
        return Q(`Sneakers are $${p}. They're ${d}% off, and you have a $${c} coupon applied after the discount. Price before tax?`, after, [`${d}% off: $${m2(p * (1 - d / 100))}`, `minus $${c} coupon = ${$(after)}`], ['Apply the percent discount first, then the dollar coupon.', `You pay ${100 - d}% of $${p}.`, `After the discount: $${m2(p * (1 - d / 100))}.`], [m2((p - c) * (1 - d / 100)), m2(p - d - c), m2(p * d / 100)]); },
      () => { const a = rnd(12, 24), pa = cents(3, 7), b = a + rnd(8, 20), pb = m2(pa * (b / a) * pick([0.85, 0.9, 1.1, 1.15])); const ua = m2(pa / a * 100) / 100, ub = m2(pb / b * 100) / 100; const save = m2(Math.abs(pa / a - pb / b) * 100);
        return Q(`Cereal A: ${a} oz for ${$(pa)}. Cereal B: ${b} oz for ${$(pb)}. How many CENTS per ounce cheaper is the better deal? (1 decimal)`, save, [`A: ${(pa / a * 100).toFixed(2)}¢/oz`, `B: ${(pb / b * 100).toFixed(2)}¢/oz`, `Difference ≈ ${save}¢`], ['Unit price = price ÷ ounces.', 'Convert to cents per ounce to compare small numbers.', `A costs about ${(pa / a * 100).toFixed(1)}¢ per ounce.`], [save + 1, m2(Math.abs(pa - pb) * 100), save * 2], '', 0.15); },
      () => { const total = cents(30, 90), tax = pick([6, 7, 8]); const pre = m2(total / (1 + tax / 100));
        return Q(`Your receipt total is ${$(total)} including ${tax}% sales tax. What was the price before tax?`, pre, [`total = price × ${1 + tax / 100}`, `${$(total)} ÷ ${1 + tax / 100} = ${$(pre)}`], ['Tax was added on top, so divide by (1 + rate).', `Don't subtract ${tax}% of the total - that undercounts.`, `Set up: ${1 + tax / 100} × price = ${total}.`], [m2(total * (1 - tax / 100)), m2(total - tax), m2(pre + 1)]); },
      () => { const bill = cents(40, 110); const tip18 = m2(bill * 0.18), tip20 = m2(bill * 0.2);
        return Q(`Dinner is ${$(bill)}. How much MORE is a 20% tip than an 18% tip?`, tip20 - tip18, [`2% of ${$(bill)}`, `= ${$(m2(bill * 0.02))}`], ['The difference between two percents is just their gap: 2%.', '1% = move the decimal two places.', `1% of the bill is ${$(m2(bill / 100))}.`], [m2(bill * 0.2), m2(bill * 0.18), m2(bill * 0.002)]); },
    ],
  },
  {
    id: 'paycheck', name: 'Paychecks & taxes', icon: '💵', desc: 'Hourly pay, overtime, withholding, net pay',
    gens: [
      () => { const r = pick([15, 16.5, 17, 18, 20]), h = rnd(12, 28); const gross = m2(r * h); const fica = m2(gross * 0.0765);
        return Q(`${pick(NAMES)} works ${h} hours at $${r}/hr. FICA (7.65%) is withheld. Pay after FICA only?`, gross - fica, [`Gross ${$(gross)}`, `FICA ${$(fica)}`, `Net ${$(m2(gross - fica))}`], ['FICA = Social Security 6.2% + Medicare 1.45% = 7.65% of gross.', 'Find gross, then take off 7.65%.', `Gross pay is ${$(gross)}.`], [gross, m2(gross * 0.9235 + 10), m2(gross - 7.65)]); },
      () => { const r = pick([16, 18, 20, 22]), ot = rnd(2, 9);
        return Q(`$${r}/hr. You work ${40 + ot} hours this week; overtime is 1.5× after 40. Gross pay?`, 40 * r + ot * r * 1.5, [`Regular: 40 × $${r} = $${40 * r}`, `Overtime: ${ot} × $${r * 1.5} = $${ot * r * 1.5}`], ['Only hours past 40 get 1.5×.', 'Pay the two parts separately, then add.', `Overtime rate is $${r * 1.5}.`], [(40 + ot) * r, (40 + ot) * r * 1.5, 40 * r + ot * r * 2]); },
      () => { const g = rnd(18, 40) * 100; const fed = pick([8, 10, 12]), st = pick([3, 4, 5]); const net = m2(g * (1 - (fed + st + 7.65) / 100));
        return Q(`Monthly gross $${g.toLocaleString()}. Withholding: federal ${fed}%, state ${st}%, FICA 7.65%. Net pay?`, net, [`Total withheld ${fed + st + 7.65}%`, `$${g} × ${(1 - (fed + st + 7.65) / 100).toFixed(4)} = ${$(net)}`], ['Add all the percentages, then take that share off once.', `Total = ${fed} + ${st} + 7.65.`, `${fed + st + 7.65}% of $${g} is ${$(m2(g * (fed + st + 7.65) / 100))}.`], [m2(g * (1 - (fed + st) / 100)), m2(g * (fed + st + 7.65) / 100), net + 100]); },
      () => { const inc = rnd(18, 40) * 1000; const t = m2(Math.min(inc, 11600) * 0.10 + Math.max(0, Math.min(inc, 47150) - 11600) * 0.12);
        return Q(`Simplified brackets: 10% on the first $11,600, 12% from $11,600 to $47,150. Taxable income $${inc.toLocaleString()}. Tax owed?`, t, [`10% × 11,600 = $1,160`, `12% × ${(inc - 11600).toLocaleString()} = $${m2((inc - 11600) * 0.12)}`, `Total ${$(t)}`], ['Marginal brackets: each slice is taxed at its own rate.', 'Don\'t apply 12% to all of it.', 'The first slice costs $1,160.'], [m2(inc * 0.12), m2(inc * 0.10), m2(t + 232)]); },
      () => { const pay = rnd(10, 25) * 100, pct = pick([5, 6, 10]), match = pick([50, 100]);
        return Q(`You earn $${pay}/month and put ${pct}% into a 401(k). Your employer matches ${match}% of what you put in. Total going in each month?`, pay * pct / 100 * (1 + match / 100), [`You: $${pay * pct / 100}`, `Employer: ${match}% of that = $${pay * pct / 100 * match / 100}`], ['Match = a percent of YOUR contribution, not your pay.', 'Find your contribution first.', `You contribute $${pay * pct / 100}.`], [pay * pct / 100, pay * pct / 100 * 2 + 10, pay * match / 100]); },
    ],
  },
  {
    id: 'credit', name: 'Cars, loans & credit', icon: '🚗', desc: 'Car payments, APR, card payoff, total cost',
    gens: [
      () => { const bal = rnd(5, 30) * 100, apr = pick([18, 21, 24, 27]);
        return Q(`Credit card balance ${$(bal)} at ${apr}% APR. About how much interest builds in ONE month?`, bal * apr / 1200, [`Monthly rate ${apr}/12 = ${apr / 12}%`, `${apr / 12}% × ${$(bal)} = ${$(m2(bal * apr / 1200))}`], ['Monthly interest ≈ balance × APR ÷ 12.', `${apr}% a year is ${apr / 12}% a month.`, `1% of the balance is ${$(bal / 100)}.`], [bal * apr / 100, m2(bal * apr / 1200 * 2), apr]); },
      () => { const price = rnd(15, 35) * 1000, down = pick([10, 15, 20]);
        return Q(`A $${price.toLocaleString()} car with ${down}% down. How much do you finance?`, price * (1 - down / 100), [`Down payment ${$(price * down / 100)}`, `Financed ${$(price * (1 - down / 100))}`], ['Financed = price − down payment.', `You borrow ${100 - down}% of the price.`, `${down}% of $${price.toLocaleString()} is ${$(price * down / 100)}.`], [price * down / 100, price, price * (1 - down / 200)]); },
      () => { const pay = rnd(28, 55) * 10, n = pick([48, 60, 72]), fin = Math.round(pay * n * pick([0.82, 0.86, 0.9]) / 100) * 100;
        return Q(`You finance ${$(fin)} and pay ${$(pay)}/month for ${n} months. Total interest paid?`, pay * n - fin, [`Total paid ${pay} × ${n} = ${$(pay * n)}`, `minus ${$(fin)} borrowed = ${$(pay * n - fin)}`], ['Interest = everything you pay − what you borrowed.', 'Multiply payment by number of months first.', `Total of payments is ${$(pay * n)}.`], [pay * n, m2((pay * n - fin) / n), fin]); },
      () => { const lim = pick([1000, 2000, 3000, 5000]), bal = Math.round(lim * pick([0.45, 0.6, 0.8]) / 10) * 10, target = 30;
        return Q(`Card limit ${$(lim)}, balance ${$(bal)}. How much must you pay down to get utilization to ${target}%?`, bal - lim * target / 100, [`${target}% of ${$(lim)} = ${$(lim * target / 100)}`, `${$(bal)} − ${$(lim * target / 100)} = ${$(bal - lim * target / 100)}`], ['Utilization = balance ÷ limit.', 'Find the balance that equals 30% of the limit.', `30% of the limit is ${$(lim * 0.3)}.`], [lim * 0.3, bal * 0.3, bal - lim * 0.1]); },
      () => { const lease = rnd(25, 40) * 10, months = 36, due = rnd(2, 4) * 1000;
        return Q(`Lease: ${$(due)} due at signing + ${$(lease)}/month for ${months} months. Total cost of the lease?`, due + lease * months, [`${months} × ${$(lease)} = ${$(lease * months)}`, `+ ${$(due)} = ${$(due + lease * months)}`], ['Total = upfront + all monthly payments.', 'Multiply first.', `36 × ${lease} = ${lease * 36}.`], [lease * months, due + lease * 12, due * months]); },
    ],
  },
  {
    id: 'biz', name: 'Running a business', icon: '🏪', desc: 'Pricing, margins, inventory, break-even',
    gens: [
      () => { const cost = cents(1.2, 4), mk = pick([100, 150, 200]);
        return Q(`Your smoothie stand: each smoothie costs ${$(cost)} to make. You price with a ${mk}% markup. Price?`, cost * (1 + mk / 100), [`Markup ${$(m2(cost * mk / 100))}`, `Price ${$(m2(cost * (1 + mk / 100)))}`], ['Price = cost × (1 + markup).', `${mk}% markup = ${1 + mk / 100}× cost.`, `${mk}% of ${$(cost)} is ${$(m2(cost * mk / 100))}.`], [cost * mk / 100, cost * 2, cost + mk / 100]); },
      () => { const F = rnd(3, 12) * 100, p = rnd(6, 12), v = m2(p * pick([0.3, 0.4, 0.5]));
        return Q(`Monthly fixed costs ${$(F)} (rent, permits). Each item sells for $${p} and costs ${$(v)} to make. Items to break even? (round up)`, Math.ceil(F / (p - v)), [`Contribution ${$(m2(p - v))} per item`, `${F} ÷ ${m2(p - v)} = ${(F / (p - v)).toFixed(1)}`, `Round up: ${Math.ceil(F / (p - v))}`], ['Break-even = fixed costs ÷ (price − variable cost).', 'Each sale covers its own cost and chips in the rest.', `Each item contributes ${$(m2(p - v))}.`], [Math.ceil(F / p), Math.ceil(F / v), Math.ceil(F / (p - v)) + 20], '', 0.001); },
      () => { const rev = rnd(8, 30) * 1000, cogs = Math.round(rev * pick([0.35, 0.45, 0.55]));
        return Q(`Revenue $${rev.toLocaleString()}, cost of goods $${cogs.toLocaleString()}. Gross margin %? (1 decimal)`, (rev - cogs) / rev * 100, [`Gross profit $${(rev - cogs).toLocaleString()}`, `÷ revenue = ${((rev - cogs) / rev * 100).toFixed(1)}%`], ['Gross margin = (revenue − COGS) ÷ revenue.', 'Divide by revenue, not cost.', `Gross profit is $${(rev - cogs).toLocaleString()}.`], [cogs / rev * 100, (rev - cogs) / cogs * 100, 50], '%', 0.06); },
      () => { const daily = rnd(20, 60), lead = rnd(3, 7), safety = rnd(30, 80);
        return Q(`You sell ${daily} T-shirts a day. Restocks take ${lead} days to arrive and you keep ${safety} as safety stock. Reorder when inventory hits?`, daily * lead + safety, [`Used during delivery: ${daily} × ${lead} = ${daily * lead}`, `+ safety ${safety} = ${daily * lead + safety}`], ['Reorder point = daily sales × lead time + safety stock.', 'How many sell while you wait for the shipment?', `${daily} × ${lead} = ${daily * lead}.`], [daily * lead, daily + lead + safety, safety * lead], '', 0.001); },
      () => { const p = rnd(20, 40), q = rnd(200, 500), cut = pick([10, 15, 20]), lift = pick([10, 20, 30]); const before = p * q, after = m2(p * (1 - cut / 100) * q * (1 + lift / 100));
        return Q(`You sell ${q} units at $${p}. Cutting price ${cut}% would raise units sold ${lift}%. New revenue minus old revenue? (negative if it drops)`, after - before, [`Old: $${before.toLocaleString()}`, `New: ${$(m2(p * (1 - cut / 100)))} × ${Math.round(q * (1 + lift / 100))} = ${$(after)}`, `Change ${$(m2(after - before))}`], ['Revenue = price × quantity. Compute both scenarios.', `New price ×${(1 - cut / 100)}, new units ×${1 + lift / 100}.`, `Old revenue is $${before.toLocaleString()}.`], [m2(before * lift / 100), m2(-before * cut / 100), m2(before * (lift - cut) / 100 + 50)]); },
    ],
  },
];
export const PACK = Object.fromEntries(PACKS.map(p => [p.id, p]));

export function scenarioQ(packId) {
  const p = PACK[packId];
  const q = pick(p.gens)();
  q.key = `scen:${packId}`; q.skill = 'scen'; q.level = 1;
  return q;
}
