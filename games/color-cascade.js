/* =========================================================
   NOVERSE GAME 02 — COLOR CASCADE
   Arrastra las fichas manteniéndolas presionadas para
   ordenar los tonos del más claro al más oscuro.
   ========================================================= */
(() => {
  "use strict";
  const GAME_ID = "game-02";
  const MAX_COLORS = 12;

  function mount(container) {
    let level = 1;
    let tiles = [];
    let completed = false;
    let dragTile = null;
    let placeholder = null;
    let dragGhost = null;
    let pointerId = null;
    let startIndex = -1;
    let moves = 0;
    let hue = 260;
    let destroyed = false;
    let advanceTimer = null;

    container.innerHTML = `
      <section class="color-game" aria-label="Color Cascade">
        <header class="color-intro">
          <span class="color-kicker">ESTUDIO CROMÁTICO</span>
          <h2>Color Cascade</h2>
          <p>Mantén presionada una ficha y muévela<br>para ordenar los tonos de claro a oscuro.</p>
        </header>
        <div class="color-levelbar">
          <span data-level>PALETA 01</span><span data-count>5 COLORES</span><span data-moves>0 MOVIMIENTOS</span>
        </div>
        <div class="color-board" data-board aria-label="Fichas de colores"></div>
        <div class="color-direction"><span>MÁS CLARO</span><span>MÁS OSCURO</span></div>
        <p class="color-feedback" data-feedback aria-live="polite">Desliza los tonos hasta que fluyan de claro a oscuro.</p>
        <div data-win hidden></div>
      </section>`;

    const board = container.querySelector("[data-board]");
    const levelNode = container.querySelector("[data-level]");
    const countNode = container.querySelector("[data-count]");
    const movesNode = container.querySelector("[data-moves]");
    const feedback = container.querySelector("[data-feedback]");
    const win = container.querySelector("[data-win]");

    function shuffle(array) {
      const copy = array.slice();
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      if (copy.every((item, index) => item.id === array[index].id)) {
        [copy[0], copy[1]] = [copy[1], copy[0]];
      }
      return copy;
    }

    function makeLevel() {
      cancelDrag();
      const count = Math.min(MAX_COLORS, 5 + Math.floor((level - 1) / 2));
      hue = Math.floor(Math.random() * 360);
      const ordered = Array.from({ length: count }, (_, i) => ({
        id: `c${i}`,
        color: `hsl(${hue} 72% ${(88 - i * (60 / (count - 1))).toFixed(1)}%)`
      }));
      tiles = shuffle(ordered);
      moves = 0;
      completed = false;
      win.hidden = true;
      feedback.textContent = "Desliza los tonos hasta que fluyan de claro a oscuro.";
      render();
    }

    function render() {
      board.replaceChildren();
      tiles.forEach((tile, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "color-tile";
        button.style.background = tile.color;
        button.style.setProperty("--tile-order", String(index));
        button.dataset.id = tile.id;
        button.setAttribute("aria-label", `Ficha ${index + 1}`);
        button.addEventListener("pointerdown", startDrag);
        board.appendChild(button);
      });
      levelNode.textContent = `PALETA ${String(level).padStart(2,"0")}`;
      countNode.textContent = `${tiles.length} COLORES`;
      updateMoves();
    }

    function updateMoves() {
      movesNode.textContent = `${moves} ${moves === 1 ? "MOVIMIENTO" : "MOVIMIENTOS"}`;
    }

    function syncTilesFromDOM() {
      const byId = new Map(tiles.map(tile => [tile.id, tile]));
      tiles = Array.from(board.children, node => byId.get(node.dataset.id)).filter(Boolean);
      Array.from(board.children).forEach((node, index) => {
        if (node.classList.contains("color-placeholder")) return;
        node.setAttribute("aria-label", `Ficha ${index + 1}`);
      });
    }

    function animateReorder(beforeRects) {
      Array.from(board.children).forEach(node => {
        if (node === placeholder || node === dragTile) return;
        const previous = beforeRects.get(node);
        if (!previous) return;
        const next = node.getBoundingClientRect();
        const dx = previous.left - next.left;
        const dy = previous.top - next.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        node.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
          { duration: 180, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
      });
    }

    function startDrag(event) {
      if (destroyed || completed || dragTile || (event.pointerType === "mouse" && event.button !== 0)) return;
      event.preventDefault();

      dragTile = event.currentTarget;
      pointerId = event.pointerId;
      startIndex = Array.from(board.children).indexOf(dragTile);

      const rect = dragTile.getBoundingClientRect();
      placeholder = document.createElement("div");
      placeholder.className = "color-placeholder";
      placeholder.dataset.id = dragTile.dataset.id;
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      board.insertBefore(placeholder, dragTile);
      dragTile.remove();

      dragGhost = document.createElement("div");
      dragGhost.className = "color-drag-ghost";
      dragGhost.style.background = tiles.find(item => item.id === dragTile.dataset.id).color;
      dragGhost.style.width = `${rect.width}px`;
      dragGhost.style.height = `${rect.height}px`;
      dragGhost.style.left = `${rect.left}px`;
      dragGhost.style.top = `${rect.top}px`;
      document.body.appendChild(dragGhost);

      window.addEventListener("pointermove", moveDrag, { passive: false });
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", cancelDrag);
      window.addEventListener("blur", cancelDrag);
      feedback.textContent = "Suelta la ficha cuando esté en el lugar correcto.";
    }

    function moveDrag(event) {
      if (!dragTile || event.pointerId !== pointerId) return;
      event.preventDefault();

      if (dragGhost) {
        dragGhost.style.left = `${event.clientX - dragGhost.offsetWidth / 2}px`;
        dragGhost.style.top = `${event.clientY - dragGhost.offsetHeight / 2}px`;
      }

      const candidates = Array.from(board.querySelectorAll(".color-tile"));
      let target = null;
      let before = false;
      for (const node of candidates) {
        const rect = node.getBoundingClientRect();
        if (event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top - 8 && event.clientY <= rect.bottom + 8) {
          target = node;
          before = event.clientX < rect.left + rect.width / 2;
          break;
        }
      }
      if (!target || !placeholder) return;

      const nextPosition = before ? target : target.nextSibling;
      if (nextPosition === placeholder || placeholder.nextSibling === nextPosition) return;

      const beforeRects = new Map(
        candidates.map(node => [node, node.getBoundingClientRect()])
      );
      board.insertBefore(placeholder, nextPosition);
      syncTilesFromDOM();
      animateReorder(beforeRects);
    }

    function removeDragListeners() {
      window.removeEventListener("pointermove", moveDrag);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", cancelDrag);
      window.removeEventListener("blur", cancelDrag);
    }

    function finishDrag() {
      if (!dragTile) return;
      const tile = dragTile;
      const finalIndex = Array.from(board.children).indexOf(placeholder);
      if (placeholder?.parentNode) placeholder.replaceWith(tile);
      tile.classList.remove("dragging");
      tile.addEventListener("pointerdown", startDrag);
      dragGhost?.remove();
      dragTile = null;
      placeholder = null;
      dragGhost = null;
      pointerId = null;
      removeDragListeners();
      syncTilesFromDOM();

      if (finalIndex !== startIndex) {
        moves++;
        updateMoves();
        tile.classList.remove("tile-drop");
        void tile.offsetWidth;
        tile.classList.add("tile-drop");
        if (isSolved()) finishLevel();
        else feedback.textContent = "¡Bien! Sigue acomodando los tonos.";
      }
      startIndex = -1;
    }

    function endDrag(event) {
      if (!dragTile || event.pointerId !== pointerId) return;
      finishDrag();
    }

    function cancelDrag() {
      if (!dragTile) return;
      if (placeholder?.parentNode) placeholder.replaceWith(dragTile);
      dragTile.classList.remove("dragging");
      dragGhost?.remove();
      dragTile = null;
      placeholder = null;
      dragGhost = null;
      pointerId = null;
      startIndex = -1;
      removeDragListeners();
      syncTilesFromDOM();
    }

    function isSolved() {
      return tiles.length > 0 && tiles.every((tile, index) => tile.id === `c${index}`);
    }

    function finishLevel() {
      if (completed) return;
      completed = true;
      try {
        const done = Math.max(0, Number(localStorage.getItem("noverse-color-cascade-completed")) || 0);
        const bestLevel = Math.max(0, Number(localStorage.getItem("noverse-color-cascade-best-level")) || 0);
        localStorage.setItem("noverse-color-cascade-completed", String(done + 1));
        localStorage.setItem("noverse-color-cascade-best-level", String(Math.max(bestLevel, level)));
      } catch (_) {}
      window.NOVERSE.GameManager?.recordCompleted?.();
      feedback.textContent = "¡Degradado perfecto!";
      win.hidden = false;
      win.className = "color-win";
      win.innerHTML = `<div class="color-win-symbol">✦</div><h3>¡Degradado perfecto!</h3><p>Paleta ${level} completada en ${moves} movimientos.</p><small>Preparando nuevos tonos…</small>`;
      window.NOVERSE.AmbientAudio?.playEffect("success");
      advanceTimer = window.setTimeout(() => {
        if (destroyed) return;
        level += 1;
        makeLevel();
      }, 1250);
    }

    makeLevel();

    return {
      unmount() {
        destroyed = true;
        cancelDrag();
        board.replaceChildren();
      }
    };
  }

  window.NOVERSE.Registry.registerModule(GAME_ID, { mount });
})();
