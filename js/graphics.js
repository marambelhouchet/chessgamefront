/* ══════════════════ UNIT IMAGE PATHS ══════════════════ */
const UNIT_IMG_P1 = { S: 'assets/soldier_p1.png', C: 'assets/cavalry_p1.png', T: 'assets/tank_p1.png' };
const UNIT_IMG_P2 = { S: 'assets/soldier_p2.png', C: 'assets/cavalry_p2.png', T: 'assets/tank_p2.png' };

/* ══════════════════ INJECT ANIMATION CSS ══════════════════ */
(function injectAnimCSS() {
  const s = document.createElement('style');
  s.textContent = `
/* ── Piece wrapper ── */
.piece-3d img { width:100%; height:100%; object-fit:contain; display:block }
.piece-3d {
  width:calc(var(--cell) - 6px); height:calc(var(--cell) - 6px);
  display:flex; align-items:center; justify-content:center;
  position:relative; pointer-events:none;
  transform-style:preserve-3d;
}
/* ── Idle float ── */
@keyframes float-p1 { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-3px) rotate(1deg)} }
@keyframes float-p2 { 0%,100%{transform:translateY(0) rotate(1deg)}  50%{transform:translateY(-3px) rotate(-1deg)} }
.piece-3d.p1 { animation:float-p1 2.8s ease-in-out infinite; }
.piece-3d.p2 { animation:float-p2 3.2s ease-in-out infinite; }
/* ── Move ── */
@keyframes piece-move {
  0%  { transform:translateY(0) scale(1) }
  30% { transform:translateY(-8px) scale(1.15) }
  60% { transform:translateY(-4px) scale(1.08) }
  100%{ transform:translateY(0) scale(1) }
}
.piece-3d.anim-move { animation:piece-move 0.4s ease-out forwards!important; }
/* ── Attack ── */
@keyframes piece-attack {
  0%  { transform:scale(1) rotate(0deg) }
  25% { transform:scale(1.3) rotate(-8deg) }
  50% { transform:scale(1.4) rotate(6deg) }
  75% { transform:scale(1.2) rotate(-4deg) }
  100%{ transform:scale(1) rotate(0deg) }
}
.piece-3d.anim-attack { animation:piece-attack 0.5s ease-out forwards!important; }
/* ── Death ── */
@keyframes piece-die {
  0%  { transform:scale(1) rotate(0); opacity:1; filter:brightness(1) }
  20% { transform:scale(1.6) rotate(15deg); opacity:1; filter:brightness(3) saturate(3) }
  50% { transform:scale(0.8) rotate(-20deg); opacity:0.6; filter:brightness(2) blur(1px) }
  100%{ transform:scale(0) rotate(45deg); opacity:0; filter:blur(4px) }
}
.piece-3d.anim-die { animation:piece-die 0.6s ease-in forwards!important; }
/* ── Buff glow ── */
@keyframes buff-glow {
  0%,100% { filter:drop-shadow(0 0 4px gold) brightness(1.1) }
  50%     { filter:drop-shadow(0 0 12px gold) brightness(1.4) }
}
.piece-3d.buffed { animation:buff-glow 1.4s ease-in-out infinite!important; }
/* ── Spark particle ── */
@keyframes spark-fly {
  to { transform:translate(var(--tx),var(--ty)) scale(0); opacity:0 }
}
.spark {
  position:fixed; border-radius:50%; pointer-events:none; z-index:9999;
  animation:spark-fly 0.6s ease-out forwards;
}
/* ── Kill banner ── */
@keyframes kill-banner-in {
  0%  { opacity:0; transform:translate(-50%,-50%) scale(0.7) }
  20% { opacity:1; transform:translate(-50%,-50%) scale(1.1) }
  80% { opacity:1; transform:translate(-50%,-50%) scale(1) }
  100%{ opacity:0; transform:translate(-50%,-50%) scale(0.9) }
}
.kill-banner {
  position:fixed; top:40%; left:50%; transform:translate(-50%,-50%);
  font-family:'Cinzel',serif; font-size:1.8rem; font-weight:700;
  color:#fff; text-shadow:0 0 24px #e8588a, 0 0 48px #e8588a;
  pointer-events:none; z-index:10000;
  animation:kill-banner-in 1.5s ease-out forwards;
}
/* ── Board shake ── */
@keyframes board-shake {
  0%,100%{ transform:translate(0,0) }
  20%    { transform:translate(-4px,2px) }
  40%    { transform:translate(4px,-2px) }
  60%    { transform:translate(-3px,3px) }
  80%    { transform:translate(3px,-1px) }
}
#board.board-shake { animation:board-shake 0.38s ease-out; }
/* ── Cell flash ── */
@keyframes cell-flash {
  0%,100%{ background-color:transparent }
  50%    { background-color:rgba(244,162,97,0.35) }
}
.cell-flash { animation:cell-flash 0.4s ease-out; }
`;
  document.head.appendChild(s);
})();

