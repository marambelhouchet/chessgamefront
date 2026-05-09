/* ══════════════════ MODAL ORIGINAL HTML ══════════════════ */

const MODAL_ORIGINAL_HTML = `
  <h2>⚔ Conquête des Territoires</h2>
  <p>Chaque joueur lance un dé — le plus grand score détermine qui commence la bataille.</p>
  <div class="player-roll">
    <div style="text-align:center"><div class="prn p1" id="roll-name-p1">Alice</div><div class="prv" id="roll-p1">—</div></div>
    <div style="font-size:1.4rem;color:rgba(255,255,255,0.1);margin-top:12px">vs</div>
    <div style="text-align:center"><div class="prn p2" id="roll-name-p2">Bob</div><div class="prv" id="roll-p2">—</div></div>
  </div>
  <button class="dice-roll-btn" id="btn-roll-p1" onclick="startRoll(1)">🎲 <span id="rbtn-name-p1">Alice</span> lance le dé</button>
  <button class="dice-roll-btn" id="btn-roll-p2" onclick="startRoll(2)" disabled>🎲 <span id="rbtn-name-p2">Bob</span> lance le dé</button>
  <button class="btn-modal" id="btn-start" onclick="startGame()" style="display:none">⚔ Commencer la Bataille !</button>
`;

/* ══════════════════ FINISH PLACEMENT → START GAME ══════════════════ */

function finishPlacement() {
  addPlaceLog('Placement terminé ! La bataille commence.');
  /* Save board snapshot for replay */
  boardSnapshot = board.map(row => row.map(cell => ({ ...cell })));
  /* Restore original dice-roll modal */
  document.getElementById('modal-content').innerHTML = MODAL_ORIGINAL_HTML;

  showScreen('game-screen');
  buildGameGrid();
  renderBoard();
  updateTurnUI();

  document.getElementById('btn-roll-p1').disabled      = false;
  document.getElementById('btn-roll-p2').disabled      = true;
  document.getElementById('btn-start').style.display   = 'none';
  document.getElementById('roll-p1').textContent       = '—';
  document.getElementById('roll-p2').textContent       = '—';
  document.getElementById('roll-name-p1').textContent  = CFG.p1;
  document.getElementById('roll-name-p2').textContent  = CFG.p2;
  document.getElementById('rbtn-name-p1').textContent  = CFG.p1;
  document.getElementById('rbtn-name-p2').textContent  = CFG.p2;
  startRolls = [0, 0];
  document.getElementById('modal-backdrop').classList.add('show');
}

/* ══════════════════ GAME GRID ══════════════════ */

function buildGameGrid() {
  const grid = document.getElementById('board');
  grid.style.gridTemplateColumns = `repeat(${SIZE},var(--cell))`;
  grid.innerHTML = '';

  const cc = document.getElementById('col-coords');
  cc.innerHTML = '<div style="width:4px"></div>';
  for (let c = 0; c < SIZE; c++) cc.innerHTML += `<div class="coord-lbl">${c}</div>`;

  const rn = document.getElementById('row-nums');
  rn.innerHTML = '';
  for (let r = 0; r < SIZE; r++) rn.innerHTML += `<div class="row-num">${r}</div>`;

  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const el = document.createElement('div');
      el.className = 'cell';
      el.id        = `c${r}_${c}`;
      el.onclick   = () => handleClick(r, c);
      grid.appendChild(el);
    }
}

/* ══════════════════ RENDER BOARD ══════════════════ */

function renderBoard() {
  revealAroundUnits();
  let s1 = 0, s2 = 0, u1 = 0, u2 = 0, b1 = 0, b2 = 0;
  const alive1 = [], alive2 = [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const el = document.getElementById(`c${r}_${c}`);
      const d  = board[r][c];
      const k  = `${r},${c}`;
      const isRevealed = revealedCells.has(k);

      el.className = 'cell';
      if (d.bonus && isRevealed)                          el.classList.add('bonus');
      if (d.trap && isRevealed)                           el.classList.add('trap');
      if ((d.bonus || d.trap) && !isRevealed && !d.unit)  el.classList.add('cell-fog');
      if (d.owner === 1)      { el.classList.add('territory-p1'); s1++; }
      else if (d.owner === 2) { el.classList.add('territory-p2'); s2++; }
      if (d.unit)       el.classList.add('has-unit');
      if (d.defending)  el.classList.add('defending-cell');
      if (selectedCell && selectedCell[0] === r && selectedCell[1] === c) el.classList.add('selected');

      el.innerHTML = d.unit
        ? pieceSVG(d.unit, d.player, { buffed: !!d.bonusBuff })
          + (d.bonusBuff ? '<span style="position:absolute;top:1px;left:2px;font-size:9px;z-index:4;text-shadow:0 0 6px gold">⚡</span>' : '')
          + (d.defending ? '<span style="position:absolute;top:1px;right:2px;font-size:9px;z-index:4;text-shadow:0 0 6px #9b5de5">🛡</span>' : '')
        : '';

      if (d.player === 1 && d.unit) { u1++; alive1.push(d.unit); if (d.bonus) b1++; }
      if (d.player === 2 && d.unit) { u2++; alive2.push(d.unit); if (d.bonus) b2++; }
    }
  }
  updateScorePanel(s1, s2, u1, u2, b1, b2, alive1, alive2);
}

