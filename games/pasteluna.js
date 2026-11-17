/* PASTELUNA 1.12 — stable camera follow, lively bakery world and cake-stacking physics */
(() => {
  "use strict";
  const ID="game-05", COLORS=["#ff668f","#ff9d38","#9c78ff","#29cfa8","#ff6875","#ffd34e","#46baff","#ff78d0","#a5d94c"];
  function mount(container){
    let canvas,ctx,stage,overlay,startButton,title,copy,scoreNode,bestNode,raf=0,observer=null,alive=true,playing=false;
    let w=0,h=0,dpr=1,score=0,best=0,stack=[],moving=null,falling=[],particles=[],last=0,cameraY=0,cameraTarget=0,shake=0,pointerX=.5,pointerY=.5,worldTime=0,landFlash=0;
    try{best=Number(localStorage.getItem("noverse-pasteluna-best"))||0}catch(_){}
    container.innerHTML=`
      <section class="pasteluna-game pasteluna-v12" aria-label="Pasteluna: apila pasteles">
        <header class="pasteluna-heading"><span>✦ PASTELERÍA CELESTIAL ✦</span><p>¡Construye la torre de postres más alta!</p></header>
        <div class="pasteluna-hud"><div><small>CAPAS</small><strong data-score>0</strong></div><div><small>RÉCORD</small><strong data-best>${best}</strong></div><span data-instruction>TOCA PARA SOLTAR</span></div>
        <div class="pasteluna-stage pasteluna-stage-v12" data-stage>
          <canvas class="pasteluna-canvas" data-canvas aria-label="Pastel en movimiento. Toca para dejarlo caer sobre la torre."></canvas>
          <div class="pasteluna-overlay pasteluna-overlay-v12" data-overlay>
            <div class="pasteluna-cake-mark">🧁</div><span class="pasteluna-overline">EL RETO MÁS DULCE</span>
            <h2 data-title>Pasteluna</h2>
            <p data-copy>Deja caer cada pastel sobre la torre. ¡Alinea bien las capas para que no se derrumbe!</p>
            <button type="button" data-start>¡A hornear!</button>
          </div>
        </div><p class="pasteluna-footnote">TOCA EL ESCENARIO PARA SOLTAR TU PASTEL ✦</p>
      </section>`;
    canvas=container.querySelector("[data-canvas]");ctx=canvas.getContext("2d");stage=container.querySelector("[data-stage]");
    overlay=container.querySelector("[data-overlay]");startButton=container.querySelector("[data-start]");
    title=container.querySelector("[data-title]");copy=container.querySelector("[data-copy]");
    scoreNode=container.querySelector("[data-score]");bestNode=container.querySelector("[data-best]");
    const instruction=container.querySelector("[data-instruction]");
    function resize(){
      const r=stage.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(2,window.devicePixelRatio||1);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
      if(!stack.length)reset();draw(worldTime);
    }
    function reset(){
      const baseW=Math.min(w*.64,250),baseH=43;
      stack=[{x:(w-baseW)/2,y:h-57,w:baseW,h:baseH,color:"#ffb45f",angle:0,flavor:0}];
      moving=null;falling=[];particles=[];score=0;cameraY=0;cameraTarget=0;shake=0;scoreNode.textContent="0";instruction.textContent="TOCA PARA SOLTAR";
    }
    function spawn(){
      const top=stack[stack.length-1],width=Math.max(62,top.w);
      const fallDistance=Math.min(150,Math.max(82,h*.25));
      moving={x:-width,y:top.y-48-fallDistance,w:width,h:48,color:COLORS[score%COLORS.length],dir:1,speed:Math.min(245,108+score*2.1),phase:0,vy:0,angle:0,fallDistance,falling:false};
    }
    function start(){if(!alive)return;reset();playing=true;overlay.hidden=true;spawn();last=0;window.NOVERSE.AmbientAudio?.playEffect("tap")}
    function burst(x,y,color){
      for(let i=0;i<15;i++)particles.push({x,y,vx:(Math.random()-.5)*210,vy:-Math.random()*190-35,life:.8,size:2+Math.random()*4,color,rot:Math.random()*6});
    }
    function drop(){
      if(!playing||!moving||moving.falling)return;
      moving.falling=true;moving.vy=0;instruction.textContent="¡AHÍ VIENE!";
      window.NOVERSE.AmbientAudio?.playEffect("drop");
    }
    function land(){
      const top=stack[stack.length-1],m=moving;
      const left=Math.max(top.x,m.x),right=Math.min(top.x+top.w,m.x+m.w),overlap=right-left;
      if(overlap<Math.max(24,top.w*.2)){falling.push({...m,vy:80,spin:m.x<top.x?-2.5:2.5});moving=null;finish();return}
      const lostLeft=Math.max(0,top.x-m.x),lostRight=Math.max(0,m.x+m.w-(top.x+top.w));
      if(lostLeft>2)falling.push({x:m.x,y:m.y,w:lostLeft,h:m.h,color:m.color,vy:-10,spin:-1.5});
      if(lostRight>2)falling.push({x:top.x+top.w,y:m.y,w:lostRight,h:m.h,color:m.color,vy:-10,spin:1.5});
      const layer={x:left,y:top.y-m.h+5,w:overlap,h:m.h,color:m.color,angle:0,flavor:score%4};
      stack.push(layer);moving=null;score++;scoreNode.textContent=String(score);
      burst(layer.x+layer.w/2,layer.y,layer.color);shake=3.5;landFlash=.35;
      if(score>best){best=score;bestNode.textContent=String(best);try{localStorage.setItem("noverse-pasteluna-best",String(best))}catch(_){}}
      window.NOVERSE.AmbientAudio?.playEffect(score%5===0?"success":"pop");
      // Camera follows an absolute target, never adds the same climb repeatedly.
      cameraTarget=Math.max(0,h*.57-layer.y);
      instruction.textContent="¡PERFECTO! SIGUIENTE CAPA";
      if(stack.length>Math.ceil(h/30)+30)stack=stack.slice(-Math.ceil(h/30)-30);
      spawn();
    }
    function finish(){
      playing=false;moving=null;instruction.textContent="TORRE TERMINADA";
      window.NOVERSE.GameManager?.recordCompleted?.();window.NOVERSE.AmbientAudio?.playEffect("fail");
      title.textContent=score?"¡Qué torre tan dulce!":"¡Un nuevo comienzo!";
      copy.textContent="Apilaste "+score+(score===1?" capa.":" capas.")+" Tu récord: "+best+".";
      startButton.textContent="Volver a jugar";overlay.hidden=false;
    }
    function round(x,y,ww,hh,r){if(ww<=0||hh<=0)return;ctx.beginPath();ctx.roundRect(x,y,ww,hh,r)}
    function drawCake(layer,yOverride){
      const x=layer.x,y=yOverride??layer.y,cw=layer.w,ch=layer.h;
      ctx.save();ctx.translate(x+cw/2,y+ch/2);ctx.rotate(layer.angle||0);ctx.translate(-cw/2,-ch/2);
      ctx.shadowColor="#52204455";ctx.shadowBlur=10;ctx.shadowOffsetY=6;
      const side=ctx.createLinearGradient(0,0,cw,0);side.addColorStop(0,"#a94d70");side.addColorStop(.12,layer.color);side.addColorStop(.76,layer.color);side.addColorStop(1,"#b84e78");
      ctx.fillStyle=side;round(0,8,cw,ch-7,10);ctx.fill();ctx.shadowColor="transparent";
      const icing=ctx.createLinearGradient(0,0,0,19);icing.addColorStop(0,"#fffdf0");icing.addColorStop(.7,"#ffe1ec");icing.addColorStop(1,"#ffb7d2");
      ctx.fillStyle=icing;round(0,3,cw,17,9);ctx.fill();
      // Small drips along the front edge make each layer read as a frosted cake.
      ctx.fillStyle="#fff0f3";for(let i=0;i<Math.min(8,Math.floor(cw/23));i++){const dx=11+i*22;ctx.beginPath();ctx.ellipse(dx,17+(i%2)*2,3.5,5,0,0,Math.PI*2);ctx.fill()}
      ctx.fillStyle="#fff7cc";for(let i=0;i<Math.min(6,Math.floor(cw/27));i++){ctx.beginPath();ctx.arc(14+i*25,ch-10,2.1,0,Math.PI*2);ctx.fill()}
      // A few bright candy pearls on top.
      ctx.fillStyle=["#ffdc57","#8cf1d0","#fff"][layer.flavor||0];ctx.beginPath();ctx.arc(cw*.28,5,3,0,Math.PI*2);ctx.arc(cw*.72,5,3,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    function cloud(x,y,s,alpha){
      ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle="#fff8fb";ctx.beginPath();ctx.ellipse(x,y,32*s,13*s,0,0,Math.PI*2);ctx.ellipse(x-17*s,y-8*s,17*s,15*s,0,0,Math.PI*2);ctx.ellipse(x+12*s,y-10*s,21*s,18*s,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    function draw(t=0){
      if(!ctx||!w||!h)return;
      const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"#ffb7cf");g.addColorStop(.43,"#ffd18b");g.addColorStop(1,"#a7e9d1");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Warm sun glow and drifting bakery-window clouds.
      const sun=ctx.createRadialGradient(w*.78,h*.18,2,w*.78,h*.18,Math.min(w,h)*.48);sun.addColorStop(0,"#fff9c9cc");sun.addColorStop(.3,"#fff0b866");sun.addColorStop(1,"#fff0b800");ctx.fillStyle=sun;ctx.fillRect(0,0,w,h);
      for(let i=0;i<6;i++){const x=((i*137-t*.012*(i%2?1:.65)+w*2)%(w+120))-45;cloud(x,h*(.16+(i%3)*.17)+Math.sin(t*.0007+i)*8,.65+(i%3)*.2,.5)}
      // Candy-colored arches and shelves respond subtly to touch position.
      ctx.save();ctx.globalAlpha=.18;ctx.strokeStyle="#fff";ctx.lineWidth=3;
      for(let i=0;i<4;i++){const x=(i+1)*w/5+(pointerX-.5)*12;ctx.beginPath();ctx.arc(x,h*.48,Math.min(w*.16,85),Math.PI,Math.PI*2);ctx.stroke()}
      ctx.globalAlpha=.13;ctx.fillStyle="#fff";for(let i=0;i<4;i++)ctx.fillRect(0,h*(.31+i*.12)+(pointerY-.5)*5,w,2);ctx.restore();
      // Floating sugar sprinkles drift continuously in the background.
      for(let i=0;i<30;i++){const x=(i*83+Math.sin(t*.0006+i)*18)%w,y=(i*47+t*.012*(i%2?1:-.55))%h;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.001+i)*.6);ctx.globalAlpha=.25+.18*Math.sin(t*.002+i);ctx.fillStyle=["#fff","#ff5d9c","#fff06a","#48cdb2"][i%4];ctx.fillRect(-2,-5,4,10);ctx.restore()}
      ctx.save();const jitter=shake?Math.sin(t*.055)*shake:0;ctx.translate(jitter,0);
      stack.forEach(layer=>{const y=layer.y+cameraY;if(y>-90&&y<h+75)drawCake(layer,y)});
      falling.forEach(piece=>drawCake(piece,piece.y+cameraY));
      if(moving)drawCake(moving,moving.y+cameraY);
      ctx.restore();
      particles.forEach(p=>{ctx.save();ctx.globalAlpha=Math.max(0,p.life/.8);ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size*1.5,p.size,p.size*3);ctx.restore()});
      ctx.globalAlpha=1;
      if(landFlash>0){ctx.fillStyle="#fff9d0";ctx.globalAlpha=landFlash*.2;ctx.fillRect(0,0,w,h);ctx.globalAlpha=1}
      const floor=ctx.createLinearGradient(0,h-18,0,h);floor.addColorStop(0,"#fff1cf");floor.addColorStop(1,"#f39fbd");ctx.fillStyle=floor;ctx.fillRect(0,h-10,w,10);
    }
    function update(dt){
      const s=dt/16.667;
      // Smoothly interpolate to the absolute camera target: no cumulative drift.
      cameraY+=(cameraTarget-cameraY)*Math.min(1,dt*.009);
      if(Math.abs(cameraTarget-cameraY)<.12)cameraY=cameraTarget;
      if(playing&&moving){
        moving.phase+=dt*.003;
        if(!moving.falling){
          moving.x+=moving.dir*moving.speed*dt/1000;
          if(moving.x+moving.w>w){moving.x=w-moving.w;moving.dir=-1}
          if(moving.x<0){moving.x=0;moving.dir=1}
          moving.y=stack[stack.length-1].y-moving.h-moving.fallDistance+Math.sin(moving.phase)*1.5;
        }else{
          moving.vy+=.34*s;moving.y+=moving.vy*s;
          const contact=stack[stack.length-1].y-moving.h+5;
          if(moving.y>=contact)land();
        }
      }
      falling.forEach(p=>{p.vy+=.34*s;p.y+=p.vy*s;p.x+=(p.spin||0)*s;p.angle=(p.angle||0)+(p.spin||0)*.012*s});
      falling=falling.filter(p=>p.y+cameraY<h+130);
      particles.forEach(p=>{p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.vy+=190*dt/1000;p.life-=dt/1000;p.rot+=dt*.004});
      particles=particles.filter(p=>p.life>0);shake=Math.max(0,shake-dt*.018);landFlash=Math.max(0,landFlash-dt/1000);
    }
    function loop(t){
      if(!alive){raf=0;return}const dt=last?Math.min(34,t-last):16.667;last=t;worldTime=t;update(dt);draw(t);raf=requestAnimationFrame(loop);
    }
    function onPointer(e){if(!playing)return;e.preventDefault();const r=stage.getBoundingClientRect();pointerX=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));pointerY=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));drop()}
    function onMove(e){const r=stage.getBoundingClientRect();pointerX=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));pointerY=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}
    startButton.addEventListener("click",start);canvas.addEventListener("pointerdown",onPointer);stage.addEventListener("pointermove",onMove);
    if("ResizeObserver"in window){observer=new ResizeObserver(resize);observer.observe(stage)}else window.addEventListener("resize",resize);
    resize();raf=requestAnimationFrame(loop);
    return{unmount(){alive=false;playing=false;cancelAnimationFrame(raf);startButton.removeEventListener("click",start);canvas.removeEventListener("pointerdown",onPointer);stage.removeEventListener("pointermove",onMove);if(observer)observer.disconnect();else window.removeEventListener("resize",resize)}};
  }
  window.NOVERSE.Registry.registerModule(ID,{mount});
})();