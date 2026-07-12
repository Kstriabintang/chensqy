// AR live kamera — chensqy.my.id
// MindAR image-tracking (kartu marker) + jsQR (deteksi QR di kamera, transisi in-app) +
// mode markerless (tap untuk taruh / hasil scan QR). three.js + MindAR, self-host, tanpa CDN.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { MindARThree } from '/vendor/mindar/mindar-image-three.prod.js';
import { MATERI, MATERI_BY_INDEX, getSpeed, setSpeed, SPEEDS, slugFromLocation } from '/js/materi.js?v=2';
import { el, ICONS, setIcon, toolBtn, buildLabelEl, buildPanel } from '/js/ui.js?v=2';

const MARKER_SRC = '/media/marker/materi.mind';
let speed = getSpeed();
let playing = true;
let labelsOn = false;
let activeSlug = slugFromLocation();

// ---------- DOM shell ----------
const app = document.getElementById('app') || document.body;
const arRoot = el('div', 'ar-root');
const container = el('div', 'ar-container'); // MindAR menaruh <video>+<canvas> di sini
arRoot.appendChild(container);

const topbar = el('div', 'ar-top');
const btnHome = el('a', 'ar-icbtn'); btnHome.href = '/'; btnHome.title = 'Kembali'; btnHome.innerHTML = ICONS.back;
const topTitle = el('div', 'ar-title'); topTitle.textContent = 'AR Kamera';
topbar.append(btnHome, topTitle);

const hint = el('div', 'ar-hint');
hint.innerHTML = '<span class="ar-dot"></span> Arahkan kamera ke <b>kartu materi</b>, atau scan <b>QR</b>-nya';

const chips = el('div', 'ar-chips');
MATERI_BY_INDEX.forEach((m) => {
  const c = el('button', 'ar-chip'); c.type = 'button'; c.dataset.slug = m.slug; c.textContent = m.short;
  c.addEventListener('click', () => placeMarkerless(m.slug, true));
  chips.appendChild(c);
});
const chipHelp = el('div', 'ar-chiphelp'); chipHelp.textContent = 'Tanpa kartu? Pilih materi lalu ketuk layar untuk menaruh objek.';

const toolbar = el('div', 'v-toolbar ar-toolbar');
const btnPlay = toolBtn('pause', 'Jeda / putar');
const btnSpeed = el('button', 'v-btn v-btn-speed'); btnSpeed.type = 'button'; btnSpeed.title = 'Kecepatan';
const btnLabels = toolBtn('tag', 'Tampil / sembunyikan label');
const btnPhoto = toolBtn('camera', 'Jepret foto AR');
const btnView = el('a', 'v-btn'); btnView.title = 'Buka penampil 3D biasa'; btnView.innerHTML = ICONS.ar; btnView.href = '/v/bandul/';
toolbar.append(btnPlay, btnSpeed, btnLabels, btnPhoto, btnView);
function fmtSpeed(v) { return (v % 1 === 0 ? v : v.toString().replace('0.', '.')) + '×'; }
function renderSpeed() { btnSpeed.textContent = fmtSpeed(speed); btnSpeed.classList.toggle('is-alt', speed !== 1); }
renderSpeed();

let panel = null;

// Layar mulai (butuh gesture untuk kamera)
const start = el('div', 'ar-start');
start.innerHTML =
  '<div class="ar-start-card">' +
  '<div class="ar-start-ic">' + ICONS.camera + '</div>' +
  '<h2>Mode AR Kamera</h2>' +
  '<p>Arahkan kamera HP ke <b>kartu materi</b> (atau scan QR-nya) untuk memunculkan objek 3D langsung di kamera. Bisa juga pilih materi lalu ketuk layar tanpa kartu.</p>' +
  '<button class="ar-start-btn" type="button">Mulai kamera</button>' +
  '<a class="ar-start-alt" href="/">Batal</a>' +
  '</div>';

const toast = el('div', 'ar-toast');

app.append(arRoot, topbar, hint, chips, chipHelp, toolbar, toast, start);
[hint, chips, chipHelp, toolbar].forEach((n) => n.style.display = 'none');

// ---------- three helpers ----------
const clock = new THREE.Clock();
const loader = new GLTFLoader();
const gltfCache = {};
const mixers = [];
const tweens = [];
let mindarThree = null, renderer = null, scene = null, camera = null, labelRenderer = null;
let placedHolder = null;      // grup markerless (di depan kamera)

function loadGLTF(slug) {
  if (!gltfCache[slug]) gltfCache[slug] = new Promise((res, rej) => loader.load(MATERI[slug].model, res, undefined, rej));
  return gltfCache[slug];
}

async function instantiate(slug, opts = {}) {
  const gltf = await loadGLTF(slug);
  const root = gltf.scene.clone(true);
  let mixer = null;
  if (gltf.animations && gltf.animations.length) {
    mixer = new THREE.AnimationMixer(root);
    const clip = (MATERI[slug].clip && THREE.AnimationClip.findByName(gltf.animations, MATERI[slug].clip)) || gltf.animations[0];
    mixer.clipAction(clip).play();
    mixer.timeScale = speed;
    mixers.push(mixer);
  }
  frameModel(root, opts.size || 0.8, opts.sit !== false);
  addLabels(root, slug);
  return { root, mixer };
}

