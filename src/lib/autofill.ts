// Remplissage automatique d'un mot à partir de services GRATUITS en ligne (Internet nécessaire).
//
//  - Anglais : dictionaryapi.dev (« Free Dictionary API ») → prononciation (IPA) et catégorie grammaticale.
//  - Anglais et japonais : MyMemory (api.mymemory.translated.net) → traductions françaises proposées.
//
// Honnêteté : ce sont des services tiers (pas Linguee, dont la base n'est pas utilisable). Le résultat est une SUGGESTION qui
// peut se tromper (sens, catégorie) : l'utilisateur la relit et la corrige avant d'enregistrer. Le mot tapé est envoyé à ces services.

import { Lang, Pos } from "./types";
import { toHiragana } from "./japanese";

export interface AutoInfo {
  ipa?: string;
  pos?: Pos;
  reading?: string;
  translations: string[];
}

const POS_MAP: Record<string, Pos> = {
  noun: "noun",
  verb: "verb",
  adjective: "adjective",
  adverb: "adverb",
  pronoun: "pronoun",
  preposition: "preposition",
  conjunction: "conjunction",
  interjection: "interjection",
  exclamation: "interjection",
  determiner: "determiner",
  article: "determiner",
  idiom: "expression",
  phrase: "expression",
  "phrasal verb": "verb",
};

/** Lit la réponse de dictionaryapi.dev : prononciation (sans les barres obliques) et catégorie de la première entrée. */
export function parseFreeDictionary(data: unknown): { ipa?: string; pos?: Pos } {
  if (!Array.isArray(data) || data.length === 0) return {};
  let ipa: string | undefined;
  let pos: Pos | undefined;
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const it = item as { phonetic?: unknown; phonetics?: unknown; meanings?: unknown };
    if (!ipa) {
      const list = Array.isArray(it.phonetics) ? (it.phonetics as { text?: unknown }[]) : [];
      const texts = [...list.map((p) => p?.text), it.phonetic].filter((t): t is string => typeof t === "string" && t.trim() !== "");
      if (texts.length) ipa = texts[0].trim().replace(/^\/|\/$/g, "");
    }
    if (!pos && Array.isArray(it.meanings)) {
      for (const m of it.meanings as { partOfSpeech?: unknown }[]) {
        const key = typeof m?.partOfSpeech === "string" ? m.partOfSpeech.toLowerCase() : "";
        if (POS_MAP[key]) {
          pos = POS_MAP[key];
          break;
        }
      }
    }
  }
  return { ipa, pos };
}

/** Lit la réponse de MyMemory : jusqu'à 3 traductions françaises distinctes, les meilleures d'abord. Lève une erreur si le quota est atteint. */
export function parseMyMemory(data: unknown, word: string): string[] {
  if (!data || typeof data !== "object") return [];
  const d = data as { responseData?: { translatedText?: unknown }; matches?: unknown; quotaFinished?: unknown; responseStatus?: unknown };
  if (d.quotaFinished === true) throw new Error("Quota du service de traduction atteint pour aujourd'hui.");
  const status = Number(d.responseStatus);
  if (Number.isFinite(status) && status !== 200) return [];
  const cands: { t: string; score: number }[] = [];
  const top = d.responseData?.translatedText;
  if (typeof top === "string") cands.push({ t: top, score: 2 });
  if (Array.isArray(d.matches)) {
    for (const m of d.matches as { translation?: unknown; quality?: unknown; match?: unknown }[]) {
      if (typeof m?.translation !== "string") continue;
      const q = Number(m.quality) || 0;
      const mt = Number(m.match) || 0;
      cands.push({ t: m.translation, score: mt + q / 100 });
    }
  }
  const norm = (s: string) => s.trim().toLowerCase().normalize("NFC");
  const seen = new Set([norm(word)]);
  const out: string[] = [];
  for (const c of cands.sort((a, b) => b.score - a.score)) {
    const t = c.t.replace(/\s+/g, " ").trim();
    if (!t || t.length > 60 || /MYMEMORY|WARNING|<[^>]+>/i.test(t)) continue;
    if (seen.has(norm(t))) continue;
    seen.add(norm(t));
    out.push(t);
    if (out.length === 3) break;
  }
  return out;
}

type FetchFn = (url: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

async function getJson(fetchFn: FetchFn, url: string, ms = 8000): Promise<{ ok: boolean; status: number; data: unknown }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetchFn(url, { signal: ctrl.signal });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* réponse vide ou non JSON */
    }
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

const isKanaOnly = (s: string) => /^[ぁ-ゖァ-ヺーー]+$/.test(s);

/**
 * Cherche un mot. Ne lève une erreur que si TOUT a échoué (hors ligne, quota…) ; un résultat partiel est renvoyé tel quel.
 * `fetchFn` est injectable pour les tests.
 */
export async function lookupWord(word: string, lang: Lang, fetchFn: FetchFn = (u, i) => fetch(u, i)): Promise<AutoInfo> {
  const w = word.trim();
  const info: AutoInfo = { translations: [] };
  if (!w) return info;
  const errors: string[] = [];
  const tasks: Promise<void>[] = [];

  if (lang === "en") {
    tasks.push(
      (async () => {
        const r = await getJson(fetchFn, `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`);
        if (r.status === 404) return; // mot inconnu de ce dictionnaire : pas une panne
        if (!r.ok) throw new Error(`Dictionnaire indisponible (${r.status}).`);
        const p = parseFreeDictionary(r.data);
        info.ipa = p.ipa;
        info.pos = p.pos;
      })().catch((e) => void errors.push(e instanceof Error ? e.message : String(e))),
    );
  } else if (isKanaOnly(w)) {
    info.reading = toHiragana(w);
  }

  tasks.push(
    (async () => {
      const pair = lang === "en" ? "en|fr" : "ja|fr";
      const r = await getJson(fetchFn, `https://api.mymemory.translated.net/get?q=${encodeURIComponent(w)}&langpair=${encodeURIComponent(pair)}`);
      if (!r.ok) throw new Error(`Service de traduction indisponible (${r.status}).`);
      info.translations = parseMyMemory(r.data, w);
    })().catch((e) => void errors.push(e instanceof Error ? e.message : String(e))),
  );

  await Promise.all(tasks);
  const got = info.ipa || info.pos || info.reading || info.translations.length;
  if (!got && errors.length) throw new Error(errors[0].includes("abort") ? "Le service ne répond pas (délai dépassé)." : "Remplissage automatique impossible (Internet ?).");
  return info;
}
