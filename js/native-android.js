import { App } from "@capacitor/app";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

const native = window.Capacitor?.isNativePlatform?.() === true;
if (native) {
  document.documentElement.classList.add("native-android");
  window.NOVERSE = window.NOVERSE || {};
  window.NOVERSE.Native = Object.freeze({
    isNative: true,
    tap: async () => {
      try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (_) {}
    }
  });

  const configureSystemUI = async () => {
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: "#000000" });
    } catch (error) { console.warn("NOVERSE: status bar", error); }
    try { await SplashScreen.hide(); } catch (_) {}
  };
  configureSystemUI();

  document.addEventListener("click", event => {
    if (event.target.closest(".bottom-nav-item,.game-card,.settings,.detail-play,.nav-back,.game-back,.theme-option")) {
      window.NOVERSE.Native.tap();
    }
  }, { capture: true });

  App.addListener("backButton", async () => {
    let handled = false;
    try { handled = await window.NOVERSE?.App?.handleBack?.(); } catch (_) {}
    if (!handled) {
      try { handled = await window.NOVERSE?.GameManager?.handleBack?.(); } catch (_) {}
    }
    if (!handled) App.exitApp();
  });
} else {
  window.NOVERSE = window.NOVERSE || {};
  window.NOVERSE.Native = Object.freeze({ isNative: false, tap: async () => {} });
}
