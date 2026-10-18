// Fabrique src/lib/content/strokes.ts à partir du dépôt KanjiVG (https://kanjivg.tagaini.net, licence CC BY-SA 3.0).
// À lancer UNIQUEMENT quand on veut régénérer les données :  node scripts/build-strokes.mjs /chemin/vers/kanjivg
// (le fichier produit est déjà dans le projet : tu n'as pas besoin de faire ça).
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2];
if (!root) throw new Error("Usage : node scripts/build-strokes.mjs /chemin/vers/kanjivg");

const HIRA_BASE = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
const HIRA_EXTRA = "がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゃゅょっ";
const KATA_BASE = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const KATA_EXTRA = "ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポャュョッー";
const KANJI_N5 = "日一国人年大十二本中長出三時行見月分後前生五間上東四今金九入学高円子外八六下来気小七山話女北午百書先名川千水半男西電校語土木聞食車何南万毎白天母火右読友左休父雨";

const out = {};
const missing = [];
const problems = [];
for (const ch of new Set([...HIRA_BASE, ...HIRA_EXTRA, ...KATA_BASE, ...KATA_EXTRA, ...KANJI_N5])) {
  const hex = ch.codePointAt(0).toString(16).padStart(5, "0");
  const file = path.join(root, "kanji", `${hex}.svg`);
  if (!fs.existsSync(file)) { missing.push(ch); continue; }
  const svg = fs.readFileSync(file, "utf8");
  const paths = [...svg.matchAll(/<path\s+id="kvg:[0-9a-f]+-s(\d+)"[^>]*\sd="([^"]+)"/g)].map((m) => ({ n: Number(m[1]), d: m[2] }));
  const texts = [...svg.matchAll(/<text\s+transform="matrix\(1 0 0 1 ([\d.]+) ([\d.]+)\)">(\d+)<\/text>/g)].map((m) => ({ n: Number(m[3]), x: Number(m[1]), y: Number(m[2]) }));
  paths.sort((a, b) => a.n - b.n);
  texts.sort((a, b) => a.n - b.n);
  if (paths.length === 0) { problems.push(`${ch} : aucun trait`); continue; }
  if (paths.some((p, i) => p.n !== i + 1)) problems.push(`${ch} : numérotation des traits non continue`);
  if (texts.length !== paths.length) problems.push(`${ch} : ${texts.length} numéros pour ${paths.length} traits`);
  out[ch] = { s: paths.map((p) => p.d), n: texts.map((t) => [t.x, t.y]) };
}
if (missing.length || problems.length) {
  console.error("MANQUANTS :", missing.join(" "));
  console.error(problems.join("\n"));
  if (missing.length) process.exit(1);
}

const header = `// Données d'ordre et de forme des traits : KanjiVG (https://kanjivg.tagaini.net),
// © 2009–2011 Ulrich Apel et contributeurs, licence Creative Commons Attribution-ShareAlike 3.0
// (https://creativecommons.org/licenses/by-sa/3.0/). Ce fichier est une adaptation (extrait simplifié) :
// il reste donc sous la MÊME licence (CC BY-SA 3.0). Généré par scripts/build-strokes.mjs — ne pas modifier à la main.
//
// s = les traits dans l'ordre d'écriture (chemins SVG sur une grille de 109 × 109) ; n = position du numéro de chaque trait.
`;
const body = `export interface GlyphData {
  s: string[];
  n: [number, number][];
}

export const KANA_HIRAGANA_BASE = ${JSON.stringify(HIRA_BASE)};
export const KANA_HIRAGANA_EXTRA = ${JSON.stringify(HIRA_EXTRA)};
export const KANA_KATAKANA_BASE = ${JSON.stringify(KATA_BASE)};
export const KANA_KATAKANA_EXTRA = ${JSON.stringify(KATA_EXTRA)};
export const KANJI_N5_LIST = ${JSON.stringify(KANJI_N5)};

export const GLYPHS: Record<string, GlyphData> = ${JSON.stringify(out)};
`;
fs.writeFileSync(path.resolve(import.meta.dirname, "../src/lib/content/strokes.ts"), header + body);
console.log(`${Object.keys(out).length} caractères écrits.`);
