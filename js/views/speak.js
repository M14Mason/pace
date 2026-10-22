// Speak: articulation training. Record -> live transcript -> local delivery metrics
// (pace, pauses, pitch/volume variation, fillers, hedges, vague words, repetition) ->
// Claude analysis of wording -> "say it sharper" drills built from your own sentences.
import { S, save, uid, audioDB, recordActivity, addRecord } from '../store.js';
import { h, card, toast, pct, svg, fmtMs } from '../ui.js';
import { hasAI, analyzeSpeech, checkDrill, aiErrorText } from '../ai.js';
import * as fx from '../fx.js';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

const PROMPTS = {
  en: [
    ['Explain', 'Explain how compound interest works to someone who has never heard of it.'],
    ['Explain', 'Explain why a company\'s stock can fall even after it reports record profits.'],
    ['Explain', 'Explain one cause of World War I as if teaching a class.'],
    ['Explain', 'Explain what a budget is and why it matters, in under a minute.'],
    ['Argue', 'Should high schools require a personal finance class? Take a side and defend it.'],
    ['Argue', 'Is it better to specialize early or explore many interests? Argue one side.'],
    ['Argue', 'Should social media companies be responsible for misinformation? Make your case.'],
    ['Describe', 'Describe a problem you solved recently - what happened, what you did, what you learned.'],
    ['Describe', 'Describe the best teacher or coach you\'ve had and what made them effective.'],
    ['Persuade', 'Convince a friend to start investing a small amount each month.'],
    ['Persuade', 'Pitch a small business idea in 60 seconds: problem, solution, why you.'],
    ['Summarize', 'Summarize something you read or watched this week and why it matters.'],
    ['Impromptu', 'What is one skill everyone should learn before 20? Why?'],
    ['Impromptu', 'Talk about a time you changed your mind about something.'],
    ['Compare', 'Compare saving money in a bank account vs investing it in an index fund.'],
  ],
  es: [
    ['Describir', 'Describe tu rutina diaria con detalles.'],
    ['Narrar', 'Cuenta lo que hiciste el fin de semana pasado (pretérito e imperfecto).'],
    ['Narrar', 'Describe cómo era tu vida cuando tenías diez años.'],
    ['Opinar', '¿Es importante aprender sobre el dinero en la escuela? ¿Por qué?'],
    ['Explicar', 'Explica cómo planearías un viaje a otro país.'],
    ['Opinar', '¿Qué harías si tuvieras un millón de dólares?'],
  ],
};

const FILLERS = ['um', 'uh', 'erm', 'uhm', 'like', 'you know', 'basically', 'literally', 'actually', 'i mean', 'so yeah', 'or something', 'and stuff'];
const HEDGES = ['i think', 'maybe', 'i guess', 'probably', 'kind of', 'sort of', 'i feel like', 'kinda', 'sorta', 'perhaps', 'i don\'t know', 'somewhat'];
const VAGUE = ['stuff', 'things', 'thing', 'very', 'really', 'a lot', 'good', 'bad', 'nice', 'big', 'pretty', 'whatever', 'everything'];
const ES_FILLERS = ['eh', 'este', 'pues', 'o sea', 'bueno', 'como que', 'entonces'];
const STOP = new Set('the a an and or but of to in on for with is are was were be been it this that i you he she we they my your our their at as by from so if then than not do does did have has had just can will would could should about into there here what which who when where why how me him her them us all some any more most also very really'.split(' '));

