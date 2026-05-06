/* ══════════════════ LOG ══════════════════ */
function addLog(msg,type='info'){const el=document.getElementById('log');const div=document.createElement('div');div.className=`log-entry ${type}`;div.textContent=msg;el.prepend(div);}

/* ══════════════════ RULES PREVIEWS ══════════════════ */
function fillRulesPreviews(){const ids={S:'ru-s',C:'ru-c',T:'ru-t'};for(const[unit,id]of Object.entries(ids)){const el=document.getElementById(id);if(el)el.innerHTML=pieceSVG(unit,1);}}
setTimeout(fillRulesPreviews,100);