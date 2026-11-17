/* Verificación estática de NOVERSE: sintaxis, versiones, precaché, manifest y Android. */
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const problems = [];
const fail = message => problems.push(message);
const read = file => readFile(file, "utf8");

async function listJs(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (["node_modules", "android", "www", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listJs(full));
    else if (/\.(m?js)$/.test(entry.name)) out.push(full);
  }
  return out;
}
for (const file of await listJs(".")) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) fail(`Sintaxis JS: ${file}\n${result.stderr.trim()}`);
}

const sw = await read("sw.js");
const html = await read("index.html");
const pkg = JSON.parse(await read("package.json"));
const workflow = await read(".github/workflows/android-apk.yml");
const version = (sw.match(/const VERSION = "([\d.]+)"/) || [])[1];
if (!version) fail("sw.js: no se encontró VERSION.");
else {
  const [major, minor] = version.split(".");
  const semver = `${major}.${Number(minor[0])}.${Number(minor[1])}`;
  for (const v of new Set([...html.matchAll(/\?v=([\d.]+)/g)].map(m => m[1]))) {
    if (v !== version) fail(`index.html usa ?v=${v} pero sw.js tiene ${version}.`);
  }
  if (!html.includes(`Versión ${version}`)) fail(`index.html: Ajustes no muestra Versión ${version}.`);
  if (pkg.version !== semver) fail(`package.json: version ${pkg.version}, se esperaba ${semver}.`);
  if (!workflow.includes(`versionName "${version}"`)) fail(`android-apk.yml: versionName distinto de ${version}.`);
  if (!workflow.includes(`tag_name: v${version}`)) fail(`android-apk.yml: tag_name distinto de ${version}.`);
  if (!workflow.includes(`versionCode ${Number(major) * 100 + Number(minor)}`)) fail("android-apk.yml: versionCode no coincide con la versión.");
}

const precache = new Set([...sw.matchAll(/"\.\/([^"?]+)(?:\?v=")?/g)].map(m => m[1]));
for (const [, ref] of html.matchAll(/(?:src|href)="((?:core|games|js|css|icons|images)\/[^"?]+)/g)) {
  if (ref === "js/native-android.bundle.js") continue;
  if (!existsSync(ref)) fail(`index.html referencia ${ref}, que no existe.`);
  else if (!precache.has(ref)) fail(`sw.js no precachea ${ref}.`);
}
for (const file of precache) if (!existsSync(file)) fail(`sw.js precachea ${file}, que no existe.`);

const manifest = JSON.parse(await read("manifest.json"));
if (!(manifest.icons || []).length) fail("manifest.json: falta al menos un icono.");
if (!(manifest.icons || []).some(icon => icon.sizes === "192x192")) fail("manifest.json: falta el icono 192x192.");
if (!(manifest.icons || []).some(icon => icon.sizes === "512x512")) fail("manifest.json: falta el icono 512x512.");
if (!existsSync("games/pasteluna.js")) fail("Falta el juego Pasteluna.");
for (const icon of manifest.icons || []) if (!existsSync(icon.src)) fail(`manifest.json: falta ${icon.src}.`);

const cap = JSON.parse(await read("capacitor.config.json"));
if (cap.plugins?.StatusBar?.style !== "DARK") fail('capacitor.config.json: StatusBar.style debe ser "DARK".');
if (/\bStyle\.Light/.test(await read("js/native-android.js"))) fail("native-android.js: Style.Light no corresponde a la barra oscura.");
if (!html.includes('id="store-screen"') || !html.includes('id="store-detail"')) fail("index.html: falta la Store integrada.");
if (!existsSync("js/store.js") || !existsSync("css/store.css")) fail("Faltan los archivos de NOVERSE Store.");
if (!precache.has("js/store.js") || !precache.has("css/store.css")) fail("La Store no está completamente precargada para uso offline.");

if (problems.length) {
  console.error("NOVERSE verify: " + problems.length + " problema(s)\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log(`NOVERSE verify: todo correcto (versión ${version}; Store y módulos offline incluidos).`);