function countPhrases(text, list) {
  const t = ' ' + text.toLowerCase().replace(/[^\p{L}\s']/gu, ' ').replace(/\s+/g, ' ') + ' ';
  const hits = {};
  for (const p of list) { const m = t.split(` ${p} `).length - 1; if (m) hits[p] = m; }
  return hits;
}

export function textMetrics(text, durMs, lang = 'en') {
  const words = text.toLowerCase().match(/[\p{L}']+/gu) || [];
  const content = words.filter(w => !STOP.has(w) && w.length > 2);
  const freq = {}; content.forEach(w => (freq[w] = (freq[w] || 0) + 1));
  const repeats = Object.entries(freq).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const fillers = countPhrases(text, lang === 'es' ? ES_FILLERS : FILLERS);
  const hedges = lang === 'es' ? {} : countPhrases(text, HEDGES);
  const vague = lang === 'es' ? {} : countPhrases(text, VAGUE);
  const sum = o => Object.values(o).reduce((a, b) => a + b, 0);
  const mins = Math.max(0.1, durMs / 60000);
  return {
    words: words.length, wpm: Math.round(words.length / mins),
    fillers, fillerCount: sum(fillers), fillersPerMin: +(sum(fillers) / mins).toFixed(1),
    hedges, hedgeCount: sum(hedges), vague, vagueCount: sum(vague),
    repeats, ttr: +(new Set(content).size / Math.max(1, content.length)).toFixed(2),
    avgSentence: sentences.length > 1 ? Math.round(words.length / sentences.length) : null,
  };
}

// ---- recorder with live analysis ----
function autocorrPitch(buf, rate) {
  let rms = 0; for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.012) return { rms, f0: 0 };
  const minLag = Math.floor(rate / 400), maxLag = Math.floor(rate / 70);
  let best = 0, bestLag = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let c = 0; for (let i = 0; i < buf.length - lag; i += 2) c += buf[i] * buf[i + lag];
    if (c > best) { best = c; bestLag = lag; }
  }
  return { rms, f0: bestLag ? rate / bestLag : 0 };
}

class Recorder {
  constructor({ lang, onText, onFrame }) { Object.assign(this, { lang, onText, onFrame }); this.final = ''; this.frames = []; }
  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const ac = this.ac = new (window.AudioContext || window.webkitAudioContext)();
    const src = ac.createMediaStreamSource(this.stream);
    const an = this.an = ac.createAnalyser(); an.fftSize = 2048; src.connect(an);
    const buf = new Float32Array(an.fftSize);
    const mime = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
    this.chunks = [];
    if (window.MediaRecorder) { this.mr = new MediaRecorder(this.stream, mime ? { mimeType: mime } : undefined); this.mr.ondataavailable = e => e.data.size && this.chunks.push(e.data); this.mr.start(1000); }
    this.t0 = performance.now(); this.running = true;
    let n = 0;
    const loop = () => {
      if (!this.running) return;
      an.getFloatTimeDomainData(buf);
      if (n++ % 3 === 0) { const p = autocorrPitch(buf, ac.sampleRate); this.frames.push({ t: performance.now() - this.t0, ...p }); }
      this.onFrame && this.onFrame(buf);
      requestAnimationFrame(loop);
    };
    loop();
    if (SR) {
      const rec = this.rec = new SR();
      rec.lang = this.lang === 'es' ? 'es-ES' : 'en-US'; rec.continuous = true; rec.interimResults = true;
      rec.onresult = e => { let interim = ''; for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) this.final += r[0].transcript.trim() + ' '; else interim += r[0].transcript; } this.onText(this.final + interim); };
      rec.onend = () => { if (this.running) try { rec.start(); } catch { } };
      rec.onerror = e => { if (e.error === 'not-allowed') toast('Speech recognition was blocked - allow it in Settings > Safari.', 'bad'); };
      try { rec.start(); } catch { }
    }
  }
  async stop() {
    this.running = false;
    const dur = performance.now() - this.t0;
    try { this.rec && this.rec.stop(); } catch { }
    const blob = await new Promise(res => { if (!this.mr) return res(null); this.mr.onstop = () => res(new Blob(this.chunks, { type: this.mr.mimeType || 'audio/mp4' })); this.mr.stop(); });
    this.stream.getTracks().forEach(t => t.stop());
    this.ac.close();
    await new Promise(r => setTimeout(r, 400)); // let last recognition result land
    return { dur, blob, text: this.final.trim(), delivery: deliveryMetrics(this.frames) };
  }
}

