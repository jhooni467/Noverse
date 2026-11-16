/* =========================================================
   NOVERSE GAME 01 — STAR CATCHER
   Minijuego arcade: atrapa estrellas durante 30 segundos.
   ========================================================= */

(() => {
  "use strict";

  const GAME_ID = "game-01";
  const ROUND_SECONDS = 30;

  function mount(container) {
    container.innerHTML = `
      <section class="star-game" aria-label="Star Catcher">
        <div class="star-game-intro">
          <span class="star-game-kicker">ARCADE · JUEGO 01</span>
          <h2>¡Atrapa las estrellas!</h2>
          <p>Toca la estrella cada vez que aparezca en un lugar nuevo.</p>
        </div>

        <div class="star-game-stats">
          <div class="star-stat"><span>PUNTOS</span><strong data-score>0</strong></div>
          <div class="star-stat"><span>TIEMPO</span><strong data-time>30</strong></div>
          <div class="star-stat"><span>RÉCORD</span><strong data-best>0</strong></div>
        </div>

        <div class="star-arena" data-arena>
          <div class="star-arena-hint" data-hint>Presiona comenzar para jugar</div>
          <button class="star-target" type="button" data-target aria-label="Atrapar estrella" hidden>★</button>
          <div class="star-game-result" data-result hidden>
            <span class="star-result-icon">✦</span>
            <h3 data-result-title>¡Buen trabajo!</h3>
            <p data-result-copy>Tu puntuación: 0</p>
          </div>
        </div>

        <div class="star-game-actions">
          <button class="star-start" type="button" data-start>Comenzar</button>
          <p class="star-game-tip">Consejo: mantén la vista en la estrella ✨</p>
        </div>
      </section>
    `;

    const scoreNode = container.querySelector("[data-score]");
    const timeNode = container.querySelector("[data-time]");
    const bestNode = container.querySelector("[data-best]");
    const arena = container.querySelector("[data-arena]");
    const target = container.querySelector("[data-target]");
    const hint = container.querySelector("[data-hint]");
    const result = container.querySelector("[data-result]");
    const resultTitle = container.querySelector("[data-result-title]");
    const resultCopy = container.querySelector("[data-result-copy]");
    const startButton = container.querySelector("[data-start]");

    let score = 0;
    let timeLeft = ROUND_SECONDS;
    let timer = null;
    let playing = false;
    let destroyed = false;
    let best = 0;

    try {
      best = Number(localStorage.getItem("noverse-star-catcher-best")) || 0;
    } catch (_) {
      best = 0;
    }
    bestNode.textContent = String(best);

    function moveTarget() {
      const bounds = arena.getBoundingClientRect();
      const size = 64;
      const maxX = Math.max(8, bounds.width - size - 8);
      const maxY = Math.max(8, bounds.height - size - 8);
      const x = 8 + Math.random() * (maxX - 8);
      const y = 8 + Math.random() * (maxY - 8);

      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
    }

    function finish() {
      if (!playing) return;
      playing = false;
      clearInterval(timer);
      timer = null;
      target.hidden = true;
      result.hidden = false;
      hint.hidden = true;
      window.NOVERSE.GameManager?.recordCompleted?.();

      const isRecord = score > best;
      if (isRecord) {
        best = score;
        bestNode.textContent = String(best);
        try {
          localStorage.setItem("noverse-star-catcher-best", String(best));
        } catch (_) {}
      }

      resultTitle.textContent = isRecord ? "¡Nuevo récord!" : "¡Partida completada!";
      resultCopy.textContent = `Conseguiste ${score} ${score === 1 ? "punto" : "puntos"}.`;
      startButton.textContent = "Jugar otra vez";
    }

    function start() {
      if (destroyed || playing) return;
      clearInterval(timer);
      score = 0;
      timeLeft = ROUND_SECONDS;
      playing = true;

      scoreNode.textContent = "0";
      timeNode.textContent = String(timeLeft);
      result.hidden = true;
      hint.hidden = true;
      target.hidden = false;
      startButton.textContent = "¡Jugando!";
      moveTarget();

      timer = setInterval(() => {
        if (destroyed || !playing) return;
        timeLeft -= 1;
        timeNode.textContent = String(timeLeft);
        if (timeLeft <= 0) finish();
      }, 1000);
    }

    function catchStar() {
      if (!playing) return;
      score += 1;
      scoreNode.textContent = String(score);
      target.classList.remove("star-pop");
      void target.offsetWidth;
      target.classList.add("star-pop");
      moveTarget();
    }

    startButton.addEventListener("click", start);
    target.addEventListener("click", catchStar);

    return {
      unmount() {
        destroyed = true;
        playing = false;
        clearInterval(timer);
        startButton.removeEventListener("click", start);
        target.removeEventListener("click", catchStar);
      }
    };
  }

  window.NOVERSE.Registry.registerModule(GAME_ID, { mount });
})();
