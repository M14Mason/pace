// Business & Finance + DECA readings. Education and simulated practice, not personal advice.
export default {
  'fin/pf1': {
    why: 'Every wealth plan starts with cash flow: spending less than you earn, on purpose. Wealth managers ask about a client\'s budget before anything else.',
    guide: ['Why build a budget from net pay?', 'How does 50/30/20 work?', 'Why does the emergency fund come first?'],
    s: [
      ['A plan for every dollar', 'A **budget** gives every dollar a job before the month starts. Build it from **net pay** (take-home), not gross. Track one month of real spending first - most people underestimate food and subscriptions.', 'The **50/30/20** split: 50% to **needs** (rent, food, transportation, phone), 30% to **wants**, and 20% to **savings and debt payoff**. It\'s a starting point you adjust, not a rule.'],
      ['Pay yourself first', '**Pay yourself first**: automate a transfer to savings on payday, so saving happens before spending. Build an **emergency fund** of 3-6 months of essential expenses in a savings account. It keeps a car repair or a job loss from turning into credit card debt - and only then does investing make sense.'],
    ],
    notes: { 'net pay': 'Gross $3,000 might be about $2,400 net. Budgeting from gross is how people overspend.', 'emergency fund': 'An emergency fund isn\'t an investment - its job is to be boring and available.' },
    recall: [['Net pay $2,000: what are the 50/30/20 amounts?', '$1,000 needs / $600 wants / $400 savings.'], ['What does "pay yourself first" mean?', 'Automatically save before spending on anything else.'], ['Why does the emergency fund come before investing?', 'It prevents high-interest debt when surprises hit.']],
    recap: ['Budget from net pay; track real spending first.', '50/30/20 as a starting split.', 'Automate savings (pay yourself first).', '3-6 month emergency fund before investing.'],
  },
  'fin/pf2': {
    why: 'Interest works for you in savings and against you in debt. Understanding APR, APY and credit is how you stay on the winning side.',
    guide: ['What is the difference between APR and APY?', 'Why is minimum-payment debt so expensive?', 'What builds a credit score?'],
    s: [
      ['Interest both ways', '**APY** (annual percentage yield) includes compounding and is used for savings. **APR** (annual percentage rate) is the yearly rate on debt. A 4% APR compounded monthly is about a 4.07% APY - compounding adds a little extra.', 'Credit card math: monthly interest ≈ APR ÷ 12 × balance. At 24% APR on $2,000, that\'s about $40 a month. Pay $60 and only $20 reduces the balance, so payoff takes years. Pay $200 and it\'s gone in about 11 months.'],
      ['Credit scores', '**FICO** factors: payment history 35%, amounts owed (utilization) 30%, length of history 15%, new credit 10%, credit mix 10%. **Utilization** = balance ÷ limit; keep it under 30%, ideally under 10%. Pay on time, every time - autopay the minimum as a safety net, then pay in full.'],
    ],
    notes: { 'compounding': 'Compounding is interest earning interest. Good in savings, brutal in debt.', 'Utilization': 'You can lower utilization by paying before the statement date - the reported balance drops.' },
    recall: [['Which is used for savings: APR or APY?', 'APY.'], ['$1,500 balance on a $5,000 limit - utilization?', '30%.'], ['What is the biggest credit score factor?', 'Payment history (35%).']],
    recap: ['APY = savings with compounding; APR = cost of debt.', 'Monthly card interest ≈ APR/12 × balance.', 'Minimum payments mostly pay interest.', 'FICO: payment history + utilization dominate.'],
  },
  'fin/pf3': {
    why: 'Taxes are often the largest expense in a financial plan. Understanding marginal rates, capital gains and tax-advantaged accounts is core wealth-management knowledge.',
    guide: ['Marginal vs effective rate?', 'How are investment gains taxed?', 'How do tax-advantaged accounts help?'],
    s: [
      ['Income tax', 'U.S. income tax is **progressive** and **marginal**: each slice of income is taxed at its own rate. The **effective rate** is total tax ÷ total income, and it\'s always below the top marginal rate. Wages also carry **FICA** (7.65%).'],
      ['Investment taxes and accounts', '**Capital gains** are profits from selling an investment. Held **one year or less** = **short-term**, taxed like ordinary income. Held **more than a year** = **long-term**, taxed at lower rates. That\'s one reason long-term investors pay less tax.', '**Tax-advantaged accounts**: a **traditional 401(k)/IRA** lowers your taxable income now and is taxed on withdrawal; a **Roth** is taxed now and grows tax-free. Wealth managers think about **asset location** - which investments to hold in which kind of account.'],
    ],
    notes: { 'effective rate': 'Interview-ready line: "Marginal rate drives decisions about the next dollar; effective rate describes the overall burden."', 'more than a year': 'Waiting past the 1-year mark can noticeably cut the tax on a gain.' },
    recall: [['$60k income, $7k total tax - effective rate?', 'About 11.7%.'], ['Sold a stock after 8 months for a gain - short or long term?', 'Short-term (taxed as ordinary income).'], ['Roth: when is tax paid?', 'Now - qualified withdrawals are tax-free.']],
    recap: ['Marginal brackets; effective rate < top rate.', 'Short-term gains = ordinary income; long-term = lower rates.', 'Traditional (tax later) vs Roth (tax now).', 'Asset location matters.'],
  },
  'fin/acct1': {
    why: '"Walk me through an income statement" is one of the most common finance interview questions. This reading makes you fluent in it.',
    guide: ['What is the accounting equation?', 'What are the lines of an income statement, in order?', 'What does accrual accounting mean?'],
    s: [
      ['The accounting equation', '**Assets = Liabilities + Equity.** Everything a company owns was funded by either borrowing (liabilities) or owners (equity). Every transaction keeps this balanced - borrow $10 and both cash and debt rise by $10.'],
      ['Walking the income statement', '**Revenue** (sales) − **cost of goods sold (COGS)** = **gross profit**. − **operating expenses** (salaries, marketing, rent, R&D) = **operating income (EBIT)**. − **interest** = **pre-tax income**. − **taxes** = **net income**. **EBITDA** adds back depreciation and amortization to show operating cash earnings.', 'Under **accrual accounting**, revenue is recorded when it\'s **earned** and expenses when they\'re **incurred**, not when cash moves. That\'s why profit and cash can differ.'],
    ],
    notes: { 'EBIT': 'EBIT = Earnings Before Interest and Taxes - it shows how the business itself performs, apart from how it\'s financed.', 'earned': 'If you deliver in December and get paid in January, the revenue counts in December.' },
    recall: [['Revenue $100M, COGS $60M, operating expenses $25M. Operating income?', '$15M.'], ['What does EBITDA add back?', 'Depreciation and amortization.'], ['When is revenue recorded under accrual accounting?', 'When it\'s earned.']],
    recap: ['Assets = Liabilities + Equity.', 'Revenue → gross profit → EBIT → pre-tax → net income.', 'EBITDA adds back D&A.', 'Accrual: earned and incurred, not cash timing.'],
  },
  'fin/acct2': {
    why: 'Profit can hide problems; cash can\'t. The balance sheet and cash flow statement show whether a business is really healthy.',
    guide: ['What is on a balance sheet?', 'How do you get from net income to operating cash flow?', 'What is free cash flow and why does it matter?'],
    s: [
      ['The balance sheet', '**Current assets** (cash, receivables, inventory) turn into cash within a year; **long-term assets** include property and equipment. **Current liabilities** (payables, short-term debt) are due within a year. **Working capital** = current assets − current liabilities - the short-term cushion.'],
      ['Cash flow', 'The **cash flow statement** starts with net income and adjusts it. Add back non-cash expenses like **depreciation**. Subtract increases in **receivables** (sales not yet collected) and **inventory** (cash spent on stock). The result is **cash from operations**. Investing activity covers capital expenditures and acquisitions; financing covers debt, buybacks and dividends.', '**Free cash flow = cash from operations − capital expenditures.** It\'s the cash left over to repay debt, pay dividends, buy back shares, or grow - many investors value companies on it.'],
    ],
    notes: { 'receivables': 'Growing receivables can be a warning sign: customers are buying but not paying yet.', 'Free cash flow': 'FCF is often called the purest measure of a business\'s cash-generating power.' },
    recall: [['Net income $5M, depreciation $2M, receivables up $3M. Cash from operations?', '$4M.'], ['Where does a share buyback appear?', 'Cash flow from financing.'], ['Free cash flow formula?', 'Cash from operations − capital expenditures.']],
    recap: ['Current vs long-term; working capital.', 'Cash from operations: net income + non-cash items − working capital increases.', 'Investing (capex) and financing (debt, buybacks, dividends).', 'FCF = CFO − capex.'],
  },
  'fin/inv1': {
    why: 'Wealth management is about choosing the right mix of assets for a client. You need to know what each asset is and how it behaves.',
    guide: ['How do stocks and bonds differ?', 'Why do bond prices fall when rates rise?', 'What makes index funds and ETFs useful?'],
    s: [
      ['Stocks and bonds', '**Stocks** are ownership; their return comes from price growth and dividends, with higher long-run returns and bigger swings. **Bonds** are loans that pay a **coupon** and return **par** at maturity. Their risks: **credit risk** (the borrower might not pay) and **interest-rate risk**.', 'When rates rise, newly issued bonds pay more, so older bonds with lower coupons must drop in price to compete. Longer-maturity bonds (higher **duration**) move more.'],
      ['Funds', '**Mutual funds** pool money and are priced once a day. **ETFs** trade all day like stocks, usually at low cost. **Index funds** track a market such as the S&P 500 instead of picking stocks, giving broad diversification cheaply. **Market cap** = share price × shares outstanding - it measures company size.'],
    ],
    notes: { 'interest-rate risk': 'Bond prices and rates move like a seesaw: one up, the other down.', 'Index funds': 'Most active fund managers fail to beat their index over long periods after fees - a key reason index investing grew.' },
    recall: [['Stock vs bond in one line each.', 'Stock = ownership (growth + dividends). Bond = loan (coupon + par).'], ['Rates rise - what happens to a 30-year bond vs a 1-year bond?', 'Both fall; the 30-year falls more (higher duration).'], ['Market cap formula?', 'Price × shares outstanding.']],
    recap: ['Stocks = ownership; bonds = loans.', 'Bond prices move opposite to rates; longer duration moves more.', 'Mutual funds vs ETFs; index funds = cheap diversification.', 'Market cap = price × shares.'],
  },
  'fin/inv2': {
    why: 'Risk is the price of return. Understanding how to manage it - not avoid it - is what separates investing from gambling.',
    guide: ['What is the risk/return trade-off?', 'Which risk can diversification remove?', 'How do time horizon and risk tolerance shape a portfolio?'],
    s: [
      ['Risk and return', 'Investors demand **higher expected return** for taking **more risk** (volatility, the chance of loss). Over decades stocks have outperformed bonds and cash, but with deep drops along the way. **Beta** measures how much a stock moves relative to the market: 1.0 moves with it, 1.5 moves 50% more.'],
      ['Diversification and allocation', '**Unsystematic risk** (one company failing) can be **diversified away** by owning many companies. **Systematic risk** (recessions, rate shocks) hits almost everything and can\'t be diversified away. Diversification works best when assets aren\'t closely **correlated**.', '**Asset allocation** - the mix of stocks, bonds and cash - depends on **time horizon** and **risk tolerance**. Someone retiring in 5 years needs more stability than a 20-year-old. **Rebalancing** brings the mix back to its targets.'],
    ],
    notes: { 'diversified away': 'That\'s why the portfolio lab\'s band narrows when you add bonds but barely narrows when you add more stocks.', 'time horizon': 'Sequence risk: a crash right before retirement hurts far more than one at 25.' },
    recall: [['Which risk can\'t be diversified away?', 'Systematic (market) risk.'], ['Beta of 0.5 means what?', 'The stock tends to move half as much as the market.'], ['Why does a near-retiree hold more bonds?', 'Short time horizon - less ability to recover from a crash.']],
    recap: ['More return requires more risk; beta measures market sensitivity.', 'Diversification removes unsystematic risk, not systematic.', 'Allocation depends on horizon and risk tolerance; rebalance.'],
  },
  'fin/inv3': {
    why: 'Valuation answers the investor\'s core question: is this company worth its price? P/E and cash flow thinking appear in every stock pitch.',
    guide: ['What does the P/E ratio really say?', 'How do earnings and EPS connect?', 'What is the idea behind a DCF?'],
    s: [
      ['Earnings and P/E', '**EPS** = net income ÷ shares outstanding. **P/E** = share price ÷ EPS: how many dollars investors pay for $1 of yearly earnings. A **high P/E** usually signals expected fast growth (or temporarily depressed earnings); a **low P/E** can mean slower growth, more risk, or a bargain. Compare P/Es **within an industry**.', '**Forward P/E** uses next year\'s expected EPS. **PEG** = P/E ÷ growth rate adjusts for growth. **Dividend yield** = annual dividend ÷ price.'],
      ['Cash flow valuation', 'A **discounted cash flow (DCF)** values a company as the **present value of its future free cash flows**. Higher growth raises the value; a higher **discount rate** (more risk or higher interest rates) lowers it. That\'s why rate hikes hit high-growth stocks hardest - more of their value lies far in the future.'],
    ],
    notes: { 'within an industry': 'A P/E of 30 is normal for software and expensive for a bank. Context first.', 'discount rate': 'Raise the discount rate and every future dollar is worth less today - especially distant ones.' },
    recall: [['Price $50, EPS $2.50 - P/E?', '20.'], ['What might a high P/E signal?', 'Expected strong growth (or temporarily low earnings).'], ['Why do rate hikes hurt growth stocks more?', 'Their cash flows are further out, so a higher discount rate cuts their present value more.']],
    recap: ['EPS = net income ÷ shares; P/E = price ÷ EPS.', 'Compare P/E within an industry; forward P/E; PEG; dividend yield.', 'DCF = PV of future free cash flow.', 'Higher discount rates hit long-duration growth stocks hardest.'],
  },
  'fin/biz1': {
    why: 'Case competitions and startup questions all ask the same thing first: does each sale make money? Unit economics answers it.',
    guide: ['What is contribution margin?', 'How do you calculate break-even?', 'What do LTV and CAC tell you?'],
    s: [
      ['Per-unit thinking', '**Contribution margin** = price − variable cost per unit. It\'s what each sale contributes toward fixed costs (rent, salaries). **Break-even units = fixed costs ÷ contribution margin**. **Operating leverage**: businesses with high fixed costs see profits swing sharply as sales change.'],
      ['Customer economics', '**CAC** (customer acquisition cost) is what you spend to win one customer. **LTV** (lifetime value) is the contribution a customer brings over their lifetime: monthly contribution × months retained. An **LTV/CAC** ratio around **3** or higher is often called healthy. You improve it by keeping customers longer, raising margins, or acquiring customers more cheaply.'],
    ],
    notes: { 'Operating leverage': 'High fixed costs are great when sales grow and painful when they fall - airlines are the classic example.', 'LTV/CAC': 'Below 1 means you lose money on every customer you acquire.' },
    recall: [['Price $20, variable cost $8, fixed costs $6,000. Break-even units?', '500.'], ['LTV $450, CAC $150. Ratio?', '3.0.'], ['Two ways to improve LTV/CAC?', 'Improve retention or margins; lower acquisition cost.']],
    recap: ['Contribution margin = price − variable cost.', 'Break-even = fixed ÷ contribution.', 'Operating leverage amplifies swings.', 'LTV/CAC ≈ 3+ is healthy.'],
  },
  'fin/news1': {
    why: 'Markets move on news, but not the way most people expect. Reading earnings and Fed headlines correctly is a daily skill in wealth management.',
    guide: ['Why can a stock fall on good earnings?', 'What are consensus and guidance?', 'How do Fed decisions and data reports move markets?'],
    s: [
      ['Earnings season', 'Each quarter, companies report results against the **consensus estimate** (the average analyst forecast). Beating it is a "**beat**," falling short is a "**miss**." But prices react to **expectations**, so a beat with weak **guidance** (the company\'s own forecast) can still send a stock down. Investors also watch revenue growth and margins, not just EPS.'],
      ['Macro news', 'The **Federal Reserve** sets short-term interest rates. A surprise **hike** usually pressures stocks, especially growth stocks, and pushes bond prices down. **CPI** reports show inflation; hot inflation raises the odds of hikes. The **jobs report** shows the labor market. Always ask: **was it better or worse than expected?**'],
    ],
    notes: { 'guidance': 'Guidance is about the future - and markets price the future. That\'s why it often matters more than the quarter just reported.', 'than expected': 'Good news can be bad for stocks if it means the Fed raises rates. Expectations explain most market "surprises".' },
    recall: [['Why might a stock fall after beating EPS estimates?', 'Weak guidance, a revenue miss, or shrinking margins.'], ['What is consensus?', 'The average analyst estimate.'], ['A hot CPI report usually means what for rate expectations?', 'Higher odds of rate hikes.']],
    recap: ['Results vs consensus: beat or miss.', 'Guidance often matters more than the quarter.', 'Fed hikes pressure growth stocks and bonds.', 'Always compare to expectations.'],
  },
  'fin/re1': {
    why: 'Real estate is many families\' biggest asset. A few core terms - down payment, mortgage types and cap rate - cover most of what you need. (Optional unit.)',
    guide: ['How do mortgages work?', 'What is a cap rate?', 'How do you think about rent vs buy?'],
    s: [
      ['Mortgages', 'A **mortgage** is a loan secured by the home. **Fixed-rate** loans keep the same payment; **adjustable-rate (ARM)** loans change with market rates. A **20% down payment** avoids **PMI** (private mortgage insurance). The total cost of owning includes property taxes, insurance and maintenance - not just the payment.'],
      ['Investment property', 'The **cap rate** = **net operating income ÷ property price**. A property earning $30k of NOI that costs $500k has a 6% cap rate. Higher cap rates mean higher yield, often with more risk. **Rent vs buy** depends mainly on how long you\'ll stay - buying usually pays off only over several years.'],
    ],
    notes: { 'PMI': 'PMI protects the lender, not you - it\'s an extra cost for putting less than 20% down.', 'cap rate': 'NOI excludes mortgage payments, so the cap rate compares properties regardless of how they\'re financed.' },
    recall: [['NOI $45k, price $900k - cap rate?', '5%.'], ['How do you avoid PMI?', 'Put 20% down.'], ['Fixed vs ARM?', 'Fixed = same payment; ARM = rate adjusts with the market.']],
    recap: ['Fixed vs ARM; 20% down avoids PMI.', 'Ownership costs beyond the payment.', 'Cap rate = NOI ÷ price.', 'Rent vs buy depends on how long you stay.'],
  },
  'deca/fin': {
    why: 'DECA finance events test both knowledge (the cluster exam) and performance (roleplays). Judges score how clearly you handle each performance indicator (PI) - knowing the content and having a structure win.',
    guide: ['What content does the finance cluster exam cover?', 'How do you structure a roleplay?', 'How do you turn a PI into points?'],
    s: [
      ['The exam', 'The finance cluster exam pulls from instructional areas: **financial analysis** (statements, ratios), **risk management** (insurance, diversification), **business law** (contracts, regulations like Sarbanes-Oxley), **economics**, **customer relations**, **communication**, and **professional development** (ethics, fiduciary duty). Your Business & Finance lessons cover most of the financial analysis and risk content.'],
      ['Winning roleplays', 'You get **10 minutes to prep** and up to **10 minutes with the judge**. During prep, write the **5 PIs as headings** and jot one example and one number under each. In the presentation: greet the judge by name, restate the situation, address each PI **in order and by name**, give a clear recommendation with a next step, then ask if they have questions.', 'Judges score each PI from 0 to 14 (exceeds expectations = 12-14), plus 21st-century skills: reasoning, communication, and professionalism. Specific numbers and a confident recommendation separate "meets" from "exceeds."'],
    ],
    notes: { 'by name': 'Literally say "Explaining the purpose of insurance..." - it makes the judge\'s scoring easy.', 'Specific numbers': '"A $3k premium protects against a $200k fire loss" beats "insurance protects you."' },
    recall: [['What should you write first during prep?', 'The 5 PIs as headings, each with an example and a number.'], ['What separates "meets" from "exceeds"?', 'Specific numbers, a clear recommendation, and addressing every PI by name.'], ['Name three instructional areas on the finance exam.', 'Financial analysis, risk management, business law (also economics, customer relations).']],
    recap: ['Exam: financial analysis, risk, law, economics, customer relations, ethics.', 'Prep: PIs as headings + example + number.', 'Present: greet → restate → each PI by name → recommend → questions.', 'Numbers + confidence = exceeds.'],
  },
  'deca/bma': {
    why: 'Business Management & Administration events reward clear thinking about people, operations and ethics. The same structured approach wins here.',
    guide: ['What content does the BMA exam cover?', 'How do you handle an ethics or HR roleplay?', 'Which laws should you be ready to name?'],
    s: [
      ['Exam content', 'BMA covers **operations** (quality, efficiency, project management), **human resources**, **business law**, **management**, **communication**, and **ethics**. Your Advanced Business Management prep - POLC, motivation, SWOT, quality - maps directly onto it.'],
      ['Roleplays and laws', 'For ethics and HR cases, use a 4-step frame: **issue → stakeholders → options → recommendation**. Show empathy, protect employees (no retaliation against people who report problems), and connect your answer to the company\'s reputation and the law.', 'Laws worth naming: **Title VII** (anti-discrimination), **FLSA** (minimum wage and overtime), **OSHA** (workplace safety), **ADA** (disability accommodations), and the FTC rules against deceptive advertising (like fake reviews).'],
    ],
    notes: { 'issue → stakeholders → options → recommendation': 'This frame works for almost every BLTDM and HRM case - practice saying it out loud.', 'Title VII': 'Naming the right law, briefly, signals expertise. Don\'t lecture - one sentence is enough.' },
    recall: [['What is the 4-step ethics frame?', 'Issue, stakeholders, options, recommendation.'], ['Which law covers overtime pay?', 'FLSA.'], ['Which law prohibits discrimination based on race or sex?', 'Title VII of the Civil Rights Act.']],
    recap: ['BMA: operations, HR, law, management, communication, ethics.', 'Ethics/HR frame: issue → stakeholders → options → recommendation.', 'Key laws: Title VII, FLSA, OSHA, ADA, FTC rules.'],
  },
};
