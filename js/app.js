/* =========================================================
   NOVERSE — CATALOG APP
   La interfaz obtiene sus juegos desde Game Registry.
   ========================================================= */

(() => {
  "use strict";

  const Registry = window.NOVERSE.Registry;
  const GameManager = window.NOVERSE.GameManager;

  const grid = document.querySelector("#games-grid");
  const featured = document.querySelector("#featured-games");
  const categoryBar = document.querySelector("#categories");
  const gameCount = document.querySelector("#game-count");

  let activeCategory = "Todos";

  function createCard(game) {
    const card = document.createElement("article");
    card.className = "game-card";

    const art = document.createElement("div");
    art.className = "game-art";
    art.setAttribute("aria-hidden", "true");
    art.textContent = game.icon;

    const title = document.createElement("h3");
    title.textContent = game.name;

    const description = document.createElement("p");
    description.textContent = game.description;

    const status = document.createElement("span");
    status.className = "game-status";
    status.textContent = game.available ? "JUGAR" : "PRÓXIMAMENTE";

    card.append(art, title, description, status);

    if (game.available) {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Jugar ${game.name}`);

      const open = () => GameManager.launch(game.id);
      card.addEventListener("click", open);
      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
    }

    return card;
  }

  function renderGames() {
    const allGames = Registry.getAll();
    const visibleGames = activeCategory === "Todos"
      ? allGames
      : allGames.filter(game => game.category === activeCategory);

    grid.replaceChildren();
    visibleGames.forEach(game => grid.appendChild(createCard(game)));
    gameCount.textContent = `${visibleGames.length} juegos`;
  }

  function renderFeatured() {
    featured.replaceChildren();

    Registry.getAll()
      .filter(game => game.featured)
      .forEach(game => featured.appendChild(createCard(game)));
  }

  function renderCategories() {
    categoryBar.replaceChildren();

    Registry.getCategories().forEach(category => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "category";
      button.textContent = category;
      button.setAttribute("aria-pressed", String(category === activeCategory));

      if (category === activeCategory) button.classList.add("active");

      button.addEventListener("click", () => {
        activeCategory = category;
        renderCategories();
        renderGames();
      });

      categoryBar.appendChild(button);
    });
  }

  function renderCatalog() {
    renderFeatured();
    renderGames();
  }

  renderCategories();
  renderCatalog();

  document.addEventListener("noverse:catalog-updated", renderCatalog);
})();
