/* global AFRAME */
/*
 * Komponen A-Frame: <a-entity pendulum-lab>
 *
 * WebAR pop-out 3D untuk BANDUL SEDERHANA (simple pendulum) — media ajar skripsi.
 *
 * Sesuai diagram penelitian: SATU bandul berayun kiri <-> kanan, melewati tiga
 * posisi berlabel:
 *     A = simpangan KIRI  (paling kiri)
 *     B = TENGAH / bawah  (titik setimbang, terendah)
 *     C = simpangan KANAN (paling kanan)
 *
 * Bandul berayun sesuai fisika: sudut theta(t) = theta0 * cos(omega t),
 * dengan omega = sqrt(g / L) sehingga periode T = 2 pi sqrt(L / g).
 * Label A/B/C menyala saat beban melewati posisinya.
 *
 * Semua digambar dengan THREE murni + label via tekstur kanvas (tanpa font CDN),
 * mengikuti pola proyek "dinda" agar tetap self-hosted.
 *
 * Sumbu: bidang marker = XY (X kanan, Y atas), Z keluar dari marker (ke kamera).
 * Rotasi pivot pada sumbu Z: theta > 0 -> beban ke KANAN (C), theta < 0 -> KIRI (A).
 */
AFRAME.registerComponent('pendulum-lab', {
  schema: {
    length:       { type: 'number',  default: 0.40 }, // panjang tali (meter)
    gravity:      { type: 'number',  default: 9.8 },  // m/s^2
    amplitudeDeg: { type: 'number',  default: 32 },   // simpangan sudut A/C
    lift:         { type: 'number',  default: 0.06 }, // mengambang di atas marker
    showLabels:   { type: 'boolean', default: true }
  },

  init: function () {
    const THREE = AFRAME.THREE;
    this.THREE = THREE;

    this.PIVOT_Y     = 0.37;   // titik gantung (di palang atas)
    this.UNITS_PER_M = 1.32;   // panjang layar = L(meter) * ini

    this.group = new THREE.Group();
    this.group.position.set(0, 0, this.data.lift);
    this.el.object3D.add(this.group);

    this.marks = [];       // { key, angle, ghost, label, baseScale }
    this.live = [];        // fungsi update label live
    this._t = 0;
    this._appear = 0;
    this._throttle = 0;

    this._build();
  },

  remove: function () {
    if (this.group) this.el.object3D.remove(this.group);
    this._disposeRoot();
  },

  tick: function (time, dt) {
    if (!dt || !this.root) return;
    // Hemat: lewati animasi bila anchor (marker) tidak sedang terlihat.
    const parent = this.el.object3D.parent;
    if (parent && parent.visible === false) return;
    const sec = dt / 1000;
    this._t += sec;

    // animasi kemunculan (skala naik) saat scene dibangun
    if (this._appear < 1) {
      this._appear = Math.min(1, this._appear + sec / 0.3);
      const e = 1 - Math.pow(1 - this._appear, 3);           // easeOutCubic
      this.root.scale.setScalar(0.85 + 0.15 * e);
    }
    // mengambang halus
    this.group.position.z = this.data.lift + 0.01 * Math.sin(this._t * 1.4);

    // ---- ayunan bandul (fisika) ----
    const theta = this.amp * Math.cos(this.omega * this._t);  // theta(t)
    this.pivot.rotation.z = theta;
    this.theta = theta;

    // ---- sorot posisi A/B/C terdekat ----
    const near = this.amp * 0.16;   // ambang "sampai" di posisi
    let active = null;
    for (const m of this.marks) {
      const on = Math.abs(theta - m.angle) <= near;
      if (on && (active === null || Math.abs(theta - m.angle) < Math.abs(theta - active.angle))) active = m;
    }
    for (const m of this.marks) {
      const on = (m === active);
      const k = on ? 1.34 : 1.0;
      if (m.label && m.baseScale) m.label.scale.set(m.baseScale.x * k, m.baseScale.y * k, 1);
      if (m.ghostMat) {
        m.ghostMat.opacity = on ? 0.92 : 0.34;
        m.ghostMat.emissiveIntensity = on ? 0.9 : 0.0;
      }
    }
    this._active = active;

    // ---- label live (throttle ~10 fps) ----
    this._throttle += sec;
    if (this.live.length && this._throttle >= 0.1) {
      this._throttle = 0;
      for (const fn of this.live) fn();
    }
  },

  // ===================== BANGUN SCENE =====================
  _build: function () {
    const THREE = this.THREE;
    this._disposeRoot();
    const root = this.root = new THREE.Group();
    this.group.add(root);
    this.marks = [];
    this.live = [];
    this._appear = 0;

    const g = this.data.gravity;
    const L = this.data.length;
    this.amp = this.data.amplitudeDeg * Math.PI / 180;
    this.visLen = L * this.UNITS_PER_M;
    this.omega = Math.sqrt(g / L);
    this.T = 2 * Math.PI / this.omega;
    this.Lreal = L;

    const visLen = this.visLen;
    const posAt = (a) => new THREE.Vector3(visLen * Math.sin(a), this.PIVOT_Y - visLen * Math.cos(a), 0);
    this._posAt = posAt;

    this._buildFrame(root);

    // ---- busur ayunan putus-putus A -> B -> C ----
    const arcPts = [];
    const N = 48;
    for (let i = 0; i <= N; i++) arcPts.push(posAt(-this.amp + (2 * this.amp) * i / N));
    root.add(this._dashedLine(arcPts, 0x2b3446, 0.030, 0.022, 0.85));

    // ---- tali putus-putus ke posisi ekstrem A & C ----
    const pivotV = new THREE.Vector3(0, this.PIVOT_Y, 0);
    root.add(this._dashedLine([pivotV, posAt(-this.amp)], 0x2b3446, 0.028, 0.02, 0.7));
    root.add(this._dashedLine([pivotV, posAt(this.amp)],  0x2b3446, 0.028, 0.02, 0.7));

    // ---- penanda posisi A / B / C (bola biru transparan + label) ----
    const defs = [
      { k: 'A', a: -this.amp, sub: 'kiri',   lx: -0.02 },
      { k: 'B', a: 0,         sub: 'tengah', lx: 0.0 },
      { k: 'C', a: this.amp,  sub: 'kanan',  lx: 0.02 }
    ];
    defs.forEach((d) => {
      const p = posAt(d.a);
      const ghostMat = new THREE.MeshStandardMaterial({
        color: 0x6ea8f0, roughness: 0.5, metalness: 0.1,
        emissive: 0x2f6fd0, emissiveIntensity: 0.0, transparent: true, opacity: 0.34
      });
      const ghost = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 24), ghostMat);
      ghost.position.copy(p);
      root.add(ghost);

      let label = null, baseScale = null;
      if (this.data.showLabels) {
        label = this._makeChip(d.k, { bg: 'rgba(20,40,70,0.95)', fs: 60, pad: 22 });
        label.scale.multiplyScalar(0.66);
        label.position.set(p.x + d.lx, p.y - 0.14, 0.06);
        baseScale = label.scale.clone();
        root.add(label);
      }
      this.marks.push({ key: d.k, angle: d.a, ghostMat, label, baseScale });
    });

    // ---- bandul yang bergerak (pivot + tali + beban) ----
    const pivot = new THREE.Group();
    pivot.position.copy(pivotV);
    root.add(pivot);
    this.pivot = pivot;

    const strMat = new THREE.MeshStandardMaterial({ color: 0x8a929c, roughness: 0.6, metalness: 0.2 });
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, visLen, 8), strMat);
    str.position.set(0, -visLen / 2, 0);
    pivot.add(str);

    const bobMat = new THREE.MeshStandardMaterial({ color: 0x3f7fe6, roughness: 0.32, metalness: 0.5 });
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 30, 30), bobMat);
    bob.position.set(0, -visLen, 0);
    pivot.add(bob);
    const hi = new THREE.Mesh(
      new THREE.SphereGeometry(0.013, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
    );
    hi.position.set(-0.017, -visLen + 0.017, 0.035);
    pivot.add(hi);
    this.bob = bob;

    // ---- judul + rumus + readout live ----
    if (this.data.showLabels) {
      const title = this._makeChip('Bandul Sederhana', { bg: 'rgba(14,32,56,0.96)', pad: 30, fs: 50 });
      title.position.set(0, 0.58, 0.06);
      root.add(title);

      const formula = this._makeChip('T = 2π √(L/g)', { bg: 'rgba(14,32,56,0.92)', fs: 42 });
      formula.position.set(0, -0.64, 0.05);
      formula.scale.multiplyScalar(0.92);
      root.add(formula);

      const readout = this._makeLiveChip(0.46);
      readout.sprite.position.set(0.62, 0.18, 0.05);
      root.add(readout.sprite);
      this.live.push(() => {
        const deg = this.theta * 180 / Math.PI;
        let pos = '—';
        if (this._active) {
          const nm = { A: 'A (kiri)', B: 'B (tengah)', C: 'C (kanan)' };
          pos = nm[this._active.key];
        }
        readout.draw(
          'Posisi: ' + pos + '\n' +
          'θ = ' + deg.toFixed(0) + '°\n' +
          'L = ' + this.Lreal.toFixed(2) + ' m\n' +
          'T = ' + this.T.toFixed(2) + ' s'
        );
      });
    }
  },

  // Rangka: alas + dua tiang + palang atas (mirip alat peraga pada marker)
  _buildFrame: function (root) {
    const THREE = this.THREE;
    const wood  = new THREE.MeshStandardMaterial({ color: 0xb4653a, roughness: 0.7, metalness: 0.05 });
    const metal = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.35, metalness: 0.7 });
    const dark  = new THREE.MeshStandardMaterial({ color: 0x262b31, roughness: 0.6, metalness: 0.2 });
    const edge  = new THREE.LineBasicMaterial({ color: 0x0e1520, transparent: true, opacity: 0.4 });

    const addEdges = (mesh) => {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edge);
      mesh.add(e);
    };

    // palang atas (kayu) — cokelat seperti diagram
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.06, 0.14), wood);
    bar.position.set(0, 0.40, 0); root.add(bar); addEdges(bar);

    // alas (gelap)
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.05, 0.18), dark);
    base.position.set(0, -0.52, 0); root.add(base); addEdges(base);

    // dua tiang (logam)
    [-0.35, 0.35].forEach((x) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.92, 16), metal);
      post.position.set(x, -0.06, 0); root.add(post);
    });
  },

  // Garis putus-putus dari daftar titik
  _dashedLine: function (points, color, dashSize, gapSize, opacity) {
    const THREE = this.THREE;
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
      color, dashSize, gapSize, transparent: true, opacity: opacity == null ? 1 : opacity
    });
    const line = new THREE.Line(geom, mat);
    line.computeLineDistances();
    return line;
  },

  // ===================== LABEL (tekstur kanvas) =====================
  _makeChip: function (text, opt) {
    const THREE = this.THREE;
    opt = opt || {};
    const fs = opt.fs || 44, pad = opt.pad || 26, lh = fs * 1.28;
    const lines = String(text).split('\n');
    const c = document.createElement('canvas');
    let ctx = c.getContext('2d');
    ctx.font = 'bold ' + fs + 'px sans-serif';
    let w = 0;
    for (const ln of lines) w = Math.max(w, ctx.measureText(ln).width);
    w = Math.ceil(w) + pad * 2;
    const h = Math.ceil(lh * lines.length) + pad * 2 - (lh - fs);
    c.width = w; c.height = h;
    ctx = c.getContext('2d');

    if (opt.bg && opt.bg !== 'rgba(14,32,56,0.0)') {
      const r = Math.min(h, 40);
      this._roundRect(ctx, 0, 0, w, h, r);
      ctx.fillStyle = opt.bg; ctx.fill();
    }
    ctx.font = 'bold ' + fs + 'px sans-serif';
    ctx.fillStyle = opt.color || '#ffffff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((ln, i) => {
      const y = pad + lh / 2 + i * lh;
      ctx.fillText(ln, w / 2, y);
    });

    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true;
    tex.anisotropy = 4;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    const scaleH = 0.075 * lines.length + 0.02;
    spr.scale.set(scaleH * (w / h), scaleH, 1);
    return spr;
  },

  // chip yang isinya di-update tiap frame (readout) — kanvas dipakai ulang
  _makeLiveChip: function (heightUnits) {
    const THREE = this.THREE;
    const W = 340, H = 300, fs = 44, lh = fs * 1.32;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true; tex.anisotropy = 4;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    spr.scale.set(heightUnits * (W / H), heightUnits, 1);

    const draw = (text) => {
      ctx.clearRect(0, 0, W, H);
      this._roundRect(ctx, 0, 0, W, H, 28);
      ctx.fillStyle = 'rgba(14,32,56,0.92)'; ctx.fill();
      ctx.font = 'bold ' + fs + 'px sans-serif';
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lines = text.split('\n');
      lines.forEach((ln, i) => ctx.fillText(ln, W / 2, (H - (lines.length - 1) * lh) / 2 + i * lh));
      tex.needsUpdate = true;
    };
    draw('Posisi: —\nθ = 0°\nL = -\nT = -');
    return { sprite: spr, draw };
  },

  _roundRect: function (ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  _disposeRoot: function () {
    if (!this.root) return;
    this.root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const m = o.material;
        if (m.map) m.map.dispose();
        m.dispose();
      }
    });
    this.group.remove(this.root);
    this.root = null;
  }
});
