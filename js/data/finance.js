// Business & Finance track: internship-ready, wealth-management-relevant.
// All companies in cases/articles are fictional. Investing content = education + simulation.
import { fin } from './gens.js';
import { rnd, pick } from '../ui.js';

const pe = () => { const p = rnd(20, 200), e = (p / pick([8, 10, 12, 15, 20, 25, 30])); const pr = Math.round(p / e * 10) / 10; return { q: `Share price $${p}, EPS $${e.toFixed(2)}. P/E?`, c: [String(pr), String(Math.round(e * p) / 10), String(Math.round(e / p * 1000) / 1000), String(pr + 6)], a: 0, e: `P/E = price ÷ EPS = ${p} ÷ ${e.toFixed(2)} ≈ ${pr}. Investors pay $${pr} for each $1 of annual earnings.`, h: ['P/E = price per share ÷ earnings per share.', 'Divide, don\'t multiply.'] }; };
const yld = () => { const p = rnd(20, 150), d = Math.round(p * pick([0.01, 0.02, 0.025, 0.03, 0.04]) * 100) / 100; const y = Math.round(d / p * 1000) / 10; return { q: `Stock at $${p} pays $${d.toFixed(2)}/yr in dividends. Dividend yield?`, c: [`${y}%`, `${Math.round(p / d)}%`, `${(y * 2).toFixed(1)}%`, `${(d).toFixed(1)}%`], a: 0, e: `Yield = annual dividend ÷ price = ${d}/${p} = ${y}%.`, h: ['Dividend yield = dividend ÷ price.', 'Convert to %.'] }; };
const margin = () => { const r = rnd(50, 400), c = Math.round(r * pick([0.4, 0.55, 0.6, 0.7, 0.75])); const g = Math.round((r - c) / r * 100); return { q: `Revenue $${r}M, cost of goods sold $${c}M. Gross margin?`, c: [`${g}%`, `${100 - g}%`, `${Math.round(c / r * 50)}%`, `${g + 10}%`], a: 0, e: `Gross margin = (revenue − COGS) ÷ revenue = ${r - c}/${r} = ${g}%.`, h: ['(Revenue − COGS) ÷ revenue.', 'Gross profit first.'] }; };
const mktcap = () => { const p = rnd(10, 300), sh = rnd(50, 900); return { q: `${sh}M shares outstanding at $${p}. Market cap?`, c: [`$${(p * sh / 1000).toFixed(1)}B`, `$${(p * sh / 100).toFixed(1)}B`, `$${(p + sh)}M`, `$${(p * sh / 10000).toFixed(2)}B`], a: 0, e: `Market cap = price × shares = $${p} × ${sh}M = $${(p * sh / 1000).toFixed(1)}B.`, h: ['Market cap = share price × shares outstanding.', 'Millions × dollars, then convert to billions.'] }; };

export const DISCLAIMER = 'Education and simulated practice only - not personal financial advice. Companies in cases and articles are fictional.';

export const FIN_TRACKS = [
  { id: 'pf', t: 'Money Foundations', sub: 'Budgeting, banking, credit, taxes' },
  { id: 'acct', t: 'Accounting & Statements', sub: 'Read the three statements like an analyst' },
  { id: 'inv', t: 'Investing & Markets', sub: 'Stocks, bonds, ETFs, risk, valuation' },
  { id: 'biz', t: 'Business Finance', sub: 'Unit economics, cash, capital' },
  { id: 'news', t: 'Market News & Earnings', sub: 'Decode headlines and reports' },
  { id: 're', t: 'Real Estate (optional)', sub: 'Mortgages and cap rates' },
];

