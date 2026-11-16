/* NOVERSE GAME 04 — ECHO SIX · Xilófono de memoria */
(() => {
  "use strict";
  const ID = "game-04";
  const NOTES = [261.63, 293.66, 329.63, 392, 440, 523.25];
  const NAMES = ["DO", "RE", "MI", "SOL", "LA", "DO"];
  const COLORS = ["#ff7890", "#ffb66d", "#e4df79", "#70d9b9", "#75baff", "#b99cff"];

  function mount(container) {
    let sequence = [], input = 0, round = 1, best = 0;
    let playing = false, locked = true, alive = true, audio = null, timers = [];
    try { best = Number(localStorage.getItem("noverse-echo-six-best")) || 0; } catch (_) {}

    const keys = NOTES.map((note, i) =>
      '<button class="echo-key echo-key-' + (i + 1) + '" type="button" data-key="' + i +
      '" aria-label="Tocar nota ' + NAMES[i] + '" style="--key-color:' + COLORS[i] +
      '"><span class="echo-key-note">' + NAMES[i] + '</span><span class="echo-key-mark"></span></button>'
    ).join("");

    container.innerHTML =
      '<section class="echo-xylophone" aria-label="Echo Six, juego de memoria musical">' +
        '<header class="echo-x-head"><div><span class="echo-kicker">¡JUEGA CON TUS OÍDOS!</span><h2>Echo Six</h2></div><div class="echo-round"><small>RONDA</small><strong data-round>01</strong></div></header>' +
        '<div class="echo-record"><span>RÉCORD</span><strong data-best>00</strong></div>' +
        '<div class="echo-keys" aria-label="Xilófono de seis notas">' + keys + '</div>' +
        '<p class="echo-message" data-message>¡Presta atención, jijiji!</p>' +
        '<button class="echo-play" type="button" data-start>¡A JUGAR!</button>' +
        '<p class="echo-hint">TAP TAP · ¡A REPETIR!</p>' +
      '</section>' +
      '<div class="echo-finish" data-end hidden><div class="echo-finish-card">' +
        '<span class="echo-kicker">¡UPS, SE NOS FUE!</span><h3>¡OTRA VEZ! 🖍️</h3><p data-result></p>' +
        '<div class="echo-finish-record"><small>RÉCORD</small><strong data-end-best>00</strong></div>' +
        '<button type="button" data-retry>¡OTRA RONDA!</button>' +
      '</div></div>';

    const $ = selector => container.querySelector(selector);
    const keyButtons = [...container.querySelectorAll("[data-key]")];
    const message = $("[data-message]");
    const roundNode = $("[data-round]");
    const bestNode = $("[data-best]");
    const end = $("[data-end]");

    bestNode.textContent = String(best).padStart(2, "0");

    function clearTimers() {
      timers.forEach(clearTimeout);
      timers = [];
      keyButtons.forEach(key => key.classList.remove("is-lit"));
    }
    function later(fn, ms) {
      const id = setTimeout(() => {
        timers = timers.filter(timer => timer !== id);
        if (alive) fn();
      }, ms);
      timers.push(id);
    }
    function getAudio() {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return null;
      if (!audio) audio = new Audio();
      if (audio.state === "suspended") audio.resume();
      return audio;
    }
    function playNote(index) {
      const ctx = getAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      const fundamental = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const body = ctx.createGain();
      const shine = ctx.createGain();
      fundamental.type = "sine";
      overtone.type = "sine";
      fundamental.frequency.setValueAtTime(NOTES[index], now);
      overtone.frequency.setValueAtTime(NOTES[index] * 3.92, now);
      body.gain.setValueAtTime(0.0001, now);
      body.gain.exponentialRampToValueAtTime(0.24, now + 0.004);
      body.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
      shine.gain.setValueAtTime(0.0001, now);
      shine.gain.exponentialRampToValueAtTime(0.055, now + 0.003);
      shine.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      fundamental.connect(body);
      overtone.connect(shine);
      body.connect(ctx.destination);
      shine.connect(ctx.destination);
      fundamental.start(now);
      overtone.start(now);
      fundamental.stop(now + 0.5);
      overtone.stop(now + 0.14);
    }
    function hit(index) {
      const key = keyButtons[index];
      key.classList.add("is-lit");
      playNote(index);
      later(() => key.classList.remove("is-lit"), 620);
    }
    function updateHud() {
      roundNode.textContent = String(round).padStart(2, "0");
    }
    function preview() {
      locked = true;
      clearTimers();
      message.textContent = "¡Ojos y orejas atentos!";
      let time = 500;
      sequence.forEach(note => {
        later(() => hit(note), time);
        time += 850;
      });
      later(() => {
        locked = false;
        input = 0;
        message.textContent = "¡Ahora tú!";
      }, time + 80);
    }
    function start() {
      getAudio();
      clearTimers();
      end.hidden = true;
      sequence = [Math.floor(Math.random() * 6)];
      input = 0;
      round = 1;
      playing = true;
      locked = true;
      updateHud();
      preview();
    }
    function advance() {
      round++;
      sequence.push(Math.floor(Math.random() * 6));
      updateHud();
      message.textContent = "¡YUJUUU! ⭐";
      later(preview, 560);
    }
    function finish() {
      playing = false;
      locked = true;
      clearTimers();
      const completed = round - 1;
      if (completed > best) {
        best = completed;
        bestNode.textContent = String(best).padStart(2, "0");
        try { localStorage.setItem("noverse-echo-six-best", String(best)); } catch (_) {}
      }
      $("[data-result]").textContent = "Llegaste a la ronda " + round + ".";
      $("[data-end-best]").textContent = String(best).padStart(2, "0");
      end.hidden = false;
    }
    function choose(index) {
      if (!playing || locked) return;
      hit(index);
      if (sequence[input] !== index) {
        keyButtons[index].classList.add("is-wrong");
        later(() => keyButtons[index].classList.remove("is-wrong"), 320);
        finish();
        return;
      }
      input++;
      if (input === sequence.length) advance();
      else message.textContent = "Sigue…";
    }

    keyButtons.forEach((key, index) => key.addEventListener("click", () => choose(index)));
    $("[data-start]").addEventListener("click", start);
    $("[data-retry]").addEventListener("click", start);
    updateHud();

    return {
      unmount() {
        alive = false;
        clearTimers();
        if (audio) { audio.close().catch(() => {}); audio = null; }
      }
    };
  }
  window.NOVERSE.Registry.registerModule(ID, { mount });
})();