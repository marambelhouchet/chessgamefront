/* ══════════════════ IA ══════════════════ */

/* --- Placement automatique de l'IA --- */
function aiAutoPlace(){
  if(placeUnitsLeft[2].length===0){finishPlacement();return;}
  /* Trouver toutes les cases valides pour le joueur 2 */
  const validCells=[];
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    if(board[r][c].startZone===2&&!board[r][c].unit)validCells.push([r,c]);
  }
  if(validCells.length===0){finishPlacement();return;}
  /* Choisir la case et l'unité */
  const [r,c]=validCells[Math.floor(Math.random()*validCells.length)];
  const unitType=placeUnitsLeft[2][0];
  placeUnitsLeft[2].shift();
  board[r][c].unit=unitType;board[r][c].player=2;board[r][c].owner=2;
  placedUnits[2].push(unitType);
  addPlaceLog(`🤖 ${CFG.p2} place ${UNITS[unitType].label} en (${r},${c})`);

  /* Tous placés ? */
  if(placeUnitsLeft[1].length===0&&placeUnitsLeft[2].length===0){finishPlacement();return;}

  /* Passer au joueur humain s'il reste des unités */
  placePlayer=1;
  if(placeUnitsLeft[1].length===0){
    placePlayer=2;
    setTimeout(aiAutoPlace,500);
  } else {
    if(placeUnitsLeft[1].length>0)placeUnitType=placeUnitsLeft[1][0];
    renderPlaceBoard();updatePlaceUI();
  }
}

/* --- Tour complet de l'IA --- */
function aiPlayTurn(){
  if(currentPlayer!==2||CFG.mode!=='ai')return;
  addLog('🤖 L\'ordinateur réfléchit…','info');
  const level=CFG.aiLevel; // 'ai-easy' | 'ai-medium' | 'ai-hard'

  /* 1. Lancer le dé */
  const diceVal=Math.ceil(Math.random()*6);
  movePoints=diceVal;diceRolled=true;
  playDiceSound();
  animateDice(diceVal,'dice-pips');
  addLog(`🎲 Dé IA : ${diceVal} point(s).`,'info');
  updateMoveUI();

  /* 2. Construire la liste de tous les mouvements possibles */
  setTimeout(()=>{
    let remaining=movePoints;
    let moved=true;
    while(moved&&remaining>0){
      moved=false;
      const move=aiFindBestMove(remaining,level);
      if(move){
        const{r1,c1,r2,c2,dist}=move;
        /* Simuler le mouvement/combat */
        if(board[r2][c2].player!==0&&board[r2][c2].player!==2){
          /* Combat */
          doCombat(r1,c1,r2,c2,dist);
        } else {
          doMove(r1,c1,r2,c2,dist);
        }
        selectedCell=null;
        checkWin();
        renderBoard();
        remaining=movePoints;
        moved=true;
      }
    }
    /* Fin du tour IA */
    setTimeout(()=>{endTurn();},500);
  }, 800);
}

/* ══════════════════ IA AMÉLIORÉE ══════════════════ */

/* --- Mémoire des pièges connus de l'IA --- */
let aiKnownTraps = new Set();  // cases pièges que l'IA a "vues" (révélées)
let aiKnownBonus = new Set();  // cases bonus que l'IA a "vues"

/* Mettre à jour la mémoire IA selon les cases révélées */
function aiUpdateMemory(){
  for(const k of revealedCells){
    const [r,c] = k.split(',').map(Number);
    if(board[r][c].trap) aiKnownTraps.add(k);
    else aiKnownTraps.delete(k); // piège déclenché, plus dangereux
    if(board[r][c].bonus) aiKnownBonus.add(k);
    else aiKnownBonus.delete(k); // bonus pris
  }
  // Nettoyer les bonus/pièges qui n'existent plus
  for(const k of aiKnownTraps) if(!trapCells.has(k)) aiKnownTraps.delete(k);
  for(const k of aiKnownBonus) if(!bonusCells.has(k)) aiKnownBonus.delete(k);
}

