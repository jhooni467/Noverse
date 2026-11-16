/* NOVERSE — CATALOG + GAME DETAIL */
(() => {
  "use strict";
  const Registry = window.NOVERSE.Registry;
  const GameManager = window.NOVERSE.GameManager;
  const grid = document.querySelector("#games-grid");
  const featured = document.querySelector("#featured-games");
  const categoryBar = document.querySelector("#categories");
  const gameCount = document.querySelector("#game-count");
  let activeCategory = "Todos";
  const settingsScreen = document.querySelector("#settings-screen");
  const settingsOpen = document.querySelector("#settings-open");
  const settingsBack = document.querySelector("#settings-back");
  const themeButtons = [...document.querySelectorAll("[data-theme-choice]")];
  const allowedThemes = ["default", "glassy", "material"];
  function applyTheme(theme, save = true) {
    const selected = allowedThemes.includes(theme) ? theme : "default";
    document.body.dataset.theme = selected;
    themeButtons.forEach(button => {
      const active = button.dataset.themeChoice === selected;
      button.setAttribute("aria-pressed", String(active));
    });
    if (save) {
      try { localStorage.setItem("noverse-theme", selected); } catch (_) {}
    }
  }
  let savedTheme = "default";
  try { savedTheme = localStorage.getItem("noverse-theme") || "default"; } catch (_) {}
  applyTheme(savedTheme, false);
  themeButtons.forEach(button => button.addEventListener("click", () => applyTheme(button.dataset.themeChoice)));

  let settingsVisible = false;
  function openSettings() {
    settingsVisible = true;
    document.querySelector(".main-content").hidden = true;
    document.querySelector(".topbar").hidden = true;
    document.querySelector("footer").hidden = true;
    settingsScreen.hidden = false;
    settingsScreen.scrollTop = 0;
    history.pushState({noverse:"settings"}, "", "#ajustes");
  }
  function closeSettings() {
    if (!settingsVisible) return;
    settingsVisible = false;
    settingsScreen.hidden = true;
    document.querySelector(".main-content").hidden = false;
    document.querySelector(".topbar").hidden = false;
    document.querySelector("footer").hidden = false;
    if (location.hash === "#ajustes") history.replaceState({}, "", location.pathname + location.search);
  }
  settingsOpen.addEventListener("click", openSettings);
  settingsBack.addEventListener("click", closeSettings);
  document.addEventListener("keydown", event => { if (event.key === "Escape" && settingsVisible) closeSettings(); });
  window.addEventListener("popstate", () => { if (settingsVisible) closeSettings(); });

  function createCard(game) {
    const card = document.createElement("article");
    card.className = "game-card";
    card.style.setProperty("--game-primary", game.palette.primary);
    card.style.setProperty("--game-surface", game.palette.surface);
    card.style.setProperty("--game-background", game.palette.background);
    card.style.setProperty("--game-secondary", game.palette.secondary);
    const art = document.createElement("div");
    art.className = "game-art";
    art.setAttribute("aria-hidden", "true");
    art.textContent = game.icon;
    const title = document.createElement("h3"); title.textContent = game.name;
    const description = document.createElement("p"); description.textContent = game.description;
    const status = document.createElement("span");
    status.className = "game-status";
    status.textContent = game.available ? "VER FICHA" : "PRÓXIMAMENTE";
    card.append(art, title, description, status);
    if (game.available) {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Ver detalles de ${game.name}`);
      const open = () => GameManager.openDetails(game.id);
      let holdTimer = null;
      let held = false;
      card.addEventListener("pointerdown", () => {
        held = false;
        holdTimer = setTimeout(() => { held = true; card.classList.add("is-pressed"); }, 260);
      });
      const release = () => { clearTimeout(holdTimer); card.classList.remove("is-pressed"); };
      card.addEventListener("pointerup", release);
      card.addEventListener("pointercancel", release);
      card.addEventListener("pointerleave", release);
      card.addEventListener("click", event => {
        if (held) { event.preventDefault(); event.stopImmediatePropagation(); held = false; return; }
        open();
      });
      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
      });
    }
    return card;
  }

  function renderGames() {
    const all = Registry.getAll();
    const visible = activeCategory === "Todos" ? all : all.filter(game => game.category === activeCategory);
    grid.replaceChildren();
    visible.forEach(game => grid.appendChild(createCard(game)));
    gameCount.textContent = `${visible.length} juegos`;
  }
  function renderFeatured() {
    featured.replaceChildren();
    Registry.getAll().filter(game => game.featured).forEach(game => featured.appendChild(createCard(game)));
  }
  function renderCategories() {
    categoryBar.replaceChildren();
    Registry.getCategories().forEach(category => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "category"; button.textContent = category;
      button.setAttribute("aria-pressed", String(category === activeCategory));
      if (category === activeCategory) button.classList.add("active");
      button.addEventListener("click", () => { activeCategory = category; renderCategories(); renderGames(); });
      categoryBar.appendChild(button);
    });
  }
  renderCategories(); renderFeatured(); renderGames();
  document.addEventListener("noverse:catalog-updated", () => { renderFeatured(); renderGames(); });
})();