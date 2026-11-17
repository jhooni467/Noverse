/* COLOR CASCADE 1.11 — endless odd-shade 3x3 perception puzzle */
(() => {
  "use strict";
  const ID="game-02";
  function mount(container){
    let level=1,lives=3,score=0,answer=-1,locked=false,destroyed=false;
    let best=0;
    try{best=Number(localStorage.getItem("noverse-color-cascade-best"))||0}catch(_){}
    container.innerHTML=`
      <section class="color-game color-odd-game" aria-label="Color Cascade">
        <header class="color-intro"><span class="color-kicker">RETO DE PERCEPCIÓN</span><h2>Color Cascade</h2><p>Encuentra el cuadro con un tono diferente.<br>Solo hay uno. Toca para elegirlo.</p></header>
        <div class="color-levelbar"><span data-level>NIVEL 01</span><span data-score>0 PUNTOS</span><span data-best>RÉCORD 0</span></div>
        <div class="color-lives" data-lives aria-label="Tres oportunidades"><i></i><i></i><i></i></div>
        <div class="color-board color-board-3x3" data-board aria-label="Tablero de nueve cuadros"></div>
        <p class="color-feedback" data-feedback aria-live="polite">Nivel 1 · Encuentra el tono distinto.</p>
        <div class="color-result" data-result hidden><div class="color-result-card"><span>ESTUDIO CROMÁTICO</span><h3 data-result-title>Fin del juego</h3><p data-result-copy></p><button type="button" data-restart>Intentar de nuevo</button></div></div>
      </section>`;
    const board=container.querySelector("[data-board]"),levelNode=container.querySelector("[data-level]"),scoreNode=container.querySelector("[data-score]"),bestNode=container.querySelector("[data-best]"),livesNode=container.querySelector("[data-lives]"),feedback=container.querySelector("[data-feedback]"),result=container.querySelector("[data-result]");
    bestNode.textContent="RÉCORD "+best;
    function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
    function palette(){
      const hue=Math.floor(Math.random()*360),sat=56+Math.random()*14,light=48+Math.random()*9;
      const delta=Math.max(4.8,23-(level-1)*.78);
      const oddHue=level>8?Math.min(9,(level-8)*.32):0;
      return {base:`hsl(${hue} ${sat}% ${light}%)`,odd:`hsl(${(hue+oddHue)%360} ${sat}% ${Math.min(88,light+delta)}%)`};
    }
    function makeLevel(){
      if(destroyed)return;locked=false;result.hidden=true;board.replaceChildren();
      const colors=palette(),positions=shuffle(Array.from({length:9},(_,i)=>i));answer=positions[0];
      for(let i=0;i<9;i++){
        const tile=document.createElement("button");tile.type="button";tile.className="color-tile";
        tile.style.background=i===answer?colors.odd:colors.base;tile.dataset.index=String(i);
        tile.setAttribute("aria-label",`Cuadro ${i+1} de 9`);
        tile.addEventListener("click",()=>choose(i,tile));board.appendChild(tile);
      }
      levelNode.textContent="NIVEL "+String(level).padStart(2,"0");
      scoreNode.textContent=score+" PUNTOS";
      feedback.textContent=level===1?"Empieza fácil: busca el tono claramente distinto.":"Busca el pequeño cambio de tonalidad.";
      livesNode.setAttribute("aria-label",lives+" oportunidades restantes");
      Array.from(livesNode.children).forEach((node,i)=>node.classList.toggle("is-lost",i>=lives));
    }
    function choose(index,tile){
      if(locked||destroyed)return;
      if(index===answer){
        locked=true;score+=level;level++;
        tile.classList.add("is-correct");
        window.NOVERSE.AmbientAudio?.playEffect("success");
        feedback.textContent="¡Ese era! La siguiente ronda será más difícil.";
        if(score>best){best=score;bestNode.textContent="RÉCORD "+best;try{localStorage.setItem("noverse-color-cascade-best",String(best))}catch(_){}}
        try{localStorage.setItem("noverse-color-cascade-completed",String(level-1));localStorage.setItem("noverse-color-cascade-best-level",String(level-1))}catch(_){}
        window.setTimeout(()=>{if(!destroyed)makeLevel()},420);
      }else{
        tile.classList.add("is-wrong");lives--;
        window.NOVERSE.AmbientAudio?.playEffect("fail");
        livesNode.setAttribute("aria-label",lives+" oportunidades restantes");
        Array.from(livesNode.children).forEach((node,i)=>node.classList.toggle("is-lost",i>=lives));
        if(lives<=0){locked=true;window.NOVERSE.GameManager?.recordCompleted?.();container.querySelector("[data-result-title]").textContent="¡Buen intento!";container.querySelector("[data-result-copy]").textContent="Llegaste al nivel "+level+" y sumaste "+score+" puntos. Tu récord es "+best+".";result.hidden=false;feedback.textContent="Se terminaron tus oportunidades.";}
        else{feedback.textContent="Ese no era. Te quedan "+lives+" oportunidades.";window.setTimeout(()=>tile.classList.remove("is-wrong"),450);}
      }
    }
    function restart(){level=1;lives=3;score=0;makeLevel()}
    const restartButton=container.querySelector("[data-restart]");restartButton.addEventListener("click",restart);
    makeLevel();
    return{unmount(){destroyed=true;restartButton.removeEventListener("click",restart);board.replaceChildren()}};
  }
  window.NOVERSE.Registry.registerModule(ID,{mount});
})();