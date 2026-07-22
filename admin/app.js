// Dasbor Admin Hasil Kuis — admin.chensqy.my.id
// Login Supabase (email+password) -> baca tabel hasil_kuis (RLS: hanya admin yang login bisa membaca).
// Tanpa library eksternal: fetch murni ke REST Supabase. Mode uji tampilan: tambahkan ?mock=1 di URL.
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from './config.js?v=1';

const $ = (s, r = document) => r.querySelector(s);
const el = (t, c) => { const n = document.createElement(t); if (c) n.className = c; return n; };
const escapeHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');
const LETTERS = ["A", "B", "C", "D"];
const SESSKEY = 'chensqy-admin-sess';
const THEMEKEY = 'chensqy-theme';
const MOCK = new URLSearchParams(location.search).get('mock') === '1';

// ---------- ikon (Lucide-style, inline SVG) ----------
const I = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  avg: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  down: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  chart: '<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="12" y="6" width="3" height="11"/><rect x="17" y="13" width="3" height="4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5 5h14l3 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
};
const svg = (name, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24">${I[name]}</svg>`;

// ---------- data soal (kunci + opsi + pembahasan) untuk detail & analisis ----------
const QUESTIONS = [
  { q: "Gerak bolak-balik jembatan gantung melalui titik setimbang disebut...", opts: ["Getaran","Gelombang","Frekuensi","Amplitudo"], correct: 0, pembahasan: "Getaran = gerak bolak-balik melalui titik kesetimbangan." },
  { q: "Jarak terjauh ayunan dari posisi diamnya disebut...", opts: ["Periode","Amplitudo","Panjang gelombang","Cepat rambat"], correct: 1, pembahasan: "Amplitudo = simpangan terjauh dari posisi setimbang." },
  { q: "Banyaknya getaran tiap detik disebut...", opts: ["Frekuensi","Periode","Amplitudo","Getaran"], correct: 0, pembahasan: "Frekuensi = jumlah getaran per detik." },
  { q: "Frekuensi 5 Hz, maka periodenya...", opts: ["0,2 sekon","5 sekon","1 sekon","10 sekon"], correct: 0, pembahasan: "T = 1/f = 1/5 = 0,2 sekon." },
  { q: "Manakah contoh getaran?", opts: ["Ombak di lautan","Cahaya lampu","Senar gitar dipetik","Bunyi gema"], correct: 2, pembahasan: "Senar gitar dipetik = getaran; yang lain merambat (gelombang)." },
  { q: "Lintasan satu getaran penuh bandul (A,O,B)...", opts: ["B–A–B–O–B","A–B–A–O–A","A–O–B–O–A","O–A–B–A–O"], correct: 2, pembahasan: "Satu getaran penuh: A–O–B–O–A." },
  { q: "Pengaruh amplitudo & frekuensi pada bunyi gitar...", opts: ["Amplitudo=kenyaringan, frekuensi=tinggi nada","Amplitudo=tinggi nada, frekuensi=kenyaringan","Keduanya=tinggi nada","Tidak berpengaruh"], correct: 0, pembahasan: "Amplitudo → kenyaringan; frekuensi → tinggi rendah nada." },
  { q: "Perbedaan mendasar getaran vs gelombang...", opts: ["Getaran punya frekuensi, gelombang tidak","Gelombang memindahkan energi, getaran tidak","Getaran hanya di benda padat","Gelombang tak punya periode"], correct: 1, pembahasan: "Gelombang memindahkan energi tanpa memindahkan materi." },
  { q: "Gelombang bukit-lembah (sinusoidal) termasuk...", opts: ["Longitudinal","Transversal","Mekanik","Elektromagnetik"], correct: 1, pembahasan: "Bukit & lembah = ciri gelombang transversal." },
  { q: "Bagian gelombang paling tinggi disebut...", opts: ["Lembah","Puncak","Rapatan","Renggangan"], correct: 1, pembahasan: "Bagian tertinggi = puncak gelombang." },
  { q: "Jarak dua puncak berurutan disebut...", opts: ["Satu panjang gelombang","Satu periode","Satu frekuensi","Satu amplitudo"], correct: 0, pembahasan: "Dua puncak berurutan = satu panjang gelombang (λ)." },
  { q: "Jarak 4 puncak berurutan 9 m, panjang gelombang...", opts: ["9 m","4,5 m","3 m","2,25 m"], correct: 2, pembahasan: "4 puncak = 3λ → λ = 9/3 = 3 m." },
  { q: "Arah getar sejajar arah rambat, termasuk gelombang...", opts: ["Longitudinal","Transversal","Mekanik","Elektromagnetik"], correct: 0, pembahasan: "Sejajar arah rambat = longitudinal." },
  { q: "Daerah partikel saling merapat disebut...", opts: ["Renggangan","Lembah","Puncak","Rapatan"], correct: 3, pembahasan: "Partikel merapat = Rapatan." },
  { q: "Daerah partikel saling meregang disebut...", opts: ["Rapatan","Renggangan","Amplitudo","Puncak"], correct: 1, pembahasan: "Partikel meregang = Renggangan." },
  { q: "Manakah contoh gelombang?", opts: ["Cahaya matahari ke Bumi","Senar gitar diam ditekan","Bandul jam diam","Pegas ditekan lalu ditahan"], correct: 0, pembahasan: "Cahaya matahari = gelombang elektromagnetik yang merambat." },
  { q: "Bunyi gendang termasuk longitudinal karena...", opts: ["Arah getar sejajar arah rambat","Arah getar tegak lurus arah rambat","Tak butuh medium","Termasuk elektromagnetik"], correct: 0, pembahasan: "Bunyi = longitudinal (getar sejajar rambat)." },
  { q: "C ke B = ¼ getaran = 0,25 s, periodenya...", opts: ["0,25 sekon","0,5 sekon","1 sekon","4 sekon"], correct: 2, pembahasan: "T = 4 × 0,25 = 1 sekon." },
  { q: "Periode 0,5 s, frekuensinya...", opts: ["0,25 Hz","0,5 Hz","2 Hz","4 Hz"], correct: 2, pembahasan: "f = 1/T = 1/0,5 = 2 Hz." },
  { q: "λ=0,4 m, T=0,2 s, cepat rambatnya...", opts: ["0,08 m/s","0,5 m/s","2 m/s","8 m/s"], correct: 2, pembahasan: "v = λ/T = 0,4/0,2 = 2 m/s." },
];

// ---------- tema ----------
(function initTheme(){ let t='terang'; try{t=localStorage.getItem(THEMEKEY)||'terang'}catch(e){} document.documentElement.setAttribute('data-theme',t); })();
function toggleTheme(){ const cur=document.documentElement.getAttribute('data-theme')==='gelap'?'terang':'gelap'; document.documentElement.setAttribute('data-theme',cur); try{localStorage.setItem(THEMEKEY,cur)}catch(e){} const b=$('#themebtn'); if(b) b.innerHTML=svg(cur==='gelap'?'sun':'moon'); }

let toastT;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'),2400); }

// ---------- sesi / auth ----------
function getSession(){ try{ return JSON.parse(localStorage.getItem(SESSKEY)||'null'); }catch(e){ return null; } }
function setSession(s){ try{ localStorage.setItem(SESSKEY, JSON.stringify(s)); }catch(e){} }
function clearSession(){ try{ localStorage.removeItem(SESSKEY); }catch(e){} }

async function login(email, password){
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method:'POST', headers:{ 'apikey':SUPABASE_ANON_KEY, 'Content-Type':'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error_description || data.msg || data.message || 'Email atau kata sandi salah.');
  setSession({ access_token:data.access_token, refresh_token:data.refresh_token, expires_at:data.expires_at, email });
  return true;
}
async function refresh(){
  const s=getSession(); if(!s||!s.refresh_token) return false;
  const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{ method:'POST', headers:{ 'apikey':SUPABASE_ANON_KEY,'Content-Type':'application/json'}, body:JSON.stringify({refresh_token:s.refresh_token})});
  if(!r.ok) return false;
  const d=await r.json(); setSession({ access_token:d.access_token, refresh_token:d.refresh_token, expires_at:d.expires_at, email:s.email }); return true;
}
async function authedFetch(path){
  let s=getSession(); if(!s) throw new Error('no-session');
  if(s.expires_at && (s.expires_at*1000 - Date.now() < 60000)){ await refresh(); s=getSession(); }
  let r=await fetch(`${SUPABASE_URL}${path}`,{ headers:{ 'apikey':SUPABASE_ANON_KEY, 'Authorization':`Bearer ${s.access_token}` }});
  if(r.status===401){ if(await refresh()){ s=getSession(); r=await fetch(`${SUPABASE_URL}${path}`,{ headers:{ 'apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${s.access_token}`}}); } }
  return r;
}
function logout(){ clearSession(); renderLogin(); toast('Berhasil keluar'); }

// ---------- data ----------
function mockRows(){
  const nama=['Ananda Putri','Bima Saputra','Cindy Lestari','Dimas Pratama','Eka Wulandari','Fajar Nugroho','Gita Rahmawati','Hadi Kusuma','Intan Permata','Joko Susilo','Kirana Dewi','Lukman Hakim','Mega Ayu','Naufal Rizky','Oktavia Sari','Putra Wijaya'];
  const kelas=['VIII-A','VIII-B','VIII-C']; const sekolah='MTs Al-Mustaqim';
  return nama.map((n,i)=>{
    const jawaban = QUESTIONS.map((Q,qi)=> (((i*7+qi*3)%10) < (i%16===0?10: (7 - (i%5)))) ? Q.correct : (Q.correct+1)%4 );
    const benar = jawaban.filter((a,qi)=>a===QUESTIONS[qi].correct).length;
    return { id:i+1, created_at:new Date(2026,6,20+((i)%3),8,i*3%60,0).toISOString(), nama:n, kelas:kelas[i%3], sekolah, jawaban, benar, salah:20-benar, nilai:benar*5, jumlah_soal:20, durasi_detik:180+i*17%400 };
  });
}
async function loadRows(){
  if(MOCK) return mockRows();
  const r=await authedFetch('/rest/v1/hasil_kuis?select=*&order=created_at.desc');
  if(!r.ok){ if(r.status===401){ logout(); throw new Error('Sesi berakhir, silakan login lagi.'); } throw new Error('Gagal memuat data ('+r.status+').'); }
  return await r.json();
}

// ---------- render: LOGIN ----------
function renderLogin(){
  app.innerHTML = `
  <div class="login-shell">
    <form class="login" id="loginform" novalidate>
      <div class="lg"><img src="/assets/logo.png" alt=""> chensqy <span style="color:var(--sub);font-weight:600">· admin</span></div>
      <h1>Masuk Dasbor</h1>
      <p class="s">Panel hasil kuis getaran &amp; gelombang</p>
      <label class="field"><span>Email</span><input id="email" type="email" autocomplete="username" placeholder="email@contoh.com" required></label>
      <label class="field"><span>Kata sandi</span><input id="pass" type="password" autocomplete="current-password" placeholder="••••••••" required></label>
      <button class="btn-primary" id="loginbtn" type="submit">Masuk</button>
      <div class="formerr" id="loginerr"></div>
      ${!isConfigured() ? '<div class="hintbox">⚠ Belum terhubung ke database Supabase. Lengkapi <b>config.js</b> dulu.</div>' : ''}
    </form>
  </div>`;
  $('#loginform').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email=$('#email').value.trim(), pass=$('#pass').value;
    const errEl=$('#loginerr'); errEl.textContent='';
    if(!email||!pass){ errEl.textContent='Isi email dan kata sandi.'; return; }
    if(!isConfigured()){ errEl.textContent='Database belum dikonfigurasi.'; return; }
    const btn=$('#loginbtn'); btn.disabled=true; btn.innerHTML='<span class="spin"></span>';
    try{ await login(email,pass); renderDashboard(); }
    catch(err){ errEl.textContent=err.message; btn.disabled=false; btn.textContent='Masuk'; }
  });
}

// ---------- render: DASHBOARD ----------
let ROWS=[], VIEW=[], SORT={key:'created_at',dir:-1}, FILTER={q:'',kelas:'',sekolah:''};

async function renderDashboard(){
  app.innerHTML = `
  <header class="top">
    <div class="brand"><img src="/assets/logo.png" alt=""><div>chensqy<small>Dasbor Admin</small></div></div>
    <div class="sp"></div>
    <button class="iconbtn" id="refreshbtn" title="Muat ulang">${svg('refresh')}</button>
    <button class="iconbtn" id="themebtn" title="Mode terang/gelap">${svg(document.documentElement.getAttribute('data-theme')==='gelap'?'sun':'moon')}</button>
    ${MOCK?'':'<button class="pillbtn danger" id="logoutbtn">'+svg('logout')+'Keluar</button>'}
  </header>
  <div class="wrap">
    <div class="pagehead reveal">
      <div><h1>Hasil Kuis Siswa</h1><p>Getaran &amp; Gelombang${MOCK?' · <b style="color:var(--accent)">MODE CONTOH</b>':''}</p></div>
      <button class="pillbtn" id="csvbtn">${svg('down')}Ekspor CSV</button>
    </div>
    <div id="dash"><div class="center-load"><span class="spin"></span>Memuat data…</div></div>
  </div>`;
  $('#themebtn').addEventListener('click', toggleTheme);
  $('#refreshbtn').addEventListener('click', ()=>renderDashboard());
  const lo=$('#logoutbtn'); if(lo) lo.addEventListener('click', logout);
  $('#csvbtn').addEventListener('click', exportCSV);

  try{ ROWS = await loadRows(); }
  catch(err){ $('#dash').innerHTML = `<div class="card"><div class="empty">${svg('inbox')}<div>${escapeHtml(err.message)}</div></div></div>`; return; }
  paintDash();
}

function computeStats(rows){
  const n=rows.length;
  const nilaiArr=rows.map(r=>r.nilai);
  const avg=n? Math.round(nilaiArr.reduce((a,b)=>a+b,0)/n):0;
  const max=n?Math.max(...nilaiArr):0, min=n?Math.min(...nilaiArr):0;
  const uniq=new Set(rows.map(r=>`${(r.nama||'').toLowerCase()}|${(r.kelas||'').toLowerCase()}|${(r.sekolah||'').toLowerCase()}`)).size;
  // sebaran nilai (5 rentang)
  const buckets=[{l:'0–20',a:0,b:20},{l:'21–40',a:21,b:40},{l:'41–60',a:41,b:60},{l:'61–80',a:61,b:80},{l:'81–100',a:81,b:100}];
  buckets.forEach(bk=>bk.c=rows.filter(r=>r.nilai>=bk.a&&r.nilai<=bk.b).length);
  // kesulitan per soal (% benar)
  const perQ=QUESTIONS.map((Q,qi)=>{ let ok=0,tot=0; rows.forEach(r=>{ const a=Array.isArray(r.jawaban)?r.jawaban[qi]:null; if(a!=null){tot++; if(a===Q.correct)ok++;} }); return {qi, pct: tot? Math.round(ok/tot*100):0, tot}; });
  return {n,avg,max,min,uniq,buckets,perQ};
}

function paintDash(){
  applyFilterSort();
  const S=computeStats(ROWS);
  const kelasOpts=[...new Set(ROWS.map(r=>r.kelas).filter(Boolean))].sort();
  const sekolahOpts=[...new Set(ROWS.map(r=>r.sekolah).filter(Boolean))].sort();
  const maxBucket=Math.max(1,...S.buckets.map(b=>b.c));
  const hardest=[...S.perQ].filter(q=>q.tot>0).sort((a,b)=>a.pct-b.pct).slice(0,6);
  const pctColor=p=> p>=75?'var(--ok)': p>=50?'var(--warn)':'var(--danger)';

  const dash=$('#dash');
  dash.innerHTML = `
    <div class="stats">
      ${statCard('users','var(--c1)','Total kiriman', S.n, 'jawaban masuk')}
      ${statCard('file','var(--c4)','Siswa unik', S.uniq, 'nama berbeda')}
      ${statCard('avg','var(--c3)','Rata-rata nilai', S.avg, 'dari 100', true)}
      ${statCard('trophy','var(--c2)','Tertinggi / Terendah', S.max, 'terendah '+S.min, false, '/'+' '+S.min)}
    </div>

    <div class="grid2">
      <div class="card reveal">
        <h2>${svg('chart','ic')} Sebaran Nilai</h2>
        <div class="cardsub">Jumlah siswa pada tiap rentang nilai</div>
        <div class="chart" id="chart">
          ${S.buckets.map(b=>`<div class="bar"><div class="n tnum">${b.c}</div><div class="col" data-h="${Math.round(b.c/maxBucket*100)}" style="height:0"></div><div class="lbl">${b.l}</div></div>`).join('')}
        </div>
      </div>
      <div class="card reveal">
        <h2>${svg('target','ic')} Soal Tersulit</h2>
        <div class="cardsub">Persentase siswa yang menjawab benar</div>
        <div class="qlist">
          ${hardest.length? hardest.map(q=>`<div class="qrow"><div class="qn">${q.qi+1}</div><div class="qmeter"><i data-w="${q.pct}" style="width:0;background:${pctColor(q.pct)}"></i></div><div class="qpct tnum">${q.pct}%</div></div>`).join('') : '<div class="muted" style="font-size:13px">Belum ada data.</div>'}
        </div>
      </div>
    </div>

    <div class="card reveal" style="margin-top:16px">
      <h2>${svg('users','ic')} Daftar Siswa <span class="muted tnum" style="font-weight:600;font-size:13px">(${VIEW.length})</span></h2>
      <div class="toolbar" style="margin-top:14px">
        <div class="search">${svg('search')}<input id="q" type="search" placeholder="Cari nama / kelas / sekolah…" value="${escapeHtml(FILTER.q)}"></div>
        <select class="sel" id="fkelas"><option value="">Semua kelas</option>${kelasOpts.map(k=>`<option ${FILTER.kelas===k?'selected':''}>${escapeHtml(k)}</option>`).join('')}</select>
        <select class="sel" id="fsekolah"><option value="">Semua sekolah</option>${sekolahOpts.map(k=>`<option ${FILTER.sekolah===k?'selected':''}>${escapeHtml(k)}</option>`).join('')}</select>
      </div>
      <div class="tablewrap">
        <table>
          <thead><tr>
            ${th('nama','Nama')}${th('kelas','Kelas')}${th('sekolah','Sekolah')}${th('nilai','Nilai')}${th('benar','Benar')}${th('created_at','Waktu')}
          </tr></thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
      ${VIEW.length?'':`<div class="empty">${svg('inbox')}<div>Belum ada data yang cocok.</div></div>`}
    </div>`;

  paintRows();
  // motion: animasikan bar & meter setelah render
  requestAnimationFrame(()=>{ requestAnimationFrame(()=>{
    dash.querySelectorAll('.col').forEach(c=>c.style.height=c.dataset.h+'%');
    dash.querySelectorAll('.qmeter i').forEach(m=>m.style.width=m.dataset.w+'%');
    dash.querySelectorAll('[data-count]').forEach(countUp);
  });});

  $('#q').addEventListener('input', debounce(e=>{ FILTER.q=e.target.value; applyFilterSort(); paintRows(); updateCount(); },180));
  $('#fkelas').addEventListener('change', e=>{ FILTER.kelas=e.target.value; applyFilterSort(); paintRows(); updateCount(); });
  $('#fsekolah').addEventListener('change', e=>{ FILTER.sekolah=e.target.value; applyFilterSort(); paintRows(); updateCount(); });
  dash.querySelectorAll('th[data-key]').forEach(h=>h.addEventListener('click',()=>{ const k=h.dataset.key; if(SORT.key===k)SORT.dir*=-1; else{SORT.key=k;SORT.dir=1;} applyFilterSort(); paintDash(); }));
}

function statCard(icon,color,label,value,foot,pct,extra){
  return `<div class="stat reveal">
    <div class="lab"><span class="chip" style="background:${color}">${svg(icon,'ic')}</span>${label}</div>
    <div class="val tnum"><span data-count="${value}">0</span>${extra?`<small>${extra}</small>`:''}${pct?'<small> /100</small>':''}</div>
    <div class="foot">${foot}</div>
  </div>`;
}
function th(key,label){ const active=SORT.key===key; const ar=active?(SORT.dir>0?'▲':'▼'):'↕'; return `<th data-key="${key}" class="${active?'active':''}">${label} <span class="sar">${ar}</span></th>`; }

function applyFilterSort(){
  const q=FILTER.q.trim().toLowerCase();
  VIEW=ROWS.filter(r=>{
    if(FILTER.kelas && r.kelas!==FILTER.kelas) return false;
    if(FILTER.sekolah && r.sekolah!==FILTER.sekolah) return false;
    if(q){ const hay=`${r.nama} ${r.kelas} ${r.sekolah}`.toLowerCase(); if(!hay.includes(q)) return false; }
    return true;
  });
  const {key,dir}=SORT;
  VIEW.sort((a,b)=>{ let x=a[key],y=b[key]; if(key==='created_at'){x=+new Date(x);y=+new Date(y);} if(typeof x==='string'){x=x.toLowerCase();y=(y||'').toLowerCase();} return x<y?-dir:x>y?dir:0; });
}
function updateCount(){ const c=$('#dash h2 .muted'); if(c) c.textContent=`(${VIEW.length})`; }

function scoreStyle(n){ const c=n>=85?'var(--ok)':n>=70?'var(--brand2)':n>=55?'var(--warn)':'var(--danger)'; return `background:color-mix(in srgb,${c} 15%,transparent);color:${c}`; }
function fmtDate(s){ try{ const d=new Date(s); return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}); }catch(e){ return s; } }

function paintRows(){
  const tb=$('#tbody'); if(!tb) return;
  tb.innerHTML = VIEW.map((r,i)=>`
    <tr data-i="${i}">
      <td class="nm">${escapeHtml(r.nama)}</td>
      <td><span class="badge" style="background:var(--track)">${escapeHtml(r.kelas)}</span></td>
      <td class="muted">${escapeHtml(r.sekolah)}</td>
      <td><span class="score tnum" style="${scoreStyle(r.nilai)}">${r.nilai}</span></td>
      <td class="tnum">${r.benar}/${r.jumlah_soal||20}</td>
      <td class="muted tnum">${fmtDate(r.created_at)}</td>
    </tr>`).join('');
  tb.querySelectorAll('tr').forEach(tr=>tr.addEventListener('click',()=>openDetail(VIEW[+tr.dataset.i])));
}

// ---------- detail modal ----------
function openDetail(r){
  const jawaban=Array.isArray(r.jawaban)?r.jawaban:[];
  const grade=r.nilai>=85?'Sangat Baik':r.nilai>=70?'Baik':r.nilai>=55?'Cukup':'Perlu Belajar Lagi';
  const items=QUESTIONS.map((Q,i)=>{
    const ua=jawaban[i]; const ok=ua===Q.correct;
    const opts=Q.opts.map((o,k)=>{ const cls=k===Q.correct?'c':(k===ua?'w':''); const tag=k===Q.correct?' <em>(kunci)</em>':(k===ua&&!ok?' <em>(jawaban)</em>':''); return `<li class="${cls}"><b>${LETTERS[k]}</b> ${escapeHtml(o)}${tag}</li>`; }).join('');
    return `<div class="mitem ${ok?'ok':'no'}">
      <div class="mq"><span class="mmark">${ok?'✓':'✕'}</span><span><b>${i+1}.</b> ${escapeHtml(Q.q)}</span></div>
      <ul class="mopts">${opts}</ul>
      ${ok?'':`<div class="mnote"><b>Pembahasan:</b> ${escapeHtml(Q.pembahasan)}</div>`}
    </div>`;
  }).join('');
  const ov=el('div','overlay');
  ov.innerHTML=`<div class="modal" role="dialog" aria-modal="true">
    <div class="modal-h">
      <div><div class="who">${escapeHtml(r.nama)}</div><div class="meta">${escapeHtml(r.kelas)} · ${escapeHtml(r.sekolah)} · ${fmtDate(r.created_at)}${r.durasi_detik?` · ${Math.floor(r.durasi_detik/60)}m ${r.durasi_detik%60}s`:''}</div>
        <div class="modal-scoreline"><span class="score tnum" style="${scoreStyle(r.nilai)};min-width:56px;font-size:18px">${r.nilai}</span><span class="muted">${grade} · benar ${r.benar}/${r.jumlah_soal||20}</span></div>
      </div>
      <button class="iconbtn" id="mclose">${svg('x')}</button>
    </div>
    <div class="modal-body">${items}</div>
  </div>`;
  document.body.appendChild(ov);
  const close=()=>ov.remove();
  ov.addEventListener('click',e=>{ if(e.target===ov) close(); });
  $('#mclose',ov).addEventListener('click',close);
  document.addEventListener('keydown',function esc(e){ if(e.key==='Escape'){ close(); document.removeEventListener('keydown',esc);} });
}

// ---------- CSV ----------
function exportCSV(){
  const rows=VIEW.length?VIEW:ROWS;
  if(!rows.length){ toast('Belum ada data'); return; }
  const head=['Nama','Kelas','Sekolah','Nilai','Benar','Salah','Waktu','Durasi (detik)'];
  const esc=v=>`"${String(v==null?'':v).replace(/"/g,'""')}"`;
  const lines=[head.join(',')].concat(rows.map(r=>[r.nama,r.kelas,r.sekolah,r.nilai,r.benar,r.salah,fmtDate(r.created_at),r.durasi_detik].map(esc).join(',')));
  const blob=new Blob(['﻿'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
  const a=el('a'); a.href=URL.createObjectURL(blob); a.download=`hasil-kuis-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  toast(`${rows.length} baris diekspor`);
}

// ---------- util motion ----------
function countUp(node){
  const target=parseInt(node.dataset.count)||0; if(target===0){ node.textContent='0'; return; }
  const dur=700, t0=performance.now();
  const step=(t)=>{ const k=Math.min(1,(t-t0)/dur); const e=1-Math.pow(1-k,3); node.textContent=Math.round(target*e); if(k<1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }

// ---------- boot ----------
if(MOCK) renderDashboard();
else if(getSession()) renderDashboard();
else renderLogin();
