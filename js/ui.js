// Helper UI bersama untuk penampil 3D (viewer.js) & AR (ar.js).

export function el(tag, cls) { const n = document.createElement(tag); if (cls) n.className = cls; return n; }

export const ICONS = {
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  play:  '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  reset: '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>',
  tag:   '<svg viewBox="0 0 24 24"><path d="M4 4h9l7 7-9 9-7-7V4z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.6"/></svg>',
  moon:  '<svg viewBox="0 0 24 24"><path d="M20 14a8 8 0 1 1-10-10 8 8 0 0 0 10 10z"/></svg>',
  sun:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><g stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></g></svg>',
  full:  '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  ar:    '<svg viewBox="0 0 24 24"><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8.2 15.5 10v4L12 15.8 8.5 14v-4L12 8.2z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  camera:'<svg viewBox="0 0 24 24"><path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="13" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  back:  '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

export function setIcon(btn, icon) { btn.dataset.icon = icon; btn.innerHTML = ICONS[icon] || ''; }

export function toolBtn(icon, title) {
  const b = el('button', 'v-btn'); b.type = 'button'; b.title = title;
  b.setAttribute('aria-label', title); setIcon(b, icon); return b;
}

export function buildLabelEl(L) {
  const c = L.color || '#12386e';
  const dx = L.dx != null ? L.dx : 96;
  const dy = L.dy != null ? L.dy : -14;
  const wrap = el('div', 'lbl3d');
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'lbl-lead'); svg.setAttribute('overflow', 'visible');
  svg.setAttribute('width', '1'); svg.setAttribute('height', '1');
  const line = document.createElementNS(ns, 'line');
  line.setAttribute('x1', 0); line.setAttribute('y1', 0);
  line.setAttribute('x2', dx); line.setAttribute('y2', dy);
  line.setAttribute('stroke', c); line.setAttribute('stroke-width', '1.6');
  const dot = document.createElementNS(ns, 'circle');
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

// Panel keterangan (deskripsi + legenda + rumus). cfg = MATERI[slug].
export function buildPanel(cfg) {
  const p = el('div', 'v-panel');
  const head = el('button', 'v-panel-head'); head.type = 'button';
  head.innerHTML = '<span class="v-panel-title">Keterangan</span><span class="v-caret">▾</span>';
  const body = el('div', 'v-panel-body');

  if (cfg.description) { const d = el('p', 'v-desc'); d.innerHTML = cfg.description; body.appendChild(d); }

  if (cfg.legend && cfg.legend.length) {
    const list = el('ul', 'v-legend');
    cfg.legend.forEach((row) => {
      const li = el('li', 'v-legrow');
      const mk = el('span', 'v-mark ' + (row.type ? 'mk-' + row.type : ''));
      if (row.color) mk.style.setProperty('--c', row.color);
      const tx = el('span', 'v-legtext');
      tx.innerHTML = '<b style="color:' + (row.color || 'inherit') + '">' + row.term + '</b> — ' + row.desc;
      li.append(mk, tx); list.appendChild(li);
    });
    body.appendChild(list);
  }

  if (cfg.formula) {
    const f = el('div', 'v-formula');
    f.innerHTML = (cfg.formula.title ? '<div class="v-formula-h">' + cfg.formula.title + '</div>' : '')
      + (cfg.formula.eqs || []).map((e) => '<div class="v-eq">' + e + '</div>').join('')
      + (cfg.formula.note ? '<div class="v-formula-n">' + cfg.formula.note + '</div>' : '');
    body.appendChild(f);
  }

  p.append(head, body);
  head.addEventListener('click', () => p.classList.toggle('is-collapsed'));
  return p;
}
