/* ══════════════════ PLACEMENT PHASE ══════════════════ */

function buildPlacementUI() {
  buildPlaceGrid();
  renderPlaceBoard();
  updatePlaceUI();
  /* If AI goes first in placement */
  if (CFG.mode === 'ai' && placePlayer === 2) setTimeout(aiAutoPlace, 600);
}

function buildPlaceGrid() {
  const boardEl = document.getElementById('place-board');
  boardEl.style.gridTemplateColumns = `repeat(${SIZE},var(--cell))`;
  boardEl.style.display    = 'grid';
  boardEl.style.gap        = '2px';
  boardEl.style.background = 'rgba(232,88,138,0.1)';
  boardEl.style.padding    = '3px';
  boardEl.style.borderRadius = '14px';
  boardEl.style.border     = '1.5px solid rgba(232,88,138,0.28)';
  boardEl.innerHTML        = '';

  const cc = document.getElementById('place-col-coords');
  cc.innerHTML = '<div style="width:4px"></div>';
  for (let c = 0; c < SIZE; c++) cc.innerHTML += `<div class="coord-lbl">${c}</div>`;

  const rn = document.getElementById('place-row-nums');
  rn.innerHTML = '';
  for (let r = 0; r < SIZE; r++) rn.innerHTML += `<div class="row-num">${r}</div>`;

  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const el = document.createElement('div');
      el.className = 'cell';
      el.id        = `pc${r}_${c}`;
      el.onclick   = () => handlePlaceClick(r, c);
      boardEl.appendChild(el);
    }
}

function renderPlaceBoard() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const el = document.getElementById(`pc${r}_${c}`);
      const d  = board[r][c];
      el.className = 'cell';
      if (d.owner === 1) el.classList.add('territory-p1');
      else if (d.owner === 2) el.classList.add('territory-p2');
      if (d.unit) el.classList.add('has-unit');
      if (!d.unit && d.startZone === placePlayer && placeUnitsLeft[placePlayer].length > 0) {
        el.classList.add('place-valid');
      } else if (d.startZone === 1 && placePlayer !== 1) {
        el.classList.add('start-zone-p1');
      } else if (d.startZone === 2 && placePlayer !== 2) {
        el.classList.add('start-zone-p2');
      }
      el.innerHTML = d.unit ? pieceSVG(d.unit, d.player) : '';
    }
}

function updatePlaceUI() {
  const left  = placeUnitsLeft[placePlayer];
  const pName = placePlayer === 1 ? CFG.p1 : CFG.p2;
  const pEl   = document.getElementById('place-player-name');
  pEl.textContent = pName;
  pEl.className   = 'pi-player ' + (placePlayer === 1 ? 'p1' : 'p2');
  document.getElementById('place-count').textContent = left.length;

  const picker = document.getElementById('unit-picker');
  picker.innerHTML = '';
  const counts = { S: 0, C: 0, T: 0 };
  left.forEach(u => counts[u]++);
  ['S', 'C', 'T'].forEach(u => {
    if (counts[u] === 0) return;
    const btn = document.createElement('button');
    btn.className = 'upick-btn' + (u === placeUnitType ? ' selected' : '');
    btn.disabled  = counts[u] === 0;
    btn.innerHTML = `<div class="upick-icon">${pieceSVG(u, placePlayer)}</div><div class="upick-info"><div class="upick-name">${UNITS[u].label}</div><div class="upick-count">×${counts[u]} disponible(s)</div></div>`;
    btn.onclick   = () => selectPlaceUnit(u);
    picker.appendChild(btn);
  });
}

function selectPlaceUnit(u) {
  placeUnitType = u;
  updatePlaceUI();
}

function handlePlaceClick(r, c) {
  if (CFG.mode === 'ai' && placePlayer === 2) return;
  const d = board[r][c];
  if (d.startZone !== placePlayer || d.unit || placeUnitsLeft[placePlayer].length === 0) return;

  let idx = placeUnitsLeft[placePlayer].indexOf(placeUnitType);
  if (idx === -1) idx = 0;
  const unitType = placeUnitsLeft[placePlayer][idx];
  placeUnitsLeft[placePlayer].splice(idx, 1);
  board[r][c].unit   = unitType;
  board[r][c].player = placePlayer;
  board[r][c].owner  = placePlayer;
  placedUnits[placePlayer].push(unitType);
  addPlaceLog(`${placePlayer === 1 ? CFG.p1 : CFG.p2} place ${UNITS[unitType].label} en (${r},${c})`);

  if (placeUnitsLeft[placePlayer].length === 0 && placeUnitsLeft[placePlayer === 1 ? 2 : 1].length === 0) {
    finishPlacement(); return;
  }
  placePlayer = placePlayer === 1 ? 2 : 1;
  if (placeUnitsLeft[placePlayer].length === 0) placePlayer = placePlayer === 1 ? 2 : 1;
  if (placeUnitsLeft[placePlayer].length > 0) placeUnitType = placeUnitsLeft[placePlayer][0];
  renderPlaceBoard(); updatePlaceUI();
  if (CFG.mode === 'ai' && placePlayer === 2) setTimeout(aiAutoPlace, 600);
}

function addPlaceLog(msg) {
  const el  = document.getElementById('place-log');
  const div = document.createElement('div');
  div.style.cssText = 'margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.64rem;color:var(--muted)';
  div.textContent   = msg;
  el.prepend(div);
}
