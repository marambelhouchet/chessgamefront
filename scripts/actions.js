/* ══════════════════ CLICK HANDLERS ══════════════════ */
function handleClick(r,c){
  if(!diceRolled){addLog("Lancez le dé d'abord !",'warn');return;}
  if(selectedCell){const[sr,sc]=selectedCell;if(sr===r&&sc===c){selectedCell=null;renderBoard();return;}processAction(sr,sc,r,c);}
  else{if(board[r][c].player===currentPlayer&&board[r][c].unit){selectedCell=[r,c];renderBoard();showReachable();}}
}

function processAction(r1,c1,r2,c2){
  const unit=board[r1][c1].unit;const stats=UNITS[unit];
  const dr=Math.abs(r1-r2),dc=Math.abs(c1-c2),dist=dr+dc;
  if(!(r1===r2||c1===c2)||dist>stats.maxStep){addLog(`❌ ${stats.label} : max ${stats.maxStep} case(s) en ligne droite.`,'warn');selectedCell=null;renderBoard();return;}
  if(dist>movePoints){addLog(`❌ Pas assez de points (besoin:${dist}, reste:${movePoints}).`,'warn');selectedCell=null;renderBoard();return;}
  if(board[r2][c2].player!==0&&board[r2][c2].player!==currentPlayer)doCombat(r1,c1,r2,c2,dist);
  else doMove(r1,c1,r2,c2,dist);
  selectedCell=null;checkWin();renderBoard();
}

/* ══════════════════ COMBAT ══════════════════ */
function doCombat(r1,c1,r2,c2,cost){
  const aUnit=board[r1][c1].unit,dUnit=board[r2][c2].unit;
  const ab=board[r1][c1].bonusBuff?1:0,db=board[r2][c2].bonusBuff?1:0;
  const ad=Math.ceil(Math.random()*6),dd=Math.ceil(Math.random()*6);
  const aBase=UNITS[aUnit].power,dBase=UNITS[dUnit].power;
  const aTotal=aBase+ad+ab,dTotal=dBase+dd+db;
  const an=currentPlayer===1?CFG.p1:CFG.p2,dn=currentPlayer===1?CFG.p2:CFG.p1;
  const aColor=currentPlayer===1?'#e8588a':'#9b5de5';
  const dColor=currentPlayer===1?'#9b5de5':'#e8588a';
  /* Attack animation on attacker */
  animatePiece(r1,c1,'anim-attack',500);
  addLog(`⚔ ${an} (${UNITS[aUnit].label}) VS ${dn} (${UNITS[dUnit].label})`,'combat');
  addLog(`  ${an} : dé(${ad}) + force(${aBase})${ab?' + 1 bonus':''} = ${aTotal}`,'combat-detail');
  addLog(`  ${dn} : dé(${dd}) + force(${dBase})${db?' + 1 bonus':''} = ${dTotal}`,'combat-detail');
  let attackerWins;
  if(aTotal!==dTotal){attackerWins=aTotal>dTotal;}
  else{
    let ts1=0,ts2=0;
    for(let rr=0;rr<SIZE;rr++)for(let cc=0;cc<SIZE;cc++){if(board[rr][cc].owner===1)ts1++;if(board[rr][cc].owner===2)ts2++;}
    const aScore=(currentPlayer===1?ts1:ts2)+killPoints[currentPlayer];
    const dPlayer=currentPlayer===1?2:1;
    const dScore=(dPlayer===1?ts1:ts2)+killPoints[dPlayer];
    if(aScore>dScore){attackerWins=true;addLog(`⚖ Égalité dés → ${an} gagne au score (${aScore}>${dScore})`,'combat');}
    else if(dScore>aScore){attackerWins=false;addLog(`⚖ Égalité dés → ${dn} gagne au score (${dScore}>${aScore})`,'combat');}
    else{attackerWins=false;addLog(`⚖ Double égalité → avantage défenseur ${dn}`,'combat');}
  }
  if(attackerWins){
    const kpts=UNITS[dUnit].killPts;killPoints[currentPlayer]+=kpts;
    addLog(`✿ Victoire ${an} ! +${kpts} pts kill [${aTotal}>${dTotal}]`,'kill');
    playCombatSound(true);
    /* Death animation on defender */
    animatePiece(r2,c2,'anim-die',600);
    const dstPt=getCellCenter(r2,c2);
    const killColor=dUnit==='T'?'#f4a261':dUnit==='C'?'#c090f0':'#e8588a';
    spawnParticles(dstPt.x,dstPt.y,killColor,20,true);
    shakeBoard();
    const killLabel={T:'💥 TANK DÉTRUIT !',C:'⚡ CAVALIER ABATTU !',S:'💀 SOLDAT ÉLIMINÉ !'}[dUnit];
    spawnKillBanner(killLabel);
    setTimeout(()=>{
      board[r1][c1].bonusBuff=false;
      doMove(r1,c1,r2,c2,cost);
      checkWin();
      renderBoard();
    },350);
  } else {
    addLog(`💀 ${an} perd. ${UNITS[aUnit].label} détruit [${aTotal}≤${dTotal}]`,'warn');
    playCombatSound(false);
    /* Death on attacker */
    animatePiece(r1,c1,'anim-die',600);
    const srcPt=getCellCenter(r1,c1);
    spawnParticles(srcPt.x,srcPt.y,aColor,14,true);
    if(aUnit==='T'){shakeBoard();}
    board[r1][c1].bonusBuff=false;
    board[r2][c2].bonusBuff=false;
    board[r1][c1].unit=null;board[r1][c1].player=0;movePoints-=cost;
    checkWin();
  }
  updateMoveUI();
}

