// 11th/12th non-AP courses + AP Economics / Government.
import { span, math, fin, VOCAB3 } from './gens.js';

export const apecongov = {
  id: 'apecongov', name: 'AP Economics / AP Government', short: 'AP Econ/Gov', term: '12-T1', ap: true, color: '#0F766E',
  examNote: 'AP Macro: 60 MCQ + 3 FRQ (graphs!). AP Gov: 55 MCQ + 4 FRQ (concept application, quantitative, SCOTUS comparison, argument essay).',
  units: [
    { id: 'm1', t: 'Macro: Basic Concepts & Supply/Demand', topics: 'scarcity, opportunity cost, PPC, comparative advantage, supply and demand shifts',
      lessons: [{ id: 'l1', t: 'Comparative advantage in 3 lines', why: 'A guaranteed FRQ skill: compute opportunity cost, then specialize.', ex: { p: 'In a day, A makes 10 shirts or 5 hats; B makes 6 shirts or 6 hats. Who should make hats?', s: ['A: 1 hat costs 2 shirts. B: 1 hat costs 1 shirt.', 'Lower opportunity cost for hats = B.', 'B makes hats; A makes shirts.'], a: 'B makes hats (lower opportunity cost).' }, key: ['Output problems: "other over" (OC of X = Y/X). Input problems flip.', 'Demand shifters: income, tastes, prices of related goods, expectations, number of buyers.', 'Supply shifters: input costs, technology, taxes/subsidies, number of sellers.'] }],
      qs: [
        { q: 'A decrease in the price of a substitute good will cause demand for a product to', c: ['decrease', 'increase', 'stay the same', 'become perfectly inelastic'], a: 0, e: 'Consumers switch to the cheaper substitute.', h: ['Coke vs Pepsi.', 'Substitute gets cheaper -> buy that instead.'] },
        { q: 'A point inside the PPC represents', c: ['inefficient use of resources', 'unattainable output', 'efficient production', 'economic growth'], a: 0, e: 'Resources are unemployed or underused.', h: ['Inside the curve.', 'Not using everything.'] },
      ] },
    { id: 'm2', t: 'Macro: Economic Indicators & AD/AS', topics: 'GDP, unemployment, inflation (CPI), aggregate demand/supply, fiscal policy, multiplier',
      lessons: [{ id: 'l1', t: 'AD/AS shifts and fiscal policy', why: 'Most macro FRQs: identify the gap, prescribe policy, show the graph.', ex: { p: 'Economy in recession. Appropriate fiscal policy and its effect?', s: ['Recessionary gap: output below full employment.', 'Expansionary fiscal: increase government spending or cut taxes.', 'AD shifts right -> real GDP up, price level up, unemployment down.'], a: 'Expansionary fiscal policy -> AD right.' }, key: ['GDP = C + I + G + NX.', 'Unemployment types: frictional, structural, cyclical (natural rate = frictional + structural).', 'Spending multiplier = 1/MPS.', 'Demand-pull vs cost-push inflation.'] }],
      qs: [
        { q: 'If MPC = 0.8, the spending multiplier is', c: ['5', '0.2', '1.25', '8'], a: 0, e: 'Multiplier = 1/(1 − MPC) = 1/0.2 = 5.', h: ['1 / MPS.', 'MPS = 1 − MPC.'] },
        { q: 'A worker who loses a job because of automation experiences', c: ['structural unemployment', 'frictional unemployment', 'cyclical unemployment', 'seasonal unemployment'], a: 0, e: 'Skills mismatch due to technology.', h: ['Skills no longer needed.', 'Structure of economy changed.'] },
      ] },
    { id: 'm3', t: 'Macro: Money, Banking & Monetary Policy', topics: 'money supply, money multiplier, Fed tools, interest rates, loanable funds',
      lessons: [{ id: 'l1', t: 'How the Fed fights inflation', why: 'Connects directly to market news and finance internships.', ex: { p: 'Inflation is high. What does the Fed do and why?', s: ['Contractionary monetary policy.', 'Sell bonds (open market operations) / raise interest on reserves / raise discount rate.', 'Money supply falls -> interest rates rise.', 'Borrowing and investment fall -> AD left -> lower inflation.'], a: 'Raise rates / sell bonds -> AD left.' }, key: ['Money multiplier = 1/reserve requirement.', 'Fed tools: open market operations, discount rate, reserve requirement, interest on reserves.', 'Higher rates -> stronger dollar (more foreign demand).'] }],
      qs: [
        { q: 'To increase the money supply, the Fed would', c: ['buy government bonds', 'sell government bonds', 'raise the reserve requirement', 'raise the discount rate'], a: 0, e: 'Buying bonds puts money into banks.', h: ['Buy = Bigger money supply.', 'Fed pays banks.'] },
        { q: 'Reserve requirement 10%. Money multiplier?', c: ['10', '0.1', '1', '100'], a: 0, e: '1/0.10 = 10.', h: ['1 / reserve ratio.', '1 ÷ 0.1.'] },
      ] },
    { id: 'g1', t: 'Gov: Foundations of Democracy', topics: 'Declaration, Articles, Constitution, Federalist 10 & 51, Brutus 1, federalism',
      lessons: [{ id: 'l1', t: 'Federalist 10 vs Brutus 1', why: 'Required documents - expect them on MCQ and the argument essay.', ex: { p: 'How does Madison argue a large republic controls factions?', s: ['Factions are inevitable (rooted in human nature).', 'You can\'t remove the causes without destroying liberty, so control the effects.', 'A large republic includes many factions, so no single one can dominate.', 'Brutus 1 counters: a large republic can\'t represent people well; favors small, local government.'], a: 'Large republic dilutes factions (Fed 10); Brutus fears distant central power.' }, key: ['Fed 51: checks and balances ("ambition must counteract ambition").', 'Federalism: enumerated, reserved (10th), concurrent powers.', 'McCulloch v. Maryland: necessary and proper clause, federal supremacy.', 'U.S. v. Lopez: limits on commerce clause.'] }],
      qs: [
        { q: 'Federalist No. 10 argues that the best way to control factions is', c: ['a large republic', 'banning political parties', 'direct democracy', 'strong state governments'], a: 0, e: 'Many competing factions prevent tyranny of the majority.', h: ['Madison.', 'Bigger is better.'] },
        { q: 'McCulloch v. Maryland (1819) established', c: ['implied powers and federal supremacy over states', 'judicial review', 'separate but equal', 'the right to privacy'], a: 0, e: 'Congress could create a bank; Maryland couldn\'t tax it.', h: ['National bank case.', 'Necessary and proper.'] },
      ] },
    { id: 'g2', t: 'Gov: Branches, Rights & Participation', topics: 'Congress, presidency, courts, civil liberties, civil rights, elections, media',
      lessons: [{ id: 'l1', t: 'SCOTUS comparison FRQ', why: 'You must compare a required case to a new case - same constitutional clause, different facts.', ex: { p: 'Compare Tinker v. Des Moines with a new case about a student\'s online post.', s: ['Identify the shared clause: First Amendment free speech.', 'Tinker holding: students keep speech rights unless it substantially disrupts school.', 'Apply: was the online post disruptive at school?', 'Explain how the new ruling is consistent or different.'], a: 'Apply Tinker\'s "substantial disruption" test.' }, key: ['Required cases include: Marbury, McCulloch, Lopez, Engel, Wisconsin v. Yoder, Tinker, NYT v. US, Schenck, Gideon, Roe/Dobbs, McDonald, Brown, Citizens United, Baker v. Carr, Shaw v. Reno.', 'Selective incorporation via 14th Amendment.'] }],
      qs: [
        { q: 'Gideon v. Wainwright (1963) held that', c: ['states must provide lawyers to defendants who cannot afford them', 'police must read Miranda rights', 'school prayer is unconstitutional', 'segregation is unconstitutional'], a: 0, e: 'Sixth Amendment right to counsel incorporated to states.', h: ['Right to counsel.', 'Sixth Amendment.'] },
        { q: 'Citizens United v. FEC (2010) ruled that', c: ['independent political spending by corporations is protected speech', 'campaign donations must be capped at $100', 'PACs are illegal', 'only individuals can spend on elections'], a: 0, e: 'Led to super PACs.', h: ['Money as speech.', 'Corporations and unions.'] },
      ] },
  ],
};

