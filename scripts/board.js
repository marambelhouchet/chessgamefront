/* ══════════════════ GAME GRID ══════════════════ */
function buildGameGrid(){
  const grid=document.getElementById('board');
  grid.style.gridTemplateColumns=`repeat(${SIZE},var(--cell))`;
  grid.innerHTML='';
  const cc=document.getElementById('col-coords');cc.innerHTML='<div style="width:4px"></div>';
  for(let c=0;c<SIZE;c++)cc.innerHTML+=`<div class="coord-lbl">${c}</div>`;
  const rn=document.getElementById('row-nums');rn.innerHTML='';
  for(let r=0;r<SIZE;r++)rn.innerHTML+=`<div class="row-num">${r}</div>`;
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    const el=document.createElement('div');el.className='cell';el.id=`c${r}_${c}`;
    el.onclick=()=>handleClick(r,c);grid.appendChild(el);
  }
}

/* ══════════════════ REVEAL LOGIC ══════════════════ */
function revealCellIfSpecial(r, c){
  const k=`${r},${c}`;
  if((board[r][c].bonus||board[r][c].trap)&&!revealedCells.has(k)){
    revealedCells.add(k);
    const type = board[r][c].bonus ? 'Bonus ✦' : 'Piège ✗';
    addLog(`👁 Case (${r},${c}) révélée : ${type}`, 'info');
  }
}
/* Reveal special cells adjacent (including diagonals) to all current units of a player */
function revealAroundUnits(){
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    if(board[r][c].unit){
      /* check the cell itself and 8 neighbors */
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
        const nr=r+dr,nc=c+dc;
        if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&(board[nr][nc].bonus||board[nr][nc].trap)){
          revealCellIfSpecial(nr,nc);
        }
      }
    }
  }
}

/* ══════════════════ RENDER BOARD + SCORE ══════════════════ */
function renderBoard(){
  revealAroundUnits();
  let s1=0,s2=0,u1=0,u2=0,b1=0,b2=0;
  const alive1=[],alive2=[];
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const el=document.getElementById(`c${r}_${c}`);const d=board[r][c];
      const k=`${r},${c}`;
      const isRevealed = revealedCells.has(k);
      el.className='cell';
      /* show special markers only if revealed */
      if(d.bonus && isRevealed) el.classList.add('bonus');
      if(d.trap && isRevealed) el.classList.add('trap');
      /* fog indicator: special but not yet revealed — subtle shimmer */
      if((d.bonus||d.trap) && !isRevealed && !d.unit) el.classList.add('cell-fog');
      if(d.owner===1){el.classList.add('territory-p1');s1++;}
      else if(d.owner===2){el.classList.add('territory-p2');s2++;}
      if(d.unit)el.classList.add('has-unit');
      if(selectedCell&&selectedCell[0]===r&&selectedCell[1]===c)el.classList.add('selected');
      el.innerHTML=d.unit?pieceSVG(d.unit,d.player,{buffed:!!d.bonusBuff})+(d.bonusBuff?'<span style="position:absolute;top:1px;left:2px;font-size:9px;z-index:4;text-shadow:0 0 6px gold">⚡</span>':''):'';
      if(d.player===1&&d.unit){u1++;alive1.push(d.unit);if(d.bonus)b1++;}
      if(d.player===2&&d.unit){u2++;alive2.push(d.unit);if(d.bonus)b2++;}
    }
  }
  updateScorePanel(s1,s2,u1,u2,b1,b2,alive1,alive2);
}

