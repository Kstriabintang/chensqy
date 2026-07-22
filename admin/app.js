// Dasbor Admin Hasil Kuis — admin chensqy
// Login Supabase (email+password) -> baca hasil_kuis (RLS: hanya admin login).
// Background atom hidup + auto-refresh + notifikasi submit baru. Tanpa library eksternal.
// Mode uji tampilan: tambahkan ?mock=1 di URL.
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from './config.js?v=2';

const $ = (s, r = document) => r.querySelector(s);
const el = (t, c) => { const n = document.createElement(t); if (c) n.className = c; return n; };
const escapeHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');
const LETTERS = ["A", "B", "C", "D"];
const SESSKEY = 'chensqy-admin-sess', THEMEKEY = 'chensqy-theme', NOTIFKEY = 'chensqy-admin-notif';
const MOCK = new URLSearchParams(location.search).get('mock') === '1';
const POLL_MS = 12000, KKM = 70;

// ---------- ikon ----------
const I = {
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  avg:'<path d="M3 3v18h18"/><path d="M7 14l3-3 3 2 5-6"/>',
  trophy:'<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  grad:'<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/>',
  down:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  chart:'<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="12" y="6" width="3" height="11"/><rect x="17" y="13" width="3" height="4"/>',
  layers:'<path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
  refresh:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  belloff:'<path d="M8.7 3A6 6 0 0 1 18 8c0 2.5.4 4.3 1 5.6M17 17H3s3-2 3-9M13.7 21a2 2 0 0 1-3.4 0M2 2l20 20"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5 5h14l3 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
};
const svg = (name, cls='ic') => `<svg class="${cls}" viewBox="0 0 24 24">${I[name]}</svg>`;

// ---------- soal (kunci + pembahasan) ----------
const QUESTIONS = [
  { q:"Gerak bolak-balik jembatan gantung melalui titik setimbang disebut...", opts:["Getaran","Gelombang","Frekuensi","Amplitudo"], correct:0, pembahasan:"Getaran = gerak bolak-balik melalui titik kesetimbangan." },
  { q:"Jarak terjauh ayunan dari posisi diamnya disebut...", opts:["Periode","Amplitudo","Panjang gelombang","Cepat rambat"], correct:1, pembahasan:"Amplitudo = simpangan terjauh dari posisi setimbang." },
  { q:"Banyaknya getaran tiap detik disebut...", opts:["Frekuensi","Periode","Amplitudo","Getaran"], correct:0, pembahasan:"Frekuensi = jumlah getaran per detik." },
  { q:"Frekuensi 5 Hz, maka periodenya...", opts:["0,2 sekon","5 sekon","1 sekon","10 sekon"], correct:0, pembahasan:"T = 1/f = 1/5 = 0,2 sekon." },
  { q:"Manakah contoh getaran?", opts:["Ombak di lautan","Cahaya lampu","Senar gitar dipetik","Bunyi gema"], correct:2, pembahasan:"Senar gitar dipetik = getaran; yang lain merambat." },
  { q:"Lintasan satu getaran penuh bandul (A,O,B)...", opts:["B–A–B–O–B","A–B–A–O–A","A–O–B–O–A","O–A–B–A–O"], correct:2, pembahasan:"Satu getaran penuh: A–O–B–O–A." },
  { q:"Pengaruh amplitudo & frekuensi pada bunyi gitar...", opts:["Amplitudo=kenyaringan, frekuensi=tinggi nada","Amplitudo=tinggi nada, frekuensi=kenyaringan","Keduanya=tinggi nada","Tidak berpengaruh"], correct:0, pembahasan:"Amplitudo → kenyaringan; frekuensi → tinggi nada." },
  { q:"Perbedaan mendasar getaran vs gelombang...", opts:["Getaran punya frekuensi, gelombang tidak","Gelombang memindahkan energi, getaran tidak","Getaran hanya di benda padat","Gelombang tak punya periode"], correct:1, pembahasan:"Gelombang memindahkan energi tanpa memindahkan materi." },
  { q:"Gelombang bukit-lembah (sinusoidal) termasuk...", opts:["Longitudinal","Transversal","Mekanik","Elektromagnetik"], correct:1, pembahasan:"Bukit & lembah = ciri gelombang transversal." },
  { q:"Bagian gelombang paling tinggi disebut...", opts:["Lembah","Puncak","Rapatan","Renggangan"], correct:1, pembahasan:"Bagian tertinggi = puncak." },
  { q:"Jarak dua puncak berurutan disebut...", opts:["Satu panjang gelombang","Satu periode","Satu frekuensi","Satu amplitudo"], correct:0, pembahasan:"Dua puncak berurutan = satu panjang gelombang." },
  { q:"Jarak 4 puncak berurutan 9 m, panjang gelombang...", opts:["9 m","4,5 m","3 m","2,25 m"], correct:2, pembahasan:"4 puncak = 3λ → λ = 3 m." },
  { q:"Arah getar sejajar arah rambat, gelombang...", opts:["Longitudinal","Transversal","Mekanik","Elektromagnetik"], correct:0, pembahasan:"Sejajar arah rambat = longitudinal." },
  { q:"Daerah partikel saling merapat disebut...", opts:["Renggangan","Lembah","Puncak","Rapatan"], correct:3, pembahasan:"Partikel merapat = Rapatan." },
  { q:"Daerah partikel saling meregang disebut...", opts:["Rapatan","Renggangan","Amplitudo","Puncak"], correct:1, pembahasan:"Partikel meregang = Renggangan." },
  { q:"Manakah contoh gelombang?", opts:["Cahaya matahari ke Bumi","Senar gitar diam ditekan","Bandul jam diam","Pegas ditekan lalu ditahan"], correct:0, pembahasan:"Cahaya matahari = gelombang elektromagnetik." },
  { q:"Bunyi gendang termasuk longitudinal karena...", opts:["Arah getar sejajar arah rambat","Arah getar tegak lurus arah rambat","Tak butuh medium","Termasuk elektromagnetik"], correct:0, pembahasan:"Bunyi = longitudinal." },
  { q:"C ke B = ¼ getaran = 0,25 s, periodenya...", opts:["0,25 sekon","0,5 sekon","1 sekon","4 sekon"], correct:2, pembahasan:"T = 4 × 0,25 = 1 s." },
  { q:"Periode 0,5 s, frekuensinya...", opts:["0,25 Hz","0,5 Hz","2 Hz","4 Hz"], correct:2, pembahasan:"f = 1/T = 2 Hz." },
  { q:"λ=0,4 m, T=0,2 s, cepat rambatnya...", opts:["0,08 m/s","0,5 m/s","2 m/s","8 m/s"], correct:2, pembahasan:"v = λ/T = 2 m/s." },
];