export const physics = {
  id: 'phys', name: 'Physics', short: 'Physics', term: '11-T1', color: '#0369A1',
  units: [
    { id: 'u1', t: 'Kinematics', topics: 'displacement, velocity, acceleration, motion graphs, free fall', gen: [math.kinematics],
      lessons: [{ id: 'l1', t: 'Pick the right kinematic equation', why: 'List knowns and the unknown; the missing variable picks the equation.', ex: { p: 'A ball is dropped from rest. How far does it fall in 3 s? (g = 9.8 m/s²)', s: ['Knowns: v₀ = 0, a = 9.8, t = 3. Unknown: Δx.', 'Missing: final velocity -> use Δx = v₀t + ½at².', 'Δx = 0 + ½(9.8)(9) = 44.1 m.'], a: '44.1 m' }, key: ['v = v₀ + at; Δx = v₀t + ½at²; v² = v₀² + 2aΔx.', 'Slope of x-t = velocity; slope of v-t = acceleration; area under v-t = displacement.'] }],
      qs: [{ q: 'The slope of a velocity-time graph represents', c: ['acceleration', 'displacement', 'speed', 'jerk'], a: 0, e: 'Δv/Δt = a.', h: ['Rise over run on v-t.', 'Change in velocity per time.'] }] },
    { id: 'u2', t: 'Forces & Newton\'s Laws', topics: 'free-body diagrams, F = ma, friction, inclines', gen: [math.newton2],
      lessons: [{ id: 'l1', t: 'Free-body diagram first, always', why: 'Every force problem is solved by drawing forces then summing per axis.', ex: { p: 'A 5 kg box pushed with 30 N on a floor with 10 N friction. Acceleration?', s: ['Net force = 30 − 10 = 20 N.', 'a = F/m = 20/5 = 4 m/s².'], a: '4 m/s²' }, key: ['1st law: inertia. 2nd: ΣF = ma. 3rd: equal and opposite pairs on different objects.', 'Weight = mg; friction = μN.'] }],
      qs: [{ q: 'A book rests on a table. The reaction to Earth pulling the book down is', c: ['the book pulling Earth up', 'the table pushing the book up', 'friction', 'air resistance'], a: 0, e: 'Third-law pairs act on different objects of the same interaction (gravity).', h: ['Newton\'s 3rd law pairs.', 'Same interaction, swapped objects.'] }] },
    { id: 'u3', t: 'Energy, Momentum & Circuits', topics: 'work, KE/PE, conservation, momentum, impulse, Ohm\'s law', gen: [math.energy, math.ohm],
      lessons: [{ id: 'l1', t: 'Conservation shortcuts', why: 'Energy and momentum conservation skip the messy middle of a problem.', ex: { p: 'A 2 kg ball drops 5 m. Speed just before hitting the ground?', s: ['PE at top = KE at bottom: mgh = ½mv².', 'v = √(2gh) = √(2×9.8×5) ≈ 9.9 m/s.'], a: '≈ 9.9 m/s' }, key: ['W = Fd cos θ. PE = mgh. KE = ½mv².', 'p = mv; impulse = FΔt = Δp.', 'V = IR; series: R adds; parallel: 1/R adds.'] }],
      qs: [{ q: 'Two 6 Ω resistors in parallel have total resistance', c: ['3 Ω', '12 Ω', '6 Ω', '36 Ω'], a: 0, e: '1/R = 1/6 + 1/6 -> R = 3 Ω.', h: ['Parallel lowers resistance.', '1/R total = sum of 1/R.'] }] },
    { id: 'u4', t: 'Waves, Sound & Light', topics: 'wave speed, frequency, wavelength, Doppler, EM spectrum',
      lessons: [{ id: 'l1', t: 'v = fλ', why: 'One equation for every wave.', ex: { p: 'Sound at 340 m/s with frequency 170 Hz. Wavelength?', s: ['λ = v/f = 340/170 = 2 m.'], a: '2 m' }, key: ['Higher frequency -> shorter wavelength (same medium).', 'Doppler: approaching source -> higher pitch.'] }],
      qs: [{ q: 'As a siren moves toward you, its pitch sounds', c: ['higher', 'lower', 'the same', 'silent'], a: 0, e: 'Waves compress -> higher frequency (Doppler).', h: ['Doppler effect.', 'Waves bunch up in front.'] }] },
  ],
};