function doMove(r1,c1,r2,c2,cost){
  const unit=board[r1][c1].unit;
  const color=currentPlayer===1?'#e8588a':'#9b5de5';
  animatePiece(r1,c1,'anim-move',400);
  spawnParticles(getCellCenter(r1,c1).x,getCellCenter(r1,c1).y,color,5,false);
  board[r2][c2].unit=unit;board[r2][c2].player=currentPlayer;board[r2][c2].owner=currentPlayer;
  board[r1][c1].unit=null;board[r1][c1].player=0;
  movePoints-=cost;
  flashCell(r2,c2);
  if(board[r2][c2].trap){
    revealCellIfSpecial(r2,c2);
    const dst=getCellCenter(r2,c2);
    spawnParticles(dst.x,dst.y,'#e05050',18,true);
    playTrapSound();
    shakeBoard();spawnKillBanner('💥 PIÈGE !');
    addLog('⚠ PIÈGE déclenché ! Unité détruite.','warn');
    board[r2][c2].unit=null;board[r2][c2].player=0;
    board[r2][c2].trap=false;trapCells.delete(`${r2},${c2}`);revealedCells.delete(`${r2},${c2}`);
  } else if(board[r2][c2].bonus){
    revealCellIfSpecial(r2,c2);
    spawnParticles(getCellCenter(r2,c2).x,getCellCenter(r2,c2).y,'#f4a261',10,false);
    addLog(`✦ Case Bonus activée par ${currentPlayer===1?CFG.p1:CFG.p2} ! (+1 force au prochain combat)`,'capture');
    board[r2][c2].bonus=false;bonusCells.delete(`${r2},${c2}`);revealedCells.delete(`${r2},${c2}`);
    board[r2][c2].bonusBuff=true;
  } else {
    addLog(`✿ Case conquise par ${currentPlayer===1?CFG.p1:CFG.p2}.`,'capture');
  }
  updateMoveUI();
}

/* ══════════════════ DICE ══════════════════ */
const PIP={1:[[29,29]],2:[[15,15],[43,43]],3:[[15,15],[29,29],[43,43]],4:[[15,15],[43,15],[15,43],[43,43]],5:[[15,15],[43,15],[29,29],[15,43],[43,43]],6:[[15,15],[43,15],[15,29],[43,29],[15,43],[43,43]]};