// ---------- tema ----------
(function(){ let t='terang'; try{t=localStorage.getItem(THEMEKEY)||'terang'}catch(e){} document.documentElement.setAttribute('data-theme',t); })();
function toggleTheme(){ const cur=document.documentElement.getAttribute('data-theme')==='gelap'?'terang':'gelap'; document.documentElement.setAttribute('data-theme',cur); try{localStorage.setItem(THEMEKEY,cur)}catch(e){} const b=$('#themebtn'); if(b) b.innerHTML=svg(cur==='gelap'?'sun':'moon'); }

// ================= BACKGROUND ATOM =================
function startAtomBg(){
  const canvas=$('#bg'); if(!canvas) return; const ctx=canvas.getContext('2d');
  let W,H,DPR,atoms=[],parts=[],running=true; const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const palette=()=>document.documentElement.getAttribute('data-theme')==='gelap'
    ? {a:'95,168,255',p:'120,180,255',l:'120,170,255',g:.85} : {a:'31,111,208',p:'90,140,205',l:'70,120,195',g:.42};
  function resize(){ DPR=Math.min(2,devicePixelRatio||1); W=innerWidth; H=innerHeight; canvas.width=W*DPR; canvas.height=H*DPR; canvas.style.width=W+'px'; canvas.style.height=H+'px'; ctx.setTransform(DPR,0,0,DPR,0,0); }
  function init(){ resize();
    const nA=Math.max(4,Math.min(9,Math.round(W*H/190000)));
    atoms=Array.from({length:nA},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.15,vy:(Math.random()-.5)*.15,r:Math.random()*1.8+2.6,
      e:Array.from({length:2+(Math.random()<.5?0:1)},()=>({a:Math.random()*6.28,sp:(.007+Math.random()*.011)*(Math.random()<.5?1:-1),rx:16+Math.random()*24,ry:7+Math.random()*13,rot:Math.random()*3.14}))}));
    const nP=Math.max(18,Math.min(58,Math.round(W*H/28000)));
    parts=Array.from({length:nP},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28,r:Math.random()*1.5+.6}));
  }
  function atom(a,c){
    a.e.forEach(e=>{ ctx.save(); ctx.translate(a.x,a.y); ctx.rotate(e.rot);
      ctx.beginPath(); ctx.ellipse(0,0,e.rx,e.ry,0,0,6.283); ctx.strokeStyle=`rgba(${c.a},.13)`; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.arc(Math.cos(e.a)*e.rx,Math.sin(e.a)*e.ry,1.7,0,6.283); ctx.fillStyle=`rgba(${c.a},.9)`; ctx.fill(); ctx.restore(); });
    const g=ctx.createRadialGradient(a.x,a.y,0,a.x,a.y,a.r*4.5); g.addColorStop(0,`rgba(${c.a},${c.g})`); g.addColorStop(1,`rgba(${c.a},0)`);
    ctx.beginPath(); ctx.arc(a.x,a.y,a.r*4.5,0,6.283); ctx.fillStyle=g; ctx.fill();
    ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,6.283); ctx.fillStyle=`rgba(${c.a},1)`; ctx.fill();
  }
  function frame(){ if(!running) return; const c=palette(); ctx.clearRect(0,0,W,H);
    for(const p of parts){ p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1; }
    ctx.lineWidth=1;
    for(let i=0;i<parts.length;i++)for(let k=i+1;k<parts.length;k++){ const dx=parts[i].x-parts[k].x,dy=parts[i].y-parts[k].y,d2=dx*dx+dy*dy;
      if(d2<12500){ ctx.strokeStyle=`rgba(${c.l},${(1-d2/12500)*.15})`; ctx.beginPath(); ctx.moveTo(parts[i].x,parts[i].y); ctx.lineTo(parts[k].x,parts[k].y); ctx.stroke(); } }
    for(const p of parts){ ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283); ctx.fillStyle=`rgba(${c.p},.5)`; ctx.fill(); }
    for(const a of atoms){ a.x+=a.vx; a.y+=a.vy; if(a.x<-50)a.x=W+50; if(a.x>W+50)a.x=-50; if(a.y<-50)a.y=H+50; if(a.y>H+50)a.y=-50; a.e.forEach(e=>e.a+=e.sp); atom(a,c); }
    requestAnimationFrame(frame);
  }
  init();
  if(reduce){ const c=palette(); ctx.clearRect(0,0,W,H); for(const a of atoms) atom(a,c); return; }
  frame();
  addEventListener('resize', init);
  document.addEventListener('visibilitychange', ()=>{ running=!document.hidden; if(running) requestAnimationFrame(frame); });
}