function frameModel(root, target, sit) {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3(), center = new THREE.Vector3();
  box.getSize(size); box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const s = target / maxDim;
  root.scale.setScalar(s);
  root.position.x -= center.x * s;
  root.position.z -= center.z * s;
  root.position.y -= (sit ? box.min.y : center.y) * s;
}

function addLabels(root, slug) {
  (MATERI[slug].labels || []).forEach((L) => {
    const css = new CSS2DObject(buildLabelEl(L));
    let parent = root;
    if (L.node) { const n = root.getObjectByName(L.node); if (n) parent = n; }
    const p = L.at || L.offset || [0, 0, 0];
    css.position.set(p[0], p[1], p[2]);
    css.userData.isLabel = true;
    css.visible = labelsOn;
    parent.add(css);
  });
}

// ---------- transisi muncul ----------
function popIn(obj) {
  obj.visible = true;
  const target = obj.scale.clone();
  obj.scale.multiplyScalar(0.01);
  tweens.push({ obj, t: 0, dur: 0.45, from: 0.01, to: 1, base: target });
}
function updateTweens(dt) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i]; tw.t += dt;
    const k = Math.min(1, tw.t / tw.dur);
    const e = 1 - Math.pow(1 - k, 3); // easeOutCubic
    const f = tw.from + (tw.to - tw.from) * e;
    tw.obj.scale.copy(tw.base).multiplyScalar(f);
    if (k >= 1) tweens.splice(i, 1);
  }
}

// ---------- marker (MindAR) ----------
async function initAR() {
  mindarThree = new MindARThree({
    container,
    imageTargetSrc: MARKER_SRC,
    uiScanning: false,
    uiLoading: false,
    maxTrack: 1,
  });
  ({ renderer, scene, camera } = mindarThree);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8393a7, 1.25));
  const dir = new THREE.DirectionalLight(0xffffff, 1.15); dir.position.set(1.2, 2.4, 1.6); scene.add(dir);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = 'ar-labels';
  labelRenderer.domElement.style.cssText = 'position:absolute;inset:0;pointer-events:none;display:none';
  container.appendChild(labelRenderer.domElement);

  // anchor per materi (index marker 0/1/2)
  MATERI_BY_INDEX.forEach((m) => {
    const anchor = mindarThree.addAnchor(m.markerIndex);
    let inst = null;
    anchor.onTargetFound = async () => {
      if (!inst) { inst = await instantiate(m.slug, { size: 0.9, sit: true }); anchor.group.add(inst.root); }
      setActive(m.slug); popIn(inst.root); hideHint();
    };
    anchor.onTargetLost = () => {};
  });

  placedHolder = new THREE.Group();
  placedHolder.position.set(0, -0.15, -2.4);
  placedHolder.visible = false;
  scene.add(placedHolder);

  try {
    await mindarThree.start();
  } catch (e) {
    return fail('Tidak bisa mengakses kamera. Pastikan izin kamera diberikan lalu muat ulang.');
  }
  sizeRenderers();
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();
    if (playing) for (const mx of mixers) mx.update(dt);
    updateTweens(dt);
    renderer.render(scene, camera);
    if (labelsOn) labelRenderer.render(scene, camera);
  });
  window.addEventListener('resize', sizeRenderers);
  startQRLoop();
  enableDragRotate();
  [hint, chips, chipHelp, toolbar].forEach((n) => n.style.display = '');
  if (activeSlug) preselectChip(activeSlug);
}

function sizeRenderers() {
  if (labelRenderer) labelRenderer.setSize(container.clientWidth, container.clientHeight);
}

// ---------- markerless (QR / tap) ----------
let placedInst = null;
async function placeMarkerless(slug, byUser) {
  if (placedInst) { placedHolder.remove(placedInst.root); removeMixer(placedInst.mixer); }
  const inst = await instantiate(slug, { size: 1.4, sit: false });
  placedInst = inst;
  placedHolder.rotation.set(0, 0, 0);
  placedHolder.add(inst.root);
  placedHolder.visible = true;
  popIn(inst.root);
  setActive(slug);
  hideHint();
  showToast((byUser ? 'Ditaruh: ' : 'QR terdeteksi: ') + MATERI[slug].short);
}
function removeMixer(mx) { const i = mixers.indexOf(mx); if (i >= 0) mixers.splice(i, 1); }

// tap untuk taruh materi terpilih (jika belum ada objek markerless)
container.addEventListener('click', (e) => {
  if (e.target.closest('.v-btn,.ar-icbtn,.ar-chip')) return;
  if (!placedInst && activeSlug) placeMarkerless(activeSlug, true);
});

