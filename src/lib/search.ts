// Recherche dans le dictionnaire personnel + détection des doublons.

import { Entry, Lang, Pos } from "./types";
import { looksLikeRomaji, romajiToHiragana, toHiragana } from "./japanese";

/** Minuscules, largeurs normalisées, katakana → hiragana, accents latins retirés (sans toucher aux dakuten japonais). */
export function normalizeForSearch(s: string): string {
  const t = s.normalize("NFKC").toLowerCase();
  const noMarks = t.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");
  return toHiragana(noMarks).replace(/\s+/g, " ").trim();
}

function allSearchFields(e: Entry) {
  const translations: string[] = [];
  const definitions: string[] = [];
  const examples: string[] = [];
  for (const s of e.senses) {
    translations.push(...s.translations);
    if (s.definition) definitions.push(s.definition);
    for (const ex of s.examples) {
      examples.push(ex.text);
      if (ex.translation) examples.push(ex.translation);
    }
  }
  return {
    head: [e.headword, e.reading ?? ""].filter(Boolean),
    alt: [...e.variants, ...e.inflections],
    translations,
    definitions,
    examples,
  };
}

export function scoreEntry(e: Entry, rawQuery: string): number {
  const queries = new Set<string>();
  const q = normalizeForSearch(rawQuery);
  if (!q) return 1; // pas de requête : tout passe
  queries.add(q);
  if (e.lang === "ja" && looksLikeRomaji(rawQuery)) queries.add(normalizeForSearch(romajiToHiragana(rawQuery)));

  const f = allSearchFields(e);
  let best = 0;
  const consider = (fields: string[], exact: number, prefix: number, contains: number) => {
    for (const field of fields) {
      const n = normalizeForSearch(field);
      if (!n) continue;
      for (const query of queries) {
        if (n === query) best = Math.max(best, exact);
        else if (n.startsWith(query)) best = Math.max(best, prefix);
        else if (n.includes(query)) best = Math.max(best, contains);
      }
    }
  };
  consider(f.head, 100, 80, 60);
  consider(f.alt, 70, 55, 50);
  consider(f.translations, 65, 45, 40);
  consider(f.definitions, 0, 0, 30);
  consider(f.examples, 0, 0, 10);
  return best;
}

export interface SearchOptions {
  lang: Lang;
  pos?: Pos | "";
}

export function searchEntries(entries: Entry[], query: string, opts: SearchOptions): Entry[] {
  const pool = entries.filter((e) => e.lang === opts.lang && (!opts.pos || e.senses.some((s) => s.pos === opts.pos)));
  if (!normalizeForSearch(query)) {
    return [...pool].sort((a, b) => b.updatedAt - a.updatedAt);
  }
  return pool
    .map((e) => ({ e, score: scoreEntry(e, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.e.headword.localeCompare(b.e.headword))
    .map((x) => x.e);
}

/** Clé d'identité d'une entrée : langue + forme principale normalisée. */
export function entryKey(lang: Lang, headword: string): string {
  return `${lang}|${normalizeForSearch(headword)}`;
}

/**
 * Cherche une entrée déjà enregistrée pour le même mot (c'est un AVERTISSEMENT : l'utilisateur peut quand même créer l'entrée).
 * - même écriture (casse, katakana/hiragana ignorés) ;
 * - en japonais, un mot saisi en kana est aussi comparé à la lecture des entrées existantes (たべる ↔ 食べる) ;
 * - deux entrées japonaises de même écriture mais de lectures différentes (ex. 方 : かた / ほう) ne sont pas des doublons.
 */
export function findDuplicate(
  entries: Entry[],
  lang: Lang,
  headword: string,
  reading?: string,
  excludeId?: string,
): Entry | undefined {
  const key = entryKey(lang, headword);
  const head = normalizeForSearch(headword);
  const r = reading ? normalizeForSearch(reading) : "";
  return entries.find((e) => {
    if (e.id === excludeId || e.lang !== lang) return false;
    if (entryKey(e.lang, e.headword) === key) {
      const er = e.reading ? normalizeForSearch(e.reading) : "";
      return !r || !er || r === er;
    }
    return lang === "ja" && !!e.reading && normalizeForSearch(e.reading) === head;
  });
}
