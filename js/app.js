/* NOVERSE 1.02 — APP SHELL, THEMES, TABS, STATS + FIRST-RUN INTRO */
(() => {
  "use strict";
  const Registry = window.NOVERSE.Registry;
  const GameManager = window.NOVERSE.GameManager;
  const $ = selector => document.querySelector(selector);
  const grid = $("#games-grid");
  const featured = $("#featured-games");
  const categoryBar = $("#categories");
  const gameCount = $("#game-count");
  const surprisePlay = $("#surprise-play");
  const homePlayed = $("#home-played");
  const homeScreen = $("#home-screen");
  const statsScreen = $("#stats-screen");
  const storeScreen = $("#store-screen");
  const experiencePlaceholder = $("#experience-placeholder");
  const homeModeButtons = [...document.querySelectorAll("[data-home-mode]")];
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
  const loadingMessages = ["Materializando...", "Construyendo...", "Creando...", "En producción...", "Dando forma a nuevas ideas...", "Explorando nuevos universos...", "Preparando algo especial...", "Cargando nuevas posibilidades...", "Ajustando los últimos detalles...", "Diseñando lo que viene..."];
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

  function tabScreen(tab) { return tab === "home" ? homeScreen : tab === "store" ? storeScreen : statsScreen; }
  function updateTabButtons(tab) {
    tabButtons.forEach(button => {
      const active = button.dataset.tab === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });
  }
  function animateTab(nextTab) {
    if (!["home", "store", "stats"].includes(nextTab)) return;
    if (nextTab === activeTab) {
      if (activeTab === "store" && window.NOVERSE.Store?.isDetailOpen()) window.NOVERSE.Store.closeDetail();
      return;
    }
    if (activeTab === "store" && window.NOVERSE.Store?.isDetailOpen()) window.NOVERSE.Store.closeDetail();
    const token = ++tabToken, outgoing = tabScreen(activeTab), incoming = tabScreen(nextTab);
    outgoing.classList.remove("tab-enter"); outgoing.classList.add("tab-exit");
    window.setTimeout(() => {
      if (token !== tabToken) return;
      outgoing.hidden = true; outgoing.classList.remove("tab-exit");
      incoming.hidden = false; incoming.classList.remove("tab-exit"); incoming.classList.add("tab-enter");
      activeTab = nextTab; document.body.dataset.activeTab = nextTab; updateTabButtons(nextTab);
      if (nextTab === "stats") renderStats();
      if (nextTab === "store") refreshComingMessage(storeScreen);
    }, 130);
  }
  tabButtons.forEach(button => button.addEventListener("click", () => animateTab(button.dataset.tab)));
  // Microinteracción Liquid Glass: una burbuja de luz sigue el punto de presión.
  const liquidTargets = ".bottom-nav-item,.settings,.home-mode,.store-category,.store-app-card,.store-hero-card,.store-back,.store-more,.store-install,.store-detail-close,.theme-option,.nav-back,.detail-play,.welcome-actions button";
  document.addEventListener("pointerdown", event => {
    if (document.body.dataset.theme !== "glassy") return;
    const target = event.target.closest(liquidTargets);
    if (!target || target.disabled) return;
    const rect = target.getBoundingClientRect();
    target.classList.add("liquid-pressable");
    target.style.setProperty("--liquid-x", ((event.clientX - rect.left) / Math.max(1, rect.width) * 100) + "%");
    target.style.setProperty("--liquid-y", ((event.clientY - rect.top) / Math.max(1, rect.height) * 100) + "%");
    target.classList.add("is-liquid-pressed");
  }, {passive:true});
  const releaseLiquid = () => document.querySelectorAll(".is-liquid-pressed").forEach(target => {
    target.classList.remove("is-liquid-pressed");
    window.setTimeout(() => { if (!target.classList.contains("is-liquid-pressed")) { target.style.removeProperty("--liquid-x"); target.style.removeProperty("--liquid-y"); } }, 260);
  });
  document.addEventListener("pointerup", releaseLiquid, {passive:true});
  document.addEventListener("pointercancel", releaseLiquid, {passive:true});


  function refreshComingMessage(container) {
    const message = container?.querySelector(".coming-message");
    if (!message) return;
    const options = loadingMessages.filter(value => value !== message.textContent);
    message.classList.remove("message-change"); void message.offsetWidth;
    message.textContent = options[Math.floor(Math.random() * options.length)];
    message.classList.add("message-change");
  }
  homeModeButtons.forEach(button => button.addEventListener("click", () => {
    const experiences = button.dataset.homeMode === "experiences";
    homeModeButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle("active", selected); item.setAttribute("aria-pressed", String(selected));
    });
    featured.hidden = experiences; $(".catalog").hidden = experiences;
    experiencePlaceholder.hidden = !experiences;
    if (experiences) renderExperiences();
  }));
  window.setInterval(() => {
    if (activeTab === "home" && experiencePlaceholder && !experiencePlaceholder.hidden) refreshComingMessage(experiencePlaceholder);
    if (activeTab === "store") refreshComingMessage(storeScreen);
  }, 3500);

  function renderStats() {
    const games = [
      {id:"game-01",name:"Star Catcher",icon:"⭐",metric:"Mejor puntuación",value:readNumber("noverse-star-catcher-best")},
      {id:"game-02",name:"Color Cascade",icon:"◈",metric:"Nivel más alto",value:readNumber("noverse-color-cascade-best-level"),suffix:" / 5"},
      {id:"game-03",name:"Cloud Hopper",icon:"☁",metric:"Mejor puntuación",value:readNumber("noverse-cloud-hopper-best")},
      {id:"game-04",name:"Echo Six",icon:"♫",metric:"Ronda récord",value:readNumber("noverse-echo-six-best")}
    ];
    const total = readNumber("noverse-games-played");
    const finished = readNumber("noverse-games-completed");
    const completed = readNumber("noverse-color-cascade-completed");
    const last = readText("noverse-last-game");
    const lastGame = games.find(game => game.id === last);
    statsContent.replaceChildren();
    const summary = document.createElement("div");
    summary.className = "stats-summary";
    summary.innerHTML = `
      <article class="stats-total"><span>PARTIDAS INICIADAS</span><strong>${total}</strong><small>Tu recorrido por NOVERSE</small></article>
      <article class="stats-total"><span>PARTIDAS COMPLETADAS</span><strong>${finished}</strong><small>En todos los universos</small></article>
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
    card.dataset.game = game.id;
    card.style.setProperty("--game-primary", game.palette.primary);
    card.style.setProperty("--game-surface", game.palette.surface);
    card.style.setProperty("--game-background", game.palette.background);
    card.style.setProperty("--game-secondary", game.palette.secondary);
    card.style.setProperty("--game-glow", game.palette.glow);
    const art = document.createElement("div");
    art.className = "game-art"; art.setAttribute("aria-hidden", "true");
    if (game.logo) {
      const logo = document.createElement("img");
      logo.src = game.logo; logo.alt = ""; logo.loading = "lazy";
      art.appendChild(logo);
    } else art.textContent = game.icon;
    const title = document.createElement("h3"); title.textContent = game.name;
    const description = document.createElement("p"); description.textContent = game.description;
    const status = document.createElement("span"); status.className = "game-status";
    status.textContent = game.available ? "✦ DESCUBRIR" : "PRÓXIMAMENTE";
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
    const all = Registry.getAll().filter(game => game.category !== "Experiencias");
    const visible = activeCategory === "Todos" ? all : all.filter(game => game.category === activeCategory);
    grid.replaceChildren(); visible.forEach(game => grid.appendChild(createCard(game)));
    gameCount.textContent = `${visible.length} juegos`;
  }
  function renderExperiences() {
    const games = Registry.getAll().filter(game => game.category === "Experiencias" && game.available);
    experiencePlaceholder.innerHTML = `
      <div class="experience-heading">
        <p class="eyebrow">NO SON SOLO JUEGOS · SON UNIVERSOS</p>
        <h2>Experiencias</h2>
        <p>Recorre mundos completos y descubre nuevas formas de jugar.</p>
      </div>
      <div class="experience-grid" id="experience-grid"></div>
    `;
    const list = experiencePlaceholder.querySelector("#experience-grid");
    games.forEach(game => list.appendChild(createCard(game)));
    if (!games.length) experiencePlaceholder.querySelector(".experience-heading p:last-child").textContent = "Pronto llegarán nuevas experiencias.";
  }

  function renderFeatured() {
    featured.replaceChildren();
    Registry.getAll().filter(game => game.featured && game.available).forEach(game => featured.appendChild(createCard(game)));
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
    homeScreen.hidden = true; statsScreen.hidden = true; storeScreen.hidden = true; bottomNav.hidden = true;
    $(".topbar").hidden = true; $("footer").hidden = true;
    settingsScreen.hidden = false; settingsScreen.scrollTop = 0;
    history.pushState({noverse:"settings"}, "", "#ajustes");
  }
  function closeSettings() {
    if (!settingsVisible) return;
    settingsVisible = false; settingsScreen.hidden = true;
    $(".topbar").hidden = false; $("footer").hidden = false; bottomNav.hidden = false;
    activeTab = settingsReturnTab;
    document.body.dataset.activeTab = activeTab;
    homeScreen.hidden = activeTab !== "home";
    storeScreen.hidden = activeTab !== "store";
    statsScreen.hidden = activeTab !== "stats";
    updateTabButtons(activeTab);
    if (activeTab === "stats") renderStats();
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
  if (surprisePlay) surprisePlay.addEventListener("click", () => {
    const options = Registry.getAll().filter(game => game.available);
    if (!options.length) return;
    GameManager.openDetails(options[Math.floor(Math.random() * options.length)].id);
  });
  if (homePlayed) { const played = readNumber("noverse-games-played"); homePlayed.textContent = played ? `${played} partidas iniciadas · sigue explorando` : "Tu próxima aventura te espera"; }
  document.addEventListener("noverse:catalog-updated", () => { renderFeatured(); renderGames(); });
  document.addEventListener("noverse:stats-updated", renderStats);
  window.NOVERSE = window.NOVERSE || {};
  window.NOVERSE.App = Object.freeze({
    refreshStats: renderStats,
    getActiveTab: () => activeTab,
    handleBack: async () => {
      if (settingsVisible) { closeSettings(); return true; }
      if (activeTab !== "home") { animateTab("home"); return true; }
      return false;
    }
  });
})();
