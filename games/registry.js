/* NOVERSE — GAME REGISTRY · v0.6.0 */
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
      id: "game-02", name: "Color Cascade",
      description: "Ordena colores y crea degradados perfectos.",
      shortInfo: "Pon a prueba tu percepción visual. Arrastra las fichas y acomoda los tonos del más claro al más oscuro para completar cada paleta.",
      category: "Puzzle", icon: "◈", featured: true, duration: "Libre", difficulty: "Progresiva",
      palette: { primary: "#65dfc5", secondary: "#ff986e", background: "#102f36", surface: "#1b4a50", glow: "#52d8c4" },
      previews: ["Ordena los degradados", "Completa cada paleta"]
    },
    {
      id: "game-03", name: "Cloud Hopper",
      description: "Guía a Nubi entre arcos de cristal.",
      shortInfo: "Un arcade de vuelo y reflejos. Impúlsate con cada toque, esquiva los arcos luminosos y supera tu propio récord.",
      category: "Arcade", icon: "☁", featured: true, duration: "Libre", difficulty: "Progresiva",
      palette: { primary: "#8debe0", secondary: "#ffb887", background: "#172b55", surface: "#293b69", glow: "#9c9aff" },
      previews: ["Acompaña a Nubi", "Cruza los arcos de cristal"]
    },
    {
      id: "game-04", name: "Echo Six",
      description: "Memoriza secuencias de seis sonidos.",
      shortInfo: "Un reto de memoria musical. Escucha y observa una secuencia, repítela en el orden correcto y cada ronda añadirá un nuevo sonido. El desafío no tiene fin.",
      category: "Habilidad", icon: "♫", featured: true, duration: "Infinita", difficulty: "Progresiva",
      palette: { primary: "#b69aff", secondary: "#59dfc5", background: "#171329", surface: "#282044", glow: "#9d82ff" },
      previews: ["Recuerda seis sonidos", "Supera tu récord"],
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