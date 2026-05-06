/* ══════════════════ TIMER ══════════════════ */
const CIRC=125.66;
function startTimer(){
  stopTimer();
  if(CFG.timerSec===0){
    document.getElementById('timer-wrap').classList.add('timer-disabled');
    document.getElementById('timer-num').textContent='—';
    document.getElementById('ring-fill').style.strokeDashoffset='0';
    return;
  }
  document.getElementById('timer-wrap').classList.remove('timer-disabled');
  timerRemain=CFG.timerSec;
  updateTimerUI();
  timerInterval=setInterval(()=>{
    timerRemain--;
    updateTimerUI();
    if(timerRemain<=0){stopTimer();timerExpired();}
  },1000);
}
function stopTimer(){if(timerInterval){clearInterval(timerInterval);timerInterval=null;}}
function updateTimerUI(){
  const ratio=timerRemain/CFG.timerSec;
  const offset=CIRC-(ratio*CIRC);
  const fill=document.getElementById('ring-fill');
  const num=document.getElementById('timer-num');
  fill.style.strokeDashoffset=offset;
  fill.style.stroke=timerRemain<=10?'#ff4040':timerRemain<=20?'#f4a261':'var(--rose)';
  num.textContent=timerRemain;
  num.className='timer-num'+(timerRemain<=10?' urgent':'');
  document.getElementById('timer-wrap').style.setProperty('--timer-color', timerRemain<=10?'#ff4040':'var(--rose)');
}
function timerExpired(){
  addLog(`⏱ Temps écoulé ! Tour de ${currentPlayer===1?CFG.p1:CFG.p2} terminé automatiquement.`,'timer-out');
  endTurn();
}