// ================= NOTIFIKASI =================
let audioCtx, toastT;
function beep(){ try{ audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
  [880,1245].forEach((f,i)=>{ const o=audioCtx.createOscillator(),g=audioCtx.createGain(); o.type='sine'; o.frequency.value=f; o.connect(g); g.connect(audioCtx.destination);
    const t=audioCtx.currentTime+i*.12; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.15,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+.3); o.start(t); o.stop(t+.32); }); }catch(e){} }
let notifEnabled=false; try{ notifEnabled=localStorage.getItem(NOTIFKEY)==='1'; }catch(e){}
function desktopNotif(title,body){ try{ if(notifEnabled && 'Notification' in window && Notification.permission==='granted') new Notification(title,{body,icon:'/assets/favicon-32.png',silent:true}); }catch(e){} }
function toast(html){ const t=$('#toast'); if(!t) return; t.innerHTML=`<div class="tbell">${svg('bell')}</div><div>${html}</div>`; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'),4200); }

// ================= SESI / AUTH =================
const getSession=()=>{ try{return JSON.parse(localStorage.getItem(SESSKEY)||'null')}catch(e){return null} };
const setSession=s=>{ try{localStorage.setItem(SESSKEY,JSON.stringify(s))}catch(e){} };
const clearSession=()=>{ try{localStorage.removeItem(SESSKEY)}catch(e){} };
async function login(email,password){
  const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const d=await r.json().catch(()=>({})); if(!r.ok) throw new Error(d.error_description||d.msg||d.message||'Email atau kata sandi salah.');
  setSession({access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at,email}); return true;
}
async function refresh(){ const s=getSession(); if(!s||!s.refresh_token) return false;
  const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});
  if(!r.ok) return false; const d=await r.json(); setSession({access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at,email:s.email}); return true;
}
async function authedFetch(path){ let s=getSession(); if(!s) throw new Error('no-session');
  if(s.expires_at && s.expires_at*1000-Date.now()<60000){ await refresh(); s=getSession(); }
  let r=await fetch(`${SUPABASE_URL}${path}`,{headers:{apikey:SUPABASE_ANON_KEY,Authorization:`Bearer ${s.access_token}`}});
  if(r.status===401 && await refresh()){ s=getSession(); r=await fetch(`${SUPABASE_URL}${path}`,{headers:{apikey:SUPABASE_ANON_KEY,Authorization:`Bearer ${s.access_token}`}}); }
  return r;
}
function logout(){ stopPoll(); clearSession(); renderLogin(); toast('Berhasil keluar'); }