export const spanish3 = {
  id: 'span3', name: 'Spanish 3', short: 'Spanish 3', term: '11-T2', color: '#BE123C', lang: 'es',
  units: [
    { id: 'u1', t: 'Past Tenses Review & Perfect Tenses', topics: 'preterite/imperfect, present perfect, past perfect', gen: [() => span.conj(['preterite', 'imperfect']), span.pretVsImp],
      lessons: [{ id: 'l1', t: 'Present perfect = haber + participle', why: '"Have done" in Spanish; participle never changes in this tense.', ex: { p: '"We have eaten."', s: ['Haber (nosotros) = hemos.', 'Participle of comer = comido.', '"Hemos comido."'], a: 'Hemos comido.' }, key: ['he, has, ha, hemos, han + -ado/-ido.', 'Irregular participles: hecho, dicho, escrito, visto, puesto, vuelto, abierto, roto, muerto.', 'Past perfect: había + participle.'] }],
      qs: [{ q: 'Ellos ___ (escribir) una carta. (present perfect)', c: ['han escrito', 'han escribido', 'ha escrito', 'habían escribido'], a: 0, e: 'Escribir has the irregular participle escrito.', h: ['Irregular participle.', 'escrito'] }] },
    { id: 'u2', t: 'Subjunctive', topics: 'present subjunctive forms, WEIRDO triggers, impersonal expressions', gen: [() => span.conj(['subjunctive'])],
      lessons: [{ id: 'l1', t: 'WEIRDO triggers', why: 'Subjunctive appears after a trigger + "que" + a change of subject.', ex: { p: '"I want you to study."', s: ['Trigger: wish (querer).', 'Change of subject: yo -> tú, linked by que.', 'Estudiar -> subjunctive tú: estudies.', '"Quiero que estudies."'], a: 'Quiero que estudies.' }, key: ['W: wishes, E: emotions, I: impersonal expressions, R: recommendations, D: doubt/denial, O: ojalá.', 'Same subject -> infinitive: Quiero estudiar.'] }],
      qs: [{ q: 'Es importante que tú ___ (llegar) a tiempo.', c: ['llegues', 'llegas', 'llegarás', 'llegaste'], a: 0, e: 'Impersonal expression -> subjunctive; -gar -> gue.', h: ['Impersonal expression = I in WEIRDO.', 'Spelling change keeps the hard g.'] }] },
    { id: 'u3', t: 'Future, Conditional & Si Clauses', topics: 'future, conditional, hypotheticals', gen: [() => span.conj(['future', 'conditional'])],
      lessons: [{ id: 'l1', t: 'Si clauses', why: 'Hypotheticals combine imperfect subjunctive + conditional.', ex: { p: '"If I had money, I would travel."', s: ['Contrary-to-fact "if" -> imperfect subjunctive: tuviera.', 'Result -> conditional: viajaría.', '"Si tuviera dinero, viajaría."'], a: 'Si tuviera dinero, viajaría.' }, key: ['Real condition: si + present, future/present.', 'Hypothetical: si + imperfect subjunctive, conditional.'] }],
      qs: [] },
    { id: 'u4', t: 'Advanced Vocabulary & Connectors', topics: 'global issues, business, transitions for writing/speaking', gen: [() => span.vocab(VOCAB3), () => span.vocab(VOCAB3)],
      lessons: [{ id: 'l1', t: 'Connectors make you sound fluent', why: 'Transitions upgrade every sentence you speak or write.', ex: { p: 'Join: "Me gusta el trabajo. Es difícil."', s: ['Contrast connector: sin embargo / aunque.', '"Me gusta el trabajo; sin embargo, es difícil."'], a: 'Me gusta el trabajo; sin embargo, es difícil.' }, key: ['además (furthermore), por lo tanto (therefore), a pesar de (despite), en cambio (on the other hand).'] }],
      qs: [] },
  ],
};

