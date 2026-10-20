// Histoires graduées : textes écrits pour l'application (aucun texte copié), classés par niveau.
// Fonctions pures, testées dans tests/stories.test.ts.

import { Lang, Pos } from "./types";

export type StoryLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "N5" | "N4" | "N3" | "N2" | "N1";

export const STORY_LEVELS: Record<Lang, StoryLevel[]> = {
  en: ["A1", "A2", "B1", "B2", "C1"],
  ja: ["N5", "N4", "N3", "N2", "N1"],
};

export interface Gloss {
  /** le mot tel qu'il apparaît dans le texte (forme de base) */
  w: string;
  /** lecture en kana (japonais) */
  reading?: string;
  /** forme du dictionnaire quand le texte contient une forme conjuguée (japonais) */
  lemma?: string;
  lemmaReading?: string;
  /** traduction en français */
  fr: string;
  pos?: Pos;
}

export interface Story {
  id: string;
  lang: Lang;
  level: StoryLevel;
  title: string;
  /** titre en français */
  titleFr: string;
  theme: string;
  /** résumé en français (sans révéler la fin) */
  summary: string;
  /** « Mots utiles » : une dizaine de mots clés avec leur traduction */
  words: Gloss[];
  /** un élément = un paragraphe */
  text: string[];
}

/** Nombre de mots (anglais) ou de caractères japonais (hors espaces et ponctuation). */
export function storySize(s: Pick<Story, "lang" | "text">): number {
  const joined = s.text.join("\n");
  if (s.lang === "ja") return joined.replace(/[\s「」『』、。！？…・（）()—ー〜]/g, "").length;
  return (joined.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) ?? []).length;
}

// Vitesse de lecture d'un apprenant, volontairement prudente : le temps affiché est plutôt une borne haute.
const SPEED = { en: 120, ja: 200 } as const; // mots par minute / caractères par minute

export function readingMinutes(s: Pick<Story, "lang" | "text">): number {
  return Math.max(1, Math.round(storySize(s) / SPEED[s.lang]));
}

/** Correspondance d'un mot touché avec le glossaire de l'histoire (forme exacte, puis pluriel / -ed / -ing simples). */
export function findGloss(words: Gloss[], token: string, lang: Lang): Gloss | undefined {
  const t = token.toLowerCase();
  const exact = words.find((g) => g.w.toLowerCase() === t);
  if (exact || lang === "ja") return exact;
  const forms = [
    t.replace(/ies$/, "y"),
    t.replace(/s$/, ""),
    t.replace(/es$/, ""),
    t.replace(/ed$/, ""),
    t.replace(/d$/, ""),
    t.replace(/ied$/, "y"),
    t.replace(/ing$/, ""),
    t.replace(/ing$/, "e"),
    t.replace(/(.)\1(ed|ing)$/, "$1"),
  ];
  return words.find((g) => forms.includes(g.w.toLowerCase()));
}

/** Les mots du glossaire doivent vraiment se trouver dans le texte (vérifié par les tests). */
export function glossInText(s: Story, g: Gloss): boolean {
  const body = s.text.join("\n");
  if (s.lang === "ja") return body.includes(g.w);
  // on ignore un « e » final pour accepter hesitate → hesitated, struggle → struggling…
  const stem = g.w.length > 4 ? g.w.replace(/e$/, "") : g.w;
  return new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(body);
}

import { STORIES_EN } from "./content/stories-en";
import { STORIES_JA } from "./content/stories-ja";

export const ALL_STORIES: Story[] = [...STORIES_EN, ...STORIES_JA];

export function storiesFor(lang: Lang, level?: StoryLevel | "all"): Story[] {
  return ALL_STORIES.filter((s) => s.lang === lang && (!level || level === "all" || s.level === level));
}

export function storyById(id: string): Story | undefined {
  return ALL_STORIES.find((s) => s.id === id);
}
