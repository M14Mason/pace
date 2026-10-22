// 10th grade Term 2 (non-AP): Chemistry, Advanced Business Management, Spanish 2, Math 3.
import { chem, span, math, VOCAB2 } from './gens.js';

export const chemistry = {
  id: 'chem', name: 'Chemistry', short: 'Chem', term: '10-T2', color: '#0E7490',
  units: [
    { id: 'u1', t: 'Matter, Measurement & Sig Figs', topics: 'states of matter, physical vs chemical change, SI units, sig figs, dimensional analysis', gen: [chem.sigfigs],
      lessons: [{ id: 'l1', t: 'Dimensional analysis (the master skill)', why: 'Almost every calculation in chem is a unit conversion. If units cancel correctly, the answer is right.', ex: { p: 'Convert 2.5 hours to seconds.', s: ['Write what you have: 2.5 h.', 'Multiply by conversion factors with the unit you want on top: × (60 min / 1 h) × (60 s / 1 min).', 'Cancel h and min.', '2.5 × 60 × 60 = 9000 s (2 sig figs: 9.0 × 10³ s).'], a: '9.0 × 10³ s' }, key: ['Physical change: no new substance (melting). Chemical: new substance (rusting, burning).', 'Sig figs: leading zeros never count; trailing zeros count with a decimal point.', 'Multiply/divide: fewest sig figs. Add/subtract: fewest decimal places.'] }],
      qs: [
        { q: 'Which is a chemical change?', c: ['Iron rusting', 'Ice melting', 'Sugar dissolving in water', 'Cutting paper'], a: 0, e: 'Rusting forms a new substance (iron oxide).', h: ['Is a new substance formed?', 'Rust is a different compound.'] },
        { q: '3.20 × 2.1 = ? (correct sig figs)', c: ['6.7', '6.72', '6.720', '7'], a: 0, e: 'Multiplication: fewest sig figs (2.1 has 2) -> 6.7.', h: ['Multiply/divide rule.', 'Count sig figs in each factor.'] },
        { q: 'Density of an object with mass 24 g and volume 8.0 mL?', c: ['3.0 g/mL', '0.33 g/mL', '192 g/mL', '32 g/mL'], a: 0, e: 'D = m/V = 24/8.0 = 3.0 g/mL.', h: ['D = m / V.', 'Mass over volume.'] },
      ] },
    { id: 'u2', t: 'Atomic Structure & Periodic Trends', topics: 'protons/neutrons/electrons, isotopes, electron configuration, atomic radius, ionization energy, electronegativity',
      lessons: [{ id: 'l1', t: 'Reading the periodic table like a map', why: 'Trends let you answer questions about elements you\'ve never memorized.', ex: { p: 'Which has the larger atomic radius: Na or Cl?', s: ['Both are in period 3.', 'Across a period, protons increase but shielding stays about the same.', 'Higher effective nuclear charge pulls electrons closer -> radius shrinks left to right.', 'So Na (left) is larger.'], a: 'Na' }, key: ['Atomic number = protons. Mass number = protons + neutrons.', 'Radius: increases down a group, decreases across a period.', 'Ionization energy & electronegativity: opposite of radius (increase up and to the right; F is most electronegative).', 'Isotopes: same protons, different neutrons.'] }],
      qs: [
        { q: 'An atom has 17 protons and 18 neutrons. Its mass number is', c: ['35', '17', '18', '1'], a: 0, e: 'Mass number = protons + neutrons = 35 (chlorine-35).', h: ['Mass number counts the nucleus.', 'Add protons and neutrons.'] },
        { q: 'Which element has the highest electronegativity?', c: ['Fluorine', 'Cesium', 'Oxygen', 'Neon'], a: 0, e: 'Electronegativity increases up and to the right; noble gases excluded -> F.', h: ['Up and to the right.', 'Noble gases don\'t usually bond.'] },
        { q: 'Isotopes of an element differ in their number of', c: ['neutrons', 'protons', 'electrons in a neutral atom', 'atomic number'], a: 0, e: 'Same element = same protons; isotopes differ in neutrons.', h: ['Same element...', 'What can change without changing the element?'] },
        { q: 'Moving down Group 1, ionization energy generally', c: ['decreases', 'increases', 'stays the same', 'becomes zero'], a: 0, e: 'Outer electrons are farther and more shielded -> easier to remove.', h: ['Radius grows down a group.', 'Farther electrons are easier to pull off.'] },
        { q: 'Electron configuration of oxygen (8 electrons)?', c: ['1s² 2s² 2p⁴', '1s² 2s² 2p⁶', '1s² 2p⁶', '1s² 2s⁴ 2p²'], a: 0, e: '2 + 2 + 4 = 8 electrons.', h: ['Fill 1s, then 2s, then 2p.', 's holds 2, p holds 6.'] },
      ] },
    { id: 'u3', t: 'Bonding & Naming', topics: 'ionic vs covalent, Lewis structures, VSEPR shapes, naming compounds, polarity',
      lessons: [{ id: 'l1', t: 'Ionic or covalent - and naming', why: 'Naming rules depend on bond type, so classify first.', ex: { p: 'Name CaCl₂ and N₂O₄.', s: ['CaCl₂: metal + nonmetal -> ionic. Name the metal, then the nonmetal with -ide: calcium chloride (no prefixes).', 'N₂O₄: nonmetal + nonmetal -> covalent. Use prefixes: di-nitrogen tetr-oxide.', 'Answer: calcium chloride, dinitrogen tetroxide.'], a: 'calcium chloride; dinitrogen tetroxide' }, key: ['Ionic: metal + nonmetal, transfer electrons. Covalent: nonmetals share.', 'Prefixes (covalent only): mono, di, tri, tetra, penta, hexa.', 'VSEPR: 4 bonding pairs -> tetrahedral; 3 bonds + 1 lone pair -> trigonal pyramidal (NH₃); 2 bonds + 2 lone pairs -> bent (H₂O).'] }],
      qs: [
        { q: 'Which compound is ionic?', c: ['NaCl', 'CO₂', 'H₂O', 'CH₄'], a: 0, e: 'Na (metal) + Cl (nonmetal).', h: ['Look for a metal.', 'Metal + nonmetal = ionic.'] },
        { q: 'The shape of a water molecule is', c: ['bent', 'linear', 'tetrahedral', 'trigonal planar'], a: 0, e: '2 bonds + 2 lone pairs on O -> bent (~104.5°).', h: ['Oxygen has 2 lone pairs.', 'Lone pairs push bonds together.'] },
        { q: 'Correct name for CO?', c: ['carbon monoxide', 'carbon oxide', 'monocarbon monoxide', 'carbonate'], a: 0, e: 'Covalent: first element gets no "mono"; second does.', h: ['Covalent prefixes.', 'Skip mono on the first element.'] },
        { q: 'A bond between two atoms with very different electronegativities is most likely', c: ['ionic', 'nonpolar covalent', 'metallic', 'hydrogen'], a: 0, e: 'Large EN difference (>~1.7) -> electron transfer -> ionic.', h: ['Difference in pull on electrons.', 'Big difference = transfer.'] },
      ] },
    { id: 'u4', t: 'The Mole & Formulas', topics: 'molar mass, mole conversions, Avogadro\'s number, percent composition, empirical formula', gen: [chem.molarMass, chem.gramsToMoles, chem.particles],
      lessons: [{ id: 'l1', t: 'The mole road map', why: 'Grams, moles and particles are three "cities" - moles is the hub you always pass through.', ex: { p: 'How many molecules in 36 g of water?', s: ['Grams -> moles: 36 g ÷ 18.02 g/mol = 2.0 mol.', 'Moles -> molecules: 2.0 × 6.022×10²³ = 1.2×10²⁴.', 'Never go grams -> particles directly.'], a: '1.2 × 10²⁴ molecules' }, key: ['Molar mass (g/mol) = sum of atomic masses.', '1 mol = 6.022 × 10²³ particles.', 'Empirical formula: grams -> moles -> divide by smallest -> whole-number ratio.'] }],
      qs: [
        { q: 'Percent oxygen by mass in H₂O (M = 18.02)?', c: ['88.8%', '11.2%', '50%', '33.3%'], a: 0, e: '16.00/18.02 = 88.8%.', h: ['Part ÷ whole × 100.', 'O mass is 16.00.'] },
        { q: 'A compound is 40% C, 6.7% H, 53.3% O. Empirical formula?', c: ['CH₂O', 'C₂H₄O', 'CHO', 'C₆H₁₂O₆'], a: 0, e: 'Assume 100 g: 3.33 mol C, 6.67 mol H, 3.33 mol O -> 1:2:1.', h: ['Assume 100 g so % becomes grams.', 'Convert to moles, divide by the smallest.'] },
      ] },
    { id: 'u5', t: 'Reactions & Stoichiometry', topics: 'balancing, reaction types, mole ratios, limiting reactant, percent yield', gen: [chem.stoich],
      lessons: [{ id: 'l1', t: 'Stoichiometry in 3 moves', why: 'Every stoich problem is the same 3 steps; only the units change.', ex: { p: 'N₂ + 3H₂ -> 2NH₃. How many grams of NH₃ from 6.0 g H₂?', s: ['Grams H₂ -> moles: 6.0 ÷ 2.016 = 2.98 mol H₂.', 'Mole ratio: 2.98 × (2 NH₃ / 3 H₂) = 1.98 mol NH₃.', 'Moles -> grams: 1.98 × 17.03 = 33.8 g NH₃.'], a: '≈ 34 g NH₃' }, key: ['Balance first - coefficients are the mole ratio.', 'Types: synthesis, decomposition, single replacement, double replacement, combustion.', 'Limiting reactant: whichever makes LESS product.', 'Percent yield = actual ÷ theoretical × 100.'] }],
      qs: [
        { q: 'Balance: __H₂ + __O₂ -> __H₂O', c: ['2, 1, 2', '1, 1, 1', '1, 2, 1', '2, 2, 2'], a: 0, e: '2H₂ + O₂ -> 2H₂O: 4 H and 2 O on each side.', h: ['Count each atom on both sides.', 'Start with oxygen.'] },
        { q: 'CH₄ + 2O₂ -> CO₂ + 2H₂O is what type of reaction?', c: ['Combustion', 'Synthesis', 'Decomposition', 'Single replacement'], a: 0, e: 'Hydrocarbon + O₂ -> CO₂ + H₂O.', h: ['Fuel + oxygen.', 'Products are CO₂ and water.'] },
        { q: 'Theoretical yield 50 g, actual 40 g. Percent yield?', c: ['80%', '125%', '20%', '90%'], a: 0, e: '40/50 × 100 = 80%.', h: ['actual ÷ theoretical.', '× 100.'] },
      ] },
    { id: 'u6', t: 'Gases', topics: 'KMT, Boyle, Charles, combined and ideal gas laws, STP', gen: [chem.boyle, chem.idealGas],
      lessons: [{ id: 'l1', t: 'Gas laws are one law', why: 'Memorize PV = nRT and the combined law; the others are special cases.', ex: { p: 'A gas at 300 K and 2.0 L is heated to 450 K at constant pressure. New volume?', s: ['Constant P -> Charles: V₁/T₁ = V₂/T₂.', 'V₂ = V₁ × T₂/T₁ = 2.0 × 450/300.', '= 3.0 L.'], a: '3.0 L' }, key: ['Always use Kelvin: K = °C + 273.', 'Boyle: P↑ V↓. Charles: T↑ V↑. Gay-Lussac: T↑ P↑.', 'STP: 273 K, 1 atm; 1 mol = 22.4 L.'] }],
      qs: [
        { q: '25 °C in Kelvin?', c: ['298 K', '248 K', '25 K', '273 K'], a: 0, e: 'K = °C + 273.', h: ['Add 273.', 'Kelvin is never negative.'] },
        { q: 'At constant temperature, doubling the pressure on a gas will', c: ['halve its volume', 'double its volume', 'not change its volume', 'quadruple its volume'], a: 0, e: 'Boyle\'s law: P and V are inversely proportional.', h: ['Boyle\'s law.', 'Inverse relationship.'] },
      ] },
    { id: 'u7', t: 'Solutions, Acids & Bases', topics: 'molarity, dilution, pH, strong vs weak, neutralization, titration', gen: [chem.molarity, chem.pH],
      lessons: [{ id: 'l1', t: 'pH and neutralization', why: 'pH is a log scale - each step is 10× more acidic.', ex: { p: 'How much more acidic is pH 3 than pH 5?', s: ['Difference = 2 pH units.', 'Each unit = 10×.', '10² = 100× more acidic.'], a: '100×' }, key: ['pH < 7 acidic, 7 neutral, > 7 basic.', 'Acid + base -> salt + water.', 'Dilution: M₁V₁ = M₂V₂.', 'Strong acids fully ionize (HCl, HNO₃, H₂SO₄).'] }],
      qs: [
        { q: 'Dilute 100 mL of 2.0 M HCl to 400 mL. New molarity?', c: ['0.50 M', '8.0 M', '2.0 M', '1.0 M'], a: 0, e: 'M₂ = M₁V₁/V₂ = 2.0×100/400 = 0.50 M.', h: ['M₁V₁ = M₂V₂.', 'More volume, same moles -> lower M.'] },
        { q: 'HCl + NaOH -> ?', c: ['NaCl + H₂O', 'NaH + ClOH', 'Na + Cl₂ + H₂O', 'HClNaOH'], a: 0, e: 'Neutralization: acid + base -> salt + water.', h: ['Neutralization.', 'Salt + water.'] },
      ] },
    { id: 'u8', t: 'Energy, Rates & Equilibrium', topics: 'endo/exothermic, enthalpy, specific heat q=mcΔT, reaction rates, Le Châtelier',
      lessons: [{ id: 'l1', t: 'Le Châtelier: the system pushes back', why: 'Equilibrium questions are just "what happens if I push?"', ex: { p: 'N₂ + 3H₂ ⇌ 2NH₃ + heat. What happens if temperature increases?', s: ['Heat is a product here (exothermic).', 'Adding heat = adding product.', 'System shifts to use it up -> shifts left.', 'Less NH₃.'], a: 'Shifts left; less NH₃.' }, key: ['q = mcΔT (water c = 4.18 J/g·°C).', 'Exothermic releases heat (ΔH < 0).', 'Rate increases with temperature, concentration, surface area, catalyst.', 'Le Châtelier: add -> shift away; remove -> shift toward.'] }],
      qs: [
        { q: 'Heat needed to warm 50 g of water by 10 °C? (c = 4.18 J/g·°C)', c: ['2090 J', '209 J', '500 J', '41.8 J'], a: 0, e: 'q = 50 × 4.18 × 10 = 2090 J.', h: ['q = mcΔT.', 'Multiply all three.'] },
        { q: 'A catalyst speeds up a reaction by', c: ['lowering the activation energy', 'raising the temperature', 'increasing the products\' energy', 'being consumed in the reaction'], a: 0, e: 'Catalysts provide a lower-energy pathway and are not used up.', h: ['Energy hill.', 'Makes the hill smaller.'] },
      ] },
  ],
};