export const FIN_UNITS = [
  { id: 'pf1', track: 'pf', t: 'Budgeting & Cash Flow', topics: 'net income, 50/30/20, emergency fund, needs vs wants',
    lessons: [{ id: 'l1', t: 'A budget is a plan for every dollar', why: 'Wealth starts with positive monthly cash flow - income above spending, invested consistently.', ex: { p: 'Net pay $2,400/month. Build a 50/30/20 budget.', s: ['Needs 50%: $1,200 (rent share, food, transport, phone).', 'Wants 30%: $720.', 'Savings/investing 20%: $480.', 'Emergency fund target: 3-6 months of needs = $3,600-$7,200.'], a: '$1,200 / $720 / $480' }, key: ['Build from NET (take-home) pay.', 'Pay yourself first: automate savings on payday.', 'Emergency fund before investing aggressively.'] }],
    qs: [
      { q: 'Which is the best first financial priority for a new full-time earner?', c: ['Building an emergency fund', 'Buying individual stocks', 'Leasing a luxury car', 'Paying only minimums on cards'], a: 0, e: 'A cash cushion prevents high-interest debt when surprises hit.', h: ['What protects you from surprises?', 'Cash cushion.'] },
      { q: '"Pay yourself first" means', c: ['automatically saving before spending on anything else', 'spending on wants first', 'paying bills late', 'investing only leftovers'], a: 0, e: 'Savings happen first, by default.', h: ['Order of operations.', 'Savings first.'] },
    ] },
  { id: 'pf2', track: 'pf', t: 'Banking & Credit', topics: 'checking/savings, APY vs APR, credit scores, credit cards, loans',
    lessons: [{ id: 'l1', t: 'APR, APY, and how interest works against you', why: 'Interest is the price of money - earned on savings, paid on debt. Know which number to compare.', ex: { p: 'Card APR 24%, balance $2,000, paying $60/month. Why is this slow?', s: ['Monthly interest ≈ 24%/12 × 2000 = $40.', 'Only $20 of the $60 reduces the balance.', 'Payoff takes years; paying $200/month clears it in ~11 months.'], a: 'Most of the payment is interest.' }, key: ['APY includes compounding (savings). APR is the yearly rate on debt.', 'FICO: payment history 35%, utilization 30%, length 15%, new 10%, mix 10%.', 'Keep utilization < 30% (ideally < 10%).'] }],
    qs: [
      { q: 'Two savings accounts: 4.0% APR compounded monthly vs 4.0% APY. Which earns more?', c: ['The 4.0% APR compounded monthly (its APY is ~4.07%)', 'The 4.0% APY', 'They are identical', 'Neither earns interest'], a: 0, e: 'APY includes compounding; 4% APR monthly ≈ 4.07% APY.', h: ['APY already includes compounding.', 'Convert APR to APY.'] },
      { q: 'Credit limit $5,000, balance $1,500. Utilization?', c: ['30%', '15%', '3.3%', '70%'], a: 0, e: '1,500 ÷ 5,000 = 30%.', h: ['Balance ÷ limit.', 'As a percent.'] },
    ] },
  { id: 'pf3', track: 'pf', t: 'Taxes', topics: 'marginal vs effective, withholding, FICA, capital gains, tax-advantaged accounts',
    lessons: [{ id: 'l1', t: 'Marginal vs effective rate', why: 'Every finance conversation about taxes uses these two terms.', ex: { p: 'Income $60,000; tax owed $7,000. Effective rate?', s: ['Effective = total tax ÷ income.', '7,000 ÷ 60,000 = 11.7%.', 'Marginal rate (tax on the next dollar) may be 22% - higher than effective.'], a: '11.7%' }, key: ['Short-term capital gains (≤ 1 yr) taxed as ordinary income; long-term at lower rates.', '401(k)/traditional IRA: pre-tax; Roth: after-tax, tax-free growth.', 'FICA 7.65% on wages.'] }],
    qs: [{ q: 'Selling a stock held 8 months for a profit creates a', c: ['short-term capital gain taxed as ordinary income', 'long-term capital gain at a lower rate', 'tax-free gain', 'capital loss'], a: 0, e: 'Held one year or less = short-term.', h: ['Holding period.', 'Under a year.'] }] },
  { id: 'acct1', track: 'acct', t: 'The Accounting Equation & Income Statement', topics: 'assets = liabilities + equity, revenue, COGS, operating income, net income', gen: [margin],
    lessons: [{ id: 'l1', t: 'Walk down the income statement', why: 'Interviewers ask "walk me through an income statement" constantly.', ex: { p: 'Revenue $100M, COGS $60M, operating expenses $25M, interest $3M, taxes 25%. Net income?', s: ['Gross profit = 100 − 60 = $40M.', 'Operating income (EBIT) = 40 − 25 = $15M.', 'Pre-tax income = 15 − 3 = $12M.', 'Taxes = 25% × 12 = $3M -> net income $9M.'], a: '$9M' }, key: ['Revenue -> gross profit -> operating income (EBIT) -> pre-tax -> net income.', 'EBITDA adds back depreciation & amortization.', 'Accrual accounting: record revenue when earned, not when cash arrives.'] }],
    qs: [
      { q: 'Operating income is also called', c: ['EBIT', 'net income', 'gross profit', 'free cash flow'], a: 0, e: 'Earnings before interest and taxes.', h: ['Before interest and taxes.', 'Acronym.'] },
      { q: 'A company sells $10k of goods on credit in December, paid in January. Under accrual accounting, revenue is recorded in', c: ['December', 'January', 'when the bank clears it', 'never'], a: 0, e: 'Revenue is recognized when earned.', h: ['Accrual vs cash basis.', 'When earned.'] },
    ] },
  { id: 'acct2', track: 'acct', t: 'Balance Sheet & Cash Flow Statement', topics: 'current vs long-term, working capital, operating/investing/financing cash flow, free cash flow', gen: [fin.ratio],
    lessons: [{ id: 'l1', t: 'Profit is opinion, cash is fact', why: 'Companies with profits can still run out of cash - the cash flow statement shows why.', ex: { p: 'Net income $5M, depreciation $2M, increase in accounts receivable $3M. Cash from operations?', s: ['Start with net income: $5M.', 'Add back non-cash depreciation: +$2M.', 'AR increased = sales not yet collected: −$3M.', 'CFO = $4M.'], a: '$4M' }, key: ['Free cash flow = cash from operations − capital expenditures.', 'Working capital = current assets − current liabilities.', 'Investing: capex, acquisitions. Financing: debt, buybacks, dividends.'] }],
    qs: [
      { q: 'Buying back company stock appears in', c: ['cash flow from financing', 'cash flow from operations', 'cash flow from investing', 'the income statement'], a: 0, e: 'Transactions with owners/lenders = financing.', h: ['Who receives the money?', 'Shareholders = financing.'] },
      { q: 'Free cash flow =', c: ['operating cash flow − capital expenditures', 'net income + dividends', 'revenue − COGS', 'assets − liabilities'], a: 0, e: 'Cash left after maintaining/expanding assets.', h: ['Cash available after investment.', 'CFO minus capex.'] },
    ] },
  { id: 'inv1', track: 'inv', t: 'Stocks, Bonds & Funds', topics: 'equity vs debt, bonds and rates, ETFs vs mutual funds, index investing, market cap', gen: [mktcap],
    lessons: [{ id: 'l1', t: 'The asset classes in one view', why: 'Wealth management is choosing the mix of these for a client\'s goals and risk.', ex: { p: 'Explain why bond prices fall when rates rise.', s: ['Old bond pays 3% coupon.', 'New bonds now pay 5%.', 'No one pays full price for 3% when 5% is available.', 'Old bond\'s price drops until its yield ≈ 5%.'], a: 'Prices and yields move inversely.' }, key: ['Stocks: ownership, higher long-run return, higher volatility.', 'Bonds: loans; coupon, maturity, credit risk, interest-rate risk (duration).', 'ETFs trade all day like stocks; mutual funds price once daily.', 'Index funds track a market (S&P 500) at low cost.'] }],
    qs: [
      { q: 'An investor who wants broad, low-cost exposure to large U.S. companies would most likely use', c: ['an S&P 500 index ETF', 'a single tech stock', 'a 30-year Treasury bond', 'a savings account'], a: 0, e: 'Index ETFs diversify across ~500 companies cheaply.', h: ['Broad + low cost.', 'Index.'] },
      { q: 'Which bond has the most interest-rate risk?', c: ['A 30-year bond', 'A 1-year bond', 'A 3-month T-bill', 'A money market fund'], a: 0, e: 'Longer maturity (duration) = bigger price swings when rates change.', h: ['Duration.', 'Longer = more sensitive.'] },
    ] },
  { id: 'inv2', track: 'inv', t: 'Risk, Return & Diversification', topics: 'volatility, correlation, systematic vs unsystematic risk, asset allocation, time horizon',
    lessons: [{ id: 'l1', t: 'Diversification is the only free lunch', why: 'Combining assets that don\'t move together lowers risk without giving up as much return.', ex: { p: 'Why doesn\'t owning 30 stocks remove all risk?', s: ['Company-specific (unsystematic) risk shrinks with more holdings.', 'Market-wide (systematic) risk - recessions, rate shocks - hits almost everything.', 'You can diversify away unsystematic risk, not systematic.'], a: 'Systematic risk remains.' }, key: ['Risk tolerance + time horizon drive allocation.', 'Rebalancing restores target weights.', 'Beta measures sensitivity to the market (1.0 = moves with market).'] }],
    qs: [
      { q: 'A stock with a beta of 1.5 tends to', c: ['move 1.5× as much as the market', 'move opposite the market', 'never change in price', 'move half as much as the market'], a: 0, e: 'Beta > 1 = more volatile than the market.', h: ['Beta = market sensitivity.', '1.5 times.'] },
      { q: 'Which risk can diversification reduce?', c: ['Unsystematic (company-specific) risk', 'Systematic (market) risk', 'Inflation risk entirely', 'All risk'], a: 0, e: 'Holding many companies offsets individual surprises.', h: ['Company-specific.', 'Not the whole market.'] },
    ] },
  { id: 'inv3', track: 'inv', t: 'Valuation: P/E, Earnings, Cash Flow', topics: 'P/E, EPS, dividend yield, growth, DCF intuition', gen: [pe, yld],
    lessons: [{ id: 'l1', t: 'What P/E really says', why: 'P/E is the most common valuation shortcut in market news and pitches.', ex: { p: 'Company A: P/E 12. Company B: P/E 35. What might explain the gap?', s: ['P/E = price ÷ earnings per share.', 'High P/E: investors expect fast future growth (or earnings are temporarily low).', 'Low P/E: slower growth, more risk, or possibly undervalued.', 'Compare within the same industry.'], a: 'B is priced for higher growth expectations.' }, key: ['EPS = net income ÷ shares outstanding.', 'Forward P/E uses next year\'s expected EPS.', 'DCF: value = present value of future free cash flows.', 'PEG = P/E ÷ growth rate.'] }],
    qs: [
      { q: 'A company\'s net income is $50M with 25M shares. EPS?', c: ['$2.00', '$0.50', '$1,250', '$25'], a: 0, e: '50/25 = $2.00.', h: ['EPS = net income ÷ shares.', 'Divide.'] },
      { q: 'A high P/E ratio usually signals that investors', c: ['expect strong future earnings growth', 'think the company is bankrupt', 'receive high dividends', 'see no growth'], a: 0, e: 'They pay more per dollar of current earnings for expected growth.', h: ['Paying more now.', 'For what?'] },
    ] },
  { id: 'biz1', track: 'biz', t: 'Unit Economics & Break-Even', topics: 'contribution margin, CAC, LTV, break-even, operating leverage', gen: [margin],
    lessons: [{ id: 'l1', t: 'Does each customer make money?', why: 'Case competitions and startup questions start with unit economics.', ex: { p: 'Subscription $20/mo, cost to serve $5/mo, customers stay 12 months, CAC $90. Good business?', s: ['Contribution/month = 20 − 5 = $15.', 'LTV ≈ 15 × 12 = $180.', 'LTV/CAC = 180/90 = 2.0.', 'Healthy target is often ~3×: decent but needs better retention or cheaper acquisition.'], a: 'LTV/CAC = 2 - workable, not great.' }, key: ['Contribution margin = price − variable cost.', 'Break-even units = fixed costs ÷ contribution margin.', 'Operating leverage: high fixed costs -> profits swing more with sales.'] }],
    qs: [{ q: 'LTV $300, CAC $150. LTV/CAC?', c: ['2.0', '0.5', '450', '150'], a: 0, e: '300/150 = 2.0.', h: ['Divide.', 'Value ÷ cost.'] }] },
  { id: 'news1', track: 'news', t: 'Reading Earnings & Market News', topics: 'beats/misses, guidance, Fed decisions, inflation reports, market reactions',
    lessons: [{ id: 'l1', t: 'Why a stock can fall on good earnings', why: 'Prices move on results vs **expectations** and on **guidance**, not on the raw number.', ex: { p: 'Headline: "Company beats EPS estimates, shares fall 8%." Why?', s: ['Beat = EPS above analyst consensus.', 'But guidance (next quarter forecast) was cut.', 'Or revenue missed, or margins shrank.', 'Investors price the future, so weak guidance outweighs a beat.'], a: 'Weak guidance or other metrics outweighed the beat.' }, key: ['Consensus estimate = average analyst forecast.', 'Guidance = company\'s own outlook.', 'Rate hikes generally pressure growth stocks (future cash flows discounted more).', 'CPI = inflation; jobs report = labor market.'] }],
    qs: [
      { q: 'If the Fed unexpectedly raises interest rates, growth stocks typically', c: ['fall, because future earnings are discounted more heavily', 'rise sharply', 'are unaffected', 'pay more dividends'], a: 0, e: 'Higher discount rates reduce the present value of distant cash flows.', h: ['Present value.', 'Higher rate -> lower PV.'] },
      { q: '"Revenue came in at $2.1B vs. $2.3B expected" means the company', c: ['missed revenue estimates', 'beat revenue estimates', 'issued guidance', 'paid a dividend'], a: 0, e: 'Below consensus = miss.', h: ['Actual vs expected.', 'Lower.'] },
    ] },
  { id: 're1', track: 're', t: 'Mortgages & Cap Rates', topics: 'down payment, PMI, fixed vs ARM, cap rate, rent vs buy',
    lessons: [{ id: 'l1', t: 'Cap rate in one line', why: 'Real estate investors compare properties by cap rate.', ex: { p: 'Property earns $30k net operating income, costs $500k. Cap rate?', s: ['Cap rate = NOI ÷ price.', '30,000 ÷ 500,000 = 6%.'], a: '6%' }, key: ['20% down avoids PMI on conventional loans.', 'Fixed rate = stable payment; ARM = adjusts.', 'Higher cap rate = higher yield, often more risk.'] }],
    qs: [{ q: 'NOI $45k, price $900k. Cap rate?', c: ['5%', '20%', '0.5%', '45%'], a: 0, e: '45/900 = 5%.', h: ['NOI ÷ price.', 'As a %.'] }] },
];