function deliveryMetrics(frames) {
  if (!frames.length) return {};
  const voiced = frames.filter(f => f.f0 > 70 && f.f0 < 400);
  const semis = voiced.map(f => 12 * Math.log2(f.f0 / 100));
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };
  const db = frames.filter(f => f.rms > 0.012).map(f => 20 * Math.log10(f.rms));
  // pauses: silent runs > 1.2s, ignoring leading/trailing silence
  let pauses = 0, run = 0, started = false, longest = 0;
  const dt = frames.length > 1 ? frames[1].t - frames[0].t : 50;
  for (const f of frames) {
    if (f.rms > 0.012) { if (started && run * dt > 1200) { pauses++; longest = Math.max(longest, run * dt); } run = 0; started = true; }
    else if (started) run++;
  }
  const pitchVar = +sd(semis).toFixed(1);
  return { pitchVariation: pitchVar, monotone: pitchVar < 2.2, volumeVariation: +sd(db).toFixed(1), longPauses: pauses, longestPauseMs: Math.round(longest), voicedShare: +(voiced.length / frames.length).toFixed(2) };
}

// Small dictation button for any textarea (used by DECA roleplays).
export function dictate(textarea, lang = 'en') {
  const b = h('button', { class: 'btn', type: 'button' }, '🎙 Speak');
  if (!SR) { b.disabled = true; b.title = 'Speech recognition not supported in this browser'; return b; }
  let rec = null, base = '';
  b.onclick = () => {
    if (rec) { rec.stop(); return; }
    rec = new SR(); rec.lang = lang === 'es' ? 'es-ES' : 'en-US'; rec.continuous = true; rec.interimResults = true;
    base = textarea.value ? textarea.value.trim() + ' ' : '';
    let fin = '';
    rec.onresult = e => { let interim = ''; for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) fin += e.results[i][0].transcript + ' '; else interim += e.results[i][0].transcript; } textarea.value = base + fin + interim; };
    rec.onend = () => { rec = null; b.textContent = '🎙 Speak'; b.classList.remove('primary'); };
    rec.start(); b.textContent = '■ Stop'; b.classList.add('primary');
  };
  return b;
}

