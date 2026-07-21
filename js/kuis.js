// Kuis Getaran & Gelombang — chensqy.my.id
// Input nama + kelas · 20 soal · tiap soal benar = 5 poin (maks 100) · salah -> tampil jawaban benar + pembahasan.
// Kunci diperbaiki di no.14 (D/Rapatan) sesuai konsep; typo opsi dari rubrik dibersihkan.

const POINTS_PER = 5; // 20 x 5 = 100

// ---------- diagram SVG (selalu di atas kartu terang) ----------
const FIG = {
  transversal: `<svg viewBox="0 0 320 150" role="img" aria-label="Gelombang berbentuk bukit dan lembah">
    <line x1="10" y1="75" x2="310" y2="75" stroke="#8aa0bd" stroke-width="1.5" stroke-dasharray="5 5"/>
    <path d="M10 75 C 30 20, 65 20, 85 75 S 140 130, 160 75 S 215 20, 235 75 S 290 130, 310 75"
      fill="none" stroke="#1f6fd0" stroke-width="4" stroke-linecap="round"/>
    <line x1="60" y1="20" x2="285" y2="20" stroke="#1f9c4d" stroke-width="2.5"/>
    <path d="M285 20 l-9 -5 v10 z" fill="#1f9c4d"/>
    <text x="172" y="14" font-size="12" fill="#1f7a3d" text-anchor="middle" font-family="sans-serif">arah rambat</text>
  </svg>`,
  longitudinal: `<svg viewBox="0 0 320 130" role="img" aria-label="Gelombang berupa rapatan dan renggangan">
    <g stroke="#22406e" stroke-width="2.4">
      ${[18,40,62,90,122,140,155,168,196,226,256,274,289,304].map(x=>`<line x1="${x}" y1="30" x2="${x}" y2="98"/>`).join('')}
    </g>
    <line x1="40" y1="112" x2="285" y2="112" stroke="#1f9c4d" stroke-width="2.5"/>
    <path d="M285 112 l-9 -5 v10 z" fill="#1f9c4d"/>
    <text x="162" y="122" font-size="12" fill="#1f7a3d" text-anchor="middle" font-family="sans-serif">arah rambat</text>
  </svg>`,
  bandulPath: `<svg viewBox="0 0 300 200" role="img" aria-label="Lintasan ayunan bandul dari A ke O ke B">
    <rect x="120" y="14" width="60" height="12" rx="3" fill="#7a5230"/>
    <circle cx="150" cy="26" r="3.5" fill="#22406e"/>
    <path d="M78 150 A 130 130 0 0 1 222 150" fill="none" stroke="#8aa0bd" stroke-width="1.6" stroke-dasharray="5 5"/>
    <line x1="150" y1="26" x2="78" y2="150" stroke="#b9c6da" stroke-width="1.4"/>
    <line x1="150" y1="26" x2="150" y2="160" stroke="#b9c6da" stroke-width="1.4" stroke-dasharray="4 4"/>
    <line x1="150" y1="26" x2="222" y2="150" stroke="#b9c6da" stroke-width="1.4"/>
    <circle cx="78" cy="150" r="12" fill="#1a4fa0"/><text x="78" y="182" font-size="15" fill="#12386e" text-anchor="middle" font-weight="700" font-family="sans-serif">A</text>
    <circle cx="150" cy="160" r="12" fill="#1a4fa0" opacity=".55"/><text x="150" y="192" font-size="15" fill="#12386e" text-anchor="middle" font-weight="700" font-family="sans-serif">O</text>
    <circle cx="222" cy="150" r="12" fill="#1a4fa0"/><text x="222" y="182" font-size="15" fill="#12386e" text-anchor="middle" font-weight="700" font-family="sans-serif">B</text>
  </svg>`,
};

