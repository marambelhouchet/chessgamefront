function startGame(){
  document.getElementById('modal-backdrop').classList.remove('show');
  addLog(`Partie lancée ! Tour : ${currentPlayer===1?CFG.p1:CFG.p2}`,'turn');
  updateTurnUI();
  if(CFG.mode==='ai'&&currentPlayer===2){
    setTimeout(aiPlayTurn,800);
  } else {
    startTimer();
  }
}

/* ══════════════════ UI UPDATES ══════════════════ */
function updateMoveUI(){
  const pts=Math.max(0,movePoints);
  document.getElementById('move-pts').textContent=pts;
  const btn=document.getElementById('btn-end'),warn=document.getElementById('move-warning');
  if(!diceRolled){btn.disabled=true;warn.textContent='';return;}
  if(pts<=0){btn.disabled=false;warn.textContent='';}
  else if(!hasPossibleMove()){btn.disabled=false;warn.textContent='Aucun mouvement possible.';}
  else{btn.disabled=true;warn.textContent=`⚠ Utilisez vos ${pts} pt(s) d'abord !`;}
}

function hasPossibleMove(){
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    if(board[r][c].player!==currentPlayer||!board[r][c].unit)continue;
    const maxStep=UNITS[board[r][c].unit].maxStep,reach=Math.min(maxStep,movePoints);
    for(const[dr,dc]of[[0,1],[0,-1],[1,0],[-1,0]])for(let d=1;d<=reach;d++){
      const nr=r+dr*d,nc=c+dc*d;
      if(nr<0||nr>=SIZE||nc<0||nc>=SIZE)break;
      if(board[nr][nc].player===currentPlayer)break;
      return true;
    }
  }
  return false;
}

function updateTurnUI(){
  const name=currentPlayer===1?CFG.p1:CFG.p2,cls=currentPlayer===1?'p1':'p2';
  const badge=document.getElementById('turn-badge');
  badge.textContent=`Tour de ${name}`;badge.className=`turn-badge ${cls}`;
  document.getElementById('move-pts').textContent='—';
  document.getElementById('dice-pips').innerHTML='';
}

function endTurn(){
  stopTimer();
  currentPlayer=currentPlayer===1?2:1;movePoints=0;diceRolled=false;selectedCell=null;
  document.getElementById('btn-end').disabled=true;
  document.getElementById('dice-pips').innerHTML='';
  document.getElementById('move-warning').textContent='';
  reshuffleSpecials();
  addLog(`─── Tour de ${currentPlayer===1?CFG.p1:CFG.p2} ───`,'turn');
  updateTurnUI();renderBoard();
  if(CFG.mode==='ai'&&currentPlayer===2){
    /* IA joue automatiquement */
    setTimeout(aiPlayTurn,600);
  } else {
    startTimer();
  }
}