// ---------------- view ----------------
export function render(root) {
  const st = S();
  const lang = st.speakLang || 'en';
  const list = PROMPTS[lang];
  let prompt = list[(st.speakIdx || 0) % list.length];
  const promptEl = h('div', {}, h('span', { class: 'chip acc' }, prompt[0]), h('h2', { style: { marginTop: '8px' } }, prompt[1]));
  const transcript = h('div', { class: 'transcript muted' }, SR ? 'Tap the mic and start talking. Aim for 45-90 seconds.' : 'Live transcription isn\'t supported in this browser. You can still record and replay; Safari on iPhone supports it.');
  const canvas = h('canvas', { class: 'wave', width: 600, height: 64 });
  const timer = h('div', { class: 'num muted', style: { textAlign: 'center' } }, '0:00');
  const results = h('div', { class: 'stack' });
  const mic = h('button', { class: 'mic', 'aria-label': 'Record', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>' });
  let rec = null, tiv = null;
  const ctx = canvas.getContext('2d');
  const drawWave = buf => {
    const w = canvas.width, hh = canvas.height; ctx.clearRect(0, 0, w, hh);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent'); ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i < w; i++) { const v = buf[Math.floor(i / w * buf.length)] * hh * 1.6 + hh / 2; i ? ctx.lineTo(i, v) : ctx.moveTo(i, v); }
    ctx.stroke();
  };
  mic.onclick = async () => {
    if (!rec) {
      if (!navigator.mediaDevices?.getUserMedia) return toast('Microphone not available here.', 'bad');
      rec = new Recorder({ lang, onText: t => { transcript.classList.remove('muted'); transcript.textContent = t; }, onFrame: drawWave });
      try { await rec.start(); } catch (e) { rec = null; return toast('Microphone permission was denied.', 'bad'); }
      mic.classList.add('rec'); results.innerHTML = '';
      const t0 = Date.now(); tiv = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); timer.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; if (!timer.isConnected) clearInterval(tiv); }, 250);
      if (window.gsap) gsap.to(mic, { scale: 1.06, duration: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    } else {
      clearInterval(tiv); if (window.gsap) { gsap.killTweensOf(mic); gsap.to(mic, { scale: 1, duration: 0.2 }); }
      mic.classList.remove('rec');
      const r = rec; rec = null;
      const out = await r.stop();
      finishSession(out, prompt, lang, results, transcript);
    }
  };
  const newPrompt = () => { st.speakIdx = (st.speakIdx || 0) + 1; save(); prompt = list[st.speakIdx % list.length]; promptEl.innerHTML = ''; promptEl.append(h('span', { class: 'chip acc' }, prompt[0]), h('h2', { style: { marginTop: '8px' } }, prompt[1])); fx.pop(promptEl); };
  const history = st.speak.slice(0, 8);
  root.append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Speak'), h('div', { class: 'sub' }, 'Train how you put ideas into words - precise, structured, fluent.')),
      h('div', { class: 'seg' }, ...[['en', 'English'], ['es', 'Español']].map(([k, l]) => h('button', { class: lang === k ? 'on' : '', onclick: () => { st.speakLang = k; save(); root.innerHTML = ''; render(root); } }, l)))),
    h('div', { class: 'grid g2' },
      card('Prompt', h('div', { class: 'stack' }, promptEl, h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: newPrompt }, 'New prompt'),
        h('span', { class: 'small muted' }, 'Structure tip: point → reason → example → point.')))),
      card('Record', h('div', { class: 'stack' }, mic, timer, canvas))),
    card('Transcript', transcript),
    results,
    history.length ? card('Recent sessions', h('div', { class: 'unit-list' }, ...history.map(s => h('div', { class: 'unit-row' },
      h('span', { class: 'unit-n' }, s.ai ? avgScore(s.ai.scores) : '-'),
      h('div', { style: { minWidth: 0 } }, h('div', { style: { fontWeight: 600 } }, s.prompt.slice(0, 70)), h('div', { class: 'unit-meta' }, `${new Date(s.ts).toLocaleDateString()} · ${s.metrics.wpm} wpm · ${s.metrics.fillerCount} fillers · ${s.lang}`)),
      h('button', { class: 'btn sm ghost', onclick: async () => { const b = await audioDB.get(s.id); if (!b) return toast('No audio saved'); new Audio(URL.createObjectURL(b)).play(); } }, '▶'))))) : null,
    trendCard(st.speak));
}

const avgScore = sc => sc ? Math.round(Object.values(sc).reduce((a, b) => a + b, 0) / Object.values(sc).length * 10) / 10 : '-';

function trendCard(sessions) {
  const withAI = sessions.filter(s => s.ai).slice(0, 12).reverse();
  if (withAI.length < 2) return null;
  const keys = ['clarity', 'precision', 'concision', 'fluency'];
  return card('Progress', h('div', { class: 'score-grid' }, ...keys.map(k => {
    const first = withAI[0].ai.scores[k], last = withAI[withAI.length - 1].ai.scores[k];
    return h('div', { class: 'score-cell' }, h('div', { class: 'v' }, last), h('div', { class: 'l' }, `${k} ${last - first >= 0 ? '▲' : '▼'}${Math.abs(last - first)}`));
  })));
}

