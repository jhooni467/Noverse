/* NOVERSE EXPERIENCE — QUASAR · local in-app build */
(() => {
  "use strict";
  window.NOVERSE.Registry.registerModule("experience-quasar", {
    name: "QUASAR",
    mount(root) {
      const frame = document.createElement("iframe");
      frame.className = "quasar-embed";
      frame.title = "QUASAR · Runner 2.5D";
      frame.src = new URL("games/quasar/index.html", document.baseURI).href;
      frame.allow = "autoplay; fullscreen; gamepad";
      frame.allowFullscreen = true;
      frame.loading = "eager";
      frame.referrerPolicy = "same-origin";
      root.replaceChildren(frame);
      return {
        unmount() {
          frame.src = "about:blank";
          frame.remove();
        }
      };
    }
  });
})();