// ---------- 20 soal ----------
export const QUESTIONS = [
  { q: "Sebuah jembatan gantung bergerak bolak-balik melalui titik kesetimbangannya akibat hembusan angin kencang. Gerak bolak-balik benda melalui titik setimbangnya tersebut disebut...",
    opts: ["Getaran", "Gelombang", "Frekuensi", "Amplitudo"], correct: 0,
    pembahasan: "Getaran adalah gerak bolak-balik suatu benda melalui titik kesetimbangannya, seperti badan jembatan gantung yang bergerak bolak-balik akibat hembusan angin kencang." },

  { q: "Saat kamu duduk di ayunan taman dan mendorongnya, jarak terjauh ayunan itu bergerak menjauh dari posisi diamnya disebut...",
    opts: ["Periode", "Amplitudo", "Panjang gelombang", "Cepat rambat"], correct: 1,
    pembahasan: "Amplitudo adalah simpangan terjauh yang dialami benda saat bergetar, diukur dari posisi setimbangnya." },

  { q: "Sebuah alat sensor mencatat bahwa dalam 1 detik, sebuah pegas bergetar sebanyak 5 kali. Besaran yang menyatakan banyaknya getaran tiap detik ini disebut ...",
    opts: ["Frekuensi", "Periode", "Amplitudo", "Getaran"], correct: 0,
    pembahasan: "Frekuensi adalah besaran yang menyatakan banyaknya getaran yang terjadi dalam waktu satu detik." },

  { q: "Jika frekuensi getaran suatu benda adalah 5 Hz, maka periode getaran benda tersebut adalah...",
    opts: ["0,2 sekon", "5 sekon", "1 sekon", "10 sekon"], correct: 0,
    pembahasan: "Periode T = 1/f = 1/5 Hz = 0,2 sekon." },

  { q: "Berikut adalah beberapa peristiwa dalam kehidupan sehari-hari. Manakah yang merupakan contoh getaran?",
    opts: ["Ombak di lautan", "Cahaya lampu yang menerangi ruangan", "Senar gitar yang dipetik", "Bunyi gema di dalam gua"], correct: 2,
    pembahasan: "Getaran adalah gerak bolak-balik benda melalui titik setimbangnya, contohnya senar gitar yang dipetik. Ombak, cahaya, dan gema merupakan peristiwa yang merambat (gelombang), bukan getaran." },

  { q: "Perhatikan gambar lintasan ayunan bandul berikut. Titik A dan B adalah simpangan terjauh di kedua sisi, dan O adalah titik setimbang. Lintasan yang menunjukkan satu getaran penuh adalah...",
    fig: "bandulPath",
    opts: ["B–A–B–O–B", "A–B–A–O–A", "A–O–B–O–A", "O–A–B–A–O"], correct: 2,
    pembahasan: "Satu getaran penuh dimulai dan diakhiri pada titik yang sama setelah melewati kedua simpangan terjauh, yaitu lintasan A–O–B–O–A." },

  { q: "Ketika senar gitar dipetik lebih keras, amplitudo getarannya membesar tetapi frekuensinya tidak berubah. Pengaruh amplitudo dan frekuensi terhadap bunyi gitar yang tepat adalah...",
    opts: [
      "Amplitudo memengaruhi kekerasan (kenyaringan) bunyi, sedangkan frekuensi memengaruhi tinggi rendahnya nada",
      "Amplitudo memengaruhi tinggi rendahnya nada, sedangkan frekuensi memengaruhi kenyaringan bunyi",
      "Amplitudo dan frekuensi sama-sama menentukan tinggi rendahnya nada",
      "Amplitudo dan frekuensi tidak berpengaruh terhadap bunyi yang dihasilkan"], correct: 0,
    pembahasan: "Amplitudo memengaruhi kekerasan (kenyaringan) bunyi — makin besar amplitudo makin keras — sedangkan frekuensi memengaruhi tinggi rendahnya nada." },

  { q: "Seorang nelayan mengamati gabus pelampung yang naik-turun di tempat yang hampir sama saat ombak lewat, namun ombaknya sendiri bergerak menuju pantai. Perbedaan mendasar antara getaran dan gelombang adalah...",
    opts: [
      "Getaran memiliki frekuensi, sedangkan gelombang tidak",
      "Gelombang memindahkan energi, sedangkan getaran tidak",
      "Getaran hanya terjadi pada benda padat",
      "Gelombang tidak memiliki periode"], correct: 1,
    pembahasan: "Getaran hanya gerak bolak-balik di sekitar titik setimbang tanpa memindahkan materi, sedangkan gelombang memindahkan energi. Gabus tetap di tempatnya, tetapi energi ombak merambat menuju pantai." },

  { q: "Perhatikan gambar berikut. Berdasarkan bentuknya, gelombang ini termasuk jenis gelombang...",
    fig: "transversal",
    opts: ["Longitudinal", "Transversal", "Mekanik", "Elektromagnetik"], correct: 1,
    pembahasan: "Gambar menunjukkan bentuk gelombang berupa bukit dan lembah (sinusoidal), yang merupakan ciri khas gelombang transversal." },

  { q: "Berdasarkan gambar pada soal nomor 9, bagian gelombang yang berada paling tinggi disebut...",
    fig: "transversal",
    opts: ["Lembah gelombang", "Puncak gelombang", "Rapatan", "Renggangan"], correct: 1,
    pembahasan: "Bagian gelombang yang berada paling tinggi disebut puncak gelombang." },

  { q: "Berdasarkan gambar pada soal nomor 9, jarak antara dua puncak gelombang yang berurutan disebut...",
    fig: "transversal",
    opts: ["Satu panjang gelombang", "Satu periode", "Satu frekuensi", "Satu amplitudo"], correct: 0,
    pembahasan: "Jarak antara dua puncak (atau dua lembah) yang berurutan disebut satu panjang gelombang (λ)." },

  { q: "Jarak antara 4 puncak gelombang yang berurutan pada permukaan air adalah 9 meter. Panjang gelombang tersebut adalah...",
    opts: ["9 m", "4,5 m", "3 m", "2,25 m"], correct: 2,
    pembahasan: "Jarak antara 4 puncak berurutan = 3 panjang gelombang, sehingga panjang gelombang = 9 m ÷ 3 = 3 m." },

  { q: "Perhatikan gambar berikut. Gelombang pada gambar memiliki arah getar yang sejajar arah rambatnya, gelombang tersebut termasuk jenis gelombang...",
    fig: "longitudinal",
    opts: ["Longitudinal", "Transversal", "Mekanik", "Elektromagnetik"], correct: 0,
    pembahasan: "Gelombang dengan arah getar partikel medium sejajar (searah) dengan arah rambatnya disebut gelombang longitudinal." },

  { q: "Berdasarkan gambar pada soal nomor 13, daerah gelombang di mana partikel-partikel medium saling merapat disebut...",
    fig: "longitudinal",
    opts: ["Renggangan", "Lembah", "Puncak", "Rapatan"], correct: 3,
    pembahasan: "Daerah tempat partikel-partikel medium saling merapat (berdekatan) disebut Rapatan." },

  { q: "Berdasarkan gambar pada soal nomor 13, daerah gelombang di mana partikel-partikel medium saling meregang disebut...",
    fig: "longitudinal",
    opts: ["Rapatan", "Renggangan", "Amplitudo", "Puncak"], correct: 1,
    pembahasan: "Daerah gelombang longitudinal tempat partikel-partikel medium saling meregang (berjauhan) disebut renggangan." },

  { q: "Perhatikan beberapa contoh peristiwa berikut. Manakah yang merupakan contoh gelombang?",
    opts: [
      "Cahaya matahari yang sampai ke Bumi",
      "Getaran pada senar gitar yang diam ditekan",
      "Bandul jam yang diam di titik setimbang",
      "Pegas yang ditekan lalu ditahan"], correct: 0,
    pembahasan: "Cahaya matahari yang sampai ke Bumi merupakan gelombang (elektromagnetik) yang merambat dan memindahkan energi. Pilihan lain bukan peristiwa gelombang yang merambat." },

  { q: "Gelombang bunyi yang dihasilkan saat gendang dipukul termasuk gelombang longitudinal karena...",
    opts: [
      "Arah getar partikel medium sejajar (searah) dengan arah rambat gelombangnya",
      "Arah getar partikel medium tegak lurus dengan arah rambat gelombangnya",
      "Gelombang bunyi tidak memerlukan medium untuk merambat",
      "Gelombang bunyi termasuk gelombang elektromagnetik"], correct: 0,
    pembahasan: "Gelombang bunyi termasuk gelombang longitudinal karena arah getar partikel medium sejajar (searah) dengan arah rambat gelombangnya." },

  { q: "Sebuah bandul pegas berayun dari titik C ke B memerlukan waktu 0,25 sekon. Jika lintasan C ke B merupakan seperempat getaran penuh, maka periode getaran pegas tersebut adalah...",
    opts: ["0,25 sekon", "0,5 sekon", "1 sekon", "4 sekon"], correct: 2,
    pembahasan: "Lintasan C ke B adalah ¼ getaran penuh, sehingga periode = 4 × 0,25 sekon = 1 sekon." },

  { q: "Sebuah bandul bergetar dengan periode 0,5 sekon. Frekuensi getaran bandul tersebut adalah...",
    opts: ["0,25 Hz", "0,5 Hz", "2 Hz", "4 Hz"], correct: 2,
    pembahasan: "Frekuensi f = 1/T = 1/0,5 sekon = 2 Hz." },

  { q: "Getaran pada pegas menghasilkan gelombang dengan panjang gelombang 0,4 m dan periode 0,2 sekon. Cepat rambat gelombang pada pegas tersebut adalah...",
    opts: ["0,08 m/s", "0,5 m/s", "2 m/s", "8 m/s"], correct: 2,
    pembahasan: "Cepat rambat gelombang v = λ/T = 0,4 m ÷ 0,2 sekon = 2 m/s." },
];

