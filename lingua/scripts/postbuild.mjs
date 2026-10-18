// Après « next build » : prépare le service worker (liste des fichiers à garder hors ligne + numéro de version).
// Usage : node scripts/postbuild.mjs [dossier]   (par défaut : out)
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const outDir = process.argv[2] || "out";
if (!existsSync(outDir)) {
  console.error(`Dossier « ${outDir} » introuvable : lance d'abord « next build ».`);
  process.exit(1);
}

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else files.push(full);
  }
})(outDir);

const SKIP = (rel) => rel === "sw.js" || rel.endsWith(".map") || rel.split("/").some((p) => p.startsWith(".")) || rel === "404.html";

const hash = createHash("sha1");
const precache = ["./"];
for (const file of files.sort()) {
  const rel = relative(outDir, file).split(sep).join("/");
  if (SKIP(rel)) continue;
  precache.push(rel);
  hash.update(rel);
  hash.update(readFileSync(file));
}
const buildId = hash.digest("hex").slice(0, 10);

const swPath = join(outDir, "sw.js");
if (!existsSync(swPath)) {
  console.error("sw.js introuvable dans le dossier de sortie.");
  process.exit(1);
}
let sw = readFileSync(swPath, "utf8");
const BUILD_LINE = 'const BUILD_ID = "__BUILD_ID__";';
const PRECACHE_LINE = "const PRECACHE = __PRECACHE__;";
if (!sw.includes(BUILD_LINE) || !sw.includes(PRECACHE_LINE)) {
  console.error("sw.js a déjà été traité (ou ne contient pas les lignes attendues).");
  process.exit(1);
}
sw = sw.replace(BUILD_LINE, `const BUILD_ID = ${JSON.stringify(buildId)};`).replace(PRECACHE_LINE, `const PRECACHE = ${JSON.stringify(precache, null, 2)};`);
writeFileSync(swPath, sw);
console.log(`Service worker prêt : version ${buildId}, ${precache.length} fichiers disponibles hors ligne.`);