export const abm = {
  id: 'abm', name: 'Advanced Business Management', short: 'Adv Bus Mgmt', term: '10-T2', color: '#4338CA',
  units: [
    { id: 'u1', t: 'Management Functions & Leadership', topics: 'POLC (planning, organizing, leading, controlling), leadership styles, management levels',
      lessons: [{ id: 'l1', t: 'POLC: what managers actually do', why: 'Most management questions are just "which function is this?" - learn to classify fast.', ex: { p: 'A store manager compares this month\'s sales to the goal and retrains staff. Which function?', s: ['Comparing results to goals = measuring performance.', 'Fixing the gap (retraining) = corrective action.', 'Measure + correct = **controlling**.'], a: 'Controlling' }, key: ['Planning: set goals and strategies.', 'Organizing: arrange people and resources (org chart).', 'Leading: motivate and direct people.', 'Controlling: measure results vs plan, correct.', 'Styles: autocratic, democratic (participative), laissez-faire; situational leadership.', 'Levels: top (strategic), middle (tactical), first-line (operational).'] }],
      qs: [
        { q: 'Creating an organizational chart is part of which management function?', c: ['Organizing', 'Planning', 'Leading', 'Controlling'], a: 0, e: 'Arranging roles and reporting lines = organizing.', h: ['POLC.', 'Structure of people.'] },
        { q: 'A manager who makes decisions alone with little input uses which style?', c: ['Autocratic', 'Democratic', 'Laissez-faire', 'Servant'], a: 0, e: 'Autocratic = centralized decision-making.', h: ['"Auto" = self.', 'One person decides.'] },
        { q: 'Long-range, company-wide plans are mainly made by', c: ['top managers', 'first-line supervisors', 'entry-level employees', 'customers'], a: 0, e: 'Top management makes strategic plans.', h: ['Strategic plans.', 'Highest level.'] },
        { q: 'A SMART goal is', c: ['Specific, Measurable, Attainable, Relevant, Time-bound', 'Simple, Modern, Accurate, Rapid, Total', 'Strategic, Monetary, Annual, Reviewed, Tracked', 'Sales, Marketing, Accounting, Research, Training'], a: 0, e: 'SMART goals are concrete and trackable.', h: ['Five letters.', 'Measurable and time-bound.'] },
      ] },
    { id: 'u2', t: 'Strategy & Planning', topics: 'SWOT, mission/vision, competitive advantage, Porter\'s Five Forces, business plans',
      lessons: [{ id: 'l1', t: 'SWOT without mixing it up', why: 'The #1 mistake: putting outside events in Strengths/Weaknesses. Internal vs external is the whole trick.', ex: { p: 'A coffee shop: loyal customers, old espresso machines, a new office building opening nearby, a chain moving in. Sort it.', s: ['Internal + good = Strength: loyal customers.', 'Internal + bad = Weakness: old machines.', 'External + good = Opportunity: new office building (more customers).', 'External + bad = Threat: chain competitor.'], a: 'S: loyal customers; W: old machines; O: office building; T: chain.' }, key: ['Mission = what we do now; vision = where we\'re going.', 'Competitive advantage: cost leadership or differentiation.', 'Porter\'s 5 Forces: rivalry, new entrants, substitutes, buyer power, supplier power.'] }],
      qs: [
        { q: 'A new competitor entering the market is a', c: ['Threat', 'Weakness', 'Strength', 'Opportunity'], a: 0, e: 'External and harmful -> threat.', h: ['Internal or external?', 'Outside the company and bad.'] },
        { q: 'Selling at the lowest price in the industry is a strategy of', c: ['cost leadership', 'differentiation', 'diversification', 'vertical integration'], a: 0, e: 'Competing on lowest cost/price.', h: ['Porter\'s generic strategies.', 'Cheapest.'] },
        { q: 'Which of Porter\'s forces describes customers\' ability to demand lower prices?', c: ['Buyer power', 'Supplier power', 'Threat of substitutes', 'Rivalry'], a: 0, e: 'Buyers bargaining down prices.', h: ['Who\'s buying?', 'Their power.'] },
      ] },
    { id: 'u3', t: 'Human Resources & Motivation', topics: 'recruiting, selection, training, compensation, Maslow, Herzberg, McGregor X/Y, performance reviews',
      lessons: [{ id: 'l1', t: 'Motivation theories in one picture', why: 'You\'ll get scenario questions: "an employee wants recognition..." - match to the theory.', ex: { p: 'Employees have good pay but say work is boring. Using Herzberg, what\'s missing?', s: ['Herzberg splits factors in two.', 'Hygiene factors (pay, conditions) prevent dissatisfaction but don\'t motivate.', 'Motivators (achievement, recognition, growth, meaningful work) create motivation.', 'Missing: motivators - e.g., job enrichment.'], a: 'Motivators (job enrichment, recognition).' }, key: ['Maslow: physiological -> safety -> social -> esteem -> self-actualization.', 'McGregor: Theory X (people avoid work, need control) vs Theory Y (people self-motivate).', 'HR cycle: plan -> recruit -> select -> train -> evaluate -> compensate.', 'Job enrichment adds responsibility; job rotation moves people among tasks.'] }],
      qs: [
        { q: 'According to Maslow, which need must be met before esteem needs?', c: ['Social (belonging)', 'Self-actualization', 'Recognition', 'Promotion'], a: 0, e: 'Order: physiological, safety, social, esteem, self-actualization.', h: ['Pyramid order.', 'Just below esteem.'] },
        { q: 'A manager who believes employees enjoy work and seek responsibility holds', c: ['Theory Y', 'Theory X', 'Theory Z', 'Hygiene theory'], a: 0, e: 'McGregor\'s Theory Y is the optimistic view.', h: ['X vs Y.', 'Y = yes, they want to work.'] },
        { q: 'Under Herzberg\'s theory, salary is a', c: ['hygiene factor', 'motivator', 'self-actualization need', 'Theory Y assumption'], a: 0, e: 'Pay prevents dissatisfaction but doesn\'t create lasting motivation.', h: ['Two-factor theory.', 'Prevents dissatisfaction.'] },
      ] },
    { id: 'u4', t: 'Operations & Quality', topics: 'supply chain, inventory (JIT), quality control, TQM, productivity, project management',
      lessons: [{ id: 'l1', t: 'Operations = turning inputs into outputs efficiently', why: 'Expect calculation and scenario questions about inventory and quality.', ex: { p: 'A factory makes 1,200 units with 40 labor hours. Productivity?', s: ['Productivity = output ÷ input.', '1,200 ÷ 40 = 30 units per labor hour.'], a: '30 units/labor hour' }, key: ['JIT: inventory arrives just as needed - low storage cost, high supply risk.', 'TQM: everyone responsible for quality; continuous improvement (kaizen).', 'Quality control inspects; quality assurance prevents defects.', 'Gantt charts schedule tasks; critical path = longest sequence.'] }],
      qs: [
        { q: 'A major risk of just-in-time inventory is', c: ['production stops if a supplier is late', 'very high storage costs', 'too much unsold inventory', 'slow decision-making'], a: 0, e: 'No buffer stock means delays halt production.', h: ['JIT keeps little stock.', 'What if a shipment is late?'] },
        { q: '"Kaizen" means', c: ['continuous improvement', 'zero inventory', 'top-down control', 'outsourcing'], a: 0, e: 'Japanese term for small ongoing improvements.', h: ['TQM idea.', 'Small, constant changes.'] },
      ] },
    { id: 'u5', t: 'Marketing Management', topics: '4 Ps, segmentation, target market, product life cycle, branding, pricing strategies',
      lessons: [{ id: 'l1', t: 'Product life cycle -> strategy', why: 'Each stage calls for a different strategy; questions give the stage and ask the move.', ex: { p: 'Sales have peaked and competitors are copying the product. Stage and strategy?', s: ['Peak sales + many competitors = maturity.', 'Strategy: differentiate, cut costs, promotions, find new markets.'], a: 'Maturity - differentiate and defend share.' }, key: ['4 Ps: product, price, place, promotion.', 'PLC: introduction -> growth -> maturity -> decline.', 'Pricing: penetration (low to enter), skimming (high then lower), competitive, cost-plus.', 'Segmentation: demographic, geographic, psychographic, behavioral.'] }],
      qs: [
        { q: 'Launching a new gaming console at a high price, then lowering it later, is', c: ['price skimming', 'penetration pricing', 'cost-plus pricing', 'loss leader pricing'], a: 0, e: 'Skim early adopters first.', h: ['Start high.', 'Skim the top.'] },
        { q: 'Dividing customers by lifestyle and values is', c: ['psychographic segmentation', 'demographic segmentation', 'geographic segmentation', 'behavioral segmentation'], a: 0, e: 'Psychographic = attitudes, values, lifestyle.', h: ['"Psycho" = mind.', 'Values and lifestyle.'] },
      ] },
    { id: 'u6', t: 'Finance for Managers & Ethics', topics: 'budgets, break-even, income statement basics, ethics, CSR, stakeholders',
      lessons: [{ id: 'l1', t: 'Break-even and stakeholders', why: 'Managers make decisions with numbers and people in mind.', ex: { p: 'Fixed costs $6,000; price $25; variable cost $10. Break-even units?', s: ['Contribution margin = 25 − 10 = $15 per unit.', 'Break-even = fixed ÷ contribution = 6,000 ÷ 15.', '= 400 units.'], a: '400 units' }, key: ['Stakeholders: employees, customers, owners, suppliers, community, government.', 'CSR: responsibility beyond profit (environment, community).', 'Operating budget vs capital budget (long-term assets).'] }],
      qs: [
        { q: 'Which is a stakeholder but NOT a shareholder (typically)?', c: ['A local community near a factory', 'A person who owns company stock', 'A mutual fund holding shares', 'A founder with equity'], a: 0, e: 'Stakeholders include anyone affected; shareholders own stock.', h: ['Stake vs share.', 'Affected but doesn\'t own.'] },
        { q: 'A budget for buying a new building is a', c: ['capital budget', 'operating budget', 'cash budget', 'sales budget'], a: 0, e: 'Long-term asset purchases go in the capital budget.', h: ['Long-term asset.', 'Capital expenditure.'] },
      ] },
  ],
};

