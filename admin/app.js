// Dasbor Admin chensqy — sidebar + halaman, refresh mulus (patch, tanpa glitch), 2 background (galaxy/langit) interaktif mouse.
// Login Supabase, RLS: hanya admin login yang membaca. Tanpa library. Mode uji tampilan: ?mock=1
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from './config.js?v=2';

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const el=(t,c)=>{const n=document.createElement(t);if(c)n.className=c;return n;};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const app=$('#app'), LETTERS=["A","B","C","D"];
const SESSKEY='chensqy-admin-sess', THEMEKEY='chensqy-theme', NOTIFKEY='chensqy-admin-notif', KKMKEY='chensqy-admin-kkm';
const MOCK=new URLSearchParams(location.search).get('mock')==='1';
const POLL_MS=12000; let KKM=70; try{ KKM=parseInt(localStorage.getItem(KKMKEY))||70; }catch(e){}
const MATERI='Getaran & Gelombang';
const KCOL=['#4f7dff','#9b6dff','#22c55e','#f59e0b','#ef4444','#22d3ee','#ec4899'];

const I={
  home:'<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
  clipboard:'<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M9 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3"/><path d="M9 12h6M9 16h4"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  chart:'<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="12" y="6" width="3" height="11"/><rect x="17" y="13" width="3" height="4"/>',
  activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  grad:'<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  avg:'<path d="M3 3v18h18"/><path d="M7 14l3-3 3 2 5-6"/>',
  trophy:'<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  layers:'<path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/>',
  down:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
  refresh:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  belloff:'<path d="M8.7 3A6 6 0 0 1 18 8c0 2.5.4 4.3 1 5.6M17 17H3s3-2 3-9M13.7 21a2 2 0 0 1-3.4 0M2 2l20 20"/>',
  menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5 5h14l3 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
  dots:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  check:'<path d="M20 6L9 17l-5-5"/>',
  spark:'<path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z"/>',
};
const svg=(n,c='ic')=>`<svg class="${c}" viewBox="0 0 24 24">${I[n]}</svg>`;

// ---------- diagram ----------
const FIG={
  transversal:`<svg viewBox="0 0 320 150"><line x1="10" y1="75" x2="310" y2="75" stroke="#8aa0bd" stroke-width="1.5" stroke-dasharray="5 5"/><path d="M10 75 C 30 20, 65 20, 85 75 S 140 130, 160 75 S 215 20, 235 75 S 290 130, 310 75" fill="none" stroke="#1f6fd0" stroke-width="4" stroke-linecap="round"/><line x1="60" y1="20" x2="285" y2="20" stroke="#1f9c4d" stroke-width="2.5"/><path d="M285 20 l-9 -5 v10 z" fill="#1f9c4d"/><text x="172" y="14" font-size="12" fill="#1f7a3d" text-anchor="middle">arah rambat</text></svg>`,
  longitudinal:`<svg viewBox="0 0 320 130"><g stroke="#22406e" stroke-width="2.4">${[18,40,62,90,122,140,155,168,196,226,256,274,289,304].map(x=>`<line x1="${x}" y1="30" x2="${x}" y2="98"/>`).join('')}</g><line x1="40" y1="112" x2="285" y2="112" stroke="#1f9c4d" stroke-width="2.5"/><path d="M285 112 l-9 -5 v10 z" fill="#1f9c4d"/><text x="162" y="122" font-size="12" fill="#1f7a3d" text-anchor="middle">arah rambat</text></svg>`,
  bandulPath:`<svg viewBox="0 0 300 200"><rect x="120" y="14" width="60" height="12" rx="3" fill="#7a5230"/><circle cx="150" cy="26" r="3.5" fill="#22406e"/><path d="M78 150 A 130 130 0 0 1 222 150" fill="none" stroke="#8aa0bd" stroke-width="1.6" stroke-dasharray="5 5"/><line x1="150" y1="26" x2="78" y2="150" stroke="#b9c6da" stroke-width="1.4"/><line x1="150" y1="26" x2="150" y2="160" stroke="#b9c6da" stroke-width="1.4" stroke-dasharray="4 4"/><line x1="150" y1="26" x2="222" y2="150" stroke="#b9c6da" stroke-width="1.4"/><circle cx="78" cy="150" r="12" fill="#1a4fa0"/><text x="78" y="182" font-size="15" fill="#12386e" text-anchor="middle" font-weight="700">A</text><circle cx="150" cy="160" r="12" fill="#1a4fa0" opacity=".55"/><text x="150" y="192" font-size="15" fill="#12386e" text-anchor="middle" font-weight="700">O</text><circle cx="222" cy="150" r="12" fill="#1a4fa0"/><text x="222" y="182" font-size="15" fill="#12386e" text-anchor="middle" font-weight="700">B</text></svg>`,
};
const QUESTIONS=[
  {t:"Getaran",q:"Sebuah jembatan gantung bergerak bolak-balik melalui titik kesetimbangannya akibat hembusan angin kencang. Gerak bolak-balik benda melalui titik setimbangnya tersebut disebut...",opts:["Getaran","Gelombang","Frekuensi","Amplitudo"],correct:0,pembahasan:"Getaran adalah gerak bolak-balik suatu benda melalui titik kesetimbangannya, seperti jembatan gantung akibat angin."},
  {t:"Amplitudo",q:"Saat kamu duduk di ayunan taman dan mendorongnya, jarak terjauh ayunan itu bergerak menjauh dari posisi diamnya disebut...",opts:["Periode","Amplitudo","Panjang gelombang","Cepat rambat"],correct:1,pembahasan:"Amplitudo adalah simpangan terjauh yang dialami benda saat bergetar, diukur dari posisi setimbangnya."},
  {t:"Frekuensi",q:"Sebuah alat sensor mencatat bahwa dalam 1 detik, sebuah pegas bergetar sebanyak 5 kali. Besaran yang menyatakan banyaknya getaran tiap detik ini disebut ...",opts:["Frekuensi","Periode","Amplitudo","Getaran"],correct:0,pembahasan:"Frekuensi adalah banyaknya getaran yang terjadi dalam waktu satu detik."},
  {t:"Periode",q:"Jika frekuensi getaran suatu benda adalah 5 Hz, maka periode getaran benda tersebut adalah...",opts:["0,2 sekon","5 sekon","1 sekon","10 sekon"],correct:0,pembahasan:"Periode T = 1/f = 1/5 Hz = 0,2 sekon."},
  {t:"Contoh Getaran",q:"Berikut adalah beberapa peristiwa dalam kehidupan sehari-hari. Manakah yang merupakan contoh getaran?",opts:["Ombak di lautan","Cahaya lampu yang menerangi ruangan","Senar gitar yang dipetik","Bunyi gema di dalam gua"],correct:2,pembahasan:"Senar gitar yang dipetik adalah getaran. Ombak, cahaya, dan gema merambat (gelombang)."},
  {t:"Satu Getaran",q:"Perhatikan gambar lintasan ayunan bandul. Titik A dan B simpangan terjauh, O titik setimbang. Lintasan yang menunjukkan satu getaran penuh adalah...",fig:"bandulPath",opts:["B–A–B–O–B","A–B–A–O–A","A–O–B–O–A","O–A–B–A–O"],correct:2,pembahasan:"Satu getaran penuh dimulai & diakhiri pada titik sama setelah melewati kedua simpangan: A–O–B–O–A."},
  {t:"Amplitudo & Nada",q:"Ketika senar gitar dipetik lebih keras, amplitudo membesar tetapi frekuensinya tetap. Pengaruh amplitudo dan frekuensi terhadap bunyi yang tepat adalah...",opts:["Amplitudo memengaruhi kekerasan (kenyaringan) bunyi, sedangkan frekuensi memengaruhi tinggi rendahnya nada","Amplitudo memengaruhi tinggi rendahnya nada, frekuensi memengaruhi kenyaringan","Keduanya menentukan tinggi rendahnya nada","Keduanya tidak berpengaruh"],correct:0,pembahasan:"Amplitudo → kekerasan/kenyaringan bunyi; frekuensi → tinggi rendahnya nada."},
  {t:"Getaran vs Gelombang",q:"Gabus pelampung naik-turun di tempat hampir sama saat ombak lewat, namun ombak bergerak menuju pantai. Perbedaan mendasar getaran dan gelombang adalah...",opts:["Getaran memiliki frekuensi, gelombang tidak","Gelombang memindahkan energi, sedangkan getaran tidak","Getaran hanya pada benda padat","Gelombang tidak memiliki periode"],correct:1,pembahasan:"Gelombang memindahkan energi tanpa memindahkan materi. Gabus tetap di tempatnya, energi ombak merambat."},
  {t:"Jenis Gelombang",q:"Perhatikan gambar. Berdasarkan bentuknya (bukit & lembah), gelombang ini termasuk jenis gelombang...",fig:"transversal",opts:["Longitudinal","Transversal","Mekanik","Elektromagnetik"],correct:1,pembahasan:"Bentuk bukit dan lembah (sinusoidal) adalah ciri gelombang transversal."},
  {t:"Puncak",q:"Berdasarkan gambar pada soal nomor 9, bagian gelombang yang berada paling tinggi disebut...",fig:"transversal",opts:["Lembah gelombang","Puncak gelombang","Rapatan","Renggangan"],correct:1,pembahasan:"Bagian gelombang paling tinggi disebut puncak gelombang."},
  {t:"Panjang Gelombang",q:"Berdasarkan gambar pada soal nomor 9, jarak antara dua puncak gelombang yang berurutan disebut...",fig:"transversal",opts:["Satu panjang gelombang","Satu periode","Satu frekuensi","Satu amplitudo"],correct:0,pembahasan:"Jarak dua puncak (atau dua lembah) berurutan = satu panjang gelombang (λ)."},
  {t:"Hitung λ",q:"Jarak antara 4 puncak gelombang yang berurutan pada permukaan air adalah 9 meter. Panjang gelombang tersebut adalah...",opts:["9 m","4,5 m","3 m","2,25 m"],correct:2,pembahasan:"4 puncak berurutan = 3 panjang gelombang, sehingga λ = 9 ÷ 3 = 3 m."},
  {t:"Longitudinal",q:"Perhatikan gambar. Gelombang memiliki arah getar sejajar arah rambatnya, gelombang tersebut termasuk...",fig:"longitudinal",opts:["Longitudinal","Transversal","Mekanik","Elektromagnetik"],correct:0,pembahasan:"Arah getar partikel sejajar arah rambat = gelombang longitudinal."},
  {t:"Rapatan",q:"Berdasarkan gambar pada soal nomor 13, daerah di mana partikel medium saling merapat disebut...",fig:"longitudinal",opts:["Renggangan","Lembah","Puncak","Rapatan"],correct:3,pembahasan:"Daerah partikel yang saling merapat (berdekatan) disebut Rapatan."},
  {t:"Renggangan",q:"Berdasarkan gambar pada soal nomor 13, daerah di mana partikel medium saling meregang disebut...",fig:"longitudinal",opts:["Rapatan","Renggangan","Amplitudo","Puncak"],correct:1,pembahasan:"Daerah partikel yang saling meregang (berjauhan) disebut renggangan."},
  {t:"Contoh Gelombang",q:"Manakah berikut yang merupakan contoh gelombang?",opts:["Cahaya matahari yang sampai ke Bumi","Getaran senar gitar yang diam ditekan","Bandul jam yang diam di titik setimbang","Pegas yang ditekan lalu ditahan"],correct:0,pembahasan:"Cahaya matahari = gelombang (elektromagnetik) yang merambat & memindahkan energi."},
  {t:"Bunyi Longitudinal",q:"Gelombang bunyi saat gendang dipukul termasuk gelombang longitudinal karena...",opts:["Arah getar partikel medium sejajar dengan arah rambat gelombangnya","Arah getar tegak lurus arah rambat","Tidak memerlukan medium","Termasuk elektromagnetik"],correct:0,pembahasan:"Bunyi termasuk longitudinal karena arah getar partikel sejajar arah rambatnya."},
  {t:"Periode dari ¼",q:"Bandul pegas berayun dari C ke B dalam 0,25 sekon. Jika C ke B = ¼ getaran penuh, maka periodenya adalah...",opts:["0,25 sekon","0,5 sekon","1 sekon","4 sekon"],correct:2,pembahasan:"C ke B = ¼ getaran, sehingga periode = 4 × 0,25 = 1 sekon."},
  {t:"Frekuensi dari T",q:"Sebuah bandul bergetar dengan periode 0,5 sekon. Frekuensi getarannya adalah...",opts:["0,25 Hz","0,5 Hz","2 Hz","4 Hz"],correct:2,pembahasan:"f = 1/T = 1/0,5 = 2 Hz."},
  {t:"Cepat Rambat",q:"Gelombang dengan panjang gelombang 0,4 m dan periode 0,2 sekon. Cepat rambatnya adalah...",opts:["0,08 m/s","0,5 m/s","2 m/s","8 m/s"],correct:2,pembahasan:"v = λ/T = 0,4 ÷ 0,2 = 2 m/s."},
];

