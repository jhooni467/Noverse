/* NOVERSE CORE — DETAIL + GAME LIFECYCLE */
(() => {
  "use strict";
  const modules = new Map();
  let activeGame = null;
  let selectedGame = null;
  let launchToken = 0;
  let hasPlayedGame = false;
  const detailScreen = document.querySelector("#detail-screen");
  const detailContent = document.querySelector("#detail-content");
  const gameScreen = document.querySelector("#game-screen");
  const root = document.querySelector("#game-root");
  const title = document.querySelector("#game-title");
  const detailBack = document.querySelector("#detail-back");
  const gameBack = document.querySelector("#game-back");
  const catalog = document.querySelector(".main-content");
  const topbar = document.querySelector(".topbar");
  const footer = document.querySelector("footer");
  const notice = document.querySelector("#game-notice");

  function notify(message) {
    if (!notice) return;
    notice.textContent = message; notice.hidden = false;
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => { notice.hidden = true; }, 2400);
  }
  function setView(view) {
    catalog.hidden = view !== "catalog";
    topbar.hidden = view !== "catalog";
    footer.hidden = view !== "catalog";
    detailScreen.hidden = view !== "detail";
    gameScreen.hidden = view !== "game";
    document.body.classList.toggle("game-is-open", view !== "catalog");
    document.body.dataset.noverseView = view;
  }
  function register(id, definition) {
    if (!id || typeof id !== "string") throw new TypeError("Cada juego necesita un ID de texto.");
    if (!definition || typeof definition.mount !== "function") throw new TypeError(`El juego "${id}" necesita una función mount().`);
    if (modules.has(id)) { console.warn(`NOVERSE: el juego "${id}" ya estaba registrado.`); return false; }
    modules.set(id, definition); return true;
  }
  function openDetails(id) {
    const game = window.NOVERSE.Registry.get(id);
    if (!game) return false;
    if (!game.available) { notify("Este juego llegará próximamente ✦"); return false; }
    selectedGame = game;
    const palette = game.palette;
    detailScreen.dataset.gameId = id;
    gameScreen.dataset.gameId = id;
    detailScreen.style.setProperty("--game-primary", palette.primary);
    detailScreen.style.setProperty("--game-secondary", palette.secondary);
    detailScreen.style.setProperty("--game-background", palette.background);
    detailScreen.style.setProperty("--game-surface", palette.surface);
    detailScreen.style.setProperty("--game-glow", palette.glow);
    gameScreen.style.setProperty("--game-primary", palette.primary);
    gameScreen.style.setProperty("--game-secondary", palette.secondary);
    gameScreen.style.setProperty("--game-background", palette.background);
    gameScreen.style.setProperty("--game-surface", palette.surface);
    gameScreen.style.setProperty("--game-glow", palette.glow);
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    detailContent.innerHTML = `
      <section class="detail-hero">
        <div class="detail-orb detail-orb-one"></div><div class="detail-orb detail-orb-two"></div>
        <div class="detail-game-icon">${game.icon}</div>
        <span class="detail-category">${game.category}</span>
        <h1>${game.name}</h1>
        <p>${game.shortInfo}</p>
        <div class="detail-meta">
          <span><small>DURACIÓN</small><strong>${game.duration}</strong></span>
          <span><small>DIFICULTAD</small><strong>${game.difficulty}</strong></span>
        </div>
      </section>
      <section class="detail-gallery">
        <div class="detail-section-heading"><h2>Conoce el juego</h2><span>VISTA PREVIA</span></div>
        <div class="preview-gallery">
          <div class="preview-shot preview-shot-one"><span>${game.icon}</span><strong>${game.previews[0]}</strong></div>
          <div class="preview-shot preview-shot-two"><span>✦</span><strong>${game.previews[1]}</strong></div>
        </div>
      </section>
      <button class="detail-play" type="button" data-play>▶ <span>PLAY</span></button>
    `;
    detailContent.querySelector("[data-play]").addEventListener("click", () => launch(id));
    setView("detail");
    detailScreen.scrollTop = 0;
    return true;
  }
  async function stopActiveGame() {
    launchToken += 1;
    const previous = activeGame;
    activeGame = null;
    if (previous && typeof previous.instance?.unmount === "function") {
      try { await previous.instance.unmount(); }
      catch (error) { console.error("NOVERSE: error al cerrar el juego.", error); }
    }
    root.replaceChildren();
  }
  async function launch(id) {
    const definition = modules.get(id);
    if (!definition) { notify("Este juego llegará próximamente ✦"); return false; }
    await stopActiveGame();
    hasPlayedGame = true;
    const token = ++launchToken;
    title.textContent = definition.name || "Minijuego";
    root.replaceChildren();
    setView("game");
    try {
      const instance = await definition.mount(root, { close: backToDetails, notify, getRoot: () => root });
      if (token !== launchToken) {
        if (typeof instance?.unmount === "function") await instance.unmount();
        return false;
      }
      activeGame = { id, instance: instance || {} };
      return true;
    } catch (error) {
      console.error(`NOVERSE: no se pudo iniciar "${id}".`, error);
      root.innerHTML = '<p class="game-error">No se pudo abrir este juego. Vuelve a su ficha e inténtalo de nuevo.</p>';
      activeGame = null; return false;
    }
  }
  async function backToDetails() {
    await stopActiveGame();
    if (selectedGame) setView("detail"); else setView("catalog");
  }
  async function backToCatalog() {
    await stopActiveGame();
    if (hasPlayedGame && selectedGame) {
      const palette = selectedGame.palette;
      document.body.dataset.recentGame = selectedGame.id;
      document.body.style.setProperty("--material-recent-background", palette.background);
      document.body.style.setProperty("--material-recent-primary", palette.primary);
      hasPlayedGame = false;
    }
    selectedGame = null;
    setView("catalog");
  }
  detailBack?.addEventListener("click", backToCatalog);
  gameBack?.addEventListener("click", backToDetails);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (!gameScreen.hidden) backToDetails();
      else if (!detailScreen.hidden) backToCatalog();
    }
  });
  window.addEventListener("popstate", () => {
    if (!gameScreen.hidden) backToDetails();
    else if (!detailScreen.hidden) backToCatalog();
  });
  window.NOVERSE = window.NOVERSE || {};
  window.NOVERSE.GameManager = Object.freeze({
    register, launch, openDetails, close: backToDetails, handleBack: backToDetails,
    isRegistered: id => modules.has(id),
    getActiveGame: () => activeGame?.id || null,
    getRegisteredGames: () => Array.from(modules.keys())
  });
})();