function showReachable() {
  if (!selectedCell) return;
  const [sr, sc] = selectedCell;
  const moves    = getValidMoves(sr, sc, movePoints);
  for (const { r2, c2 } of moves)
    document.getElementById(`c${r2}_${c2}`).classList.add('reachable');
}

/* ══════════════════ CLICK HANDLERS ══════════════════ */

function handleClick(r, c) {
  if (!diceRolled) { addLog("Lancez le dé d'abord !", 'warn'); return; }
  if (selectedCell) {
    const [sr, sc] = selectedCell;
    if (sr === r && sc === c) { selectedCell = null; renderBoard(); updateMoveUI(); return; }
    processAction(sr, sc, r, c);
  } else {
    if (board[r][c].player === currentPlayer && board[r][c].unit) {
      selectedCell = [r, c];
      renderBoard();
      showReachable();
      updateMoveUI();
    }
  }
}

function processAction(r1, c1, r2, c2) {
  const unit  = board[r1][c1].unit;
  const stats = UNITS[unit];
  const moves = getValidMoves(r1, c1, movePoints);
  const match = moves.find(m => m.r2 === r2 && m.c2 === c2);

  if (!match) {
    addLog(`❌ ${stats.label} : mouvement invalide.`, 'warn');
    selectedCell = null; renderBoard(); return;
  }
  const dist = match.dist;
  if (dist > movePoints) {
    addLog(`❌ Pas assez de points (besoin:${dist}, reste:${movePoints}).`, 'warn');
    selectedCell = null; renderBoard(); return;
  }
  if (board[r2][c2].player !== 0 && board[r2][c2].player !== currentPlayer)
    doCombat(r1, c1, r2, c2, dist);
  else
    doMove(r1, c1, r2, c2, dist);

  selectedCell = null; checkWin(); renderBoard();
}

/* ══════════════════ TURN MANAGEMENT ══════════════════ */

function startGame() {
  document.getElementById('modal-backdrop').classList.remove('show');
  addLog(`Partie lancée ! Tour : ${currentPlayer === 1 ? CFG.p1 : CFG.p2}`, 'turn');
  updateTurnUI();
  if (CFG.mode === 'ai' && currentPlayer === 2) {
    setTimeout(aiPlayTurn, 800);
  } else {
    startTimer();
  }
}

function endTurn() {
  stopTimer();
  const prevPlayer = currentPlayer;
  /* Clear defending state of the player whose turn just ended */
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c].player === prevPlayer) board[r][c].defending = false;

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  movePoints    = 0;
  diceRolled    = false;
  selectedCell  = null;
  document.getElementById('btn-end').disabled = true;
  const defendBtn = document.getElementById('btn-defend');
  if (defendBtn) {
    defendBtn.disabled  = true;
    defendBtn.textContent = '🛡 Défendre';
    defendBtn.classList.remove('defending-active');
  }
  document.getElementById('dice-pips').innerHTML       = '';
  document.getElementById('move-warning').textContent  = '';
  reshuffleSpecials();
  addLog(`─── Tour de ${currentPlayer === 1 ? CFG.p1 : CFG.p2} ───`, 'turn');
  updateTurnUI();
  renderBoard();

  if (CFG.mode === 'ai' && currentPlayer === 2) {
    setTimeout(aiPlayTurn, 600);
  } else {
    startTimer();
  }
}

/* ══════════════════ REPLAY ══════════════════ */

function replayGame() {
  document.getElementById('modal-backdrop').classList.remove('show');
  if (!boardSnapshot) { initGame(); return; }

  board = boardSnapshot.map(row => row.map(cell => ({ ...cell })));
  killPoints    = { 1: 0, 2: 0 };
  revealedCells = new Set();
  bonusCells    = new Set();
  trapCells     = new Set();

  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].bonus) bonusCells.add(`${r},${c}`);
      if (board[r][c].trap)  trapCells.add(`${r},${c}`);
      board[r][c].bonusBuff = false;
      board[r][c].defending = false;
    }

  currentPlayer  = 1;
  movePoints     = 0;
  diceRolled     = false;
  selectedCell   = null;
  placementPhase = false;

  showScreen('game-screen');
  buildGameGrid();
  renderBoard();
  updateTurnUI();

  document.getElementById('modal-content').innerHTML   = MODAL_ORIGINAL_HTML;
  document.getElementById('btn-roll-p1').disabled      = false;
  document.getElementById('btn-roll-p2').disabled      = true;
  document.getElementById('btn-start').style.display   = 'none';
  document.getElementById('roll-p1').textContent       = '—';
  document.getElementById('roll-p2').textContent       = '—';
  document.getElementById('roll-name-p1').textContent  = CFG.p1;
  document.getElementById('roll-name-p2').textContent  = CFG.p2;
  document.getElementById('rbtn-name-p1').textContent  = CFG.p1;
  document.getElementById('rbtn-name-p2').textContent  = CFG.p2;
  startRolls = [0, 0];
  document.getElementById('modal-backdrop').classList.add('show');
  addLog('↺ Rejouer avec le même placement !', 'turn');
}
