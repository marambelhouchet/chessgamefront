/* ══════════════════ NAVIGATION ══════════════════ */

function showScreen(id) {
  ALL_SCREENS.forEach(s => document.getElementById(s).classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showIntro()        { showScreen('intro-screen'); }
function showIntroToRules() { showScreen('rules-screen'); fillRulesPreviews(); }
function showRules()        { showScreen('rules-screen'); fillRulesPreviews(); }
function showSetup()        { stopTimer(); document.getElementById('modal-backdrop').classList.remove('show'); showScreen('setup-screen'); }

/* ── Option button selection helper ── */
function selectOpt(el, groupId, selClass) {
  document.getElementById(groupId).querySelectorAll('.opt-btn').forEach(b => {
    b.classList.remove('selected', 'sel-v', 'sel-g');
  });
  el.classList.add(selClass);
}

/* ── Mode select (PvP vs AI) ── */
function selectMode(el, mode) {
  document.getElementById('mode-opts').querySelectorAll('.opt-btn').forEach(b =>
    b.classList.remove('selected', 'sel-v', 'sel-g'));
  el.classList.add('selected');

  if (mode === 'pvp') {
    document.getElementById('ai-section').style.display   = 'none';
    document.getElementById('p2-box').style.opacity        = '1';
    document.getElementById('p2-name').disabled            = false;
    if (document.getElementById('p2-name').value === 'Ordinateur')
      document.getElementById('p2-name').value = 'Bob';
  } else {
    document.getElementById('ai-section').style.display   = 'block';
    document.getElementById('p2-box').style.opacity        = '0.5';
    document.getElementById('p2-name').value               = 'Ordinateur';
    document.getElementById('p2-name').disabled            = true;
  }
}
