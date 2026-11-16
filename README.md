# 🪐 NOVERSE

### Explore. Play. Discover.

NOVERSE is a collection of independent casual games.

## Features

- Offline-first experience
- Portrait and landscape support
- Adaptive mobile and tablet interface
- Independent game modules
- Central Game Manager and Game Registry
- Colorful game-universe visual identity
- No advertisements
- No in-app purchases
- Local records for supported games

## Technology

- HTML5
- CSS3
- JavaScript
- Progressive Web App

## Project status

**Version 0.4.0 — First playable game**

### Star Catcher

The first playable NOVERSE game is available:
- 30-second arcade round
- Tap the moving star to earn points
- Live score and countdown
- Personal best saved locally on the device
- Replay after each round
- Responsive touch-friendly play area

### Core architecture

- `core/game-manager.js` — launches and closes games
- `games/registry.js` — catalog, categories, and module registration
- `games/star-catcher.js` — first independent game module
- `js/app.js` — catalog interface
- `css/styles.css` — shared interface and game styles

## Registering a game module

A module can register itself with an existing catalog ID:

```js
window.NOVERSE.Registry.registerModule("game-02", {
  mount(container, tools) {
    // Build the game inside container.
    return {
      unmount() {
        // Release timers, listeners, and resources.
      }
    };
  }
});
```

Every game owns its own logic and cleans up its resources when closed.

## Vision

Every game is a new discovery.
