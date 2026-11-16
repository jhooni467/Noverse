/* NOVERSE 1.00 — APP SHELL, THEMES, TABS, STATS + FIRST-RUN INTRO */
(() => {
  "use strict";
  const Registry = window.NOVERSE.Registry;
  const GameManager = window.NOVERSE.GameManager;
  const $ = selector => document.querySelector(selector);
  const grid = $("#games-grid");
  const featured = $("#featured-games");
  const categoryBar = $("#categories");
  const gameCount = $("#game-count");
  const homeScreen = $("#home-screen");
  const statsScreen = $("#stats-screen");
  const statsContent = $("#stats-content");
  const bottomNav = $("#bottom-nav");
  const settingsScreen = $("#settings-screen");
  const settingsOpen = $("#settings-open");
  const settingsBack = $("#settings-back");
  const themeButtons = [...document.querySelectorAll("[data-theme-choice]")];
  const tabButtons = [...document.querySelectorAll("[data-tab]")];
  const allowedThemes = ["default", "glassy", "material"];
  let activeCategory = "Todos";
  let activeTab = "home";
  let settingsReturnTab = "home";
  let settingsVisible = false;
  let tabToken = 0;
  document.body.dataset.activeTab = "home";

  function readNumber(key) {
    try { return Math.max(0, Number(localStorage.getItem(key)) || 0); } catch (_) { return 0; }
  }
  function readText(key) {
    try { return localStorage.getItem(key) || ""; } catch (_) { return ""; }
  }
  function applyTheme(theme, save = true) {
    const selected = allowedThemes.includes(theme) ? theme : "default";
    document.body.dataset.theme = selected;
    themeButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.themeChoice === selected)));
    if (save) { try { localStorage.setItem("noverse-theme", selected); } catch (_) {} }
  }
  let savedTheme = "default";
  try { savedTheme = localStorage.getItem("noverse-theme") || "default"; } catch (_) {}
  applyTheme(savedTheme, false);
  themeButtons.forEach(button => button.addEventListener("click", () => applyTheme(button.dataset.themeChoice)));

  function animateTab(nextTab) {
    if (!["home", "stats"].includes(nextTab) || nextTab === activeTab) return;
    const token = ++tabToken;
    const outgoing = activeTab === "home" ? homeScreen : statsScreen;
    const incoming = nextTab === "home" ? homeScreen : statsScreen;
    outgoing.classList.remove("tab-enter");
    outgoing.classList.add("tab-exit");
    window.setTimeout(() => {
      if (token !== tabToken) return;
      outgoing.hidden = true;
      outgoing.classList.remove("tab-exit");
      incoming.hidden = false;
      incoming.classList.remove("tab-exit");
      incoming.classList.add("tab-enter");
      activeTab = nextTab;
      document.body.dataset.activeTab = nextTab;
      tabButtons.forEach(button => {
        const active = button.dataset.tab === nextTab;
        button.classList.toggle("active", active);
        button.setAttribute("aria-current", active ? "page" : "false");
      });
      if (nextTab === "stats") renderStats();
    }, 130);
  }
  tabButtons.forEach(button => button.addEventListener("click", () => animateTab(button.dataset.tab)));

  function renderStats() {
    const games = [
      {id:"game-01",name:"Star Catcher",icon:"⭐",metric:"Mejor puntuación",value:readNumber("noverse-star-catcher-best")},
      {id:"game-02",name:"Color Cascade",icon:"◈",metric:"Nivel más alto",value:readNumber("noverse-color-cascade-best-level"),suffix:" / 5"},
      {id:"game-03",name:"Cloud Hopper",icon:"☁",metric:"Mejor puntuación",value:readNumber("noverse-cloud-hopper-best")},
      {id:"game-04",name:"Echo Six",icon:"♫",metric:"Ronda récord",value:readNumber("noverse-echo-six-best")}
    ];
    const total = readNumber("noverse-games-played");
    const completed = readNumber("noverse-color-cascade-completed");
    const last = readText("noverse-last-game");
    const lastGame = games.find(game => game.id === last);
    statsContent.replaceChildren();
    const summary = document.createElement("div");
    summary.className = "stats-summary";
    summary.innerHTML = `
      <article class="stats-total"><span>PARTIDAS INICIADAS</span><strong>${total}</strong><small>Tu recorrido por NOVERSE</small></article>
      <article class="stats-total"><span>PALETAS COMPLETADAS</span><strong>${completed}</strong><small>Color Cascade</small></article>
    `;
    const heading = document.createElement("div");
    heading.className = "stats-section-title";
    heading.innerHTML = "<h2>Récords por universo</h2><span>PERSONAL</span>";
    const list = document.createElement("div");
    list.className = "stats-game-grid";
    games.forEach(game => {
      const card = document.createElement("article");
      card.className = "stats-game-card";
      card.dataset.game = game.id;
      const value = game.value ? String(game.value) + (game.suffix || "") : "—";
      card.innerHTML = `<div class="stats-game-icon" aria-hidden="true">${game.icon}</div><div class="stats-game-copy"><strong>${game.name}</strong><span>${game.metric}</span></div><b class="stats-game-value">${value}</b>`;
      list.appendChild(card);
    });
    const foot = document.createElement("p");
    foot.className = "stats-footnote";
    foot.textContent = lastGame ? `Último universo visitado: ${lastGame.name}` : "Tus aventuras aparecerán aquí cuando empieces a jugar.";
    statsContent.append(summary, heading, list, foot);
  }

  function createCard(game) {
    const card = document.createElement("article");
    card.className = "game-card";
    card.style.setProperty("--game-primary", game.palette.primary);
    card.style.setProperty("--game-surface", game.palette.surface);
    card.style.setProperty("--game-background", game.palette.background);
    card.style.setProperty("--game-secondary", game.palette.secondary);
    const art = document.createElement("div");
    art.className = "game-art"; art.setAttribute("aria-hidden", "true"); art.textContent = game.icon;
    const title = document.createElement("h3"); title.textContent = game.name;
    const description = document.createElement("p"); description.textContent = game.description;
    const status = document.createElement("span"); status.className = "game-status";
    status.textContent = game.available ? "VER FICHA" : "PRÓXIMAMENTE";
    card.append(art, title, description, status);
    if (game.available) {
      card.tabIndex = 0; card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Ver detalles de ${game.name}`);
      const open = () => GameManager.openDetails(game.id);
      let holdTimer = null; let held = false;
      card.addEventListener("pointerdown", () => {
        held = false; holdTimer = setTimeout(() => { held = true; card.classList.add("is-pressed"); }, 260);
      });
      const release = () => { clearTimeout(holdTimer); card.classList.remove("is-pressed"); };
      card.addEventListener("pointerup", release); card.addEventListener("pointercancel", release); card.addEventListener("pointerleave", release);
      card.addEventListener("click", event => {
        if (held) { event.preventDefault(); event.stopImmediatePropagation(); held = false; return; }
        open();
      });
      card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
    }
    return card;
  }
  function renderGames() {
    const all = Registry.getAll();
    const visible = activeCategory === "Todos" ? all : all.filter(game => game.category === activeCategory);
    grid.replaceChildren(); visible.forEach(game => grid.appendChild(createCard(game)));
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

  function openSettings() {
    if (settingsVisible) return;
    settingsReturnTab = activeTab;
    settingsVisible = true;
    homeScreen.hidden = true; statsScreen.hidden = true; bottomNav.hidden = true;
    $(".topbar").hidden = true; $("footer").hidden = true;
    settingsScreen.hidden = false; settingsScreen.scrollTop = 0;
    history.pushState({noverse:"settings"}, "", "#ajustes");
  }
  function closeSettings() {
    if (!settingsVisible) return;
    settingsVisible = false; settingsScreen.hidden = true;
    $(".topbar").hidden = false; $("footer").hidden = false; bottomNav.hidden = false;
    if (settingsReturnTab === "stats") { activeTab = "home"; animateTab("stats"); }
    else { activeTab = "stats"; animateTab("home"); }
    if (location.hash === "#ajustes") history.replaceState({}, "", location.pathname + location.search);
  }
  settingsOpen.addEventListener("click", openSettings);
  settingsBack.addEventListener("click", closeSettings);
  document.addEventListener("keydown", event => { if (event.key === "Escape" && settingsVisible) closeSettings(); });
  window.addEventListener("popstate", () => { if (settingsVisible) closeSettings(); });

  function initOnboarding() {
    const screen = $("#onboarding");
    if (!screen) return;
    let seen = false;
    try { seen = localStorage.getItem("noverse-onboarding-v1") === "done"; } catch (_) {}
    if (seen) return;
    const slides = [
      {title:"NOVERSE",copy:"Un lugar donde muchos universos se encuentran."},
      {title:"EXPLORA",copy:"Descubre juegos distintos: reflejos, color, vuelo y memoria musical."},
      {title:"TU UNIVERSO",copy:"Juega a tu ritmo, supera tus récords y vuelve para descubrir más."}
    ];
    let index = 0;
    const title = screen.querySelector("[data-onboarding-title]");
    const copy = screen.querySelector("[data-onboarding-copy]");
    const dots = [...screen.querySelectorAll(".onboarding-dots span")];
    const next = screen.querySelector("[data-onboarding-next]");
    const finish = () => {
      try { localStorage.setItem("noverse-onboarding-v1", "done"); } catch (_) {}
      screen.classList.add("onboarding-out");
      setTimeout(() => { screen.hidden = true; screen.classList.remove("onboarding-out"); }, 420);
    };
    const paint = () => {
      const content = screen.querySelector(".onboarding-content");
      content.classList.remove("onboarding-copy-in"); void content.offsetWidth;
      title.textContent = slides[index].title; copy.textContent = slides[index].copy;
      dots.forEach((dot,i) => dot.classList.toggle("active",i===index));
      next.innerHTML = index === slides.length - 1 ? "Explorar NOVERSE <span>✦</span>" : "Continuar <span>→</span>";
      content.classList.add("onboarding-copy-in");
    };
    next.addEventListener("click", () => { if (index < slides.length - 1) { index++; paint(); } else finish(); });
    screen.querySelector("[data-onboarding-skip]").addEventListener("click", finish);
    screen.hidden = false; paint();
  }

  renderCategories(); renderFeatured(); renderGames(); renderStats(); initOnboarding();
  document.addEventListener("noverse:catalog-updated", () => { renderFeatured(); renderGames(); });
  document.addEventListener("noverse:stats-updated", renderStats);
  window.NOVERSE = window.NOVERSE || {};
  window.NOVERSE.App = Object.freeze({ refreshStats: renderStats, getActiveTab: () => activeTab });
})();
