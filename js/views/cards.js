// Flashcards: from a photo of notes, pasted notes, a Quizlet export, or automatically
// from questions missed twice. Reviewed with the same spaced-repetition schedule.
import { S, save, uid, srsReview, dueItems, recordActivity, removeById, today } from '../store.js';
import { h, card, toast, md, seg, modal } from '../ui.js';
import { hasAI, cardsFromNotes, imageBlock, aiErrorText } from '../ai.js';
import * as fx from '../fx.js';

export const cardKey = c => `card:${c.id}`;
export const dueCards = () => { const due = new Set(dueItems(k => k.startsWith('card:')).map(i => i.key)); return S().cards.filter(c => due.has(cardKey(c)) || !S().srs[cardKey(c)]); };

export function addCards(deck, list, src) {
  const now = Date.now();
  const made = list.filter(c => c.front && c.back).map((c, i) => ({ id: uid(), deck: deck || 'General', front: c.front.trim(), back: c.back.trim(), src, ts: now + i }));
  S().cards.push(...made);
  save();
  return made.length;
}

// Called after every round: a question missed in 2+ separate rounds becomes a card.
export function cardsFromRepeatedMisses(misses) {
  const st = S(); const counts = (st.missCounts ||= {});
  for (const m of misses) {
    const k = m.q.key && !m.q.key.startsWith('math:') && !m.q.key.startsWith('scen:') ? m.q.key : m.q.q.slice(0, 120);
    counts[k] = (counts[k] || 0) + 1;
    if (counts[k] === 2 && !st.cards.some(c => c.missKey === k)) {
      const front = m.q.mc ? m.q.q : `${m.q.q}`;
      const back = `${m.q.mc ? m.q.a : m.q.a}${m.q.explain ? '\n' + m.q.explain : m.q.steps ? '\n' + m.q.steps.join(' → ') : ''}`;
      st.cards.push({ id: uid(), deck: 'Missed twice', front, back: String(back), src: 'miss', missKey: k, ts: Date.now() });
      toast('Missed twice → added to your flashcards');
    }
  }
  save();
}

export function render(root, p) {
  if (p[0] === 'study') return study(root, p[1] ? decodeURIComponent(p[1]) : null);
  const st = S();
  const decks = {};
  st.cards.forEach(c => (decks[c.deck] ||= []).push(c));
  const due = dueCards();
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('a', { href: '#/learn', class: 'muted small' }, '← Learn'), h('h1', {}, 'Flashcards'), h('div', { class: 'sub' }, `${st.cards.length} cards · ${due.length} due`))),
    h('div', { class: 'row', style: { marginBottom: '12px' } }, h('a', { class: 'btn primary', href: '#/learn/cards/study', style: { flex: 1 } }, due.length ? `Study ${Math.min(30, due.length)} due` : 'Nothing due - study all')),
    makeCard(() => { root.innerHTML = ''; render(root, []); }),
    card('Decks', Object.keys(decks).length ? h('div', { class: 'unit-list' }, ...Object.entries(decks).map(([d, cs]) => {
      const dd = cs.filter(c => due.includes(c)).length;
      return h('div', { class: 'unit-row' }, h('span', { class: 'unit-n' }, cs.length), h('div', {}, h('div', { style: { fontWeight: 600 } }, d), h('div', { class: 'unit-meta' }, `${dd} due · ${cs[0].src === 'miss' ? 'from repeated misses' : cs[0].src}`)),
        h('div', { class: 'row' }, h('a', { class: 'btn sm', href: `#/learn/cards/study/${encodeURIComponent(d)}` }, 'Study'), h('button', { class: 'btn sm ghost', onclick: () => browse(d) }, 'View')));
    })) : h('p', { class: 'empty' }, 'No cards yet. Make some above - or just keep practicing: anything you miss twice becomes a card.')));
}

