// Endless generated practice for calculation-heavy and pattern-heavy courses.
// Each generator returns a bank question { q, c, a, e, h } (choice 0 is correct; shuffled later).
import { rnd, pick } from '../ui.js';

const r2 = x => Math.round(x * 100) / 100;
const r3 = x => Number(x.toPrecision(3));
const uniq = (ans, ...d) => { const out = [ans]; for (const x of d) if (!out.includes(x)) out.push(x); let k = 1; while (out.length < 4 && typeof ans === 'number') { const v = r3(ans * (1 + 0.37 * k++)); if (!out.includes(v)) out.push(v); } return out.slice(0, 4); };
const Q = (q, ans, d, e, h) => ({ q, c: uniq(ans, ...d).map(String), a: 0, e, h });

// ---------------- Chemistry ----------------
const EL = { H: 1.008, C: 12.01, N: 14.01, O: 16.00, Na: 22.99, Mg: 24.31, Cl: 35.45, K: 39.10, Ca: 40.08, S: 32.07, Fe: 55.85, Al: 26.98 };
const CMP = [
  ['H2O', { H: 2, O: 1 }], ['CO2', { C: 1, O: 2 }], ['NaCl', { Na: 1, Cl: 1 }], ['CH4', { C: 1, H: 4 }], ['NH3', { N: 1, H: 3 }],
  ['C6H12O6', { C: 6, H: 12, O: 6 }], ['CaCO3', { Ca: 1, C: 1, O: 3 }], ['H2SO4', { H: 2, S: 1, O: 4 }], ['MgO', { Mg: 1, O: 1 }], ['KCl', { K: 1, Cl: 1 }],
  ['Fe2O3', { Fe: 2, O: 3 }], ['Al2O3', { Al: 2, O: 3 }], ['C2H6', { C: 2, H: 6 }], ['NaOH', { Na: 1, O: 1, H: 1 }],
];
const mm = f => r2(Object.entries(f).reduce((a, [e, n]) => a + EL[e] * n, 0));
const sub = s => s.replace(/(\d+)/g, m => m.split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join(''));