// ---------- tema ----------
(function(){ let t='gelap'; try{ t=localStorage.getItem(THEMEKEY)||'gelap'; }catch(e){} document.documentElement.setAttribute('data-theme',t); })();
const isLight=()=>document.documentElement.getAttribute('data-theme')==='terang';
function toggleTheme(){ const t=isLight()?'gelap':'terang'; document.documentElement.setAttribute('data-theme',t); try{localStorage.setItem(THEMEKEY,t)}catch(e){} const b=$('#themebtn'); if(b) b.innerHTML=svg(isLight()?'moon':'sun'); }

// ================= BACKGROUND (galaxy / langit) =================
function startBg(){
  const canvas=$('#bg'); if(!canvas) return; const ctx=canvas.getContext('2d');
  let W,H,DPR,run=true,t=0; const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let stars=[],atoms=[],motes=[],clouds=[],neb=[]; const mouse={x:-9999,y:-9999,on:false};
  const P={dark:{atom:'130,180,255',orb:'150,185,255',star:'210,224,255',mote:'150,190,255',line:'150,185,255',neb:['110,80,220','40,100,210']},
           light:{atom:'31,111,208',orb:'31,111,208',star:'255,255,255',mote:'110,150,215',line:'80,135,210',sun:'255,196,92'}};
  const rnd=(a,b)=>a+(b-a)*Math.random(), dark=()=>!isLight();
  function resize(){ DPR=Math.min(2,devicePixelRatio||1); W=innerWidth;H=innerHeight; canvas.width=W*DPR;canvas.height=H*DPR; canvas.style.width=W+'px';canvas.style.height=H+'px'; ctx.setTransform(DPR,0,0,DPR,0,0); }
  function init(){ resize(); const A=W*H, m=W<720?.6:1;
    atoms=Array.from({length:Math.round(Math.max(6,Math.min(16,A/120000))*m)},()=>({x:rnd(0,W),y:rnd(0,H),vx:rnd(-.13,.13),vy:rnd(-.13,.13),r:rnd(2.2,4),e:Array.from({length:2+(Math.random()<.5?0:1)},()=>({a:rnd(0,6.28),sp:rnd(.006,.016)*(Math.random()<.5?1:-1),rx:rnd(14,40),ry:rnd(7,15),rot:rnd(0,3.14)}))}));
    stars=Array.from({length:Math.round(Math.max(50,Math.min(200,A/7000))*m)},()=>({x:rnd(0,W),y:rnd(0,H),r:rnd(.4,1.5),ph:rnd(0,6.28),tw:rnd(.5,2)}));
    motes=Array.from({length:Math.round(Math.max(20,Math.min(60,A/22000))*m)},()=>({x:rnd(0,W),y:rnd(0,H),vx:rnd(-.2,.2),vy:rnd(-.24,.14),r:rnd(.8,2.1)}));
    clouds=Array.from({length:3},()=>({x:rnd(0,W),y:rnd(H*.06,H*.5),vx:rnd(.05,.13),w:rnd(180,320)}));
    neb=[{x:W*.78,y:H*.22,r:Math.max(W,H)*.44,c:0},{x:W*.16,y:H*.74,r:Math.max(W,H)*.36,c:1}]; }
  function sun(c){ const sx=W*.9,sy=H*.1,pr=90+Math.sin(t*.02)*7; let g=ctx.createRadialGradient(sx,sy,0,sx,sy,pr*3); g.addColorStop(0,`rgba(${c.sun},.8)`);g.addColorStop(.28,`rgba(${c.sun},.38)`);g.addColorStop(1,`rgba(${c.sun},0)`); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    g=ctx.createRadialGradient(sx,sy,0,sx,sy,pr*.7); g.addColorStop(0,'rgba(255,251,238,.95)');g.addColorStop(1,`rgba(${c.sun},.2)`); ctx.beginPath();ctx.arc(sx,sy,pr*.7,0,6.283);ctx.fillStyle=g;ctx.fill(); }
  function cloud(){ for(const k of clouds){ k.x+=k.vx; if(k.x-k.w>W)k.x=-k.w; const g=ctx.createRadialGradient(k.x,k.y,0,k.x,k.y,k.w*.55); g.addColorStop(0,'rgba(255,255,255,.4)');g.addColorStop(1,'rgba(255,255,255,0)'); ctx.save();ctx.translate(k.x,k.y);ctx.scale(1,.4);ctx.beginPath();ctx.arc(0,0,k.w*.55,0,6.283);ctx.fillStyle=g;ctx.fill();ctx.restore(); } }
  function nebula(c){ for(const n of neb){ const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r); g.addColorStop(0,`rgba(${c.neb[n.c]},.16)`);g.addColorStop(1,`rgba(${c.neb[n.c]},0)`); ctx.fillStyle=g;ctx.fillRect(0,0,W,H); } }
  function starf(c){ for(const s of stars){ const o=Math.max(.12,.45+.5*Math.sin(t*s.tw*.05+s.ph)); ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.283);ctx.fillStyle=`rgba(${c.star},${o})`;ctx.fill(); } }
  function atom(a,c,d){ a.e.forEach(e=>{ e.a+=e.sp; ctx.save();ctx.translate(a.x,a.y);ctx.rotate(e.rot);
      ctx.beginPath();ctx.ellipse(0,0,e.rx,e.ry,0,0,6.283);ctx.strokeStyle=`rgba(${c.orb},${d?.15:.24})`;ctx.lineWidth=d?1:1.2;ctx.stroke();
      const ex=Math.cos(e.a)*e.rx,ey=Math.sin(e.a)*e.ry,eg=ctx.createRadialGradient(ex,ey,0,ex,ey,4.5);eg.addColorStop(0,`rgba(${c.atom},1)`);eg.addColorStop(1,`rgba(${c.atom},0)`);
      ctx.beginPath();ctx.arc(ex,ey,4.5,0,6.283);ctx.fillStyle=eg;ctx.fill();ctx.beginPath();ctx.arc(ex,ey,1.7,0,6.283);ctx.fillStyle=`rgba(${c.atom},1)`;ctx.fill();ctx.restore(); });
    const g=ctx.createRadialGradient(a.x,a.y,0,a.x,a.y,a.r*5);g.addColorStop(0,`rgba(${c.atom},${d?.8:.6})`);g.addColorStop(1,`rgba(${c.atom},0)`);
    ctx.beginPath();ctx.arc(a.x,a.y,a.r*5,0,6.283);ctx.fillStyle=g;ctx.fill();ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,6.283);ctx.fillStyle=`rgba(${c.atom},1)`;ctx.fill(); }
  function frame(){ if(!run) return; t++; const d=dark(),c=d?P.dark:P.light; ctx.clearRect(0,0,W,H);
    if(d){ nebula(c);starf(c); } else { sun(c);cloud(); }
    for(const m of motes){ m.x+=m.vx;m.y+=m.vy; if(mouse.on){ const dx=mouse.x-m.x,dy=mouse.y-m.y,d2=dx*dx+dy*dy; if(d2<34000&&d2>1){ const f=1/Math.sqrt(d2); m.vx+=dx*f*.05;m.vy+=dy*f*.05; } } m.vx*=.985;m.vy*=.985; if(m.x<0)m.x=W;if(m.x>W)m.x=0;if(m.y<0)m.y=H;if(m.y>H)m.y=0; }
    ctx.lineWidth=1;
    if(mouse.on) for(const m of motes){ const dx=mouse.x-m.x,dy=mouse.y-m.y,d2=dx*dx+dy*dy; if(d2<20000){ ctx.strokeStyle=`rgba(${c.line},${(1-d2/20000)*.4})`;ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke(); } }
    for(const m of motes){ ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,6.283);ctx.fillStyle=`rgba(${c.mote},.5)`;ctx.fill(); }
    for(const a of atoms){ a.x+=a.vx;a.y+=a.vy; if(mouse.on){ const dx=mouse.x-a.x,dy=mouse.y-a.y,d2=dx*dx+dy*dy; if(d2<42000){ const f=.35/Math.max(70,Math.sqrt(d2)); a.vx+=dx*f*.02;a.vy+=dy*f*.02; } }
      a.vx=Math.max(-.5,Math.min(.5,a.vx*.996));a.vy=Math.max(-.5,Math.min(.5,a.vy*.996)); if(a.x<-50)a.x=W+50;if(a.x>W+50)a.x=-50;if(a.y<-50)a.y=H+50;if(a.y>H+50)a.y=-50; atom(a,c,d); }
    requestAnimationFrame(frame); }
  init();
  addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.on=true;},{passive:true});
  addEventListener('pointerout',()=>mouse.on=false); addEventListener('blur',()=>mouse.on=false); addEventListener('resize',init);
  document.addEventListener('visibilitychange',()=>{run=!document.hidden; if(run) requestAnimationFrame(frame);});
  if(reduce){ const d=dark(),c=d?P.dark:P.light; ctx.clearRect(0,0,W,H); if(d){nebula(c);starf(c);}else{sun(c);cloud();} for(const a of atoms)atom(a,c,d); return; }
  frame();
}

