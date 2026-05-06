/* ══════════════════ DICE ══════════════════ */
const PIP={1:[[29,29]],2:[[15,15],[43,43]],3:[[15,15],[29,29],[43,43]],4:[[15,15],[43,15],[15,43],[43,43]],5:[[15,15],[43,15],[29,29],[15,43],[43,43]],6:[[15,15],[43,15],[15,29],[43,29],[15,43],[43,43]]};
function renderDiceFace(v){return(PIP[v]||[]).map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#e8588a"/>`).join('');}
function animateDice(finalVal,elId){return new Promise(resolve=>{const el=document.getElementById(elId);let count=0;const iv=setInterval(()=>{const v=Math.ceil(Math.random()*6);if(el)el.innerHTML=renderDiceFace(v);if(++count>=9){clearInterval(iv);if(el)el.innerHTML=renderDiceFace(finalVal);resolve();}},65);});}

async function rollMoveDice(){
  if(diceRolled){addLog('Dé déjà lancé ce tour.','info');return;}
  const val=Math.ceil(Math.random()*6);
  playDiceSound();
  await animateDice(val,'dice-pips');
  movePoints=val;diceRolled=true;
  addLog(`🎲 Dé : ${val} point(s).`,'info');
  updateMoveUI();
}

/* ══════════════════ STARTUP ROLLS ══════════════════ */
async function startRoll(player){
  const val=Math.ceil(Math.random()*6);startRolls[player-1]=val;
  playDiceSound();
  if(player===1){
    document.getElementById('roll-p1').textContent=val;
    document.getElementById('btn-roll-p1').disabled=true;
    /* Si mode IA, le joueur 2 lance automatiquement */
    if(CFG.mode==='ai'){
      setTimeout(()=>startRoll(2),600);
    } else {
      document.getElementById('btn-roll-p2').disabled=false;
    }
  } else {
    document.getElementById('roll-p2').textContent=val;document.getElementById('btn-roll-p2').disabled=true;
    const a=startRolls[0],b=startRolls[1];
    if(a===b){
      document.getElementById('roll-p1').textContent='—';document.getElementById('roll-p2').textContent='—';
      startRolls=[0,0];
      document.getElementById('btn-roll-p1').disabled=false;
      if(CFG.mode!=='ai')document.getElementById('btn-roll-p2').disabled=true;
      addLog('Égalité ! Relancez.','warn');
      if(CFG.mode==='ai')setTimeout(()=>startRoll(1),400);
      return;
    }
    currentPlayer=a>b?1:2;const winner=a>b?CFG.p1:CFG.p2;
    setTimeout(()=>{const p=document.createElement('p');p.className='winner-msg';p.style.cssText='color:var(--rose);font-size:1rem;margin:10px 0;font-weight:700;font-family:Cinzel,serif;letter-spacing:0.06em';p.textContent=`⚔ ${winner} commence !`;const mc=document.getElementById('modal-content');const bs=document.getElementById('btn-start');mc.insertBefore(p,bs);bs.style.display='block';},300);
  }
}