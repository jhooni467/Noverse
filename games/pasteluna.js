/* PASTELUNA — endless cake tower arcade */
(() => {
  "use strict";
  const ID="game-05", COLORS=["#ffb8d0","#ffd49a","#c7b7ff","#a9e6d3","#ff9f9d","#ffe6a8","#b7d8ff"];
  function mount(container){
    let canvas,ctx,stage,overlay,scoreNode,bestNode,message,title,startButton,raf=0,alive=true,playing=false;
    let width=0,height=0,dpr=1,score=0,best=0,layers=[],moving=null,last=0,phase=0,observer=null;
    try{best=Number(localStorage.getItem("noverse-pasteluna-best"))||0}catch(_){}
    container.innerHTML=`
      <section class="pasteluna-game" aria-label="Pasteluna">
        <header class="pasteluna-heading"><span>PASTELERÍA DE ENSUEÑO</span><p>Apila con cuidado. ¡Que no se derrumbe!</p></header>
        <div class="pasteluna-hud"><div><small>CAPAS</small><strong data-score>0</strong></div><div><small>RÉCORD</small><strong data-best>0</strong></div><span>TOCA PARA SOLTAR</span></div>
        <div class="pasteluna-stage" data-stage>
          <canvas class="pasteluna-canvas" data-canvas aria-label="Toca para soltar el pastel sobre la torre"></canvas>
          <div class="pasteluna-overlay" data-overlay><div class="pasteluna-cake-mark">🍰</div><span class="pasteluna-overline">EL RETO MÁS DULCE</span><h2 data-title>Pasteluna</h2><p data-copy>Deja caer cada capa y construye la torre más alta. ¡No pierdas el equilibrio!</p><button type="button" data-start>Comenzar a apilar</button></div>
        </div><p class="pasteluna-footnote">Cada capa cuenta. Cada toque importa.</p>
      </section>`;
    canvas=container.querySelector("[data-canvas]");ctx=canvas.getContext("2d");stage=container.querySelector("[data-stage]");
    overlay=container.querySelector("[data-overlay]");scoreNode=container.querySelector("[data-score]");bestNode=container.querySelector("[data-best]");
    message=container.querySelector("[data-copy]");title=container.querySelector("[data-title]");startButton=container.querySelector("[data-start]");bestNode.textContent=String(best);
    function resize(){const r=stage.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(!layers.length)resetTower();draw();}
    function resetTower(){const w=Math.min(210,width*.58);layers=[{x:(width-w)/2,w,y:height-40,color:"#f5c9a8"}];moving=null;score=0;scoreNode.textContent="0";}
    function spawn(){const top=layers[layers.length-1];moving={x:Math.random()<.5?-top.w:width,y:top.y-32,w:top.w,h:30,dir:Math.random()<.5?1:-1,speed:Math.min(290,145+score*3),color:COLORS[score%COLORS.length]};}
    function start(){if(!alive)return;resetTower();playing=true;overlay.hidden=true;spawn();last=0;window.NOVERSE.AmbientAudio?.playEffect("tap");}
    function drop(){
      if(!playing||!moving)return;const top=layers[layers.length-1],left=Math.max(top.x,moving.x),right=Math.min(top.x+top.w,moving.x+moving.w),overlap=right-left;
      window.NOVERSE.AmbientAudio?.playEffect("drop");
      if(overlap<Math.max(12,top.w*.12)){finish();return;}
      layers.push({x:left,w:overlap,y:top.y-moving.h,color:moving.color});score++;scoreNode.textContent=String(score);
      if(score>best){best=score;bestNode.textContent=String(best);try{localStorage.setItem("noverse-pasteluna-best",String(best))}catch(_){}}
      window.NOVERSE.AmbientAudio?.playEffect(score%5===0?"success":"pop");
      const shift=Math.max(0,layers[layers.length-1].y-height*.55);if(shift>0)layers.forEach(layer=>layer.y+=shift);spawn();
    }
    function finish(){playing=false;moving=null;window.NOVERSE.GameManager?.recordCompleted?.();window.NOVERSE.AmbientAudio?.playEffect("fail");title.textContent="¡Torre terminada!";message.textContent="Apilaste "+score+(score===1?" capa.":" capas.")+" Tu récord es "+best+".";startButton.textContent="Intentar de nuevo";overlay.hidden=false;}
    function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
    function cake(layer){const x=layer.x,y=layer.y,w=layer.w,h=30;ctx.save();ctx.shadowColor="#14091c88";ctx.shadowBlur=12;ctx.shadowOffsetY=5;const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,"#fff0df");g.addColorStop(.2,layer.color);g.addColorStop(1,"#a95e83");ctx.fillStyle=g;rr(x,y,w,h,8);ctx.fill();ctx.shadowColor="transparent";ctx.fillStyle="#fff0e9";rr(x,y,w,8,5);ctx.fill();ctx.fillStyle="#fff9ed";ctx.globalAlpha=.75;ctx.fillRect(x+5,y+12,Math.max(0,w-10),3);ctx.globalAlpha=1;ctx.fillStyle="#ffe2a5";for(let i=0;i<Math.min(5,Math.floor(w/26));i++){ctx.beginPath();ctx.arc(x+14+i*22,y+21,2,0,Math.PI*2);ctx.fill();}ctx.restore();}
    function draw(){
      if(!ctx||!width||!height)return;const g=ctx.createLinearGradient(0,0,0,height);g.addColorStop(0,"#3b2447");g.addColorStop(.58,"#5a3155");g.addColorStop(1,"#24172f");ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
      ctx.fillStyle="#ffd9a0";ctx.globalAlpha=.1;ctx.beginPath();ctx.arc(width*.78,height*.2,Math.min(width,height)*.18,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.strokeStyle="#ffebd51e";ctx.lineWidth=2;for(let i=0;i<4;i++){const x=width*(.12+i*.24);ctx.strokeRect(x,28,Math.min(70,width*.13),height*.42);}
      const offset=Math.max(0,layers[layers.length-1].y-height*.62);layers.forEach(layer=>cake({...layer,y:layer.y+offset}));if(moving&&playing)cake({...moving,y:moving.y+offset});
      ctx.fillStyle="#ffe8d0";ctx.globalAlpha=.7;ctx.fillRect(0,height-12,width,12);ctx.globalAlpha=1;
    }
    function loop(t){if(!alive){raf=0;return;}const dt=last?Math.min(.04,(t-last)/1000):0;last=t;phase+=dt*30;if(playing&&moving){moving.x+=moving.dir*moving.speed*dt;if(moving.x+moving.w>width){moving.x=width-moving.w;moving.dir=-1}if(moving.x<0){moving.x=0;moving.dir=1}}draw();raf=requestAnimationFrame(loop);}
    function onPointer(e){if(!playing)return;e.preventDefault();drop();}
    startButton.addEventListener("click",start);canvas.addEventListener("pointerdown",onPointer);
    if("ResizeObserver"in window){observer=new ResizeObserver(resize);observer.observe(stage)}else window.addEventListener("resize",resize);
    resize();raf=requestAnimationFrame(loop);
    return{unmount(){alive=false;playing=false;cancelAnimationFrame(raf);startButton.removeEventListener("click",start);canvas.removeEventListener("pointerdown",onPointer);if(observer)observer.disconnect();else window.removeEventListener("resize",resize)}};
  }
  window.NOVERSE.Registry.registerModule(ID,{mount});
})();