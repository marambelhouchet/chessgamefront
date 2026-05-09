/* ══════════════════ BOARD DATA INIT ══════════════════ */

function initBoardData(bonusCount, trapCount) {
  _bonusCount = bonusCount;
  _trapCount  = trapCount;
  bonusCells  = new Set();
  trapCells   = new Set();
  revealedCells = new Set();

  for (let r = 0; r < SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < SIZE; c++) {
      board[r][c] = {
        player: 0, owner: 0, unit: null,
        bonus: false, trap: false,
        startZone: 0, bonusBuff: false, defending: false
      };
    }
  }

  /* Start zones: p1 top-left 2 rows, p2 bottom-right 2 rows */
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < Math.min(SIZE, Math.ceil(initialUnits[1].length / 2) + 1); c++)
      board[r][c].startZone = 1;

  for (let r = SIZE - 2; r < SIZE; r++)
    for (let c = Math.max(0, SIZE - Math.ceil(initialUnits[2].length / 2) - 1); c < SIZE; c++)
      board[r][c].startZone = 2;

  placeSpecials(bonusCount, trapCount);
}

/* ══════════════════ SPECIALS PLACEMENT ══════════════════ */

function placeSpecials(bonusCount, trapCount) {
  /* Clear old specials from board */
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      board[r][c].bonus = false;
      board[r][c].trap  = false;
    }
  bonusCells = new Set();
  trapCells  = new Set();

  const midMin = 2, midMax = SIZE - 3;
  const placed = new Set();

  function rndMid() {
    let r, c, k, tries = 0;
    do {
      r = midMin + Math.floor(Math.random() * (midMax - midMin + 1));
      c = midMin + Math.floor(Math.random() * (midMax - midMin + 1));
      k = `${r},${c}`;
      tries++;
    } while ((placed.has(k) || board[r][c].startZone || board[r][c].unit) && tries < 200);
    placed.add(k);
    return [r, c, k];
  }

  for (let i = 0; i < bonusCount; i++) {
    const [r, c, k] = rndMid();
    board[r][c].bonus = true;
    bonusCells.add(k);
  }
  for (let i = 0; i < trapCount; i++) {
    const [r, c, k] = rndMid();
    board[r][c].trap = true;
    trapCells.add(k);
  }
}

function reshuffleSpecials() {
  placeSpecials(_bonusCount, _trapCount);
  revealedCells = new Set();
  addLog('🌀 Les cases spéciales se sont déplacées…', 'info');
}

/* ══════════════════ REVEAL LOGIC ══════════════════ */

function revealCellIfSpecial(r, c) {
  const k = `${r},${c}`;
  if ((board[r][c].bonus || board[r][c].trap) && !revealedCells.has(k)) {
    revealedCells.add(k);
    const type = board[r][c].bonus ? 'Bonus ✦' : 'Piège ✗';
    addLog(`👁 Case (${r},${c}) révélée : ${type}`, 'info');
  }
}

/* Reveal special cells adjacent (including diagonals) to all units */
function revealAroundUnits() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].unit) {
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE &&
                (board[nr][nc].bonus || board[nr][nc].trap)) {
              revealCellIfSpecial(nr, nc);
            }
          }
      }
    }
}