export const precalc = {
  id: 'precalc', name: 'Precalculus', short: 'Precalc', term: '12-T1', color: '#6D28D9',
  units: [
    { id: 'u1', t: 'Functions & Rates of Change', topics: 'polynomial and rational functions, average rate of change, end behavior, asymptotes', gen: [math.transform, math.quadratic],
      lessons: [{ id: 'l1', t: 'Rational function asymptotes', why: 'Compare degrees and factor - two steps solve most problems.', ex: { p: 'Asymptotes of f(x) = (2x² + 1)/(x² − 4)?', s: ['Vertical: denominator zero (and not canceled): x = ±2.', 'Horizontal: equal degrees -> ratio of leading coefficients: y = 2.'], a: 'x = ±2; y = 2' }, key: ['Degree top < bottom -> y = 0; equal -> ratio; top > bottom -> none (maybe slant).', 'Average rate of change = (f(b) − f(a))/(b − a).'] }],
      qs: [{ q: 'Average rate of change of f(x) = x² from x = 1 to x = 3?', c: ['4', '8', '2', '9'], a: 0, e: '(9 − 1)/(3 − 1) = 4.', h: ['Slope between two points.', '(f(3) − f(1)) / 2.'] }] },
    { id: 'u2', t: 'Exponential & Logarithmic Functions', topics: 'growth/decay models, log properties, solving equations', gen: [math.log, math.exponent],
      lessons: [{ id: 'l1', t: 'Log properties', why: 'Condense/expand logs to solve equations.', ex: { p: 'Solve log₂(x) + log₂(4) = 5.', s: ['Combine: log₂(4x) = 5.', 'Exponential form: 4x = 2⁵ = 32.', 'x = 8.'], a: 'x = 8' }, key: ['log(ab) = log a + log b.', 'log(aⁿ) = n log a.'] }],
      qs: [] },
    { id: 'u3', t: 'Trigonometric & Polar Functions', topics: 'unit circle, sinusoidal graphs, amplitude/period, inverse trig, polar', gen: [math.unitCircle, math.unitCircle],
      lessons: [{ id: 'l1', t: 'Reading a sinusoid', why: 'Amplitude, period, phase, midline - four numbers describe every sine graph.', ex: { p: 'y = 3 sin(2x) + 1: amplitude, period, midline?', s: ['Amplitude |3| = 3.', 'Period 2π/2 = π.', 'Midline y = 1.'], a: 'A = 3, period π, midline y = 1' }, key: ['y = A sin(B(x − C)) + D: period 2π/B.', 'Polar: x = r cos θ, y = r sin θ.'] }],
      qs: [{ q: 'Period of y = sin(4x)?', c: ['π/2', '4π', '2π', 'π/4'], a: 0, e: '2π/4 = π/2.', h: ['Period = 2π/B.', 'B = 4.'] }] },
  ],
};

