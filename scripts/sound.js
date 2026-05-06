/* ══════════════════ SOUND SYSTEM ══════════════════ */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let _actx = null;
function getACtx(){ if(!_actx) _actx = new AudioCtx(); return _actx; }

function playDiceSound(){
  try {
    const ctx = getACtx();
    // Multiple short clicks like a rolling dice (Ludo style)
    const clicks = [0, 0.06, 0.12, 0.18, 0.26, 0.34, 0.42, 0.52, 0.60];
    clicks.forEach((t, i) => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for(let j = 0; j < data.length; j++){
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (data.length * 0.3));
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      const vol = i === clicks.length - 1 ? 0.35 : 0.18;
      gain.gain.setValueAtTime(vol, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.08);
      const filt = ctx.createBiquadFilter();
      filt.type = 'highpass';
      filt.frequency.value = i === clicks.length - 1 ? 900 : 600;
      src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      src.start(ctx.currentTime + t);
    });
    // Final "thud" when dice lands
    const osc = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(180, ctx.currentTime + 0.60);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.75);
    g2.gain.setValueAtTime(0.22, ctx.currentTime + 0.60);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.80);
    osc.connect(g2); g2.connect(ctx.destination);
    osc.start(ctx.currentTime + 0.60); osc.stop(ctx.currentTime + 0.85);
  } catch(e){}
}

function playCombatSound(won){
  try {
    const ctx = getACtx();
    const t = ctx.currentTime;
    // Sword clash: two oscillators colliding
    [220, 330].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * (1 + Math.random() * 0.1), t + i * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.3);
      gain.gain.setValueAtTime(0.28, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      const dist = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for(let k = 0; k < 256; k++) curve[k] = (k / 128 - 1) > 0 ? 1 : -1;
      dist.curve = curve;
      osc.connect(dist); dist.connect(gain); gain.connect(ctx.destination);
      osc.start(t + i * 0.04); osc.stop(t + 0.4);
    });
    // Metallic impact noise
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for(let j = 0; j < data.length; j++) data[j] = (Math.random()*2-1) * Math.exp(-j/(data.length*0.2));
    const src = ctx.createBufferSource(); src.buffer = buf;
    const ng = ctx.createGain(); ng.gain.setValueAtTime(0.4, t); ng.gain.exponentialRampToValueAtTime(0.001, t+0.2);
    const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 2500;
    src.connect(filt); filt.connect(ng); ng.connect(ctx.destination);
    src.start(t);
    // Win: triumphant rising notes / Lose: descending
    setTimeout(()=>{
      try {
        const ctx2 = getACtx();
        const notes = won ? [440, 554, 660] : [440, 370, 294];
        notes.forEach((freq, i) => {
          const o = ctx2.createOscillator(); const g = ctx2.createGain();
          o.type = 'triangle'; o.frequency.value = freq;
          g.gain.setValueAtTime(0.15, ctx2.currentTime + i*0.12);
          g.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + i*0.12 + 0.2);
          o.connect(g); g.connect(ctx2.destination);
          o.start(ctx2.currentTime + i*0.12); o.stop(ctx2.currentTime + i*0.12 + 0.25);
        });
      } catch(e){}
    }, 200);
  } catch(e){}
}

function playTrapSound(){
  try {
    const ctx = getACtx();
    const t = ctx.currentTime;
    // Dramatic descending "snap" + rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.6);
    // Spring snap noise burst
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for(let j = 0; j < data.length; j++) data[j] = (Math.random()*2-1) * Math.exp(-j/(data.length*0.15));
    const src = ctx.createBufferSource(); src.buffer = buf;
    const ng = ctx.createGain(); ng.gain.setValueAtTime(0.5, t);
    const filt = ctx.createBiquadFilter(); filt.type = 'highpass'; filt.frequency.value = 800;
    src.connect(filt); filt.connect(ng); ng.connect(ctx.destination);
    src.start(t);
    // Low rumble
    const osc2 = ctx.createOscillator(); const g2 = ctx.createGain();
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(60, t+0.05);
    osc2.frequency.exponentialRampToValueAtTime(30, t+0.5);
    g2.gain.setValueAtTime(0.35, t+0.05); g2.gain.exponentialRampToValueAtTime(0.001, t+0.55);
    osc2.connect(g2); g2.connect(ctx.destination);
    osc2.start(t+0.05); osc2.stop(t+0.6);
  } catch(e){}
}