function makeCard(refresh) {
  let mode = 'photo';
  const deckIn = h('input', { class: 'input', placeholder: 'Deck name (e.g. AP World Unit 3)' });
  const body = h('div', { class: 'stack' });
  const busy = (b, t) => { b.disabled = true; b.dataset.t = b.textContent; b.textContent = t; };
  const idle = b => { b.disabled = false; b.textContent = b.dataset.t; };
  const draw = () => {
    body.innerHTML = '';
    if (mode === 'photo') {
      const file = h('input', { type: 'file', accept: 'image/*', capture: 'environment', class: 'input' });
      const go = h('button', { class: 'btn primary', disabled: !hasAI() }, hasAI() ? 'Make cards from photo' : 'Add a Claude key in Settings first');
      go.onclick = async () => { if (!file.files[0]) return toast('Take or choose a photo first'); busy(go, 'Reading your notes…'); try { const r = await cardsFromNotes({ image: await imageBlock(file.files[0]), deck: deckIn.value }); const n = addCards(deckIn.value || r.deck, r.cards, 'photo'); toast(`Made ${n} cards`, 'good'); refresh(); } catch (e) { toast(aiErrorText(e), 'bad'); idle(go); } };
      body.append(file, h('p', { class: 'small muted' }, 'The photo is sent to Claude to read and is not saved.'), go);
    } else if (mode === 'paste') {
      const ta = h('textarea', { class: 'input', rows: 7, placeholder: 'Paste notes or a study guide…' });
      const go = h('button', { class: 'btn primary', disabled: !hasAI() }, hasAI() ? 'Make cards' : 'Add a Claude key in Settings first');
      go.onclick = async () => { if (ta.value.trim().length < 40) return toast('Paste a bit more'); busy(go, 'Making cards…'); try { const r = await cardsFromNotes({ text: ta.value, deck: deckIn.value }); const n = addCards(deckIn.value || r.deck, r.cards, 'paste'); toast(`Made ${n} cards`, 'good'); refresh(); } catch (e) { toast(aiErrorText(e), 'bad'); idle(go); } };
      body.append(ta, go);
    } else if (mode === 'quizlet') {
      const ta = h('textarea', { class: 'input', rows: 7, placeholder: 'term<TAB>definition\none per line' });
      const go = h('button', { class: 'btn primary' }, 'Import');
      go.onclick = () => {
        const lines = ta.value.split(/\n|;\s*(?=\S+\t)/).map(l => l.trim()).filter(Boolean);
        const pairs = lines.map(l => { const t = l.split('\t'); if (t.length >= 2) return { front: t[0], back: t.slice(1).join(' ') }; const d = l.split(/\s[-–—:]\s/); return d.length >= 2 ? { front: d[0], back: d.slice(1).join(' - ') } : null; }).filter(Boolean);
        if (!pairs.length) return toast('No cards found - in Quizlet use Export with "Tab" between term and definition.', 'bad');
        toast(`Imported ${addCards(deckIn.value || 'Quizlet import', pairs, 'quizlet')} cards`, 'good'); refresh();
      };
      body.append(h('p', { class: 'small muted' }, 'In Quizlet: ⋯ → Export → copy. Default format (tab between term and definition, new line between cards) works. "term - definition" lines work too.'), ta, go);
    } else {
      const f = h('input', { class: 'input', placeholder: 'Front' }), b = h('textarea', { class: 'input', rows: 3, placeholder: 'Back' });
      const go = h('button', { class: 'btn primary', onclick: () => { if (!f.value.trim() || !b.value.trim()) return; addCards(deckIn.value || 'My cards', [{ front: f.value, back: b.value }], 'manual'); f.value = b.value = ''; toast('Added', 'good'); refresh(); } }, 'Add card');
      body.append(f, b, go);
    }
  };
  draw();
  return card('Make cards', h('div', { class: 'stack' }, seg([{ label: 'Photo', value: 'photo' }, { label: 'Paste', value: 'paste' }, { label: 'Quizlet', value: 'quizlet' }, { label: 'Manual', value: 'manual' }], mode, v => { mode = v; draw(); }), deckIn, body));
}

