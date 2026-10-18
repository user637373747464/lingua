// Lecteur à mots tactiles : découpe un texte en mots et les rapproche du dictionnaire personnel.
// Aucune donnée extérieure : on ne reconnaît QUE les mots que l'utilisateur a lui-même ajoutés.
// Fonctions « pures » (sans accès au navigateur) : elles sont testées dans tests/reader.test.ts.

import { Entry, Lang } from "./types";
import { normalizeForSearch } from "./search";
import { hasJapanese } from "./japanese";

export interface Match {
  entry: Entry;
  /** nombre de caractères du texte couverts par la correspondance */
  length: number;
  /** exact = forme enregistrée · stem = forme probablement conjuguée / fléchie */
  how: "exact" | "stem";
}

export interface Token {
  text: string;
  start: number;
  end: number;
  word: boolean;
  match?: Match;
}

// ---------- découpage ----------

const EN_WORD = /[\p{L}\p{M}\p{N}]+(?:['’\-][\p{L}\p{M}\p{N}]+)*/gu;

function baseTokens(text: string, lang: Lang): Token[] {
  const out: Token[] = [];
  if (lang === "ja") {
    const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: { granularity: string }) => { segment(s: string): Iterable<{ segment: string; index: number; isWordLike?: boolean }> } }).Segmenter;
    if (Seg) {
      for (const s of new Seg("ja", { granularity: "word" }).segment(text)) {
        out.push({ text: s.segment, start: s.index, end: s.index + s.segment.length, word: !!s.isWordLike });
      }
      return out;
    }
    // secours : chaque caractère japonais est un « mot », le reste suit la règle latine
  }
  let last = 0;
  const push = (from: number, to: number, word: boolean) => {
    if (to > from) out.push({ text: text.slice(from, to), start: from, end: to, word });
  };
  const re = new RegExp(EN_WORD.source, "gu");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    push(last, m.index, false);
    if (lang === "ja" && hasJapanese(m[0])) {
      let i = m.index;
      for (const ch of m[0]) {
        push(i, i + ch.length, true);
        i += ch.length;
      }
    } else push(m.index, m.index + m[0].length, true);
    last = m.index + m[0].length;
  }
  push(last, text.length, false);
  return out;
}

// ---------- correspondance avec le dictionnaire ----------

export interface Lookup {
  match(text: string, start: number): Match | undefined;
}

function formsOf(e: Entry): string[] {
  return [e.headword, ...e.variants, ...e.inflections, ...(e.reading ? [e.reading] : [])].map((f) => f.trim()).filter(Boolean);
}

/** Candidats « mot de base » pour une forme anglaise fléchie (pluriel, passé, -ing…). */
export function englishBaseForms(word: string): string[] {
  const w = word.toLowerCase().replace(/’/g, "'");
  const out: string[] = [];
  const add = (x: string) => x.length >= 2 && x !== w && !out.includes(x) && out.push(x);
  if (w.endsWith("'s")) add(w.slice(0, -2));
  if (w.endsWith("ies")) add(w.slice(0, -3) + "y");
  if (w.endsWith("es")) add(w.slice(0, -2));
  if (w.endsWith("s")) add(w.slice(0, -1));
  if (w.endsWith("ied")) add(w.slice(0, -3) + "y");
  if (w.endsWith("ed")) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
    if (/(.)\1ed$/.test(w)) add(w.slice(0, -3));
  }
  if (w.endsWith("ing")) {
    add(w.slice(0, -3));
    add(w.slice(0, -3) + "e");
    if (/(.)\1ing$/.test(w)) add(w.slice(0, -4));
  }
  if (w.endsWith("ly")) add(w.slice(0, -2));
  if (w.endsWith("er") || w.endsWith("est")) {
    add(w.replace(/(er|est)$/, ""));
    add(w.replace(/(er|est)$/, "e"));
  }
  return out;
}

function englishLookup(entries: Entry[]): Lookup {
  const single = new Map<string, Entry>();
  const phrases: { form: string; entry: Entry }[] = [];
  for (const e of entries) {
    for (const f of formsOf(e)) {
      const n = normalizeForSearch(f).replace(/’/g, "'");
      if (!n) continue;
      if (/\s/.test(n)) phrases.push({ form: n, entry: e });
      else if (!single.has(n)) single.set(n, e);
    }
  }
  phrases.sort((a, b) => b.form.length - a.form.length);
  const wordAt = new RegExp(EN_WORD.source, "uy");
  return {
    match(text, start) {
      const rest = normalizeForSearch(text.slice(start, start + 80)).replace(/’/g, "'");
      for (const p of phrases) {
        if (rest.startsWith(p.form) && !/[\p{L}\p{N}]/u.test(rest.charAt(p.form.length))) {
          // la normalisation peut changer la longueur (accents) : on recompte sur le texte d'origine
          const len = lengthCovering(text, start, p.form);
          if (len > 0) return { entry: p.entry, length: len, how: "exact" };
        }
      }
      wordAt.lastIndex = start;
      const m = wordAt.exec(text);
      if (!m) return undefined;
      const norm = normalizeForSearch(m[0]).replace(/’/g, "'");
      const hit = single.get(norm);
      if (hit) return { entry: hit, length: m[0].length, how: "exact" };
      for (const base of englishBaseForms(norm)) {
        const e = single.get(base);
        if (e) return { entry: e, length: m[0].length, how: "stem" };
      }
      return undefined;
    },
  };
}