// Business case challenges: numbers + MCQ + memo (Claude-graded).
export const CASES = [
  { id: 'c1', t: 'Brewline Coffee: Expand or Optimize?', tag: 'Strategy · Unit economics',
    setup: 'Brewline (fictional) runs 4 cafés. Each café: revenue $600k/yr, food & drink costs 32% of revenue, labor $210k, rent $72k, other $40k. A 5th location would cost $350k to open (equipment + build-out) and is projected to reach 70% of a typical café\'s revenue in year 1, 100% in year 2. The owner is also considering a $120k mobile-order system expected to raise revenue 8% across all cafés.',
    questions: [
      { q: 'Operating profit of one typical café?', c: ['$86k', '$192k', '$278k', '$408k'], a: 0, e: '600 − 192 (32%) − 210 − 72 − 40 = $86k.', h: ['Revenue minus all four costs.', '32% of 600k = 192k.'] },
      { q: 'Approx. extra annual revenue from the mobile-order system (4 cafés)?', c: ['$192k', '$48k', '$120k', '$600k'], a: 0, e: '8% × $2.4M = $192k.', h: ['Total revenue first.', '4 × 600k × 8%.'] },
      { q: 'Which question matters MOST before approving the 5th location?', c: ['Will costs like labor and rent scale with lower year-1 revenue?', 'What color should the logo be?', 'How many tables do current cafés have?', 'Is coffee popular?'], a: 0, e: 'At 70% revenue, fixed costs (rent, much of labor) may wipe out profit in year 1.', h: ['Fixed vs variable costs.', 'Year-1 revenue is lower.'] },
    ],
    task: 'Write a 120-200 word memo to the owner recommending ONE option (5th location, mobile ordering, or both/neither). Use at least two numbers, name one risk, and end with a clear next step.' },
  { id: 'c2', t: 'Atlas Outdoor: The Margin Problem', tag: 'Financial statements · Diagnosis',
    setup: 'Atlas Outdoor (fictional) sold $40M last year and $46M this year. Gross margin fell from 48% to 41%. Marketing spend rose from $4M to $7M. Inventory on hand grew from $6M to $11M. Management says, "Record revenue proves our strategy is working."',
    questions: [
      { q: 'Gross profit this year vs last year?', c: ['$18.9M vs $19.2M - slightly lower despite more revenue', '$46M vs $40M', '$27.1M vs $20.8M', 'Exactly the same'], a: 0, e: '46 × 41% = 18.86; 40 × 48% = 19.2.', h: ['Revenue × gross margin.', 'Compare the two.'] },
      { q: 'Inventory nearly doubling most likely signals', c: ['products aren\'t selling as fast as they\'re bought - possible future discounting', 'stronger cash position', 'lower costs', 'higher margins ahead for sure'], a: 0, e: 'Excess inventory ties up cash and often leads to markdowns.', h: ['Cash tied up.', 'What happens to unsold goods?'] },
      { q: 'The management claim is weakest because', c: ['revenue grew but profit drivers (margin, inventory, marketing efficiency) worsened', 'revenue fell', 'it uses numbers', 'margins rose'], a: 0, e: 'Growth "bought" with discounts and spending isn\'t clearly healthy.', h: ['Claim vs evidence.', 'Revenue isn\'t profit.'] },
    ],
    task: 'Write a memo to the CFO: Is Atlas healthier than last year? Support with at least three numbers, identify the root cause you suspect, and recommend two actions.' },
  { id: 'c3', t: 'Client Portfolio Review (Simulated)', tag: 'Wealth management · Risk',
    setup: 'A fictional client, age 58, plans to retire at 63 and needs to start withdrawals then. Portfolio $800k: 85% in five technology stocks, 10% cash, 5% bonds. The client says, "Tech has done great, why change?" (Educational simulation, not advice.)',
    questions: [
      { q: 'The biggest risk in this portfolio is', c: ['concentration in one sector close to retirement', 'too much diversification', 'too many bonds', 'holding any cash'], a: 0, e: 'Five stocks in one sector + short horizon = high sequence-of-returns risk.', h: ['How many holdings? One sector?', 'Time horizon is only 5 years.'] },
      { q: 'A 30% tech drawdown would reduce the portfolio by about', c: ['$204k', '$240k', '$80k', '$680k'], a: 0, e: '85% × 800k = 680k in tech; 30% of 680k = $204k.', h: ['Tech dollars first.', '30% of that.'] },
      { q: 'Which response best addresses the client\'s objection?', c: ['Acknowledge past gains, then show how a drop right before retirement could delay their plans, and propose gradual diversification', 'Tell them they\'re wrong', 'Sell everything immediately', 'Ignore it'], a: 0, e: 'Validate, quantify the risk to their goal, propose a measured path.', h: ['Client communication.', 'Tie risk to their goal.'] },
    ],
    task: 'Write talking points (120-200 words) for a meeting with this client explaining the risk and a gradual rebalancing approach. Use one number, address the "tech has done great" objection, and keep it client-friendly.' },
];