// ================= NOTIFIKASI =================
let audioCtx,toastT;
function beep(){ try{ audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)(); [880,1245].forEach((f,i)=>{ const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=f;o.connect(g);g.connect(audioCtx.destination); const t=audioCtx.currentTime+i*.12;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.14,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.start(t);o.stop(t+.32); }); }catch(e){} }
let notifEnabled=false; try{ notifEnabled=localStorage.getItem(NOTIFKEY)==='1'; }catch(e){}
function desktopNotif(ti,b){ try{ if(notifEnabled&&'Notification'in window&&Notification.permission==='granted') new Notification(ti,{body:b,icon:'/assets/favicon-32.png',silent:true}); }catch(e){} }
function toast(html){ const e=$('#toast'); if(!e)return; e.innerHTML=`<div class="tb">${svg('bell')}</div><div>${html}</div>`; e.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>e.classList.remove('on'),4200); }

// ================= AUTH =================
const getSession=()=>{try{return JSON.parse(localStorage.getItem(SESSKEY)||'null')}catch(e){return null}};
const setSession=s=>{try{localStorage.setItem(SESSKEY,JSON.stringify(s))}catch(e){}};
const clearSession=()=>{try{localStorage.removeItem(SESSKEY)}catch(e){}};
async function login(email,password){ const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})}); const d=await r.json().catch(()=>({})); if(!r.ok) throw new Error(d.error_description||d.msg||d.message||'Email atau kata sandi salah.'); setSession({access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at,email}); return true; }
async function refreshTok(){ const s=getSession(); if(!s||!s.refresh_token)return false; const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})}); if(!r.ok)return false; const d=await r.json(); setSession({access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at,email:s.email}); return true; }
async function authedFetch(p){ let s=getSession(); if(!s)throw new Error('no-session'); if(s.expires_at&&s.expires_at*1000-Date.now()<60000){await refreshTok();s=getSession();} let r=await fetch(`${SUPABASE_URL}${p}`,{headers:{apikey:SUPABASE_ANON_KEY,Authorization:`Bearer ${s.access_token}`}}); if(r.status===401&&await refreshTok()){s=getSession();r=await fetch(`${SUPABASE_URL}${p}`,{headers:{apikey:SUPABASE_ANON_KEY,Authorization:`Bearer ${s.access_token}`}});} return r; }
function logout(){ stopPoll(); clearSession(); renderLogin(); }

