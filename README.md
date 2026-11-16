# 🪐 NOVERSE

### Explore. Play. Discover.

NOVERSE is a collection of independent casual games.

## Features

- Offline-first experience
- Portrait and landscape support
- Adaptive mobile and tablet interface
- Independent game modules
- Central Game Manager
- Colorful cartoon-inspired design
- No advertisements
- No in-app purchases
- Local progress and records (planned)

## Technology

- HTML5
- CSS3
- JavaScript
- Progressive Web App

## Project status

**Version 0.2.0 — Core foundation**

The first core module is in place:
- Game registration
- Game launch and close lifecycle
- Dedicated game screen
- Return-to-catalog navigation
- Basic error handling for game startup
- Offline cache for core files

## Registering a game

Each minigame can register itself through the global manager:

```js
window.NOVERSE.GameManager.register("my-game", {
  name: "My Game",
  mount(container, tools) {
    const heading = document.createElement("h2");
    heading.textContent = "Hello, NOVERSE!";
    container.appendChild(heading);

    return {
      unmount() {
        // Release timers, listeners, or other resources here.
      }
    };
  }
});
```

A catalog entry becomes playable when its ID matches a registered game ID.

## Vision

Every game is a new discovery.