/* --- Trouver le meilleur mouvement selon le niveau --- */
function aiFindBestMove(pts, level){
  const moves=aiGetAllMoves(2,pts);
  if(moves.length===0)return null;
  aiUpdateMemory();

  if(level==='ai-easy'){
    /* Facile : mouvement aléatoire, évite juste les pièges déjà connus */
    const safe = moves.filter(m => !aiKnownTraps.has(`${m.r2},${m.c2}`));
    const pool = safe.length > 0 ? safe : moves;
    return pool[Math.floor(Math.random()*pool.length)];
  }

  if(level==='ai-medium'){
    /* Moyen : priorise attaque (cible faible) > bonus connus > neutre > évite pièges */
    const safe = moves.filter(m => !aiKnownTraps.has(`${m.r2},${m.c2}`));
    const pool = safe.length > 0 ? safe : moves;

    // Attaque prioritaire sur unité la moins puissante (plus facile à tuer)
    const attacks = pool.filter(m => board[m.r2][m.c2].player === 1);
    if(attacks.length > 0){
      attacks.sort((a,b) => {
        const pa = UNITS[board[a.r2][a.c2].unit].power + (board[a.r2][a.c2].bonusBuff?1:0);
        const pb = UNITS[board[b.r2][b.c2].unit].power + (board[b.r2][b.c2].bonusBuff?1:0);
        return pa - pb; // attaquer le plus faible d'abord
      });
      return attacks[0];
    }
    // Bonus connus en priorité
    const knownBonusMoves = pool.filter(m => aiKnownBonus.has(`${m.r2},${m.c2}`));
    if(knownBonusMoves.length > 0) return knownBonusMoves[0];
    // Bonus non révélés (chance)
    const bonusMoves = pool.filter(m => board[m.r2][m.c2].bonus);
    if(bonusMoves.length > 0) return bonusMoves[0];
    // Territoire neutre
    const neutral = pool.filter(m => board[m.r2][m.c2].owner === 0);
    if(neutral.length > 0) return neutral[Math.floor(Math.random()*neutral.length)];
    return pool[Math.floor(Math.random()*pool.length)];
  }

  if(level==='ai-hard'){
    /* Expert : score chaque mouvement avec stratégie avancée */
    let best=null, bestScore=-Infinity;
    for(const m of moves){
      let score=0;
      const target=board[m.r2][m.c2];
      const k=`${m.r2},${m.c2}`;
      const myUnit=board[m.r1][m.c1].unit;
      const myPow=UNITS[myUnit].power+(board[m.r1][m.c1].bonusBuff?1:0);

      // Piège connu → évitement absolu
      if(aiKnownTraps.has(k)){ score=-999; }
      // Case piège révélée → très mauvais
      else if(target.trap && revealedCells.has(k)){ score=-200; }
      // Attaque
      else if(target.player===1){
        const enPow=UNITS[target.unit].power+(target.bonusBuff?1:0);
        const winProb=Math.max(0.05, Math.min(0.95, (myPow - enPow + 3.5) / 7));
        const killVal=UNITS[target.unit].killPts;
        score = winProb * killVal * 12;
        // Bonus si on a un buff
        if(board[m.r1][m.c1].bonusBuff) score += 8;
        // Pénalité si attaque risquée sans avantage
        if(winProb < 0.4) score -= 10;
      }
      // Bonus connu → très attractif
      else if(aiKnownBonus.has(k)){ score = 20; }
      // Bonus non connu mais présent
      else if(target.bonus){ score = 14; }
      // Territoire ennemi
      else if(target.owner===1){ score = 6; }
      // Territoire neutre
      else if(target.owner===0){
        score = 3;
        // Bonus de position : vers le centre et vers l'ennemi
        const distCenter=Math.abs(m.r2-SIZE/2)+Math.abs(m.c2-SIZE/2);
        score += Math.max(0, 4 - distCenter*0.5);
        // Bonus si on rapproche du but de victoire (expansion)
        score += aiExpansionValue(m.r2, m.c2);
      }

      // Pénalité exposition (ennemis adjacents à la destination)
      const exposure = aiExposureRisk(m.r2, m.c2);
      score -= exposure * 3;

      // Bonus si unité puissante (Tank) prend territoire stratégique
      if(myUnit === 'T' && target.owner !== 2) score += 2;

      // Légère pénalité si l'unité recule (vers zone de départ IA)
      if(m.r2 < m.r1 && m.r1 > SIZE-3) score -= 2;

      if(score > bestScore){ bestScore = score; best = m; }
    }
    return best || moves[0];
  }
  return moves[0];
}

/* Valeur d'expansion : favoriser les cases qui ouvrent de nouvelles frontières */
function aiExpansionValue(r, c){
  let val = 0;
  for(const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]){
    const nr=r+dr, nc=c+dc;
    if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE){
      if(board[nr][nc].owner===0) val += 0.5; // voisin neutre = potentiel expansion
      if(board[nr][nc].owner===1) val += 1.0; // voisin ennemi = pression
    }
  }
  return val;
}

/* --- Lister tous les mouvements valides d'un joueur --- */
function aiGetAllMoves(player,pts){
  const moves=[];
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    if(board[r][c].player!==player||!board[r][c].unit)continue;
    const maxStep=UNITS[board[r][c].unit].maxStep;
    const reach=Math.min(maxStep,pts);
    for(const[dr,dc]of[[0,1],[0,-1],[1,0],[-1,0]]){
      for(let d=1;d<=reach;d++){
        const nr=r+dr*d,nc=c+dc*d;
        if(nr<0||nr>=SIZE||nc<0||nc>=SIZE)break;
        if(board[nr][nc].player===player)break; // bloqué par allié
        moves.push({r1:r,c1:c,r2:nr,c2:nc,dist:d});
        if(board[nr][nc].player!==0)break; // après ennemi, stop
      }
    }
  }
  return moves;
}

/* --- Risque d'exposition : nombre d'ennemis adjacents à (r,c) --- */
function aiExposureRisk(r,c){
  let risk=0;
  for(const[dr,dc]of[[0,1],[0,-1],[1,0],[-1,0]]){
    const nr=r+dr,nc=c+dc;
    if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc].player===1)risk++;
  }
  return risk;
}