/* ══════════════════ UNIT ANIMATIONS & EFFECTS CSS (injected via JS) ══════════════════ */
(function injectAnimCSS(){
  const s=document.createElement('style');
  s.textContent=`
/* ── Piece wrapper ── */
.piece-3d img{width:100%;height:100%;object-fit:contain;display:block}
.piece-3d{
  width:calc(var(--cell) - 6px);height:calc(var(--cell) - 6px);
  display:flex;align-items:center;justify-content:center;
  position:relative;pointer-events:none;
  transform-style:preserve-3d;
}
/* ── Idle float ── */
@keyframes float-p1{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-3px) rotate(1deg)}}
@keyframes float-p2{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-3px) rotate(-1deg)}}
.piece-3d.p1{animation:float-p1 2.8s ease-in-out infinite;}
.piece-3d.p2{animation:float-p2 3.2s ease-in-out infinite;}
/* ── Move animation ── */
@keyframes piece-move{
  0%{transform:translateY(0) scale(1)}
  30%{transform:translateY(-8px) scale(1.15)}
  60%{transform:translateY(-4px) scale(1.08)}
  100%{transform:translateY(0) scale(1)}
}
.piece-3d.anim-move{animation:piece-move 0.4s ease-out forwards!important;}
/* ── Attack animation ── */
@keyframes piece-attack{
  0%{transform:scale(1) rotate(0deg)}
  25%{transform:scale(1.3) rotate(-8deg)}
  50%{transform:scale(1.4) rotate(6deg)}
  75%{transform:scale(1.2) rotate(-4deg)}
  100%{transform:scale(1) rotate(0deg)}
}
.piece-3d.anim-attack{animation:piece-attack 0.5s ease-out forwards!important;}
/* ── Kill / death explosion ── */
@keyframes piece-die{
  0%{transform:scale(1) rotate(0);opacity:1;filter:brightness(1)}
  20%{transform:scale(1.6) rotate(15deg);opacity:1;filter:brightness(3) saturate(3)}
  50%{transform:scale(0.8) rotate(-20deg);opacity:0.6;filter:brightness(2) blur(1px)}
  100%{transform:scale(0) rotate(45deg);opacity:0;filter:blur(4px)}
}
.piece-3d.anim-die{animation:piece-die 0.6s ease-in forwards!important;}
/* ── Buff glow ── */
@keyframes buff-glow{
  0%,100%{filter:drop-shadow(0 0 4px gold) brightness(1.1)}
  50%{filter:drop-shadow(0 0 12px gold) brightness(1.4)}
}
.piece-3d.buffed{animation:float-p1 2.8s ease-in-out infinite,buff-glow 1s ease-in-out infinite;}
.piece-3d.p2.buffed{animation:float-p2 3.2s ease-in-out infinite,buff-glow 1s ease-in-out infinite;}
/* ── Tank turret spin on attack ── */
@keyframes turret-spin{
  0%{transform:rotate(0)}40%{transform:rotate(-30deg)}70%{transform:rotate(20deg)}100%{transform:rotate(0)}
}
.turret-group.firing{animation:turret-spin 0.4s ease-out;}
/* ── Cavalier gallop ── */
@keyframes gallop{
  0%,100%{transform:rotate(-5deg) translateX(0)}
  25%{transform:rotate(5deg) translateX(2px)}
  75%{transform:rotate(-3deg) translateX(-2px)}
}
.piece-3d.C-unit{animation:gallop 0.8s ease-in-out infinite!important;}

/* ── Particle container ── */
#fx-layer{position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden;}
/* ── Explosion particles ── */
@keyframes spark-fly{
  0%{transform:translate(0,0) scale(1);opacity:1}
  100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}
}
.spark{position:absolute;border-radius:50%;animation:spark-fly 0.7s ease-out forwards;}
/* ── Move trail ── */
@keyframes trail-fade{0%{opacity:0.7;transform:scale(1)}100%{opacity:0;transform:scale(0.3)}}
.trail{position:absolute;border-radius:50%;width:8px;height:8px;animation:trail-fade 0.4s ease-out forwards;}
/* ── Screen shake ── */
@keyframes shake{
  0%,100%{transform:translate(0,0)}
  20%{transform:translate(-4px,2px)}
  40%{transform:translate(4px,-2px)}
  60%{transform:translate(-3px,3px)}
  80%{transform:translate(3px,-1px)}
}
.board-shake{animation:shake 0.35s ease-out!important;}
/* ── Kill banner ── */
@keyframes kill-banner{
  0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)}
  20%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}
  70%{opacity:1;transform:translate(-50%,-50%) scale(1)}
  100%{opacity:0;transform:translate(-50%,-60%) scale(0.9)}
}
.kill-banner{
  position:fixed;left:50%;top:40%;
  font-family:'Cinzel',serif;font-size:1.6rem;font-weight:700;
  color:#fff;text-shadow:0 0 20px #f4a261,0 0 40px #e05050;
  z-index:1000;pointer-events:none;white-space:nowrap;
  animation:kill-banner 1.4s ease-out forwards;
}
/* ── Move flash on cell ── */
@keyframes cell-flash{
  0%{box-shadow:inset 0 0 0 rgba(232,88,138,0)}
  30%{box-shadow:inset 0 0 20px rgba(232,88,138,0.5)}
  100%{box-shadow:inset 0 0 0 rgba(232,88,138,0)}
}
.cell-flash{animation:cell-flash 0.4s ease-out!important;}
`;
  document.head.appendChild(s);
})();