// ================= DATA =================
function mockRows(){
  const nm=['Ananda Putri','Bima Saputra','Cindy Lestari','Dimas Pratama','Eka Wulandari','Fajar Nugroho','Gita Rahmawati','Hadi Kusuma','Intan Permata','Joko Susilo','Kirana Dewi','Lukman Hakim','Mega Ayu','Naufal Rizky','Oktavia Sari','Putra Wijaya'];
  const kls=['VIII-A','VIII-B','VIII-C'], sk='MTs Al-Mustaqim';
  return nm.map((n,i)=>{ const jw=QUESTIONS.map((Q,qi)=>(((i*7+qi*3)%10)<(i%16===0?10:(8-(i%6))))?Q.correct:(Q.correct+1)%4); const b=jw.filter((a,qi)=>a===QUESTIONS[qi].correct).length;
    return {id:i+1,created_at:new Date(2026,6,22,7,(60-i*4+120)%60,0).toISOString(),nama:n,kelas:kls[i%3],sekolah:sk,jawaban:jw,benar:b,salah:20-b,nilai:b*5,jumlah_soal:20,durasi_detik:150+i*17%420}; });
}
let mockStore=null;
async function loadRows(){ if(MOCK){ if(!mockStore) mockStore=mockRows(); return mockStore.map(r=>({...r})); }
  const r=await authedFetch('/rest/v1/hasil_kuis?select=*&order=created_at.desc');
  if(!r.ok){ if(r.status===401){ logout(); throw new Error('Sesi berakhir, login lagi.'); } throw new Error('Gagal memuat data ('+r.status+').'); }
  return await r.json();
}

// ================= LOGIN =================
function renderLogin(){
  app.innerHTML=`<div class="login-shell"><form class="login" id="loginform" novalidate>
    <div class="lg"><img src="/assets/logo.png" alt=""> chensqy <span style="color:var(--sub);font-weight:600">· admin</span></div>
    <h1>Masuk Dasbor</h1><p class="s">Panel hasil kuis getaran &amp; gelombang</p>
    <label class="field"><span>Email</span><input id="email" type="email" autocomplete="username" placeholder="email@contoh.com" required></label>
    <label class="field"><span>Kata sandi</span><input id="pass" type="password" autocomplete="current-password" placeholder="••••••••" required></label>
    <button class="btn-primary" id="loginbtn" type="submit">Masuk</button>
    <div class="formerr" id="loginerr"></div>
    ${!isConfigured()?'<div class="hintbox">⚠ Belum terhubung ke database. Lengkapi <b>config.js</b>.</div>':''}
  </form></div>`;
  $('#loginform').addEventListener('submit', async e=>{ e.preventDefault();
    const email=$('#email').value.trim(), pass=$('#pass').value, errEl=$('#loginerr'); errEl.textContent='';
    if(!email||!pass){ errEl.textContent='Isi email dan kata sandi.'; return; }
    const btn=$('#loginbtn'); btn.disabled=true; btn.innerHTML='<span class="spin"></span>';
    try{ await login(email,pass); renderDashboard(); }catch(err){ errEl.textContent=err.message; btn.disabled=false; btn.textContent='Masuk'; }
  });
}

// ================= DASHBOARD =================
let ROWS=[], VIEW=[], SORT={key:'created_at',dir:-1}, FILTER={q:'',kelas:'',sekolah:''};
let prevMaxId=null, unseen=0, pollTimer=null, autoOn=true;

async function renderDashboard(){
  app.innerHTML=`
  <header class="top">
    <div class="brand"><img src="/assets/logo.png" alt=""><div>chensqy<small>Dasbor Admin</small></div></div>
    <span class="live" id="live"><span class="dot"></span>Live<span class="t" id="lasttime"></span></span>
    <div class="sp"></div>
    <label class="switch" title="Auto-refresh"><input type="checkbox" id="autochk" ${autoOn?'checked':''}><span class="tr"></span><span class="lbltxt" style="display:none"></span></label>
    <button class="iconbtn" id="notifbtn" title="Notifikasi submit baru">${svg(notifEnabled?'bell':'belloff')}<span class="badge-n" id="notifbadge" style="display:none">0</span></button>
    <button class="iconbtn" id="refreshbtn" title="Muat ulang">${svg('refresh')}</button>
    <button class="iconbtn" id="themebtn" title="Mode terang/gelap">${svg(document.documentElement.getAttribute('data-theme')==='gelap'?'sun':'moon')}</button>
    ${MOCK?'':'<button class="pillbtn danger" id="logoutbtn">'+svg('logout')+'Keluar</button>'}
  </header>
  <div class="wrap">
    <div class="pagehead reveal"><div><h1>Hasil Kuis Siswa</h1><p>Getaran &amp; Gelombang${MOCK?' · <b style="color:var(--accent)">MODE CONTOH</b>':''}</p></div>
      <button class="pillbtn" id="csvbtn">${svg('down')}Ekspor CSV</button></div>
    <div id="dash"><div class="center-load"><span class="spin"></span>Memuat data…</div></div>
  </div>`;
  $('#themebtn').addEventListener('click', toggleTheme);
  $('#refreshbtn').addEventListener('click', ()=>refreshData(true));
  $('#csvbtn').addEventListener('click', exportCSV);
  const lo=$('#logoutbtn'); if(lo) lo.addEventListener('click', logout);
  $('#autochk').addEventListener('change', e=>{ autoOn=e.target.checked; updateLive(); autoOn?startPoll():stopPoll(); });
  $('#notifbtn').addEventListener('click', toggleNotif);

  try{ ROWS=await loadRows(); }catch(err){ $('#dash').innerHTML=`<div class="card"><div class="empty">${svg('inbox')}<div>${escapeHtml(err.message)}</div></div></div>`; return; }
  prevMaxId=ROWS.reduce((m,r)=>Math.max(m,r.id||0),0);
  paintDash(new Set());
  updateLive();
  if(autoOn && !MOCK) startPoll();
}

