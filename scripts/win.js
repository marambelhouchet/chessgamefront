/* ══════════════════ WIN CHECK ══════════════════ */
function checkWin(){
  let s1=0,s2=0,u1=0,u2=0;
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    if(board[r][c].owner===1)s1++;if(board[r][c].owner===2)s2++;
    if(board[r][c].player===1&&board[r][c].unit)u1++;if(board[r][c].player===2&&board[r][c].unit)u2++;
  }
  if(s1>=WIN_GOAL||u2===0)showWin(CFG.p1,s1,s2);
  else if(s2>=WIN_GOAL||u1===0)showWin(CFG.p2,s1,s2);
}

function showWin(name,s1,s2){
  stopTimer();
  const k1=killPoints[1],k2=killPoints[2];
  const dc=DIFF_CONFIG[CFG.diff];const diffName={easy:'Facile',medium:'Moyen',hard:'Difficile'}[CFG.diff];
  document.getElementById('modal-content').innerHTML=`
    <div class="win-crown">⚔</div>
    <div class="win-name">${name} gagne !</div>
    <p style="font-size:0.75rem;color:var(--dim);margin-bottom:6px">Grille ${SIZE}×${SIZE} · ${diffName} <span class="diff-badge ${CFG.diff}">${diffName}</span></p>
    <p style="margin:8px 0 3px;color:var(--muted);font-size:0.82rem">Scores finaux</p>
    <p style="margin:3px 0;font-size:0.8rem;color:var(--rose);font-weight:700">${CFG.p1} : ${s1} cases + ${k1} kill pts = <strong>${s1+k1}</strong></p>
    <p style="margin:3px 0 20px;font-size:0.8rem;color:var(--violet);font-weight:700">${CFG.p2} : ${s2} cases + ${k2} kill pts = <strong>${s2+k2}</strong></p>
    <button class="btn-modal" onclick="showSetup()" style="margin-bottom:8px">⚙ Nouvelle config</button>
    <button class="btn-modal" style="background:linear-gradient(135deg,var(--violet),var(--violet-deep));box-shadow:0 6px 24px rgba(155,93,229,0.4)" onclick="replayGame()">↺ Rejouer même config</button>`;
  document.getElementById('modal-backdrop').classList.add('show');
}

function replayGame(){
  document.getElementById('modal-backdrop').classList.remove('show');
  if(!boardSnapshot){initGame();return;}
  /* Restore board to post-placement state */
  board = boardSnapshot.map(row => row.map(cell => ({...cell})));
  killPoints = { 1:0, 2:0 };
  revealedCells = new Set();
  /* Rebuild specials sets from snapshot */
  bonusCells = new Set(); trapCells = new Set();
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    if(board[r][c].bonus)bonusCells.add(`${r},${c}`);
    if(board[r][c].trap)trapCells.add(`${r},${c}`);
    board[r][c].bonusBuff = false;
  }
  currentPlayer = 1;
  movePoints = 0; diceRolled = false; selectedCell = null;
  placementPhase = false;
  showScreen('game-screen');
  buildGameGrid();
  renderBoard();
  updateTurnUI();
  /* reset modal for dice roll */
  document.getElementById('modal-content').innerHTML = MODAL_ORIGINAL_HTML;
  document.getElementById('btn-roll-p1').disabled=false;
  document.getElementById('btn-roll-p2').disabled=true;
  document.getElementById('btn-start').style.display='none';
  document.getElementById('roll-p1').textContent='—';
  document.getElementById('roll-p2').textContent='—';
  document.getElementById('roll-name-p1').textContent=CFG.p1;
  document.getElementById('roll-name-p2').textContent=CFG.p2;
  document.getElementById('rbtn-name-p1').textContent=CFG.p1;
  document.getElementById('rbtn-name-p2').textContent=CFG.p2;
  startRolls=[0,0];
  document.getElementById('modal-backdrop').classList.add('show');
  addLog('↺ Rejouer avec le même placement !','turn');
}

/* ══════════════════ IA ══════════════════ */