export const busfin = {
  id: 'busfin', name: 'Business Finance', short: 'Bus Finance', term: '12-T1', color: '#15803D',
  units: [
    { id: 'u1', t: 'Financial Statements & Ratios', topics: 'income statement, balance sheet, cash flow, liquidity/profitability ratios', gen: [fin.ratio],
      lessons: [{ id: 'l1', t: 'Ratios tell the story', why: 'Analysts read ratios to compare companies of different sizes.', ex: { p: 'Net income $2M on revenue $20M. Net margin?', s: ['Net margin = net income / revenue.', '2/20 = 10%.'], a: '10%' }, key: ['Liquidity: current ratio, quick ratio.', 'Profitability: gross margin, net margin, ROE.', 'Leverage: debt-to-equity.'] }],
      qs: [{ q: 'A debt-to-equity ratio of 2.0 means the company', c: ['has $2 of debt for every $1 of equity', 'has no debt', 'is very liquid', 'has twice as much equity as debt'], a: 0, e: 'D/E = total debt ÷ equity.', h: ['Debt over equity.', '2 to 1.'] }] },
    { id: 'u2', t: 'Time Value of Money & Capital Budgeting', topics: 'PV/FV, NPV, IRR, payback period', gen: [fin.compound, fin.ruleOf72],
      lessons: [{ id: 'l1', t: 'NPV decision rule', why: 'The core of corporate finance: invest when NPV > 0.', ex: { p: 'Project costs $1,000, returns $1,210 in 2 years. Discount rate 10%. NPV?', s: ['PV = 1210 / (1.1)² = 1210/1.21 = $1,000.', 'NPV = 1000 − 1000 = $0 -> indifferent.'], a: 'NPV = $0' }, key: ['PV = FV/(1 + r)ⁿ.', 'NPV > 0 -> accept.', 'IRR = rate where NPV = 0.', 'Payback ignores time value.'] }],
      qs: [{ q: 'A project with a positive NPV should generally be', c: ['accepted', 'rejected', 'delayed always', 'sold'], a: 0, e: 'Positive NPV adds value above the required return.', h: ['NPV > 0.', 'Adds value.'] }] },
    { id: 'u3', t: 'Raising Capital & Risk', topics: 'debt vs equity, stocks, bonds, cost of capital, risk management',
      lessons: [{ id: 'l1', t: 'Debt vs equity financing', why: 'Every company decides how to fund itself - a classic interview topic.', ex: { p: 'Why might a profitable company borrow instead of issuing stock?', s: ['Debt interest is tax-deductible.', 'Owners keep control (no dilution).', 'But debt adds fixed payments and bankruptcy risk.'], a: 'Cheaper after tax + no dilution, at the cost of more risk.' }, key: ['Bonds: coupon, par, maturity; prices fall when rates rise.', 'Equity: ownership, dividends, no repayment.', 'WACC blends cost of debt and equity.'] }],
      qs: [{ q: 'When market interest rates rise, existing bond prices', c: ['fall', 'rise', 'stay the same', 'double'], a: 0, e: 'Older bonds pay less than new ones, so their prices drop.', h: ['Inverse relationship.', 'New bonds pay more.'] }] },
  ],
};