/** Plus petite longueur L telle que normalize(text[start..start+L]) == form (sinon 0). */
function lengthCovering(text: string, start: number, form: string): number {
  for (let l = 1; l <= Math.min(80, text.length - start); l++) {
    const n = normalizeForSearch(text.slice(start, start + l)).replace(/’/g, "'");
    if (n === form) return l;
    if (n.length > form.length) return 0;
  }
  return 0;
}

// Terminaisons possibles après le radical d'un verbe / adjectif japonais (approximation volontairement prudente).
const JA_NEXT: Record<string, string> = {
  る: "るまなたてれろよらりっさずせ",
  う: "うわいえおっ",
  く: "くかきけこい",
  ぐ: "ぐがぎげごい",
  す: "すさしせそ",
  つ: "つたちてとっ",
  ぬ: "ぬなにねのん",
  ぶ: "ぶばびべぼん",
  む: "むまみめもん",
  い: "いくかけさす",
};

function japaneseLookup(entries: Entry[]): Lookup {
  const nk = (s: string) => s.normalize("NFKC");
  const exact = new Map<string, { form: string; entry: Entry }[]>();
  const stems = new Map<string, { stem: string; next: string; entry: Entry }[]>();
  const kanji = /[㐀-鿿]/;
  for (const e of entries) {
    for (const raw of formsOf(e)) {
      const f = nk(raw);
      const list = exact.get(f[0]) ?? [];
      list.push({ form: f, entry: e });
      exact.set(f[0], list);
    }
    // forme conjuguée : seulement pour les mots écrits avec au moins un kanji (évite les faux positifs avec les petits mots en kana)
    const h = nk(e.headword);
    const last = h.slice(-1);
    const posIsVerbOrAdj = e.senses.some((s) => s.pos === "verb" || s.pos === "adjective");
    if (posIsVerbOrAdj && JA_NEXT[last] && h.length >= 2 && kanji.test(h)) {
      const stem = h.slice(0, -1);
      const list = stems.get(stem[0]) ?? [];
      list.push({ stem, next: JA_NEXT[last], entry: e });
      stems.set(stem[0], list);
    }
  }
  for (const list of exact.values()) list.sort((a, b) => b.form.length - a.form.length);
  for (const list of stems.values()) list.sort((a, b) => b.stem.length - a.stem.length);
  return {
    match(text, start) {
      const t = text; // les positions restent celles du texte d'origine
      const first = t[start];
      if (!first) return undefined;
      for (const c of exact.get(first) ?? []) {
        if (t.startsWith(c.form, start)) return { entry: c.entry, length: c.form.length, how: "exact" };
      }
      for (const c of stems.get(first) ?? []) {
        if (t.startsWith(c.stem, start) && c.next.includes(t.charAt(start + c.stem.length))) {
          return { entry: c.entry, length: c.stem.length + 1, how: "stem" };
        }
      }
      return undefined;
    },
  };
}

export function buildLookup(entries: Entry[], lang: Lang): Lookup {
  const mine = entries.filter((e) => e.lang === lang);
  return lang === "ja" ? japaneseLookup(mine) : englishLookup(mine);
}

/** Découpe un texte et marque les mots présents dans le dictionnaire (en fusionnant les morceaux d'un même mot). */
export function tokenize(text: string, lang: Lang, lookup?: Lookup): Token[] {
  const base = baseTokens(text, lang);
  if (!lookup) return base;
  const out: Token[] = [];
  let i = 0;
  while (i < base.length) {
    const t = base[i];
    if (!t.word) {
      out.push(t);
      i++;
      continue;
    }
    const m = lookup.match(text, t.start);
    if (!m) {
      out.push(t);
      i++;
      continue;
    }
    const wanted = t.start + m.length;
    let j = i;
    while (j < base.length && base[j].start < wanted) j++;
    const end = Math.max(t.end, base[j - 1].end);
    out.push({ text: text.slice(t.start, end), start: t.start, end, word: true, match: { ...m, length: end - t.start } });
    i = j;
  }
  return out;
}

// ---------- paragraphes et phrases ----------

export function splitParagraphs(text: string): { text: string; offset: number }[] {
  const out: { text: string; offset: number }[] = [];
  let offset = 0;
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (line.trim()) out.push({ text: line, offset });
    offset += line.length + 1;
  }
  return out;
}

const SENTENCE_END = /[.!?。！？…]/;

/** La phrase qui contient les caractères [start, end[ (pour garder le contexte d'un mot ajouté). */
export function sentenceAt(text: string, start: number, end: number, maxLength = 300): string {
  let a = start;
  while (a > 0 && !SENTENCE_END.test(text[a - 1])) a--;
  let b = end;
  while (b < text.length && !SENTENCE_END.test(text[b])) b++;
  if (b < text.length) b++; // inclut la ponctuation finale
  let s = text.slice(a, b).trim();
  if (s.length > maxLength) {
    const from = Math.max(0, start - a - Math.floor(maxLength / 2));
    s = (from > 0 ? "…" : "") + text.slice(a + from, a + from + maxLength).trim() + "…";
  }
  return s;
}
