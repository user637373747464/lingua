// Leçons : fiches de grammaire et de référence (contenu écrit à la main, en français).
import { Lang } from "./types";
import { LESSONS_EN } from "./content/lessons-en";
import { LESSONS_JA } from "./content/lessons-ja";

export type Block =
  | { t: "p"; text: string } // paragraphe ; **gras** accepté
  | { t: "list"; items: string[] }
  | { t: "table"; head: string[]; rows: string[][]; note?: string }
  | { t: "ex"; items: { text: string; tr: string; reading?: string }[] } // phrases d'exemple (avec traduction)
  | { t: "tip"; text: string }
  | { t: "warn"; text: string }
  | { t: "irregular" }; // tableau des verbes irréguliers anglais (recherchable)

export interface Lesson {
  id: string;
  lang: Lang;
  topic: string; // rubrique
  level: string;
  title: string;
  summary: string;
  blocks: Block[];
}

export const ALL_LESSONS: Lesson[] = [...LESSONS_EN, ...LESSONS_JA];

export const lessonsFor = (lang: Lang) => ALL_LESSONS.filter((l) => l.lang === lang);
export const topicsOfLessons = (lang: Lang) => [...new Set(lessonsFor(lang).map((l) => l.topic))];

/** Découpe « texte **gras** texte » en morceaux. */
export function richParts(text: string): { text: string; bold: boolean }[] {
  return text.split(/\*\*(.+?)\*\*/g).map((s, i) => ({ text: s, bold: i % 2 === 1 })).filter((p) => p.text);
}