// ================= DATA =================
let mockStore=null;
function mockRows(){ const nm=['Ahmad Rizki','Siti Aisyah','Budi Santoso','Dewi Lestari','Eka Wulandari','Fajar Nugroho','Gita Rahmawati','Hadi Kusuma','Intan Permata','Joko Susilo','Kirana Dewi','Lukman Hakim','Mega Ayu','Naufal Rizky','Oktavia Sari','Putra Wijaya','Rani Kusuma','Surya Adi','Tari Melati','Umar Faruq'];
  const kls=['Kelas 10A','Kelas 10B','Kelas 11A','Kelas 11B','Kelas 12A'], sk=['SMA Negeri 1 Jakarta','MTs Al-Mustaqim'];
  const now=Date.now();
  return nm.map((n,i)=>{ const jw=QUESTIONS.map((Q,qi)=>(((i*7+qi*3)%10)<(i%20===0?10:(8-(i%6))))?Q.correct:(Q.correct+1)%4); const b=jw.filter((a,qi)=>a===QUESTIONS[qi].correct).length;
    const ago=i<3? (2+i*3)*60*1000 : rnd14(); return {id:i+1,created_at:new Date(now-ago).toISOString(),nama:n,kelas:kls[i%5],sekolah:sk[i%2],jawaban:jw,benar:b,salah:20-b,nilai:b*5,jumlah_soal:20,durasi_detik:150+i*17%420}; });
  function rnd14(){ return Math.floor((0.2+Math.random()*13.5)*864e5); } }
async function loadRows(){ if(MOCK){ if(!mockStore) mockStore=mockRows(); return mockStore.map(r=>({...r})); }
  const r=await authedFetch('/rest/v1/hasil_kuis?select=*&order=created_at.desc'); if(!r.ok){ if(r.status===401){logout();throw new Error('Sesi berakhir, login lagi.');} throw new Error('Gagal memuat data ('+r.status+').'); } return await r.json(); }

// ================= LOGIN =================
function renderLogin(){ app.innerHTML=`<div class="login-shell"><form class="login" id="loginform" novalidate>
    <div class="lg"><span class="mk">${svg('grad')}</span> chensqy</div>
    <h1>Masuk Dasbor</h1><p class="s">Panel hasil kuis ${MATERI}</p>
    <label class="field"><span>Email</span><input id="email" type="email" autocomplete="username" placeholder="email@contoh.com" required></label>
    <label class="field"><span>Kata sandi</span><input id="pass" type="password" autocomplete="current-password" placeholder="••••••••" required></label>
    <button class="btn-primary" id="loginbtn" type="submit">Masuk</button><div class="formerr" id="loginerr"></div>
    ${!isConfigured()?'<div class="hintbox">⚠ Belum terhubung ke database. Lengkapi <b>config.js</b>.</div>':''}</form></div>`;
  $('#loginform').addEventListener('submit',async e=>{ e.preventDefault(); const email=$('#email').value.trim(),pass=$('#pass').value,er=$('#loginerr');er.textContent=''; if(!email||!pass){er.textContent='Isi email dan kata sandi.';return;} const b=$('#loginbtn');b.disabled=true;b.innerHTML='<span class="spin"></span>'; try{ await login(email,pass); renderApp(); }catch(err){ er.textContent=err.message; b.disabled=false; b.textContent='Masuk'; } }); }

// ================= APP SHELL =================
let ROWS=[],VIEW=[],SORT={key:'created_at',dir:-1},FILTER={q:'',kelas:'',sekolah:''};
let prevMaxId=null,unseen=0,pollTimer=null,autoOn=true,PAGE='beranda',TAB='ringkasan';
const NAV=[['beranda','Beranda','home'],['kuis','Kuis & Ujian','clipboard'],['siswa','Siswa','users'],['kelas','Kelas','grid'],['soal','Soal','book'],['hasil','Hasil & Nilai','chart'],['aktivitas','Aktivitas','activity'],['pengaturan','Pengaturan','settings']];

async function renderApp(){
  app.innerHTML=`
  <div class="shell">
    <aside class="sidebar" id="sidebar">
      <div class="sb-logo"><span class="mk">${svg('grad')}</span><div><b>chensqy</b><small>Dasbor Admin</small></div></div>
      <nav class="sb-nav" id="sbnav">${NAV.map(([id,l,ic])=>`<button class="navitem ${id==='beranda'?'on':''}" data-nav="${id}">${svg(ic)}<span>${l}</span><span class="cnt" data-cnt="${id}"></span></button>`).join('')}</nav>
      <div class="sb-promo"><div class="tr">${svg('trophy')}</div><b>Platform Evaluasi Modern</b><p>Kelola kuis & pantau kemajuan siswa dengan mudah dan efisien.</p></div>
    </aside>
    <div class="sb-backdrop" id="sbback"></div>
    <div class="main">
      <header class="topbar">
        <button class="hamb" id="hamb">${svg('menu')}</button>
        <span class="live" id="live"><span class="dot"></span>Live<span class="t" id="lasttime"></span></span>
        <div class="tb-sp"></div>
        <label class="switch hidesm" title="Auto-refresh"><input type="checkbox" id="autochk" ${autoOn?'checked':''}><span class="tr"></span></label>
        <button class="iconbtn" id="notifbtn" title="Notifikasi submit baru">${svg(notifEnabled?'bell':'belloff')}<span class="badge-n" id="notifbadge" style="display:none">0</span></button>
        <button class="iconbtn" id="refreshbtn" title="Muat ulang">${svg('refresh')}</button>
        <button class="iconbtn" id="themebtn" title="Mode terang/gelap">${svg(isLight()?'moon':'sun')}</button>
        ${MOCK?'':'<button class="pillbtn danger hidesm" id="logoutbtn">'+svg('logout')+'Keluar</button>'}
      </header>
      <div class="content" id="content"><div class="center-load"><span class="spin"></span>Memuat data…</div></div>
    </div>
  </div>`;
  const drawer=v=>{ $('#sidebar').classList.toggle('open',v); $('#sbback').classList.toggle('show',v); };
  $('#hamb').addEventListener('click',()=>drawer(!$('#sidebar').classList.contains('open')));
  $('#sbback').addEventListener('click',()=>drawer(false));
  $('#themebtn').addEventListener('click',toggleTheme);
  $('#refreshbtn').addEventListener('click',()=>refreshData(true));
  const lo=$('#logoutbtn'); if(lo) lo.addEventListener('click',logout);
  $('#autochk').addEventListener('change',e=>{ autoOn=e.target.checked; updateLive(); autoOn?startPoll():stopPoll(); });
  $('#notifbtn').addEventListener('click',toggleNotif);
  $$('.navitem').forEach(n=>n.addEventListener('click',()=>{ PAGE=n.dataset.nav; $$('.navitem').forEach(x=>x.classList.toggle('on',x===n)); drawer(false); renderPage(); }));

  try{ ROWS=await loadRows(); }catch(err){ $('#content').innerHTML=`<div class="card"><div class="empty">${svg('inbox')}<div>${esc(err.message)}</div></div></div>`; return; }
  prevMaxId=ROWS.reduce((m,r)=>Math.max(m,r.id||0),0);
  renderPage(); updateLive(); updateNavCounts();
  if(autoOn&&!MOCK) startPoll();
}
function updateNavCounts(){ const set=(id,v)=>{ const e=document.querySelector(`[data-cnt="${id}"]`); if(e) e.textContent=v; };
  set('siswa',new Set(ROWS.map(r=>(r.nama||'')+'|'+(r.kelas||''))).size); set('hasil',ROWS.length); set('aktivitas',ROWS.length); set('soal',QUESTIONS.length); set('kelas',new Set(ROWS.map(r=>r.kelas)).size||''); }

function renderPage(){ const c=$('#content'); if(!c) return;
  if(PAGE==='beranda') return paintBeranda(c);
  if(PAGE==='siswa') return paintList(c,'Daftar Siswa','Semua pengumpulan siswa');
  if(PAGE==='hasil') return paintHasil(c);
  if(PAGE==='kelas') return paintKelas(c);
  if(PAGE==='soal') return paintBank(c);
  if(PAGE==='aktivitas') return paintAktivitas(c);
  if(PAGE==='kuis') return paintKuis(c);
  if(PAGE==='pengaturan') return paintPengaturan(c);
}

function updateLive(){ const l=$('#live'),t=$('#lasttime'); if(!l)return; l.classList.toggle('off',!autoOn); if(t)t.textContent=' · '+new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); if(l.childNodes[1])l.childNodes[1].textContent=autoOn?'Live':'Jeda'; }