const tenses2 = ['present', 'preterite', 'imperfect'];
export const spanish2 = {
  id: 'span2', name: 'Spanish 2', short: 'Spanish 2', term: '10-T2', color: '#B91C1C', lang: 'es',
  units: [
    { id: 'u1', t: 'Present Tense Mastery & Stem-Changers', topics: 'regular present, e->ie, o->ue, e->i, yo-go verbs', gen: [() => span.conj(['present'])],
      lessons: [{ id: 'l1', t: 'Boot verbs', why: 'Stem-changers change everywhere EXCEPT nosotros/vosotros - draw a boot around the forms that change.', ex: { p: 'Conjugate poder (o->ue) for yo and nosotros.', s: ['Yo is inside the boot -> stem changes: puedo.', 'Nosotros is outside the boot -> no change: podemos.'], a: 'puedo, podemos' }, key: ['e->ie: querer, pensar, empezar, preferir.', 'o->ue: poder, dormir, volver, almorzar.', 'e->i: pedir, servir, repetir.', 'Yo-go: tengo, hago, pongo, salgo, digo, vengo.'] }],
      qs: [
        { q: 'Nosotros ___ (dormir) ocho horas.', c: ['dormimos', 'duermimos', 'duermemos', 'dormemos'], a: 0, e: 'Nosotros is outside the boot - no stem change.', h: ['Is nosotros in the boot?', 'No - keep the original stem.'] },
        { q: 'Yo ___ (salir) a las siete.', c: ['salgo', 'salo', 'salio', 'sales'], a: 0, e: 'Salir is a yo-go verb: salgo.', h: ['Yo-go verbs.', 'Like tengo, hago...'] },
        { q: 'Ellos ___ (pedir) pizza.', c: ['piden', 'peden', 'pedimos', 'pidan'], a: 0, e: 'e->i stem change in the boot: piden.', h: ['e -> i verb.', 'Ellos is in the boot.'] },
      ] },
    { id: 'u2', t: 'Ser vs Estar, Reflexives', topics: 'DOCTOR/PLACE, reflexive verbs, daily routine', gen: [span.serEstar],
      lessons: [{ id: 'l1', t: 'Reflexive verbs = doing it to yourself', why: 'The reflexive pronoun matches the subject.', ex: { p: 'Say "I wake up at 6."', s: ['Verb: despertarse (e->ie).', 'Subject yo -> pronoun me.', 'Stem change: despierto.', '"Me despierto a las seis."'], a: 'Me despierto a las seis.' }, key: ['me, te, se, nos, se.', 'Pronoun goes before a conjugated verb or attached to an infinitive (voy a levantarme).'] }],
      qs: [
        { q: 'Tú ___ (ducharse) por la mañana.', c: ['te duchas', 'se ducha', 'me ducho', 'te ducha'], a: 0, e: 'Tú -> te + duchas.', h: ['Match pronoun to subject.', 'Tú = te.'] },
        { q: 'Nosotros ___ (levantarse) temprano.', c: ['nos levantamos', 'se levantan', 'nos levantan', 'levantamos nos'], a: 0, e: 'Nosotros -> nos + levantamos.', h: ['Nosotros pronoun?', 'nos'] },
      ] },
    { id: 'u3', t: 'The Preterite', topics: 'regular preterite, -car/-gar/-zar, irregulars (ser/ir, tener, hacer, estar)', gen: [() => span.conj(['preterite'])],
      lessons: [{ id: 'l1', t: 'Preterite for finished actions', why: 'Use it for actions with a clear start/end: ayer, anoche, el año pasado.', ex: { p: 'Yo ___ (buscar) mis llaves.', s: ['-car verb in yo form -> c becomes qu.', 'busc + é -> busqué.'], a: 'busqué' }, key: ['-ar: é, aste, ó, amos, aron. -er/-ir: í, iste, ió, imos, ieron.', 'Yo spelling changes: -car -> qué, -gar -> gué, -zar -> cé.', 'Ser and ir share forms: fui, fuiste, fue, fuimos, fueron.'] }],
      qs: [
        { q: 'Yo ___ (llegar) tarde.', c: ['llegué', 'llegé', 'llegó', 'llegaba'], a: 0, e: '-gar -> gué in yo preterite.', h: ['-car/-gar/-zar rule.', 'Keep the hard g sound.'] },
        { q: '¿Adónde ___ (ir) tú ayer?', c: ['fuiste', 'fuistes', 'iste', 'ibas'], a: 0, e: 'Ir preterite: fuiste (no s at the end).', h: ['Ir and ser share preterite forms.', 'Tú ending -iste.'] },
        { q: 'Ella ___ (hacer) la tarea.', c: ['hizo', 'hació', 'hice', 'hacía'], a: 0, e: 'Hacer preterite él/ella: hizo (c->z).', h: ['Irregular stem hic-.', 'Spelling keeps the sound: hizo.'] },
      ] },
    { id: 'u4', t: 'The Imperfect & Preterite vs Imperfect', topics: 'imperfect forms, uses, contrast with preterite', gen: [() => span.conj(['imperfect']), span.pretVsImp, span.pretVsImp],
      lessons: [{ id: 'l1', t: 'Movie scene vs action', why: 'Imperfect paints the background (what was happening); preterite is the action that happens.', ex: { p: '"I was reading when my phone rang."', s: ['Background/ongoing: was reading -> imperfect: leía.', 'Interrupting action: rang -> preterite: sonó.', '"Leía cuando sonó mi teléfono."'], a: 'Leía cuando sonó mi teléfono.' }, key: ['Imperfect: habitual, ongoing, time, age, weather, feelings, description.', 'Preterite: completed, specific, interruptions, sequence of events.'] }],
      qs: [
        { q: 'Cuando yo ___ (tener) diez años, vivía en Texas.', c: ['tenía', 'tuve', 'tengo', 'tendré'], a: 0, e: 'Age in the past -> imperfect.', h: ['Age in the past.', 'Description = imperfect.'] },
      ] },
    { id: 'u5', t: 'Commands & Object Pronouns', topics: 'informal tú commands, irregular commands, direct/indirect object pronouns',
      lessons: [{ id: 'l1', t: 'Tú commands', why: 'Affirmative tú commands look like the él form; negative ones switch to subjunctive.', ex: { p: '"Speak!" and "Don\'t speak!" (hablar)', s: ['Affirmative tú = él present: ¡Habla!', 'Negative = no + subjunctive tú: ¡No hables!'], a: '¡Habla! / ¡No hables!' }, key: ['Irregular affirmative tú: di, haz, ve, pon, sal, sé, ten, ven.', 'Pronouns attach to affirmative (¡Dímelo!), go before negative (¡No me lo digas!).', 'Indirect before direct; le/les -> se before lo/la.'] }],
      qs: [
        { q: 'Affirmative tú command of hacer:', c: ['haz', 'hace', 'haga', 'hazte'], a: 0, e: 'Irregular: haz.', h: ['One of the 8 irregulars.', 'Vin Diesel Has Ten Weapons... (ven, di, sal, haz, ten, ve, pon, sé)'] },
        { q: '"I give it (el libro) to her" =', c: ['Se lo doy.', 'Le lo doy.', 'Lo le doy.', 'La lo doy.'], a: 0, e: 'le + lo -> se lo.', h: ['Indirect before direct.', 'le becomes se.'] },
      ] },
    { id: 'u6', t: 'Vocabulary: Travel, Health, Childhood, Environment', topics: 'core Spanish 2 themes', gen: [() => span.vocab(VOCAB2), () => span.vocab(VOCAB2)],
      lessons: [{ id: 'l1', t: 'Learn words in chunks', why: 'Words stick when learned in phrases you could actually say.', ex: { p: 'Learn "la maleta" usefully.', s: ['Chunk: "Hago la maleta" = I pack my suitcase.', 'Connect: maleta ~ "mallet"? Make a silly image.', 'Retrieve tomorrow without looking.'], a: 'Hago la maleta.' }, key: ['Say the article with every noun.', 'Review with spaced repetition - Pace brings missed words back.'] }],
      qs: [] },
  ],
};