/* ══════════════════ FX LAYER ══════════════════ */
(function() {
  const d = document.createElement('div');
  d.id = 'fx-layer';
  document.body.appendChild(d);
})();

/* ══════════════════ PIECE SVG / PNG ══════════════════ */
function pieceSVG(unit, player, opts = {}) {
  const cls    = `piece-3d p${player} ${unit}-unit${opts.buffed ? ' buffed' : ''}`;
  const size   = `width:calc(var(--cell) - 4px);height:calc(var(--cell) - 4px)`;
  const tint1  = 'drop-shadow(0 0 5px #ff4488) drop-shadow(0 0 2px #e8588a)';
  const tint2  = 'drop-shadow(0 0 5px #9040ff) drop-shadow(0 0 2px #8040c8)';
  const tint   = player === 1 ? tint1 : tint2;
  const buffGlow = opts.buffed ? ' drop-shadow(0 0 7px gold)' : '';
  const filter = tint + buffGlow;
  const src    = player === 1 ? UNIT_IMG_P1[unit] : UNIT_IMG_P2[unit];
  return `<img class="${cls}" src="${src}" style="${size};pointer-events:none;object-fit:contain;filter:${filter};display:block"/>`;
}

/* ══════════════════ ANIMATION HELPERS ══════════════════ */
function getCellCenter(r, c) {
  const el = document.getElementById(`c${r}_${c}`);
  if (!el) return { x: 0, y: 0 };
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function spawnParticles(x, y, color, count = 12, isKill = false) {
  const layer = document.getElementById('fx-layer');
  const size  = isKill ? 10 : 6;
  for (let i = 0; i < count; i++) {
    const s     = document.createElement('div');
    s.className = 'spark';
    const angle = Math.random() * Math.PI * 2;
    const dist  = isKill ? (40 + Math.random() * 60) : (15 + Math.random() * 25);
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist;
    const sz    = size * (0.5 + Math.random() * 0.8);
    s.style.cssText = `width:${sz}px;height:${sz}px;background:${color};left:${x - sz/2}px;top:${y - sz/2}px;--tx:${tx}px;--ty:${ty}px;animation-duration:${0.4 + Math.random() * 0.5}s;animation-delay:${Math.random() * 0.1}s;box-shadow:0 0 ${sz*2}px ${color};`;
    layer.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}

function spawnKillBanner(text) {
  const b = document.createElement('div');
  b.className = 'kill-banner';
  b.textContent = text;
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 1500);
}

function animatePiece(r, c, animClass, duration = 500) {
  const el = document.getElementById(`c${r}_${c}`);
  if (!el) return;
  const piece = el.querySelector('.piece-3d');
  if (!piece) return;
  piece.classList.add(animClass);
  setTimeout(() => piece.classList.remove(animClass), duration);
}

function shakeBoard() {
  const b = document.getElementById('board');
  b.classList.add('board-shake');
  setTimeout(() => b.classList.remove('board-shake'), 380);
}

function flashCell(r, c) {
  const el = document.getElementById(`c${r}_${c}`);
  if (!el) return;
  el.classList.add('cell-flash');
  setTimeout(() => el.classList.remove('cell-flash'), 400);
}