export const chem = {
  molarMass() {
    const [n, f] = pick(CMP); const m = mm(f);
    return Q(`Molar mass of ${sub(n)}? (g/mol)`, m, [r2(m - EL.O), r2(m * 2), r2(Object.values(EL).slice(0, 3).reduce((a, b) => a + b, 0))],
      `Add atomic masses × subscripts: ${Object.entries(f).map(([e, k]) => `${k}×${EL[e]}`).join(' + ')} = ${m}.`, ['Molar mass = sum of (atomic mass × number of atoms).', 'Read each subscript carefully - it applies to the element before it.']);
  },
  gramsToMoles() {
    const [n, f] = pick(CMP); const m = mm(f); const g = r2(m * pick([0.5, 2, 0.25, 1.5, 3]));
    const mol = r3(g / m);
    return Q(`How many moles are in ${g} g of ${sub(n)}? (M = ${m} g/mol)`, mol, [r3(g * m), r3(m / g), r3(mol * 2)], `moles = grams ÷ molar mass = ${g} ÷ ${m} = ${mol}.`, ['n = m ÷ M.', 'Units: g ÷ (g/mol) = mol.']);
  },
  particles() {
    const mol = pick([0.5, 2, 1.5, 0.25, 3]); const N = r3(mol * 6.022e23);
    return Q(`How many molecules are in ${mol} mol of a substance?`, `${(N / 1e23).toFixed(2)} × 10²³`, [`${(mol / 6.022).toFixed(2)} × 10²³`, `${(N / 1e23 * 2).toFixed(2)} × 10²³`, `${mol.toFixed(2)} × 10²³`], `N = n × 6.022×10²³ = ${(N / 1e23).toFixed(2)}×10²³.`, ['Avogadro\'s number: 6.022 × 10²³ per mole.', 'Multiply moles by Avogadro\'s number.']);
  },
  molarity() {
    const mol = pick([0.25, 0.5, 1, 1.5, 2]), L = pick([0.25, 0.5, 1, 2]); const M = r3(mol / L);
    return Q(`${mol} mol of NaCl dissolved to make ${L} L of solution. Molarity?`, `${M} M`, [`${r3(mol * L)} M`, `${r3(L / mol)} M`, `${r3(M * 2)} M`], `M = mol ÷ L = ${mol} ÷ ${L} = ${M} M.`, ['Molarity = moles solute ÷ liters of solution.', 'Convert mL to L first if needed.']);
  },
  idealGas() {
    const n = pick([0.5, 1, 2]), T = pick([273, 300, 350]), V = pick([10, 22.4, 24.6]);
    const P = r3(n * 0.08206 * T / V);
    return Q(`n = ${n} mol, T = ${T} K, V = ${V} L. Pressure (atm)? (R = 0.0821 L·atm/mol·K)`, P, [r3(V / (n * 0.08206 * T)), r3(n * T / V), r3(P * 2)], `P = nRT/V = ${n}×0.0821×${T}/${V} = ${P} atm.`, ['PV = nRT.', 'Solve for P: P = nRT ÷ V. Temperature must be in Kelvin.']);
  },
  boyle() {
    const P1 = pick([1, 2, 1.5, 3]), V1 = pick([4, 6, 10, 12]), P2 = pick([2, 3, 4, 0.5]); const V2 = r3(P1 * V1 / P2);
    return Q(`A gas at ${P1} atm occupies ${V1} L. At constant T, what is the volume at ${P2} atm?`, `${V2} L`, [`${r3(P2 * V1 / P1)} L`, `${r3(P1 * P2 / V1)} L`, `${r3(V1 + P2 - P1)} L`], `Boyle: P₁V₁ = P₂V₂ -> V₂ = ${P1}×${V1}/${P2} = ${V2} L.`, ['Pressure and volume are inversely related at constant T.', 'P₁V₁ = P₂V₂.']);
  },
  pH() {
    const k = rnd(1, 13); const h = `1 × 10⁻${String(k).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')}`;
    return Q(`[H⁺] = ${h} M. pH?`, k, [14 - k, k + 1, -k], `pH = −log[H⁺] = ${k}. ${k < 7 ? 'Acidic' : k > 7 ? 'Basic' : 'Neutral'}.`, ['pH = −log[H⁺].', 'For 1×10⁻ⁿ, pH = n.']);
  },
  stoich() {
    const set = pick([
      ['2H₂ + O₂ -> 2H₂O', 'H₂', 'H₂O', 2, 2], ['N₂ + 3H₂ -> 2NH₃', 'H₂', 'NH₃', 3, 2], ['CH₄ + 2O₂ -> CO₂ + 2H₂O', 'O₂', 'CO₂', 2, 1],
      ['2Na + Cl₂ -> 2NaCl', 'Na', 'NaCl', 2, 2], ['4Fe + 3O₂ -> 2Fe₂O₃', 'O₂', 'Fe₂O₃', 3, 2],
    ]);
    const [eq, A, B, a, b] = set; const nA = pick([2, 3, 4, 6, 9]); const nB = r3(nA * b / a);
    return Q(`${eq}. How many mol of ${B} form from ${nA} mol of ${A}?`, nB, [r3(nA * a / b), nA, r3(nB * 2)], `Mole ratio ${B}:${A} = ${b}:${a}, so ${nA} × ${b}/${a} = ${nB} mol.`, ['Use the coefficients as a mole ratio.', 'Multiply by (wanted ÷ given) coefficients.']);
  },
  sigfigs() {
    const n = pick(['0.00450', '1200', '1.020', '305', '6.0', '0.0700', '25.00', '100.']);
    const s = { '0.00450': 3, '1200': 2, '1.020': 4, '305': 3, '6.0': 2, '0.0700': 3, '25.00': 4, '100.': 3 }[n];
    return Q(`How many significant figures in ${n}?`, s, [s + 1, s - 1 || 5, n.replace(/\D/g, '').length], `Leading zeros never count; captive zeros always count; trailing zeros count only with a decimal point. ${n} -> ${s}.`, ['Leading zeros are placeholders.', 'Trailing zeros count only if there\'s a decimal point.']);
  },
};

