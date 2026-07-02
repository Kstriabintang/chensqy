/* global AFRAME */
/*
 * Komponen A-Frame: <a-entity pendulum-lab>
 *
 * WebAR pop-out 3D untuk BANDUL SEDERHANA (simple pendulum) — media ajar skripsi.
 * Bandul berayun sesuai fisika sungguhan: sudut  theta(t) = theta0 * cos(omega t),
 * dengan omega = sqrt(g / L) sehingga periode T = 2 pi sqrt(L / g).
 * Panjang tali di layar SEBANDING dengan L (meter), jadi periode yang terlihat
 * konsisten dengan rumus yang ditampilkan — enak untuk demonstrasi sidang.
 *
 * 3 MODE:
 *   A = Bandul Tunggal        -> satu bandul, tampil live sudut theta, L, dan T
 *   B = Pengaruh Panjang Tali -> tiga bandul beda panjang dilepas bersamaan (T ~ akar L)
 *   C = Kekekalan Energi      -> bar energi EP <-> EK berubah, jumlahnya tetap
 *
 * Semua digambar dengan THREE murni + label via tekstur kanvas (tanpa font CDN),
 * mengikuti pola proyek "dinda" agar tetap self-hosted.
 *
 * Sumbu: bidang marker = XY (X kanan, Y atas), Z keluar dari marker (ke arah kamera).
 * Rangka BERDIRI di bidang marker; bandul berayun pada bidang XY (berputar di sumbu Z).
 */
