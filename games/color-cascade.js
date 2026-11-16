/* =========================================================
   NOVERSE GAME 02 — COLOR CASCADE
   Ordena las fichas de color del tono más claro al más oscuro.
   ========================================================= */
(() => {
  "use strict";
  const GAME_ID = "game-02";
  const LEVELS = [5, 6, 7, 8, 9];
  function mount(container) {
    let level = 1;
    let tiles = [];
    let completed = false;
    let dragTile = null;
    let pointerId = null;
    let moves = 0;
    let hue = 260;
    container.innerHTML = `
      <section class="color-game" aria-label="Color Cascade">
        <header class="color-intro">
          <span class="color-kicker">PUZZLE · JUEGO 02</span>
          <h2>Color Cascade</h2>
          <p>Arrastra las fichas y ordena los tonos<br>del más claro al más oscuro.</p>
        </header>
        <div class="color-levelbar">
          <span data-level>NIVEL 1 / 5</span><span data-count>5 COLORES</span><span data-moves>0 MOVIMIENTOS</span>
        </div>
        <div class="color-board" data-board aria-label="Fichas de colores"></div>
        <div class="color-direction"><span>MÁS CLARO</span><span>MÁS OSCURO</span></div>
        <p class="color-feedback" data-feedback aria-live="polite">Mantén pulsada una ficha y arrástrala a otra posición.</p>
        <div class="color-actions">
          <button class="color-button" type="button" data-reset>Mezclar de nuevo</button>
          <button class="color-button primary" type="button" data-check>Comprobar</button>
        </div>
        <div data-win hidden></div>
      </section>`;
    const board=container.querySelector("[data-board]");
    const levelNode=container.querySelector("[data-level]");
    const countNode=container.querySelector("[data-count]");
    const movesNode=container.querySelector("[data-moves]");
    const feedback=container.querySelector("[data-feedback]");
    const win=container.querySelector("[data-win]");
    const reset=container.querySelector("[data-reset]");
    const check=container.querySelector("[data-check]");
    function shuffle(array) {
      const copy=array.slice();
      for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
      if(copy.every((item,index)=>item.id===array[index].id)) [copy[0],copy[1]]=[copy[1],copy[0]];
      return copy;
    }
    function makeLevel() {
      const count=LEVELS[Math.min(level-1,LEVELS.length-1)];
      hue=Math.floor(Math.random()*360);
      const ordered=Array.from({length:count},(_,i)=>({
        id:`c${i}`,lightness:88-i*(60/(count-1)),
        color:`hsl(${hue} 72% ${(88-i*(60/(count-1))).toFixed(1)}%)`
      }));
      tiles=shuffle(ordered);
      moves=0;completed=false;win.hidden=true;
      feedback.textContent="Mantén pulsada una ficha y arrástrala a otra posición.";
      render();
    }
    function render() {
      board.replaceChildren();
      tiles.forEach((tile,index)=>{
        const button=document.createElement("button");
        button.type="button";button.className="color-tile";
        button.style.background=tile.color;
        button.dataset.id=tile.id;button.dataset.number=String(index+1);
        button.setAttribute("aria-label",`Ficha ${index+1}, tono ${tile.id.slice(1)}`);
        button.addEventListener("pointerdown",startDrag);
        board.appendChild(button);
      });
      levelNode.textContent=`NIVEL ${level} / 5`;
      countNode.textContent=`${tiles.length} COLORES`;
      movesNode.textContent=`${moves} ${moves===1?"MOVIMIENTO":"MOVIMIENTOS"}`;
    }
    function syncTilesFromDOM() {
      const ids=Array.from(board.children).map(node=>node.dataset.id);
      tiles=ids.map(id=>tiles.find(tile=>tile.id===id));
      Array.from(board.children).forEach((node,index)=>node.dataset.number=String(index+1));
    }
    function startDrag(event) {
      if(completed || event.button!==0 && event.pointerType==="mouse") return;
      dragTile=event.currentTarget;pointerId=event.pointerId;
      dragTile.classList.add("dragging");
      dragTile.setPointerCapture(pointerId);
      dragTile.addEventListener("pointermove",moveDrag);
      dragTile.addEventListener("pointerup",endDrag,{once:true});
      dragTile.addEventListener("pointercancel",endDrag,{once:true});
    }
    function moveDrag(event) {
      if(!dragTile || event.pointerId!==pointerId) return;
      const under=document.elementFromPoint(event.clientX,event.clientY);
      const target=under?.closest(".color-tile");
      if(!target || target===dragTile || target.parentElement!==board) return;
      const rect=target.getBoundingClientRect();
      const before=event.clientX < rect.left+rect.width/2;
      board.insertBefore(dragTile,before?target:target.nextSibling);
      syncTilesFromDOM();
    }
    function endDrag(event) {
      if(!dragTile || event.pointerId!==pointerId) return;
      dragTile.classList.remove("dragging");
      dragTile.removeEventListener("pointermove",moveDrag);
      dragTile=null;pointerId=null;moves++;movesNode.textContent=`${moves} ${moves===1?"MOVIMIENTO":"MOVIMIENTOS"}`;
      if(tiles.every((tile,index)=>tile.id===`c${index}`)) finishLevel();
    }
    function finishLevel() {
      completed=true;feedback.textContent="¡Degradado perfecto!";
      win.hidden=false;win.className="color-win";
      win.innerHTML=`<h3>¡Paleta completada!</h3><p>Ordenaste todos los tonos en ${moves} movimientos.</p><button class="color-button primary" type="button" data-next>${level===5?"Jugar otra vez":"Siguiente nivel"}</button>`;
      win.querySelector("[data-next]").addEventListener("click",()=>{
        level=level===5?1:level+1;makeLevel();
      });
    }
    function checkOrder() {
      if(completed) return;
      if(tiles.every((tile,index)=>tile.id===`c${index}`)) finishLevel();
      else feedback.textContent="Todavía hay tonos fuera de lugar. ¡Sigue intentando!";
    }
    function resetLevel(){makeLevel();}
    reset.addEventListener("click",resetLevel);
    check.addEventListener("click",checkOrder);
    makeLevel();
    return {unmount(){reset.removeEventListener("click",resetLevel);check.removeEventListener("click",checkOrder);}};
  }
  window.NOVERSE.Registry.registerModule(GAME_ID,{mount});
})();