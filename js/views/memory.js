// Memory: the research-backed way to keep what you hear.
// 1) Remember it: explain in your own words (generation) -> recall it right away (retrieval)
//    -> it comes back tomorrow, then at growing gaps (successive relearning).
// 2) Memory palace (method of loci) for lists and sequences, plus a word drill to train it.
import { S, save, uid, recordActivity, autoLog, today, addDays } from '../store.js';
import { h, card, toast, md, shuffle } from '../ui.js';
import { hasAI, memoryCards, aiErrorText } from '../ai.js';
import { dueCards, cardKey, scheduleTomorrow, study } from './cards.js';
import { RUBRIC } from '../data/decaexam.js';
import * as fx from '../fx.js';

const DECK = 'Remember it';
const back = (href = '#/memory', t = '← Memory') => h('a', { href, class: 'muted small' }, t);
const head = (t, sub, b = back()) => h('div', { class: 'page-head' }, h('div', {}, b, h('h1', {}, t), sub ? h('div', { class: 'sub' }, sub) : null));
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function close(a, b) {
  a = norm(a); b = norm(b);
  if (!a || !b) return false;
  if (a === b || (a.length >= 4 && (b.includes(a) || a.includes(b)))) return true;
  // key words: "close sale" matches "Close the sale"
  const key = s => s.split(' ').filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'your', 'you'].includes(w));
  const kb = key(b), ka = key(a);
  if (kb.length > 1 && kb.filter(w => ka.some(x => x === w || x.startsWith(w.slice(0, 4)))).length / kb.length >= 0.6) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  return a.slice(i + 1) === b.slice(i + 1) || a.slice(i + 1) === b.slice(i) || a.slice(i) === b.slice(i + 1);
}

export function render(root, p = []) {
  if (p[0] === 'add') return add(root);
  if (p[0] === 'palace') return palace(root, p.slice(1));
  if (p[0] === 'study') return study(root, null, { back: '#/memory', limit: 20 });
  return hub(root);
}

