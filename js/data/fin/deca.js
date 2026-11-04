// DECA: concepts tested on the Finance cluster exam and used in roleplays. Education, not personal advice.
import { Q, N, rnd, pick, $, pc, x } from './util.js';

export default [
  // ---------- Markets & investing ----------
  { id: 'stock-market', g: 'Markets & investing', t: 'The Stock Market (Exchanges vs OTC)',
    def: 'Where shares of companies are bought and sold. Exchanges (NYSE, Nasdaq) have listing rules and centralized trading; over-the-counter (OTC) securities trade through dealer networks with looser requirements.',
    why: 'It lets companies raise capital and investors buy ownership - and it prices companies every second.',
    an: 'An exchange is a big official store with rules about what it sells; OTC is more like a marketplace of independent sellers.',
    hook: 'Exchange = LISTED and regulated rules. OTC = dealer-to-dealer, often smaller and riskier.',
    ex: { p: 'Where would you find a large, well-known company vs a tiny company that doesn\'t meet listing standards?', s: ['Large company → listed on an exchange like the NYSE or Nasdaq.', 'Tiny company → often trades OTC, with less information available and wider bid-ask spreads.', 'Primary market = the IPO (company sells new shares); secondary market = investors trading with each other.'], a: 'Exchange vs OTC.' },
    qs: [
      Q('When a company sells new shares to the public for the first time, it\'s called', ['an initial public offering (IPO) in the primary market', 'a secondary market trade', 'a stock split', 'a dividend'], 'Afterward, shares trade in the secondary market.', 'First time.'),
      Q('Compared with exchange-listed stocks, OTC stocks usually have', ['less disclosure and lower liquidity', 'more regulation', 'guaranteed returns', 'no prices'], 'Higher risk for investors.', 'Fewer rules.'),
    ],
    sc: [
      { x: 'you', t: 'A "hot tip"', s: 'Someone online pushes an OTC "penny stock" that "will go up 1,000%."', q: Q('What\'s the smart reaction?', ['Be skeptical - thin trading and little disclosure make OTC stocks easy to manipulate', 'Buy as much as possible', 'Borrow money to buy it', 'Tell everyone to buy'], 'Classic pump-and-dump setup.', 'Too good to be true.') },
    ],
    wild: 'Look up a company\'s ticker and see which exchange it trades on.',
    links: ['sec', 'diversification', 'funds'] },

  { id: 'bonds', g: 'Markets & investing', t: 'Bonds & Fixed Income',
    def: 'Loans investors make to governments or companies. The bond pays a fixed interest (coupon) and returns the face value (usually $1,000) at maturity.',
    why: 'They provide steadier income and lower risk than stocks, and their prices move opposite to interest rates.',
    an: 'You lend a friend $1,000; they pay you $50 a year and return the $1,000 in 5 years.',
    hook: 'Rates UP → bond prices DOWN (seesaw). Current yield = annual coupon ÷ price.',
    f: 'Annual coupon = Coupon rate × Face value; Current yield = Annual coupon ÷ Market price',
    ex: { p: 'A $1,000 bond with a 5% coupon now trades at $950. Annual coupon and current yield?', s: ['Coupon = 5% × 1,000 = $50 a year (it never changes).', 'Current yield = 50 ÷ 950 = 5.26%.', 'The price fell, probably because market rates rose.'], a: '$50; 5.26%.' },
    qs: [
      Q('If market interest rates rise, the price of an existing fixed-rate bond', ['falls', 'rises', 'stays the same', 'doubles'], 'Its fixed coupon is less attractive than new bonds.', 'Seesaw.'),
      Q('Which bond typically has the lowest default risk?', ['U.S. Treasury bond', 'Junk bond', 'Startup corporate bond', 'Foreign high-yield bond'], 'Backed by the U.S. government.', 'Government.'),
    ],
    gen: () => { const c = pick([2, 3, 4, 5, 6, 7, 8]), p = rnd(85, 115) * 10; return N(`A $1,000 bond pays a ${c}% coupon and trades at $${p}. Current yield?`, pc(c * 10 / p, 2), [`${c}%`, pc(p / c / 10000, 2), pc(c * 10 / 1000 * p / 1000, 2)], 'Annual coupon ÷ market price.', 'Coupon dollars first.'); },
    sc: [
      { x: 'deca', t: 'Retiree client', s: 'Judge (a 67-year-old client): "I need steady income and can\'t stomach big losses. What should I consider?"', q: Q('Strongest recommendation (educational)?', ['A diversified mix weighted toward high-quality bonds or bond funds for income, with some stocks for inflation protection', 'All in one tech stock', 'All in cash under the mattress', 'Crypto only'], 'Income + capital preservation.', 'Steady income.'), say: '"High-quality bonds can give you predictable income, and a smaller slice of stocks helps your money keep up with inflation over a long retirement."' },
    ],
    wild: 'Look up today\'s 10-year Treasury yield. Is it higher or lower than a year ago? What happened to bond prices?',
    links: ['present-value', 'alm', 'fed', 'diversification'] },

  { id: 'funds', g: 'Markets & investing', t: 'Mutual Funds vs ETFs',
    def: 'Both pool many investors\' money into a diversified portfolio. Mutual funds are bought and sold once a day at the closing price (NAV); ETFs trade on an exchange all day like stocks.',
    why: 'They let small investors diversify cheaply. Fees, trading flexibility and taxes differ.',
    an: 'A mutual fund is like ordering from a menu that\'s priced once each evening; an ETF is like a food truck with prices you can see change all day.',
    hook: 'Mutual fund = ONCE a day at NAV. ETF = ALL day on an exchange. Watch the EXPENSE RATIO.',
    f: 'Annual fee = Expense ratio × Amount invested',
    ex: { p: 'You invest $10,000 in a fund with a 0.05% expense ratio vs one with 1.00%. Yearly fees?', s: ['0.05% × 10,000 = $5.', '1.00% × 10,000 = $100.', 'Over decades, high fees can eat a large share of your growth.'], a: '$5 vs $100 a year.' },
    qs: [
      Q('Which can be traded during the day at changing prices?', ['ETFs', 'Mutual funds', 'Both only at night', 'Neither'], 'ETFs trade on exchanges.', 'Like a stock.'),
      Q('An index fund aims to', ['match a market index (like the S&P 500) at low cost', 'beat the market every year', 'pick one stock', 'avoid diversification'], 'Passive investing.', 'Match.'),
    ],
    gen: () => { const a = rnd(1, 50) * 1000, e = pick([0.03, 0.05, 0.1, 0.2, 0.5, 0.75, 1]); return N(`$${a.toLocaleString()} in a fund with a ${e}% expense ratio. Annual fee?`, `$${(a * e / 100).toFixed(2)}`, [`$${(a * e).toFixed(2)}`, `$${(a * e / 10).toFixed(2)}`, `$${(a * e / 1000).toFixed(2)}`], 'Expense ratio × amount (remember % ÷ 100).', 'Percent to decimal.'); },
    sc: [
      { x: 'you', t: 'First investment', s: 'You want to invest $500 in "the whole market" with low fees.', q: Q('Which fits best (educational example)?', ['A broad, low-cost index fund or ETF', 'One trendy stock', 'A fund with a 2% fee', 'A savings bond only'], 'Diversified + cheap.', 'Whole market, low fee.') },
    ],
    wild: 'Find two index funds that track the same index. Compare their expense ratios.',
    links: ['diversification', 'stock-market', 'saa'] },

  { id: 'commodities', g: 'Markets & investing', t: 'Commodities Markets',
    def: 'Markets for raw materials - oil, natural gas, gold, wheat, corn, cattle - traded physically or through futures contracts.',
    why: 'Commodity prices drive costs for many businesses; futures let producers and buyers lock in prices (hedging) and let investors diversify.',
    an: 'A farmer and a bread company agree today on the price of wheat delivered in six months.',
    hook: 'SUPPLY SHOCK (drought, war) → price spikes → costs rise for businesses downstream.',
    ex: { p: 'A drought cuts the corn harvest. What happens next?', s: ['Supply falls → corn prices rise.', 'Feed costs rise for cattle ranchers → beef prices rise.', 'Food companies may hedge with futures or raise prices.'], a: 'Higher corn → higher feed and food costs.' },
    qs: [
      Q('A futures contract is', ['an agreement to buy or sell a commodity at a set price on a future date', 'a type of stock', 'a savings account', 'a bond coupon'], 'Used for hedging and speculation.', 'Set price, future date.'),
      Q('Gold is often bought during uncertain times because', ['investors see it as a store of value', 'it pays high dividends', 'it\'s required by law', 'it never changes price'], 'It pays no income, but holds value in crises.', 'Store of value.'),
    ],
    sc: [
      { x: 'small', t: 'Bakery costs', s: 'Wheat prices jump 30% after poor harvests abroad.', q: Q('How might a bakery respond?', ['Lock in flour prices with suppliers, adjust prices carefully, or adjust recipes', 'Ignore it', 'Buy gold', 'Close immediately'], 'Commodity costs flow into your COGS.', 'Your input cost.') },
    ],
    wild: 'Track gas prices for a month. What news (supply, demand, events) moved them?',
    links: ['hedging', 'diversification', 'variable-cost'] },

  { id: 'diversification', g: 'Markets & investing', t: 'Diversification',
    def: 'Spreading money across many investments, industries and regions so one bad outcome can\'t sink the whole portfolio.',
    why: 'It reduces risk without necessarily reducing expected return - the closest thing to a "free lunch" in investing.',
    an: 'Don\'t put all your eggs in one basket.',
    hook: 'It works best when investments DON\'T move together (low correlation).',
    ex: { p: 'Portfolio A: 100% in one stock. Portfolio B: an index fund of 500 stocks. One company collapses 80%.', s: ['A loses 80%.', 'B: that company is ~0.2% of the fund → loss ≈ 0.16%.', 'Diversification removes company-specific risk; it can\'t remove market-wide risk.'], a: 'A −80% vs B ≈ −0.16%.' },
    qs: [
      Q('Diversification mainly reduces', ['company-specific (unsystematic) risk', 'all market risk', 'taxes', 'fees'], 'Recessions still hit diversified portfolios.', 'One company.'),
      Q('Owning five different tech stocks is', ['less diversified than it looks, because they tend to move together', 'perfectly diversified', 'the same as an index fund', 'risk-free'], 'Correlation matters.', 'Same industry.'),
    ],
    sc: [
      { x: 'deca', t: 'Concentrated employee', s: 'Judge (client): "Most of my savings is in my company\'s stock because I believe in it."', q: Q('Best advice (educational)?', ['Explain the double risk - job and savings tied to one company - and suggest gradually diversifying', 'Buy even more', 'Sell everything today and buy gold', 'Diversification doesn\'t matter'], 'Concentration risk.', 'One basket.'), say: '"If the company struggles, you could lose your paycheck and your savings at the same time - spreading out reduces that risk."' },
    ],
    wild: 'Look at what you depend on for money (one job? one client?). How diversified are your income sources?',
    links: ['saa', 'funds', 'risk-mgmt'] },

  { id: 'esg', g: 'Markets & investing', t: 'Ethical Investing (ESG)',
    def: 'Considering environmental, social and governance factors alongside financial returns when investing.',
    why: 'Some investors want their money to match their values; others use ESG to spot long-term risks (pollution fines, bad governance).',
    an: 'Choosing a restaurant not just for taste but because it treats workers well and sources responsibly.',
    hook: 'E = Environment (emissions). S = Social (workers, communities). G = Governance (board, ethics, pay).',
    ex: { p: 'Classify: carbon emissions, worker safety record, independent board.', s: ['Carbon emissions → Environmental.', 'Worker safety → Social.', 'Independent board → Governance.'], a: 'E, S, G.' },
    qs: [
      Q('Board independence and executive pay practices are part of', ['governance (G)', 'environmental (E)', 'social (S)', 'none of these'], 'G = how the company is run.', 'Run the company.'),
      Q('One criticism of ESG ratings is that', ['different providers often rate the same company very differently', 'they\'re always identical', 'they\'re required by every law', 'they measure only profit'], 'Methods vary.', 'Consistency.'),
    ],
    sc: [
      { x: 'deca', t: 'Values-based client', s: 'Judge (client): "I want my retirement money to avoid fossil fuels but still grow."', q: Q('Best response (educational)?', ['Explain ESG-screened diversified funds, compare their fees and performance, and note tradeoffs', 'Say it\'s impossible', 'Put it all in one solar stock', 'Ignore their values'], 'Respect values + diversify.', 'Values + diversification.'), say: '"There are diversified funds that screen out fossil fuels - let\'s compare their fees and track records so your values and your goals both get met."' },
    ],
    wild: 'Look up an ESG rating for a company you know. Do you agree with it?',
    links: ['ethics', 'shv', 'diversification'] },

  { id: 'capital-gains', g: 'Markets & investing', t: 'Capital Gains & Losses',
    def: 'The profit (gain) or loss when you sell an asset - stocks, real estate - for more or less than you paid. Held more than 1 year = long-term (lower tax rates); 1 year or less = short-term (taxed like income).',
    why: 'Taxes change what you actually keep, and holding periods can make a big difference.',
    an: 'Buy a card for $20, sell it for $50: your $30 profit is a capital gain.',
    hook: '> 1 YEAR = LONG-term (lower rate). Losses offset gains (and up to $3,000 of other income per year).',
    f: 'Capital gain = Sale price − Cost basis',
    ex: { p: 'You bought shares for $2,000 and sold them 18 months later for $3,200. What kind of gain?', s: ['Gain = 3,200 − 2,000 = $1,200.', 'Held 18 months > 1 year → long-term capital gain.', 'Taxed at long-term rates (0%, 15% or 20% depending on income).'], a: '$1,200 long-term gain.' },
    qs: [
      Q('Selling a stock 8 months after buying it at a profit creates a', ['short-term capital gain, taxed as ordinary income', 'long-term capital gain', 'tax-free gain', 'capital loss'], 'One year or less = short-term.', 'How long held?'),
      Q('Capital losses can be used to', ['offset capital gains (and up to $3,000 of ordinary income a year)', 'increase taxes', 'buy more stock tax-free', 'nothing'], 'Tax-loss harvesting.', 'Offset.'),
    ],
    gen: () => { const b = rnd(5, 60) * 100, s = Math.max(100, b + rnd(-20, 40) * 50), m = pick([3, 6, 11, 13, 18, 30]); const g = s - b; return Q(`Bought for $${b.toLocaleString()}, sold for $${s.toLocaleString()} after ${m} months. Result?`, [`${g >= 0 ? 'Gain' : 'Loss'} of $${Math.abs(g).toLocaleString()}, ${m > 12 ? 'long' : 'short'}-term`, `${g >= 0 ? 'Gain' : 'Loss'} of $${Math.abs(g).toLocaleString()}, ${m > 12 ? 'short' : 'long'}-term`, `${g >= 0 ? 'Loss' : 'Gain'} of $${Math.abs(g).toLocaleString()}, ${m > 12 ? 'long' : 'short'}-term`, `${g >= 0 ? 'Gain' : 'Loss'} of $${(s + b).toLocaleString()}, ${m > 12 ? 'long' : 'short'}-term`], 'Sale − cost; more than 12 months = long-term.', 'Two questions: how much, how long.'); },
    sc: [
      { x: 'you', t: 'Timing a sale', s: 'You\'re up $800 on a stock you bought 11 months ago and want to sell.', q: Q('What tax fact is worth knowing?', ['Waiting a bit over a month makes it long-term, usually taxed at a lower rate', 'Gains are never taxed', 'Selling now avoids all tax', 'Short-term rates are always lower'], 'Holding period matters. (Educational, not tax advice.)', '12-month line.') },
    ],
    wild: 'Think of something you could resell (sneakers, cards). What would your "capital gain" be?',
    links: ['tax-opt', 'stock-market', 'diversification'] },

  // ---------- Rules & ethics ----------
  { id: 'sec', g: 'Rules & ethics', t: 'Securities and Exchange Commission (SEC)',
    def: 'The federal agency that protects investors, keeps markets fair and orderly, and makes public companies disclose accurate information.',
    why: 'Investors trust markets because companies must report honestly and insider trading and fraud are punished.',
    an: 'The referee of the stock market.',
    hook: '10-K = annual report. 10-Q = quarterly. 8-K = major event. S-1 = IPO registration.',
    ex: { p: 'A public company\'s CEO resigns suddenly. What must the company do?', s: ['It\'s a material event → file an 8-K with the SEC promptly.', 'Investors everywhere get the news at the same time.', 'Executives can\'t trade on the news before it\'s public (insider trading).'], a: 'File an 8-K; no trading on inside information.' },
    qs: [
      Q('Which filing is a public company\'s detailed annual report?', ['10-K', '10-Q', '8-K', 'W-2'], '10-Q is quarterly, 8-K is for major events.', 'Annual.'),
      Q('Insider trading is', ['trading based on material, nonpublic information', 'any trade by an employee', 'trading at night', 'buying index funds'], 'Employees can trade legally when they don\'t have inside information and follow rules.', 'Nonpublic info.'),
    ],
    sc: [
      { x: 'you', t: 'The overheard tip', s: 'Your friend\'s parent, a company executive, mentions a merger that hasn\'t been announced.', q: Q('Can you buy the stock?', ['No - trading on material nonpublic information is illegal insider trading, even as a "tippee"', 'Yes, you\'re not an employee', 'Yes, if you buy small', 'Only after school'], 'Tippees can be liable too.', 'Nonpublic.') },
    ],
    wild: 'Search SEC EDGAR for a company you know. Open its latest 10-K and find the "Risk Factors" section.',
    links: ['compliance', 'ethics', 'stock-market'] },

  { id: 'compliance', g: 'Rules & ethics', t: 'Compliance in Financial Services',
    def: 'Following the laws and rules that govern financial firms: anti-money laundering (AML), know-your-customer (KYC), privacy, insider trading rules and consumer protection.',
    why: 'Breaking them brings fines, lost licenses and lost trust. Compliance teams monitor, train and report.',
    an: 'The safety inspector for a bank.',
    hook: 'KYC = know who your customer is. AML = watch where the money comes from. Cash over $10,000 → a Currency Transaction Report.',
    ex: { p: 'A new customer deposits $9,500 in cash three days in a row. What should the bank do?', s: ['Pattern of deposits just under $10,000 = possible "structuring" to avoid reporting.', 'The bank should file a Suspicious Activity Report (SAR).', 'Staff must not tip off the customer.'], a: 'File a SAR.' },
    qs: [
      Q('Know Your Customer (KYC) rules require financial firms to', ['verify customers\' identities', 'know their customers\' hobbies', 'share data publicly', 'avoid all customers'], 'Prevents fraud and money laundering.', 'Identity.'),
      Q('Breaking up cash deposits to avoid the $10,000 reporting rule is called', ['structuring', 'hedging', 'diversifying', 'refinancing'], 'Structuring is itself illegal.', 'Just under the limit.'),
    ],
    sc: [
      { x: 'big', t: 'New technology', s: 'Summit Bank (fictional) wants to use AI to monitor transactions for money laundering.', q: Q('What compliance consideration matters most?', ['The system must be accurate, explainable to regulators and protect customer privacy', 'It should flag everyone', 'It should replace all staff', 'It doesn\'t need testing'], 'Tech helps compliance but must meet rules.', 'Explainable and private.') },
    ],
    wild: 'Notice the next time an app asks for ID to open an account - that\'s KYC in action.',
    links: ['sec', 'consumer-protection', 'payroll-tax'] },

  { id: 'fiduciary', g: 'Rules & ethics', t: 'Fiduciary Duty',
    def: 'A legal duty to act in the client\'s best interest - putting their interests ahead of your own, disclosing conflicts and acting with care.',
    why: 'Clients trust advisors with their savings. Fiduciaries (like registered investment advisers and trustees) are held to the highest standard.',
    an: 'A doctor must recommend the treatment that\'s best for you, not the one that pays them the most.',
    hook: 'Fiduciary = CLIENT FIRST, DISCLOSE conflicts, act with CARE and LOYALTY.',
    ex: { p: 'Two similar funds: Fund A costs 0.1% a year; Fund B costs 1.2% but pays the advisor a commission. What must a fiduciary do?', s: ['Compare: same goal, B costs 12× more.', 'Recommend A unless B is genuinely better for the client.', 'Disclose any conflict of interest.'], a: 'Recommend the better-for-client option and disclose conflicts.' },
    qs: [
      Q('A fiduciary advisor must', ['act in the client\'s best interest', 'sell the highest-commission product', 'guarantee returns', 'hide fees'], 'Duty of loyalty and care.', 'Client first.'),
      Q('Which is a conflict of interest an advisor must disclose?', ['Earning a bonus for selling a particular fund', 'Having a college degree', 'Working in an office', 'Using a calculator'], 'Disclosure lets clients judge advice.', 'Advisor benefits.'),
    ],
    sc: [
      { x: 'deca', t: 'Financial Consulting roleplay', s: 'Judge (client): "Your firm\'s fund has higher fees than an index fund. Why should I buy it?"', q: Q('Strongest, ethical response?', ['Be transparent: compare costs and benefits honestly and recommend what fits their goals - even if it\'s not your firm\'s fund', 'Insist your fund is always better', 'Avoid the question', 'Offer a gift to close'], 'Trust wins roleplays and careers.', 'Fiduciary.'), say: '"You\'re right to ask. Here\'s the cost difference and what you\'d get for it - if the index fund fits your goals better, that\'s what I\'d recommend."' },
    ],
    wild: 'Next time someone recommends something to you, ask: do they benefit from my choice? That\'s spotting conflicts of interest.',
    links: ['ethics', 'compliance', 'funds'] },

  { id: 'ethics', g: 'Rules & ethics', t: 'Financial Ethics',
    def: 'The standards of honesty, fairness and responsibility for people in finance and accounting: accurate reporting, no conflicts of interest, no misuse of information.',
    why: 'Finance runs on trust. Ethical failures (Enron, WorldCom) destroyed companies and led to laws like Sarbanes-Oxley.',
    an: 'A referee who secretly bets on the game ruins the sport for everyone.',
    hook: 'Ethics test: Is it LEGAL? Is it FAIR? Would I be OK if it were on the FRONT PAGE?',
    ex: { p: 'Your manager asks you to record next month\'s sales this month to hit a target. What do you do?', s: ['That\'s misstating revenue - against accrual rules and possibly fraud.', 'Raise it respectfully: explain the rule and the risk.', 'If pressured, escalate through the proper channel (compliance, ethics hotline).'], a: 'Refuse, explain and escalate if needed.' },
    qs: [
      Q('Sarbanes-Oxley (2002) was passed after accounting scandals to', ['improve the accuracy and accountability of corporate financial reporting', 'cut taxes', 'regulate crypto', 'create the Fed'], 'CEOs and CFOs must certify statements.', 'After Enron.'),
      Q('Which is an ethical red flag?', ['"Let\'s just not mention the fee to the client."', 'Double-checking numbers', 'Disclosing a conflict', 'Following policy'], 'Hiding material information.', 'Hiding.'),
    ],
    sc: [
      { x: 'small', t: 'Cooking the books', s: 'A small business owner asks their bookkeeper to make profits look bigger before applying for a bank loan.', q: Q('Best response?', ['Decline - it\'s loan fraud - and help present accurate numbers with a strong plan', 'Do it quietly', 'Do it but only a little', 'Quit without explanation'], 'Honesty + a solution.', 'Front page test.') },
    ],
    wild: 'Think of a time you saw a "small" ethical shortcut. What would the front-page test say?',
    links: ['fiduciary', 'sec', 'expense-audit', 'esg'] },

  { id: 'consumer-protection', g: 'Rules & ethics', t: 'Identity Theft & Consumer Protection',
    def: 'Laws and habits that protect people\'s financial data and shield them from deceptive lending: free credit reports, credit freezes, fraud alerts, truth-in-lending disclosures and the CFPB.',
    why: 'Identity theft can ruin credit for years. Knowing your rights lets you respond fast.',
    an: 'Locking your front door, and knowing whom to call if someone breaks in.',
    hook: 'FREEZE your credit (free at all 3 bureaus), REPORT at IdentityTheft.gov, CHECK your reports regularly.',
    ex: { p: 'You learn your data was in a company breach. What should you do?', s: ['Freeze your credit at Equifax, Experian and TransUnion (free).', 'Change passwords and turn on two-factor authentication.', 'Check your credit reports for accounts you didn\'t open.', 'If fraud happened, report it at IdentityTheft.gov.'], a: 'Freeze, secure, check, report.' },
    qs: [
      Q('A credit freeze', ['blocks new creditors from seeing your report, so thieves can\'t open accounts', 'lowers your credit score', 'closes your existing cards', 'costs $100 a year'], 'It\'s free and doesn\'t affect your score.', 'Lock.'),
      Q('The Truth in Lending Act requires lenders to', ['clearly disclose the APR and total cost of credit', 'lend to everyone', 'charge no interest', 'hide fees'], 'Lets consumers compare loans.', 'Disclose.'),
    ],
    sc: [
      { x: 'you', t: 'Suspicious text', s: 'A text says "Your bank account is locked - click here and enter your login."', q: Q('What should you do?', ['Don\'t click; contact the bank using the number on your card or official app', 'Click and log in quickly', 'Reply with your password', 'Forward it to friends'], 'Phishing.', 'Use a known channel.') },
    ],
    wild: 'Check whether your email was in a data breach (search "have I been pwned"), and turn on two-factor authentication for your main accounts.',
    links: ['credit-scores', 'compliance'] },

  // ---------- Economy ----------
  { id: 'fed', g: 'Economy', t: 'The Federal Reserve System',
    def: 'The U.S. central bank. It sets monetary policy to pursue maximum employment and stable prices (about 2% inflation), mainly by setting a target for the federal funds rate.',
    why: 'Its decisions ripple into every loan rate, savings rate, stock and bond price.',
    an: 'The economy\'s thermostat: it turns up rates to cool things down and lowers them to warm things up.',
    hook: 'INFLATION high → RAISE rates. RECESSION → CUT rates. Tools: fed funds target, open market operations, interest on reserves, discount rate.',
    ex: { p: 'Inflation is 6% and rising. What does the Fed likely do and what follows?', s: ['The FOMC raises the federal funds rate target.', 'Loan and mortgage rates rise → borrowing and spending slow.', 'Demand cools → inflation falls over time. Bond prices fall; savings rates rise.'], a: 'Raise rates → slower borrowing → lower inflation.' },
    qs: [
      Q('The Fed\'s "dual mandate" is', ['maximum employment and stable prices', 'high stock prices and low taxes', 'balanced budgets and trade', 'fixed exchange rates'], 'Set by Congress.', 'Two goals.'),
      Q('Buying government bonds in open market operations tends to', ['add money to the banking system and push rates down', 'raise interest rates', 'raise taxes', 'shrink the money supply'], 'The Fed pays with new reserves.', 'Money in.'),
    ],
    sc: [
      { x: 'small', t: 'Rate hike', s: 'The Fed raises rates by 0.75%. A furniture store relies on customers financing purchases.', q: Q('What should the store expect?', ['Fewer financed purchases as loans get pricier - plan for slower sales', 'Sales double', 'No effect', 'Lower costs'], 'Rate-sensitive businesses feel it first.', 'Borrowing costs.') },
      { x: 'you', t: 'Your savings', s: 'The Fed has raised rates for a year.', q: Q('What likely happened to high-yield savings account rates?', ['They rose', 'They fell to zero', 'They stayed exactly the same', 'They became negative'], 'Savers benefit from higher rates.', 'Rates up.') },
    ],
    wild: 'Find the date of the next FOMC meeting. After it, check what happened to mortgage rates.',
    links: ['business-cycle', 'bonds', 'banks'] },

  { id: 'business-cycle', g: 'Economy', t: 'The Business Cycle',
    def: 'The economy\'s repeating pattern of expansion, peak, contraction (recession) and trough.',
    why: 'Businesses adjust hiring, inventory, prices and investment depending on the phase - and investors adjust risk.',
    an: 'Seasons: spring growth, summer peak, fall slowdown, winter low - then spring again.',
    hook: 'E-P-C-T: Expansion, Peak, Contraction, Trough.',
    ex: { p: 'Unemployment is rising, GDP fell two quarters in a row, and stores are discounting. What phase? What should a business do?', s: ['Phase: contraction (recession).', 'Conserve cash, control costs, manage inventory carefully.', 'Strong companies may invest or acquire cheaply, preparing for recovery.'], a: 'Contraction - protect cash, prepare for recovery.' },
    qs: [
      Q('Which phase has rising GDP, falling unemployment and growing confidence?', ['Expansion', 'Contraction', 'Trough', 'Peak'], 'Growth phase.', 'Growing.'),
      Q('Defensive businesses that hold up well in recessions include', ['groceries and utilities', 'luxury cars', 'cruise lines', 'fancy restaurants'], 'People still buy essentials.', 'Essentials.'),
    ],
    sc: [
      { x: 'big', t: 'Late expansion', s: 'The economy has grown for 8 years; unemployment is very low and wages are rising fast. A manufacturer (fictional) plans a huge new factory with debt.', q: Q('What risk should it weigh?', ['A peak may be near - a downturn could hit just as debt payments start', 'There are no risks', 'Rates will certainly fall', 'Demand always rises'], 'Cycle timing matters for leverage.', 'What comes after a peak?') },
    ],
    wild: 'Ask an adult what the economy felt like in 2008-2009 or 2020. Which phase was it?',
    links: ['fed', 'fin-leverage', 'cost-control'] },

  { id: 'banks', g: 'Economy', t: 'Banks & Financial Institutions', added: 'Added: the exam\'s "role of financial institutions" indicators.',
    def: 'Organizations that move money between savers and borrowers or manage risk: commercial banks, credit unions, investment banks, insurers, brokerages.',
    why: 'They make lending, saving, investing and payments possible. Knowing who does what is core exam content.',
    an: 'Banks are the plumbing of the economy - you only notice them when something clogs.',
    hook: 'Commercial bank = deposits & loans. Credit union = member-owned. Investment bank = raises capital & advises deals. FDIC insures deposits up to $250k.',
    ex: { p: 'Match: a company going public, a family\'s savings account, a member-owned lender.', s: ['Going public → investment bank (underwriting the IPO).', 'Savings account → commercial bank (FDIC-insured).', 'Member-owned → credit union (NCUA-insured).'], a: 'Investment bank, commercial bank, credit union.' },
    qs: [
      Q('Which institution is owned by its members?', ['Credit union', 'Commercial bank', 'Investment bank', 'The Fed'], 'Often lower fees and better rates.', 'Members.'),
      Q('FDIC insurance protects', ['bank deposits up to $250,000 per depositor, per bank, per ownership category', 'stock investments', 'all money in any account', 'crypto'], 'Investments aren\'t FDIC insured.', 'Deposits.'),
    ],
    sc: [
      { x: 'you', t: 'Choosing an account', s: 'You\'re opening your first checking account.', q: Q('What should you compare?', ['Fees, minimum balance, ATM access, FDIC/NCUA insurance and the app', 'Only the logo', 'Only the interest on checking', 'Nothing - they\'re all the same'], 'Fees eat small balances.', 'Fees + safety.') },
    ],
    wild: 'Compare the fees of a big bank and a credit union near you.',
    links: ['fed', 'alm', 'insurance'] },

  // ---------- Personal finance ----------
  { id: 'credit-scores', g: 'Personal finance', t: 'Credit Scores & Reports',
    def: 'A credit report lists your borrowing history; a credit score (e.g., FICO, 300-850) summarizes it into a number lenders use to approve loans and set rates.',
    why: 'Your score affects loan rates, apartment approvals, even some job and insurance decisions.',
    an: 'A report card for how you handle borrowed money.',
    hook: 'FICO: Payment history 35%, Amounts owed 30%, Length 15%, New credit 10%, Mix 10%. Pay on time; keep utilization under 30%.',
    f: 'Credit utilization = Card balances ÷ Credit limits',
    ex: { p: 'You have a $1,000 limit and a $600 balance. What\'s your utilization and how could you improve it?', s: ['Utilization = 600 ÷ 1,000 = 60% (high).', 'Pay it down below $300 (30%), ideally under $100 (10%).', 'Pay before the statement date so a lower balance gets reported.'], a: '60% → aim under 30%.' },
    qs: [
      Q('The biggest factor in a FICO score is', ['payment history', 'income', 'age', 'number of bank accounts'], '35% of the score.', 'Paying on time.'),
      Q('Checking your own credit report', ['doesn\'t hurt your score (it\'s a soft inquiry)', 'lowers your score a lot', 'is illegal', 'costs $500'], 'Free reports at AnnualCreditReport.com.', 'Soft pull.'),
    ],
    gen: () => { const l = rnd(5, 50) * 100, b = Math.round(l * rnd(5, 90) / 100); return N(`Credit limit $${l.toLocaleString()}, balance $${b.toLocaleString()}. Utilization?`, pc(b / l, 0), [pc(l / b / 10, 0), pc((l - b) / l, 0), pc(b / l / 2, 0)], 'Balance ÷ limit.', 'Divide.'); },
    sc: [
      { x: 'you', t: 'Building credit at 18', s: 'You\'re 18 with no credit history and want a good score by the time you rent an apartment.', q: Q('What\'s a smart plan?', ['Get a starter or secured card, use it lightly, autopay in full every month', 'Open five cards at once', 'Max out one card', 'Avoid all credit forever'], 'Small, on-time, low utilization.', 'History takes time.') },
    ],
    wild: 'Learn where to get your free credit reports (AnnualCreditReport.com) for when you turn 18.',
    links: ['consumer-protection', 'compound-interest', 'credit-risk'] },

  { id: 'retirement-accts', g: 'Personal finance', t: 'Retirement Accounts (401(k), IRA, Roth)', added: 'Added: needed for the Financial Consulting event and the exam\'s retirement-planning indicators.',
    def: 'Tax-advantaged accounts for long-term saving. Traditional 401(k)/IRA: tax break now, taxed when withdrawn. Roth: taxed now, tax-free withdrawals in retirement. Many employers match 401(k) contributions.',
    why: 'Tax advantages plus decades of compounding are the main way most people build retirement wealth.',
    an: 'A traditional account says "pay the tax later"; a Roth says "pay it now, never again on the growth."',
    hook: 'ALWAYS take the employer MATCH (it\'s an instant return). Roth = tax NOW, free LATER.',
    ex: { p: 'Your employer matches 50% of contributions up to 6% of your $40,000 salary. How much do you get if you contribute 6%?', s: ['You contribute 6% × 40,000 = $2,400.', 'Match = 50% × 2,400 = $1,200 free.', 'That\'s an instant 50% return before any investment growth.'], a: '$1,200 a year of free money.' },
    qs: [
      Q('A Roth IRA is often attractive for young people because', ['they\'re likely in a low tax bracket now, and growth is tax-free later', 'it has no rules', 'it guarantees returns', 'it\'s only for retirees'], 'Pay tax while it\'s low.', 'Tax now vs later.'),
      Q('Not contributing enough to get a full employer match means', ['leaving free money on the table', 'saving on taxes', 'nothing', 'a higher salary'], 'The match is part of your pay.', 'Free money.'),
    ],
    gen: () => { const s = rnd(30, 90) * 1000, m = pick([50, 100]), c = pick([3, 4, 5, 6]); return N(`Salary ${$(s)}. Employer matches ${m}% of your contributions up to ${c}% of salary. You contribute ${c}%. Annual match?`, $(s * c / 100 * m / 100), [$(s * c / 100), $(s * m / 100), $(s * c / 100 * m / 200)], 'Your contribution × match %.', 'Contribution first.'); },
    sc: [
      { x: 'deca', t: 'Financial Consulting: retiring owner', s: 'Judge (58-year-old business owner): "Most of my wealth is in my business. How do I build retirement savings before I sell?"', q: Q('Strongest suggestion (educational)?', ['Use business retirement plans (like a SEP-IRA or solo/company 401(k)), make catch-up contributions, and diversify sale proceeds', 'Keep everything in the business', 'Buy lottery tickets', 'Wait until 70'], 'Tax-advantaged saving + diversification before the exit.', 'Accounts + diversify.'), say: '"Before you sell, let\'s shelter more income in a business retirement plan using catch-up contributions, then diversify the sale proceeds so your retirement doesn\'t depend on one asset."' },
    ],
    wild: 'If you have a job, ask whether it offers a 401(k) and match. If you have earned income, learn how a Roth IRA works.',
    links: ['compound-interest', 'tvm', 'saa', 'diversification'] },

  { id: 'budget-networth', g: 'Personal finance', t: 'Budgeting & Net Worth', added: 'Added: core personal finance indicators on the exam.',
    def: 'A budget plans income and spending before the month starts; net worth = what you own − what you owe.',
    why: 'Every financial plan - personal or business - starts with knowing where money goes and where you stand.',
    an: 'A budget is a map of where your money will go; net worth is the "you are here" pin.',
    hook: '50/30/20: needs / wants / savings & debt payoff. Pay yourself FIRST.',
    f: 'Net worth = Assets − Liabilities',
    ex: { p: 'Take-home pay $2,400 a month. Apply 50/30/20.', s: ['Needs: 50% = $1,200.', 'Wants: 30% = $720.', 'Savings & debt payoff: 20% = $480 (automate it on payday).'], a: '$1,200 / $720 / $480.' },
    qs: [
      Q('"Pay yourself first" means', ['automatically saving on payday before spending', 'buying something fun first', 'paying bills late', 'giving yourself a raise'], 'Saving happens before temptation.', 'First transfer.'),
      Q('Which increases net worth?', ['Earning more and saving it', 'Buying a TV on credit', 'Spending savings on wants', 'Taking a loan to buy clothes'], 'Saving new income raises assets without adding liabilities. (Paying debt with savings lowers both sides equally.)', 'More own, less owe.'),
    ],
    gen: () => { const p = rnd(15, 60) * 100; return N(`Take-home pay $${p.toLocaleString()} a month. Using 50/30/20, how much goes to savings and debt payoff?`, $(p * 0.2), [$(p * 0.3), $(p * 0.5), $(p * 0.02)], '20% of take-home pay.', '20%.'); },
    sc: [
      { x: 'you', t: 'First job budget', s: 'You take home $1,600 a month and spend about $1,550 with nothing saved.', q: Q('Best first move?', ['Track spending for a month, cut a few wants, and automate even $100 to savings', 'Get a credit card for the gap', 'Stop eating', 'Ignore it'], 'Small automatic savings build the habit.', 'Track, then automate.') },
    ],
    wild: 'Write a 50/30/20 budget for your real or expected income this month.',
    links: ['acct-eq', 'working-cap', 'compound-interest'] },

  { id: 'insurance', g: 'Personal finance', t: 'The Insurance Industry',
    def: 'Insurers pool premiums from many people to pay the few who suffer losses. Key terms: premium (what you pay), deductible (what you pay first on a claim), policy limit (the most they\'ll pay).',
    why: 'Insurance transfers risks you can\'t afford to carry - a house fire, a lawsuit, a serious illness.',
    an: 'Everyone puts $5 in a jar; whoever\'s bike gets stolen gets a new one from the jar.',
    hook: 'Higher DEDUCTIBLE → lower PREMIUM. Insure what would RUIN you, not every small loss.',
    ex: { p: 'Policy A: $1,500 premium, $250 deductible. Policy B: $1,050 premium, $1,000 deductible. Which is better if you rarely file claims?', s: ['B saves $450 a year in premiums.', 'If you file one claim, you pay $750 more out of pocket with B.', 'If claims are rare (less than about one every 1.7 years), B costs less over time - if you can afford the $1,000.'], a: 'B, if you can cover the higher deductible.' },
    qs: [
      Q('The law of large numbers lets insurers', ['predict total losses across many policyholders', 'avoid paying claims', 'guarantee no losses', 'set premiums randomly'], 'Pooling makes losses predictable.', 'Many people.'),
      Q('A deductible is', ['the amount you pay before insurance pays', 'the monthly premium', 'the insurer\'s profit', 'the maximum payout'], 'Higher deductible = lower premium.', 'You pay first.'),
    ],
    sc: [
      { x: 'small', t: 'Bakery coverage', s: 'A bakery owner asks which insurance matters most.', q: Q('Which risks are most important to cover?', ['Property (fire), general liability (customer injuries) and workers\' compensation', 'Insurance on the cupcakes only', 'None - it\'s a small business', 'Only life insurance for customers'], 'Cover what could ruin the business.', 'Ruinous risks.') },
    ],
    wild: 'Ask what deductible your family\'s car insurance has. Would a higher one make sense?',
    links: ['risk-mgmt', 'hedging', 'banks'] },

  // ---------- Business decisions ----------
  { id: 'debt-vs-equity', g: 'Business decisions', t: 'Debt vs Equity Financing',
    def: 'Borrowing money (debt) that must be repaid with interest, vs selling ownership (equity) in exchange for money - giving up a share of profits and control.',
    why: 'It\'s one of the most common roleplay decisions: fund growth without taking on dangerous debt or giving away too much of the company.',
    an: 'Borrowing $1,000 from your parents to pay back vs giving a friend 25% of your business forever for $1,000.',
    hook: 'DEBT: keep CONTROL, must REPAY. EQUITY: no repayment, but you SHARE profits and control.',
    ex: { p: 'A café owner needs $100k. A bank offers a 5-year loan at 8%; an investor wants 25% ownership. The café earns $80k a year. Compare.', s: ['Debt: payments ≈ $24k a year for 5 years; owner keeps 100%.', 'Equity: no payments, but 25% of profits forever (≈ $20k a year now, more as it grows).', 'If cash flow comfortably covers $24k, debt is usually cheaper long-term.'], a: 'Debt if cash flow covers it; equity if cash is tight or risk is high.' },
    qs: [
      Q('Which is an advantage of equity financing?', ['No required repayments', 'The owner keeps full control', 'Interest is tax-deductible', 'It\'s always cheaper'], 'Investors share risk.', 'No payments.'),
      Q('Interest on business debt is generally', ['tax-deductible', 'illegal', 'paid to shareholders', 'never charged'], 'One reason debt is cheaper.', 'Deductible.'),
    ],
    sc: [
      { x: 'deca', t: 'Funding expansion', s: 'Judge (owner of a growing landscaping company): "I need $150k for trucks. Should I take a loan or bring in a partner?"', q: Q('Strongest response?', ['Compare loan payments to cash flow and seasonality; if payments are safely covered, recommend debt to keep ownership - otherwise a partner', 'Always take a partner', 'Always take the loan', 'Don\'t expand'], 'Tie the choice to their numbers and goals.', 'Can cash flow cover payments?'), say: '"If your off-season cash can cover about $3,000 a month in payments, a loan lets you keep 100% of your company. If not, a partner shares the risk - but also your profits."' },
    ],
    wild: 'Watch an episode of a pitch show: when founders give up equity, ask whether a loan would have been better.',
    links: ['capital-structure', 'fin-leverage', 'wacc'] },

  { id: 'risk-mgmt', g: 'Business decisions', t: 'Risk Management (Pure vs Speculative)',
    def: 'Identifying, measuring and responding to risks. Pure risk = only loss or no loss (fire, theft). Speculative risk = loss OR gain (investing, launching a product). Responses: avoid, reduce, transfer, retain.',
    why: 'Exam and roleplay questions ask you to name the risk type and the best response.',
    an: 'Pure: your bike might get stolen (no upside). Speculative: you buy sneakers to resell (could win or lose).',
    hook: 'ART-R: Avoid, Reduce, Transfer, Retain. Insurance covers PURE risk only.',
    ex: { p: 'Classify and respond: (1) warehouse fire, (2) launching a new product, (3) small equipment breakdowns.', s: ['Fire = pure → transfer (insurance) + reduce (sprinklers).', 'New product = speculative → reduce with testing; can\'t insure it.', 'Small breakdowns = pure but minor → retain (pay as they come).'], a: 'Transfer/reduce; reduce; retain.' },
    qs: [
      Q('Which is a speculative risk?', ['Investing in a new store', 'A flood', 'Employee injury', 'Theft'], 'It could gain or lose.', 'Chance of gain?'),
      Q('Installing a sprinkler system is risk', ['reduction', 'transfer', 'avoidance', 'retention'], 'Lowers the size of a loss.', 'Make it smaller.'),
    ],
    sc: [
      { x: 'small', t: 'Food truck risks', s: 'A food truck owner worries about a kitchen fire, a customer getting sick and a slow season.', q: Q('Which can be insured?', ['The fire and customer illness (liability) - the slow season is a business (speculative) risk', 'All three', 'None', 'Only the slow season'], 'Insurance covers pure risks.', 'Pure vs speculative.') },
    ],
    wild: 'List three risks in your life. Which response (avoid, reduce, transfer, retain) do you use for each?',
    links: ['insurance', 'hedging', 'credit-risk', 'raroc'] },

  { id: 'cost-control', g: 'Business decisions', t: 'Managerial Cost Control',
    def: 'Continuously tracking costs against budgets, finding waste and cutting costs that don\'t create value - without hurting quality or customers.',
    why: 'A dollar saved goes straight to profit; in low-margin businesses, cost control decides survival.',
    an: 'Turning off lights in empty rooms - not turning off the heat in winter.',
    hook: 'CUT waste, KEEP value. Measure → compare to budget → find the cause → fix → re-measure.',
    ex: { p: 'A restaurant\'s food costs jumped from 30% to 36% of sales. How do you control it?', s: ['Measure: which items or shifts drove it?', 'Causes: supplier price increases, waste, over-portioning, theft?', 'Fix: renegotiate, standardize portions, track waste daily.', 'Re-measure weekly until back near 30%.'], a: 'Find the cause, fix it, track it.' },
    qs: [
      Q('A restaurant with a 5% net margin saves $10,000 in costs. To earn the same extra profit from sales, it would need', ['$200,000 more in sales', '$10,000 more in sales', '$50,000 more', '$500 more'], '10,000 ÷ 5% = 200,000.', 'Divide by margin.'),
      Q('Which cost cut is most likely to backfire?', ['Cutting food quality customers notice', 'Fixing a leaky faucet', 'Renegotiating a supplier contract', 'Reducing food waste'], 'Cut waste, not value.', 'What do customers value?'),
    ],
    gen: () => { const s = rnd(1, 20) * 1000, m = pick([2, 4, 5, 8, 10, 20]); return N(`A company with a ${m}% net margin cuts costs by ${$(s)}. How much extra revenue would produce the same extra profit?`, $(s / (m / 100)), [$(s * m / 100), $(s), $(s * m)], 'Savings ÷ net margin.', 'Each sale only keeps the margin.'); },
    sc: [
      { x: 'big', t: 'Across-the-board cuts', s: 'A CEO at Harbor Hotels (fictional) proposes cutting every department\'s budget 15%.', q: Q('What\'s a better approach?', ['Target cuts using data - cut waste and low-return spending, protect what drives revenue', 'Cut 15% everywhere', 'Cut only sales', 'Cut nothing'], 'Smart cost control is selective.', 'Value vs waste.') },
    ],
    wild: 'Find one "leak" in your own spending (a subscription, fees). How much would it save in a year?',
    links: ['zbb', 'variance', 'expense-audit', 'benchmarking'] },

  { id: 'liquidation', g: 'Business decisions', t: 'Asset Liquidation',
    def: 'Converting assets into cash quickly - often at a discount - to pay debts or close a business. In Chapter 7 bankruptcy, assets are sold and proceeds go to creditors in priority order.',
    why: 'Fast sales usually fetch less than full value ("fire sale"), and owners are paid last.',
    an: 'Selling your stuff the day before you move - you take whatever you can get.',
    hook: 'Payment ORDER: secured creditors → unsecured creditors → shareholders (LAST).',
    ex: { p: 'A failing store has assets worth $500k in an orderly sale. It must sell in 30 days. Debts: $300k secured, $250k unsecured.', s: ['Fire-sale discount (say 30%) → $350k.', 'Secured creditors get $300k first.', 'Unsecured get the remaining $50k (20¢ per dollar).', 'Shareholders get nothing.'], a: 'Secured paid in full; unsecured get 20%; owners get $0.' },
    qs: [
      Q('In liquidation, who is usually paid last?', ['Shareholders (owners)', 'Secured lenders', 'Employees owed wages', 'Tax authorities'], 'Equity is the residual claim.', 'Owners.'),
      Q('Liquidating quickly usually means', ['selling assets below full value', 'getting a premium price', 'paying no one', 'raising new equity'], 'Speed costs value.', 'Fire sale.'),
    ],
    sc: [
      { x: 'small', t: 'Closing a shop', s: 'A clothing shop owner must close. They can liquidate everything this week or take 3 months to sell inventory and equipment carefully.', q: Q('What\'s the tradeoff?', ['Faster = less money but stops ongoing costs; slower = more money but more rent and risk', 'No difference', 'Faster always gets more', 'Slower always loses'], 'Weigh discount vs carrying costs.', 'Speed vs value.') },
    ],
    wild: 'Watch for a "going out of business" sale. Notice how big the discounts are - that\'s the liquidation discount.',
    links: ['restructuring', 'working-cap', 'debt-vs-equity'] },

  { id: 'fim', g: 'Business decisions', t: 'Financial-Information Management',
    def: 'Collecting, organizing, analyzing and sharing financial data with technology so decisions are fast, accurate and secure - plus ethical reporting.',
    why: 'Executives, lenders and investors decide based on this information. Errors or leaks are costly.',
    an: 'The cockpit instruments of a plane: if they\'re wrong or late, the pilot crashes.',
    hook: 'ACCURATE, TIMELY, SECURE, ETHICAL.',
    ex: { p: 'A company\'s monthly reports take 3 weeks to produce and often have errors. How could FIM improve this?', s: ['Automate data collection from sales and bank systems.', 'Use a single accounting system and chart of accounts.', 'Add reconciliations and review controls.', 'Build dashboards so managers see results within days.'], a: 'Automate, standardize, control, visualize.' },
    qs: [
      Q('The main goal of financial-information management is to', ['give decision-makers accurate, timely financial information', 'hide information', 'design ads', 'hire staff'], 'Information → decisions.', 'Decisions.'),
      Q('Which protects sensitive financial data?', ['Access controls, encryption and multi-factor authentication', 'Sharing passwords', 'Emailing spreadsheets publicly', 'Using one login for everyone'], 'Security is part of FIM.', 'Secure.'),
    ],
    sc: [
      { x: 'big', t: 'Earnings release', s: 'A public company (fictional) accidentally emails its quarterly results to a reporter a day early.', q: Q('Why is this a serious FIM failure?', ['Material information leaked before public release - unfair to investors and a regulatory problem', 'It\'s great publicity', 'It doesn\'t matter', 'Reporters are allowed early access'], 'Fair disclosure matters.', 'Who should get it first?') },
    ],
    wild: 'Build a simple spreadsheet tracking your income and spending this month, with a total and a chart.',
    links: ['general-ledger', 'coa', 'sec', 'abc'] },

  { id: 'fin-ratios-pi', g: 'Business decisions', t: 'Financial Ratios in Roleplays (DECA PIs)', fixed: 'Fixed: DECA "performance indicators" are the skills a judge scores (e.g., "Explain the nature of balance sheets"), not profit ratios. Ratios are the tools you use to hit them.',
    def: 'DECA performance indicators (PIs) are the specific skills a judge scores in a roleplay. Financial ratios - margins, liquidity, debt and return ratios - are the evidence you use to address finance PIs convincingly.',
    why: 'Judges score each PI. Naming the PI, explaining it simply and backing it with a ratio and a recommendation earns "exceeds expectations."',
    an: 'PIs are the questions on the test; ratios are the calculator you bring.',
    hook: 'For each PI: NAME it → EXPLAIN it simply → PROVE it with a ratio → RECOMMEND an action.',
    f: 'Toolkit: Net margin = NI ÷ Revenue; Current ratio = CA ÷ CL; Debt ratio = Liabilities ÷ Assets; ROE = NI ÷ Equity',
    ex: { p: 'PI: "Explain the nature of balance sheets." The judge is a bakery owner worried about debt.', s: ['Name it: "Let me explain your balance sheet."', 'Explain: "It shows what you own, what you owe and your equity on one date."', 'Prove: "Your debt ratio is 70% - 70¢ of every dollar of assets is borrowed."', 'Recommend: "Let\'s pay down the highest-rate loan first and target 50% in two years."'], a: 'Name → explain → ratio → recommend.' },
    qs: [
      Q('In a DECA roleplay, performance indicators are', ['the specific skills the judge scores', 'stock market indexes', 'company KPIs you must invent', 'the judge\'s questions only'], 'Usually 5 per roleplay.', 'Scored skills.'),
      Q('A debt ratio of 0.8 means', ['80% of assets are financed with liabilities', 'the company has 80% profit', 'it has no debt', 'it can pay all bills twice'], 'Liabilities ÷ assets.', 'Owed ÷ owned.'),
    ],
    gen: () => { const a = rnd(10, 90) * 10, l = Math.round(a * rnd(20, 90) / 100); return N(`Total assets $${a}k, total liabilities $${l}k. Debt ratio?`, pc(l / a, 0), [pc((a - l) / a, 0), x(a / l), pc(l / (a - l), 0)], 'Liabilities ÷ assets.', 'Owed ÷ owned.'); },
    sc: [
      { x: 'deca', t: 'Business Finance Series PI', s: 'PI: "Analyze a company\'s profitability." Judge (owner): revenue $800k, net income $24k; industry net margin ~8%.', q: Q('Strongest way to address it?', ['Compute the 3% net margin, compare it to the 8% benchmark, identify likely causes and recommend two fixes', 'Say "profit is good"', 'Read the PI out loud and stop', 'Talk about marketing only'], 'Name, explain, prove, recommend.', 'Ratio + benchmark + action.'), say: '"Your net margin is 3% - well below the 8% typical for your industry. Let\'s look at food costs and pricing; closing half that gap would add about $20,000 a year."' },
    ],
    wild: 'Pick any PI from the DECA Finance list and practice saying a 30-second answer out loud using the 4 steps.',
    links: ['liquidity', 'net-income', 'dupont', 'benchmarking'] },
];
