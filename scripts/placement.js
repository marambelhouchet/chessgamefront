/* ══════════════════ PLACEMENT PHASE ══════════════════ */
function buildPlacementUI(){
  buildPlaceGrid();
  renderPlaceBoard();
  updatePlaceUI();
  /* Si IA et c'est son tour de placer en premier */
  if(CFG.mode==='ai'&&placePlayer===2)setTimeout(aiAutoPlace,600);
}

function buildPlaceGrid(){
  const board_el=document.getElementById('place-board');
  board_el.style.gridTemplateColumns=`repeat(${SIZE},var(--cell))`;
  board_el.style.display='grid';
  board_el.style.gap='2px';
  board_el.style.background='rgba(232,88,138,0.1)';
  board_el.style.padding='3px';
  board_el.style.borderRadius='14px';
  board_el.style.border='1.5px solid rgba(232,88,138,0.28)';
  board_el.innerHTML='';
  const cc=document.getElementById('place-col-coords');cc.innerHTML='<div style="width:4px"></div>';
  for(let c=0;c<SIZE;c++)cc.innerHTML+=`<div class="coord-lbl">${c}</div>`;
  const rn=document.getElementById('place-row-nums');rn.innerHTML='';
  for(let r=0;r<SIZE;r++)rn.innerHTML+=`<div class="row-num">${r}</div>`;
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    const el=document.createElement('div');el.className='cell';el.id=`pc${r}_${c}`;
    el.onclick=()=>handlePlaceClick(r,c);board_el.appendChild(el);
  }
}

function renderPlaceBoard(){
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    const el=document.getElementById(`pc${r}_${c}`);const d=board[r][c];
    el.className='cell';
    /* specials are hidden during placement — revealed only in-game */
    if(d.owner===1)el.classList.add('territory-p1');
    else if(d.owner===2)el.classList.add('territory-p2');
    if(d.unit)el.classList.add('has-unit');
    if(!d.unit && d.startZone===placePlayer && placeUnitsLeft[placePlayer].length>0){
      el.classList.add('place-valid');
    } else if(d.startZone===1&&placePlayer!==1)el.classList.add('start-zone-p1');
    else if(d.startZone===2&&placePlayer!==2)el.classList.add('start-zone-p2');
    el.innerHTML=d.unit?pieceSVG(d.unit,d.player):'';
  }
}

function updatePlaceUI(){
  const left=placeUnitsLeft[placePlayer];
  const pName=placePlayer===1?CFG.p1:CFG.p2;
  const pEl=document.getElementById('place-player-name');
  pEl.textContent=pName;
  pEl.className='pi-player '+(placePlayer===1?'p1':'p2');
  document.getElementById('place-count').textContent=left.length;
  /* Build picker */
  const picker=document.getElementById('unit-picker');picker.innerHTML='';
  const counts={S:0,C:0,T:0};left.forEach(u=>counts[u]++);
  ['S','C','T'].forEach(u=>{
    if(counts[u]===0)return;
    const btn=document.createElement('button');
    btn.className='upick-btn'+(u===placeUnitType?' selected':'');
    btn.disabled=counts[u]===0;
    btn.innerHTML=`<div class="upick-icon">${pieceSVG(u,placePlayer)}</div><div class="upick-info"><div class="upick-name">${UNITS[u].label}</div><div class="upick-count">×${counts[u]} disponible(s)</div></div>`;
    btn.onclick=()=>selectPlaceUnit(u);
    picker.appendChild(btn);
  });
}

function selectPlaceUnit(u){
  placeUnitType=u;
  updatePlaceUI();
}

function handlePlaceClick(r,c){
  /* If it's AI's turn, ignore human clicks */
  if(CFG.mode==='ai' && placePlayer===2) return;
  const d=board[r][c];
  if(d.startZone!==placePlayer||d.unit||placeUnitsLeft[placePlayer].length===0)return;
  let idx=placeUnitsLeft[placePlayer].indexOf(placeUnitType);
  if(idx===-1)idx=0;
  const unitType=placeUnitsLeft[placePlayer][idx];
  placeUnitsLeft[placePlayer].splice(idx,1);
  board[r][c].unit=unitType;board[r][c].player=placePlayer;board[r][c].owner=placePlayer;
  placedUnits[placePlayer].push(unitType);
  addPlaceLog(`${placePlayer===1?CFG.p1:CFG.p2} place ${UNITS[unitType].label} en (${r},${c})`);
  if(placeUnitsLeft[placePlayer].length===0&&placeUnitsLeft[placePlayer===1?2:1].length===0){finishPlacement();return;}
  placePlayer=placePlayer===1?2:1;
  if(placeUnitsLeft[placePlayer].length===0)placePlayer=placePlayer===1?2:1;
  if(placeUnitsLeft[placePlayer].length>0){placeUnitType=placeUnitsLeft[placePlayer][0];}
  renderPlaceBoard();updatePlaceUI();
  /* If now AI's turn, auto-place after delay */
  if(CFG.mode==='ai' && placePlayer===2) setTimeout(aiAutoPlace, 600);
}

function addPlaceLog(msg){
  const el=document.getElementById('place-log');
  const div=document.createElement('div');
  div.style.cssText='margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.64rem;color:var(--muted)';
  div.textContent=msg;el.prepend(div);
}

let boardSnapshot = null; // saved after placement for replay

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

function finishPlacement(){
  addPlaceLog('Placement terminé ! La bataille commence.');
  /* Save board snapshot for replay */
  boardSnapshot = board.map(row => row.map(cell => ({...cell})));
  /* Restore original dice-roll modal HTML in case it was replaced by winner screen */
  document.getElementById('modal-content').innerHTML = MODAL_ORIGINAL_HTML;
  /* start dice roll modal */
  showScreen('game-screen');
  buildGameGrid();
  renderBoard();
  updateTurnUI();
  /* reset modal */
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
}