// ---- auto refresh (patch, tanpa glitch) ----
function startPoll(){ stopPoll(); pollTimer=setInterval(()=>refreshData(false),POLL_MS); }
function stopPoll(){ if(pollTimer){clearInterval(pollTimer);pollTimer=null;} }
async function refreshData(manual){ try{ const fresh=await loadRows(); const newRows=fresh.filter(r=>r.id>prevMaxId); ROWS=fresh; prevMaxId=fresh.reduce((m,r)=>Math.max(m,r.id||0),prevMaxId);
    const newIds=new Set(newRows.map(r=>r.id)); updateNavCounts();
    if(PAGE==='beranda' && $('#kpis')) patchBeranda(newIds); else if(manual) renderPage();
    updateLive(); if(newRows.length) notifyNew(newRows); else if(manual) toast('Data terbaru'); }catch(e){ if(manual) toast('Gagal memuat: '+e.message); } }
function notifyNew(newRows){ unseen+=newRows.length; const b=$('#notifbadge'); if(b){b.style.display='';b.textContent=unseen>99?'99+':unseen;} const f=newRows[0];
  toast(newRows.length===1?`<b>${esc(f.nama)}</b> (${esc(f.kelas)}) baru mengumpulkan — nilai <b>${f.nilai}</b>`:`<b>${newRows.length} jawaban baru</b> masuk (terbaru: ${esc(f.nama)})`); beep();
  desktopNotif('Jawaban kuis baru',newRows.length===1?`${f.nama} · ${f.kelas} · nilai ${f.nilai}`:`${newRows.length} siswa baru mengumpulkan`); }
async function toggleNotif(){ if(!notifEnabled){ if('Notification'in window){try{const p=await Notification.requestPermission();if(p!=='granted')toast('Izin notifikasi ditolak browser');}catch(e){}} notifEnabled=true; } else notifEnabled=false;
  try{localStorage.setItem(NOTIFKEY,notifEnabled?'1':'0')}catch(e){} const nb=$('#notifbtn'); if(nb){ nb.innerHTML=svg(notifEnabled?'bell':'belloff')+`<span class="badge-n" id="notifbadge" style="display:${unseen&&notifEnabled?'':'none'}">${unseen||0}</span>`; nb.addEventListener('click',toggleNotif,{once:true}); }
  toast(notifEnabled?'Notifikasi desktop aktif':'Notifikasi desktop nonaktif'); if(notifEnabled){unseen=0;const b=$('#notifbadge');if(b)b.style.display='none';} }

// ================= STATISTIK =================
function stats(rows){ const n=rows.length,arr=rows.map(r=>r.nilai);
  const avg=n?Math.round(arr.reduce((a,b)=>a+b,0)/n):0,max=n?Math.max(...arr):0,min=n?Math.min(...arr):0;
  const top=n?rows.reduce((a,b)=>b.nilai>a.nilai?b:a):null;
  const uniq=new Set(rows.map(r=>`${(r.nama||'').toLowerCase()}|${(r.kelas||'').toLowerCase()}`)).size;
  const lulus=n?Math.round(rows.filter(r=>r.nilai>=KKM).length/n*100):0;
  const buckets=[{l:'0–20',a:0,b:20},{l:'21–40',a:21,b:40},{l:'41–60',a:41,b:60},{l:'61–80',a:61,b:80},{l:'81–100',a:81,b:100}]; buckets.forEach(k=>k.c=rows.filter(r=>r.nilai>=k.a&&r.nilai<=k.b).length);
  const perQ=QUESTIONS.map((Q,qi)=>{let ok=0,tot=0;rows.forEach(r=>{const a=Array.isArray(r.jawaban)?r.jawaban[qi]:null;if(a!=null){tot++;if(a===Q.correct)ok++;}});return {qi,pct:tot?Math.round(ok/tot*100):0,tot};});
  const km={}; rows.forEach(r=>{const k=r.kelas||'—';(km[k]=km[k]||[]).push(r.nilai);});
  const perKelas=Object.entries(km).map(([k,v])=>({k,avg:Math.round(v.reduce((a,b)=>a+b,0)/v.length),n:v.length})).sort((a,b)=>b.avg-a.avg);
  return {n,avg,max,min,top,uniq,lulus,buckets,perQ,perKelas}; }
function trend(rows,fn){ const now=Date.now(),wk=6048e5; const cur=rows.filter(r=>now-+new Date(r.created_at)<wk),prev=rows.filter(r=>{const d=now-+new Date(r.created_at);return d>=wk&&d<2*wk;});
  const cv=fn(cur),pv=fn(prev); if(prev.length===0&&cur.length===0) return {dir:'flat',pct:0}; if(pv===0) return {dir:cv>0?'up':'flat',pct:cv>0?100:0,fresh:true}; const p=Math.round((cv-pv)/Math.abs(pv)*100); return {dir:p>0?'up':p<0?'down':'flat',pct:Math.abs(p)}; }
const tHtml=t=>{ const ar=t.dir==='up'?'↑':t.dir==='down'?'↓':'→'; return `<span class="trend ${t.dir}">${ar} ${t.fresh?'baru':t.pct+'%'} <span>vs mgg lalu</span></span>`; };

// ================= HELPER RENDER =================
const kelasColor=k=>{ let h=0; for(const ch of String(k||'')) h=(h*31+ch.charCodeAt(0))>>>0; return KCOL[h%KCOL.length]; };
const initials=n=>String(n||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';
const avatarColor=n=>{ let h=0; for(const ch of String(n||'')) h=(h*31+ch.charCodeAt(0))>>>0; return KCOL[h%KCOL.length]; };
const scoreColor=v=>v>=85?'var(--green)':v>=70?'var(--blue)':v>=55?'var(--orange)':'var(--red)';
const scoreStyle=v=>`background:color-mix(in srgb,${scoreColor(v)} 16%,transparent);color:${scoreColor(v)}`;
function fmtDate(s){ try{const d=new Date(s);return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});}catch(e){return s;} }
function relTime(s){ const d=(Date.now()-+new Date(s))/1000; if(d<60)return'baru saja'; if(d<3600)return Math.floor(d/60)+' menit lalu'; if(d<86400)return Math.floor(d/3600)+' jam lalu'; return fmtDate(s); }
function head(title,sub,tools=''){ return `<div class="pagehead reveal"><div><h1>${title} <span class="spk">${svg('spark','ic')}</span></h1><p>${sub}</p></div><div class="headtools">${tools}</div></div>`; }
function kpi(a,icon,lab,val,extra,foot,tr,hi){ return `<div class="kpi" style="--a:${a}"><div class="top"><div class="lab">${lab}</div><div class="icn">${svg(icon)}</div></div>
  <div class="num tnum"><span data-count="${val}">0</span>${extra||''}</div><div class="foot"><span class="fl">${foot}</span>${hi?`<span class="hi">${esc(hi)}</span>`:(tr?tHtml(tr):'')}</div></div>`; }
function chartHtml(S){ const mx=Math.max(1,...S.buckets.map(b=>b.c)),ymax=Math.ceil(mx/10)*10||10;
  const gl=[0,.25,.5,.75,1].map(f=>`<div class="gl" style="bottom:${22+f*(200-28)}px"></div>`).join('');
  const yl=[1,.66,.33,0].map(f=>`<div>${Math.round(ymax*f)}</div>`).join('');
  return `<div class="chartbox"><div class="yaxis">${yl}</div><div class="chart">${gl}${S.buckets.map(b=>`<div class="bar"><div class="n tnum">${b.c}</div><div class="col" data-h="${Math.round(b.c/ymax*100)}" style="height:0"></div><div class="lbl">${b.l}</div></div>`).join('')}</div></div>`; }
function perKelasHtml(S){ return S.perKelas.length?S.perKelas.map(k=>`<div class="hbar"><div class="k">${esc(k.k)}</div><div class="m"><i data-w="${k.avg}" style="width:0;background:${kelasColor(k.k)}"></i></div><div class="v tnum">${k.avg}<small> /100</small></div></div>`).join(''):'<div class="muted" style="font-size:13px">Belum ada data.</div>'; }
function soalTersulitHtml(S){ const h=[...S.perQ].filter(q=>q.tot>0).sort((a,b)=>a.pct-b.pct).slice(0,4); const pc=p=>p<40?'var(--red)':p<60?'var(--orange)':'var(--green)';
  return h.length?h.map(q=>`<div class="srow"><div class="st">Soal ${q.qi+1} · ${esc(QUESTIONS[q.qi].t)}</div><div class="sm"><i style="width:${q.pct}%;background:${pc(q.pct)}"></i></div><span class="pct" style="${scoreStyle(q.pct)}">${q.pct}%</span></div>`).join(''):'<div class="muted" style="font-size:13px">Belum ada data.</div>'; }