export const persfin = {
  id: 'persfin', name: 'Personal Finance', short: 'Pers Finance', term: '12-T2', color: '#16A34A',
  units: [
    { id: 'u1', t: 'Income, Taxes & Budgeting', topics: 'paystubs, W-4, W-2, tax brackets, budgeting', gen: [fin.compound],
      lessons: [{ id: 'l1', t: 'Marginal tax brackets', why: 'Most people think a raise into a higher bracket taxes all their income more - it doesn\'t.', ex: { p: 'Brackets: 10% up to $11k, 12% on $11k-$45k. Tax on $20k?', s: ['First $11k × 10% = $1,100.', 'Next $9k × 12% = $1,080.', 'Total $2,180 (effective rate 10.9%).'], a: '$2,180' }, key: ['Only income within each bracket is taxed at that rate.', 'W-4 sets withholding; W-2 reports annual wages.', 'Effective rate = total tax ÷ income.'] }],
      qs: [{ q: 'Moving into a higher tax bracket means', c: ['only the income above the threshold is taxed at the higher rate', 'all income is taxed at the higher rate', 'you pay less total tax', 'your withholding stops'], a: 0, e: 'Marginal brackets apply in layers.', h: ['Marginal = layers.', 'Only the top slice.'] }] },
    { id: 'u2', t: 'Banking, Credit & Debt', topics: 'checking/savings, APR, credit cards, loans, credit reports',
      lessons: [{ id: 'l1', t: 'The true cost of minimum payments', why: 'Credit cards compound against you.', ex: { p: '$1,000 balance at 24% APR. Monthly interest?', s: ['Monthly rate = 24%/12 = 2%.', '2% × 1000 = $20/month in interest.', 'A $25 minimum barely dents the principal.'], a: '$20/month' }, key: ['APR = yearly rate; monthly = APR/12.', 'Pay in full to avoid interest.', 'Credit utilization: keep under 30%.'] }],
      qs: [{ q: 'Credit utilization is', c: ['the share of your available credit you are using', 'your number of cards', 'your income', 'your interest rate'], a: 0, e: 'Balance ÷ limit; lower is better.', h: ['Used ÷ available.', 'Under 30%.'] }] },
    { id: 'u3', t: 'Investing, Insurance & Big Purchases', topics: 'retirement accounts, index funds, insurance, renting vs buying, cars', gen: [fin.ruleOf72],
      lessons: [{ id: 'l1', t: 'Roth vs traditional (education only)', why: 'The tax timing difference matters for decades.', ex: { p: 'Roth IRA vs traditional IRA - when are taxes paid?', s: ['Traditional: contribute pre-tax (deduction now), pay tax on withdrawal.', 'Roth: contribute after-tax, qualified withdrawals tax-free.', 'Young, low-tax-bracket earners often benefit from Roth.'], a: 'Traditional = tax later; Roth = tax now.' }, key: ['Employer match = free money.', 'Index funds diversify cheaply.', 'This is education, not personal financial advice.'] }],
      qs: [{ q: 'An employer 401(k) match is best described as', c: ['additional compensation if you contribute', 'a loan from your employer', 'a tax penalty', 'a type of insurance'], a: 0, e: 'Employer adds money based on your contributions.', h: ['Free money.', 'They match what you put in.'] }] },
  ],
};

