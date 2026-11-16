import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
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
    getWindow().setNavigationBarColor(Color.rgb(11, 11, 20));
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      getWindow().setNavigationBarContrastEnforced(false);
    }
  }
}
`);

const res = "android/app/src/main/res";
const mark = await readFile("icons/noverse-mark.svg");
const densities = [["mdpi",48],["hdpi",72],["xhdpi",96],["xxhdpi",144],["xxxhdpi",192]];
for (const [density,size] of densities) {
  const dir = `${res}/mipmap-${density}`;
  await mkdir(dir,{recursive:true});
  const foreground = await sharp(mark).resize(size,size).png().toBuffer();
  const launcher = await sharp({create:{width:size,height:size,channels:4,background:"#0b0b14"}})
    .composite([{input:foreground}]).png().toBuffer();
  await writeFile(`${dir}/ic_launcher.png`,launcher);
  await writeFile(`${dir}/ic_launcher_round.png`,launcher);
}
const foreground = await sharp(mark).resize(432,432).png().toBuffer();
await mkdir(`${res}/drawable-nodpi`,{recursive:true});
await writeFile(`${res}/drawable-nodpi/ic_launcher_foreground.png`,foreground);
await writeFile(`${res}/drawable-nodpi/ic_launcher_monochrome.png`,foreground);
await mkdir(`${res}/values`,{recursive:true});
await writeFile(`${res}/values/noverse_launcher.xml`,`<resources><color name="noverse_launcher_background">#0b0b14</color></resources>\n`);
const adaptive = `<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/noverse_launcher_background"/>
  <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>\\n`;
const themed = adaptive.replace("</adaptive-icon>",'  <monochrome android:drawable="@drawable/ic_launcher_monochrome"/>\\n</adaptive-icon>');
await mkdir(`${res}/mipmap-anydpi-v26`,{recursive:true});
await writeFile(`${res}/mipmap-anydpi-v26/ic_launcher.xml`,adaptive);
await writeFile(`${res}/mipmap-anydpi-v26/ic_launcher_round.xml`,adaptive);
await mkdir(`${res}/mipmap-anydpi-v33`,{recursive:true});
await writeFile(`${res}/mipmap-anydpi-v33/ic_launcher.xml`,themed);
await writeFile(`${res}/mipmap-anydpi-v33/ic_launcher_round.xml`,themed);

const manifestPath = "android/app/src/main/AndroidManifest.xml";
let androidManifest = await readFile(manifestPath,"utf8");
if (/android:icon="[^"]+"/.test(androidManifest)) {
  androidManifest = androidManifest.replace(/android:icon="[^"]+"/,'android:icon="@mipmap/ic_launcher"');
} else {
  androidManifest = androidManifest.replace("<application",'<application android:icon="@mipmap/ic_launcher"');
}
if (/android:roundIcon="[^"]+"/.test(androidManifest)) {
  androidManifest = androidManifest.replace(/android:roundIcon="[^"]+"/,'android:roundIcon="@mipmap/ic_launcher_round"');
} else {
  androidManifest = androidManifest.replace('android:icon="@mipmap/ic_launcher"','android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round"');
}
await writeFile(manifestPath,androidManifest);
console.log("NOVERSE: shared white mark applied to Android adaptive and legacy launcher icons.");


// Sustituye también los splash genéricos de Capacitor por la marca NOVERSE.
async function findSplashFiles(dir) {
  const found = [];
  if (!existsSync(dir)) return found;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith("drawable")) continue;
    const file = path.join(dir, entry.name, "splash.png");
    if (existsSync(file)) found.push(file);
  }
  return found;
}
let splashCount = 0;
for (const file of await findSplashFiles(res)) {
  const folder = path.basename(path.dirname(file));
  let width = folder.includes("land") ? 800 : 480;
  let height = folder.includes("land") ? 480 : 800;
  try {
    const meta = await sharp(file).metadata();
    if (meta.width && meta.height) { width = meta.width; height = meta.height; }
  } catch (_) {}
  const symbolSize = Math.round(Math.min(width, height) * 0.34);
  const symbol = await sharp(mark).resize(symbolSize, symbolSize).png().toBuffer();
  const splash = await sharp({ create: { width, height, channels: 4, background: "#000000" } })
    .composite([{ input: symbol, gravity: "center" }]).png().toBuffer();
  await writeFile(file, splash);
  splashCount++;
}
console.log(`NOVERSE: ${splashCount} pantalla(s) de inicio con la marca aplicadas.`);