// ---------------- Spanish ----------------
const PERS = ['yo', 'tú', 'él/ella/Ud.', 'nosotros', 'ellos/Uds.'];
const REG = { ar: ['hablar', 'trabajar', 'estudiar', 'comprar', 'bailar', 'caminar'], er: ['comer', 'beber', 'aprender', 'correr', 'vender'], ir: ['vivir', 'escribir', 'abrir', 'decidir', 'subir'] };
const END = {
  present: { ar: ['o', 'as', 'a', 'amos', 'an'], er: ['o', 'es', 'e', 'emos', 'en'], ir: ['o', 'es', 'e', 'imos', 'en'] },
  preterite: { ar: ['é', 'aste', 'ó', 'amos', 'aron'], er: ['í', 'iste', 'ió', 'imos', 'ieron'], ir: ['í', 'iste', 'ió', 'imos', 'ieron'] },
  imperfect: { ar: ['aba', 'abas', 'aba', 'ábamos', 'aban'], er: ['ía', 'ías', 'ía', 'íamos', 'ían'], ir: ['ía', 'ías', 'ía', 'íamos', 'ían'] },
  future: { ar: ['é', 'ás', 'á', 'emos', 'án'], er: ['é', 'ás', 'á', 'emos', 'án'], ir: ['é', 'ás', 'á', 'emos', 'án'] },
  subjunctive: { ar: ['e', 'es', 'e', 'emos', 'en'], er: ['a', 'as', 'a', 'amos', 'an'], ir: ['a', 'as', 'a', 'amos', 'an'] },
  conditional: { ar: ['ía', 'ías', 'ía', 'íamos', 'ían'], er: ['ía', 'ías', 'ía', 'íamos', 'ían'], ir: ['ía', 'ías', 'ía', 'íamos', 'ían'] },
};
const IRR = {
  present: { ser: ['soy', 'eres', 'es', 'somos', 'son'], estar: ['estoy', 'estás', 'está', 'estamos', 'están'], ir: ['voy', 'vas', 'va', 'vamos', 'van'], tener: ['tengo', 'tienes', 'tiene', 'tenemos', 'tienen'], hacer: ['hago', 'haces', 'hace', 'hacemos', 'hacen'], poder: ['puedo', 'puedes', 'puede', 'podemos', 'pueden'], querer: ['quiero', 'quieres', 'quiere', 'queremos', 'quieren'], decir: ['digo', 'dices', 'dice', 'decimos', 'dicen'] },
  preterite: { ser: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'], ir: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'], tener: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvieron'], hacer: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicieron'], estar: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvieron'], poder: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudieron'], decir: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijeron'], querer: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisieron'] },
  imperfect: { ser: ['era', 'eras', 'era', 'éramos', 'eran'], ir: ['iba', 'ibas', 'iba', 'íbamos', 'iban'], ver: ['veía', 'veías', 'veía', 'veíamos', 'veían'] },
  subjunctive: { ser: ['sea', 'seas', 'sea', 'seamos', 'sean'], estar: ['esté', 'estés', 'esté', 'estemos', 'estén'], ir: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayan'], tener: ['tenga', 'tengas', 'tenga', 'tengamos', 'tengan'], hacer: ['haga', 'hagas', 'haga', 'hagamos', 'hagan'], saber: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepan'] },
  future: { tener: ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendrán'], hacer: ['haré', 'harás', 'hará', 'haremos', 'harán'], decir: ['diré', 'dirás', 'dirá', 'diremos', 'dirán'], poder: ['podré', 'podrás', 'podrá', 'podremos', 'podrán'], salir: ['saldré', 'saldrás', 'saldrá', 'saldremos', 'saldrán'] },
};
const TENSE_NAME = { present: 'present', preterite: 'preterite', imperfect: 'imperfect', future: 'future', subjunctive: 'present subjunctive', conditional: 'conditional' };
const TENSE_HINT = {
  present: ['Present: drop -ar/-er/-ir, add o, as/es, a/e, amos/emos/imos, an/en.', 'Find the person first, then the ending.'],
  preterite: ['Preterite = completed past action. -ar: é, aste, ó, amos, aron. -er/-ir: í, iste, ió, imos, ieron.', 'Irregulars (tener -> tuv-, hacer -> hic-) use endings e, iste, o, imos, ieron - no accents.'],
  imperfect: ['Imperfect = ongoing/habitual past ("used to"). -ar: aba..., -er/-ir: ía...', 'Only 3 irregulars: ser (era), ir (iba), ver (veía).'],
  future: ['Future: add é, ás, á, emos, án to the WHOLE infinitive.', 'Irregular stems: tendr-, har-, dir-, podr-, saldr-.'],
  subjunctive: ['Subjunctive: start with yo present, drop -o, add the "opposite" vowel (-ar -> e, -er/-ir -> a).', 'Triggers: wishes, emotions, doubt, impersonal expressions (WEIRDO).'],
  conditional: ['Conditional ("would"): infinitive + ía, ías, ía, íamos, ían.', 'Same irregular stems as the future.'],
};
function conjugate(verb, tense, p) {
  if (IRR[tense] && IRR[tense][verb]) return IRR[tense][verb][p];
  const t = verb.slice(-2), st = verb.slice(0, -2);
  if (tense === 'future' || tense === 'conditional') return verb + END[tense][t][p];
  return st + END[tense][t][p];
}
export const span = {
  conj(tenses = ['present', 'preterite', 'imperfect']) {
    const tense = pick(tenses);
    const pool = [...REG.ar, ...REG.er, ...REG.ir, ...Object.keys(IRR[tense] || {})];
    const verb = pick(pool), p = rnd(0, 4);
    const ans = conjugate(verb, tense, p);
    const otherT = tenses.filter(x => x !== tense).concat(['present', 'imperfect']).filter((x, i, a) => a.indexOf(x) === i && x !== tense);
    const regular = [...REG.ar, ...REG.er, ...REG.ir].includes(verb);
    const d = regular ? [conjugate(verb, tense, (p + 1) % 5), conjugate(verb, otherT[0], p), conjugate(verb, otherT[1] || 'future', p)]
      : [1, 2, 3].map(k => conjugate(verb, tense, (p + k) % 5));
    return Q(`${verb} - ${TENSE_NAME[tense]} - ${PERS[p]}`, ans, d, `${verb} (${TENSE_NAME[tense]}, ${PERS[p]}) = **${ans}**.`, TENSE_HINT[tense]);
  },
  pretVsImp() {
    const set = pick([
      ['Cuando era niño, ___ (jugar) al fútbol todos los días.', 'jugaba', 'jugué', 'Habitual past -> imperfect.'],
      ['Ayer ___ (comer) en un restaurante nuevo.', 'comí', 'comía', 'Completed action at a specific time ("ayer") -> preterite.'],
      ['___ (llover) cuando salimos de casa.', 'Llovía', 'Llovió', 'Background/ongoing action -> imperfect.'],
      ['El año pasado ___ (viajar) a México.', 'viajé', 'viajaba', 'Specific completed event -> preterite.'],
      ['Mi abuela siempre nos ___ (contar) historias.', 'contaba', 'contó', '"Siempre" = habitual -> imperfect.'],
      ['De repente, el teléfono ___ (sonar).', 'sonó', 'sonaba', '"De repente" interrupts -> preterite.'],
      ['Eran las ocho de la noche cuando ellos ___ (llegar).', 'llegaron', 'llegaban', 'Time = imperfect; the interrupting arrival = preterite.'],
    ]);
    return Q(set[0], set[1], [set[2]], set[3], ['Preterite = completed, specific moment. Imperfect = background, habitual, ongoing.', 'Look for trigger words: ayer/de repente (preterite) vs siempre/todos los días/cuando era (imperfect).']);
  },
  serEstar() {
    const set = pick([
      ['Mi hermana ___ doctora.', 'es', 'está', 'Profession -> ser.'], ['La sopa ___ fría.', 'está', 'es', 'Condition/state -> estar.'],
      ['Nosotros ___ en la biblioteca.', 'estamos', 'somos', 'Location -> estar.'], ['La fiesta ___ en mi casa.', 'es', 'está', 'Location of an EVENT -> ser.'],
      ['Ellos ___ de Colombia.', 'son', 'están', 'Origin -> ser.'], ['Yo ___ cansado hoy.', 'estoy', 'soy', 'Feeling/temporary state -> estar.'],
      ['___ las tres de la tarde.', 'Son', 'Están', 'Time -> ser.'],
    ]);
    return Q(set[0], set[1], [set[2]], set[3], ['Ser = DOCTOR: Description, Occupation, Characteristic, Time, Origin, Relationship.', 'Estar = PLACE: Position, Location, Action (-ando), Condition, Emotion.']);
  },
  vocab(list) {
    const [es, en] = pick(list);
    const d = list.filter(x => x[1] !== en).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x[1]);
    return Math.random() < 0.5
      ? Q(`What does **${es}** mean?`, en, d, `${es} = ${en}.`, ['Think of a cognate or a sentence you know with this word.', 'Break the word into parts.'])
      : Q(`How do you say **${en}** in Spanish?`, es, list.filter(x => x[0] !== es).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x[0]), `${en} = ${es}.`, ['Picture where you\'ve seen it.', 'Look for a related English word.']);
  },
};
export const VOCAB2 = [
  ['el desayuno', 'breakfast'], ['la cena', 'dinner'], ['el almuerzo', 'lunch'], ['la receta', 'recipe'], ['el viaje', 'trip'], ['el aeropuerto', 'airport'], ['la maleta', 'suitcase'],
  ['el pasaporte', 'passport'], ['la salud', 'health'], ['el médico', 'doctor'], ['la fiebre', 'fever'], ['el tobillo', 'ankle'], ['la ciudad', 'city'], ['la tienda', 'store'],
  ['el dinero', 'money'], ['ahorrar', 'to save (money)'], ['gastar', 'to spend'], ['la carrera', 'career / degree'], ['el trabajo', 'job'], ['la entrevista', 'interview'],
  ['la niñez', 'childhood'], ['el juguete', 'toy'], ['la naturaleza', 'nature'], ['el medio ambiente', 'environment'], ['reciclar', 'to recycle'], ['la contaminación', 'pollution'],
  ['la película', 'movie'], ['la noticia', 'news item'], ['el periódico', 'newspaper'], ['mejorar', 'to improve'],
];
export const VOCAB3 = [
  ['el desafío', 'challenge'], ['la inversión', 'investment'], ['la empresa', 'company'], ['el comercio', 'trade'], ['la desigualdad', 'inequality'], ['el derecho', 'right / law'],
  ['la herencia', 'heritage / inheritance'], ['la belleza', 'beauty'], ['la tecnología', 'technology'], ['el desarrollo', 'development'], ['la amenaza', 'threat'],
  ['el ciudadano', 'citizen'], ['el bienestar', 'well-being'], ['la identidad', 'identity'], ['aprovechar', 'to take advantage of'], ['lograr', 'to achieve'], ['el ámbito', 'field / sphere'],
  ['sin embargo', 'however'], ['por lo tanto', 'therefore'], ['a pesar de', 'despite'], ['además', 'furthermore'], ['el compromiso', 'commitment'], ['el éxito', 'success'],
];