// ---------- hub ----------
function hub(root) {
  const st = S();
  const due = dueCards().length;
  const mine = st.cards.filter(c => c.deck === DECK).length;
  const runs = st.memRuns || [];
  const best = runs.reduce((m, r) => Math.max(m, r.n), 0);
  root.append(
    head('Memory', 'Hear it once, keep it for years: explain it, recall it, review it at growing gaps.', back('#/practice', '← Practice')),
    h('a', { class: 'card accent', href: '#/memory/add', style: { display: 'block', textDecoration: 'none', marginBottom: '12px' } },
      h('h3', {}, '🧠 Remember something'),
      h('div', { class: 'small', style: { opacity: .85 } }, 'Just heard something worth keeping? 1 minute: say it in your words, recall it once, done. Pace brings it back at the right times.')),
    h('div', { class: 'grid g2' },
      h('a', { class: 'tile', href: '#/memory/study' }, h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic' }, '↻'), h('span', { class: 'chip gold' }, `${due} due`)), h('h4', {}, 'Recall from memory'), h('div', { class: 'muted' }, due ? 'Try to answer before you flip. The effort is what makes it stick.' : 'Nothing due. Your cards come back on their own.')),
      h('a', { class: 'tile', href: '#/memory/palace' }, h('div', { class: 'tile-top' }, h('div', { class: 'tile-ic' }, '🏛'), best ? h('span', { class: 'chip acc' }, `best ${best} words`) : null), h('h4', {}, 'Memory palace'), h('div', { class: 'muted' }, 'The memory-champion method for lists and steps in order.'))),
    h('div', { class: 'small muted', style: { margin: '8px 2px 14px' } }, `${mine} things captured · flashcards also show up in your daily session.`),
    card('The 5 rules (what the research actually says)', h('ol', { class: 'mem-rules' },
      rule('Make it, don\'t just read it.', 'Say it back in your own words and add "because…". Producing an answer beats rereading it (generation effect, about half a standard deviation).'),
      rule('Recall it within a minute.', 'Look away and pull it out of your head once. Retrieval is the strongest memory tool there is; rereading and highlighting are weak.'),
      rule('Recall it again at growing gaps.', 'About 1 day, 3 days, a week, a month. Even things you got 100% right are mostly gone in a week without this. Pace schedules it.'),
      rule('Sleep 8-9 hours.', 'Sleep is when memories get stored. An all-nighter before or after learning clearly hurts memory.'),
      rule('Move before you study, not during.', '10-30 min of moderate exercise before learning helps long-term memory. Exercise during learning hurts it.'))),
    h('details', { class: 'card later' }, h('summary', {}, h('b', {}, 'Is photographic memory real? (and what to skip)')),
      h('div', { class: 'stack small', style: { marginTop: '10px' } },
        h('p', {}, 'No adult has reliably shown a true photographic memory. Memory champions tested in brain scans had normal IQs and normal brains; 9 of 10 used the memory palace. Ordinary people who trained it 30 min a day for 6 weeks doubled their word recall and kept it 4 months later.'),
        h('p', {}, h('b', {}, 'Skip: '), 'brain-training games (you get better at the game, not at school), memory supplements (little evidence for healthy people), and rereading/highlighting as your main study method.'))));
}
const rule = (t, d) => h('li', {}, h('b', {}, t), ' ', h('span', { class: 'muted' }, d));

// ---------- Remember it: capture -> immediate recall -> schedule ----------
function add(root) {
  const cue = h('input', { class: 'input', placeholder: 'What is it about? (e.g. "Break-even point")' });
  const text = h('textarea', { class: 'input', rows: 5, placeholder: 'Explain it like you\'re teaching a friend. Tip: tap 🎤 on your keyboard to talk instead of type.' });
  const link = h('textarea', { class: 'input', rows: 2, placeholder: 'Optional: why is it true, or what does it remind you of?' });
  const useAI = h('input', { type: 'checkbox', checked: hasAI() });
  const go = h('button', { class: 'btn primary wide big' }, 'Next: recall it once ▶');
  go.onclick = () => {
    if (!cue.value.trim()) return toast('Give it a short title first');
    if (text.value.trim().length < 8) return toast('Write a sentence or two in your own words');
    recallNow(root, { cue: cue.value.trim(), text: text.value.trim(), link: link.value.trim(), ai: useAI.checked && hasAI() });
  };
  root.append(head('Remember something', 'Putting it in your own words is step one of remembering it.'),
    h('div', { class: 'card stack' },
      h('label', { class: 'stack' }, h('b', {}, 'Topic'), cue),
      h('label', { class: 'stack' }, h('b', {}, 'In your own words'), text),
      h('label', { class: 'stack' }, h('b', {}, 'Connect it'), link),
      hasAI() ? h('label', { class: 'row small' }, useAI, h('span', {}, 'Also have Claude write 1-4 quick questions from it (and flag anything that\'s off)')) : h('div', { class: 'small muted' }, 'Add a Claude key in Settings and Pace can also write quick questions from it.'),
      go));
  setTimeout(() => cue.focus(), 300);
}

function recallNow(root, item) {
  root.innerHTML = '';
  const t0 = Date.now();
  const ta = h('textarea', { class: 'input', rows: 5, placeholder: 'Type what you remember. Messy is fine.' });
  const body = h('div', { class: 'stack' });
  const reveal = h('button', { class: 'btn primary wide big' }, 'Check against what I wrote');
  reveal.onclick = () => {
    reveal.remove(); ta.disabled = true;
    body.append(h('div', { class: 'card2 stack', style: { padding: '12px', borderRadius: '14px' } }, h('div', { class: 'small muted' }, 'What you wrote before'), h('div', { html: md(item.text) }), item.link ? h('div', { class: 'small muted', html: md('Connection: ' + item.link) }) : null),
      h('div', { class: 'small muted' }, 'How close were you?'),
      h('div', { class: 'grid', style: { gridTemplateColumns: 'repeat(3,1fr)' } },
        ...[['Missed it', 0], ['Partly', 1], ['Got it', 2]].map(([l, g]) => h('button', { class: `btn ${g === 2 ? 'primary' : ''}`, onclick: () => finish(g) }, l))));
  };
  async function finish(g) {
    body.querySelectorAll('button').forEach(b => (b.disabled = true));
    const c = { id: uid(), deck: DECK, front: `Explain from memory: **${item.cue}**`, back: item.text + (item.link ? `\n\n_Connects to:_ ${item.link}` : ''), src: 'remember', ts: Date.now() };
    S().cards.push(c);
    // first review: tomorrow if you got it, still tomorrow if not (it also stays fresh tonight)
    S().srs[cardKey(c)] = { due: addDays(today(), 1), ivl: 1, ease: g === 0 ? 2.15 : 2.4, reps: 0, lapses: g === 0 ? 1 : 0, src: 'cards', ts: Date.now() };
    let extra = 0;
    if (item.ai) {
      try {
        const r = await memoryCards(item);
        for (const q of (r.cards || []).slice(0, 4)) { const qc = { id: uid(), deck: DECK, front: q.front, back: q.back, src: 'remember', ts: Date.now() + ++extra }; S().cards.push(qc); scheduleTomorrow(qc); }
      } catch (e) { toast(aiErrorText(e), 'bad'); }
    }
    save();
    recordActivity({ area: 'review', ms: Date.now() - t0, q: 1, correct: g === 2 ? 1 : 0 });
    autoLog('tip', `Remembered: ${item.cue}`, ['memory'], `mem:${c.id}`);
    root.innerHTML = '';
    root.append(h('div', { class: 'done-wrap' },
      h('div', { class: 'done-badge' }, '✓'),
      h('h1', {}, 'Locked in'),
      h('p', { class: 'muted' }, `"${item.cue}" comes back tomorrow, then in a few days, a week, and so on${extra ? `, plus ${extra} quick question${extra > 1 ? 's' : ''}` : ''}. ${g === 2 ? 'Nice recall.' : 'Missing it now is normal; the next recall is where it sticks.'}`),
      h('div', { class: 'stack', style: { width: '100%', maxWidth: '360px' } },
        h('button', { class: 'btn primary wide big', onclick: () => { root.innerHTML = ''; add(root); } }, '＋ Remember another'),
        h('a', { class: 'btn wide', href: '#/memory' }, 'Done'))));
    fx.burst(root.querySelector('.done-badge'));
  }
  body.append(reveal);
  root.append(head('Now recall it', 'Don\'t scroll up. Pulling it out of your head is what saves it.'),
    h('div', { class: 'card stack' },
      h('div', { class: 'small muted' }, 'Topic'), h('h2', {}, item.cue),
      ta, body));
  setTimeout(() => ta.focus(), 300);
}

// ---------- Memory palace ----------
const SPOT_HINTS = ['Front door', 'Shoe spot', 'Couch', 'TV', 'Kitchen table', 'Fridge', 'Sink', 'Stairs', 'Bathroom mirror', 'Your bed'];
const WORDS = 'anchor apple balloon banana basket battery bicycle blanket bottle bucket butter cactus camera candle carrot castle chain cheese cherry chicken clock cloud coconut compass cookie crown crystal diamond dolphin donkey dragon drum eagle egg elephant envelope feather flag flashlight fork fountain frog giraffe glove goat guitar hammer helmet honey horse iceberg igloo jacket jellyfish kangaroo kettle key kite ladder lamp lemon lion lobster magnet map mask microphone mirror monkey mushroom necklace needle nest octopus onion orange owl paintbrush parachute peanut pencil penguin piano pillow pineapple pizza pumpkin rabbit rainbow robot rocket rope sandwich saxophone scissors shark shovel snail snowman sock spider spoon statue sunflower sword taco telescope tiger tomato tornado tractor trophy trumpet turtle umbrella unicorn violin volcano waffle wallet whale whistle wizard zebra'.split(' ');
const PRESETS = () => [
  { name: 'DECA Financial Consulting rubric', items: RUBRIC.map(r => r.t) },
  { name: 'Financial statements (order to build them)', items: ['Income statement', 'Retained earnings', 'Balance sheet', 'Cash flow statement'] },
  { name: 'Selling process (DECA)', items: ['Approach', 'Determine needs', 'Present the product', 'Handle objections', 'Close the sale', 'Follow up'] },
];

function myPalace() { return (S().palaces || [])[0] || null; }

function palace(root, p) {
  const pal = myPalace();
  if (!pal || p[0] === 'edit') return buildPalace(root, pal);
  if (p[0] === 'drill') return drill(root, pal);
  if (p[0] === 'list') return storeList(root, pal);
  const runs = (S().memRuns || []).slice(0, 6);
  root.append(head(`🏛 ${pal.name}`, `${pal.spots.length} spots, always walked in the same order.`),
    h('div', { class: 'grid g2' },
      h('a', { class: 'tile', href: '#/memory/palace/list' }, h('div', { class: 'tile-ic' }, '📋'), h('h4', {}, 'Store a list'), h('div', { class: 'muted' }, 'Steps, rubrics, speech outlines. Saved as a card that comes back.')),
      h('a', { class: 'tile', href: '#/memory/palace/drill' }, h('div', { class: 'tile-ic' }, '🎯'), h('h4', {}, 'Word drill'), h('div', { class: 'muted' }, 'Random words to train the skill. The study that worked: 30 min a day for 6 weeks.'))),
    card('Your spots', h('ol', { class: 'small mem-spots' }, ...pal.spots.map(s => h('li', {}, s))), { action: h('a', { class: 'btn sm ghost', href: '#/memory/palace/edit' }, 'Edit') }),
    runs.length ? card('Recent drills', h('div', { class: 'stack small' }, ...runs.map(r => h('div', { class: 'row between' }, h('span', {}, new Date(r.ts).toLocaleDateString()), h('b', {}, `${r.n}/${r.of} words`))))) : null,
    h('details', { class: 'card later' }, h('summary', {}, h('b', {}, 'How the memory palace works')),
      h('ol', { class: 'small stack', style: { marginTop: '10px' } },
        h('li', {}, 'Picture walking through your place, stopping at each spot in order.'),
        h('li', {}, 'At each spot, put a picture of the thing you want to remember. Make it ', h('b', {}, 'big, weird, moving, or funny'), ', and touching the spot. A giant waffle stuck to the front door beats "a waffle near the door."'),
        h('li', {}, 'To recall, walk the route again and "look" at each spot.'),
        h('li', {}, 'Best for lists and orders. For ideas you need to understand (like NPV), explain-and-recall works better.'))));
}

function buildPalace(root, pal) {
  const name = h('input', { class: 'input', value: pal?.name || '', placeholder: 'e.g. My house' });
  const list = h('div', { class: 'stack' });
  const addSpot = v => { if (list.children.length >= 30) return; list.append(h('input', { class: 'input', value: v || '', placeholder: SPOT_HINTS[list.children.length] || `Spot ${list.children.length + 1}` })); };
  (pal?.spots || Array(10).fill('')).forEach(addSpot);
  const save_ = h('button', { class: 'btn primary wide big' }, 'Save my palace');
  save_.onclick = () => {
    const spots = [...list.children].map(i => i.value.trim()).filter(Boolean);
    if (spots.length < 5) return toast('Name at least 5 spots');
    const next = { id: pal?.id || uid(), name: name.value.trim() || 'My palace', spots, ts: Date.now() };
    S().palaces = [next, ...(S().palaces || []).filter(x => x.id !== next.id)];
    save(); toast('Palace saved', 'good'); location.hash = '#/memory/palace';
  };
  root.append(head(pal ? 'Edit your palace' : 'Build your memory palace', 'Pick a place you could walk through with your eyes closed.', back(pal ? '#/memory/palace' : '#/memory')),
    h('div', { class: 'card stack' },
      h('p', { class: 'small muted' }, 'Walk it in your head and name spots in the order you pass them. Use real, distinct things (the couch, not "living room"). Never change the order later.'),
      h('label', { class: 'stack' }, h('b', {}, 'Place'), name),
      h('b', {}, 'Spots in order'), list,
      h('button', { class: 'btn ghost', onclick: () => addSpot('') }, '＋ Add a spot'),
      save_));
}

// Word drill: place N random words, then recall them spot by spot.
function drill(root, pal) {
  let n = Math.min(10, pal.spots.length);
  const wrap = h('div', { class: 'stack' });
  root.append(head('Word drill', 'Place each word at its spot with a vivid picture, then recall.', back('#/memory/palace', '← Palace')), wrap);
  const pickN = () => {
    wrap.innerHTML = '';
    wrap.append(h('div', { class: 'card stack' }, h('b', {}, 'How many words?'),
      h('div', { class: 'grid', style: { gridTemplateColumns: 'repeat(3,1fr)' } }, ...[5, 10, 15, 20, 30].filter(k => k <= pal.spots.length || k === 5).map(k => h('button', { class: `btn ${k === n ? 'primary' : ''}`, onclick: () => { n = Math.min(k, pal.spots.length); learnPhase(); } }, `${k}`))),
      h('p', { class: 'small muted' }, 'Start with 5 or 10. Add spots to your palace for longer drills.')));
  };
  const learnPhase = () => {
    const words = shuffle(WORDS).slice(0, n);
    const t0 = Date.now();
    wrap.innerHTML = '';
    wrap.append(h('div', { class: 'card stack' },
      h('p', { class: 'small muted' }, 'Take your time. For each one, picture the thing big and weird at that spot.'),
      h('div', { class: 'mem-pairs' }, ...words.map((w, i) => h('div', { class: 'row between' }, h('span', { class: 'muted small' }, `${i + 1}. ${pal.spots[i]}`), h('b', {}, w)))),
      h('button', { class: 'btn primary wide big', onclick: () => recallPhase(words, t0) }, 'I\'ve placed them · hide & recall')));
  };
  const recallPhase = (words, t0) => {
    wrap.innerHTML = '';
    const ins = words.map((_, i) => h('input', { class: 'input', placeholder: pal.spots[i], autocapitalize: 'off', autocomplete: 'off' }));
    wrap.append(h('div', { class: 'card stack' },
      h('p', { class: 'small muted' }, 'Walk the route. What\'s at each spot?'),
      ...ins.map((inp, i) => h('label', { class: 'stack' }, h('span', { class: 'small' }, `${i + 1}. ${pal.spots[i]}`), inp)),
      h('button', { class: 'btn primary wide big', onclick: () => score(words, ins, t0) }, 'Check')));
    setTimeout(() => ins[0].focus(), 200);
  };
  const score = (words, ins, t0) => {
    const ok = words.map((w, i) => close(ins[i].value, w));
    const right = ok.filter(Boolean).length;
    (S().memRuns ||= []).unshift({ ts: Date.now(), n: right, of: words.length, ms: Date.now() - t0 });
    S().memRuns = S().memRuns.slice(0, 100);
    save();
    recordActivity({ area: 'review', ms: Date.now() - t0, q: words.length, correct: right });
    wrap.innerHTML = '';
    wrap.append(h('div', { class: 'card stack' },
      h('div', { class: 'sum-score' }, h('span', { class: 'big' }, `${right}/${words.length}`), h('span', {}, 'recalled')),
      h('div', { class: 'mem-pairs' }, ...words.map((w, i) => h('div', { class: 'row between' }, h('span', { class: 'small muted' }, pal.spots[i]), h('span', {}, ok[i] ? '✓ ' : '✗ ', h('b', {}, w), !ok[i] && ins[i].value ? h('span', { class: 'small muted' }, ` (you: ${ins[i].value})`) : null)))),
      h('p', { class: 'small muted' }, right === words.length ? 'Perfect. Try more words next time.' : 'Misses usually mean the picture was too plain. Make it bigger, stranger, or moving.'),
      h('button', { class: 'btn primary wide', onclick: learnPhase }, 'Again'),
      h('a', { class: 'btn wide', href: '#/memory/palace' }, 'Done')));
    if (right === words.length) fx.burst(wrap.querySelector('.sum-score'));
  };
  pickN();
}

// Store a real list in the palace; it becomes a card that comes back on schedule.
function storeList(root, pal) {
  const name = h('input', { class: 'input', placeholder: 'List name (e.g. Sales process steps)' });
  const items = h('textarea', { class: 'input', rows: 7, placeholder: 'One item per line, in order' });
  const presets = h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } }, ...PRESETS().map(pr => h('button', { class: 'chip', onclick: () => { name.value = pr.name; items.value = pr.items.join('\n'); } }, pr.name)));
  const wrap = h('div', { class: 'stack' });
  const go = h('button', { class: 'btn primary wide big' }, 'Place them ▶');
  go.onclick = () => {
    const list = items.value.split('\n').map(s => s.trim()).filter(Boolean);
    if (list.length < 2) return toast('Add at least 2 items');
    if (list.length > pal.spots.length) return toast(`Your palace has ${pal.spots.length} spots. Add spots or shorten the list.`, 'bad');
    place(name.value.trim() || 'My list', list);
  };
  root.append(head('Store a list', 'Each item goes at one spot, in order.', back('#/memory/palace', '← Palace')), wrap);
  wrap.append(h('div', { class: 'card stack' }, h('b', {}, 'Quick picks'), presets, name, items, go));

  function place(title, list) {
    const pics = [];
    let i = 0;
    const step = () => {
      wrap.innerHTML = '';
      if (i >= list.length) return test();
      const pic = h('input', { class: 'input', placeholder: 'Optional: your picture (e.g. a giant handshake hugging the couch)' });
      wrap.append(h('div', { class: 'card stack' },
        h('div', { class: 'small muted' }, `Spot ${i + 1} of ${list.length}`),
        h('h2', {}, pal.spots[i]),
        h('div', {}, 'Put here: ', h('b', {}, list[i])),
        h('p', { class: 'small muted' }, 'Turn it into something you can see. Big, strange, moving, touching the spot. Abstract words? Use a sound-alike or a symbol.'),
        pic,
        h('button', { class: 'btn primary wide big', onclick: () => { pics[i] = pic.value.trim(); i++; step(); } }, i + 1 < list.length ? 'Next spot ▶' : 'Done placing ▶')));
      setTimeout(() => pic.focus(), 200);
    };
    const test = () => {
      const ins = list.map((_, k) => h('input', { class: 'input', placeholder: pal.spots[k], autocomplete: 'off' }));
      wrap.append(h('div', { class: 'card stack' },
        h('p', { class: 'small muted' }, 'Walk your palace. What did you put at each spot?'),
        ...ins.map((inp, k) => h('label', { class: 'stack' }, h('span', { class: 'small' }, `${k + 1}. ${pal.spots[k]}`), inp)),
        h('button', { class: 'btn primary wide big', onclick: () => finish(ins) }, 'Check')));
    };
    const finish = ins => {
      const ok = list.map((w, k) => close(ins[k].value, w));
      const right = ok.filter(Boolean).length;
      const c = { id: uid(), deck: DECK, front: `🏛 Walk your palace: **${title}** (${list.length} items, in order)`, back: list.map((w, k) => `${k + 1}. ${pal.spots[k]} → **${w}**${pics[k] ? ` (${pics[k]})` : ''}`).join('\n'), src: 'palace', ts: Date.now() };
      S().cards.push(c); scheduleTomorrow(c); save();
      wrap.innerHTML = '';
      wrap.append(h('div', { class: 'card stack' },
        h('div', { class: 'sum-score' }, h('span', { class: 'big' }, `${right}/${list.length}`), h('span', {}, 'on the first walk')),
        h('div', { class: 'mem-pairs' }, ...list.map((w, k) => h('div', { class: 'row between' }, h('span', { class: 'small muted' }, pal.spots[k]), h('span', {}, ok[k] ? '✓ ' : '✗ ', h('b', {}, w))))),
        h('p', { class: 'small muted' }, 'Saved as a card. Tomorrow you\'ll walk it again from memory, then at growing gaps.'),
        h('a', { class: 'btn primary wide', href: '#/memory/palace' }, 'Done')));
    };
    step();
  }
}
