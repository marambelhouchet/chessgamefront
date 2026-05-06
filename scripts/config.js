/* ══════════════════ UNIT DEFINITIONS ══════════════════ */
const UNITS = {
  S: { label:'Soldat',   maxStep:1, power:2, killPts:2, short:'S' },
  C: { label:'Cavalier', maxStep:2, power:1, killPts:3, short:'C' },
  T: { label:'Tank',     maxStep:1, power:3, killPts:5, short:'T' }
};

/* ══════════════════ DIFFICULTY CONFIG ══════════════════ */
const DIFF_CONFIG = {
  easy:   { units:['T','S','C','S','S'],                               bonusCount:4, trapCount:4  },
  medium: { units:['T','S','C','S','S','T','C'],                       bonusCount:6, trapCount:6  },
  hard:   { units:['T','T','S','C','S','S','C','S','S'],               bonusCount:8, trapCount:10 }
};

/* ══════════════════ GAME CONFIG ══════════════════ */
let CFG = { p1:'Alice', p2:'Bob', size:8, diff:'easy', timerSec:0, mode:'pvp', aiLevel:'ai-medium' };
let WIN_GOAL = 33;