function feedHtml(rows,newIds){ const rec=[...rows].sort((a,b)=>+new Date(b.created_at)-+new Date(a.created_at)).slice(0,6);
  return rec.length?rec.map(r=>`<div class="fitem ${newIds&&newIds.has(r.id)?'new':''}"><div class="av" style="background:${avatarColor(r.nama)}">${initials(r.nama)}</div><div class="fm"><b>${esc(r.nama)}</b><span>${esc(r.kelas)} · ${MATERI}</span></div><div class="fr">${relTime(r.created_at)} <span class="ok">${svg('check','ic')}</span></div></div>`).join(''):`<div class="empty" style="padding:20px">${svg('inbox')}<div>Belum ada pengumpulan.</div></div>`; }
function rowsHtml(list,newIds){ return list.map((r,i)=>`<tr data-id="${r.id}" class="${newIds&&newIds.has(r.id)?'new':''}">
  <td><div class="tname"><div class="av" style="background:${avatarColor(r.nama)}">${initials(r.nama)}</div><span class="nm" style="font-weight:600">${esc(r.nama)}</span></div></td>
  <td><span class="badge">${esc(r.kelas)}</span></td><td class="muted">${esc(r.sekolah)}</td><td><span class="score tnum" style="${scoreStyle(r.nilai)}">${r.nilai}</span></td>
  <td class="tnum">${r.benar} / ${r.jumlah_soal||20}</td><td class="muted tnum">${relTime(r.created_at)}</td><td><button class="dots">${svg('dots')}</button></td></tr>`).join(''); }
function tableShell(S){ const kOpts=[...new Set(ROWS.map(r=>r.kelas).filter(Boolean))].sort(),sOpts=[...new Set(ROWS.map(r=>r.sekolah).filter(Boolean))].sort();
  return `<div class="toolbar"><div class="search">${svg('search')}<input id="q" type="search" placeholder="Cari nama, kelas, atau sekolah…" value="${esc(FILTER.q)}"></div>
    <select class="miniselect" id="fkelas"><option value="">Semua Kelas</option>${kOpts.map(k=>`<option ${FILTER.kelas===k?'selected':''}>${esc(k)}</option>`).join('')}</select>
    <select class="miniselect" id="fsekolah"><option value="">Semua Sekolah</option>${sOpts.map(k=>`<option ${FILTER.sekolah===k?'selected':''}>${esc(k)}</option>`).join('')}</select></div>
    <div class="tablewrap"><table><thead><tr>${th('nama','Nama Siswa')}${th('kelas','Kelas')}${th('sekolah','Sekolah')}${th('nilai','Nilai')}${th('benar','Benar')}${th('created_at','Waktu')}<th>Aksi</th></tr></thead><tbody id="tbody"></tbody></table></div>`; }
function th(k,l){ const a=SORT.key===k; return `<th data-key="${k}" class="${a?'active':''}">${l} <span class="sar">${a?(SORT.dir>0?'▲':'▼'):'↕'}</span></th>`; }

// ================= HALAMAN: BERANDA =================
function paintBeranda(c){ TAB='ringkasan'; const S=stats(ROWS);
  const tools=`<div class="tabs"><button class="tab on" data-tab="ringkasan">${svg('grid')}Ringkasan</button><button class="tab" data-tab="bank">${svg('book')}Bank Soal</button></div><button class="pillbtn" id="csvbtn">${svg('down')}Ekspor CSV</button>`;
  c.innerHTML=head('Hasil Kuis Siswa','Pantau performa dan perkembangan siswa secara real-time',tools)+`<div id="pagebody">${berandaBody(S,new Set())}</div>`;
  wireHead(c);
  $$('.tab',c).forEach(t=>t.addEventListener('click',()=>{ TAB=t.dataset.tab; $$('.tab',c).forEach(x=>x.classList.toggle('on',x===t)); const pb=$('#pagebody'); if(TAB==='bank'){ pb.innerHTML=bankBody(); } else { pb.innerHTML=berandaBody(stats(ROWS),new Set()); wireBeranda(); } }));
  wireBeranda();
}
function berandaBody(S,newIds){ return `
  <div class="kpis" id="kpis">
    ${kpi('var(--blue)','users','Total Kiriman',S.n,'','jawaban masuk',trend(ROWS,r=>r.length))}
    ${kpi('var(--purple)','file','Siswa Unik',S.uniq,'','nama berbeda',trend(ROWS,r=>new Set(r.map(x=>x.nama+'|'+x.kelas)).size))}
    ${kpi('var(--green)','avg','Rata-rata Nilai',S.avg,'<small> /100</small>','dari 100',trend(ROWS,r=>r.length?Math.round(r.reduce((a,b)=>a+b.nilai,0)/r.length):0))}
    ${kpi('var(--orange)','grad','Kelulusan',S.lulus,'<small>%</small>','nilai ≥ '+KKM,trend(ROWS,r=>r.length?Math.round(r.filter(x=>x.nilai>=KKM).length/r.length*100):0))}
    ${kpi('var(--red)','trophy','Tertinggi',S.max,'','nilai tertinggi',null,S.top?S.top.nama.split(' ')[0]+' '+(S.top.nama.split(' ')[1]||'').charAt(0)+'.':'')}
  </div>
  <div class="grid2">
    <div class="card reveal"><div class="card-h"><div class="ti"><div class="ci">${svg('chart')}</div><div><h2>Sebaran Nilai</h2><p class="csub">Jumlah siswa per rentang nilai</p></div></div></div><div id="chart">${chartHtml(S)}</div></div>
    <div class="card reveal d1"><div class="card-h"><div class="ti"><div class="ci">${svg('layers')}</div><div><h2>Rata-rata per Kelas</h2><p class="csub">Nilai rata-rata tiap kelas</p></div></div></div><div class="hbars" id="perkelas">${perKelasHtml(S)}</div></div>
  </div>
  <div class="grid2b">
    <div class="card reveal"><div class="card-h"><div class="ti"><div class="ci">${svg('target')}</div><div><h2>Soal Tersulit</h2><p class="csub">Persentase siswa menjawab benar</p></div></div></div><div class="slist" id="soaltersulit">${soalTersulitHtml(S)}</div></div>
    <div class="card reveal d1"><div class="card-h"><div class="ti"><div class="ci">${svg('activity')}</div><div><h2>Aktivitas Terbaru</h2><p class="csub">Pengumpulan paling baru</p></div></div><button class="pillbtn" data-goto="aktivitas" style="height:32px;font-size:12px">Lihat Semua</button></div><div class="feed" id="feed">${feedHtml(ROWS,newIds)}</div></div>
  </div>
  <div class="card reveal"><div class="card-h"><div class="ti"><div class="ci">${svg('users')}</div><div><h2>Daftar Siswa <span class="muted" style="font-weight:600;font-size:13px" id="siswacount">${VIEWlen()}</span></h2><p class="csub">Klik baris untuk detail jawaban</p></div></div><button class="pillbtn" data-goto="siswa" style="height:32px;font-size:12px">Lihat Semua</button></div>
    ${tableShell(S)}</div>`; }
function VIEWlen(){ applyFilterSort(); return VIEW.length+' siswa'; }

function wireBeranda(){ applyFilterSort(); const tb=$('#tbody'); if(tb){ tb.innerHTML=rowsHtml(VIEW.slice(0,6),new Set()); wireRows(tb); }
  animateBars(); countAll();
  wireFilters(()=>{ const tb=$('#tbody'); if(tb){tb.innerHTML=rowsHtml(VIEW.slice(0,6),new Set());wireRows(tb);} const sc=$('#siswacount'); if(sc)sc.textContent=VIEW.length+' siswa'; });
  $$('[data-goto]').forEach(b=>b.addEventListener('click',()=>gotoPage(b.dataset.goto)));
}
function patchBeranda(newIds){ const S=stats(ROWS);
  // KPI numbers (count-up dari nilai lama)
  const kv=$('#kpis'); if(kv){ const nums=[S.n,S.uniq,S.avg,S.lulus,S.max]; $$('.kpi .num span',kv).forEach((sp,i)=>countTo(sp,nums[i])); }
  const ch=$('#chart'); if(ch){ ch.innerHTML=chartHtml(S); }
  const pk=$('#perkelas'); if(pk) pk.innerHTML=perKelasHtml(S);
  const st=$('#soaltersulit'); if(st) st.innerHTML=soalTersulitHtml(S);
  const fd=$('#feed'); if(fd) fd.innerHTML=feedHtml(ROWS,newIds);
  applyFilterSort(); const tb=$('#tbody'); if(tb){ tb.innerHTML=rowsHtml(VIEW.slice(0,6),newIds); wireRows(tb); }
  const sc=$('#siswacount'); if(sc) sc.textContent=VIEW.length+' siswa';
  animateBars();
}