// putar objek markerless dgn drag
function enableDragRotate() {
  let down = false, px = 0, py = 0;
  const dom = renderer.domElement;
  dom.addEventListener('pointerdown', (e) => { if (!placedHolder.visible) return; down = true; px = e.clientX; py = e.clientY; });
  window.addEventListener('pointerup', () => { down = false; });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    placedHolder.rotation.y += (e.clientX - px) * 0.01;
    placedHolder.rotation.x += (e.clientY - py) * 0.006;
    px = e.clientX; py = e.clientY;
  });
}

// ---------- jsQR ----------
const qCanvas = document.createElement('canvas');
const qCtx = qCanvas.getContext('2d', { willReadFrequently: true });
let lastQR = { slug: null, t: 0 };
function startQRLoop() { setInterval(scanQR, 450); }
function scanQR() {
  const v = mindarThree && mindarThree.video;
  if (!v || v.readyState < 2 || !v.videoWidth || !window.jsQR) return;
  const w = 260, h = Math.round(260 * v.videoHeight / v.videoWidth) || 200;
  qCanvas.width = w; qCanvas.height = h;
  qCtx.drawImage(v, 0, 0, w, h);
  let img; try { img = qCtx.getImageData(0, 0, w, h); } catch (e) { return; }
  const code = window.jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
  if (!code || !code.data) return;
  const slug = matchQR(code.data);
  const now = performance.now ? performance.now() : Date.now();
  if (slug && !(lastQR.slug === slug && now - lastQR.t < 2500)) {
    lastQR = { slug, t: now };
    placeMarkerless(slug, false);
  }
}
function matchQR(data) {
  for (const slug in MATERI) { if (data === MATERI[slug].qrUrl || data.indexOf('/v/' + slug) !== -1) return slug; }
  return null;
}

// ---------- foto AR ----------
btnPhoto.addEventListener('click', () => {
  try {
    const v = mindarThree.video;
    const c = document.createElement('canvas');
    c.width = container.clientWidth; c.height = container.clientHeight;
    const cx = c.getContext('2d');
    if (v && v.videoWidth) {
      // cover
      const s = Math.max(c.width / v.videoWidth, c.height / v.videoHeight);
      const dw = v.videoWidth * s, dh = v.videoHeight * s;
      cx.drawImage(v, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
    }
    renderer.render(scene, camera);
    cx.drawImage(renderer.domElement, 0, 0, c.width, c.height);
    const a = document.createElement('a');
    a.download = 'ar-' + (activeSlug || 'chensqy') + '.png';
    a.href = c.toDataURL('image/png'); a.click();
    showToast('Foto AR disimpan');
  } catch (e) { showToast('Gagal menjepret foto'); }
});

// ---------- kontrol ----------
btnPlay.addEventListener('click', () => {
  playing = !playing; setIcon(btnPlay, playing ? 'pause' : 'play'); btnPlay.classList.toggle('is-paused', !playing);
});
btnSpeed.addEventListener('click', () => {
  speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]; setSpeed(speed); renderSpeed();
  for (const mx of mixers) mx.timeScale = speed;
});
btnLabels.addEventListener('click', () => {
  labelsOn = !labelsOn; btnLabels.classList.toggle('is-off', !labelsOn);
  if (labelRenderer) labelRenderer.domElement.style.display = labelsOn ? '' : 'none';
  scene && scene.traverse((o) => { if (o.userData && o.userData.isLabel) o.visible = labelsOn; });
});

// ---------- active materi + panel ----------
function setActive(slug) {
  activeSlug = slug;
  btnView.href = '/v/' + slug + '/';
  preselectChip(slug);
  const fresh = buildPanel(MATERI[slug]);
  if (panel) panel.replaceWith(fresh); else app.appendChild(fresh);
  panel = fresh;
  panel.classList.add('is-collapsed'); // mulai tertutup di AR agar tak menutupi
}
function preselectChip(slug) {
  chips.querySelectorAll('.ar-chip').forEach((c) => c.classList.toggle('is-on', c.dataset.slug === slug));
}

// ---------- util ----------
let hintTimer = null;
function hideHint() { hint.style.opacity = '0'; clearTimeout(hintTimer); hintTimer = setTimeout(() => hint.style.display = 'none', 400); }
let toastTimer = null;
function showToast(msg) { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200); }
function fail(msg) {
  start.style.display = 'grid';
  start.querySelector('.ar-start-card').innerHTML = '<h2>Kamera tidak tersedia</h2><p>' + msg + '</p><a class="ar-start-btn" href="/">Kembali ke menu</a><a class="ar-start-alt" href="/v/bandul/">Buka penampil 3D biasa</a>';
}

// hook verifikasi (tak mengganggu pengguna)
window.__arDebug = { placeMarkerless, matchQR, get mixers() { return mixers; }, get scene() { return scene; } };

// ---------- mulai ----------
start.querySelector('.ar-start-btn').addEventListener('click', () => {
  start.style.display = 'none';
  initAR().catch((e) => { console.error(e); fail('Terjadi kesalahan memulai AR: ' + (e && e.message ? e.message : e)); });
});
