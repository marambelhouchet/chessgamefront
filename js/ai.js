/* ══════════════════ AI ══════════════════ */

/* ── AI memory ── */
let aiKnownTraps = new Set(); // trap cells the AI has seen (revealed)
let aiKnownBonus = new Set(); // bonus cells the AI has seen

/* Update AI memory from revealed cells */
function aiUpdateMemory() {
  for (const k of revealedCells) {
    const [r, c] = k.split(',').map(Number);
    if (board[r][c].trap)        aiKnownTraps.add(k);
    else                         aiKnownTraps.delete(k); // trap triggered
    if (board[r][c].bonus)       aiKnownBonus.add(k);
    else                         aiKnownBonus.delete(k); // bonus taken
  }
  for (const k of aiKnownTraps) if (!trapCells.has(k))  aiKnownTraps.delete(k);
  for (const k of aiKnownBonus) if (!bonusCells.has(k)) aiKnownBonus.delete(k);
}

/* ── Auto-placement ── */
function aiAutoPlace() {
  if (placeUnitsLeft[2].length === 0) { finishPlacement(); return; }
  const validCells = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c].startZone === 2 && !board[r][c].unit) validCells.push([r, c]);

  if (validCells.length === 0) { finishPlacement(); return; }

  const [r, c]   = validCells[Math.floor(Math.random() * validCells.length)];
  const unitType = placeUnitsLeft[2][0];
  placeUnitsLeft[2].shift();
  board[r][c].unit   = unitType;
  board[r][c].player = 2;
  board[r][c].owner  = 2;
  placedUnits[2].push(unitType);
  addPlaceLog(`🤖 ${CFG.p2} place ${UNITS[unitType].label} en (${r},${c})`);

  if (placeUnitsLeft[1].length === 0 && placeUnitsLeft[2].length === 0) { finishPlacement(); return; }

  placePlayer = 1;
  if (placeUnitsLeft[1].length === 0) {
    placePlayer = 2;
    setTimeout(aiAutoPlace, 500);
  } else {
    if (placeUnitsLeft[1].length > 0) placeUnitType = placeUnitsLeft[1][0];
    renderPlaceBoard(); updatePlaceUI();
  }
}

/* ── Full AI turn ── */
function aiPlayTurn() {
  if (currentPlayer !== 2 || CFG.mode !== 'ai') return;
  addLog('🤖 L\'ordinateur réfléchit…', 'info');
  const level = CFG.aiLevel;

  /* 1. Roll dice */
  const diceVal = Math.ceil(Math.random() * 6);
  movePoints  = diceVal;
  diceRolled  = true;
  playDiceSound();
  animateDice(diceVal, 'dice-pips');
  addLog(`🎲 Dé IA : ${diceVal} point(s).`, 'info');
  updateMoveUI();

  /* 2. Play all available moves */
  setTimeout(() => {
    let remaining = movePoints;
    let moved     = true;
    while (moved && remaining > 0) {
      moved = false;
      const move = aiFindBestMove(remaining, level);
      if (move) {
        const { r1, c1, r2, c2, dist } = move;
        if (board[r2][c2].player !== 0 && board[r2][c2].player !== 2) {
          doCombat(r1, c1, r2, c2, dist);
        } else {
          doMove(r1, c1, r2, c2, dist);
        }
        selectedCell = null;
        checkWin();
        renderBoard();
        remaining = movePoints;
        moved     = true;
      }
    }
    setTimeout(() => { endTurn(); }, 500);
  }, 800);
}