// ---------- util DOM ----------
const el = (t, c) => { const n = document.createElement(t); if (c) n.className = c; return n; };
const LETTERS = ["A", "B", "C", "D"];
const app = document.getElementById('app');

const state = { name: "", kelas: "", answers: new Array(QUESTIONS.length).fill(null), idx: 0 };

// ---------- layar mulai ----------
function screenStart() {
  app.innerHTML = "";
  const wrap = el('div', 'k-wrap');
  wrap.innerHTML = `
    <div class="k-hero">
      <div class="k-badge">📝 Kuis</div>
      <h1>Kuis Getaran &amp; Gelombang</h1>
      <p>20 soal pilihan ganda. Setiap jawaban benar bernilai <b>5 poin</b> (nilai maksimal <b>100</b>). Isi identitasmu dulu, ya.</p>
    </div>
    <form class="k-card k-form" id="k-form" novalidate>
      <label class="k-field">
        <span>Nama lengkap</span>
        <input id="f-name" type="text" autocomplete="name" placeholder="mis. Ananda Putri" required>
        <em class="k-err" id="e-name"></em>
      </label>
      <label class="k-field">
        <span>Kelas</span>
        <input id="f-kelas" type="text" autocomplete="off" placeholder="mis. VIII-A" required>
        <em class="k-err" id="e-kelas"></em>
      </label>
      <button class="k-btn k-btn-primary" type="submit">Mulai Kuis →</button>
      <a class="k-back" href="/">← Kembali ke beranda</a>
    </form>`;
  app.appendChild(wrap);
  const form = document.getElementById('k-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nm = document.getElementById('f-name').value.trim();
    const kl = document.getElementById('f-kelas').value.trim();
    let ok = true;
    document.getElementById('e-name').textContent = nm ? "" : (ok = false, "Nama wajib diisi.");
    document.getElementById('e-kelas').textContent = kl ? "" : (ok = false, "Kelas wajib diisi.");
    if (!ok) return;
    state.name = nm; state.kelas = kl;
    state.answers.fill(null); state.idx = 0;
    screenQuiz();
  });
}

