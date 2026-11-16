# 🪐 NOVERSE

### Explore. Play. Discover.

NOVERSE is a collection of independent casual games.

## Features

- Offline-first experience
- Portrait and landscape support
- Adaptive mobile and tablet interface
- Independent game modules
- Central Game Manager
- Central Game Registry
- Colorful game-universe visual identity
- No advertisements
- No in-app purchases
- Local progress and records (planned)

## Technology

- HTML5
- CSS3
- JavaScript
- Progressive Web App

## Project status

**Version 0.3.0 — Game Registry**

The catalog is now managed by a dedicated registry:
- One central catalog for game metadata
- Unique ID for every game
- Categories and featured-game information
- Availability status linked to Game Manager
- Independent modules can register themselves
- Catalog refreshes when a module becomes available

## Registering a game module

A future game module can register itself with its catalog ID:

```js
window.NOVERSE.Registry.registerModule("game-01", {
  mount(container, tools) {
    const heading = document.createElement("h2");
    heading.textContent = "My first NOVERSE game";
    container.appendChild(heading);

    return {
      unmount() {
        // Release timers, listeners, and resources here.
      }
    };
  }
});
```

The ID must already exist in `games/registry.js`. The module's name is taken from the central catalog.

## Project structure

- `core/game-manager.js` — launches and closes games
- `games/registry.js` — catalog, categories, and module registration
- `js/app.js` — catalog interface
- `games/` — independent game modules (being built)

## Vision

Every game is a new discovery.
