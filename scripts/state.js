/* ══════════════════ GAME STATE ══════════════════ */
let SIZE = 8;
let board = [], currentPlayer = 1, selectedCell = null;
let movePoints = 0, diceRolled = false, startRolls = [0,0];
let bonusCells = new Set(), trapCells = new Set();
let revealedCells = new Set(); // cells whose special type has been revealed
let initialUnits = { 1:[], 2:[] };
let placedUnits = { 1:[], 2:[] };
let killPoints = { 1:0, 2:0 };
let placementPhase = true;
let placePlayer = 1;
let placeUnitType = 'S';
let placeUnitsLeft = { 1:[], 2:[] };
let timerInterval = null, timerRemain = 0;
const CIRCUMFERENCE = 2 * Math.PI * 20; // r=20