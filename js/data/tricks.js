// Fast-math trick sheets. Each trick: [name, how to do it, worked example].
// traps = the mistakes that cost speed or accuracy. Shown before every round.
export const TRICKS = {
  add: {
    title: 'Addition',
    tricks: [
      ['Left to right', 'Add the big places first, then the small ones. It matches how you say numbers out loud, so it\'s faster in your head than right-to-left carrying.', '47 + 38 → 40 + 30 = 70, 7 + 8 = 15 → **85**'],
      ['Round and fix', 'If a number is close to a ten, round it up, add, then take back the extra.', '58 + 29 → 58 + 30 = 88, minus 1 → **87**'],
      ['Make a ten', 'Move a little from one number to the other to make a round number.', '67 + 25 → 70 + 22 → **92**'],
      ['Money: dollars, then cents', 'Add the dollars, add the cents, and carry $1 for every 100¢.', '$12.75 + $8.50 → $20 + 125¢ → **$21.25**'],
      ['Find the pairs', 'With 3 or more numbers, look for pairs that make 10 or 100 first.', '36 + 47 + 64 → (36 + 64) + 47 → **147**'],
    ],
    traps: ['Forgetting the carry when cents pass 100.', 'Rounding up and then forgetting to subtract the extra back.'],
  },
  sub: {
    title: 'Subtraction',
    tricks: [
      ['Count up (cashier method)', 'Instead of taking away, count up from the small number to the big one. This is how cashiers make change.', '83 − 47 → 47 → 50 (+3) → 83 (+33) → **36**'],
      ['Subtract round, add back', 'Subtract a round number, then add back what you over-subtracted.', '92 − 38 → 92 − 40 = 52, + 2 → **54**'],
      ['Same difference', 'Add the same amount to both numbers so the one you\'re subtracting becomes round. The gap doesn\'t change.', '73 − 29 → 74 − 30 → **44**'],
      ['Change from a bill', 'Count up to the next dollar, then up to the bill.', 'Pay $20 for $13.65 → 35¢ to $14, $6 to $20 → **$6.35**'],
    ],
    traps: ['In "subtract round, add back," adding back in the wrong direction (52 − 2 instead of 52 + 2).', 'Mixing up which number is bigger in the count-up method.'],
  },
  mul: {
    title: 'Multiplication',
    tricks: [
      ['Split one factor', 'Break the harder number into tens and ones, multiply each part, then add (the distributive property).', '14 × 6 → 10×6 + 4×6 = 60 + 24 → **84**'],
      ['Round and subtract', 'Round up to an easy number, multiply, then subtract the extra.', '19 × 7 → 20×7 = 140, − 7 → **133**'],
      ['Double and halve', 'Halve one number and double the other. The product stays the same.', '16 × 25 → 8 × 50 → 4 × 100 → **400**'],
      ['×5 and ×25', '×5 = ×10 then halve. ×25 = ×100 then divide by 4.', '48 × 5 → 480 ÷ 2 → **240**'],
      ['×9 and ×11', '×9 = ×10 minus one copy. ×11 on a 2-digit number: split the digits and put their sum in the middle.', '36 × 11 → 3 (3+6) 6 → **396**'],
      ['Money × quantity', 'Round the price up to the dollar, multiply, then subtract the pennies.', '6 × $4.99 → 6 × $5 = $30, − 6¢ → **$29.94**'],
    ],
    traps: ['Moving the decimal the wrong way with ×10, ×100, ×1000 (it gets BIGGER).', 'Forgetting one partial product when you split a factor.'],
  },
  div: {
    title: 'Division',
    tricks: [
      ['Think multiplication', 'Ask "divisor × ? = number." Division is just multiplication backwards.', '72 ÷ 8 → 8 × ? = 72 → **9**'],
      ['Chunk it', 'Pull out an easy chunk (often 10 × the divisor), then handle the rest.', '156 ÷ 12 → 120 is 10 twelves, 36 is 3 more → **13**'],
      ['Halve both', 'Halve both numbers (or divide both by the same number) until it\'s easy.', '144 ÷ 16 → 72 ÷ 8 → **9**'],
      ['÷5 trick', '÷5 = ×2 then ÷10.', '340 ÷ 5 → 680 ÷ 10 → **68**'],
      ['Splitting money', 'Split the dollars evenly, then turn the leftover into cents.', '$47 ÷ 4 → $11 each, $3 left = 300¢ ÷ 4 = 75¢ → **$11.75**'],
    ],
    traps: ['Dividing by 10/100 moves the decimal LEFT (smaller), not right.', 'Dropping the remainder in money problems instead of converting it to cents.'],
  },
  pct: {
    title: 'Percentages',
    tricks: [
      ['10% first', '10% = move the decimal one place left. Then build: 20% = double it, 5% = half of it, 30% = triple it.', '30% of 70 → 10% = 7 → ×3 → **21**'],
      ['1% building block', '1% = move the decimal two places left. Use it for odd percents.', '7% of 300 → 1% = 3 → ×7 → **21**'],
      ['Flip it', 'x% of y = y% of x. Swap when the other way is easier.', '8% of 50 = 50% of 8 → **4**'],
      ['Fraction shortcuts', '50% = ½, 25% = ¼, 20% = ⅕, 12.5% = ⅛, 75% = ¾.', '25% of 84 → 84 ÷ 4 → **21**'],
      ['What percent is A of B?', 'Divide part by whole, then simplify the fraction to a percent you know.', '15 of 60 → 15/60 = ¼ → **25%**'],
      ['Percent change', '(new − old) ÷ OLD × 100. Always divide by where you started.', '$40 → $50: +10 ÷ 40 → **+25%**'],
    ],
    traps: ['Percent change: dividing by the NEW value instead of the old one.', 'Confusing "percent of" with "percent off."'],
  },
  tip: {
    title: 'Tips',
    tricks: [
      ['10%, then build', 'Move the decimal for 10%. 15% = 10% + half of that. 20% = double 10%.', '15% of $48 → $4.80 + $2.40 → **$7.20**'],
      ['18% = 20% − 2%', 'Find 20%, then subtract 2% (which is a tenth of 20%).', '18% of $60 → $12 − $1.20 → **$10.80**'],
      ['Round the bill first', 'For a quick estimate at the table, round the bill to the nearest dollar or five.', '20% of $47.85 ≈ 20% of $48 → **≈ $9.60**'],
      ['Total in one step', 'For the total including tip, multiply by 1.15 or 1.2 directly, or add the tip to the bill.', '$50 with 20% → 50 × 1.2 → **$60**'],
      ['Split after the tip', 'Add the tip to the whole bill first, then divide by the number of people.', '$90 + 20% = $108 ÷ 3 → **$36 each**'],
    ],
    traps: ['Tipping on the after-tax total when the question says pre-tax.', 'Splitting the bill before adding the tip, and then forgetting the tip.'],
  },
  disc: {
    title: 'Discounts',
    tricks: [
      ['Pay-percent', 'Don\'t find the discount and subtract it - find what you PAY. 30% off = you pay 70%.', '$80 at 30% off → 70% of 80 → **$56**'],
      ['Stacked discounts multiply', '20% off then 10% off is NOT 30% off. Multiply: 0.8 × 0.9 = 0.72, so you pay 72%.', '$100 → $80 → $72 → **28% off total**'],
      ['$x.99 prices', 'Treat $39.99 as $40, find the sale price, then adjust by the penny × the pay-percent (it barely matters).', '25% off $39.99 → 75% of $40 = $30 → **≈ $29.99**'],
      ['Original price from sale', 'Sale = original × pay-percent, so original = sale ÷ pay-percent.', '$60 after 25% off → 60 ÷ 0.75 → **$80**'],
      ['Coupon order', 'A percent discount, then a dollar coupon (or the reverse) gives a different price. Read which comes first.', '$50, 20% off then $10 off → $40 − $10 → **$30**'],
    ],
    traps: ['Adding stacked discounts together (20% + 10% ≠ 30%).', 'Finding the original price by adding the percent back to the sale price (wrong - divide instead).'],
  },
  tax: {
    title: 'Sales Tax',
    tricks: [
      ['1% building block', '1% of the price × the tax rate gives the tax.', '7% of $40 → 1% = $0.40 → ×7 → **$2.80**'],
      ['Total multiplier', 'Total = price × (1 + rate). For 8% tax, multiply by 1.08.', '$25 × 1.08 → **$27**'],
      ['Discount, then tax', 'Apply discounts first, then tax the sale price.', '$80, 25% off, 8% tax → $60 × 1.08 → **$64.80**'],
      ['Price before tax', 'Divide the total by (1 + rate) - don\'t subtract the rate from the total.', '$54 total with 8% → 54 ÷ 1.08 → **$50**'],
      ['Tax + tip together', 'If both are based on the pre-tax price, add the rates: 8% + 20% = 28%.', '$50 → 50 × 1.28 → **$64**'],
    ],
    traps: ['Taking the tax rate off the TOTAL to find the price (that undercounts).', 'Taxing before the discount when the question says discount first.'],
  },
  total: {
    title: 'Totals',
    tricks: [
      ['Round all, fix once', 'Round every price to the nearest dollar, add, then fix the total rounding in one step.', '$3.99 + $5.99 + $2.99 → $4 + $6 + $3 = $13, minus 3¢ → **$12.97**'],
      ['Pair to 100¢', 'Find cents that pair to a dollar: 25 + 75, 40 + 60, 99 + 1.', '$4.25 + $6.75 → $10 + $1 → **$11**'],
      ['Quantity first', 'For 3 × $2.50, multiply before adding to the rest.', '3 × $2.50 + $4 → $7.50 + $4 → **$11.50**'],
      ['Estimate to check', 'Round roughly and check your exact answer is close. It catches decimal slips.', 'Exact $23.47 vs estimate ≈ $23 ✓'],
    ],
    traps: ['Rounding each item and forgetting to adjust back.', 'Misplacing the decimal when adding cents.'],
  },
  frac: {
    title: 'Fractions',
    tricks: [
      ['Simplify first', 'Divide top and bottom by their biggest common factor before anything else.', '18/24 → ÷6 → **3/4**'],
      ['Cross-cancel', 'When multiplying, cancel a top with a bottom diagonally before you multiply.', '4/9 × 3/8 → (1/3) × (1/2) → **1/6**'],
      ['Keep, change, flip', 'To divide fractions: keep the first, change ÷ to ×, flip the second.', '2/3 ÷ 4/5 → 2/3 × 5/4 → **5/6**'],
      ['"Of" means times', 'Fraction of a number: divide by the bottom, multiply by the top.', '3/4 of 32 → 32 ÷ 4 = 8 → ×3 → **24**'],
      ['Butterfly add', 'a/b + c/d = (ad + bc)/bd, then simplify.', '1/3 + 1/4 → (4 + 3)/12 → **7/12**'],
      ['Memorize eighths and thirds', '1/8 = 12.5%, 3/8 = 37.5%, 5/8 = 62.5%, 7/8 = 87.5%, 1/3 ≈ 33.3%, 2/3 ≈ 66.7%.', '5/8 → **62.5%**'],
    ],
    traps: ['Adding tops and bottoms straight across (1/2 + 1/3 ≠ 2/5).', 'Flipping the FIRST fraction instead of the second when dividing.', 'Not giving the answer in lowest terms.'],
  },
  ratio: {
    title: 'Ratios & Rates',
    tricks: [
      ['Scale factor', 'Find what one side was multiplied by, then do the same to the other side.', '3:5 = 12:? → ×4 → **20**'],
      ['Total parts', 'To split in a ratio a:b, add the parts. One part = total ÷ (a + b).', '$60 in 2:3 → 5 parts → $12 each → **$24 / $36**'],
      ['Unit price', 'Price ÷ quantity. Compare per ounce, not total price.', '$4.80 for 16 oz → **$0.30/oz**'],
      ['Cross-multiply', 'For a/b = c/x: x = b·c ÷ a.', '4/10 = 6/x → x = 60 ÷ 4 → **15**'],
      ['Rate × time', 'Distance = rate × time. Half an hour = 0.5.', '60 mph × 2.5 h → **150 miles**'],
    ],
    traps: ['Comparing total prices instead of unit prices.', 'Splitting into a + b, then multiplying by the wrong part.'],
  },
  mental: {
    title: 'Mental Tricks',
    tricks: [
      ['Squares ending in 5', 'Take the tens digit n, multiply n × (n + 1), then write 25 after it.', '65² → 6 × 7 = 42 → **4225**'],
      ['Squares near 50', '(50 + a)² = 2500 + 100a + a².', '53² → 2500 + 300 + 9 → **2809**'],
      ['Difference of squares', '(a − b)(a + b) = a² − b². Use it for numbers that sit evenly around a round number.', '19 × 21 → 20² − 1 → **399**'],
      ['×11, ×9, ×5, ×25', '×11: split the digits and put their sum in the middle. ×9: ×10 minus one. ×5: ×10 ÷ 2. ×25: ×100 ÷ 4.', '72 × 11 → 7 (9) 2 → **792**'],
      ['Estimate first', 'Round both numbers and get the size right before the exact answer - it catches big slips.', '48 × 52 ≈ 50 × 50 = 2500 → exact **2496**'],
    ],
    traps: ['×11 when the digit sum is 10 or more - carry the 1 (78 × 11 = 858, not 7158).', 'Skipping the estimate and missing a decimal or zero error.'],
  },
  fin: {
    title: 'Financial Math',
    tricks: [
      ['Simple interest', 'I = P × r × t. Find one year first, then multiply by the years.', '$2,000 at 5% for 3 yrs → $100/yr → **$300**'],
      ['Rule of 72', 'Years to double ≈ 72 ÷ the rate.', '8% → 72 ÷ 8 → **≈ 9 years**'],
      ['Markup vs margin', 'Markup is based on COST; margin is based on PRICE. A $50 cost sold at $75 is a 50% markup but a 33% margin.', 'Profit $25 ÷ price $75 → **33% margin**'],
      ['Overtime', 'Overtime rate = 1.5 × hourly. Pay the 40 regular hours and the extra hours separately.', '$20/hr, 45 hrs → $800 + 5 × $30 → **$950**'],
      ['Break-even', 'Fixed costs ÷ (price − variable cost). Round UP - you can\'t sell part of a unit.', '$3,000 ÷ ($25 − $10) → **200 units**'],
      ['P/E', 'Price ÷ EPS = how many dollars you pay for $1 of yearly earnings.', '$60 ÷ $3 → **P/E 20**'],
    ],
    traps: ['Dividing margin by cost instead of price.', 'Rounding break-even down.', 'Using simple interest when the question says compound.'],
  },
  // scenario packs
  'scen:dining': {
    title: 'Eating out & shopping', tricks: [
      ['Order of operations', 'Subtotal → tip/tax → split. Write the order before computing.', '3 meals $42 total, 20% tip, split 3 → $50.40 ÷ 3 → **$16.80**'],
      ['Percent then coupon', 'Percent discounts first, dollar coupons after (unless told otherwise).', '$80, 25% off, $10 coupon → $60 − $10 → **$50**'],
      ['Unit price in cents', 'Convert to cents per ounce so you compare whole numbers.', '$3.60 / 12 oz → **30¢/oz**'],
    ], traps: ['Splitting before adding the tip.', 'Comparing total price instead of unit price.'],
  },
  'scen:paycheck': {
    title: 'Paychecks & taxes', tricks: [
      ['Add the withholding rates', 'Federal % + state % + FICA 7.65%, then take that total off once.', '$2,000, 10% + 4% + 7.65% = 21.65% → **$1,567**'],
      ['Overtime in two parts', '40 × rate + extra hours × 1.5 × rate.', '$18/hr, 44 hrs → $720 + $108 → **$828**'],
      ['Brackets are slices', 'Each slice of income is taxed at its own rate - never the top rate on everything.', '$20k: 10% of $11.6k + 12% of $8.4k → **$2,168**'],
    ], traps: ['Applying the top bracket to all of the income.', 'Forgetting FICA.'],
  },
  'scen:credit': {
    title: 'Cars, loans & credit', tricks: [
      ['Monthly interest', 'APR ÷ 12 × balance.', '$1,200 at 24% → 2% → **$24/month**'],
      ['Total interest', 'Payment × months − amount borrowed.', '$350 × 60 − $18,000 → **$3,000**'],
      ['Utilization target', 'Target balance = limit × 30%. Pay down the difference.', '$2,000 limit, $1,000 balance → target $600 → **pay $400**'],
    ], traps: ['Using the annual rate as a monthly rate.', 'Comparing loans by monthly payment instead of total cost.'],
  },
  'scen:biz': {
    title: 'Running a business', tricks: [
      ['Markup multiplier', '100% markup = ×2, 150% = ×2.5, 50% = ×1.5.', '$2.40 cost, 150% markup → **$6.00**'],
      ['Contribution first', 'Price − variable cost = what each sale contributes. Then fixed ÷ contribution.', '$900 ÷ ($8 − $3) → **180 units**'],
      ['Reorder point', 'Daily sales × lead days + safety stock.', '30/day × 5 + 50 → **200**'],
    ], traps: ['Dividing gross profit by cost instead of revenue for margin.', 'Rounding break-even down.'],
  },
  // factoring
  'fact:pair': { title: 'Find the pair', tricks: [['Sign rule first', 'Positive product: both numbers have the sign of the sum. Negative product: the signs differ, and the bigger number takes the sign of the sum.', '× = −12, + = 1 → **4 and −3**'], ['List pairs smallest-first', 'Walk factor pairs 1·n, 2·(n/2)... and stop at the one that fits.', '24: 1·24, 2·12, 3·8, 4·6']], traps: ['Getting the signs backwards when the product is negative.'] },
  'fact:gcf': { title: 'Pull out the GCF', tricks: [['Numbers AND letters', 'Take the biggest number that divides every coefficient, plus the lowest power of each shared variable.', '6x² + 9x → **3x(2x + 3)**'], ['Check by distributing', 'Multiply back out in your head - you should get the original.', '3x(2x + 3) → 6x² + 9x ✓']], traps: ['Pulling out only the number and leaving a shared x behind.'] },
  'fact:simple': { title: 'x² + bx + c', tricks: [['Pair → brackets', 'The pair that multiplies to c and adds to b goes straight into (x + _)(x + _).', 'x² − x − 12 → −4, 3 → **(x − 4)(x + 3)**'], ['FOIL check', 'Outer + Inner must equal the middle term.', '(x − 4)(x + 3): 3x − 4x = −x ✓']], traps: ['Sign errors - always FOIL-check the middle term.'] },
  'fact:ac': { title: 'ax² + bx + c', tricks: [['AC method', 'Multiply a·c, find the pair for (a·c, b), split the middle term, then group.', '6x² + 7x + 2: ac = 12 → 3, 4 → 6x² + 3x + 4x + 2 → **(2x + 1)(3x + 2)**'], ['Guess and FOIL', 'For small a, try factor pairs of a and c and FOIL-check the middle.', '2x² + 5x + 3 → **(2x + 3)(x + 1)**']], traps: ['Forgetting to pull a GCF out of each group with the right sign.'] },
  'fact:special': { title: 'Special patterns', tricks: [['Difference of squares', 'a² − b² = (a − b)(a + b). Two squares with a MINUS.', 'x² − 49 → **(x − 7)(x + 7)**'], ['Perfect square trinomial', 'If the first and last terms are squares and the middle = 2·√first·√last → (a ± b)².', 'x² + 10x + 25 → **(x + 5)²**']], traps: ['Sum of squares (x² + 9) does NOT factor over the reals.'] },
  'fact:full': { title: 'Factor completely', tricks: [['The checklist', '1) GCF. 2) Two terms → difference of squares? 3) Three terms → pair or AC. 4) Check each bracket again.', '3x² − 27 → 3(x² − 9) → **3(x − 3)(x + 3)**']], traps: ['Stopping after the GCF when what\'s left still factors.'] },
};

