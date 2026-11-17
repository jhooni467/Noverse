/* NOVERSE v1.03 — música ambiental original generada por Web Audio */
(() => {
  "use strict";
  const presets = {
    "game-01": { base:164.81, notes:[392,493.88,587.33,493.88,440,587.33], wave:"sine", interval:2300 },
    "game-02": { base:130.81, notes:[261.63,329.63,392,329.63,293.66,349.23], wave:"triangle", interval:3100 },
    "game-03": { base:146.83, notes:[349.23,440,523.25,659.25,523.25,440], wave:"sine", interval:2050 },
    "game-04": { base:110, notes:[261.63,329.63,392,329.63,293.66,349.23], wave:"sine", interval:3600 },
    "game-05": { base:196, notes:[392,493.88,587.33,659.25,587.33,493.88], wave:"triangle", interval:2450 }
  };
  let context=null, master=null, timer=null, activeId=null, step=0, droneNodes=[];
  let enabled=true;
  try { enabled=localStorage.getItem("noverse-ambient-enabled")!=="false"; } catch (_) {}
  function getContext() {
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return null;
    if(!context){context=new Audio();master=context.createGain();master.gain.value=enabled?0.13:0;master.connect(context.destination);}
    return context;
  }
  function unlock(){const ctx=getContext();if(ctx&&ctx.state==="suspended")ctx.resume().catch(()=>{});}
  function stopNodes(){
    if(timer){clearInterval(timer);timer=null;}
    droneNodes.forEach(node=>{try{if(typeof node.stop==="function")node.stop();if(typeof node.disconnect==="function")node.disconnect();}catch(_){}});
    droneNodes=[];
  }
  function stop(){stopNodes();activeId=null;}
  function playTone(frequency,duration,volume,wave="sine"){
    if(!context||!master||!enabled)return;
    const now=context.currentTime,osc=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter();
    osc.type=wave;osc.frequency.setValueAtTime(frequency,now);filter.type="lowpass";filter.frequency.setValueAtTime(1500,now);
    gain.gain.setValueAtTime(0.0001,now);gain.gain.exponentialRampToValueAtTime(volume,now+0.35);gain.gain.exponentialRampToValueAtTime(0.0001,now+duration);
    osc.connect(filter);filter.connect(gain);gain.connect(master);osc.start(now);osc.stop(now+duration+0.05);
    osc.onended=()=>{try{osc.disconnect();filter.disconnect();gain.disconnect();}catch(_){}};
  }
  function startDrone(preset){
    if(!context||!master||!enabled)return;
    [preset.base,preset.base*1.5].forEach((frequency,index)=>{
      const osc=context.createOscillator(),gain=context.createGain();
      osc.type="sine";osc.frequency.value=frequency;gain.gain.value=index===0?0.12:0.045;
      osc.connect(gain);gain.connect(master);osc.start();droneNodes.push(osc,gain);
    });
  }
  function play(id){
    stop();activeId=id;if(!enabled)return;
    const preset=presets[id];if(!preset)return;
    const ctx=getContext();if(!ctx)return;
    if(ctx.state==="suspended")ctx.resume().catch(()=>{});
    startDrone(preset);step=0;
    const tick=()=>{
      if(!enabled||activeId!==id)return;
      playTone(preset.notes[step%preset.notes.length],2.5,0.17,preset.wave);
      if(step%3===0)playTone(preset.base*2,3.2,0.055,"sine");
      step++;
    };
    tick();timer=setInterval(tick,preset.interval);
  }
  function playEffect(kind="tap"){
    if(!enabled)return;
    const sounds={
      tap:[520,.09,.22,"sine"],soft:[660,.13,.16,"sine"],pop:[880,.12,.28,"triangle"],
      hit:[740,.16,.32,"triangle"],drop:[330,.2,.34,"sine"],success:[523.25,.32,.3,"sine"],
      fail:[180,.28,.28,"triangle"]
    };
    const sound=sounds[kind]||sounds.tap;
    if(!context)getContext();
    if(context&&context.state==="suspended")context.resume().catch(()=>{});
    playTone(sound[0],sound[1],sound[2],sound[3]);
    if(kind==="success"){
      window.setTimeout(()=>playTone(659.25,.28,.24,"sine"),110);
      window.setTimeout(()=>playTone(783.99,.38,.22,"sine"),220);
    }
  }
  function setEnabled(value){
    enabled=Boolean(value);try{localStorage.setItem("noverse-ambient-enabled",String(enabled));}catch(_){}
    if(master&&context){const now=context.currentTime;master.gain.cancelScheduledValues(now);master.gain.setTargetAtTime(enabled?0.13:0,now,0.08);}
    if(!enabled)stopNodes();else if(activeId)play(activeId);
    return enabled;
  }
  function toggle(){return setEnabled(!enabled);}
  window.NOVERSE=window.NOVERSE||{};
  window.NOVERSE.AmbientAudio=Object.freeze({unlock,play,stop,toggle,isEnabled:()=>enabled,setEnabled,playEffect});
})();