// Built-in annotation articles (fictional). Labels: claim, evidence, number, assumption, opinion, context.
export const ARTICLES = [
  { id: 'a1', t: 'Northwind Outfitters Shares Jump After Strong Quarter', sentences: [
    ['Northwind Outfitters shares rose 12% Thursday after the retailer reported quarterly results.', 'context'],
    ['Revenue climbed 18% to $1.4 billion, above the $1.3 billion analysts expected.', 'number'],
    ['Same-store sales grew 9%, driven by a surge in online orders.', 'evidence'],
    ['CEO Dana Ortiz said the company is "clearly winning share from every competitor."', 'claim'],
    ['However, gross margin narrowed to 38% from 41% as the company offered deeper discounts.', 'evidence'],
    ['Management raised full-year guidance, assuming consumer spending stays steady through the holidays.', 'assumption'],
    ['One analyst called the quarter "the best in the company\'s history."', 'opinion'],
  ], questions: [
    { q: 'Which sentence most weakens the CEO\'s claim of "clearly winning"?', c: ['Gross margin narrowed as discounts deepened', 'Shares rose 12%', 'Revenue beat expectations', 'An analyst praised the quarter'], a: 0, e: 'Discount-driven growth may be bought, not won.', h: ['Look for a "however".', 'What did the growth cost?'] },
    { q: 'The raised guidance depends on', c: ['steady consumer spending through the holidays', 'margins expanding', 'competitors closing', 'online orders falling'], a: 0, e: 'Stated assumption.', h: ['Find the assumption.', '"assuming..."'] },
  ] },
  { id: 'a2', t: 'Memo: Why Halcyon Software Should Cut Its Price 30%', sentences: [
    ['Our sales team reports that prospects frequently mention price during calls.', 'evidence'],
    ['Therefore, cutting our price by 30% will double new customer sign-ups.', 'claim'],
    ['Customers clearly care about price more than features.', 'assumption'],
    ['Last year, a competitor cut prices 20% and gained market share.', 'evidence'],
    ['Our current gross margin is 72%.', 'number'],
    ['This is obviously the smartest move we can make.', 'opinion'],
  ], questions: [
    { q: 'The biggest logical gap in this memo is', c: ['no evidence that a 30% cut would double sign-ups or keep profit higher', 'it mentions a competitor', 'it gives the gross margin', 'it is too short'], a: 0, e: 'The causal claim is unsupported, and profit impact is ignored.', h: ['Claim vs evidence.', '"Double" - says who?'] },
    { q: 'With a 72% margin, a 30% price cut means each sale\'s gross profit falls by roughly', c: ['about 42% (72 -> 42 points of the old price)', '30%', '72%', '0%'], a: 0, e: 'Old: 72 of 100. New: price 70, cost 28 -> profit 42. 42/72 ≈ 58% of old, a ~42% drop.', h: ['Assume price $100, cost $28.', 'New price $70.'] },
  ] },
];