// ---------------- Math 3 / Precalc / Physics ----------------
export const math = {
  quadratic() {
    const r1 = rnd(-7, 7), r2v = rnd(-7, 7); const b = -(r1 + r2v), c = r1 * r2v;
    const s = `x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x ${c < 0 ? '−' : '+'} ${Math.abs(c)} = 0`;
    const sol = [r1, r2v].sort((a, b) => a - b).join(', ');
    return Q(`Solve: ${s}`, `x = ${sol}`, [`x = ${[-r1, -r2v].sort((a, b) => a - b).join(', ')}`, `x = ${[r1, -r2v].sort((a, b) => a - b).join(', ')}`, `x = ${b}, ${c}`], `Factor: find two numbers that multiply to ${c} and add to ${b}: ${-r1} and ${-r2v}. So (x ${-r1 < 0 ? '−' : '+'} ${Math.abs(r1)})(x ${-r2v < 0 ? '−' : '+'} ${Math.abs(r2v)}) = 0.`, ['Factor x² + bx + c: two numbers that multiply to c and add to b.', 'Then set each factor to zero - watch the signs flip.']);
  },
  exponent() {
    const a = rnd(2, 6), m = rnd(2, 6), n = rnd(2, 5);
    const k = pick(['mul', 'div', 'pow']);
    if (k === 'mul') return Q(`Simplify x^${m} · x^${n}`, `x^${m + n}`, [`x^${m * n}`, `x^${Math.abs(m - n)}`, `${2}x^${m + n}`], 'Same base, multiply -> ADD exponents.', ['Product rule: xᵃ · xᵇ = xᵃ⁺ᵇ.', 'Add, don\'t multiply.']);
    if (k === 'div') return Q(`Simplify x^${m + n} / x^${n}`, `x^${m}`, [`x^${m + 2 * n}`, `x^${(m + n) / n}`.replace(/\.\d+/, ''), `x^${n}`], 'Same base, divide -> SUBTRACT exponents.', ['Quotient rule: xᵃ / xᵇ = xᵃ⁻ᵇ.', 'Top minus bottom.']);
    return Q(`Simplify (${a}x^${m})^${n}`, `${a ** n}x^${m * n}`, [`${a * n}x^${m * n}`, `${a ** n}x^${m + n}`, `${a}x^${m * n}`], 'Power of a product: raise EACH factor; multiply exponents.', ['(abᵐ)ⁿ = aⁿ bᵐⁿ.', 'The coefficient gets raised to the power too.']);
  },
  log() {
    const b = pick([2, 3, 5, 10]), e = rnd(1, 4); const v = b ** e;
    return Q(`log_${b}(${v}) = ?`, e, [v / b, b * e, e + 1], `${b}^${e} = ${v}, so log_${b}(${v}) = ${e}.`, ['log_b(x) asks: b to what power gives x?', `Count how many ${b}s multiply to ${v}.`]);
  },
  linearSystem() {
    const x = rnd(-5, 6), y = rnd(-5, 6), a = rnd(1, 4), b = rnd(1, 4), c = rnd(1, 4), d = rnd(-3, 3) || 1;
    return Q(`Solve: ${a}x + ${b}y = ${a * x + b * y} and ${c}x ${d < 0 ? '−' : '+'} ${Math.abs(d)}y = ${c * x + d * y}`, `(${x}, ${y})`, [`(${y}, ${x})`, `(${-x}, ${y})`, `(${x}, ${-y})`], `Substitute (${x}, ${y}) into both equations to check.`, ['Elimination: scale one equation so a variable cancels.', 'Or check each answer choice in both equations - fastest on MCQ.']);
  },
  unitCircle() {
    const [ang, f, v] = pick([['30°', 'sin', '1/2'], ['60°', 'cos', '1/2'], ['45°', 'sin', '√2/2'], ['60°', 'sin', '√3/2'], ['30°', 'cos', '√3/2'], ['90°', 'cos', '0'], ['180°', 'cos', '−1'], ['45°', 'tan', '1'], ['60°', 'tan', '√3'], ['120°', 'sin', '√3/2'], ['150°', 'cos', '−√3/2'], ['270°', 'sin', '−1']]);
    return Q(`${f}(${ang}) = ?`, v, ['1/2', '√3/2', '√2/2', '−1/2', '0', '1'].filter(x => x !== v).slice(0, 3), `Unit circle: ${f}(${ang}) = ${v}.`, ['Unit circle: (cos θ, sin θ). 30° -> (√3/2, 1/2), 45° -> (√2/2, √2/2), 60° -> (1/2, √3/2).', 'Use the reference angle, then the quadrant sign (All Students Take Calculus).']);
  },
  transform() {
    const hh = rnd(-5, 5) || 2, k = rnd(-5, 5) || -3;
    const f = `f(x) = (x ${hh < 0 ? '+' : '−'} ${Math.abs(hh)})² ${k < 0 ? '−' : '+'} ${Math.abs(k)}`;
    return Q(`Vertex of ${f}?`, `(${hh}, ${k})`, [`(${-hh}, ${k})`, `(${hh}, ${-k})`, `(${k}, ${hh})`], 'Vertex form (x − h)² + k has vertex (h, k). The sign inside flips.', ['y = (x − h)² + k -> vertex (h, k).', 'Inside the parentheses, the shift is the opposite sign.']);
  },
  kinematics() {
    const v0 = rnd(0, 10), a = rnd(1, 6), t = rnd(2, 6); const v = v0 + a * t;
    return Q(`A car starts at ${v0} m/s and accelerates at ${a} m/s² for ${t} s. Final speed?`, `${v} m/s`, [`${a * t} m/s`, `${v0 + a} m/s`, `${v0 * t + a} m/s`], `v = v₀ + at = ${v0} + ${a}×${t} = ${v} m/s.`, ['v = v₀ + at.', 'Acceleration × time = change in speed.']);
  },
  newton2() {
    const m = rnd(2, 20), a = rnd(1, 9); const F = m * a;
    return Q(`Net force on a ${m} kg object accelerating at ${a} m/s²?`, `${F} N`, [`${m + a} N`, `${r2(m / a)} N`, `${F * 9.8} N`.replace(/\.\d+/, '')], `F = ma = ${m}×${a} = ${F} N.`, ['Newton\'s 2nd law: F = ma.', 'kg × m/s² = newtons.']);
  },
  energy() {
    const m = rnd(1, 10), v = rnd(2, 10); const KE = 0.5 * m * v * v;
    return Q(`Kinetic energy of a ${m} kg object moving at ${v} m/s?`, `${KE} J`, [`${m * v} J`, `${m * v * v} J`, `${0.5 * m * v} J`], `KE = ½mv² = 0.5×${m}×${v}² = ${KE} J.`, ['KE = ½ m v².', 'Square the speed first.']);
  },
  ohm() {
    const I = rnd(1, 5), R = rnd(2, 20); const V = I * R;
    return Q(`A ${R} Ω resistor carries ${I} A. Voltage across it?`, `${V} V`, [`${r2(R / I)} V`, `${R + I} V`, `${V * 2} V`], `V = IR = ${I}×${R} = ${V} V.`, ['Ohm\'s law: V = IR.', 'Multiply current by resistance.']);
  },
};

