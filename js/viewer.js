// Penampil 3D studio untuk materi fisika (bandul & gelombang) — chensqy.my.id
// three.js murni, self-hosted (tanpa CDN). Membaca window.VIEWER_CONFIG dari halaman.
// Fitur: orbit bebas penuh, pause/play animasi, label menempel ke objek (leader line),
// kotak keterangan + rumus, tema terang/gelap. Selaras dgn pendulum.js (pure THREE).

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const CFG = window.VIEWER_CONFIG || {};
const THEME_KEY = 'chensqy-theme';

const ICONS = {
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  play:  '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  reset: '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>',
  tag:   '<svg viewBox="0 0 24 24"><path d="M4 4h9l7 7-9 9-7-7V4z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.6"/></svg>',
  moon:  '<svg viewBox="0 0 24 24"><path d="M20 14a8 8 0 1 1-10-10 8 8 0 0 0 10 10z"/></svg>',
  sun:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><g stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></g></svg>',
  full:  '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
};

const THEMES = {
  terang: { bgTop:'#eef4fc', bgBot:'#d6e3f4', fog:'#e2ebf8', grid:0xc3d2e8, gridC:0xa7bcdd, shadow:0.16 },
  gelap:  { bgTop:'#132443', bgBot:'#070d18', fog:'#0b1526', grid:0x26374f, gridC:0x3b5170, shadow:0.35 },
};

// ---------- DOM shell ----------
const root = document.documentElement;
const app = document.getElementById('app') || document.body;

const stage = el('div', 'v-stage');
const canvasWrap = el('div', 'v-canvas');
const labelWrap = el('div', 'v-labels');
stage.append(canvasWrap, labelWrap);

const chip = el('div', 'v-chip');
chip.textContent = CFG.title || 'Penampil 3D';

const toolbar = el('div', 'v-toolbar');
const btnPlay   = toolBtn('pause', 'Jeda / putar animasi');
const btnReset  = toolBtn('reset', 'Kembalikan sudut pandang');
const btnLabels = toolBtn('tag',   'Tampil / sembunyikan label');
const btnTheme  = toolBtn('moon',  'Mode terang / gelap');
const btnFull   = toolBtn('full',  'Layar penuh');
toolbar.append(btnPlay, btnReset, btnLabels, btnTheme, btnFull);

const panel = buildPanel();

const loading = el('div', 'v-loading');
loading.innerHTML = '<div class="v-spin"></div><span>Memuat model 3D…</span>';

app.append(stage, chip, toolbar, panel, loading);

// ---------- three.js ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
canvasWrap.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.inset = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
labelWrap.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff, 10, 40);

const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 200);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;      // kebebasan penuh: putar / zoom / geser
controls.zoomSpeed = 0.9;
controls.rotateSpeed = 0.9;

// pencahayaan
scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb0c8, 1.05));
const key = new THREE.DirectionalLight(0xffffff, 1.35);
key.position.set(3, 6, 4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0004;
scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.35);
fill.position.set(-4, 2, -3);
scene.add(fill);

// lantai (penerima bayangan)
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.ShadowMaterial({ opacity: 0.16 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// grid lantai (dibuat ulang saat ganti tema)
let grid = null, gridSize = 12, gridY = 0;
function setGrid(size, y, colorC, color) {
  gridSize = size; gridY = y;
  if (grid) { scene.remove(grid); grid.geometry.dispose(); grid.material.dispose(); }
  grid = new THREE.GridHelper(size, 24, colorC, color);
  grid.position.y = y + 0.001;
  grid.material.transparent = true;
  grid.material.opacity = 0.85;
  scene.add(grid);
}

// ---------- muat GLB ----------
const clock = new THREE.Clock();
let mixer = null, playing = true, labelsOn = true;
const labelObjs = [];
const homePos = new THREE.Vector3(), homeTarget = new THREE.Vector3();

new GLTFLoader().load(
  CFG.model,
  (gltf) => { onModel(gltf); loading.remove(); },
  undefined,
  (err) => { loading.innerHTML = '<span>Gagal memuat model 3D.</span>'; console.error(err); }
);

function onModel(gltf) {
  const model = gltf.scene;
  model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(model);

  // ukur & bingkai
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3(), center = new THREE.Vector3();
  box.getSize(size); box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;

  controls.target.copy(center);
  const dist = (maxDim / 2) / Math.tan((camera.fov * Math.PI / 180) / 2) * 1.45;
  const dir = new THREE.Vector3(0.28, 0.2, 1).normalize();
  camera.position.copy(center).add(dir.multiplyScalar(dist));
  camera.near = dist / 100; camera.far = dist * 100; camera.updateProjectionMatrix();
  controls.minDistance = dist * 0.25;
  controls.maxDistance = dist * 4.5;
  homePos.copy(camera.position); homeTarget.copy(controls.target);

  // lantai + grid + fog
  ground.position.y = box.min.y;
  setGrid(maxDim * 8, box.min.y, 0xa7bcdd, 0xc3d2e8);
  scene.fog.near = dist * 0.95; scene.fog.far = dist * 3.4;

  // bayangan directional membingkai objek
  const s = key.shadow.camera;
  const r = maxDim * 1.6;
  s.left = -r; s.right = r; s.top = r; s.bottom = -r; s.near = 0.1; s.far = dist * 8;
  key.position.copy(center).add(new THREE.Vector3(maxDim * 0.9, maxDim * 2, maxDim));
  key.target.position.copy(center); scene.add(key.target); s.updateProjectionMatrix();

  // animasi
  if (gltf.animations && gltf.animations.length) {
    mixer = new THREE.AnimationMixer(model);
    const clip = (CFG.clip && THREE.AnimationClip.findByName(gltf.animations, CFG.clip)) || gltf.animations[0];
    mixer.clipAction(clip).play();
  } else {
    btnPlay.style.display = 'none';
  }

  // label menempel ke objek / titik tetap
  (CFG.labels || []).forEach((L) => addLabel(L, model));

  applyTheme(currentTheme());
  animate();
}

function addLabel(L, model) {
  const css = new CSS2DObject(buildLabelEl(L));
  let parent = scene;
  if (L.node) { const n = model.getObjectByName(L.node); if (n) parent = n; }
  const p = L.at || L.offset || [0, 0, 0];
  css.position.set(p[0], p[1], p[2]);
  parent.add(css);
  labelObjs.push(css);
}

// ---------- render loop ----------
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  if (mixer && playing) mixer.update(dt);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// ---------- kontrol ----------
btnPlay.addEventListener('click', () => {
  playing = !playing;
  setIcon(btnPlay, playing ? 'pause' : 'play');
  btnPlay.classList.toggle('is-paused', !playing);
});
btnReset.addEventListener('click', () => {
  camera.position.copy(homePos); controls.target.copy(homeTarget); controls.update();
});
btnLabels.addEventListener('click', () => {
  labelsOn = !labelsOn;
  labelWrap.style.display = labelsOn ? '' : 'none';
  btnLabels.classList.toggle('is-off', !labelsOn);
});
btnTheme.addEventListener('click', () => {
  const next = currentTheme() === 'gelap' ? 'terang' : 'gelap';
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  applyTheme(next);
});
btnFull.addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
});

function currentTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'terang'; } catch (e) { return 'terang'; }
}
function applyTheme(name) {
  const t = THEMES[name] || THEMES.terang;
  root.setAttribute('data-theme', name);
  document.body.style.background = `radial-gradient(130% 120% at 50% 0%, ${t.bgTop} 0%, ${t.bgBot} 70%)`;
  scene.fog.color.set(t.fog);
  ground.material.opacity = t.shadow;
  setGrid(gridSize, gridY, t.gridC, t.grid);
  setIcon(btnTheme, name === 'gelap' ? 'sun' : 'moon');
}

// ---------- resize ----------
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  labelRenderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

// ---------- helpers UI ----------
function el(tag, cls) { const n = document.createElement(tag); if (cls) n.className = cls; return n; }

function toolBtn(icon, title) {
  const b = el('button', 'v-btn'); b.type = 'button'; b.title = title;
  b.setAttribute('aria-label', title); setIcon(b, icon); return b;
}
function setIcon(btn, icon) { btn.dataset.icon = icon; btn.innerHTML = ICONS[icon] || ''; }

function buildLabelEl(L) {
  const c = L.color || '#12386e';
  const dx = L.dx != null ? L.dx : 96;
  const dy = L.dy != null ? L.dy : -14;
  const wrap = el('div', 'lbl3d');
  const svgns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgns, 'svg');
  svg.setAttribute('class', 'lbl-lead'); svg.setAttribute('overflow', 'visible');
  svg.setAttribute('width', '1'); svg.setAttribute('height', '1');
  const line = document.createElementNS(svgns, 'line');
  line.setAttribute('x1', 0); line.setAttribute('y1', 0);
  line.setAttribute('x2', dx); line.setAttribute('y2', dy);
  line.setAttribute('stroke', c); line.setAttribute('stroke-width', '1.6');
  const dot = document.createElementNS(svgns, 'circle');
  dot.setAttribute('cx', 0); dot.setAttribute('cy', 0); dot.setAttribute('r', 3.2); dot.setAttribute('fill', c);
  svg.append(line, dot);
  const pill = el('span', 'lbl-pill');
  pill.textContent = L.text;
  pill.style.setProperty('--c', c);
  pill.style.left = dx + 'px'; pill.style.top = dy + 'px';
  pill.style.transform = `translate(${dx < 0 ? '-100%' : '0'}, -50%)`;
  wrap.append(svg, pill);
  return wrap;
}

function buildPanel() {
  const p = el('div', 'v-panel');
  const head = el('button', 'v-panel-head'); head.type = 'button';
  head.innerHTML = '<span class="v-panel-title">Keterangan</span><span class="v-caret">▾</span>';
  const body = el('div', 'v-panel-body');

  if (CFG.description) { const d = el('p', 'v-desc'); d.innerHTML = CFG.description; body.appendChild(d); }

  if (CFG.legend && CFG.legend.length) {
    const list = el('ul', 'v-legend');
    CFG.legend.forEach((row) => {
      const li = el('li', 'v-legrow');
      const mk = el('span', 'v-mark ' + (row.type ? 'mk-' + row.type : ''));
      if (row.color) mk.style.setProperty('--c', row.color);
      const tx = el('span', 'v-legtext');
      tx.innerHTML = '<b style="color:' + (row.color || 'inherit') + '">' + row.term + '</b> — ' + row.desc;
      li.append(mk, tx); list.appendChild(li);
    });
    body.appendChild(list);
  }

  if (CFG.formula) {
    const f = el('div', 'v-formula');
    f.innerHTML = (CFG.formula.title ? '<div class="v-formula-h">' + CFG.formula.title + '</div>' : '')
      + (CFG.formula.eqs || []).map((e) => '<div class="v-eq">' + e + '</div>').join('')
      + (CFG.formula.note ? '<div class="v-formula-n">' + CFG.formula.note + '</div>' : '');
    body.appendChild(f);
  }

  p.append(head, body);
  head.addEventListener('click', () => p.classList.toggle('is-collapsed'));
  return p;
}