export const english4 = {
  id: 'eng4', name: 'English 4', short: 'English 4', term: '12-T2', color: '#A16207',
  units: [
    { id: 'u1', t: 'Literary Analysis', topics: 'theme, characterization, symbolism, close reading, analytical paragraphs',
      lessons: [{ id: 'l1', t: 'Claim -> evidence -> commentary', why: 'Same structure as AP Lang, applied to literature.', ex: { p: 'Write a claim about symbolism.', s: ['Claim: "In The Great Gatsby, the green light symbolizes Gatsby\'s unreachable idealized future."', 'Evidence: Gatsby "stretched out his arms toward the dark water."', 'Commentary: the physical reaching shows desire that distance makes impossible - the dream is defined by being out of reach.'], a: 'Claim + embedded quote + explanation of meaning.' }, key: ['Theme is a full sentence, not one word.', 'Analyze the author\'s choices, don\'t summarize plot.'] }],
      qs: [{ q: 'Which is a theme statement (not a topic)?', c: ['Unchecked ambition can destroy the people who pursue it.', 'Ambition', 'The story is about a king.', 'Macbeth kills Duncan.'], a: 0, e: 'Themes are complete insights about life.', h: ['Full sentence.', 'An insight, not a word.'] }] },
    { id: 'u2', t: 'Research & Professional Writing', topics: 'research papers, citation (MLA/APA), college essays, résumés, cover letters',
      lessons: [{ id: 'l1', t: 'A college/cover letter that stands out', why: 'Specific stories beat adjectives.', ex: { p: 'Upgrade "I am a hard worker."', s: ['Replace the adjective with evidence.', '"I built a 15-minute daily study system and raised my math speed 40% in a month."'], a: 'Show with a specific, measurable story.' }, key: ['Show, don\'t tell.', 'Quantify results.', 'MLA in-text: (Author page).'] }],
      qs: [] },
  ],
};
