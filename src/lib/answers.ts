// Vérification des réponses écrites.
// - anglais / français : insensible à la casse, aux accents et à la ponctuation ;
//   « to », « a », « an », « the » en début de réponse sont facultatifs.
// - japonais : hiragana = katakana, largeurs normalisées, romaji accepté (taberu → たべる).

import { Lang } from "./types";
import { hasJapanese, looksLikeRomaji, romajiToHiragana, toHiragana } from "./japanese";

export type CheckKind = "correct" | "almost" | "wrong";

export interface CheckResult {
  result: CheckKind;
  matched?: string;
}

const LEADING_WORDS = /^(to|a|an|the)\s+/;

function stripLatinMarks(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");
}

/** Forme de comparaison pour l'anglais / le français / les cartes libres. */
export function normalizeLatin(s: string): string {
  let t = stripLatinMarks(s.normalize("NFKC").toLowerCase());
  t = t.replace(/[’‘`´]/g, "'");
  t = t.replace(/[.,!?;:"“”()\[\]…·]/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t.replace(LEADING_WORDS, "");
}

/** Forme de comparaison pour le japonais. */
export function normalizeJapanese(s: string): string {
  const t = s.normalize("NFKC").toLowerCase().replace(/[\s。、．，.,!?！？・「」『』（）()]/g, "");
  return toHiragana(t);
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[b.length];
}

export function checkAnswer(input: string, accepted: string[], lang: Lang): CheckResult {
  const cleaned = accepted.map((a) => a.trim()).filter(Boolean);
  if (!input.trim() || cleaned.length === 0) return { result: "wrong" };

  // Mode japonais seulement si une réponse acceptée contient du japonais (une carte libre peut avoir une réponse en français).
  if (lang === "ja" && cleaned.some(hasJapanese)) {
    const candidates = new Set<string>([normalizeJapanese(input)]);
    if (looksLikeRomaji(input)) candidates.add(normalizeJapanese(romajiToHiragana(input)));
    for (const a of cleaned) {
      if (candidates.has(normalizeJapanese(a))) return { result: "correct", matched: a };
    }
    return { result: "wrong" };
  }

  const n = normalizeLatin(input);
  for (const a of cleaned) {
    if (normalizeLatin(a) === n) return { result: "correct", matched: a };
  }
  // faute de frappe d'une lettre sur un mot assez long : « presque »
  if (n.length >= 5) {
    for (const a of cleaned) {
      const na = normalizeLatin(a);
      if (na.length >= 5 && levenshtein(n, na) === 1) return { result: "almost", matched: a };
    }
  }
  return { result: "wrong" };
}

/** Indice : première lettre + nombre de lettres. Ne contient jamais la réponse entière. */
export function makeHint(answer: string, lang: Lang): string {
  const chars = Array.from(answer.trim());
  if (chars.length === 0) return "";
  if (chars.length === 1) return lang === "ja" ? "1 caractère" : "1 lettre";
  const first = chars[0];
  if (lang === "ja") return `${first}… (${chars.length} caractères)`;
  const rest = chars.slice(1).map((c) => (c === " " ? " " : "_")).join("");
  const letters = chars.filter((c) => c !== " ").length;
  return `${first}${rest} (${letters} lettres)`;
}
