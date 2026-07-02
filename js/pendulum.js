/* global AFRAME */
/*
 * Komponen A-Frame: <a-entity pendulum-lab>
 *
 * WebAR pop-out 3D untuk media ajar BANDUL / osilasi (skripsi Fisika).
 * Tiga mode demo (bisa diganti saat AR live):
 *
 *   abc    = Gerak Bandul A-B-C  -> satu bandul berayun, posisi A(kiri) B(tengah) C(kanan)
 *   wave   = Gelombang Bandul    -> banyak bandul beda panjang -> pola merambat/bergantian
 *   cradle = Ayunan Newton       -> deret bola, tumbukan & kekekalan momentum (mantul bergantian)
 *
 * Interaksi: seluruh objek dapat diputar (1 jari) & di-zoom (2 jari) lewat setUserTransform().
 *
 * Digambar dengan THREE murni + label via tekstur kanvas (self-hosted, tanpa font CDN).
 * Sumbu: bidang marker = XY (X kanan, Y atas), Z ke kamera.
 * Rotasi pivot pada Z: theta>0 -> KANAN, theta<0 -> KIRI.
 */
AFRAME.registerComponent('pendulum-lab', {
  schema: {
    mode:         { type: 'string',  default: 'abc' },  // abc | wave | cradle
    gravity:      { type: 'number',  default: 9.8 },
    amplitudeDeg: { type: 'number',  default: 32 },
    lift:         { type: 'number',  default: 0.06 },
    showLabels:   { type: 'boolean', default: true }
  },

  init: function () {
    const THREE = AFRAME.THREE;
    this.THREE = THREE;

    this.PIVOT_Y     = 0.37;
    this.UNITS_PER_M = 1.32;

    this.group = new THREE.Group();
    this.group.position.set(0, 0, this.data.lift);
    this.el.object3D.add(this.group);

    // spin = transform interaktif user (putar / zoom)
    this.spin = new THREE.Group();
    this.group.add(this.spin);
    this._userRotY = 0; this._userRotX = 0; this._userScale = 1;

    this.marks = [];
    this.waves = [];
    this.cradle = null;
    this.live = [];
    this._t = 0;
    this._appear = 0;
    this._throttle = 0;

    this.mode = (this.data.mode || 'abc').toLowerCase();
    this._build(this.mode);
  },

  remove: function () {
    if (this.group) this.el.object3D.remove(this.group);
    this._disposeRoot();
  },

  // ---- API dipanggil dari UI ----
  setMode: function (mode) {
    mode = (mode || 'abc').toLowerCase();
    if (mode === this.mode && this.root) return;
    this.mode = mode;
    this._t = 0;
    this._build(mode);
  },
  setUserTransform: function (rotY, rotX, scale) {
    this._userRotY = rotY; this._userRotX = rotX; this._userScale = scale;
    if (this.spin) {
      this.spin.rotation.set(rotX, rotY, 0);
      this.spin.scale.setScalar(scale);
    }
  },

  tick: function (time, dt) {
    if (!dt || !this.root) return;
    const parent = this.el.object3D.parent;
    if (parent && parent.visible === false) return;
    const sec = Math.min(dt / 1000, 0.05);
    this._t += sec;

    if (this._appear < 1) {
      this._appear = Math.min(1, this._appear + sec / 0.3);
      const e = 1 - Math.pow(1 - this._appear, 3);
      this.root.scale.setScalar(0.85 + 0.15 * e);
    }
    this.group.position.z = this.data.lift + 0.01 * Math.sin(this._t * 1.4);

    if (this.mode === 'abc') this._tickABC(sec);
    else if (this.mode === 'wave') this._tickWave(sec);
    else if (this.mode === 'cradle') this._tickCradle(sec);

    this._throttle += sec;
    if (this.live.length && this._throttle >= 0.1) {
      this._throttle = 0;
      for (const fn of this.live) fn();
    }
  },

  // ===================== MODE ABC =====================
  _tickABC: function () {
    const theta = this.amp * Math.cos(this.omega * this._t);
    this.pivot.rotation.z = theta;
    this.theta = theta;
    const near = this.amp * 0.16;
    let active = null;
    for (const m of this.marks) {
      const on = Math.abs(theta - m.angle) <= near;
      if (on && (active === null || Math.abs(theta - m.angle) < Math.abs(theta - active.angle))) active = m;
    }
    for (const m of this.marks) {
      const on = (m === active);
      const k = on ? 1.34 : 1.0;
      if (m.label && m.baseScale) m.label.scale.set(m.baseScale.x * k, m.baseScale.y * k, 1);
      if (m.ghostMat) { m.ghostMat.opacity = on ? 0.92 : 0.34; m.ghostMat.emissiveIntensity = on ? 0.9 : 0.0; }
    }
    this._active = active;
  },

  _tickWave: function () {
    for (const w of this.waves) {
      w.pivot.rotation.z = this.amp * Math.cos(w.omega * this._t + w.phase);
    }
  },

  _tickCradle: function () {
    const c = this.cradle;
    const x = Math.sin(2 * Math.PI * this._t / c.T);   // -1..1
    const amp = c.amp;
    const balls = c.balls;
    // hanya ujung yang bergerak, bergantian kiri/kanan; tengah diam
    for (let i = 0; i < balls.length; i++) balls[i].pivot.rotation.z = 0;
    if (x > 0)      balls[balls.length - 1].pivot.rotation.z = amp * x;   // kanan naik
    else if (x < 0) balls[0].pivot.rotation.z = amp * x;                  // kiri naik
  },

  // ===================== BUILD =====================
  _build: function (mode) {
    const THREE = this.THREE;
    this._disposeRoot();
    const root = this.root = new THREE.Group();
    this.spin.add(root);
    this.marks = []; this.waves = []; this.cradle = null; this.live = [];
    this._appear = 0;

    if (mode === 'wave') this._buildWave(root);
    else if (mode === 'cradle') this._buildCradle(root);
    else this._buildABC(root);
  },

  _buildABC: function (root) {
    const THREE = this.THREE;
    const g = this.data.gravity, L = this.data.length || 0.40;
    this.amp = this.data.amplitudeDeg * Math.PI / 180;
    this.visLen = L * this.UNITS_PER_M;
    this.omega = Math.sqrt(g / L);
    this.T = 2 * Math.PI / this.omega; this.Lreal = L;
    const visLen = this.visLen;
    const posAt = (a) => new THREE.Vector3(visLen * Math.sin(a), this.PIVOT_Y - visLen * Math.cos(a), 0);

    this._buildFrame(root, 0.80);

    const arcPts = []; const N = 48;
    for (let i = 0; i <= N; i++) arcPts.push(posAt(-this.amp + (2 * this.amp) * i / N));
    root.add(this._dashedLine(arcPts, 0x2b3446, 0.030, 0.022, 0.85));
    const pivotV = new THREE.Vector3(0, this.PIVOT_Y, 0);
    root.add(this._dashedLine([pivotV, posAt(-this.amp)], 0x2b3446, 0.028, 0.02, 0.7));
    root.add(this._dashedLine([pivotV, posAt(this.amp)],  0x2b3446, 0.028, 0.02, 0.7));

    const defs = [{ k: 'A', a: -this.amp, lx: -0.02 }, { k: 'B', a: 0, lx: 0 }, { k: 'C', a: this.amp, lx: 0.02 }];
    defs.forEach((d) => {
      const p = posAt(d.a);
      const gm = new THREE.MeshStandardMaterial({ color: 0x6ea8f0, roughness: 0.5, metalness: 0.1, emissive: 0x2f6fd0, emissiveIntensity: 0, transparent: true, opacity: 0.34 });
      const ghost = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 24), gm);
      ghost.position.copy(p); root.add(ghost);
      let label = null, baseScale = null;
      if (this.data.showLabels) {
        label = this._makeChip(d.k, { bg: 'rgba(20,40,70,0.95)', fs: 60, pad: 22 });
        label.scale.multiplyScalar(0.66);
        label.position.set(p.x + d.lx, p.y - 0.14, 0.06);
        baseScale = label.scale.clone(); root.add(label);
      }
      this.marks.push({ key: d.k, angle: d.a, ghostMat: gm, label, baseScale });
    });

    const pivot = new THREE.Group(); pivot.position.copy(pivotV); root.add(pivot); this.pivot = pivot;
    const strMat = new THREE.MeshStandardMaterial({ color: 0x8a929c, roughness: 0.6, metalness: 0.2 });
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, visLen, 8), strMat);
    str.position.set(0, -visLen / 2, 0); pivot.add(str);
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 30, 30), new THREE.MeshStandardMaterial({ color: 0x3f7fe6, roughness: 0.32, metalness: 0.5 }));
    bob.position.set(0, -visLen, 0); pivot.add(bob); this.bob = bob;
    const hi = new THREE.Mesh(new THREE.SphereGeometry(0.013, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
    hi.position.set(-0.017, -visLen + 0.017, 0.035); pivot.add(hi);

    if (this.data.showLabels) {
      this._title(root, 'Bandul Sederhana');
      const formula = this._makeChip('T = 2π √(L/g)', { bg: 'rgba(14,32,56,0.92)', fs: 42 });
      formula.position.set(0, -0.64, 0.05); formula.scale.multiplyScalar(0.92); root.add(formula);
      const readout = this._makeLiveChip(0.46);
      readout.sprite.position.set(0.62, 0.18, 0.05); root.add(readout.sprite);
      this.live.push(() => {
        const deg = this.theta * 180 / Math.PI;
        let pos = '—';
        if (this._active) pos = { A: 'A (kiri)', B: 'B (tengah)', C: 'C (kanan)' }[this._active.key];
        readout.draw('Posisi: ' + pos + '\nθ = ' + deg.toFixed(0) + '°\nL = ' + this.Lreal.toFixed(2) + ' m\nT = ' + this.T.toFixed(2) + ' s');
      });
    }
  },

  // ---- Gelombang Bandul (pendulum wave) ----
  _buildWave: function (root) {
    const THREE = this.THREE;
    const g = this.data.gravity;
    this.amp = (this.data.amplitudeDeg - 6) * Math.PI / 180;
    this._buildFrame(root, 1.06);

    const n = 9;
    const xs = -0.44, xe = 0.44;
    const lenTop = 0.60, lenBot = 0.32;     // panjang berbeda -> periode berbeda
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1);
      const visLen = lenTop + (lenBot - lenTop) * f;
      const Lreal = visLen / this.UNITS_PER_M;
      const omega = Math.sqrt(g / Lreal);
      const x = xs + (xe - xs) * f;

      const pivot = new THREE.Group(); pivot.position.set(x, this.PIVOT_Y, 0); root.add(pivot);
      const strMat = new THREE.MeshStandardMaterial({ color: 0x8a929c, roughness: 0.6, metalness: 0.2 });
      const str = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, visLen, 6), strMat);
      str.position.set(0, -visLen / 2, 0); pivot.add(str);
      const col = new THREE.Color().setHSL(0.58 - 0.58 * f, 0.7, 0.55);
      const bob = new THREE.Mesh(new THREE.SphereGeometry(0.038, 22, 22), new THREE.MeshStandardMaterial({ color: col, roughness: 0.35, metalness: 0.35 }));
      bob.position.set(0, -visLen, 0); pivot.add(bob);
      this.waves.push({ pivot, omega, phase: 0 });
    }
    if (this.data.showLabels) {
      this._title(root, 'Gelombang Bandul');
      const cap = this._makeChip('Panjang beda → periode beda → pola merambat', { bg: 'rgba(14,32,56,0.92)', fs: 34 });
      cap.position.set(0, -0.60, 0.05); cap.scale.multiplyScalar(0.8); root.add(cap);
    }
  },

  // ---- Ayunan Newton (Newton's cradle) ----
  _buildCradle: function (root) {
    const THREE = this.THREE;
    this._buildFrame(root, 0.80);
    const n = 5, r = 0.058, gap = 0.001;
    const visLen = 0.5;
    const spacing = 2 * r + gap;
    const x0 = -(n - 1) * spacing / 2;
    const balls = [];
    for (let i = 0; i < n; i++) {
      const x = x0 + i * spacing;
      const pivot = new THREE.Group(); pivot.position.set(x, this.PIVOT_Y, 0); root.add(pivot);
      // dua tali (V) supaya seperti ayunan Newton asli
      const strMat = new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.6, metalness: 0.2 });
      [-0.05, 0.05].forEach((dz) => {
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, visLen, 5), strMat);
        s.position.set(0, -visLen / 2, dz); s.rotation.x = Math.atan2(dz, visLen) * 0.0; pivot.add(s);
      });
      const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 28), new THREE.MeshStandardMaterial({ color: 0xc7ccd2, roughness: 0.22, metalness: 0.92 }));
      ball.position.set(0, -visLen, 0); pivot.add(ball);
      const hi = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
      hi.position.set(-0.018, -visLen + 0.02, 0.04); pivot.add(hi);
      balls.push({ pivot, ball });
    }
    this.cradle = { balls, T: 1.7, amp: 0.5 };
    if (this.data.showLabels) {
      this._title(root, 'Ayunan Newton');
      const cap = this._makeChip('Kekekalan momentum & energi — tumbukan lenting', { bg: 'rgba(14,32,56,0.92)', fs: 34 });
      cap.position.set(0, -0.58, 0.05); cap.scale.multiplyScalar(0.8); root.add(cap);
    }
  },

  _title: function (root, text) {
    const title = this._makeChip(text, { bg: 'rgba(14,32,56,0.96)', pad: 30, fs: 50 });
    title.position.set(0, 0.58, 0.06); root.add(title);
  },

  // Rangka: alas + tiang + palang atas
  _buildFrame: function (root, width) {
    const THREE = this.THREE;
    const wood  = new THREE.MeshStandardMaterial({ color: 0xb4653a, roughness: 0.7, metalness: 0.05 });
    const metal = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.35, metalness: 0.7 });
    const dark  = new THREE.MeshStandardMaterial({ color: 0x262b31, roughness: 0.6, metalness: 0.2 });
    const edge  = new THREE.LineBasicMaterial({ color: 0x0e1520, transparent: true, opacity: 0.4 });
    const addEdges = (m) => m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), edge));
    const bar = new THREE.Mesh(new THREE.BoxGeometry(width, 0.06, 0.16), wood);
    bar.position.set(0, 0.40, 0); root.add(bar); addEdges(bar);
    const base = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.05, 0.20), dark);
    base.position.set(0, -0.52, 0); root.add(base); addEdges(base);
    const px = width / 2 - 0.05;
    [-px, px].forEach((x) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.92, 16), metal);
      post.position.set(x, -0.06, 0); root.add(post);
    });
  },

  _dashedLine: function (points, color, dashSize, gapSize, opacity) {
    const THREE = this.THREE;
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({ color, dashSize, gapSize, transparent: true, opacity: opacity == null ? 1 : opacity });
    const line = new THREE.Line(geom, mat); line.computeLineDistances(); return line;
  },

  _makeChip: function (text, opt) {
    const THREE = this.THREE; opt = opt || {};
    const fs = opt.fs || 44, pad = opt.pad || 26, lh = fs * 1.28;
    const lines = String(text).split('\n');
    const c = document.createElement('canvas'); let ctx = c.getContext('2d');
    ctx.font = 'bold ' + fs + 'px sans-serif';
    let w = 0; for (const ln of lines) w = Math.max(w, ctx.measureText(ln).width);
    w = Math.ceil(w) + pad * 2;
    const h = Math.ceil(lh * lines.length) + pad * 2 - (lh - fs);
    c.width = w; c.height = h; ctx = c.getContext('2d');
    if (opt.bg && opt.bg !== 'rgba(14,32,56,0.0)') { const r = Math.min(h, 40); this._roundRect(ctx, 0, 0, w, h, r); ctx.fillStyle = opt.bg; ctx.fill(); }
    ctx.font = 'bold ' + fs + 'px sans-serif'; ctx.fillStyle = opt.color || '#ffffff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((ln, i) => ctx.fillText(ln, w / 2, pad + lh / 2 + i * lh));
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true; tex.anisotropy = 4;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    const scaleH = 0.075 * lines.length + 0.02; spr.scale.set(scaleH * (w / h), scaleH, 1); return spr;
  },

  _makeLiveChip: function (heightUnits) {
    const THREE = this.THREE;
    const W = 340, H = 300, fs = 44, lh = fs * 1.32;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true; tex.anisotropy = 4;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    spr.scale.set(heightUnits * (W / H), heightUnits, 1);
    const draw = (text) => {
      ctx.clearRect(0, 0, W, H); this._roundRect(ctx, 0, 0, W, H, 28);
      ctx.fillStyle = 'rgba(14,32,56,0.92)'; ctx.fill();
      ctx.font = 'bold ' + fs + 'px sans-serif'; ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lines = text.split('\n');
      lines.forEach((ln, i) => ctx.fillText(ln, W / 2, (H - (lines.length - 1) * lh) / 2 + i * lh));
      tex.needsUpdate = true;
    };
    draw('Posisi: —\nθ = 0°\nL = -\nT = -'); return { sprite: spr, draw };
  },

  _roundRect: function (ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  },

  _disposeRoot: function () {
    if (!this.root) return;
    this.root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { const m = o.material; if (m.map) m.map.dispose(); m.dispose(); }
    });
    if (this.spin) this.spin.remove(this.root);
    this.root = null;
  }
});
