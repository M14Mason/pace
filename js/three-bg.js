// WebGL layers: an ambient dot-field background that ripples on progress,
// and a small 3D "skyline" of daily Pace Scores for the dashboard.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

let bg = null;

export function initBackground(canvas) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' }); }
  catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 5.5, 9);
  camera.lookAt(0, 0, -2);

  const COLS = 70, ROWS = 46;
  const pos = new Float32Array(COLS * ROWS * 3);
  for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) {
    const k = (i * COLS + j) * 3;
    pos[k] = (j - COLS / 2) * 0.32; pos[k + 1] = 0; pos[k + 2] = (i - ROWS / 2) * 0.32 - 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const uniforms = {
    uTime: { value: 0 },
    uPulse: { value: 0 },
    uPulseColor: { value: new THREE.Color(css('--good') || '#16a34a') },
    uBase: { value: new THREE.Color(css('--ink') || '#16161a') },
    uAccent: { value: new THREE.Color(css('--accent') || '#3b5bfd') },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uLevel: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: `
      uniform float uTime, uPulse, uLevel; uniform vec2 uMouse;
      varying float vH; varying float vD; varying float vP;
      void main(){
        vec3 p = position;
        float d = length(p.xz - vec2(uMouse.x*6.0, -2.0 - uMouse.y*3.0));
        float w = sin(p.x*0.55 + uTime*0.5)*0.22 + cos(p.z*0.6 + uTime*0.35)*0.22;
        float ring = uPulse * exp(-pow(d - (1.0-uPulse)*9.0, 2.0)*0.5) * 0.9;
        p.y += w + ring + uLevel*0.15*sin(p.x*0.3+uTime);
        vH = p.y; vP = ring;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        vD = -mv.z;
        gl_PointSize = (2.2 + ring*3.0) * (10.0 / -mv.z) * ${renderer.getPixelRatio().toFixed(2)};
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uBase, uAccent, uPulseColor; varying float vH; varying float vD; varying float vP;
      void main(){
        vec2 c = gl_PointCoord - 0.5; if (dot(c,c) > 0.25) discard;
        float fade = smoothstep(22.0, 6.0, vD);
        vec3 col = mix(uBase, uAccent, clamp(vH*1.4+0.3, 0.0, 1.0));
        col = mix(col, uPulseColor, clamp(vP*1.6, 0.0, 1.0));
        gl_FragColor = vec4(col, (0.16 + vP*0.5) * fade);
      }`,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  function resize() {
    const w = innerWidth, hh = innerHeight;
    renderer.setSize(w, hh, false);
    camera.aspect = w / hh; camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', e => {
    uniforms.uMouse.value.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
  }, { passive: true });

  // ---- particle bursts (pooled, CPU-updated; 900 sprites is cheap) ----
  const PN = 900;
  const pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pSize = new Float32Array(PN);
  const pVel = new Float32Array(PN * 3), pLife = new Float32Array(PN);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(pSize, 1));
  const pMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexColors: true,
    vertexShader: `attribute float size; varying vec3 vC; varying float vA;
      void main(){ vC = color; vA = clamp(size, 0.0, 1.0); vec4 mv = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = size * 22.0 * (6.0 / -mv.z) * ${renderer.getPixelRatio().toFixed(2)}; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vC; varying float vA;
      void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard;
        float core = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(mix(vC, vec3(1.0), core*core*0.35), core * vA); }`,
  });
  const burstPts = new THREE.Points(pGeo, pMat);
  burstPts.frustumCulled = false;
  scene.add(burstPts);
  let pNext = 0;
  const tmp = new THREE.Vector3();
  function spawn(sx, sy, color, count, power) {
    // screen point -> world point on a plane 6 units in front of the camera
    tmp.set((sx / innerWidth) * 2 - 1, -(sy / innerHeight) * 2 + 1, 0.5).unproject(camera);
    const dir = tmp.sub(camera.position).normalize();
    const origin = camera.position.clone().add(dir.multiplyScalar(6));
    const cols = [new THREE.Color(color), new THREE.Color(css('--accent')), new THREE.Color('#ffffff')];
    for (let i = 0; i < count; i++) {
      const k = pNext; pNext = (pNext + 1) % PN;
      pPos[k * 3] = origin.x; pPos[k * 3 + 1] = origin.y; pPos[k * 3 + 2] = origin.z;
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), sp = power * (0.4 + Math.random());
      pVel[k * 3] = Math.sin(ph) * Math.cos(th) * sp; pVel[k * 3 + 1] = Math.abs(Math.cos(ph)) * sp * 1.2 + 0.6 * power; pVel[k * 3 + 2] = Math.sin(ph) * Math.sin(th) * sp;
      const c = cols[i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0];
      pCol[k * 3] = c.r; pCol[k * 3 + 1] = c.g; pCol[k * 3 + 2] = c.b;
      pLife[k] = 1; pSize[k] = 1;
    }
  }
  function stepParticles(dt) {
    let alive = false;
    for (let k = 0; k < PN; k++) {
      if (pLife[k] <= 0) { if (pSize[k] !== 0) pSize[k] = 0; continue; }
      alive = true;
      pLife[k] -= dt * 0.9;
      pVel[k * 3 + 1] -= dt * 4.2; // gravity
      pVel[k * 3] *= 0.985; pVel[k * 3 + 2] *= 0.985;
      pPos[k * 3] += pVel[k * 3] * dt; pPos[k * 3 + 1] += pVel[k * 3 + 1] * dt; pPos[k * 3 + 2] += pVel[k * 3 + 2] * dt;
      pSize[k] = Math.max(0, pLife[k]);
    }
    if (alive) { pGeo.attributes.position.needsUpdate = true; pGeo.attributes.size.needsUpdate = true; pGeo.attributes.color.needsUpdate = true; }
  }

  // ---- per-tab moods: accent tint + camera angle, tweened with GSAP ----
  const camTarget = { y: 5.5, z: 9, look: -2 };
  const MOODS = {
    home: { c: '--accent', y: 5.5, z: 9 }, sprint: { c: '#6D4AFF', y: 4.2, z: 8 }, learn: { c: '#0E9F8E', y: 6.5, z: 10 },
    finance: { c: '#12A150', y: 5, z: 9.5 }, prep: { c: '#E07A16', y: 6, z: 9 }, speak: { c: '#DB2777', y: 4.8, z: 8.5 }, log: { c: '#C28A0B', y: 6.8, z: 10.5 },
    round: { c: '--accent', y: 3.6, z: 7.5 }, records: { c: '#E8A317', y: 5.2, z: 8.8 },
  };
  let scrollY0 = 0;
  addEventListener('scroll', () => { scrollY0 = scrollY; }, { passive: true });

  let running = true, last = performance.now();
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); loop(); } });
  function loop() {
    if (!running) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduce) uniforms.uTime.value += dt;
    uniforms.uPulse.value = Math.max(0, uniforms.uPulse.value - dt * 0.9);
    pts.rotation.y += (uniforms.uMouse.value.x * 0.12 - pts.rotation.y) * 0.03;
    // scroll parallax: the field drifts away as you scroll down a page
    pts.position.z += (Math.min(4, scrollY0 / 400) - pts.position.z) * 0.06;
    camera.position.y = camTarget.y; camera.position.z = camTarget.z; camera.lookAt(0, 0, camTarget.look);
    stepParticles(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  bg = {
    pulse(kind = 'good') {
      uniforms.uPulseColor.value.set(css(kind === 'bad' ? '--bad' : kind === 'gold' ? '--gold' : '--good'));
      uniforms.uPulse.value = 1;
    },
    setLevel(x) { uniforms.uLevel.value = x; },
    burst(x, y, kind = 'good', big = false) {
      const color = css(kind === 'bad' ? '--bad' : kind === 'gold' ? '--gold' : '--good');
      spawn(x, y, color, big ? 260 : 46, big ? 3.4 : 1.6);
    },
    mood(name) {
      const m = MOODS[name] || MOODS.home;
      const col = new THREE.Color(m.c.startsWith('--') ? css(m.c) : m.c);
      if (window.gsap) {
        gsap.to(uniforms.uAccent.value, { r: col.r, g: col.g, b: col.b, duration: 1.1, ease: 'power2.out' });
        gsap.to(camTarget, { y: m.y, z: m.z, duration: 1.4, ease: 'power3.inOut' });
      } else { uniforms.uAccent.value.copy(col); Object.assign(camTarget, { y: m.y, z: m.z }); }
    },
    retheme() { uniforms.uBase.value.set(css('--ink')); uniforms.uAccent.value.set(css('--accent')); },
  };
}
export const bgPulse = k => bg && bg.pulse(k);
export const bgLevel = x => bg && bg.setLevel(x);
export const bgRetheme = () => bg && bg.retheme();
export const bgBurst = (x, y, kind, big) => bg && !reduce && bg.burst(x, y, kind, big);
export const bgMood = name => bg && bg.mood(name);

