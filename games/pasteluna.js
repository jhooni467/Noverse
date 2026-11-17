/* PASTELUNA 1.11 — physics-led 3D cake stacking */
(() => {
  "use strict";
  const ID="game-05", COLORS=["#ff9fc4","#ffc17c","#b7a5ff","#83dbc4","#ff8f88","#ffe09a","#91c9ff"];
  function mount(container){
    let canvas,ctx,stage,overlay,startButton,title,copy,scoreNode,bestNode,raf=0,observer=null,alive=true,playing=false;
    let w=0,h=0,dpr=1,score=0,best=0,stack=[],moving=null,falling=[],particles=[],last=0,elapsed=0,cameraY=0,shake=0;
    try{best=Number(localStorage.getItem("noverse-pasteluna-best"))||0}catch(_){}
    container.innerHTML=`
      <section class="pasteluna-game" aria-label="Pasteluna: apila pasteles">
        <header class="pasteluna-heading"><span>ATELIER DE REPOSTERÍA</span><p>Construye una torre de postres. ¡No dejes que se incline!</p></header>
        <div class="pasteluna-hud"><div><small>PASTELES</small><strong data-score>0</strong></div><div><small>RÉCORD</small><strong data-best>${best}</strong></div><span data-instruction>TOCA SOLTAR</span></div>
        <div class="pasteluna-stage" data-stage>
          <canvas class="pasteluna-canvas" data-canvas aria-label="Pastel en movimiento. Toca para dejarlo caer sobre la torre."></canvas>
          <div class="pasteluna-overlay" data-overlay>
            <div class="pasteluna-cake-mark">🍰</div><span class="pasteluna-overline">DESAFÍO DE REPOSTERÍA</span>
            <h2 data-title>Pasteluna</h2>
            <p data-copy>Un pastel se mueve de lado a lado. Toca la pantalla para soltarlo sobre la torre. Si queda mal apoyado, la torre perderá el equilibrio.</p>
            <button type="button" data-start>Comenzar a apilar</button>
          </div>
        </div><p class="pasteluna-footnote">TOCA EN CUALQUIER PARTE DEL ESCENARIO PARA SOLTAR</p>
      </section>`;
    canvas=container.querySelector("[data-canvas]");ctx=canvas.getContext("2d");stage=container.querySelector("[data-stage]");
    overlay=container.querySelector("[data-overlay]");startButton=container.querySelector("[data-start]");
    title=container.querySelector("[data-title]");copy=container.querySelector("[data-copy]");
    scoreNode=container.querySelector("[data-score]");bestNode=container.querySelector("[data-best]");
    function resize(){
      const r=stage.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(2,window.devicePixelRatio||1);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
      if(!stack.length)reset();draw();
    }
    function reset(){
      const baseW=Math.min(w*.58,230),baseH=42;
      stack=[{x:(w-baseW)/2,y:h-54,w:baseW,h:baseH,color:"#f7c99e",angle:0}];
      moving=null;falling=[];particles=[];score=0;cameraY=0;shake=0;scoreNode.textContent="0";
    }
    function spawn(){
      const top=stack[stack.length-1],width=Math.max(64,top.w);
      moving={x:-width,y:top.y-56,w:width,h:48,color:COLORS[score%COLORS.length],dir:1,speed:Math.min(330,145+score*5),phase:0,vy:0,angle:0};
    }
    function start(){
      if(!alive)return;reset();playing=true;overlay.hidden=true;spawn();last=0;
      window.NOVERSE.AmbientAudio?.playEffect("tap");
    }
    function burst(x,y,color){
      for(let i=0;i<9;i++)particles.push({x,y,vx:(Math.random()-.5)*150,vy:-Math.random()*145-25,life:.65,size:2+Math.random()*4,color});
    }
    function drop(){
      if(!playing||!moving||moving.falling)return;
      moving.falling=true;moving.vy=0;moving.dropStartY=moving.y;
      window.NOVERSE.AmbientAudio?.playEffect("drop");
    }
    function land(){
      const top=stack[stack.length-1],m=moving;
      const overlapLeft=Math.max(top.x,m.x),overlapRight=Math.min(top.x+top.w,m.x+m.w),overlap=overlapRight-overlapLeft;
      if(overlap<Math.max(22,top.w*.19)){falling.push({...m,vy:80,spin:m.x<top.x?-2.8:2.8});moving=null;finish();return;}
      const lostLeft=Math.max(0,top.x-m.x),lostRight=Math.max(0,(m.x+m.w)-(top.x+top.w));
      if(lostLeft>2)falling.push({x:m.x,y:m.y,w:lostLeft,h:m.h,color:m.color,vy:-15,spin:-1.8});
      if(lostRight>2)falling.push({x:top.x+top.w,y:m.y,w:lostRight,h:m.h,color:m.color,vy:-15,spin:1.8});
      const layer={x:overlapLeft,y:top.y-m.h+5,w:overlap,h:m.h,color:m.color,angle:0};
      stack.push(layer);moving=null;score++;scoreNode.textContent=String(score);
      burst(layer.x+layer.w/2,layer.y,layer.color);shake=Math.min(9,3+score*.15);
      if(score>best){best=score;bestNode.textContent=String(best);try{localStorage.setItem("noverse-pasteluna-best",String(best))}catch(_){}}
      window.NOVERSE.AmbientAudio?.playEffect(score%5===0?"success":"pop");
      const targetY=h*.53;
      if(layer.y<targetY)cameraY+=targetY-layer.y;
      if(stack.length>Math.ceil(h/34)+8)stack=stack.slice(-Math.ceil(h/34)-8);
      spawn();
    }
    function finish(){
      playing=false;moving=null;window.NOVERSE.GameManager?.recordCompleted?.();
      window.NOVERSE.AmbientAudio?.playEffect("fail");
      title.textContent=score?"¡Se derrumbó la torre!":"¡Inténtalo otra vez!";
      copy.textContent="Lograste apilar "+score+(score===1?" pastel.":" pasteles.")+" Récord: "+best+".";
      startButton.textContent="Volver a intentarlo";overlay.hidden=false;
    }
    function rounded(x,y,ww,hh,r){ctx.beginPath();ctx.roundRect(x,y,ww,hh,r);}
    function drawCake(layer,yOverride){
      const x=layer.x,y=yOverride??layer.y,wid=layer.w,hh=layer.h;
      ctx.save();ctx.translate(x+wid/2,y+hh/2);ctx.rotate(layer.angle||0);ctx.translate(-wid/2,-hh/2);
      ctx.shadowColor="#12081c66";ctx.shadowBlur=13;ctx.shadowOffsetY=7;
      const side=ctx.createLinearGradient(0,0,wid,0);side.addColorStop(0,"#7f4567");side.addColorStop(.16,layer.color);side.addColorStop(.72,layer.color);side.addColorStop(1,"#8d4d70");
      ctx.fillStyle=side;rounded(0,8,wid,hh-5,10);ctx.fill();
      ctx.shadowColor="transparent";
      const icing=ctx.createLinearGradient(0,0,0,17);icing.addColorStop(0,"#fff9f1");icing.addColorStop(1,"#f5c8dc");
      ctx.fillStyle=icing;rounded(0,3,wid,16,8);ctx.fill();
      ctx.fillStyle="#ffffff88";rounded(5,11,Math.max(0,wid-10),3,2);ctx.fill();
      ctx.fillStyle="#ffe5a6";for(let i=0;i<Math.min(7,Math.floor(wid/25));i++){ctx.beginPath();ctx.ellipse(13+i*22,hh-8,2.2,3,0,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#fff7e9";ctx.beginPath();ctx.ellipse(wid/2,4,wid/2,7,0,Math.PI,Math.PI*2);ctx.fill();
      ctx.fillStyle="#ffffff";ctx.globalAlpha=.4;ctx.beginPath();ctx.ellipse(wid/2,4,wid*.43,4,0,Math.PI,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.restore();
    }
    function draw(t=0){
      if(!ctx||!w||!h)return;
      const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"#382044");g.addColorStop(.5,"#70405f");g.addColorStop(1,"#25172f");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      // Confitería de fondo: lámparas cálidas, estantes y motas de azúcar.
      ctx.save();ctx.globalAlpha=.16;ctx.strokeStyle="#ffe6d4";ctx.lineWidth=2;
      for(let i=0;i<4;i++){const x=(i+1)*w/5;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h*.24);ctx.stroke();ctx.beginPath();ctx.arc(x,h*.24,Math.min(16,w*.035),0,Math.PI*2);ctx.stroke();}
      ctx.globalAlpha=.09;for(let i=0;i<5;i++){ctx.fillStyle="#ffd8ac";ctx.fillRect(0,h*(.28+i*.1),w,2);}
      ctx.restore();
      ctx.save();const jitter=shake?Math.sin(t*.06)*shake:0;ctx.translate(jitter,0);
      const offset=cameraY;
      stack.forEach((layer,i)=>{const y=layer.y+offset;if(y>-80&&y<h+70)drawCake(layer,y);});
      falling.forEach(piece=>drawCake({...piece,angle:(piece.angle||0)},piece.y+offset));
      if(moving&&!moving.falling)drawCake(moving,moving.y+offset);
      if(moving&&moving.falling)drawCake(moving,moving.y+offset);
      ctx.restore();
      particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/.65);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y, p.size,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
      const floor=ctx.createLinearGradient(0,h-20,0,h);floor.addColorStop(0,"#f8d8c1");floor.addColorStop(1,"#8e5a77");ctx.fillStyle=floor;ctx.fillRect(0,h-10,w,10);
    }
    function update(dt,t){
      const s=dt/16.667;
      if(playing&&moving){
        moving.phase+=dt*.004;
        if(!moving.falling){moving.x+=moving.dir*moving.speed*dt/1000;if(moving.x+moving.w>w){moving.x=w-moving.w;moving.dir=-1}if(moving.x<0){moving.x=0;moving.dir=1}moving.y=stack[stack.length-1].y-48+Math.sin(moving.phase)*2.5;}
        else{moving.vy+=.48*s;moving.y+=moving.vy*s;if(moving.y>=stack[stack.length-1].y-moving.h+5)land();}
      }
      falling.forEach(p=>{p.vy+=.48*s;p.y+=p.vy*s;p.x+=(p.spin||0)*s;p.angle=(p.angle||0)+(p.spin||0)*.015*s;});
      falling=falling.filter(p=>p.y<h+cameraY+100);
      particles.forEach(p=>{p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.vy+=170*dt/1000;p.life-=dt/1000;});
      particles=particles.filter(p=>p.life>0);shake=Math.max(0,shake-dt*.018);
    }
    function loop(t){
      if(!alive){raf=0;return;}const dt=last?Math.min(34,t-last):16.667;last=t;elapsed=t;
      update(dt,t);draw(t);raf=requestAnimationFrame(loop);
    }
    function onPointer(e){if(!playing)return;e.preventDefault();drop();}
    startButton.addEventListener("click",start);canvas.addEventListener("pointerdown",onPointer);
    if("ResizeObserver"in window){observer=new ResizeObserver(resize);observer.observe(stage)}else window.addEventListener("resize",resize);
    resize();raf=requestAnimationFrame(loop);
    return{unmount(){alive=false;playing=false;cancelAnimationFrame(raf);startButton.removeEventListener("click",start);canvas.removeEventListener("pointerdown",onPointer);if(observer)observer.disconnect();else window.removeEventListener("resize",resize)}};
  }
  window.NOVERSE.Registry.registerModule(ID,{mount});
})();