function updateLive(){ const l=$('#live'), t=$('#lasttime'); if(!l) return;
  l.classList.toggle('off',!autoOn);
  const now=new Date(); if(t) t.textContent=' · '+now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  l.firstChild.nextSibling && (l.childNodes[1].textContent = autoOn?'Live':'Jeda');
}

// ---- auto-refresh ----
function startPoll(){ stopPoll(); pollTimer=setInterval(()=>refreshData(false), POLL_MS); }
function stopPoll(){ if(pollTimer){ clearInterval(pollTimer); pollTimer=null; } }
async function refreshData(manual){
  try{
    const fresh=await loadRows();
    const newRows=fresh.filter(r=>r.id>prevMaxId);
    ROWS=fresh; prevMaxId=fresh.reduce((m,r)=>Math.max(m,r.id||0),prevMaxId);
    const newIds=new Set(newRows.map(r=>r.id));
    paintDash(newIds); updateLive();
    if(newRows.length){ notifyNew(newRows); }
    else if(manual) toast('Data diperbarui');
  }catch(e){ if(manual) toast('Gagal memuat: '+e.message); }
}
function notifyNew(newRows){
  unseen+=newRows.length; const b=$('#notifbadge'); if(b){ b.style.display=''; b.textContent=unseen>99?'99+':unseen; }
  const first=newRows[0];
  const msg=newRows.length===1
    ? `<b>${escapeHtml(first.nama)}</b> (${escapeHtml(first.kelas)}) baru mengumpulkan — nilai <b>${first.nilai}</b>`
    : `<b>${newRows.length} jawaban baru</b> masuk (terbaru: ${escapeHtml(first.nama)})`;
  toast(msg); beep();
  desktopNotif('Jawaban kuis baru', newRows.length===1?`${first.nama} · ${first.kelas} · nilai ${first.nilai}`:`${newRows.length} siswa baru mengumpulkan`);
}
async function toggleNotif(){
  if(!notifEnabled){ if('Notification' in window){ try{ const p=await Notification.requestPermission(); if(p!=='granted'){ toast('Izin notifikasi ditolak browser'); } }catch(e){} }
    notifEnabled=true; } else notifEnabled=false;
  try{ localStorage.setItem(NOTIFKEY, notifEnabled?'1':'0'); }catch(e){}
  const nb=$('#notifbtn'); if(nb){ nb.firstChild && (nb.innerHTML=svg(notifEnabled?'bell':'belloff')+`<span class="badge-n" id="notifbadge" style="display:${unseen?'':'none'}">${unseen||0}</span>`); nb.addEventListener('click',toggleNotif,{once:true}); }
  toast(notifEnabled?'Notifikasi desktop aktif':'Notifikasi desktop nonaktif');
  if(notifEnabled){ unseen=0; const b=$('#notifbadge'); if(b) b.style.display='none'; }
}

// ---- statistik ----
function computeStats(rows){
  const n=rows.length, arr=rows.map(r=>r.nilai);
  const avg=n?Math.round(arr.reduce((a,b)=>a+b,0)/n):0, max=n?Math.max(...arr):0, min=n?Math.min(...arr):0;
  const uniq=new Set(rows.map(r=>`${(r.nama||'').toLowerCase()}|${(r.kelas||'').toLowerCase()}|${(r.sekolah||'').toLowerCase()}`)).size;
  const lulus=n?Math.round(rows.filter(r=>r.nilai>=KKM).length/n*100):0;
  const buckets=[{l:'0–20',a:0,b:20},{l:'21–40',a:21,b:40},{l:'41–60',a:41,b:60},{l:'61–80',a:61,b:80},{l:'81–100',a:81,b:100}];
  buckets.forEach(bk=>bk.c=rows.filter(r=>r.nilai>=bk.a&&r.nilai<=bk.b).length);
  const perQ=QUESTIONS.map((Q,qi)=>{ let ok=0,tot=0; rows.forEach(r=>{ const a=Array.isArray(r.jawaban)?r.jawaban[qi]:null; if(a!=null){tot++; if(a===Q.correct)ok++;} }); return {qi,pct:tot?Math.round(ok/tot*100):0,tot}; });
  const km={}; rows.forEach(r=>{ const k=r.kelas||'—'; (km[k]=km[k]||[]).push(r.nilai); });
  const perKelas=Object.entries(km).map(([k,v])=>({k,avg:Math.round(v.reduce((a,b)=>a+b,0)/v.length),n:v.length})).sort((a,b)=>b.avg-a.avg);
  return {n,avg,max,min,uniq,lulus,buckets,perQ,perKelas};
}