// ---------------- Finance (Business Finance / Personal Finance) ----------------
export const fin = {
  compound() {
    const P = rnd(1, 10) * 1000, r = pick([4, 5, 6, 7, 8]), t = pick([5, 10, 20]);
    const A = Math.round(P * (1 + r / 100) ** t);
    return Q(`$${P.toLocaleString()} grows at ${r}% compounded yearly for ${t} years. About how much?`, `$${A.toLocaleString()}`, [`$${Math.round(P * (1 + r * t / 100)).toLocaleString()}`, `$${Math.round(P * r * t / 100).toLocaleString()}`, `$${Math.round(A * 1.3).toLocaleString()}`], `A = P(1 + r)^t = ${P}×${(1 + r / 100)}^${t} ≈ $${A.toLocaleString()}. Rule of 72: doubles every ~${Math.round(72 / r)} years.`, ['Compound: A = P(1 + r)ᵗ.', `Rule of 72: money doubles about every 72 ÷ ${r} years.`]);
  },
  ruleOf72() {
    const r = pick([3, 4, 6, 8, 9, 12]);
    return Q(`At ${r}% per year, about how many years to double your money?`, `${72 / r} years`, [`${r * 2} years`, `${100 / r} years`.replace(/\.\d+/, ''), `${72 * r} years`], `Rule of 72: 72 ÷ ${r} = ${72 / r}.`, ['Rule of 72.', 'Divide 72 by the rate.']);
  },
  ratio() {
    const ca = rnd(20, 90) * 10, cl = rnd(15, 60) * 10; const cr = r2(ca / cl);
    return Q(`Current assets $${ca}k, current liabilities $${cl}k. Current ratio?`, cr, [r2(cl / ca), r2(ca - cl), r2(cr + 1)], `Current ratio = current assets ÷ current liabilities = ${cr}. Above 1 means short-term obligations are covered.`, ['Liquidity ratio.', 'Current assets ÷ current liabilities.']);
  },
};
