/* ══════════════════ GAME STATE ══════════════════ */

/* ── Configuration (built at init) ── */
let CFG = {
  p1: 'Alice',
  p2: 'Bob',
  size: 8,
  diff: 'easy',
  timerSec: 0,
  mode: 'pvp',
  aiLevel: 'ai-medium'
};

let WIN_GOAL = 33;
let SIZE = 8;

/* ── Board & turn ── */
let board = [];
let currentPlayer = 1;
let selectedCell = null;
let movePoints = 0;
let diceRolled = false;
let startRolls = [0, 0];

/* ── Special cells ── */
let bonusCells   = new Set();
let trapCells    = new Set();
let revealedCells = new Set(); // cells whose type (bonus/trap) has been revealed

/* ── Unit tracking ── */
let initialUnits = { 1: [], 2: [] };
let placedUnits  = { 1: [], 2: [] };
let killPoints   = { 1: 0,  2: 0  };

/* ── Placement phase ── */
let placementPhase = true;
let placePlayer    = 1;
let placeUnitType  = 'S';
let placeUnitsLeft = { 1: [], 2: [] };

/* ── Timer ── */
let timerInterval = null;
let timerRemain   = 0;

/* ── Replay ── */
let boardSnapshot = null; // saved after placement for replay

/* ── Special counts (remembered for reshuffle) ── */
let _bonusCount = 4;
let _trapCount  = 4;