// ---------- layar soal (satu per satu) ----------
function screenQuiz() {
  app.innerHTML = "";
  const i = state.idx, Q = QUESTIONS[i];
  const total = QUESTIONS.length;
  const answered = state.answers.filter(a => a !== null).length;

  const wrap = el('div', 'k-wrap');
  const top = el('div', 'k-quiztop');
  top.innerHTML = `
    <div class="k-prog"><div class="k-prog-bar" style="width:${Math.round(answered / total * 100)}%"></div></div>
    <div class="k-progtext"><span>Soal <b>${i + 1}</b> / ${total}</span><span>${answered}/${total} terjawab</span></div>`;
  wrap.appendChild(top);

  const card = el('div', 'k-card k-qcard');
  const fig = Q.fig ? `<div class="k-fig">${FIG[Q.fig]}</div>` : "";
  card.innerHTML = `<div class="k-qnum">Soal ${i + 1}</div><div class="k-qtext">${Q.q}</div>${fig}`;

  const opts = el('div', 'k-opts');
  Q.opts.forEach((o, k) => {
    const b = el('button', 'k-opt'); b.type = 'button';
    if (state.answers[i] === k) b.classList.add('is-sel');
    b.innerHTML = `<span class="k-optl">${LETTERS[k]}</span><span class="k-optt">${o}</span>`;
    b.addEventListener('click', () => { state.answers[i] = k; screenQuiz(); });
    opts.appendChild(b);
  });
  card.appendChild(opts);
  wrap.appendChild(card);

  const nav = el('div', 'k-nav');
  const prev = el('button', 'k-btn k-btn-ghost'); prev.type = 'button'; prev.textContent = '← Sebelumnya';
  prev.disabled = i === 0;
  prev.addEventListener('click', () => { state.idx = Math.max(0, i - 1); screenQuiz(); });
  nav.appendChild(prev);

  if (i < total - 1) {
    const next = el('button', 'k-btn k-btn-primary'); next.type = 'button'; next.textContent = 'Berikutnya →';
    next.addEventListener('click', () => { state.idx = Math.min(total - 1, i + 1); screenQuiz(); });
    nav.appendChild(next);
  } else {
    const fin = el('button', 'k-btn k-btn-primary'); fin.type = 'button'; fin.textContent = 'Kumpulkan Jawaban ✓';
    fin.addEventListener('click', () => {
      const kosong = state.answers.findIndex(a => a === null);
      if (kosong !== -1) {
        if (!confirm(`Masih ada ${state.answers.filter(a => a === null).length} soal belum dijawab. Kumpulkan sekarang?`)) { state.idx = kosong; screenQuiz(); return; }
      }
      screenResult();
    });
    nav.appendChild(fin);
  }
  wrap.appendChild(nav);
  app.appendChild(wrap);
  window.scrollTo(0, 0);
}