function paintDash(newIds){
  applyFilterSort(); const S=computeStats(ROWS);
  const kelasOpts=[...new Set(ROWS.map(r=>r.kelas).filter(Boolean))].sort();
  const sekolahOpts=[...new Set(ROWS.map(r=>r.sekolah).filter(Boolean))].sort();
  const maxB=Math.max(1,...S.buckets.map(b=>b.c));
  const hardest=[...S.perQ].filter(q=>q.tot>0).sort((a,b)=>a.pct-b.pct).slice(0,6);
  const pc=p=>p>=75?'var(--ok)':p>=50?'var(--warn)':'var(--danger)';
  const recent=[...ROWS].sort((a,b)=>+new Date(b.created_at)-+new Date(a.created_at)).slice(0,7);

  $('#dash').innerHTML=`
    <div class="stats">
      ${stat('users','var(--c1)','Total kiriman',S.n,'jawaban masuk')}
      ${stat('file','var(--c4)','Siswa unik',S.uniq,'nama berbeda')}
      ${stat('avg','var(--c3)','Rata-rata nilai',S.avg,'dari 100',' /100')}
      ${stat('grad','var(--c2)','Kelulusan',S.lulus,'nilai ≥ '+KKM,'%')}
      ${stat('trophy','var(--c5)','Tertinggi',S.max,'terendah '+S.min)}
    </div>
    <div class="grid2">
      <div class="card reveal"><h2>${svg('chart')} Sebaran Nilai</h2><div class="cardsub">Jumlah siswa per rentang nilai</div>
        <div class="chart">${S.buckets.map(b=>`<div class="bar"><div class="n tnum">${b.c}</div><div class="col" data-h="${Math.round(b.c/maxB*100)}" style="height:0"></div><div class="lbl">${b.l}</div></div>`).join('')}</div></div>
      <div class="card reveal d1"><h2>${svg('layers')} Rata-rata per Kelas</h2><div class="cardsub">Nilai rata-rata tiap kelas</div>
        <div class="hbars">${S.perKelas.length?S.perKelas.map(k=>`<div class="hbar"><div class="k">${escapeHtml(k.k)}</div><div class="m"><i data-w="${k.avg}" style="width:0;background:linear-gradient(90deg,var(--brand2),var(--accent))"></i></div><div class="v tnum">${k.avg}</div></div>`).join(''):'<div class="muted" style="font-size:13px">Belum ada data.</div>'}</div></div>
    </div>
    <div class="grid2b">
      <div class="card reveal"><h2>${svg('target')} Soal Tersulit</h2><div class="cardsub">Persentase siswa menjawab benar</div>
        <div class="hbars">${hardest.length?hardest.map(q=>`<div class="hbar"><div class="qn">${q.qi+1}</div><div class="m"><i data-w="${q.pct}" style="width:0;background:${pc(q.pct)}"></i></div><div class="v tnum">${q.pct}%</div></div>`).join(''):'<div class="muted" style="font-size:13px">Belum ada data.</div>'}</div></div>
      <div class="card reveal d1"><h2>${svg('activity')} Aktivitas Terbaru</h2><div class="cardsub">Pengumpulan paling baru</div>
        <div class="feed">${recent.length?recent.map(r=>`<div class="fitem ${newIds.has(r.id)?'new':''}"><div class="av" style="background:${avatarColor(r.nama)}">${initials(r.nama)}</div><div class="fm"><b>${escapeHtml(r.nama)}</b><span>${escapeHtml(r.kelas)} · ${relTime(r.created_at)}</span></div><div class="fscore" style="color:${scoreColor(r.nilai)}">${r.nilai}</div></div>`).join(''):'<div class="feed-empty">Belum ada pengumpulan.</div>'}</div></div>
    </div>
    <div class="card reveal">
      <h2>${svg('users')} Daftar Siswa <span class="muted tnum" style="font-weight:600;font-size:13px">(${VIEW.length})</span></h2>
      <div class="toolbar">
        <div class="search">${svg('search')}<input id="q" type="search" placeholder="Cari nama / kelas / sekolah…" value="${escapeHtml(FILTER.q)}"></div>
        <select class="sel" id="fkelas"><option value="">Semua kelas</option>${kelasOpts.map(k=>`<option ${FILTER.kelas===k?'selected':''}>${escapeHtml(k)}</option>`).join('')}</select>
        <select class="sel" id="fsekolah"><option value="">Semua sekolah</option>${sekolahOpts.map(k=>`<option ${FILTER.sekolah===k?'selected':''}>${escapeHtml(k)}</option>`).join('')}</select>
      </div>
      <div class="tablewrap"><table><thead><tr>${th('nama','Nama')}${th('kelas','Kelas')}${th('sekolah','Sekolah')}${th('nilai','Nilai')}${th('benar','Benar')}${th('created_at','Waktu')}</tr></thead><tbody id="tbody"></tbody></table></div>
      ${VIEW.length?'':`<div class="empty">${svg('inbox')}<div>Belum ada data yang cocok.</div></div>`}
    </div>`;
  paintRows(newIds);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    document.querySelectorAll('.col').forEach(c=>c.style.height=c.dataset.h+'%');
    document.querySelectorAll('.hbar i').forEach(m=>m.style.width=m.dataset.w+'%');
    document.querySelectorAll('[data-count]').forEach(countUp);
  }));
  $('#q').addEventListener('input', debounce(e=>{ FILTER.q=e.target.value; applyFilterSort(); paintRows(new Set()); updateCount(); },170));
  $('#fkelas').addEventListener('change', e=>{ FILTER.kelas=e.target.value; applyFilterSort(); paintRows(new Set()); updateCount(); });
  $('#fsekolah').addEventListener('change', e=>{ FILTER.sekolah=e.target.value; applyFilterSort(); paintRows(new Set()); updateCount(); });
  document.querySelectorAll('th[data-key]').forEach(h=>h.addEventListener('click',()=>{ const k=h.dataset.key; if(SORT.key===k)SORT.dir*=-1; else{SORT.key=k;SORT.dir=1;} applyFilterSort(); paintDash(new Set()); }));
}

