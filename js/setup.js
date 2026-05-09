/* ══════════════════ SETUP / INIT GAME ══════════════════ */

function initGame() {
  /* Restore modal HTML in case it was replaced by winner screen */
  document.getElementById('modal-content').innerHTML = MODAL_ORIGINAL_HTML;

  CFG.p1      = document.getElementById('p1-name').value.trim() || 'Alice';
  CFG.mode    = document.querySelector('#mode-opts .opt-btn.selected, #mode-opts .opt-btn.sel-v, #mode-opts .opt-btn.sel-g')?.dataset.val || 'pvp';
  CFG.p2      = CFG.mode === 'ai' ? 'Ordinateur' : (document.getElementById('p2-name').value.trim() || 'Bob');
  CFG.aiLevel = document.querySelector('#ai-opts .opt-btn.selected, #ai-opts .opt-btn.sel-v, #ai-opts .opt-btn.sel-g')?.dataset.val || 'ai-medium';
  CFG.size    = parseInt(document.querySelector('#map-opts .opt-btn.selected, #map-opts .opt-btn.sel-v, #map-opts .opt-btn.sel-g')?.dataset.val || '8');
  CFG.diff    = document.querySelector('#diff-opts .opt-btn.selected, #diff-opts .opt-btn.sel-v, #diff-opts .opt-btn.sel-g')?.dataset.val || 'easy';
  CFG.timerSec = parseInt(document.querySelector('#timer-opts .opt-btn.selected')?.dataset.val || '0');

  SIZE     = CFG.size;
  WIN_GOAL = Math.floor((SIZE * SIZE) / 2) + 1;

  const dc = DIFF_CONFIG[CFG.diff];
  initialUnits  = { 1: [...dc.units], 2: [...dc.units] };
  placeUnitsLeft = { 1: [...dc.units], 2: [...dc.units] };
  placedUnits   = { 1: [], 2: [] };
  killPoints    = { 1: 0, 2: 0 };
  revealedCells = new Set();
  aiKnownTraps  = new Set();
  aiKnownBonus  = new Set();
  currentPlayer  = 1;
  placePlayer    = 1;
  placementPhase = true;
  board          = [];

  initBoardData(dc.bonusCount, dc.trapCount);

  /* Update names in game UI */
  document.getElementById('pc-name-p1').textContent = CFG.p1;
  document.getElementById('pc-name-p2').textContent = CFG.p2;
  document.getElementById('av-p1').textContent = CFG.p1[0].toUpperCase();
  document.getElementById('av-p2').textContent = CFG.mode === 'ai' ? '🤖' : CFG.p2[0].toUpperCase();
  document.getElementById('wr-name-p1').textContent  = CFG.p1;
  document.getElementById('wr-name-p2').textContent  = CFG.p2;
  document.getElementById('wr-title').textContent    = `course vers la victoire · ${WIN_GOAL} cases`;
  document.getElementById('dom-win-goal').textContent = `${WIN_GOAL} cases pour gagner`;
  document.getElementById('wr-goal').textContent     = `/ ${WIN_GOAL}`;
  document.getElementById('wr-goal2').textContent    = `/ ${WIN_GOAL}`;
  document.getElementById('roll-name-p1').textContent = CFG.p1;
  document.getElementById('roll-name-p2').textContent = CFG.p2;
  document.getElementById('rbtn-name-p1').textContent = CFG.p1;
  document.getElementById('rbtn-name-p2').textContent = CFG.p2;

  buildPlacementUI();
  showScreen('place-screen');
}
