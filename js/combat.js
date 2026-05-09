/* ══════════════════ COMBAT ══════════════════ */

function doCombat(r1, c1, r2, c2, cost) {
  const aUnit  = board[r1][c1].unit;
  const dUnit  = board[r2][c2].unit;
  const ab     = board[r1][c1].bonusBuff ? 1 : 0;
  const db     = board[r2][c2].bonusBuff ? 1 : 0;
  const defendBonus = board[r2][c2].defending ? 2 : 0;

  const ad     = Math.ceil(Math.random() * 6);
  const dd     = Math.ceil(Math.random() * 6);
  const aBase  = UNITS[aUnit].power;
  const dBase  = UNITS[dUnit].power;
  const aTotal = aBase + ad + ab;
  const dTotal = dBase + dd + db + defendBonus;

  const an     = currentPlayer === 1 ? CFG.p1 : CFG.p2;
  const dn     = currentPlayer === 1 ? CFG.p2 : CFG.p1;
  const aColor = currentPlayer === 1 ? '#e8588a' : '#9b5de5';

  animatePiece(r1, c1, 'anim-attack', 500);
  addLog(`⚔ ${an} (${UNITS[aUnit].label}) VS ${dn} (${UNITS[dUnit].label})`, 'combat');
  addLog(`  ${an} : dé(${ad}) + force(${aBase})${ab ? ' + 1 bonus' : ''} = ${aTotal}`, 'combat-detail');
  addLog(`  ${dn} : dé(${dd}) + force(${dBase})${db ? ' + 1 bonus' : ''}${defendBonus ? ' + 2 défense' : ''} = ${dTotal}${board[r2][c2].defending ? ' 🛡' : ''}`, 'combat-detail');

  let attackerWins;
  if (aTotal !== dTotal) {
    attackerWins = aTotal > dTotal;
  } else {
    /* Tiebreaker: score */
    let ts1 = 0, ts2 = 0;
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c].owner === 1) ts1++;
        if (board[r][c].owner === 2) ts2++;
      }
    const aScore   = (currentPlayer === 1 ? ts1 : ts2) + killPoints[currentPlayer];
    const dPlayer  = currentPlayer === 1 ? 2 : 1;
    const dScore   = (dPlayer === 1 ? ts1 : ts2) + killPoints[dPlayer];
    if (aScore > dScore)      { attackerWins = true;  addLog(`⚖ Égalité dés → ${an} gagne au score (${aScore}>${dScore})`, 'combat'); }
    else if (dScore > aScore) { attackerWins = false; addLog(`⚖ Égalité dés → ${dn} gagne au score (${dScore}>${aScore})`, 'combat'); }
    else                      { attackerWins = false; addLog(`⚖ Double égalité → avantage défenseur ${dn}`, 'combat'); }
  }

  if (attackerWins) {
    const kpts = UNITS[dUnit].killPts;
    killPoints[currentPlayer] += kpts;
    addLog(`✿ Victoire ${an} ! +${kpts} pts kill [${aTotal}>${dTotal}]`, 'kill');
    playCombatSound(true);
    animatePiece(r2, c2, 'anim-die', 600);
    const dstPt    = getCellCenter(r2, c2);
    const killColor = dUnit === 'T' ? '#f4a261' : dUnit === 'C' ? '#c090f0' : '#e8588a';
    spawnParticles(dstPt.x, dstPt.y, killColor, 20, true);
    shakeBoard();
    const killLabel = { T: '💥 TANK DÉTRUIT !', C: '⚡ CAVALIER ABATTU !', S: '💀 SOLDAT ÉLIMINÉ !' }[dUnit];
    spawnKillBanner(killLabel);
    setTimeout(() => {
      board[r1][c1].bonusBuff = false;
      board[r1][c1].defending = false;
      doMove(r1, c1, r2, c2, cost);
      checkWin();
      renderBoard();
    }, 350);
  } else {
    addLog(`💀 ${an} perd. ${UNITS[aUnit].label} détruit [${aTotal}≤${dTotal}]`, 'warn');
    playCombatSound(false);
    animatePiece(r1, c1, 'anim-die', 600);
    const srcPt = getCellCenter(r1, c1);
    spawnParticles(srcPt.x, srcPt.y, aColor, 14, true);
    if (aUnit === 'T') shakeBoard();
    board[r1][c1].bonusBuff = false;
    board[r2][c2].bonusBuff = false;
    board[r1][c1].unit      = null;
    board[r1][c1].player    = 0;
    movePoints -= cost;
    checkWin();
  }
  updateMoveUI();
}

/* ══════════════════ DEFEND ACTION ══════════════════ */

function activateDefend() {
  if (!diceRolled) { addLog("Lancez le dé d'abord !", 'warn'); return; }
  if (!selectedCell) { addLog("Sélectionnez d'abord une unité à mettre en défense.", 'warn'); return; }
  const [r, c] = selectedCell;
  if (board[r][c].player !== currentPlayer) { addLog("Ce n'est pas votre unité !", 'warn'); return; }

  if (board[r][c].defending) {
    board[r][c].defending = false;
    addLog(`🛡 ${UNITS[board[r][c].unit].label} en (${r},${c}) quitte le mode défense.`, 'info');
  } else {
    board[r][c].defending = true;
    movePoints = 0;
    addLog(`🛡 ${UNITS[board[r][c].unit].label} en (${r},${c}) est en DÉFENSE ! (+2 contre attaques ennemies ce tour)`, 'capture');
  }
  selectedCell = null;
  updateMoveUI();
  renderBoard();
}

/* ══════════════════ WIN CHECK ══════════════════ */

function checkWin() {
  let s1 = 0, s2 = 0, u1 = 0, u2 = 0;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].owner === 1) s1++;
      if (board[r][c].owner === 2) s2++;
      if (board[r][c].player === 1 && board[r][c].unit) u1++;
      if (board[r][c].player === 2 && board[r][c].unit) u2++;
    }
  if (s1 >= WIN_GOAL || u2 === 0) showWin(CFG.p1, s1, s2);
  else if (s2 >= WIN_GOAL || u1 === 0) showWin(CFG.p2, s1, s2);
}

function showWin(name, s1, s2) {
  stopTimer();
  const k1       = killPoints[1], k2 = killPoints[2];
  const diffName = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }[CFG.diff];
  document.getElementById('modal-content').innerHTML = `
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
