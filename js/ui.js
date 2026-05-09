/* ══════════════════ UI — SCORE PANEL ══════════════════ */

function updateScorePanel(s1, s2, u1, u2, b1, b2, alive1, alive2) {
  const TOTAL = SIZE * SIZE;
  const k1    = killPoints[1], k2 = killPoints[2];
  const tot1  = s1 + k1, tot2 = s2 + k2;

  document.getElementById('score-terr-p1').textContent  = s1;
  document.getElementById('score-kill-p1').textContent  = k1;
  document.getElementById('score-total-p1').textContent = tot1;
  document.getElementById('score-terr-p2').textContent  = s2;
  document.getElementById('score-kill-p2').textContent  = k2;
  document.getElementById('score-total-p2').textContent = tot2;

  const dp1 = Math.max(Math.round((s1 / TOTAL) * 100), 2);
  const dp2 = Math.max(Math.round((s2 / TOTAL) * 100), 2);
  document.getElementById('dom-fill-p1').style.width = dp1 + '%';
  document.getElementById('dom-fill-p2').style.width = dp2 + '%';
  document.getElementById('dom-lbl-p1').textContent = `${CFG.p1} — ${s1} cases · ${k1} pts kill`;
  document.getElementById('dom-lbl-p2').textContent = `${k2} pts kill · ${s2} cases — ${CFG.p2}`;

  const neutral = TOTAL - s1 - s2;
  const lead    = s1 > s2 ? `${CFG.p1} mène +${s1-s2}` : s2 > s1 ? `${CFG.p2} mène +${s2-s1}` : 'Territoire à égalité';
  document.getElementById('dom-lead').textContent = lead + (neutral > 0 ? ` · ${neutral} libres` : '');

  const init = initialUnits[1].length;
  document.getElementById('units-p1').textContent = `${u1} / ${init}`;
  document.getElementById('units-p2').textContent = `${u2} / ${init}`;
  document.getElementById('ubar-p1').style.width  = Math.round((u1 / init) * 100) + '%';
  document.getElementById('ubar-p2').style.width  = Math.round((u2 / init) * 100) + '%';
  document.getElementById('bonus-p1').textContent = b1;
  document.getElementById('bonus-p2').textContent = b2;

  const pp1 = Math.min(Math.round((s1 / WIN_GOAL) * 100), 100);
  const pp2 = Math.min(Math.round((s2 / WIN_GOAL) * 100), 100);
  document.getElementById('prog-p1-pct').textContent = pp1 + '%';
  document.getElementById('prog-p2-pct').textContent = pp2 + '%';
  document.getElementById('pbar-p1').style.width = pp1 + '%';
  document.getElementById('pbar-p2').style.width = pp2 + '%';
  document.getElementById('wr-p1').style.width   = Math.max(pp1, 2) + '%';
  document.getElementById('wr-p2').style.width   = Math.max(pp2, 2) + '%';
  document.getElementById('wr-n-p1').textContent = s1;
  document.getElementById('wr-n-p2').textContent = s2;

  renderPips('pips-p1', 1, initialUnits[1], alive1);
  renderPips('pips-p2', 2, initialUnits[2], alive2);

  document.getElementById('pcard-p1').className = 'pcard p1' + (currentPlayer === 1 ? ' active' : '');
  document.getElementById('pcard-p2').className = 'pcard p2' + (currentPlayer === 2 ? ' active' : '');
  document.getElementById('badge-p1').className = 'pc-turn-badge' + (currentPlayer === 1 ? ' p1' : ' wait');
  document.getElementById('badge-p1').textContent = currentPlayer === 1 ? '▶ EN JEU' : 'attend…';
  document.getElementById('badge-p2').className = 'pc-turn-badge' + (currentPlayer === 2 ? ' p2' : ' wait');
  document.getElementById('badge-p2').textContent = currentPlayer === 2 ? '▶ EN JEU' : 'attend…';
}

/* ── Unit pip display ── */
function renderPips(id, player, initial, alive) {
  const el = document.getElementById(id);
  if (!el) return;
  const aMap   = { S: 0, C: 0, T: 0 };
  alive.forEach(u => { aMap[u] = (aMap[u] || 0) + 1; });
  const shown  = { S: 0, C: 0, T: 0 };
  let html = '';
  initial.forEach(u => {
    const dead   = shown[u] >= (aMap[u] || 0);
    const isTank = u === 'T';
    html += `<div class="upip p${player}${isTank ? ' tank' : ''}${dead ? ' dead' : ''}" title="${UNITS[u].label} · Force ${UNITS[u].power} · Kill=${UNITS[u].killPts}pts"><div class="utype">${u}</div><div class="uforce">F${UNITS[u].power}·${UNITS[u].killPts}p</div></div>`;
    shown[u] = (shown[u] || 0) + 1;
  });
  el.innerHTML = html;
}

/* ══════════════════ UI — TURN & MOVE ══════════════════ */

function updateTurnUI() {
  const name  = currentPlayer === 1 ? CFG.p1 : CFG.p2;
  const cls   = currentPlayer === 1 ? 'p1' : 'p2';
  const badge = document.getElementById('turn-badge');
  badge.textContent = `Tour de ${name}`;
  badge.className   = `turn-badge ${cls}`;
  document.getElementById('move-pts').textContent  = '—';
  document.getElementById('dice-pips').innerHTML   = '';
}

function updateMoveUI() {
  const pts       = Math.max(0, movePoints);
  document.getElementById('move-pts').textContent = pts;
  const btn       = document.getElementById('btn-end');
  const warn      = document.getElementById('move-warning');
  const defendBtn = document.getElementById('btn-defend');

  if (!diceRolled) {
    btn.disabled = true;
    if (defendBtn) defendBtn.disabled = true;
    warn.textContent = '';
    return;
  }

  if (defendBtn) {
    const hasSelection = selectedCell && board[selectedCell[0]][selectedCell[1]].player === currentPlayer;
    defendBtn.disabled = !hasSelection;
    if (hasSelection && board[selectedCell[0]][selectedCell[1]].defending) {
      defendBtn.textContent = '🛡 Annuler défense';
      defendBtn.classList.add('defending-active');
    } else {
      defendBtn.textContent = '🛡 Défendre';
      defendBtn.classList.remove('defending-active');
    }
  }

  if (pts <= 0) {
    btn.disabled     = false;
    warn.textContent = '';
  } else if (!hasPossibleMove()) {
    btn.disabled     = false;
    warn.textContent = 'Aucun mouvement possible.';
  } else {
    btn.disabled     = true;
    warn.textContent = `⚠ Utilisez vos ${pts} pt(s) d'abord !`;
  }
}

function hasPossibleMove() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].player !== currentPlayer || !board[r][c].unit) continue;
      if (getValidMoves(r, c, movePoints).length > 0) return true;
    }
  return false;
}

/* ══════════════════ UI — LOG ══════════════════ */

function addLog(msg, type = 'info') {
  const el  = document.getElementById('log');
  const div = document.createElement('div');
  div.className   = `log-entry ${type}`;
  div.textContent = msg;
  el.prepend(div);
}

/* ══════════════════ UI — RULES PREVIEWS ══════════════════ */

function fillRulesPreviews() {
  const ids = { S: 'ru-s', C: 'ru-c', T: 'ru-t' };
  for (const [unit, id] of Object.entries(ids)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = pieceSVG(unit, 1);
  }
}
