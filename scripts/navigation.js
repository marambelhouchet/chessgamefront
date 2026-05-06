/* ══════════════════ NAVIGATION ══════════════════ */
function showScreen(id){['intro-screen','setup-screen','rules-screen','place-screen','game-screen'].forEach(s=>document.getElementById(s).classList.remove('active'));document.getElementById(id).classList.add('active');}
function showIntro(){showScreen('intro-screen');}
function showIntroToRules(){showScreen('rules-screen');fillRulesPreviews();}
function showRules(){showScreen('rules-screen');fillRulesPreviews();}
function showSetup(){stopTimer();document.getElementById('modal-backdrop').classList.remove('show');showScreen('setup-screen');}

function selectOpt(el, groupId, selClass){
  document.getElementById(groupId).querySelectorAll('.opt-btn').forEach(b=>{b.classList.remove('selected','sel-v','sel-g');});
  el.classList.add(selClass);
}