function browse(deck) {
  const list = h('div', { class: 'feedback-rows' });
  const draw = () => { list.innerHTML = ''; S().cards.filter(c => c.deck === deck).forEach(c => list.append(h('div', {}, h('div', { class: 'row between' }, h('b', { html: md(c.front) }), h('button', { class: 'btn sm ghost', onclick: () => { removeById('cards', c.id); draw(); } }, 'Delete')), h('div', { class: 'small', html: md(c.back) })))); };
  draw();
  modal(h('div', { class: 'stack' }, h('h2', {}, deck), list));
}

function study(root, deck) {
  let queue = (deck ? S().cards.filter(c => c.deck === deck) : dueCards());
  if (!queue.length) queue = deck ? [] : [...S().cards];
  queue = queue.sort(() => Math.random() - 0.5).slice(0, 30);
  const t0 = Date.now();
  let i = 0, flipped = false, right = 0;
  const stage = h('div', { class: 'stack' });
  root.append(h('div', { class: 'round' },
    h('div', { class: 'round-top' }, h('a', { class: 'icon-btn', href: '#/learn/cards' }, '✕'), h('div', { class: 'round-title' }, deck || 'Due cards'), h('div', { class: 'round-clock', id: 'cardcount' }, '')), stage));
  const onKey = e => { if (e.key === ' ') { e.preventDefault(); flip(); } else if (flipped && '1234'.includes(e.key)) grade(+e.key - 1); };
  addEventListener('keydown', onKey);
  const done = () => {
    removeEventListener('keydown', onKey);
    recordActivity({ area: 'review', ms: Date.now() - t0, q: queue.length, correct: right });
    stage.innerHTML = '';
    stage.append(h('div', { class: 'summary' }, h('div', { class: 'sum-score' }, h('span', { class: 'big' }, `${right}/${queue.length}`), h('span', {}, 'remembered')), h('a', { class: 'btn primary wide', href: '#/learn/cards' }, 'Done')));
  };
  function flip() {
    if (flipped) return; flipped = true;
    const cardEl = stage.querySelector('.qcard');
    if (window.gsap) gsap.fromTo(cardEl, { rotateY: 90 }, { rotateY: 0, duration: 0.3, ease: 'power2.out' });
    cardEl.querySelector('.back').style.display = '';
    stage.querySelector('.flip-btn').replaceWith(h('div', { class: 'grid', style: { gridTemplateColumns: 'repeat(4,1fr)' } },
      ...[['Again', 'bad'], ['Hard', ''], ['Good', 'good'], ['Easy', 'acc']].map(([l, cls], g) => h('button', { class: `btn ${g >= 2 ? 'primary' : ''}`, onclick: () => grade(g) }, l))));
  }
  function grade(g) {
    const c = queue[i];
    srsReview(cardKey(c), g, 'cards');
    if (g >= 2) right++; else queue.push(c); // again/hard come back this session
    if (g >= 2) fx.correct(stage.querySelector('.qcard')); else fx.wrong(stage.querySelector('.qcard'));
    i++; setTimeout(show, 220);
  }
  function show() {
    if (i >= queue.length || i > 60) return done();
    flipped = false;
    const c = queue[i];
    document.getElementById('cardcount').textContent = `${i + 1}/${queue.length}`;
    stage.innerHTML = '';
    stage.append(h('div', { class: 'qcard text', style: { minHeight: '260px', cursor: 'pointer', perspective: '800px' }, onclick: flip },
      h('div', { class: 'small muted' }, c.deck), h('div', { class: 'q-prompt', html: md(c.front) }),
      h('div', { class: 'back', style: { display: 'none', borderTop: '1px solid var(--line)', marginTop: '14px', paddingTop: '14px' }, html: md(c.back) })),
      h('button', { class: 'btn primary wide flip-btn', onclick: flip }, 'Show answer (space)'));
    fx.pop(stage.firstChild);
  }
  if (!queue.length) { stage.append(h('p', { class: 'empty' }, 'No cards here yet.')); return () => removeEventListener('keydown', onKey); }
  show();
  return () => removeEventListener('keydown', onKey);
}