// 3D bar skyline. values: array of 0..100. Returns dispose().
export function skyline(container, values) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
  catch { container.textContent = ''; return () => {}; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 2, 0.1, 100);
  camera.position.set(0, 7, 15);
  camera.lookAt(0, 1, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xdad6cc, 1.6));
  const dl = new THREE.DirectionalLight(0xffffff, 1.4); dl.position.set(4, 10, 6); scene.add(dl);

  const group = new THREE.Group(); scene.add(group);
  const accent = new THREE.Color(css('--accent'));
  const muted = new THREE.Color(css('--line'));
  const n = values.length;
  const bars = values.map((v, i) => {
    const hgt = Math.max(0.06, v / 100 * 4);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1, 0.34),
      new THREE.MeshStandardMaterial({ color: v ? accent.clone().lerp(new THREE.Color('#ffffff'), 0.55 - v / 230) : muted, roughness: 0.5, metalness: 0.05 }));
    m.position.set((i - n / 2) * 0.46, 0, 0);
    m.scale.y = 0.001;
    m.userData.h = hgt;
    group.add(m);
    return m;
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(n * 0.5 + 2, 3), new THREE.MeshStandardMaterial({ color: css('--card2') || '#efede6', roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.001; group.add(floor);

  function resize() {
    const w = container.clientWidth, hh = container.clientHeight || 160;
    renderer.setSize(w, hh); camera.aspect = w / hh; camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(container);

  let drag = null, rotY = -0.25, target = -0.25, alive = true, t0 = performance.now();
  renderer.domElement.addEventListener('pointerdown', e => (drag = e.clientX));
  addEventListener('pointerup', () => (drag = null));
  renderer.domElement.addEventListener('pointermove', e => { if (drag != null) { target += (e.clientX - drag) * 0.008; drag = e.clientX; } });
  function loop() {
    if (!alive) return;
    const t = (performance.now() - t0) / 1000;
    bars.forEach((b, i) => {
      const p = Math.min(1, Math.max(0, (t - i * 0.025) / 0.7));
      const e = 1 - Math.pow(1 - p, 3);
      b.scale.y = Math.max(0.001, b.userData.h * e);
      b.position.y = b.scale.y / 2;
    });
    if (drag == null && !reduce) target += 0.0012;
    rotY += (target - rotY) * 0.08;
    group.rotation.y = Math.sin(rotY) * 0.5;
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
  return () => { alive = false; ro.disconnect(); renderer.dispose(); renderer.domElement.remove(); };
}

// Liquid orb for the Pace Score: a noisy sphere whose "fill line" sits at the score.
export function orb(container, value) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return () => {}; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10); camera.position.z = 3.2;
  const u = { uT: { value: 0 }, uFill: { value: -1 }, uA: { value: new THREE.Color(css('--accent')) }, uB: { value: new THREE.Color(css('--card2') || '#efede7') } };
  const mat = new THREE.ShaderMaterial({ uniforms: u, transparent: true,
    vertexShader: `uniform float uT; varying vec3 vN; varying vec3 vP;
      void main(){ vec3 p = position; float w = sin(p.y*6.0+uT*1.6)*0.025 + sin(p.x*5.0-uT*1.2)*0.02; p += normal*w;
        vN = normalize(normalMatrix*normal); vP = p; gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0); }`,
    fragmentShader: `uniform float uT; uniform float uFill; uniform vec3 uA; uniform vec3 uB; varying vec3 vN; varying vec3 vP;
      void main(){ float wave = sin(vP.x*7.0+uT*2.2)*0.035 + sin(vP.z*5.0-uT*1.7)*0.03;
        float inside = step(vP.y, uFill + wave);
        vec3 col = mix(uB, uA, inside);
        col = mix(col, uA*1.25, inside * smoothstep(0.06, 0.0, abs(vP.y - uFill - wave)));
        float rim = pow(1.0 - abs(vN.z), 2.5);
        col += rim * 0.35;
        gl_FragColor = vec4(col, 0.92); }` });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), mat);
  scene.add(mesh);
  const size = () => { const s = container.clientWidth || 100; renderer.setSize(s, s); };
  size();
  const target = -1 + 2 * Math.max(0.02, Math.min(1, value / 100));
  if (window.gsap) gsap.to(u.uFill, { value: target, duration: 1.6, ease: 'power3.out', delay: 0.15 }); else u.uFill.value = target;
  let alive = true, t0 = performance.now();
  const loop = () => { if (!alive) return; u.uT.value = (performance.now() - t0) / 1000; mesh.rotation.y = u.uT.value * 0.25; renderer.render(scene, camera); requestAnimationFrame(loop); };
  loop();
  return () => { alive = false; renderer.dispose(); renderer.domElement.remove(); };
}