// Pick tricks to show before a round: up to 3 skills, rotating 2 tricks each + 1 trap.
export function coachFor(keys) {
  const uniq = [...new Set(keys)].filter(k => TRICKS[k]).slice(0, 3);
  const seen = JSON.parse(localStorage.getItem('pace.trickSeen') || '{}');
  const out = uniq.map(k => {
    const t = TRICKS[k];
    const start = (seen[k] || 0) % t.tricks.length;
    const picks = [t.tricks[start], t.tricks[(start + 1) % t.tricks.length]].filter((x, i, a) => a.indexOf(x) === i);
    seen[k] = (seen[k] || 0) + 2;
    return { key: k, title: t.title, tricks: picks, trap: t.traps[(seen[k] / 2) % t.traps.length | 0] };
  });
  try { localStorage.setItem('pace.trickSeen', JSON.stringify(seen)); } catch { }
  return out;
}

// Full trick sheet card (Learn pages, speed gate, factoring).
import { h, md } from '../ui.js';
export function trickSheet(key, heading = 'Speed tricks') {
  const t = TRICKS[key];
  if (!t) return null;
  return h('div', { class: 'lesson-step' }, h('h3', {}, heading),
    ...t.tricks.map(([name, how, ex]) => h('div', { class: 'coach-trick' }, h('div', { class: 'coach-name' }, '⚡ ', name), h('div', { html: md(how) }), h('div', { class: 'coach-ex', html: md(ex) }))),
    ...t.traps.map(tr => h('div', { class: 'coach-trap', html: md('⚠ Trap: ' + tr) })));
}