/* ── Find best move by difficulty ── */
function aiFindBestMove(pts, level) {
  const moves = aiGetAllMoves(2, pts);
  if (moves.length === 0) return null;
  aiUpdateMemory();

  if (level === 'ai-easy') {
    /* Easy: random, avoid known traps */
    const safe = moves.filter(m => !aiKnownTraps.has(`${m.r2},${m.c2}`));
    const pool = safe.length > 0 ? safe : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (level === 'ai-medium') {
    /* Medium: prefer attack weak units → known bonus → neutral → avoid traps */
    const safe = moves.filter(m => !aiKnownTraps.has(`${m.r2},${m.c2}`));
    const pool = safe.length > 0 ? safe : moves;

    const attacks = pool.filter(m => board[m.r2][m.c2].player === 1);
    if (attacks.length > 0) {
      attacks.sort((a, b) => {
        const pa = UNITS[board[a.r2][a.c2].unit].power + (board[a.r2][a.c2].bonusBuff ? 1 : 0);
        const pb = UNITS[board[b.r2][b.c2].unit].power + (board[b.r2][b.c2].bonusBuff ? 1 : 0);
        return pa - pb; // attack weakest first
      });
      return attacks[0];
    }
    const knownBonusMoves = pool.filter(m => aiKnownBonus.has(`${m.r2},${m.c2}`));
    if (knownBonusMoves.length > 0) return knownBonusMoves[0];
    const bonusMoves = pool.filter(m => board[m.r2][m.c2].bonus);
    if (bonusMoves.length > 0) return bonusMoves[0];
    const neutral = pool.filter(m => board[m.r2][m.c2].owner === 0);
    if (neutral.length > 0) return neutral[Math.floor(Math.random() * neutral.length)];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (level === 'ai-hard') {
    /* Hard: score every move with full heuristics */
    let best = null, bestScore = -Infinity;
    for (const m of moves) {
      let score    = 0;
      const target = board[m.r2][m.c2];
      const k      = `${m.r2},${m.c2}`;
      const myUnit = board[m.r1][m.c1].unit;
      const myPow  = UNITS[myUnit].power + (board[m.r1][m.c1].bonusBuff ? 1 : 0);

      if (aiKnownTraps.has(k)) {
        score = -999;
      } else if (target.trap && revealedCells.has(k)) {
        score = -200;
      } else if (target.player === 1) {
        const enPow  = UNITS[target.unit].power + (target.bonusBuff ? 1 : 0);
        const winProb = Math.max(0.05, Math.min(0.95, (myPow - enPow + 3.5) / 7));
        const killVal = UNITS[target.unit].killPts;
        score = winProb * killVal * 12;
        if (board[m.r1][m.c1].bonusBuff) score += 8;
        if (winProb < 0.4) score -= 10;
      } else if (aiKnownBonus.has(k)) {
        score = 20;
      } else if (target.bonus) {
        score = 14;
      } else if (target.owner === 1) {
        score = 6;
      } else if (target.owner === 0) {
        score = 3;
        const distCenter = Math.abs(m.r2 - SIZE / 2) + Math.abs(m.c2 - SIZE / 2);
        score += Math.max(0, 4 - distCenter * 0.5);
        score += aiExpansionValue(m.r2, m.c2);
      }

      score -= aiExposureRisk(m.r2, m.c2) * 3;
      if (myUnit === 'T' && target.owner !== 2) score += 2;
      if (m.r2 < m.r1 && m.r1 > SIZE - 3) score -= 2;

      if (score > bestScore) { bestScore = score; best = m; }
    }
    return best || moves[0];
  }
  return moves[0];
}

/* ── Expansion value: how many new frontiers does (r,c) open ── */
function aiExpansionValue(r, c) {
  let val = 0;
  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
      if (board[nr][nc].owner === 0) val += 0.5;
      if (board[nr][nc].owner === 1) val += 1.0;
    }
  }
  return val;
}

/* ── List all valid moves for a player ── */
function aiGetAllMoves(player, pts) {
  const moves = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].player !== player || !board[r][c].unit) continue;
      for (const m of getValidMoves(r, c, pts)) {
        if (m.dist <= pts) moves.push({ r1: r, c1: c, ...m });
      }
    }
  return moves;
}

/* ── Exposure risk: number of enemy units adjacent to (r,c) ── */
function aiExposureRisk(r, c) {
  let risk = 0;
  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc].player === 1) risk++;
  }
  return risk;
}
