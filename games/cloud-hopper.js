/* NOVERSE GAME 03 — CLOUD HOPPER
   Arcade de vuelo original: guía a Nubi entre arcos de cristal.
*/
(() => {
  "use strict";
  const GAME_ID = "game-03";
  function mount(container) {
    container.innerHTML = `
      <section class="hopper-game" aria-label="Cloud Hopper">
        <div class="hopper-heading">
          <span class="hopper-kicker">ARCADE · JUEGO 03</span>
          <h2>¡A volar, Nubi!</h2>
          <p>Toca la pantalla para impulsarte y atraviesa los arcos de cristal.</p>
        </div>
        <div class="hopper-scorebar">
          <div><span>PUNTOS</span><strong data-score>0</strong></div>
          <div><span>RÉCORD</span><strong data-best>0</strong></div>
        </div>
        <div class="hopper-stage" data-stage>
          <canvas class="hopper-canvas" data-canvas aria-label="Juego de vuelo. Toca para impulsarte."></canvas>
          <div class="hopper-overlay" data-overlay>
            <div class="hopper-nubi">☁</div>
            <h3 data-title>Cloud Hopper</h3>
            <p data-copy>Ayuda a Nubi a cruzar los arcos sin tocarlos.</p>
            <button class="hopper-button" data-start type="button">Comenzar</button>
          </div>
        </div>
        <p class="hopper-hint">TOCA PARA VOLAR <span>✦</span> EVITA LOS CRISTALES</p>
      </section>`;
    const canvas=container.querySelector("[data-canvas]");
    const ctx=canvas.getContext("2d");
    const stage=container.querySelector("[data-stage]");
    const overlay=container.querySelector("[data-overlay]");
    const startButton=container.querySelector("[data-start]");
    const title=container.querySelector("[data-title]");
    const copy=container.querySelector("[data-copy]");
    const scoreNode=container.querySelector("[data-score]");
    const bestNode=container.querySelector("[data-best]");
    let w=0,h=0,dpr=1,raf=0,last=0,alive=true,playing=false,ended=false;
    let bird, obstacles=[],score=0,speed=2.6,spawn=0,best=0;
    try{best=Number(localStorage.getItem("noverse-cloud-hopper-best"))||0;}catch(_){}
    bestNode.textContent=best;
    function resize(){
      const r=stage.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,2);
      w=r.width;h=r.height;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      if(!playing)draw();
    }
    function reset(){
      score=0;speed=2.6;spawn=0;obstacles=[];
      bird={x:w*.27,y:h*.48,vy:0,r:15};
      scoreNode.textContent="0";ended=false;
    }
    function start(){
      if(!alive)return;
      reset();playing=true;overlay.hidden=true;last=0;
      cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);flap();
    }
    function flap(){if(!playing)return;bird.vy=-5.1;}
    function addObstacle(){
      const gap=Math.max(126,h*.34);
      const margin=55;
      const center=margin+Math.random()*Math.max(10,h-2*margin);
      obstacles.push({x:w+30,center,gap,passed:false});
    }
    function roundRect(x,y,ww,hh,r){
      ctx.beginPath();ctx.roundRect(x,y,ww,hh,r);ctx.fill();
    }
    function draw(){
      if(!ctx||!w||!h)return;
      const bg=ctx.createLinearGradient(0,0,w,h);
      bg.addColorStop(0,"#172b55");bg.addColorStop(.55,"#293b69");bg.addColorStop(1,"#493b70");
      ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
      for(let i=0;i<22;i++){
        const x=(i*83+29)%w,y=(i*47+17)%h;
        ctx.fillStyle=i%3===0?"#fff8":"#d8f4ff66";ctx.beginPath();ctx.arc(x,y,i%4===0?2:1,0,Math.PI*2);ctx.fill();
      }
      // distant floating cloud islands
      ctx.fillStyle="#a9c6e522";
      for(let i=0;i<4;i++){const x=(i*130+25)%w;ctx.beginPath();ctx.ellipse(x,h-22-(i%2)*15,65,17,0,0,Math.PI*2);ctx.fill();}
      obstacles.forEach(o=>{
        const top=o.center-o.gap/2,bottom=o.center+o.gap/2,ow=48;
        const grad=ctx.createLinearGradient(o.x,0,o.x+ow,0);
        grad.addColorStop(0,"#68d9d2");grad.addColorStop(.5,"#b4fff0");grad.addColorStop(1,"#53a9c6");
        ctx.fillStyle=grad;
        roundRect(o.x,0,ow,top-18,14);
        roundRect(o.x,bottom+18,ow,h-bottom-18,14);
        ctx.fillStyle="#e6fff5";ctx.globalAlpha=.6;
        roundRect(o.x-5,top-24,ow+10,12,6);roundRect(o.x-5,bottom+12,ow+10,12,6);
        ctx.globalAlpha=1;
        ctx.strokeStyle="#ffffff55";ctx.lineWidth=2;
        ctx.strokeRect(o.x+7,8,ow-14,Math.max(0,top-35));
      });
      if(bird){
        ctx.save();ctx.translate(bird.x,bird.y);ctx.rotate(Math.max(-.35,Math.min(.55,bird.vy*.055)));
        ctx.shadowColor="#a8fff1";ctx.shadowBlur=20;
        const g=ctx.createLinearGradient(-17,-17,18,18);g.addColorStop(0,"#fff6c8");g.addColorStop(1,"#ffbd83");
        ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,18,15,0,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(7,-5,5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#26365b";ctx.beginPath();ctx.arc(9,-5,2.2,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#ff986e";ctx.beginPath();ctx.moveTo(15,1);ctx.lineTo(25,4);ctx.lineTo(15,7);ctx.fill();
        ctx.fillStyle="#f39d87";ctx.beginPath();ctx.ellipse(-5,8,7,4,-.3,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
    }
    function finish(){
      if(!playing)return;
      playing=false;ended=true;cancelAnimationFrame(raf);
      const isRecord=score>best;
      if(isRecord){best=score;bestNode.textContent=best;try{localStorage.setItem("noverse-cloud-hopper-best",String(best));}catch(_){}}
      window.NOVERSE.GameManager?.recordCompleted?.();
      title.textContent=score>0?"¡Buen vuelo!":"¡Inténtalo otra vez!";
      copy.textContent="Conseguiste "+score+(score===1?" punto.":" puntos.")+(isRecord?" ¡Nuevo récord!":"");
      startButton.textContent="Volver a jugar";overlay.hidden=false;draw();
    }
    function update(dt){
      const step=Math.min(dt/16.67,2.2);
      bird.vy+=.27*step;bird.y+=bird.vy*step;
      spawn+=dt;
      if(spawn>1450){spawn=0;addObstacle();}
      obstacles.forEach(o=>{
        o.x-=speed*step;
        if(!o.passed&&o.x+48<bird.x){o.passed=true;score++;scoreNode.textContent=score;speed=Math.min(4.5,2.6+score*.045);}
        const gapTop=o.center-o.gap/2,gapBottom=o.center+o.gap/2;
        if(bird.x+bird.r>o.x&&bird.x-bird.r<o.x+48&&(bird.y-bird.r<gapTop||bird.y+bird.r>gapBottom))finish();
      });
      obstacles=obstacles.filter(o=>o.x>-65);
      if(bird.y-bird.r<0||bird.y+bird.r>h)finish();
    }
    function loop(t){
      if(!alive||!playing)return;
      const dt=last?Math.min(t-last,34):16.67;last=t;
      update(dt);draw();if(playing)raf=requestAnimationFrame(loop);
    }
    function onPointer(e){if(!playing)return;e.preventDefault();flap();}
    function onKey(e){if((e.code==="Space"||e.code==="ArrowUp")&&playing){e.preventDefault();flap();}}
    function onResize(){resize();}
    startButton.addEventListener("click",start);
    canvas.addEventListener("pointerdown",onPointer);
    window.addEventListener("keydown",onKey);
    window.addEventListener("resize",onResize);
    if("ResizeObserver" in window){var ro=new ResizeObserver(resize);ro.observe(stage);}else window.addEventListener("resize",resize);
    resize();draw();
    return {unmount(){alive=false;playing=false;cancelAnimationFrame(raf);startButton.removeEventListener("click",start);canvas.removeEventListener("pointerdown",onPointer);window.removeEventListener("keydown",onKey);window.removeEventListener("resize",onResize);if(ro)ro.disconnect();}};
  }
  window.NOVERSE.Registry.registerModule(GAME_ID,{mount});
})();