// Import de listes de vocabulaire (CSV ou JSON) → entrées Lingua.
//
// Colonnes CSV reconnues (noms français ou anglais, dans n'importe quel ordre) :
//   mot (word, headword) · lecture (reading, kana) · traduction (sens, translation, meaning) ·
//   categorie (pos, type) · exemple (example) · traduction_exemple (example_translation) · notes · ipa
// Plusieurs traductions peuvent être séparées par « ; » ou « | ».

import { Entry, Lang, Pos, POS_LABELS, POS_LIST } from "./types";
import { uid } from "./ids";

/** Analyse un CSV (guillemets, séparateur , ; ou tabulation détecté automatiquement). */
export function parseCSV(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const counts = { ",": 0, ";": 0, "\t": 0 };
  let q = false;
  for (const ch of firstLine) {
    if (ch === '"') q = !q;
    else if (!q && (ch === "," || ch === ";" || ch === "\t")) counts[ch]++;
  }
  const delim = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] || ",") as string;

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

const COLUMN_ALIASES: Record<string, string> = {
  mot: "headword", word: "headword", headword: "headword", front: "headword", terme: "headword",
  lecture: "reading", reading: "reading", kana: "reading",
  traduction: "translation", sens: "translation", translation: "translation", meaning: "translation", back: "translation", definition: "translation",
  categorie: "pos", "catégorie": "pos", pos: "pos", type: "pos", nature: "pos",
  exemple: "example", example: "example", phrase: "example",
  traduction_exemple: "exampleTranslation", example_translation: "exampleTranslation", exampletranslation: "exampleTranslation",
  notes: "notes", note: "notes",
  ipa: "ipa",
};

const POS_ALIASES: Record<string, Pos> = {
  nom: "noun", noun: "noun", n: "noun", substantif: "noun",
  verbe: "verb", verb: "verb", v: "verb",
  adjectif: "adjective", adjective: "adjective", adj: "adjective",
  adverbe: "adverb", adverb: "adverb", adv: "adverb",
  pronom: "pronoun", pronoun: "pronoun",
  "déterminant": "determiner", determinant: "determiner", determiner: "determiner",
  "préposition": "preposition", preposition: "preposition", prep: "preposition",
  conjonction: "conjunction", conjunction: "conjunction",
  interjection: "interjection",
  expression: "expression", "locution": "expression", phrase: "expression",
  particule: "particle", particle: "particle",
};

export function parsePos(raw: string | undefined): Pos {
  if (!raw) return "other";
  const k = raw.trim().toLowerCase();
  if ((POS_LIST as string[]).includes(k)) return k as Pos;
  if (POS_ALIASES[k]) return POS_ALIASES[k];
  for (const p of POS_LIST) if (POS_LABELS[p].toLowerCase().startsWith(k) && k.length >= 3) return p;
  return "other";
}

export interface RawWord {
  headword: string;
  reading?: string;
  translations: string[];
  pos?: string;
  example?: string;
  exampleTranslation?: string;
  notes?: string;
  ipa?: string;
}

function splitTranslations(s: string): string[] {
  return s.split(/\s*[;|]\s*/).map((x) => x.trim()).filter(Boolean);
}

export function csvToWords(text: string): { words: RawWord[]; error?: string } {
  const rows = parseCSV(text);
  if (rows.length < 2) return { words: [], error: "Le fichier doit contenir une ligne d'en-têtes puis au moins une ligne de données." };
  const header = rows[0].map((h) => COLUMN_ALIASES[h.trim().toLowerCase().replace(/\s+/g, "_")] ?? "");
  if (!header.includes("headword")) {
    return { words: [], error: "Colonne « mot » introuvable. La première ligne doit contenir des en-têtes (mot, lecture, traduction, categorie, exemple…)." };
  }
  const words: RawWord[] = [];
  for (const r of rows.slice(1)) {
    const rec: Record<string, string> = {};
    header.forEach((h, i) => {
      if (h && r[i] !== undefined) rec[h] = r[i].trim();
    });
    if (!rec.headword) continue;
    words.push({
      headword: rec.headword,
      reading: rec.reading || undefined,
      translations: splitTranslations(rec.translation ?? ""),
      pos: rec.pos,
      example: rec.example || undefined,
      exampleTranslation: rec.exampleTranslation || undefined,
      notes: rec.notes || undefined,
      ipa: rec.ipa || undefined,
    });
  }
  return { words };
}

/** JSON simple : un tableau d'objets, ou { "words": [...] }. Champs : word/mot, reading, translation(s), pos, example, exampleTranslation, notes, ipa. */
export function jsonToWords(value: unknown): { words: RawWord[]; error?: string } {
  const list = Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as { words?: unknown }).words) ? (value as { words: unknown[] }).words : null;
  if (!list) return { words: [], error: "Le JSON doit être un tableau de mots, ou un objet { \"words\": [...] }." };
  const words: RawWord[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const str = (k: string): string | undefined => (typeof o[k] === "string" && (o[k] as string).trim() ? (o[k] as string).trim() : undefined);
    const headword = str("word") ?? str("mot") ?? str("headword");
    if (!headword) continue;
    let translations: string[] = [];
    const t = o.translations ?? o.translation ?? o.traduction ?? o.sens;
    if (Array.isArray(t)) translations = t.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean);
    else if (typeof t === "string") translations = splitTranslations(t);
    words.push({
      headword,
      reading: str("reading") ?? str("lecture"),
      translations,
      pos: str("pos") ?? str("categorie"),
      example: str("example") ?? str("exemple"),
      exampleTranslation: str("exampleTranslation") ?? str("traduction_exemple"),
      notes: str("notes"),
      ipa: str("ipa"),
    });
  }
  return { words };
}

export function wordsToEntries(words: RawWord[], lang: Lang, now: number): Entry[] {
  return words.map((w) => ({
    id: uid("entry"),
    lang,
    headword: w.headword,
    variants: [],
    inflections: [],
    reading: w.reading,
    ipa: w.ipa,
    senses: [
      {
        id: uid("sense"),
        pos: parsePos(w.pos),
        translations: w.translations,
        examples: w.example ? [{ id: uid("ex"), text: w.example, translation: w.exampleTranslation }] : [],
      },
    ],
    notes: w.notes,
    source: { kind: "import" as const },
    createdAt: now,
    updatedAt: now,
  }));
}