AFRAME.registerComponent('pendulum-lab', {
  schema: {
    mode:         { type: 'string',  default: 'A' },  // A | B | C
    gravity:      { type: 'number',  default: 9.8 },  // m/s^2
    amplitudeDeg: { type: 'number',  default: 20 },   // simpangan sudut awal
    lift:         { type: 'number',  default: 0.06 }, // mengambang di atas marker
    showLabels:   { type: 'boolean', default: true }
  },

  init: function () {
    const THREE = AFRAME.THREE;
    this.THREE = THREE;

    // ambang atas rangka & pemetaan panjang (unit-marker per meter)
    this.PIVOT_Y   = 0.37;
    this.UNITS_PER_M = 1.32;   // L=0.50 m -> 0.66 unit (pas di dalam rangka)

    this.group = new THREE.Group();
    this.group.position.set(0, 0, this.data.lift);
    this.el.object3D.add(this.group);

    this.pends = [];        // { pivot, bob, visLen, Lreal, omega, T }
    this.energy = null;     // { peBar, keBar, peBase, keTop } utk mode C
    this.live = [];         // chip yang di-update tiap frame { redraw(sec) }
    this._t = 0;
    this._appear = 0;       // animasi kemunculan saat ganti mode
    this._throttle = 0;

    this.mode = (this.data.mode || 'A').toUpperCase();
    this._build(this.mode);
  },

  remove: function () {
    if (this.group) this.el.object3D.remove(this.group);
    this._disposeRoot();
  },

  // API publik dipanggil dari tombol UI di index.html
  setMode: function (mode) {
    mode = (mode || 'A').toUpperCase();
    if (mode === this.mode && this.root) return;
    this.mode = mode;
    this._build(mode);
  },

  tick: function (time, dt) {
    if (!dt || !this.root) return;
    // Hemat: lewati animasi bila anchor (marker) tidak sedang terlihat.
    // Saat multi-marker, hanya bandul di foto yang terdeteksi yang dianimasikan.
    const parent = this.el.object3D.parent;
    if (parent && parent.visible === false) return;
    const sec = dt / 1000;
    this._t += sec;

    // animasi kemunculan (skala + naik sedikit) saat mode dibangun
    if (this._appear < 1) {
      this._appear = Math.min(1, this._appear + sec / 0.28);
      const e = 1 - Math.pow(1 - this._appear, 3);          // easeOutCubic
      this.root.scale.setScalar(0.85 + 0.15 * e);
    }
    // mengambang halus
    this.group.position.z = this.data.lift + 0.01 * Math.sin(this._t * 1.4);

    // ---- ayunan bandul (fisika) ----
    const th0 = this.data.amplitudeDeg * Math.PI / 180;
    let lead = null;                     // bandul acuan utk readout mode A / energi mode C
    for (const p of this.pends) {
      const ang = th0 * Math.cos(p.omega * this._t);   // theta(t)
      p.pivot.rotation.z = ang;
      p.theta = ang;
      if (lead === null) lead = p;
    }

    // ---- bar energi (mode C) ----
    if (this.energy && lead) {
      const denom = (1 - Math.cos(th0)) || 1e-6;
      const pe = (1 - Math.cos(lead.theta)) / denom;     // 0..1 (maks di simpangan)
      const ke = 1 - pe;                                  // 0..1 (maks di titik terendah)
      const H = this.energy.H;
      this.energy.peBar.scale.y = Math.max(0.0001, pe);
      this.energy.peBar.position.y = this.energy.y0 + (H * pe) / 2;
      this.energy.keBar.scale.y = Math.max(0.0001, ke);
      this.energy.keBar.position.y = this.energy.y0 + H * pe + (H * ke) / 2;
    }

    // ---- update label live (throttle ~10 fps) ----
    this._throttle += sec;
    if (this.live.length && this._throttle >= 0.1) {
      this._throttle = 0;
      for (const fn of this.live) fn(lead);
    }
  },

  // ===================== KONFIGURASI MODE =====================
  _modeConfig: function (mode) {
    if (mode === 'B') {
      return {
        title: 'Pengaruh Panjang Tali',
        pendulums: [
          { L: 0.25, x: -0.26 },
          { L: 0.36, x:  0.00 },
          { L: 0.50, x:  0.26 }
        ],
        showEnergy: false,
        perLabel: true
      };
    }
    if (mode === 'C') {
      return {
        title: 'Kekekalan Energi',
        pendulums: [ { L: 0.45, x: 0.0 } ],
        showEnergy: true,
        perLabel: false
      };
    }
    // mode A (default)
    return {
      title: 'Bandul Tunggal',
      pendulums: [ { L: 0.40, x: 0.0 } ],
      showEnergy: false,
      perLabel: false,
      liveReadout: true
    };
  },

  // ===================== BANGUN SCENE =====================
  _build: function (mode) {
    const THREE = this.THREE;
    this._disposeRoot();
    const root = this.root = new THREE.Group();
    this.group.add(root);
    this.pends = [];
    this.energy = null;
    this.live = [];
    this._appear = 0;

    const cfg = this._modeConfig(mode);
    this._buildFrame(root);

    const g = this.data.gravity;
    cfg.pendulums.forEach((def) => {
      const visLen = def.L * this.UNITS_PER_M;
      const omega = Math.sqrt(g / def.L);
      const T = 2 * Math.PI / omega;

      const pivot = new THREE.Group();
      pivot.position.set(def.x, this.PIVOT_Y, 0);
      root.add(pivot);

      // tali
      const strMat = new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.6, metalness: 0.2 });
      const str = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, visLen, 8), strMat);
      str.position.set(0, -visLen / 2, 0);
      pivot.add(str);

      // bandul (bola logam)
      const bobMat = new THREE.MeshStandardMaterial({ color: 0xcfd5db, roughness: 0.28, metalness: 0.85 });
      const bob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 28, 28), bobMat);
      bob.position.set(0, -visLen, 0);
      pivot.add(bob);
      // kilau kecil
      const hi = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
      );
      hi.position.set(-0.016, -visLen + 0.016, 0.03);
      pivot.add(hi);

      const entry = { pivot, bob, visLen, Lreal: def.L, omega, T, theta: 0 };
      this.pends.push(entry);

      // label per-bandul (mode B): L & T di bawah titik seimbang
      if (cfg.perLabel && this.data.showLabels) {
        const spr = this._makeChip(
          'L = ' + def.L.toFixed(2) + ' m\nT = ' + T.toFixed(2) + ' s',
          { bg: 'rgba(200,97,26,0.95)', fs: 32, pad: 16 }
        );
        spr.scale.multiplyScalar(0.86);
        spr.position.set(def.x, -0.60, 0.05);
        root.add(spr);
      }
    });

    // Judul di atas rangka
    if (this.data.showLabels) {
      const title = this._makeChip(cfg.title, { bg: 'rgba(14,32,56,0.96)', pad: 34, fs: 52 });
      title.position.set(0, 0.56, 0.06);
      root.add(title);
    }

    // Mode A: rumus + readout live
    if (cfg.liveReadout && this.data.showLabels) {
      const lead = this.pends[0];
      const formula = this._makeChip('T = 2π √(L/g)', { bg: 'rgba(14,32,56,0.92)' });
      formula.position.set(0, -0.62, 0.05);
      root.add(formula);

      // panel angka yang diperbarui tiap frame
      const readout = this._makeLiveChip(0.5);
      readout.sprite.position.set(0.66, 0.18, 0.05);
      root.add(readout.sprite);
      this.live.push((lead2) => {
        const p = lead2 || lead;
        const degNow = (p.theta * 180 / Math.PI);
        readout.draw(
          'θ = ' + degNow.toFixed(0) + '°\n' +
          'L = ' + p.Lreal.toFixed(2) + ' m\n' +
          'T = ' + p.T.toFixed(2) + ' s'
        );
      });
    }

    // Mode C: bar energi
    if (cfg.showEnergy) this._buildEnergyBar(root);
  },

  // Rangka: alas + dua tiang + palang atas (mirip alat peraga pada marker)
  _buildFrame: function (root) {
    const THREE = this.THREE;
    const wood  = new THREE.MeshStandardMaterial({ color: 0x8a4b2a, roughness: 0.7, metalness: 0.05 });
    const metal = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.35, metalness: 0.7 });
    const dark  = new THREE.MeshStandardMaterial({ color: 0x262b31, roughness: 0.6, metalness: 0.2 });
    const edge  = new THREE.LineBasicMaterial({ color: 0x0e1520, transparent: true, opacity: 0.4 });

    const addEdges = (mesh) => {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edge);
      mesh.add(e);
    };

    // palang atas (kayu)
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

  // Bar energi vertikal di sisi kanan (mode C)
  _buildEnergyBar: function (root) {
    const THREE = this.THREE;
    const H = 0.44, x = 0.50, y0 = -0.28, w = 0.05, d = 0.05;

    // bingkai jalur
    const frameMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const fg = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, H, d));
    const frame = new THREE.LineSegments(fg, frameMat);
    frame.position.set(x, y0 + H / 2, 0); root.add(frame);

    // EP (biru) tumbuh dari bawah, EK (oranye) menumpuk di atasnya; unit box tinggi 1 lalu di-skala
    const mkBar = (color) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.82, H, d * 0.82),
        new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 })
      );
      m.position.set(x, y0 + H / 2, 0);   // di dalam bingkai (sisi kanan)
      root.add(m);
      return m;
    };
    const peBar = mkBar(0x2f7bd6);  // energi potensial (tumbuh dari bawah)
    const keBar = mkBar(0xff9614);  // energi kinetik (menumpuk di atas)

    this.energy = { peBar, keBar, H, y0, x };

    if (this.data.showLabels) {
      const title = this._makeChip('Energi', { bg: 'rgba(14,32,56,0.92)', fs: 40, pad: 24 });
      title.position.set(x, y0 + H + 0.10, 0.05);
      title.scale.multiplyScalar(0.8);
      root.add(title);

      // label berwarna di samping jalur: EK (oranye, atas) & EP (biru, bawah)
      const ek = this._makeChip('EK', { bg: 'rgba(255,150,20,0.96)', fs: 34, pad: 16 });
      ek.scale.multiplyScalar(0.7); ek.position.set(x + 0.14, y0 + H - 0.04, 0.05);
      root.add(ek);
      const ep = this._makeChip('EP', { bg: 'rgba(47,123,214,0.96)', fs: 34, pad: 16 });
      ep.scale.multiplyScalar(0.7); ep.position.set(x + 0.14, y0 + 0.04, 0.05);
      root.add(ep);
    }
  },

  // ===================== LABEL (tekstur kanvas) =====================
  // chip statis multi-baris -> THREE.Sprite
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

  // chip yang isinya di-update tiap frame (readout mode A) — kanvas dipakai ulang
  _makeLiveChip: function (heightUnits) {
    const THREE = this.THREE;
    const W = 320, H = 240, fs = 46, lh = fs * 1.3;
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
    draw('θ = 0°\nL = -\nT = -');
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
