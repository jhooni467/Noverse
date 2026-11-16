/* =========================================================
   NOVERSE CORE — GAME MANAGER
   Controla el ciclo de vida de los minijuegos.
   Los juegos se registran desde sus propios módulos.
   ========================================================= */

(() => {
  "use strict";

  const modules = new Map();
  let activeGame = null;
  let launchToken = 0;

  const screen = document.querySelector("#game-screen");
  const root = document.querySelector("#game-root");
  const title = document.querySelector("#game-title");
  const backButton = document.querySelector("#game-back");
  const catalog = document.querySelector(".main-content");
  const topbar = document.querySelector(".topbar");
  const footer = document.querySelector("footer");
  const notice = document.querySelector("#game-notice");

  function notify(message) {
    if (!notice) return;
    notice.textContent = message;
    notice.hidden = false;
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => {
      notice.hidden = true;
    }, 2400);
  }

  function setGameView(open) {
    screen.hidden = !open;
    catalog.hidden = open;
    topbar.hidden = open;
    footer.hidden = open;
    document.body.classList.toggle("game-is-open", open);
  }

  function register(id, definition) {
    if (!id || typeof id !== "string") {
      throw new TypeError("Cada juego necesita un ID de texto.");
    }

    if (!definition || typeof definition.mount !== "function") {
      throw new TypeError(`El juego "${id}" necesita una función mount().`);
    }

    if (modules.has(id)) {
      console.warn(`NOVERSE: el juego "${id}" ya estaba registrado.`);
      return false;
    }

    modules.set(id, definition);
    return true;
  }

  async function close() {
    launchToken += 1;
    const previous = activeGame;
    activeGame = null;

    if (previous && typeof previous.instance?.unmount === "function") {
      try {
        await previous.instance.unmount();
      } catch (error) {
        console.error("NOVERSE: error al cerrar el juego.", error);
      }
    }

    root.replaceChildren();
    setGameView(false);
  }

  async function launch(id) {
    const definition = modules.get(id);

    if (!definition) {
      notify("Este juego llegará próximamente ✦");
      return false;
    }

    await close();
    const token = ++launchToken;

    title.textContent = definition.name || "Minijuego";
    root.replaceChildren();
    setGameView(true);

    try {
      const instance = await definition.mount(root, {
        close,
        notify,
        getRoot: () => root
      });

      if (token !== launchToken) {
        if (typeof instance?.unmount === "function") {
          await instance.unmount();
        }
        return false;
      }

      activeGame = { id, instance: instance || {} };
      return true;
    } catch (error) {
      console.error(`NOVERSE: no se pudo iniciar "${id}".`, error);
      root.replaceChildren();

      const message = document.createElement("p");
      message.className = "game-error";
      message.textContent = "No se pudo abrir este juego. Vuelve al catálogo e inténtalo de nuevo.";
      root.appendChild(message);

      activeGame = null;
      return false;
    }
  }

  async function handleBack() {
    if (screen.hidden) return false;
    await close();
    return true;
  }

  backButton?.addEventListener("click", handleBack);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !screen.hidden) {
      handleBack();
    }
  });

  window.NOVERSE = window.NOVERSE || {};
  window.NOVERSE.GameManager = Object.freeze({
    register,
    launch,
    close,
    handleBack,
    isRegistered: id => modules.has(id),
    getActiveGame: () => activeGame?.id || null,
    getRegisteredGames: () => Array.from(modules.keys())
  });
})();
