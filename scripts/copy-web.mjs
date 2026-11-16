import { mkdir, writeFile, copyFile, readFile } from "node:fs/promises";
import sharp from "sharp";

const javaFile = "android/app/src/main/java/com/noverse/gamehub/MainActivity.java";
await mkdir("android/app/src/main/java/com/noverse/gamehub", { recursive: true });
await writeFile(javaFile, `package com.noverse.gamehub;

import android.graphics.Color;
import android.os.Build;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(android.os.Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().setNavigationBarColor(Color.BLACK);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      getWindow().setNavigationBarContrastEnforced(false);
    }
  }
}
`);

const res = "android/app/src/main/res";
const svg = await readFile("icons/noverse-512.svg");
const densities = [["mdpi",48],["hdpi",72],["xhdpi",96],["xxhdpi",144],["xxxhdpi",192]];
for (const [density,size] of densities) {
  const dir = `${res}/mipmap-${density}`;
  await mkdir(dir,{recursive:true});
  await sharp(svg).resize(size,size).png().toFile(`${dir}/ic_launcher.png`);
  await copyFile(`${dir}/ic_launcher.png`,`${dir}/ic_launcher_round.png`);
}
const foregroundSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="432" height="432" viewBox="0 0 432 432">
<circle cx="216" cy="216" r="88" fill="#d5f58a"/>
<ellipse cx="216" cy="216" rx="186" ry="62" fill="none" stroke="#ff9f5a" stroke-width="27" transform="rotate(-24 216 216)"/>
<ellipse cx="216" cy="216" rx="186" ry="62" fill="none" stroke="#ffffff" stroke-width="8" opacity=".9" transform="rotate(-24 216 216)"/>
<circle cx="136" cy="105" r="7" fill="#ffffff"/><path d="m327 91 7 16 16 7-16 7-7 16-7-16-16-7 16-7z" fill="#ffffff"/>
</svg>`);
const monoSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="432" height="432" viewBox="0 0 432 432">
<circle cx="216" cy="216" r="88" fill="#ffffff"/>
<ellipse cx="216" cy="216" rx="186" ry="62" fill="none" stroke="#ffffff" stroke-width="27" transform="rotate(-24 216 216)"/>
</svg>`);
await mkdir(`${res}/drawable-nodpi`,{recursive:true});
await sharp(foregroundSvg).png().toFile(`${res}/drawable-nodpi/ic_launcher_foreground.png`);
await sharp(monoSvg).png().toFile(`${res}/drawable-nodpi/ic_launcher_monochrome.png`);
await mkdir(`${res}/values`,{recursive:true});
await writeFile(`${res}/values/noverse_launcher.xml`,`<resources><color name="noverse_launcher_background">#09252b</color></resources>\n`);
const baseAdaptive = `<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/noverse_launcher_background"/>
  <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>\n`;
const themedAdaptive = `<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/noverse_launcher_background"/>
  <foreground android:drawable="@drawable/ic_launcher_foreground"/>
  <monochrome android:drawable="@drawable/ic_launcher_monochrome"/>
</adaptive-icon>\n`;
await mkdir(`${res}/mipmap-anydpi-v26`,{recursive:true});
await writeFile(`${res}/mipmap-anydpi-v26/ic_launcher.xml`,baseAdaptive);
await writeFile(`${res}/mipmap-anydpi-v26/ic_launcher_round.xml`,baseAdaptive);
await mkdir(`${res}/mipmap-anydpi-v33`,{recursive:true});
await writeFile(`${res}/mipmap-anydpi-v33/ic_launcher.xml`,themedAdaptive);
await writeFile(`${res}/mipmap-anydpi-v33/ic_launcher_round.xml`,themedAdaptive);

const manifestPath = "android/app/src/main/AndroidManifest.xml";
let manifest = await readFile(manifestPath,"utf8");
if (/android:icon="[^"]+"/.test(manifest)) manifest=manifest.replace(/android:icon="[^"]+"/,'android:icon="@mipmap/ic_launcher"');
else manifest=manifest.replace("<application","<application android:icon=\"@mipmap/ic_launcher\"");
if (/android:roundIcon="[^"]+"/.test(manifest)) manifest=manifest.replace(/android:roundIcon="[^"]+"/,'android:roundIcon="@mipmap/ic_launcher_round"');
else manifest=manifest.replace('android:icon="@mipmap/ic_launcher"','android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round"');
await writeFile(manifestPath,manifest);
console.log("NOVERSE: Android system bars and official adaptive launcher icons configured.");
