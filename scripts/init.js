/* ══════════════════ INIT GAME ══════════════════ */
function initGame(){
  /* Restore modal HTML in case it was replaced by winner screen */
  document.getElementById('modal-content').innerHTML = MODAL_ORIGINAL_HTML;

  CFG.p1 = document.getElementById('p1-name').value.trim()||'Alice';
  CFG.mode = document.querySelector('#mode-opts .opt-btn.selected, #mode-opts .opt-btn.sel-v, #mode-opts .opt-btn.sel-g')?.dataset.val || 'pvp';
  CFG.p2 = CFG.mode==='ai' ? 'Ordinateur' : (document.getElementById('p2-name').value.trim()||'Bob');
  CFG.aiLevel = document.querySelector('#ai-opts .opt-btn.selected, #ai-opts .opt-btn.sel-v, #ai-opts .opt-btn.sel-g')?.dataset.val || 'ai-medium';
  CFG.size = parseInt(document.querySelector('#map-opts .opt-btn.selected, #map-opts .opt-btn.sel-v, #map-opts .opt-btn.sel-g')?.dataset.val || '8');
  CFG.diff = document.querySelector('#diff-opts .opt-btn.selected, #diff-opts .opt-btn.sel-v, #diff-opts .opt-btn.sel-g')?.dataset.val || 'easy';
  CFG.timerSec = parseInt(document.querySelector('#timer-opts .opt-btn.selected')?.dataset.val || '0');
  SIZE = CFG.size;
  WIN_GOAL = Math.floor((SIZE*SIZE)/2)+1;
  const dc = DIFF_CONFIG[CFG.diff];
  initialUnits = { 1:[...dc.units], 2:[...dc.units] };
  placeUnitsLeft = { 1:[...dc.units], 2:[...dc.units] };
  placedUnits = { 1:[], 2:[] };
  killPoints = { 1:0, 2:0 };
  revealedCells = new Set();
  aiKnownTraps = new Set();
  aiKnownBonus = new Set();
  currentPlayer = 1;
  placePlayer = 1;
  placementPhase = true;
  board=[];
  initBoardData(dc.bonusCount, dc.trapCount);
  /* update names in game UI */
  document.getElementById('pc-name-p1').textContent=CFG.p1;
  document.getElementById('pc-name-p2').textContent=CFG.p2;
  document.getElementById('av-p1').textContent=CFG.p1[0].toUpperCase();
  document.getElementById('av-p2').textContent=CFG.mode==='ai'?'🤖':CFG.p2[0].toUpperCase();
  document.getElementById('wr-name-p1').textContent=CFG.p1;
  document.getElementById('wr-name-p2').textContent=CFG.p2;
  document.getElementById('wr-title').textContent=`course vers la victoire · ${WIN_GOAL} cases`;
  document.getElementById('dom-win-goal').textContent=`${WIN_GOAL} cases pour gagner`;
  document.getElementById('wr-goal').textContent=`/ ${WIN_GOAL}`;
  document.getElementById('wr-goal2').textContent=`/ ${WIN_GOAL}`;
  document.getElementById('roll-name-p1').textContent=CFG.p1;
  document.getElementById('roll-name-p2').textContent=CFG.p2;
  document.getElementById('rbtn-name-p1').textContent=CFG.p1;
  document.getElementById('rbtn-name-p2').textContent=CFG.p2;
  /* placement screen */
  buildPlacementUI();
  showScreen('place-screen');
}

/* ══════════════════ BOARD DATA INIT ══════════════════ */
let _bonusCount = 4, _trapCount = 4; // remembered for reshuffle

function initBoardData(bonusCount, trapCount){
  _bonusCount = bonusCount; _trapCount = trapCount;
  bonusCells=new Set(); trapCells=new Set(); revealedCells=new Set();
  for(let r=0;r<SIZE;r++){board[r]=[];for(let c=0;c<SIZE;c++){board[r][c]={player:0,owner:0,unit:null,bonus:false,trap:false,startZone:0,bonusBuff:false};}}
  /* start zones: p1 top-left 2 rows, p2 bottom-right 2 rows */
  for(let r=0;r<2;r++)for(let c=0;c<Math.min(SIZE,Math.ceil(initialUnits[1].length/2)+1);c++)board[r][c].startZone=1;
  for(let r=SIZE-2;r<SIZE;r++)for(let c=Math.max(0,SIZE-Math.ceil(initialUnits[2].length/2)-1);c<SIZE;c++)board[r][c].startZone=2;
  placeSpecials(bonusCount, trapCount);
}

function placeSpecials(bonusCount, trapCount){
  /* clear old specials from board data */
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){board[r][c].bonus=false;board[r][c].trap=false;}
  bonusCells=new Set(); trapCells=new Set();
  const midMin=2,midMax=SIZE-3;
  const placed=new Set();
  /* never place on occupied cells */
  function rndMid(){
    let r,c,k,tries=0;
    do{
      r=midMin+Math.floor(Math.random()*(midMax-midMin+1));
      c=midMin+Math.floor(Math.random()*(midMax-midMin+1));
      k=`${r},${c}`;tries++;
    }while((placed.has(k)||board[r][c].startZone||board[r][c].unit)&&tries<200);
    placed.add(k);return[r,c,k];
  }
  for(let i=0;i<bonusCount;i++){const[r,c,k]=rndMid();board[r][c].bonus=true;bonusCells.add(k);}
  for(let i=0;i<trapCount;i++){const[r,c,k]=rndMid();board[r][c].trap=true;trapCells.add(k);}
}

function reshuffleSpecials(){
  placeSpecials(_bonusCount, _trapCount);
  revealedCells = new Set(); // reset visibility — all hidden again
  addLog('🌀 Les cases spéciales se sont déplacées…', 'info');
}