// Exercices préparés : types, vérification, tirage d'une série.

import { Lang, ExerciseStat } from "./types";
import { checkAnswer } from "./answers";
import { Rng, shuffle } from "./cards";
import { EXERCISES_EN } from "./content/exercises-en";
import { EXERCISES_JA } from "./content/exercises-ja";

interface BaseExercise {
  id: string;
  lang: Lang;
  topic: string;
  level: string;
  prompt: string; // consigne (en français)
  explanation: string; // explication (en français)
}

export interface McqExercise extends BaseExercise {
  type: "mcq";
  sentence?: string; // phrase avec « ___ »
  choices: string[];
  correct: number;
}

export interface FillExercise extends BaseExercise {
  type: "fill";
  sentence: string; // phrase avec « ___ »
  accepted: string[];
  hint?: string;
}

export interface OrderExercise extends BaseExercise {
  type: "order";
  words: string[]; // dans le bon ordre
  alternatives?: string[][]; // autres ordres valables
}

export type Exercise = McqExercise | FillExercise | OrderExercise;
export type ExerciseResponse = number | string | string[];

export const ALL_EXERCISES: Exercise[] = [...EXERCISES_EN, ...EXERCISES_JA];

export function exercisesFor(lang: Lang): Exercise[] {
  return ALL_EXERCISES.filter((e) => e.lang === lang);
}

export function topicsFor(lang: Lang): string[] {
  return [...new Set(exercisesFor(lang).map((e) => e.topic))];
}

export function levelsFor(lang: Lang): string[] {
  const order = lang === "en" ? ["A1", "A2", "B1", "B2", "C1", "C2"] : ["N5", "N4", "N3", "N2", "N1"];
  const present = new Set(exercisesFor(lang).map((e) => e.level));
  return order.filter((l) => present.has(l));
}

function joinTokens(tokens: string[], lang: Lang): string {
  const joined = lang === "ja" ? tokens.join("") : tokens.join(" ");
  return joined.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

export interface ExerciseVerdict {
  correct: boolean;
  almost?: boolean;
}

export function checkExercise(ex: Exercise, response: ExerciseResponse): ExerciseVerdict {
  switch (ex.type) {
    case "mcq":
      return { correct: response === ex.correct };
    case "fill": {
      const r = checkAnswer(String(response), ex.accepted, ex.lang);
      return { correct: r.result === "correct", almost: r.result === "almost" };
    }
    case "order": {
      if (!Array.isArray(response)) return { correct: false };
      const got = joinTokens(response, ex.lang);
      const ok = [ex.words, ...(ex.alternatives ?? [])].some((w) => joinTokens(w, ex.lang) === got);
      return { correct: ok };
    }
  }
}

/** Réponse attendue, pour l'afficher à l'utilisateur après sa tentative. */
export function expectedAnswerText(ex: Exercise): string {
  switch (ex.type) {
    case "mcq":
      return ex.choices[ex.correct];
    case "fill":
      return ex.accepted[0];
    case "order":
      return ex.lang === "ja" ? ex.words.join("") : ex.words.join(" ");
  }
}

export interface ThemeHistory {
  tries: number;
  wrong: number;
}

/** Erreurs précédentes sur le même thème (exercices déjà tentés). */
export function topicHistory(stats: ExerciseStat[], lang: Lang, topic: string): ThemeHistory {
  let tries = 0;
  let correct = 0;
  for (const s of stats) {
    if (s.lang === lang && s.topic === topic) {
      tries += s.tries;
      correct += s.correct;
    }
  }
  return { tries, wrong: tries - correct };
}

/**
 * Tire une série : on privilégie les exercices jamais faits et ceux ratés la dernière fois,
 * sans jamais répéter deux fois le même exercice dans la série.
 */
export function pickSeries(pool: Exercise[], stats: ExerciseStat[], size: number, rng: Rng = Math.random): Exercise[] {
  const byId = new Map(stats.map((s) => [s.exerciseId, s]));
  const items = pool.map((ex) => {
    const s = byId.get(ex.id);
    const weight = !s ? 2 : s.lastCorrect ? 1 : 3;
    return { ex, weight };
  });
  const chosen: Exercise[] = [];
  while (chosen.length < size && items.length) {
    const total = items.reduce((t, i) => t + i.weight, 0);
    let r = rng() * total;
    let idx = 0;
    for (; idx < items.length - 1; idx++) {
      r -= items[idx].weight;
      if (r <= 0) break;
    }
    chosen.push(items[idx].ex);
    items.splice(idx, 1);
  }
  return chosen;
}

/** Mélange des jetons d'un exercice « ordre » en garantissant un ordre différent de la solution quand c'est possible. */
export function shuffledTokens(words: string[], rng: Rng = Math.random): string[] {
  if (words.length < 2) return [...words];
  for (let i = 0; i < 10; i++) {
    const s = shuffle(words, rng);
    if (s.join("\u0000") !== words.join("\u0000")) return s;
  }
  return [...words].reverse();
}