// ================= HALAMAN: SISWA / HASIL =================
function paintList(c,title,sub){ const S=stats(ROWS);
  c.innerHTML=head(title,sub,`<button class="pillbtn" id="csvbtn">${svg('down')}Ekspor CSV</button>`)+`<div class="card reveal">${tableShell(S)}</div>`;
  wireHead(c); applyFilterSort(); const tb=$('#tbody'); tb.innerHTML=VIEW.length?rowsHtml(VIEW,new Set()):''; if(!VIEW.length) $('.tablewrap',c).insertAdjacentHTML('afterend',`<div class="empty">${svg('inbox')}<div>Belum ada data.</div></div>`); wireRows(tb);
  wireFilters(()=>{ const tb=$('#tbody'); if(tb){tb.innerHTML=rowsHtml(VIEW,new Set());wireRows(tb);} });
}
function paintHasil(c){ const S=stats(ROWS); const ranked=[...ROWS].sort((a,b)=>b.nilai-a.nilai);
  const podium=ranked.slice(0,3).map((r,i)=>`<div class="klas" style="text-align:center;border-color:${[KCOL[3],'var(--line)',KCOL[4]][i]}"><div style="font-size:26px">${['🥇','🥈','🥉'][i]}</div><b style="display:block;margin-top:6px">${esc(r.nama)}</b><span class="muted" style="font-size:12px">${esc(r.kelas)}</span><div class="score tnum" style="${scoreStyle(r.nilai)};margin-top:8px;font-size:18px">${r.nilai}</div></div>`).join('');
  c.innerHTML=head('Hasil & Nilai','Peringkat nilai siswa dari tertinggi',`<button class="pillbtn" id="csvbtn">${svg('down')}Ekspor CSV</button>`)+
    (ranked.length?`<div class="klasgrid reveal" style="margin-bottom:15px">${podium}</div>`:'')+`<div class="card reveal">${tableShell(S)}</div>`;
  wireHead(c); SORT={key:'nilai',dir:-1}; applyFilterSort(); const tb=$('#tbody'); tb.innerHTML=VIEW.length?rowsHtml(VIEW,new Set()):''; wireRows(tb); wireFilters(()=>{const tb=$('#tbody');if(tb){tb.innerHTML=rowsHtml(VIEW,new Set());wireRows(tb);}});
}

// ================= HALAMAN: KELAS =================
function paintKelas(c){ const S=stats(ROWS);
  const cards=S.perKelas.length?S.perKelas.map(k=>{ const rows=ROWS.filter(r=>r.kelas===k.k); const lulus=Math.round(rows.filter(r=>r.nilai>=KKM).length/rows.length*100); const mx=Math.max(...rows.map(r=>r.nilai));
    return `<div class="klas reveal"><div class="kn"><span class="kd" style="background:${kelasColor(k.k)}"></span>${esc(k.k)}</div><div class="hbar" style="margin-top:12px"><div class="m"><i style="width:${k.avg}%;background:${kelasColor(k.k)}"></i></div><div class="v tnum">${k.avg}<small>/100</small></div></div>
      <div class="kstat"><div><b class="tnum">${k.n}</b><span>siswa</span></div><div><b class="tnum">${lulus}%</b><span>lulus</span></div><div><b class="tnum">${mx}</b><span>tertinggi</span></div></div></div>`; }).join(''):`<div class="card"><div class="empty">${svg('inbox')}<div>Belum ada data kelas.</div></div></div>`;
  c.innerHTML=head('Kelas','Ringkasan performa tiap kelas')+`<div class="klasgrid">${cards}</div>`; wireHead(c);
}

// ================= HALAMAN: BANK SOAL =================
function bankBody(){ return `<div class="bankhead">20 soal kuis beserta <b style="color:var(--green)">kunci jawaban</b> dan alasannya — sumber tunggal materi. Sama persis dengan yang dikerjakan siswa.</div>
  <div class="bank">${QUESTIONS.map((Q,i)=>`<div class="qbank reveal"><span class="qb-n">Soal ${i+1} · ${esc(Q.t)}</span><div class="qb-q">${esc(Q.q)}</div>${Q.fig?`<div class="qb-fig">${FIG[Q.fig]}</div>`:''}
    <ul class="qb-opts">${Q.opts.map((o,k)=>`<li class="${k===Q.correct?'correct':''}"><b>${LETTERS[k]}</b> ${esc(o)}${k===Q.correct?' <em>✓ Kunci</em>':''}</li>`).join('')}</ul>
    <div class="qb-why"><b>Mengapa ${LETTERS[Q.correct]} benar:</b> ${esc(Q.pembahasan)}</div></div>`).join('')}</div>`; }
function paintBank(c){ c.innerHTML=head('Bank Soal','Semua soal, kunci jawaban, dan alasannya')+bankBody(); wireHead(c); }

// ================= HALAMAN: AKTIVITAS =================
function paintAktivitas(c){ const rec=[...ROWS].sort((a,b)=>+new Date(b.created_at)-+new Date(a.created_at));
  c.innerHTML=head('Aktivitas','Log pengumpulan jawaban (terbaru di atas)')+`<div class="card reveal"><div class="feed">${rec.length?rec.map(r=>`<div class="fitem" data-id="${r.id}" style="cursor:pointer"><div class="av" style="background:${avatarColor(r.nama)}">${initials(r.nama)}</div><div class="fm"><b>${esc(r.nama)}</b><span>${esc(r.kelas)} · ${esc(r.sekolah)} · ${MATERI}</span></div><div class="fr"><span class="score tnum" style="${scoreStyle(r.nilai)}">${r.nilai}</span> ${relTime(r.created_at)} <span class="ok">${svg('check','ic')}</span></div></div>`).join(''):`<div class="empty">${svg('inbox')}<div>Belum ada aktivitas.</div></div>`}</div></div>`;
  wireHead(c); $$('.fitem[data-id]').forEach(f=>f.addEventListener('click',()=>{ const r=ROWS.find(x=>x.id==f.dataset.id); if(r) openDetail(r); }));
}

// ================= HALAMAN: KUIS =================
function paintKuis(c){ c.innerHTML=head('Kuis & Ujian','Informasi kuis yang aktif')+`
  <div class="klasgrid"><div class="klas reveal" style="grid-column:1/-1"><div class="kn"><span class="kd" style="background:var(--blue)"></span>${MATERI}</div>
    <p class="csub" style="margin-top:6px">Kuis pilihan ganda untuk mata pelajaran IPA Fisika.</p>
    <div class="kstat" style="margin-top:16px"><div><b>20</b><span>soal</span></div><div><b>5</b><span>poin/soal</span></div><div><b>100</b><span>nilai maks</span></div><div><b>${KKM}</b><span>KKM</span></div></div>
    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap"><a class="pillbtn solid" href="/kuis/" target="_blank">${svg('clipboard')} Buka halaman kuis</a><button class="pillbtn" data-goto="soal">${svg('book')} Lihat Bank Soal</button></div></div></div>`;
  wireHead(c); }