async function finishSession(out, prompt, lang, results, transcriptEl) {
  const text = out.text || transcriptEl.textContent.trim();
  if (out.dur < 8000) { toast('Try speaking for at least 15 seconds.'); return; }
  const m = { ...textMetrics(text, out.dur, lang), ...out.delivery, durationMs: Math.round(out.dur) };
  const sess = { id: uid(), ts: Date.now(), prompt: prompt[1], lang, transcript: text, metrics: m, ai: null };
  S().speak.unshift(sess); S().speak = S().speak.slice(0, 60);
  if (out.blob) audioDB.put(sess.id, out.blob).catch(() => {});
  recordActivity({ area: 'speak', ms: out.dur + 60000 });
  save();
  highlight(transcriptEl, text, lang);
  results.innerHTML = '';
  results.append(metricsCard(m, lang));
  if (out.blob) { const a = h('audio', { controls: true, src: URL.createObjectURL(out.blob), style: { width: '100%' } }); results.append(card('Replay', a)); }
  if (!text) { results.append(card('', h('p', {}, 'No words were transcribed. Check that dictation/Siri is enabled for speech recognition.'))); return; }
  if (!hasAI()) { results.append(card('Wording analysis', h('p', { class: 'muted' }, 'Add your Claude API key in Settings to get a full articulation analysis and drills.'))); return; }
  const loading = card('Wording analysis', h('p', { class: 'muted' }, 'Claude is analysing your wording…'));
  results.append(loading);
  try {
    const ai = await analyzeSpeech({ prompt: prompt[1], transcript: text, metrics: m, lang });
    const avg = avgScore(ai.scores); if (avg > Math.max(0, ...S().speak.filter(x => x.ai && x !== sess).map(x => avgScore(x.ai.scores)))) addRecord('score', `Speak: ${avg}/10 articulation`, avg / 10);
    sess.ai = ai; save();
    import('../store.js').then(m => m.autoLog('tip', `Speaking: ${ai.nextFocus}`, ['speak'], 'speak:' + sess.id));
    loading.replaceWith(aiCard(ai, lang));
    fx.stagger([...results.querySelectorAll('.card')]);
  } catch (e) { loading.replaceWith(card('Wording analysis', h('p', { class: 'muted' }, aiErrorText(e)))); }
}

function highlight(el, text, lang) {
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  let html = esc(text);
  const mark = (list, cls) => list.forEach(p => { html = html.replace(new RegExp(`\\b(${p.replace(/'/g, "'")})\\b`, 'gi'), `<mark class="${cls}">$1</mark>`); });
  mark(lang === 'es' ? ES_FILLERS : FILLERS.filter(f => f !== 'like'), '');
  if (lang !== 'es') { mark(HEDGES, 'hedge'); mark(['stuff', 'things', 'very', 'really', 'a lot'], 'vague'); }
  el.innerHTML = html;
  el.classList.remove('muted');
}

function metricsCard(m, lang) {
  const tile = (v, l, good) => h('div', { class: 'score-cell', style: good === false ? { background: 'var(--gold-soft)' } : good ? { background: 'var(--good-soft)' } : {} }, h('div', { class: 'v' }, v), h('div', { class: 'l' }, l));
  const tips = [];
  if (m.wpm > 175) tips.push('You\'re fast (>175 wpm). Slow down at key points - pauses make ideas land.');
  if (m.wpm < 110 && m.words > 30) tips.push('Pace is slow (<110 wpm). Plan your next sentence while finishing the current one: point → reason → example.');
  if (m.fillersPerMin > 4) tips.push(`${m.fillersPerMin} fillers/min. Replace "um" with a silent pause - silence sounds confident.`);
  if (m.hedgeCount > 2) tips.push(`${m.hedgeCount} hedges ("I think", "kind of"). State claims directly, then support them.`);
  if (m.vagueCount > 3) tips.push(`${m.vagueCount} vague words ("stuff", "things", "very"). Name the specific thing.`);
  if (m.monotone) tips.push('Pitch was fairly flat. Lift your voice on the key word of each sentence.');
  if (m.longPauses > 3) tips.push(`${m.longPauses} long pauses (>1.2 s). Use a structure so you always know what comes next.`);
  if (m.repeats && m.repeats.length) tips.push(`Repeated words: ${m.repeats.map(([w, n]) => `"${w}" ×${n}`).join(', ')} - vary with synonyms.`);
  if (!tips.length) tips.push('Clean delivery. Next: tighten wording - see the analysis.');
  return card('Delivery', h('div', { class: 'stack' },
    h('div', { class: 'score-grid' },
      tile(m.wpm, 'words/min', m.wpm >= 120 && m.wpm <= 170), tile(m.fillerCount, 'fillers', m.fillersPerMin <= 3), tile(m.hedgeCount ?? '-', 'hedges', (m.hedgeCount || 0) <= 2),
      tile(m.vagueCount ?? '-', 'vague words', (m.vagueCount || 0) <= 3), tile(m.longPauses ?? '-', 'long pauses', (m.longPauses || 0) <= 2),
      tile(m.pitchVariation ?? '-', 'pitch var (st)', !m.monotone), tile(m.ttr, 'word variety', m.ttr >= 0.55), tile(fmtMs(m.durationMs), 'length')),
    h('ul', {}, ...tips.map(t => h('li', {}, t)))));
}