export const math3 = {
  id: 'math3', name: 'Math 3', short: 'Math 3', term: 'math3', color: '#7C3AED',
  units: [
    { id: 'u1', t: 'Functions & Transformations', topics: 'domain/range, function notation, parent functions, shifts/stretches, inverses', gen: [math.transform],
      lessons: [{ id: 'l1', t: 'Transformations: inside vs outside', why: 'Changes INSIDE f( ) move horizontally and act opposite; OUTSIDE moves vertically as written.', ex: { p: 'Describe g(x) = (x + 3)² − 4 compared to x².', s: ['Inside +3 -> shift LEFT 3 (opposite).', 'Outside −4 -> shift DOWN 4.', 'Vertex moves from (0,0) to (−3, −4).'], a: 'Left 3, down 4; vertex (−3, −4)' }, key: ['f(x − h) + k: right h, up k.', '−f(x): reflect over x-axis. f(−x): reflect over y-axis.', 'a·f(x): vertical stretch if |a| > 1.', 'Inverse: swap x and y, solve for y.'] }],
      qs: [
        { q: 'The inverse of f(x) = 2x + 6 is', c: ['f⁻¹(x) = (x − 6)/2', 'f⁻¹(x) = 2x − 6', 'f⁻¹(x) = x/2 + 6', 'f⁻¹(x) = (x + 6)/2'], a: 0, e: 'Swap: x = 2y + 6 -> y = (x − 6)/2.', h: ['Swap x and y.', 'Undo + 6 first, then ÷ 2.'] },
        { q: 'Domain of f(x) = √(x − 4)?', c: ['x ≥ 4', 'x > 4', 'all real numbers', 'x ≤ 4'], a: 0, e: 'Inside a square root must be ≥ 0.', h: ['Can\'t take √ of a negative.', 'x − 4 ≥ 0.'] },
      ] },
    { id: 'u2', t: 'Polynomials', topics: 'factoring, quadratic formula, polynomial division, end behavior, zeros', gen: [math.quadratic, math.quadratic],
      lessons: [{ id: 'l1', t: 'Quadratic formula when factoring fails', why: 'It always works. Use the discriminant first to know what you\'ll get.', ex: { p: 'Solve x² + 4x + 1 = 0.', s: ['a=1, b=4, c=1.', 'Discriminant b² − 4ac = 16 − 4 = 12 > 0 -> two real roots.', 'x = (−4 ± √12)/2 = −2 ± √3.'], a: 'x = −2 ± √3' }, key: ['x = (−b ± √(b² − 4ac)) / 2a.', 'Discriminant > 0: 2 real; = 0: 1 real; < 0: 2 complex.', 'End behavior: leading term decides (even degree -> same direction both ends).'] }],
      qs: [
        { q: 'Discriminant of x² + 2x + 5?', c: ['−16', '24', '−4', '16'], a: 0, e: 'b² − 4ac = 4 − 20 = −16 -> complex roots.', h: ['b² − 4ac.', 'a=1, b=2, c=5.'] },
      ] },
    { id: 'u3', t: 'Exponentials & Logarithms', topics: 'exponent rules, growth/decay, logs, log properties, solving exponential equations', gen: [math.exponent, math.log],
      lessons: [{ id: 'l1', t: 'Logs undo exponents', why: 'Whenever the unknown is in an exponent, take a log.', ex: { p: 'Solve 3ˣ = 81.', s: ['Ask: 3 to what power is 81?', '3⁴ = 81.', 'x = 4 (or x = log 81 / log 3).'], a: 'x = 4' }, key: ['log(ab) = log a + log b; log(a/b) = log a − log b; log(aⁿ) = n log a.', 'Growth: y = a(1 + r)ᵗ; decay: y = a(1 − r)ᵗ.', 'Change of base: log_b x = log x / log b.'] }],
      qs: [
        { q: 'A population of 500 grows 10% per year. Expression after t years?', c: ['500(1.1)ᵗ', '500(0.9)ᵗ', '500 + 10t', '500(10)ᵗ'], a: 0, e: 'Growth factor 1 + 0.10 = 1.1.', h: ['Growth factor = 1 + rate.', '10% = 0.10.'] },
      ] },
    { id: 'u4', t: 'Systems & Matrices', topics: 'linear systems, elimination, substitution, inequalities', gen: [math.linearSystem],
      lessons: [{ id: 'l1', t: 'Elimination in 3 steps', why: 'Fastest method when coefficients line up.', ex: { p: 'x + y = 10 and x − y = 2.', s: ['Add equations: 2x = 12 -> x = 6.', 'Substitute: 6 + y = 10 -> y = 4.', 'Check in both: (6, 4).'], a: '(6, 4)' }, key: ['Multiply one equation so a variable cancels.', 'Always check the answer in BOTH equations.'] }],
      qs: [] },
    { id: 'u5', t: 'Trigonometry & Circles', topics: 'right-triangle trig, unit circle, radians, circle equations', gen: [math.unitCircle],
      lessons: [{ id: 'l1', t: 'SOH-CAH-TOA', why: 'Every right-triangle trig problem starts by labeling opposite, adjacent and hypotenuse from the angle.', ex: { p: 'Hypotenuse 10, angle 30°. Opposite side?', s: ['Opposite + hypotenuse -> sine.', 'sin 30° = opp/10.', 'opp = 10 × 0.5 = 5.'], a: '5' }, key: ['sin = opp/hyp, cos = adj/hyp, tan = opp/adj.', 'Radians: π rad = 180°.', 'Circle: (x − h)² + (y − k)² = r².'] }],
      qs: [
        { q: 'Convert 90° to radians.', c: ['π/2', 'π', '2π', 'π/4'], a: 0, e: '90 × π/180 = π/2.', h: ['π rad = 180°.', 'Multiply by π/180.'] },
        { q: 'Center and radius of (x − 2)² + (y + 1)² = 9?', c: ['(2, −1), r = 3', '(−2, 1), r = 3', '(2, −1), r = 9', '(2, 1), r = 3'], a: 0, e: 'Signs flip inside; r = √9 = 3.', h: ['(x − h)² + (y − k)² = r².', 'r² = 9.'] },
      ] },
    { id: 'u6', t: 'Statistics & Probability', topics: 'mean/median/sd, normal distribution, probability rules, sampling',
      lessons: [{ id: 'l1', t: 'Normal distribution: 68-95-99.7', why: 'One rule answers most normal-curve questions instantly.', ex: { p: 'Scores: mean 70, sd 5. What % score between 60 and 80?', s: ['60 and 80 are 2 sd from the mean.', '±2 sd covers about 95%.'], a: '≈ 95%' }, key: ['±1 sd: 68%, ±2: 95%, ±3: 99.7%.', 'z = (x − mean)/sd.', 'P(A or B) = P(A) + P(B) − P(A and B).', 'Independent: P(A and B) = P(A)·P(B).'] }],
      qs: [
        { q: 'z-score of 85 if mean = 75 and sd = 5?', c: ['2', '−2', '10', '0.5'], a: 0, e: '(85 − 75)/5 = 2.', h: ['z = (x − μ)/σ.', 'Difference ÷ sd.'] },
        { q: 'Probability of two heads in two fair coin flips?', c: ['1/4', '1/2', '1/3', '3/4'], a: 0, e: '½ × ½ = ¼ (independent).', h: ['Independent events multiply.', '½ each.'] },
      ] },
  ],
};
