/* CLOUD HOPPER 1.11 — Nubi's animated sky arcade */
(() => {
  "use strict";
  const ID="game-03";
  function mount(container){
    container.innerHTML=`
      <section class="hopper-game hopper-sky-game" aria-label="Cloud Hopper">
        <div class="hopper-heading"><span class="hopper-kicker">CIELO ABIERTO · VUELO ARCADE</span><h2>¡A volar, Nubi!</h2><p>Toca para impulsarte. Pasa entre los cristales sin chocar.</p></div>
        <div class="hopper-scorebar"><div><span>PUNTOS</span><strong data-score>0</strong></div><div><span>RÉCORD</span><strong data-best>0</strong></div><span class="hopper-level" data-level>VUELO 01</span></div>
        <div class="hopper-stage" data-stage><canvas class="hopper-canvas" data-canvas aria-label="Toca para hacer volar a Nubi"></canvas>
          <div class="hopper-overlay" data-overlay><div class="hopper-nubi">☁</div><span class="hopper-start-kicker">UNA AVENTURA ENTRE NUBES</span><h3 data-title>Cloud Hopper</h3><p data-copy>Ayuda a Nubi a volar entre los cristales. Cada arco aumenta un poco la velocidad.</p><button class="hopper-button" data-start type="button">Despegar</button></div>
        </div><p class="hopper-hint">TOCA PARA IMPULSAR · EVITA LOS CRISTALES</p>
      </section>`;
    const canvas=container.querySelector("[data-canvas]"),ctx=canvas.getContext("2d"),stage=container.querySelector("[data-stage]"),overlay=container.querySelector("[data-overlay]"),startButton=container.querySelector("[data-start]"),title=container.querySelector("[data-title]"),copy=container.querySelector("[data-copy]"),scoreNode=container.querySelector("[data-score]"),bestNode=container.querySelector("[data-best]"),levelNode=container.querySelector("[data-level]");
    let w=0,h=0,dpr=1,raf=0,last=0,alive=true,playing=false,bird=null,obstacles=[],score=0,speed=2.85,spawn=0,best=0,worldTime=0,cloudDrift=0,ro=null;
    try{best=Number(localStorage.getItem("noverse-cloud-hopper-best"))||0}catch(_){}
    bestNode.textContent=String(best);
    function resize(){const r=stage.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(!playing)draw(worldTime)}
    function reset(){score=0;speed=2.85;spawn=0;obstacles=[];bird={x:w*.25,y:h*.48,vy:0,r:14,wing:0,tilt:0};scoreNode.textContent="0";levelNode.textContent="VUELO 01"}
    function start(){if(!alive)return;reset();playing=true;overlay.hidden=true;last=0;flap();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
    function flap(){if(!playing||!bird)return;bird.vy=-5.35;window.NOVERSE.AmbientAudio?.playEffect("tap")}
    function addObstacle(){const gap=Math.max(105,h*(.32-Math.min(.055,score*.0018))),margin=Math.max(62,gap*.62),center=margin+Math.random()*Math.max(5,h-2*margin);obstacles.push({x:w+34,center,gap,passed:false,phase:Math.random()*Math.PI*2})}
    function rr(x,y,ww,hh,r){if(hh<=0)return;ctx.beginPath();ctx.roundRect(x,y,ww,hh,r);ctx.fill()}
    function drawCloud(x,y,s,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle="#d8f4ff";ctx.shadowColor="#b8efff";ctx.shadowBlur=22*s;ctx.beginPath();ctx.ellipse(x,y,34*s,13*s,0,0,Math.PI*2);ctx.ellipse(x-19*s,y-7*s,18*s,16*s,0,0,Math.PI*2);ctx.ellipse(x+13*s,y-11*s,22*s,19*s,0,0,Math.PI*2);ctx.fill();ctx.restore()}
    function draw(t=0){
      if(!ctx||!w||!h)return;
      const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,"#101d46");bg.addColorStop(.42,"#315c88");bg.addColorStop(1,"#f0a9bd");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
      const sun=ctx.createRadialGradient(w*.76,h*.18,2,w*.76,h*.18,Math.min(w,h)*.32);sun.addColorStop(0,"#fff7d9aa");sun.addColorStop(.3,"#ffd9dc44");sun.addColorStop(1,"#ffd9dc00");ctx.fillStyle=sun;ctx.fillRect(0,0,w,h);
      for(let i=0;i<34;i++){const x=(i*97+Math.sin(t*.0004+i)*12)%w,y=(i*59+13)%Math.max(1,h*.76),twinkle=.45+.35*Math.sin(t*.002+i);ctx.globalAlpha=twinkle;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,i%5===0?1.8:1,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
      for(let i=0;i<5;i++){const x=((i*190-cloudDrift*(.24+i*.12))%(w+230)+w+230)%(w+230)-90;drawCloud(x,h*(.19+(i%3)*.16)+Math.sin(t*.0007+i)*8,.7+(i%3)*.23,.16+(i%2)*.07)}
      // distant floating islands and soft mountain silhouettes
      ctx.fillStyle="#243d70aa";ctx.beginPath();ctx.moveTo(0,h*.83);for(let i=0;i<=8;i++){const x=i*w/8;ctx.lineTo(x,h*(.72+(i%2)*.07))}ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
      ctx.fillStyle="#a8e6e555";for(let i=0;i<4;i++){const x=(i*145+35-cloudDrift*.12)%(w+150);ctx.beginPath();ctx.ellipse(x,h-20-(i%2)*12,65,15,0,0,Math.PI*2);ctx.fill()}
      obstacles.forEach(o=>{
        const top=o.center-o.gap/2,bottom=o.center+o.gap/2,ow=48;
        const grad=ctx.createLinearGradient(o.x,0,o.x+ow,0);grad.addColorStop(0,"#3ca8bd");grad.addColorStop(.35,"#c2fff0");grad.addColorStop(.72,"#74e3db");grad.addColorStop(1,"#2f7f9d");ctx.fillStyle=grad;
        rr(o.x,0,ow,Math.max(0,top-18),13);rr(o.x,bottom+18,ow,Math.max(0,h-bottom-18),13);
        ctx.fillStyle="#eafffa";ctx.globalAlpha=.85;rr(o.x-5,top-23,ow+10,12,6);rr(o.x-5,bottom+11,ow+10,12,6);ctx.globalAlpha=1;
        ctx.strokeStyle="#ffffff66";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(o.x+9,8);ctx.lineTo(o.x+9,Math.max(8,top-35));ctx.stroke();
        ctx.beginPath();ctx.moveTo(o.x+9,bottom+35);ctx.lineTo(o.x+9,h-8);ctx.stroke();
      });
      if(bird){
        ctx.save();ctx.translate(bird.x,bird.y);ctx.rotate(Math.max(-.48,Math.min(.62,bird.vy*.06)));
        ctx.shadowColor="#8effef";ctx.shadowBlur=20;
        const body=ctx.createLinearGradient(-17,-17,19,18);body.addColorStop(0,"#fff9d5");body.addColorStop(.55,"#ffd49a");body.addColorStop(1,"#f49c91");
        ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,0,18,14,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        // wing flap, eye, cheek and beak give Nubi a readable silhouette
        ctx.save();ctx.translate(-5,3);ctx.rotate(Math.sin(bird.wing)*.72);ctx.fillStyle="#fff0c5";ctx.beginPath();ctx.ellipse(-2,0,9,5,-.5,0,Math.PI*2);ctx.fill();ctx.restore();
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(7,-5,5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#27345d";ctx.beginPath();ctx.arc(9,-5,2.3,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#ff986e";ctx.beginPath();ctx.moveTo(15,1);ctx.lineTo(25,4);ctx.lineTo(15,7);ctx.fill();
        ctx.fillStyle="#f39d9a";ctx.beginPath();ctx.ellipse(-5,7,6,3.5,-.3,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      const vignette=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.25,w/2,h/2,Math.max(w,h)*.75);vignette.addColorStop(.55,"#06132b00");vignette.addColorStop(1,"#07152c66");ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
    }
    function finish(){
      if(!playing)return;playing=false;cancelAnimationFrame(raf);
      const record=score>best;if(record){best=score;bestNode.textContent=String(best);try{localStorage.setItem("noverse-cloud-hopper-best",String(best))}catch(_){}}
      window.NOVERSE.GameManager?.recordCompleted?.();title.textContent=score?"¡Gran vuelo!":"¡Vamos otra vez!";
      copy.textContent="Atravesaste "+score+(score===1?" arco.":" arcos.")+(record?" ¡Nuevo récord!":"");
      window.NOVERSE.AmbientAudio?.playEffect("fail");startButton.textContent="Volver a volar";overlay.hidden=false;draw(worldTime);
    }
    function update(dt){
      const step=Math.min(dt/16.667,2.2);worldTime+=dt;cloudDrift+=dt*.035;
      if(!playing||!bird)return;
      bird.vy+=.30*step;bird.y+=bird.vy*step;bird.wing+=dt*.018;bird.tilt=bird.vy;
      spawn+=dt;if(spawn>1360){spawn=0;addObstacle()}
      obstacles.forEach(o=>{
        o.x-=speed*step;
        if(!o.passed&&o.x+48<bird.x){o.passed=true;score++;scoreNode.textContent=String(score);speed=Math.min(5.05,2.85+score*.052);levelNode.textContent="VUELO "+String(1+Math.floor(score/5)).padStart(2,"0");window.NOVERSE.AmbientAudio?.playEffect("success")}
        const top=o.center-o.gap/2,bottom=o.center+o.gap/2;
        if(bird.x+bird.r>o.x&&bird.x-bird.r<o.x+48&&(bird.y-bird.r<top||bird.y+bird.r>bottom))finish();
      });
      obstacles=obstacles.filter(o=>o.x>-65);
      if(bird.y-bird.r<0||bird.y+bird.r>h)finish();
    }
    function loop(t){if(!alive||!playing)return;const dt=last?Math.min(t-last,34):16.667;last=t;update(dt);draw(worldTime);if(playing)raf=requestAnimationFrame(loop)}
    function onPointer(e){if(!playing)return;e.preventDefault();flap()}
    function onKey(e){if((e.code==="Space"||e.code==="ArrowUp")&&playing){e.preventDefault();flap()}}
    startButton.addEventListener("click",start);canvas.addEventListener("pointerdown",onPointer);window.addEventListener("keydown",onKey);
    if("ResizeObserver"in window){ro=new ResizeObserver(resize);ro.observe(stage)}else window.addEventListener("resize",resize);
    resize();draw(0);
    return{unmount(){alive=false;playing=false;cancelAnimationFrame(raf);startButton.removeEventListener("click",start);canvas.removeEventListener("pointerdown",onPointer);window.removeEventListener("keydown",onKey);if(ro)ro.disconnect();else window.removeEventListener("resize",resize)}};
  }
  window.NOVERSE.Registry.registerModule(ID,{mount});
})();