function aiCard(ai, lang) {
  const sc = ai.scores;
  const drills = ai.drills.map(d => drillRow(d, lang));
  return h('div', { class: 'stack' },
    card('Articulation scores', h('div', { class: 'stack' },
      h('div', { class: 'score-grid' }, ...Object.entries(sc).map(([k, v]) => h('div', { class: 'score-cell' }, h('div', { class: 'v' }, v), h('div', { class: 'l' }, k)))),
      h('p', {}, ai.summary), h('div', { class: 'hint' }, h('b', {}, 'Next focus'), ai.nextFocus))),
    card('Say it better', h('div', { class: 'feedback-rows' }, ...ai.fixes.map(f => h('div', {}, h('div', { class: 'q-quote' }, `"${f.quote}"`), h('div', { class: 'small muted' }, f.issue), h('div', {}, h('b', {}, '→ '), f.better))))),
    ai.grammar && ai.grammar.length ? card('Grammar', h('div', { class: 'feedback-rows' }, ...ai.grammar.map(g => h('div', {}, h('div', { class: 'q-quote' }, g.quote), h('div', {}, h('b', {}, '→ '), g.correction), h('div', { class: 'small muted' }, g.rule))))) : null,
    card('Vocabulary upgrades', h('div', { class: 'feedback-rows' }, ...ai.vocab.map(v => h('div', {}, h('b', {}, v.weak), ' → ', v.stronger.join(', '), h('div', { class: 'small muted' }, v.example)))),
      h('button', { class: 'btn sm ghost', onclick: () => { S().log.unshift({ id: uid(), type: 'strategy', text: 'Vocabulary upgrades:\n' + ai.vocab.map(v => `${v.weak} -> ${v.stronger.join(', ')}`).join('\n'), tags: ['speak'], ts: Date.now() }); save(); toast('Saved to Log', 'good'); } }, '+ Save to Log')),
    card('Drills · say it sharper', h('div', { class: 'stack' }, h('p', { class: 'small muted' }, 'Say each one out loud. Claude checks whether you hit the target.'), ...drills)));
}

function drillRow(d, lang) {
  const out = h('div', { class: 'small' });
  const ta = h('textarea', { class: 'input', rows: 2, placeholder: 'Your attempt (speak or type)…' });
  const check = h('button', { class: 'btn sm primary' }, 'Check');
  check.onclick = async () => {
    if (!ta.value.trim()) return;
    check.disabled = true;
    try { const r = await checkDrill({ instruction: d.instruction, original: d.original, attempt: ta.value }); out.innerHTML = ''; out.append(h('span', { class: `chip ${r.pass ? 'good' : 'gold'}` }, r.pass ? 'Nailed it' : 'Not yet'), ' ', r.feedback, h('div', { class: 'muted' }, 'Model: ', r.model)); if (r.pass) fx.correct(out.parentElement); }
    catch (e) { toast(aiErrorText(e), 'bad'); }
    check.disabled = false;
  };
  return h('div', { class: 'card flat' }, h('b', {}, d.instruction), h('div', { class: 'q-quote small' }, `"${d.original}"`), ta, h('div', { class: 'row', style: { marginTop: '6px' } }, dictate(ta, lang), check), out);
}
