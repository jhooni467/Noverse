/* NOVERSE — GAME REGISTRY · v0.5.0 */
(() => {
  "use strict";
  const catalog = [
    {
      id: "game-01", name: "Star Catcher",
      description: "Atrapa estrellas antes de que termine el tiempo.",
      shortInfo: "Pon a prueba tus reflejos atrapando estrellas que aparecen en distintos puntos. ¡Consigue la mayor puntuación posible!",
      category: "Arcade", icon: "⭐", featured: true,
      duration: "30 segundos", difficulty: "Fácil",
      palette: { primary: "#f6d66b", secondary: "#ff9d72", background: "#251d45", surface: "#38295f", glow: "#a58bff" },
      previews: ["Caza estrellas", "Supera tu récord"]
    },
    {
      id: "game-02", name: "Próximo puzzle",
      description: "Pon a prueba tu lógica.", shortInfo: "Un nuevo reto de ingenio llegará pronto.",
      category: "Puzzle", icon: "🧩", featured: true, duration: "Por definir", difficulty: "Por definir",
      palette: { primary: "#7de4d0", secondary: "#8bbcff", background: "#102d42", surface: "#1c4960", glow: "#55d6c2" },
      previews: ["Un mundo de piezas", "Próximamente"]
    },
    {
      id: "game-03", name: "Próximo desafío", description: "Demuestra tu habilidad.",
      shortInfo: "Un desafío de precisión y reflejos llegará pronto.",
      category: "Habilidad", icon: "⚡", featured: false, duration: "Por definir", difficulty: "Por definir",
      palette: { primary: "#ffd36a", secondary: "#ff8b67", background: "#43232a", surface: "#633642", glow: "#ff9b5c" },
      previews: ["Pon a prueba tu habilidad", "Próximamente"]
    },
    {
      id: "game-04", name: "Próxima aventura", description: "Explora algo diferente.",
      shortInfo: "Un espacio para crear, experimentar y descubrir.",
      category: "Creatividad", icon: "🎨", featured: false, duration: "Libre", difficulty: "Relajado",
      palette: { primary: "#ffb1cf", secondary: "#c3a5ff", background: "#39233e", surface: "#593653", glow: "#e99bce" },
      previews: ["Deja volar tu imaginación", "Próximamente"]
    },
    {
      id: "game-05", name: "Próximo universo", description: "Descubre una experiencia relajante.",
      shortInfo: "Una experiencia tranquila para explorar a tu ritmo.",
      category: "Relajación", icon: "🌙", featured: false, duration: "Libre", difficulty: "Relajado",
      palette: { primary: "#a9c9ff", secondary: "#9be5df", background: "#172b4b", surface: "#263f65", glow: "#7ba8ff" },
      previews: ["Un momento de calma", "Próximamente"]
    }
  ];
  const byId = new Map(catalog.map(game => [game.id, game]));
  function getAll() {
    return catalog.map(game => ({ ...game, available: window.NOVERSE.GameManager.isRegistered(game.id) }));
  }
  function get(id) {
    const game = byId.get(id);
    return game ? { ...game, available: window.NOVERSE.GameManager.isRegistered(id) } : null;
  }
  function getCategories() {
    return ["Todos", "Puzzle", "Arcade", "Lógica", "Creatividad", "Habilidad", "Relajación"];
  }
  function registerModule(id, moduleDefinition) {
    const game = byId.get(id);
    if (!game) { console.error(`NOVERSE Registry: ID desconocido "${id}".`); return false; }
    const registered = window.NOVERSE.GameManager.register(id, { ...moduleDefinition, name: game.name });
    if (registered) document.dispatchEvent(new CustomEvent("noverse:catalog-updated"));
    return registered;
  }
  window.NOVERSE = window.NOVERSE || {};
  window.NOVERSE.Registry = Object.freeze({ getAll, get, getCategories, registerModule });
})();