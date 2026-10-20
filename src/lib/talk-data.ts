import { Lang } from "./types";
import { Talk, TalkLevel } from "./talk";
import { TALKS_EN } from "./content/talk-en";
import { TALKS_JA } from "./content/talk-ja";

export const ALL_TALKS: Talk[] = [...TALKS_EN, ...TALKS_JA];

export function talksFor(lang: Lang, level?: TalkLevel | "all"): Talk[] {
  return ALL_TALKS.filter((t) => t.lang === lang && (!level || level === "all" || t.level === level));
}

export function talkById(id: string): Talk | undefined {
  return ALL_TALKS.find((t) => t.id === id);
}
