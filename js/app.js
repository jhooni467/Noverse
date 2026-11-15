
const games = [
  {
    id: "game-01",
    name: "Próximo descubrimiento",
    description: "Una nueva experiencia te espera.",
    category: "Arcade",
    icon: "✨",
    featured: true
  },
  {
    id: "game-02",
    name: "Próximo puzzle",
    description: "Pon a prueba tu lógica.",
    category: "Puzzle",
    icon: "🧩",
    featured: true
  },
  {
    id: "game-03",
    name: "Próximo desafío",
    description: "Demuestra tu habilidad.",
    category: "Habilidad",
    icon: "⚡",
    featured: false
  },
  {
    id: "game-04",
    name: "Próxima aventura",
    description: "Explora algo diferente.",
    category: "Creatividad",
    icon: "🎨",
    featured: false
  },
  {
    id: "game-05",
    name: "Próximo universo",
    description: "Descubre una experiencia relajante.",
    category: "Relajación",
    icon: "🌙",
    featured: false
  }
];

const categories = [
  "Todos",
  "Arcade",
  "Puzzle",
  "Habilidad",
  "Creatividad",
  "Relajación"
];

let activeCategory = "Todos";

const grid = document.querySelector("#games-grid");
const featured = document.querySelector("#featured-games");
const categoryBar = document.querySelector("#categories");
const gameCount = document.querySelector("#game-count");

function createCard(game) {
  const card = document.createElement("article");
  card.className = "game-card";

  const art = document.createElement("div");
  art.className = "game-art";
  art.textContent = game.icon;

  const title = document.createElement("h3");
  title.textContent = game.name;

  const description = document.createElement("p");
  description.textContent = game.description;

  card.append(art, title, description);
  return card;
}

function renderGames() {
  const visibleGames = activeCategory === "Todos"
    ? games
    : games.filter(game => game.category === activeCategory);

  grid.replaceChildren();

  visibleGames.forEach(game => {
    grid.appendChild(createCard(game));
  });

  gameCount.textContent =
    `${visibleGames.length} juegos`;
}

function renderFeatured() {
  featured.replaceChildren();

  games
    .filter(game => game.featured)
    .forEach(game => {
      featured.appendChild(createCard(game));
    });
}

function renderCategories() {
  categoryBar.replaceChildren();

  categories.forEach(category => {
    const button = document.createElement("button");

    button.className = "category";
    button.textContent = category;
    button.setAttribute(
      "aria-pressed",
      String(category === activeCategory)
    );

    if (category === activeCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategories();
      renderGames();
    });

    categoryBar.appendChild(button);
  });
}

function initNoverse() {
  renderCategories();
  renderFeatured();
  renderGames();
}

initNoverse();
