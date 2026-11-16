/* =========================================================
   NOVERSE — GAME REGISTRY
   Catálogo central y conexión con los módulos independientes.
   ========================================================= */

(() => {
  "use strict";

  const catalog = [
    {
      id: "game-01",
      name: "Star Catcher",
      description: "Atrapa estrellas antes de que termine el tiempo.",
      category: "Arcade",
      icon: "⭐",
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

  const byId = new Map(catalog.map(game => [game.id, game]));

  function getAll() {
    return catalog.map(game => ({
      ...game,
      available: window.NOVERSE.GameManager.isRegistered(game.id)
    }));
  }

  function get(id) {
    const game = byId.get(id);
    if (!game) return null;

    return {
      ...game,
      available: window.NOVERSE.GameManager.isRegistered(id)
    };
  }

  function getCategories() {
    return [
      "Todos",
      "Puzzle",
      "Arcade",
      "Lógica",
      "Creatividad",
      "Habilidad",
      "Relajación"
    ];
  }

  function registerModule(id, moduleDefinition) {
    const game = byId.get(id);

    if (!game) {
      console.error(`NOVERSE Registry: ID desconocido "${id}".`);
      return false;
    }

    const registered = window.NOVERSE.GameManager.register(id, {
      ...moduleDefinition,
      name: game.name
    });

    if (registered) {
      document.dispatchEvent(new CustomEvent("noverse:catalog-updated"));
    }

    return registered;
  }

  window.NOVERSE = window.NOVERSE || {};
  window.NOVERSE.Registry = Object.freeze({
    getAll,
    get,
    getCategories,
    registerModule
  });
})();
