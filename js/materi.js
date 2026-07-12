// Sumber tunggal data materi — dipakai penampil 3D (/v/*) & AR (/scan/).
// Teks deskripsi & legenda VERBATIM sesuai infografis.

export const MATERI = {
  "bandul": {
    slug: "bandul",
    markerIndex: 0,
    title: "Bandul Sederhana (Simple Pendulum)",
    short: "Bandul Sederhana",
    model: "/models/bandul-sederhana.glb",
    clip: "Ayunan",
    qrUrl: "https://chensqy.my.id/v/bandul/",
    description: "<b>Bandul sederhana</b> adalah sistem yang terdiri dari beban kecil yang digantung pada tali ringan dan tidak bermassa. Ketika dilepaskan dari suatu posisi simpangan, bandul akan bergerak bolak-balik melalui titik keseimbangan secara periodik sehingga menghasilkan gerak getaran.",
    labels: [
      { node: "Pivot", text: "Titik tumpu", color: "#12386e", dx: -84, dy: -26 },
      { node: "Tali", text: "Tali", color: "#12386e", dx: 96, dy: -8 },
      { node: "Bola", text: "Beban (m)", color: "#1a4fa0", dx: 92, dy: 4 },
      { at: [0, -0.158, 0], text: "Titik keseimbangan", color: "#12386e", dx: -104, dy: 6 },
      { at: [0.11, -0.24, 0], text: "Simpangan (x)", color: "#12386e", dx: 10, dy: 44 }
    ],
    legend: [
      { type: "dot", color: "#12386e", term: "Titik tumpu", desc: "titik gantung tetap tempat tali berporos." },
      { type: "bar", color: "#12386e", term: "Tali", desc: "penggantung ringan yang dianggap tak bermassa." },
      { type: "dot", color: "#1a4fa0", term: "Beban (m)", desc: "massa di ujung tali yang berayun." },
      { type: "dashed", color: "#12386e", term: "Titik keseimbangan", desc: "posisi terendah bandul saat diam (tepat di bawah titik tumpu)." },
      { type: "arrow", color: "#12386e", term: "Simpangan (x)", desc: "jarak beban dari titik keseimbangan saat berayun." }
    ],
    formula: {
      title: "Periode bandul sederhana",
      eqs: ["<i>T</i> = 2π √( <i>L</i> / <i>g</i> )"],
      note: "<i>T</i> = periode (s), <i>L</i> = panjang tali (m), <i>g</i> = percepatan gravitasi (m/s²). Periode tidak bergantung pada besar massa beban."
    }
  },

  "gelombang-transversal": {
    slug: "gelombang-transversal",
    markerIndex: 1,
    title: "Ilustrasi Gelombang Transversal",
    short: "Gelombang Transversal",
    model: "/models/gelombang-transversal.glb",
    clip: "Gelombang",
    qrUrl: "https://chensqy.my.id/v/gelombang-transversal/",
    description: "Ilustrasi gelombang <b>transversal</b> yang merambat ke arah kanan. Panah hijau menunjukkan arah perambatan gelombang, panah merah menunjukkan amplitudo, sedangkan panah kuning menunjukkan panjang gelombang (λ).",
    labels: [
      { at: [0.06, 0.25, 0], text: "Arah perambatan", color: "#1f9c4d", dx: 0, dy: -34 },
      { at: [-0.24, 0.04, 0], text: "Amplitudo (A)", color: "#e23c3c", dx: -74, dy: 0 },
      { at: [0.114, 0.155, 0], text: "Panjang gelombang (λ)", color: "#c78a00", dx: 0, dy: -30 },
      { at: [-0.34, 0, 0], text: "Posisi setimbang", color: "#5a6b82", dx: -64, dy: 0 }
    ],
    legend: [
      { type: "arrow", color: "#1f9c4d", term: "Panah hijau", desc: "arah perambatan gelombang (ke kanan)." },
      { type: "arrow", color: "#e23c3c", term: "Panah merah", desc: "amplitudo (A), yaitu simpangan maksimum dari posisi setimbang (jarak dari titik setimbang ke puncak atau lembah)." },
      { type: "arrow", color: "#c78a00", term: "Panah kuning", desc: "panjang gelombang (λ), yaitu jarak antara dua titik yang sefase (dua puncak berurutan atau dua lembah berurutan)." }
    ],
    formula: {
      title: "Besaran gelombang",
      eqs: ["<i>v</i> = <i>λ</i> / <i>T</i> = <i>λ</i> · <i>f</i>", "<i>f</i> = <i>n</i> / <i>t</i>&nbsp;&nbsp;&nbsp;<i>T</i> = <i>t</i> / <i>n</i>&nbsp;&nbsp;&nbsp;<i>f</i> = 1 / <i>T</i>"],
      note: "<i>v</i> = cepat rambat (m/s), <i>λ</i> = panjang gelombang (m), <i>T</i> = periode (s), <i>f</i> = frekuensi (Hz), <i>n</i> = jumlah gelombang, <i>t</i> = waktu (s)."
    }
  },

  "gelombang-longitudinal": {
    slug: "gelombang-longitudinal",
    markerIndex: 2,
    title: "Ilustrasi Gelombang Longitudinal",
    short: "Gelombang Longitudinal",
    model: "/models/gelombang-longitudinal.glb",
    clip: "Gelombang",
    qrUrl: "https://chensqy.my.id/v/gelombang-longitudinal/",
    description: "Ilustrasi gelombang <b>longitudinal</b> yang merambat ke arah kanan. Partikel medium bergetar sejajar dengan arah rambat gelombang sehingga terbentuk rapatan dan renggangan. Jarak antara dua rapatan atau dua renggangan yang berurutan merupakan panjang gelombang (λ).",
    labels: [
      { at: [0.45, 0.13, 0], text: "Arah perambatan", color: "#1f9c4d", dx: 0, dy: -60 },
      { at: [0.14, 0.085, 0], text: "Rapatan (Kompresi)", color: "#1a4fa0", dx: -48, dy: -30 },
      { at: [0.32, 0.085, 0], text: "Renggangan (Rarefaksi)", color: "#e23c3c", dx: 34, dy: -22 },
      { at: [0.24, -0.1, 0], text: "Panjang gelombang (λ)", color: "#c78a00", dx: 0, dy: 38 },
      { node: "Speaker", text: "Sumber getar", color: "#12386e", dx: -70, dy: -6 }
    ],
    legend: [
      { type: "arrow", color: "#1f9c4d", term: "Panah hijau", desc: "arah perambatan gelombang (ke kanan)." },
      { type: "dot", color: "#1a4fa0", term: "Rapatan (Kompresi)", desc: "daerah partikel yang rapat, partikel saling berdekatan." },
      { type: "dot", color: "#e23c3c", term: "Renggangan (Rarefaksi)", desc: "daerah partikel yang renggang, partikel saling berjauhan." },
      { type: "arrow", color: "#c78a00", term: "Panjang gelombang (λ)", desc: "jarak antara dua rapatan berturut-turut atau dua renggangan berturut-turut." }
    ],
    formula: {
      title: "Besaran gelombang",
      eqs: ["<i>v</i> = <i>λ</i> / <i>T</i> = <i>λ</i> · <i>f</i>", "<i>f</i> = <i>n</i> / <i>t</i>&nbsp;&nbsp;&nbsp;<i>T</i> = <i>t</i> / <i>n</i>&nbsp;&nbsp;&nbsp;<i>f</i> = 1 / <i>T</i>"],
      note: "<i>v</i> = cepat rambat (m/s), <i>λ</i> = panjang gelombang (m), <i>T</i> = periode (s), <i>f</i> = frekuensi (Hz), <i>n</i> = jumlah gelombang, <i>t</i> = waktu (s)."
    }
  }
};

export const MATERI_BY_INDEX = Object.values(MATERI).sort((a, b) => a.markerIndex - b.markerIndex);

export const SPEED_KEY = "chensqy-speed";
export const THEME_KEY = "chensqy-theme";
export const SPEEDS = [0.25, 0.5, 1, 1.5, 2];

export function getSpeed() {
  try { const v = parseFloat(localStorage.getItem(SPEED_KEY)); return SPEEDS.includes(v) ? v : 1; }
  catch (e) { return 1; }
}
export function setSpeed(v) { try { localStorage.setItem(SPEED_KEY, String(v)); } catch (e) {} }

// slug dari path (/v/<slug>/) atau query (?m=<slug>)
export function slugFromLocation() {
  const q = new URLSearchParams(location.search).get("m");
  if (q && MATERI[q]) return q;
  const m = location.pathname.match(/\/v\/([^/]+)\/?/);
  if (m && MATERI[m[1]]) return m[1];
  return null;
}
