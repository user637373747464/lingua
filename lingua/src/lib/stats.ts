// Statistiques calculées à partir des données locales (aucun envoi nulle part).

import { Card, ExerciseStat, Lang, ReviewState, StudyDay } from "./types";
import { dayKey, previousDayKey } from "./dates";
import { isDue, isMature, isNewCard } from "./srs";

export type Mastery = "new" | "learning" | "recognized" | "mastered";

export const MASTERY_LABELS: Record<Mastery, string> = {
  new: "nouveau",
  learning: "en cours",
  recognized: "reconnu",
  mastered: "maîtrisé",
};

/**
 * Niveau de maîtrise d'un mot.
 * - « reconnu » : la carte QCM est solide (intervalle ≥ 21 jours), mais on ne sait pas encore écrire le mot ;
 * - « maîtrisé » : la carte de rappel écrit est solide (≥ 21 jours et au moins 3 réussites de suite).
 * Un mot n'est donc jamais « maîtrisé » sur la seule base d'un QCM.
 */
export function masteryOf(entryId: string, cards: Card[], states: Map<string, ReviewState>): Mastery {
  const mine = cards.filter((c) => c.entryId === entryId);
  const recognition = mine.find((c) => c.kind === "recognition");
  const recall = mine.find((c) => c.kind === "recall");
  const rs = recognition ? states.get(recognition.id) : undefined;
  const cs = recall ? states.get(recall.id) : undefined;
  if (isNewCard(rs) && isNewCard(cs)) return "new";
  if (cs && isMature(cs) && cs.reps >= 3) return "mastered";
  if (rs && isMature(rs)) return "recognized";
  return "learning";
}

export function dueCount(cards: Card[], states: Map<string, ReviewState>, entryIds: Set<string>, lang: Lang, now: number): number {
  let n = 0;
  for (const c of cards) {
    if (c.lang !== lang || c.suspended) continue;
    if (c.kind !== "custom" && !(c.entryId && entryIds.has(c.entryId))) continue;
    if (isDue(states.get(c.id), now)) n++;
  }
  return n;
}

export function activeDays(log: StudyDay[]): Set<string> {
  const s = new Set<string>();
  for (const d of log) if (d.answers + d.exercises > 0) s.add(d.date);
  return s;
}

/** Série de jours consécutifs avec au moins une activité (aujourd'hui compte s'il y a déjà une activité). */
export function currentStreak(log: StudyDay[], now: number): number {
  const days = activeDays(log);
  let key = dayKey(now);
  if (!days.has(key)) key = previousDayKey(key);
  let n = 0;
  while (days.has(key)) {
    n++;
    key = previousDayKey(key);
  }
  return n;
}

export function longestStreak(log: StudyDay[]): number {
  const days = [...activeDays(log)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    run = prev !== null && previousDayKey(d) === prev ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function secondsToday(log: StudyDay[], lang: Lang, now: number): number {
  const key = dayKey(now);
  return log.filter((d) => d.date === key && d.lang === lang).reduce((s, d) => s + d.seconds, 0);
}

export interface Totals {
  seconds: number;
  answers: number;
  correct: number;
  unaided: number;
  exercises: number;
  exercisesCorrect: number;
  recognition: { n: number; ok: number };
  recall: { n: number; ok: number };
}

export function totals(log: StudyDay[], lang?: Lang): Totals {
  const t: Totals = {
    seconds: 0,
    answers: 0,
    correct: 0,
    unaided: 0,
    exercises: 0,
    exercisesCorrect: 0,
    recognition: { n: 0, ok: 0 },
    recall: { n: 0, ok: 0 },
  };
  for (const d of log) {
    if (lang && d.lang !== lang) continue;
    t.seconds += d.seconds;
    t.answers += d.answers;
    t.correct += d.correct;
    t.unaided += d.unaided;
    t.exercises += d.exercises;
    t.exercisesCorrect += d.exercisesCorrect;
    t.recognition.n += d.recognition.n;
    t.recognition.ok += d.recognition.ok;
    t.recall.n += d.recall.n;
    t.recall.ok += d.recall.ok;
  }
  return t;
}

export function pct(ok: number, n: number): string {
  return n === 0 ? "—" : `${Math.round((ok / n) * 100)} %`;
}

export interface TopicSummary {
  topic: string;
  tries: number;
  correct: number;
}

export function exerciseTopics(stats: ExerciseStat[], lang: Lang): TopicSummary[] {
  const map = new Map<string, TopicSummary>();
  for (const s of stats) {
    if (s.lang !== lang) continue;
    const cur = map.get(s.topic) ?? { topic: s.topic, tries: 0, correct: 0 };
    cur.tries += s.tries;
    cur.correct += s.correct;
    map.set(s.topic, cur);
  }
  return [...map.values()].sort((a, b) => a.correct / a.tries - b.correct / b.tries);
}

/** Série de 7 jours (du plus ancien au plus récent) : minutes d'étude par jour, toutes langues. */
export function lastDaysMinutes(log: StudyDay[], now: number, n = 7): { date: string; minutes: number }[] {
  const keys: string[] = [];
  let k = dayKey(now);
  for (let i = 0; i < n; i++) {
    keys.unshift(k);
    k = previousDayKey(k);
  }
  return keys.map((date) => ({
    date,
    minutes: Math.round(log.filter((d) => d.date === date).reduce((s, d) => s + d.seconds, 0) / 60),
  }));
}