// ---------- layar hasil ----------
function screenResult() {
  const total = QUESTIONS.length;
  let benar = 0;
  QUESTIONS.forEach((Q, i) => { if (state.answers[i] === Q.correct) benar++; });
  const nilai = benar * POINTS_PER;
  const salah = total - benar;
  const grade = nilai >= 85 ? { t: "Sangat Baik", c: "#1f9c4d" } : nilai >= 70 ? { t: "Baik", c: "#1f6fd0" }
    : nilai >= 55 ? { t: "Cukup", c: "#c78a00" } : { t: "Perlu Belajar Lagi", c: "#e23c3c" };

  app.innerHTML = "";
  const wrap = el('div', 'k-wrap');

  const head = el('div', 'k-card k-result');
  head.innerHTML = `
    <div class="k-rident">${escapeHtml(state.name)} · <span>${escapeHtml(state.kelas)}</span></div>
    <div class="k-score">
      <div class="k-ring" style="--v:${nilai};--gc:${grade.c}"><div class="k-ring-in"><b>${nilai}</b><small>/100</small></div></div>
      <div class="k-scoremeta">
        <div class="k-grade" style="color:${grade.c}">${grade.t}</div>
        <div class="k-benar">Benar <b>${benar}</b> dari ${total} · Salah <b>${salah}</b></div>
        <div class="k-rule">Tiap soal benar = ${POINTS_PER} poin</div>
      </div>
    </div>
    <div class="k-ractions">
      <button class="k-btn k-btn-primary" id="k-again" type="button">Ulangi Kuis</button>
      <a class="k-btn k-btn-ghost" href="/">Beranda</a>
    </div>`;
  wrap.appendChild(head);

  const rev = el('div', 'k-review');
  rev.innerHTML = `<h2 class="k-revh">Pembahasan</h2><p class="k-revsub">Jawaban salah ditandai merah beserta kunci &amp; penjelasannya.</p>`;
  QUESTIONS.forEach((Q, i) => {
    const ua = state.answers[i];
    const ok = ua === Q.correct;
    const item = el('div', 'k-ritem ' + (ok ? 'is-ok' : 'is-no'));
    const fig = Q.fig ? `<div class="k-fig k-fig-sm">${FIG[Q.fig]}</div>` : "";
    let html = `<div class="k-rq"><span class="k-rmark">${ok ? '✓' : '✕'}</span><span><b>Soal ${i + 1}.</b> ${Q.q}</span></div>${fig}<ul class="k-ropts">`;
    Q.opts.forEach((o, k) => {
      let cls = "";
      if (k === Q.correct) cls = "k-correct";
      else if (k === ua) cls = "k-wrong";
      const tag = k === Q.correct ? ' <em>(kunci)</em>' : (k === ua && !ok ? ' <em>(jawabanmu)</em>' : '');
      html += `<li class="${cls}"><span class="k-optl">${LETTERS[k]}</span> ${o}${tag}</li>`;
    });
    html += `</ul>`;
    if (ua === null) html += `<div class="k-note k-note-empty">Tidak dijawab.</div>`;
    html += `<div class="k-note"><b>Pembahasan:</b> ${Q.pembahasan}</div>`;
    item.innerHTML = html;
    rev.appendChild(item);
  });
  wrap.appendChild(rev);
  app.appendChild(wrap);
  window.scrollTo(0, 0);
  document.getElementById('k-again').addEventListener('click', screenStart);
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// ---------- mulai ----------
screenStart();
