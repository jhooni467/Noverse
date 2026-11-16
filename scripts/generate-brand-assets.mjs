import { mkdir, readFile } from "node:fs/promises";
import sharp from "sharp";

await mkdir("www/icons",{recursive:true});
await mkdir("www/images",{recursive:true});
const mark=await readFile("icons/noverse-mark.svg");
const background=await readFile("images/noverse-app-background.svg");
await sharp(mark).resize(512,512).png().toFile("www/icons/noverse-icon.png");
await sharp(background).png().toFile("www/images/noverse-app-background.png");
console.log("NOVERSE: transparent PNG app icon and atmospheric background generated.");