// DECA: Finance + Business Management & Administration clusters.
export const DECA = {
  note: 'Individual series: 100-question cluster exam + 2 roleplays (10 min prep, up to 10 min with the judge, 5 performance indicators). Check the current DECA guidelines for your event.',
  clusters: [
    { id: 'fin', t: 'Finance Cluster', events: ['Business Finance Series (BFS)', 'Personal Financial Literacy (PFL)', 'Accounting Applications (ACT)', 'Financial Consulting (FCE)', 'Financial Services Team Decision Making (FTDM)'],
      topics: 'financial analysis, risk management, business law, economics, customer relations, professional development, financial-information management',
      lessons: [{ id: 'l1', t: 'How to beat a roleplay in 10 minutes of prep', why: 'Judges score each PI. A clear structure that hits every PI by name beats a clever but messy answer.', ex: { p: 'PI: "Explain the purpose of insurance." You are a bank\'s client advisor.', s: ['Open: greet, restate the client\'s situation (shows listening).', 'Define simply: insurance transfers financial risk for a premium.', 'Apply: "For your bakery, a fire could cost $200k; a $3k/yr policy shifts that risk."', 'Check understanding, then close with next step and thanks.'], a: 'Define -> apply to their situation with a number -> check -> close.' }, key: ['Prep: write the 5 PIs as headings; one example per PI.', 'Use the judge\'s name and role.', 'Bring numbers; end with a recommendation and next step.', 'Ask the judge if they have questions.'] }],
      qs: [
        { q: 'Which financial statement would a lender examine first to judge a company\'s ability to pay short-term debts?', c: ['Balance sheet (current assets vs current liabilities)', 'Mission statement', 'Organizational chart', 'Marketing plan'], a: 0, e: 'Liquidity = current assets vs current liabilities.', h: ['Short-term = current.', 'Balance sheet items.'] },
        { q: 'Diversifying a portfolio primarily helps to', c: ['reduce risk', 'guarantee returns', 'increase taxes', 'eliminate inflation'], a: 0, e: 'Spreads exposure across assets.', h: ['Eggs and baskets.', 'Risk.'] },
        { q: 'An agreement in which one party agrees to pay another for losses in exchange for a premium is', c: ['insurance', 'a warranty', 'a lease', 'a bond'], a: 0, e: 'Risk transfer for a premium.', h: ['Risk management.', 'Premium.'] },
        { q: 'The Sarbanes-Oxley Act (2002) was passed mainly to', c: ['improve accuracy of corporate financial reporting', 'lower corporate taxes', 'regulate cryptocurrency', 'create the Federal Reserve'], a: 0, e: 'Response to Enron/WorldCom accounting scandals.', h: ['Post-Enron.', 'Financial reporting.'] },
        { q: 'A financial advisor who must act in the client\'s best interest has a', c: ['fiduciary duty', 'commission duty', 'sales quota', 'fixed annuity'], a: 0, e: 'Fiduciaries put client interests first.', h: ['Legal duty of loyalty.', 'Fiduciary.'] },
        { q: 'Accounts receivable represents', c: ['money owed to the business by customers', 'money the business owes suppliers', 'cash in the bank', 'owner\'s equity'], a: 0, e: 'Receivable = to be received.', h: ['Receive.', 'Customers owe you.'] },
        { q: 'A company\'s quick ratio excludes which current asset?', c: ['Inventory', 'Cash', 'Marketable securities', 'Accounts receivable'], a: 0, e: 'Inventory is less liquid, so the quick (acid-test) ratio removes it.', h: ['Least liquid current asset.', 'Hard to sell fast.'] },
        { q: 'When a customer is angry about a fee, the best first step is to', c: ['listen fully and acknowledge their concern', 'explain the policy immediately', 'transfer them to a manager', 'offer a refund before listening'], a: 0, e: 'Customer relations PI: listen, empathize, then solve.', h: ['Customer relations.', 'Before solving...'] },
        { q: 'Inflation reduces the', c: ['purchasing power of money', 'nominal value of debt', 'need for budgeting', 'interest rate on loans'], a: 0, e: 'Each dollar buys less.', h: ['Prices rise.', 'What does a dollar buy?'] },
        { q: 'Which is an example of a liability?', c: ['A bank loan', 'Equipment', 'Inventory', 'Cash'], a: 0, e: 'Liabilities are obligations owed.', h: ['Owed vs owned.', 'Owed.'] },
      ],
      roleplays: [
        { id: 'r1', event: 'Business Finance Series', role: 'You are a financial analyst at Crestline Furniture (fictional). The CFO (judge) is meeting with you.', scenario: 'Crestline\'s sales rose 10% but cash on hand fell 25%. The CFO wants you to explain how this can happen and recommend two ways to improve cash flow without cutting sales.', pis: ['Explain the nature of the cash flow statement', 'Describe the relationship between profit and cash flow', 'Analyze accounts receivable and inventory levels', 'Recommend strategies to improve cash flow', 'Explain the importance of financial forecasting'] },
        { id: 'r2', event: 'Personal Financial Literacy', role: 'You are a volunteer at a community financial-literacy fair. The judge is a 19-year-old starting their first full-time job.', scenario: 'The judge earns $2,800/month take-home, has a $1,200 credit card balance at 26% APR, and wants to buy a $28,000 car. They ask what they should do first.', pis: ['Explain the purpose of a budget', 'Describe the impact of interest on debt', 'Explain the importance of an emergency fund', 'Compare the costs of financing options', 'Describe factors that affect credit scores'] },
        { id: 'r3', event: 'Financial Consulting', role: 'You are a consultant meeting the owner (judge) of a small landscaping company.', scenario: 'The owner has $60,000 in profit this year and wants to know whether to buy new equipment, hire a crew member, or save for a slow winter. Revenue is very seasonal.', pis: ['Assess the client\'s financial situation and goals', 'Explain seasonal cash-flow management', 'Analyze the costs and benefits of a capital purchase', 'Recommend a financial plan', 'Demonstrate professionalism and build client trust'] },
      ] },
    { id: 'bma', t: 'Business Management & Administration', events: ['Principles of Business Management & Administration (PBM)', 'Human Resources Management (HRM)', 'Business Law & Ethics Team (BLTDM)', 'Business Services Operations Research'],
      topics: 'operations, human resources, business law, ethics, management, communication, project management, quality',
      lessons: [{ id: 'l1', t: 'Ethics roleplays: the 4-step frame', why: 'BLTDM and HRM roleplays often hinge on an ethical or legal dilemma.', ex: { p: 'An employee reports a manager is pressuring staff to skip safety checks to hit deadlines. Respond as HR director.', s: ['Identify the issue: safety + legal (OSHA) + ethics.', 'Stakeholders: employees, customers, company reputation, regulators.', 'Options: investigate, protect the reporter (no retaliation), retrain, adjust deadlines.', 'Recommend and explain why it protects people and the company.'], a: 'Issue -> stakeholders -> options -> recommendation.' }, key: ['Name relevant laws (OSHA, Title VII, ADA, FLSA) when appropriate.', 'Whistleblower protection: no retaliation.', 'Show empathy and professionalism.'] }],
      qs: [
        { q: 'Which law prohibits employment discrimination based on race, color, religion, sex, or national origin?', c: ['Title VII of the Civil Rights Act of 1964', 'Fair Labor Standards Act', 'Sherman Antitrust Act', 'Sarbanes-Oxley Act'], a: 0, e: 'Title VII is the core anti-discrimination statute.', h: ['1964.', 'Civil Rights Act.'] },
        { q: 'The Fair Labor Standards Act sets rules for', c: ['minimum wage, overtime, and child labor', 'workplace safety inspections', 'union elections', 'retirement plans'], a: 0, e: 'FLSA = wage and hour law.', h: ['Wages and hours.', 'Overtime.'] },
        { q: 'A Gantt chart is used to', c: ['schedule project tasks over time', 'show organizational hierarchy', 'track stock prices', 'measure customer satisfaction'], a: 0, e: 'Bars for tasks along a timeline.', h: ['Project management.', 'Timeline bars.'] },
        { q: 'Span of control refers to', c: ['the number of employees a manager directly supervises', 'the length of a contract', 'the company\'s geographic reach', 'the budget a manager controls'], a: 0, e: 'Wide span = many direct reports.', h: ['How many people report to you.', 'Direct reports.'] },
        { q: 'An offer, acceptance, consideration, capacity and legality are elements of a', c: ['valid contract', 'tort', 'patent', 'franchise'], a: 0, e: 'Required elements of an enforceable contract.', h: ['Business law.', 'Agreement.'] },
        { q: 'Benchmarking means', c: ['comparing your processes to best practices of leading organizations', 'setting the price of a product', 'firing low performers', 'a type of insurance'], a: 0, e: 'Used to set improvement targets.', h: ['Compare to the best.', 'Operations.'] },
        { q: 'Which is an example of active listening?', c: ['Paraphrasing what the speaker said to confirm understanding', 'Planning your reply while they talk', 'Checking your phone', 'Interrupting with a solution'], a: 0, e: 'Paraphrase, ask clarifying questions, give full attention.', h: ['Communication PI.', 'Confirm understanding.'] },
        { q: 'A company outsourcing payroll to another firm is mainly trying to', c: ['focus on core activities and reduce costs', 'increase legal risk', 'hire more accountants', 'avoid paying employees'], a: 0, e: 'Outsourcing non-core work to specialists.', h: ['Core vs non-core.', 'Specialists.'] },
        { q: 'Intellectual property protection for a brand name or logo is a', c: ['trademark', 'patent', 'copyright', 'trade secret'], a: 0, e: 'Trademarks protect brand identifiers.', h: ['Brand.', '™'] },
        { q: 'Quality control differs from quality assurance because QC', c: ['inspects finished products for defects', 'designs processes to prevent defects', 'sets prices', 'manages marketing'], a: 0, e: 'QC detects; QA prevents.', h: ['Inspect vs prevent.', 'Control = check output.'] },
      ],
      roleplays: [
        { id: 'r4', event: 'Human Resources Management', role: 'You are the HR manager at Pinecrest Hotels (fictional). The general manager (judge) asks for your advice.', scenario: 'Front-desk turnover hit 60% this year. Exit interviews mention unpredictable schedules and little training. Hiring and training each new clerk costs about $4,000.', pis: ['Explain the costs of employee turnover', 'Describe strategies to improve retention', 'Explain the role of training in employee performance', 'Analyze employee feedback data', 'Recommend a retention plan with measurable goals'] },
        { id: 'r5', event: 'Principles of Business Management', role: 'You are an assistant manager at a busy sandwich shop. The owner (judge) wants your ideas.', scenario: 'Lunch rush lines are 15+ minutes and customers are leaving. Staff say the kitchen layout and order system slow them down.', pis: ['Explain the concept of operations management', 'Identify ways to improve efficiency', 'Describe the importance of customer satisfaction', 'Explain the role of employee input in decision-making', 'Recommend a plan and how to measure success'] },
        { id: 'r6', event: 'Business Law & Ethics', role: 'You are a compliance consultant to the owner (judge) of an online clothing store.', scenario: 'The owner wants to post "customer reviews" written by staff to boost sales of a new product line and asks if that\'s okay.', pis: ['Explain ethical considerations in marketing', 'Describe legal issues with deceptive advertising', 'Explain the importance of trust and reputation', 'Recommend ethical alternatives to boost reviews', 'Demonstrate professional communication'] },
      ] },
  ],
};
