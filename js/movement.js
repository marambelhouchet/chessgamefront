/* ══════════════════ MOVEMENT ══════════════════ */

/* Returns all valid target cells for a unit at (r,c) with `pts` move points */
function getValidMoves(r, c, pts) {
  const unit    = board[r][c].unit;
  const mt      = UNITS[unit].moveType;
  const targets = [];

  if (mt === 'knight') {
    /* Saut en L — saute par-dessus */
    for (const [dr, dc] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc].player !== board[r][c].player)
        targets.push({ r2: nr, c2: nc, dist: 1 });
    }
  } else if (mt === 'straight') {
    /* Cavalier : 1 ou 2 cases H/V, bloqué */
    const reach = Math.min(UNITS[unit].maxStep, pts);
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      for (let d = 1; d <= reach; d++) {
        const nr = r + dr * d, nc = c + dc * d;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
        if (board[nr][nc].player === board[r][c].player) break;
        targets.push({ r2: nr, c2: nc, dist: d });
        if (board[nr][nc].player !== 0) break;
      }
    }
  } else if (mt === 'diagonal') {
    /* Soldat : diagonales, bloqué */
    const reach = Math.min(UNITS[unit].maxStep, pts);
    for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
      for (let d = 1; d <= reach; d++) {
        const nr = r + dr * d, nc = c + dc * d;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
        if (board[nr][nc].player === board[r][c].player) break;
        targets.push({ r2: nr, c2: nc, dist: d });
        if (board[nr][nc].player !== 0) break;
      }
    }
  } else if (mt === 'all') {
    /* Tank : toutes directions, 1 case */
    const reach = Math.min(UNITS[unit].maxStep, pts);
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      for (let d = 1; d <= reach; d++) {
        const nr = r + dr * d, nc = c + dc * d;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
        if (board[nr][nc].player === board[r][c].player) break;
        targets.push({ r2: nr, c2: nc, dist: d });
        if (board[nr][nc].player !== 0) break;
      }
    }
  }
  return targets;
}

/* Execute a move (no combat) */
function doMove(r1, c1, r2, c2, cost) {
  const unit  = board[r1][c1].unit;
  const color = currentPlayer === 1 ? '#e8588a' : '#9b5de5';

  animatePiece(r1, c1, 'anim-move', 400);
  spawnParticles(getCellCenter(r1, c1).x, getCellCenter(r1, c1).y, color, 5, false);

  board[r2][c2].unit      = unit;
  board[r2][c2].player    = currentPlayer;
  board[r2][c2].owner     = currentPlayer;
  board[r2][c2].defending = false; // moving cancels defend stance
  board[r1][c1].unit      = null;
  board[r1][c1].player    = 0;
  board[r1][c1].defending = false;
  movePoints -= cost;

  flashCell(r2, c2);

  if (board[r2][c2].trap) {
    revealCellIfSpecial(r2, c2);
    const dst = getCellCenter(r2, c2);
    spawnParticles(dst.x, dst.y, '#e05050', 18, true);
    playTrapSound();
    shakeBoard();
    spawnKillBanner('💥 PIÈGE !');
    addLog('⚠ PIÈGE déclenché ! Unité détruite.', 'warn');
    board[r2][c2].unit   = null;
    board[r2][c2].player = 0;
    board[r2][c2].trap   = false;
    trapCells.delete(`${r2},${c2}`);
    revealedCells.delete(`${r2},${c2}`);
  } else if (board[r2][c2].bonus) {
    revealCellIfSpecial(r2, c2);
    spawnParticles(getCellCenter(r2, c2).x, getCellCenter(r2, c2).y, '#f4a261', 10, false);
    addLog(`✦ Case Bonus activée par ${currentPlayer === 1 ? CFG.p1 : CFG.p2} ! (+1 force au prochain combat)`, 'capture');
    board[r2][c2].bonus = false;
    bonusCells.delete(`${r2},${c2}`);
    revealedCells.delete(`${r2},${c2}`);
    board[r2][c2].bonusBuff = true;
  } else {
    addLog(`✿ Case conquise par ${currentPlayer === 1 ? CFG.p1 : CFG.p2}.`, 'capture');
  }

  updateMoveUI();
}
