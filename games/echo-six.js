/* NOVERSE GAME 04 — ECHO SIX · Memoria musical */
(() => {
  "use strict";
  const ID="game-04", NOTES=[261.63,293.66,329.63,392,440,523.25];
  const SYMBOLS=["●","◆","▲","✦","⬟","■"], COLORS=["#ff6b8a","#ffb45e","#d7ed67","#59dfc5","#63b8ff","#b69aff"];
  function mount(container) {
    let sequence=[],input=0,round=1,best=0,playing=false,locked=true,alive=true;
    let visual=true,sound=true,audio=null,timers=[];
    try{best=Number(localStorage.getItem("noverse-echo-six-best"))||0;}catch(_){}
    const padHTML=NOTES.map((n,i)=>'<button class="echo-pad" type="button" data-pad="'+i+'" aria-label="Sonido '+(i+1)+'" style="--pad-color:'+COLORS[i]+'"><span class="echo-pad-symbol">'+SYMBOLS[i]+'</span><small>0'+(i+1)+'</small></button>').join("");
    container.innerHTML='<section class="echo-game" aria-label="Echo Six, memoria musical"><div class="echo-topline"><span>MEMORIA MUSICAL</span><span class="echo-live"><i></i> AUDIO LAB</span></div><div class="echo-heading"><div class="echo-emblem"><span>♫</span><i></i><b></b></div><div><h2>Echo Six</h2><p>Escucha. Recuerda. Repite.</p></div></div><div class="echo-scoreline"><div><small>RONDA</small><strong data-round>01</strong></div><div class="echo-progress"><span data-progress></span></div><div><small>RÉCORD</small><strong data-best>00</strong></div></div><div class="echo-guides"><button class="echo-guide is-on" type="button" data-guide="visual" aria-pressed="true"><span class="echo-guide-icon">◉</span><span><b>Visual</b><small>Destellos</small></span><i></i></button><button class="echo-guide is-on" type="button" data-guide="sound" aria-pressed="true"><span class="echo-guide-icon">♫</span><span><b>Sonido</b><small>Notas</small></span><i></i></button></div><div class="echo-instruction" data-message>Presiona iniciar para escuchar la secuencia</div><div class="echo-board" aria-label="Seis teclas musicales">'+padHTML+'</div><div class="echo-footer"><span>SECUENCIA <b data-sequence>—</b></span><span data-state>EN ESPERA</span></div><button class="echo-start" type="button" data-start>INICIAR PARTIDA <span>↗</span></button><p class="echo-caption">SEIS SONIDOS · DIFICULTAD INFINITA</p></section><div class="echo-end" data-end hidden><div class="echo-end-card"><span>SECUENCIA INTERRUMPIDA</span><div class="echo-end-mark">♫</div><h3>¡Buen intento!</h3><p data-result></p><div class="echo-end-stats"><small>MEJOR RONDA</small><strong data-end-best>00</strong></div><button type="button" data-retry>VOLVER A INTENTAR</button></div></div>';
    const $=s=>container.querySelector(s), pads=[...container.querySelectorAll("[data-pad]")],guides=[...container.querySelectorAll("[data-guide]")];
    const message=$("[data-message]"),state=$("[data-state]"),roundNode=$("[data-round]"),bestNode=$("[data-best]"),progress=$("[data-progress]"),seqNode=$("[data-sequence]"),end=$("[data-end]");
    bestNode.textContent=String(best).padStart(2,"0");
    function clear(){timers.forEach(clearTimeout);timers=[];}
    function later(fn,ms){const id=setTimeout(()=>{timers=timers.filter(x=>x!==id);if(alive)fn();},ms);timers.push(id);}
    function ctx(){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;if(!audio)audio=new C();if(audio.state==="suspended")audio.resume();return audio;}
    function beep(i,d=.23){if(!sound)return;const c=ctx();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=NOTES[i];g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.17,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d+.02);}
    function flash(i){if(!visual)return;const p=pads[i];p.classList.add("is-lit");later(()=>p.classList.remove("is-lit"),270);}
    function show(i){flash(i);beep(i);}
    function hud(){roundNode.textContent=String(round).padStart(2,"0");seqNode.textContent=String(sequence.length).padStart(2,"0");progress.style.width=(Math.min(12,round)/12*100)+"%";}
    function preview(){locked=true;clear();message.textContent="Observa y memoriza el orden";state.textContent="ESCUCHA";let t=480;sequence.forEach(n=>{later(()=>show(n),t);t+=650;});later(()=>{locked=false;input=0;message.textContent="Tu turno: repite la secuencia";state.textContent="TU TURNO";},t+70);}
    function begin(){ctx();clear();end.hidden=true;sequence=[];round=1;playing=true;locked=true;$("[data-start]").textContent="REINICIAR PARTIDA ↻";sequence.push(Math.floor(Math.random()*6));hud();preview();}
    function next(){round++;sequence.push(Math.floor(Math.random()*6));hud();message.textContent="¡Correcto! La secuencia creció";later(preview,650);}
    function finish(){playing=false;locked=true;clear();const done=round-1;if(done>best){best=done;bestNode.textContent=String(best).padStart(2,"0");try{localStorage.setItem("noverse-echo-six-best",String(best));}catch(_){}}$("[data-result]").textContent="Completaste "+done+(done===1?" ronda.":" rondas.");$("[data-end-best]").textContent=String(best).padStart(2,"0");end.hidden=false;state.textContent="FIN DE PARTIDA";}
    function choose(i){if(!playing||locked)return;const p=pads[i];p.classList.add("is-tapped");later(()=>p.classList.remove("is-tapped"),150);beep(i,.16);if(sequence[input]!==i){p.classList.add("is-wrong");later(()=>p.classList.remove("is-wrong"),360);message.textContent="Ese no era el sonido…";finish();return;}input++;if(input===sequence.length)next();else message.textContent="¡Bien! "+(sequence.length-input)+" sonido(s) más";}
    function toggle(b){const visualType=b.dataset.guide==="visual";if(visualType)visual=!visual;else sound=!sound;let on=visualType?visual:sound;if(!visual&&!sound){if(visualType)visual=true;else sound=true;on=true;message.textContent="Mantén activa al menos una guía";}b.classList.toggle("is-on",on);b.setAttribute("aria-pressed",String(on));}
    pads.forEach((p,i)=>p.addEventListener("click",()=>choose(i)));guides.forEach(b=>b.addEventListener("click",()=>toggle(b)));$("[data-start]").addEventListener("click",begin);$("[data-retry]").addEventListener("click",begin);hud();
    return {unmount(){alive=false;clear();if(audio){audio.close().catch(()=>{});audio=null;}}};
  }
  window.NOVERSE.Registry.registerModule(ID,{mount});
})();