function updateScorePanel(s1,s2,u1,u2,b1,b2,alive1,alive2){
  const TOTAL=SIZE*SIZE;
  const k1=killPoints[1],k2=killPoints[2];
  const tot1=s1+k1,tot2=s2+k2;
  document.getElementById('score-terr-p1').textContent=s1;document.getElementById('score-kill-p1').textContent=k1;document.getElementById('score-total-p1').textContent=tot1;
  document.getElementById('score-terr-p2').textContent=s2;document.getElementById('score-kill-p2').textContent=k2;document.getElementById('score-total-p2').textContent=tot2;
  const dp1=Math.max(Math.round((s1/TOTAL)*100),2);const dp2=Math.max(Math.round((s2/TOTAL)*100),2);
  document.getElementById('dom-fill-p1').style.width=dp1+'%';document.getElementById('dom-fill-p2').style.width=dp2+'%';
  document.getElementById('dom-lbl-p1').textContent=`${CFG.p1} — ${s1} cases · ${k1} pts kill`;
  document.getElementById('dom-lbl-p2').textContent=`${k2} pts kill · ${s2} cases — ${CFG.p2}`;
  const neutral=TOTAL-s1-s2;
  let lead=s1>s2?`${CFG.p1} mène +${s1-s2}`:s2>s1?`${CFG.p2} mène +${s2-s1}`:'Territoire à égalité';
  document.getElementById('dom-lead').textContent=lead+(neutral>0?` · ${neutral} libres`:'');
  const init=initialUnits[1].length;
  document.getElementById('units-p1').textContent=`${u1} / ${init}`;document.getElementById('units-p2').textContent=`${u2} / ${init}`;
  document.getElementById('ubar-p1').style.width=Math.round((u1/init)*100)+'%';document.getElementById('ubar-p2').style.width=Math.round((u2/init)*100)+'%';
  document.getElementById('bonus-p1').textContent=b1;document.getElementById('bonus-p2').textContent=b2;
  const pp1=Math.min(Math.round((s1/WIN_GOAL)*100),100);const pp2=Math.min(Math.round((s2/WIN_GOAL)*100),100);
  document.getElementById('prog-p1-pct').textContent=pp1+'%';document.getElementById('prog-p2-pct').textContent=pp2+'%';
  document.getElementById('pbar-p1').style.width=pp1+'%';document.getElementById('pbar-p2').style.width=pp2+'%';
  document.getElementById('wr-p1').style.width=Math.max(pp1,2)+'%';document.getElementById('wr-p2').style.width=Math.max(pp2,2)+'%';
  document.getElementById('wr-n-p1').textContent=s1;document.getElementById('wr-n-p2').textContent=s2;
  renderPips('pips-p1',1,initialUnits[1],alive1);
  renderPips('pips-p2',2,initialUnits[2],alive2);
  document.getElementById('pcard-p1').className='pcard p1'+(currentPlayer===1?' active':'');
  document.getElementById('pcard-p2').className='pcard p2'+(currentPlayer===2?' active':'');
  document.getElementById('badge-p1').className='pc-turn-badge'+(currentPlayer===1?' p1':' wait');
  document.getElementById('badge-p1').textContent=currentPlayer===1?'▶ EN JEU':'attend…';
  document.getElementById('badge-p2').className='pc-turn-badge'+(currentPlayer===2?' p2':' wait');
  document.getElementById('badge-p2').textContent=currentPlayer===2?'▶ EN JEU':'attend…';
}

function renderPips(id,player,initial,alive){
  const el=document.getElementById(id);if(!el)return;
  const aMap={S:0,C:0,T:0};alive.forEach(u=>{aMap[u]=(aMap[u]||0)+1;});
  const shown={S:0,C:0,T:0};let html='';
  initial.forEach(u=>{
    const dead=shown[u]>=(aMap[u]||0);const isTank=u==='T';
    html+=`<div class="upip p${player}${isTank?' tank':''}${dead?' dead':''}" title="${UNITS[u].label} · Force ${UNITS[u].power} · Kill=${UNITS[u].killPts}pts"><div class="utype">${u}</div><div class="uforce">F${UNITS[u].power}·${UNITS[u].killPts}p</div></div>`;
    shown[u]=(shown[u]||0)+1;
  });
  el.innerHTML=html;
}

function showReachable(){
  if(!selectedCell)return;
  const[sr,sc]=selectedCell;const stats=UNITS[board[sr][sc].unit];
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    if(r===sr&&c===sc)continue;
    const dr=Math.abs(r-sr),dc=Math.abs(c-sc),dist=dr+dc;
    if((r===sr||c===sc)&&dist<=stats.maxStep&&dist<=movePoints&&board[r][c].player!==currentPlayer)
      document.getElementById(`c${r}_${c}`).classList.add('reachable');
  }
}