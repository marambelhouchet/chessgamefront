/* ══════════════════ CONSTANTS ══════════════════ */

const UNITS = {
  S: { label: 'Soldat',   maxStep: 1, power: 2, killPts: 2, short: 'S', moveType: 'diagonal' },
  C: { label: 'Cavalier', maxStep: 2, power: 1, killPts: 3, short: 'C', moveType: 'straight' },
  T: { label: 'Tank',     maxStep: 1, power: 3, killPts: 5, short: 'T', moveType: 'all'      }
};

const DIFF_CONFIG = {
  easy:   { units: ['T','S','C','S','S'],                             bonusCount: 4,  trapCount: 4  },
  medium: { units: ['T','S','C','S','S','T','C'],                     bonusCount: 6,  trapCount: 6  },
  hard:   { units: ['T','T','S','C','S','S','C','S','S'],             bonusCount: 8,  trapCount: 10 }
};

/* Pip positions for each dice face */
const PIP = {
  1: [[29,29]],
  2: [[15,15],[43,43]],
  3: [[15,15],[29,29],[43,43]],
  4: [[15,15],[43,15],[15,43],[43,43]],
  5: [[15,15],[43,15],[29,29],[15,43],[43,43]],
  6: [[15,15],[43,15],[15,29],[43,29],[15,43],[43,43]]
};

const CIRCUMFERENCE = 2 * Math.PI * 20; // timer ring r=20
const CIRC = 125.66;                    // timer stroke dasharray

/* All screen IDs, for navigation */
const ALL_SCREENS = ['intro-screen','setup-screen','rules-screen','place-screen','game-screen'];
