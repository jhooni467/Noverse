/* Sincroniza la versión web, Android, Service Worker y referencias HTML.
   Uso: node scripts/set-version.mjs 1.08 */
import { readFile, writeFile } from "node:fs/promises";

const version = process.argv[2];
if (!/^\d+\.\d{2}$/.test(version || "")) {
  console.error("Uso: node scripts/set-version.mjs 1.08");
  process.exit(1);
}
const [major, minor] = version.split(".");
const semver = `${major}.${Number(minor[0])}.${Number(minor[1])}`;
const code = String(Number(major) * 100 + Number(minor));

async function patch(file, steps) {
  let content = await readFile(file, "utf8");
  for (const [pattern, replacement] of steps) {
    if (!pattern.test(content)) throw new Error(`${file}: no se encontró ${pattern}`);
    content = content.replace(pattern, replacement);
  }
  await writeFile(file, content);
}
await patch("sw.js", [[/const VERSION = "[\d.]+";/, `const VERSION = "${version}";`]]);
await patch("index.html", [[/\?v=\d+\.\d+/g, `?v=${version}`], [/Versión \d+\.\d+/, `Versión ${version}`]]);
await patch("package.json", [[/"version": "[\d.]+"/, `"version": "${semver}"`]]);
await patch(".github/workflows/android-apk.yml", [
  [/versionCode \d+/, `versionCode ${code}`],
  [/versionName "[\d.]+"/, `versionName "${version}"`],
  [/NOVERSE-v[\d.]+\.apk/g, `NOVERSE-v${version}.apk`],
  [/NOVERSE-v[\d.]+-APK/g, `NOVERSE-v${version}-APK`],
  [/tag_name: v[\d.]+/, `tag_name: v${version}`],
  [/name: NOVERSE v[\d.]+/, `name: NOVERSE v${version}`],
  [/NOVERSE v[\d.]+ — Android release/, `NOVERSE v${version} — Android release`]
]);
console.log(`Versión ${version} (semver ${semver}, versionCode ${code}) aplicada.`);