// ================= HALAMAN: PENGATURAN =================
function paintPengaturan(c){ const sess=getSession();
  c.innerHTML=head('Pengaturan','Konfigurasi dasbor & akun')+`
  <div class="card reveal" style="max-width:640px">
    <div class="setrow"><div class="sl"><b>Batas kelulusan (KKM)</b><p>Nilai minimum agar dianggap lulus</p></div><input class="numin" id="setkkm" type="number" min="0" max="100" value="${KKM}"></div>
    <div class="setrow"><div class="sl"><b>Auto-refresh</b><p>Perbarui data otomatis tiap 12 detik</p></div><label class="switch"><input type="checkbox" id="setauto" ${autoOn?'checked':''}><span class="tr"></span></label></div>
    <div class="setrow"><div class="sl"><b>Notifikasi desktop</b><p>Pemberitahuan saat ada submit baru</p></div><label class="switch"><input type="checkbox" id="setnotif" ${notifEnabled?'checked':''}><span class="tr"></span></label></div>
    <div class="setrow"><div class="sl"><b>Mode tampilan</b><p>Terang (langit) atau gelap (galaxy)</p></div><button class="pillbtn" id="setthemebtn">${svg(isLight()?'sun':'moon')} ${isLight()?'Terang':'Gelap'}</button></div>
    <div class="setrow"><div class="sl"><b>Akun admin</b><p>${esc(sess?sess.email:'—')}</p></div>${MOCK?'':`<button class="pillbtn danger" id="setlogout">${svg('logout')} Keluar</button>`}</div>
  </div>`;
  wireHead(c);
  $('#setkkm').addEventListener('change',e=>{ const v=Math.max(0,Math.min(100,parseInt(e.target.value)||70)); KKM=v; try{localStorage.setItem(KKMKEY,v)}catch(err){} toast('KKM diperbarui: '+v); });
  $('#setauto').addEventListener('change',e=>{ autoOn=e.target.checked; const a=$('#autochk'); if(a)a.checked=autoOn; updateLive(); autoOn?startPoll():stopPoll(); });
  $('#setnotif').addEventListener('change',toggleNotif);
  $('#setthemebtn').addEventListener('click',()=>{ toggleTheme(); paintPengaturan(c); });
  const sl=$('#setlogout'); if(sl) sl.addEventListener('click',logout);
}

// ================= WIRING BERSAMA =================
function gotoPage(id){ PAGE=id; $$('.navitem').forEach(x=>x.classList.toggle('on',x.dataset.nav===id)); renderPage(); }
function wireHead(c){ const csv=$('#csvbtn',c); if(csv) csv.addEventListener('click',exportCSV); }
function wireFilters(after){ const q=$('#q'); if(q) q.addEventListener('input',debounce(e=>{ FILTER.q=e.target.value; applyFilterSort(); after(); },170));
  const fk=$('#fkelas'); if(fk) fk.addEventListener('change',e=>{ FILTER.kelas=e.target.value; applyFilterSort(); after(); });
  const fs=$('#fsekolah'); if(fs) fs.addEventListener('change',e=>{ FILTER.sekolah=e.target.value; applyFilterSort(); after(); });
  $$('th[data-key]').forEach(h=>h.addEventListener('click',()=>{ const k=h.dataset.key; if(SORT.key===k)SORT.dir*=-1; else{SORT.key=k;SORT.dir=1;} applyFilterSort(); renderPage(); })); }
function wireRows(tb){ tb.querySelectorAll('tr').forEach(tr=>tr.addEventListener('click',()=>{ const r=ROWS.find(x=>x.id==tr.dataset.id); if(r) openDetail(r); })); }
function applyFilterSort(){ const q=FILTER.q.trim().toLowerCase(); VIEW=ROWS.filter(r=>{ if(FILTER.kelas&&r.kelas!==FILTER.kelas)return false; if(FILTER.sekolah&&r.sekolah!==FILTER.sekolah)return false; if(q&&!`${r.nama} ${r.kelas} ${r.sekolah}`.toLowerCase().includes(q))return false; return true; });
  const {key,dir}=SORT; VIEW.sort((a,b)=>{ let x=a[key],y=b[key]; if(key==='created_at'){x=+new Date(x);y=+new Date(y);} if(typeof x==='string'){x=x.toLowerCase();y=(y||'').toLowerCase();} return x<y?-dir:x>y?dir:0; }); }
function animateBars(){ requestAnimationFrame(()=>requestAnimationFrame(()=>{ $$('.col').forEach(c=>c.style.height=c.dataset.h+'%'); $$('.hbar i[data-w]').forEach(m=>m.style.width=m.dataset.w+'%'); })); }
function countAll(){ requestAnimationFrame(()=>$$('[data-count]').forEach(n=>countTo(n,parseInt(n.dataset.count)||0,true))); }
function countTo(node,target,fromZero){ const start=fromZero?0:(parseInt(node.textContent.replace(/\D/g,''))||0); if(start===target){node.textContent=target;return;} const dur=650,t0=performance.now(); const step=t=>{ const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3); node.textContent=Math.round(start+(target-start)*e); if(k<1)requestAnimationFrame(step); }; requestAnimationFrame(step); }
function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }

// ---- detail modal ----
function openDetail(r){ const jw=Array.isArray(r.jawaban)?r.jawaban:[]; const grade=r.nilai>=85?'Sangat Baik':r.nilai>=70?'Baik':r.nilai>=55?'Cukup':'Perlu Belajar Lagi';
  const items=QUESTIONS.map((Q,i)=>{ const ua=jw[i],ok=ua===Q.correct; const opts=Q.opts.map((o,k)=>{ const cls=k===Q.correct?'c':(k===ua?'w':''); const tag=k===Q.correct?' <em>(kunci)</em>':(k===ua&&!ok?' <em>(jawaban)</em>':''); return `<li class="${cls}"><b>${LETTERS[k]}</b> ${esc(o)}${tag}</li>`; }).join('');
    return `<div class="mitem ${ok?'ok':'no'}"><div class="mq"><span class="mmark">${ok?'✓':'✕'}</span><span><b>${i+1}.</b> ${esc(Q.q)}</span></div>${Q.fig?`<div class="qb-fig" style="margin:9px 0 0">${FIG[Q.fig]}</div>`:''}<ul class="mopts">${opts}</ul><div class="mnote"><b>Pembahasan:</b> ${esc(Q.pembahasan)}</div></div>`; }).join('');
  const ov=el('div','overlay'); ov.innerHTML=`<div class="modal" role="dialog" aria-modal="true"><div class="modal-h"><div><div class="who">${esc(r.nama)}</div><div class="meta">${esc(r.kelas)} · ${esc(r.sekolah)} · ${fmtDate(r.created_at)}${r.durasi_detik?` · ${Math.floor(r.durasi_detik/60)}m ${r.durasi_detik%60}s`:''}</div><div class="modal-scoreline"><span class="score tnum" style="${scoreStyle(r.nilai)};min-width:56px;font-size:18px">${r.nilai}</span><span class="muted">${grade} · benar ${r.benar}/${r.jumlah_soal||20}</span></div></div><button class="iconbtn" id="mclose">${svg('x')}</button></div><div class="modal-body">${items}</div></div>`;
  document.body.appendChild(ov); const close=()=>ov.remove(); ov.addEventListener('click',e=>{ if(e.target===ov)close(); }); $('#mclose',ov).addEventListener('click',close);
  document.addEventListener('keydown',function h(e){ if(e.key==='Escape'){close();document.removeEventListener('keydown',h);} }); }

// ---- CSV ----
function exportCSV(){ const rows=VIEW.length?VIEW:ROWS; if(!rows.length){ toast('Belum ada data'); return; }
  const H=['Nama','Kelas','Sekolah','Nilai','Benar','Salah','Waktu','Durasi (detik)'],q=v=>`"${String(v==null?'':v).replace(/"/g,'""')}"`;
  const lines=[H.join(',')].concat(rows.map(r=>[r.nama,r.kelas,r.sekolah,r.nilai,r.benar,r.salah,fmtDate(r.created_at),r.durasi_detik].map(q).join(',')));
  const a=el('a'); a.href=URL.createObjectURL(new Blob(['﻿'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'})); a.download=`hasil-kuis-${new Date().toISOString().slice(0,10)}.csv`; a.click(); toast(`${rows.length} baris diekspor`); }

// ================= BOOT =================
if(MOCK){ window.__test={ inject:(o={})=>{ const id=mockStore.reduce((m,r)=>Math.max(m,r.id||0),0)+1; const bn=o.benar!=null?o.benar:17;
  mockStore.unshift({id,created_at:new Date().toISOString(),nama:o.nama||'Siti Aisyah',kelas:o.kelas||'Kelas 10A',sekolah:o.sekolah||'SMA Negeri 1 Jakarta',jawaban:QUESTIONS.map((Q,qi)=>qi<bn?Q.correct:(Q.correct+1)%4),benar:bn,salah:20-bn,nilai:bn*5,jumlah_soal:20,durasi_detik:231}); return refreshData(false); } }; }
startBg();
if(MOCK) renderApp(); else if(getSession()) renderApp(); else renderLogin();