function stat(icon,color,label,value,foot,extra){ return `<div class="stat reveal" style="--accent-c:${color}">
  <div class="lab"><span class="chip" style="background:${color}">${svg(icon)}</span>${label}</div>
  <div class="val tnum"><span data-count="${value}">0</span>${extra?`<small>${extra}</small>`:''}</div><div class="foot">${foot}</div></div>`; }
function th(key,label){ const a=SORT.key===key; return `<th data-key="${key}" class="${a?'active':''}">${label} <span class="sar">${a?(SORT.dir>0?'▲':'▼'):'↕'}</span></th>`; }

function applyFilterSort(){ const q=FILTER.q.trim().toLowerCase();
  VIEW=ROWS.filter(r=>{ if(FILTER.kelas&&r.kelas!==FILTER.kelas)return false; if(FILTER.sekolah&&r.sekolah!==FILTER.sekolah)return false; if(q&&!`${r.nama} ${r.kelas} ${r.sekolah}`.toLowerCase().includes(q))return false; return true; });
  const {key,dir}=SORT; VIEW.sort((a,b)=>{ let x=a[key],y=b[key]; if(key==='created_at'){x=+new Date(x);y=+new Date(y);} if(typeof x==='string'){x=x.toLowerCase();y=(y||'').toLowerCase();} return x<y?-dir:x>y?dir:0; });
}
function updateCount(){ const c=document.querySelector('#dash .card:last-child h2 .muted'); if(c) c.textContent=`(${VIEW.length})`; }
const scoreColor=n=>n>=85?'var(--ok)':n>=70?'var(--brand2)':n>=55?'var(--warn)':'var(--danger)';
const scoreStyle=n=>`background:color-mix(in srgb,${scoreColor(n)} 15%,transparent);color:${scoreColor(n)}`;
function fmtDate(s){ try{ const d=new Date(s); return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}); }catch(e){ return s; } }
function relTime(s){ const d=(Date.now()-+new Date(s))/1000; if(d<60)return'baru saja'; if(d<3600)return Math.floor(d/60)+' mnt lalu'; if(d<86400)return Math.floor(d/3600)+' jam lalu'; return fmtDate(s); }
function initials(n){ return String(n||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?'; }
function avatarColor(n){ const c=['#1f6fd0','#8b5cf6','#1f9c4d','#ff9f2e','#e23c3c','#0ea5a5','#d946ef']; let h=0; for(const ch of String(n||'')) h=(h*31+ch.charCodeAt(0))>>>0; return c[h%c.length]; }

function paintRows(newIds){ const tb=$('#tbody'); if(!tb) return;
  tb.innerHTML=VIEW.map((r,i)=>`<tr data-i="${i}" class="${newIds.has(r.id)?'new':''}">
    <td class="nm">${escapeHtml(r.nama)}</td><td><span class="badge" style="background:var(--track)">${escapeHtml(r.kelas)}</span></td>
    <td class="muted">${escapeHtml(r.sekolah)}</td><td><span class="score tnum" style="${scoreStyle(r.nilai)}">${r.nilai}</span></td>
    <td class="tnum">${r.benar}/${r.jumlah_soal||20}</td><td class="muted tnum">${fmtDate(r.created_at)}</td></tr>`).join('');
  tb.querySelectorAll('tr').forEach(tr=>tr.addEventListener('click',()=>openDetail(VIEW[+tr.dataset.i])));
}

// ---- detail modal ----
function openDetail(r){ const jw=Array.isArray(r.jawaban)?r.jawaban:[];
  const grade=r.nilai>=85?'Sangat Baik':r.nilai>=70?'Baik':r.nilai>=55?'Cukup':'Perlu Belajar Lagi';
  const items=QUESTIONS.map((Q,i)=>{ const ua=jw[i], ok=ua===Q.correct;
    const opts=Q.opts.map((o,k)=>{ const cls=k===Q.correct?'c':(k===ua?'w':''); const tag=k===Q.correct?' <em>(kunci)</em>':(k===ua&&!ok?' <em>(jawaban)</em>':''); return `<li class="${cls}"><b>${LETTERS[k]}</b> ${escapeHtml(o)}${tag}</li>`; }).join('');
    return `<div class="mitem ${ok?'ok':'no'}"><div class="mq"><span class="mmark">${ok?'✓':'✕'}</span><span><b>${i+1}.</b> ${escapeHtml(Q.q)}</span></div><ul class="mopts">${opts}</ul>${ok?'':`<div class="mnote"><b>Pembahasan:</b> ${escapeHtml(Q.pembahasan)}</div>`}</div>`; }).join('');
  const ov=el('div','overlay');
  ov.innerHTML=`<div class="modal" role="dialog" aria-modal="true"><div class="modal-h"><div>
    <div class="who">${escapeHtml(r.nama)}</div><div class="meta">${escapeHtml(r.kelas)} · ${escapeHtml(r.sekolah)} · ${fmtDate(r.created_at)}${r.durasi_detik?` · ${Math.floor(r.durasi_detik/60)}m ${r.durasi_detik%60}s`:''}</div>
    <div class="modal-scoreline"><span class="score tnum" style="${scoreStyle(r.nilai)};min-width:56px;font-size:18px">${r.nilai}</span><span class="muted">${grade} · benar ${r.benar}/${r.jumlah_soal||20}</span></div></div>
    <button class="iconbtn" id="mclose">${svg('x')}</button></div><div class="modal-body">${items}</div></div>`;
  document.body.appendChild(ov); const close=()=>ov.remove();
  ov.addEventListener('click',e=>{ if(e.target===ov) close(); }); $('#mclose',ov).addEventListener('click',close);
  document.addEventListener('keydown',function esc(e){ if(e.key==='Escape'){ close(); document.removeEventListener('keydown',esc);} });
}

// ---- CSV ----
function exportCSV(){ const rows=VIEW.length?VIEW:ROWS; if(!rows.length){ toast('Belum ada data'); return; }
  const head=['Nama','Kelas','Sekolah','Nilai','Benar','Salah','Waktu','Durasi (detik)'], esc=v=>`"${String(v==null?'':v).replace(/"/g,'""')}"`;
  const lines=[head.join(',')].concat(rows.map(r=>[r.nama,r.kelas,r.sekolah,r.nilai,r.benar,r.salah,fmtDate(r.created_at),r.durasi_detik].map(esc).join(',')));
  const a=el('a'); a.href=URL.createObjectURL(new Blob(['﻿'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'})); a.download=`hasil-kuis-${new Date().toISOString().slice(0,10)}.csv`; a.click(); toast(`${rows.length} baris diekspor`);
}

// ---- motion util ----
function countUp(node){ const target=parseInt(node.dataset.count)||0; if(target===0){ node.textContent='0'; return; }
  const dur=750,t0=performance.now(); const step=t=>{ const k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3); node.textContent=Math.round(target*e); if(k<1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }

// ================= BOOT =================
if(MOCK){ window.__test={ inject:(over={})=>{ const id=mockStore.reduce((m,r)=>Math.max(m,r.id||0),0)+1; const bn=over.benar!=null?over.benar:17;
  mockStore.unshift({id, created_at:new Date().toISOString(), nama:over.nama||'Siti Aisyah', kelas:over.kelas||'VIII-A', sekolah:over.sekolah||'MTs Al-Mustaqim',
    jawaban:QUESTIONS.map((Q,qi)=>qi<bn?Q.correct:(Q.correct+1)%4), benar:bn, salah:20-bn, nilai:bn*5, jumlah_soal:20, durasi_detik:over.durasi_detik||231}); return refreshData(false); } }; }
startAtomBg();
if(MOCK) renderDashboard();
else if(getSession()) renderDashboard();
else renderLogin();
