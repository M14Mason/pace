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

  let running = true, last = performance.now();
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); loop(); } });
  function loop() {
    if (!running) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduce) uniforms.uTime.value += dt;
    uniforms.uPulse.value = Math.max(0, uniforms.uPulse.value - dt * 0.9);
    pts.rotation.y += (uniforms.uMouse.value.x * 0.12 - pts.rotation.y) * 0.03;
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
    retheme() { uniforms.uBase.value.set(css('--ink')); uniforms.uAccent.value.set(css('--accent')); },
  };
}
export const bgPulse = k => bg && bg.pulse(k);
export const bgLevel = x => bg && bg.setLevel(x);
export const bgRetheme = () => bg && bg.retheme();

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
