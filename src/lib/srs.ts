// Répétition espacée — version simple inspirée de SM-2.
//
// Idée : plus on réussit une carte, plus on attend avant de la revoir.
// Un échec la ramène vite (10 min) ; une réussite difficile avance peu ; une réussite facile avance beaucoup.
// Les intervalles en jours sont placés à minuit (heure locale) : la carte est « due » dès le matin du jour prévu.

import { Grade, ReviewState } from "./types";
import { dayKey, formatInterval, startOfDayPlus } from "./dates";

export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
export const MATURE_DAYS = 21;
export const RELEARN_MINUTES = 10;
export const MAX_HISTORY = 30;

export function newReviewState(cardId: string, now: number): ReviewState {
  return {
    cardId,
    due: now,
    interval: 0,
    ease: DEFAULT_EASE,
    reps: 0,
    lapses: 0,
    successes: 0,
    failures: 0,
    hintedSuccesses: 0,
    history: [],
  };
}

export interface ScheduleOptions {
  /** L'utilisateur a utilisé l'indice : une réponse juste ne peut pas dépasser « difficile ». */
  hinted?: boolean;
  /** Deuxième passage dans la même session après un échec : ne compte pas un nouvel oubli. */
  retry?: boolean;
}

const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

export function schedule(state: ReviewState, grade: Grade, now: number, opts: ScheduleOptions = {}): ReviewState {
  let g: Grade = grade;
  if (opts.hinted && (g === "good" || g === "easy")) g = "hard";
  if (opts.retry && g === "easy") g = "good";

  const next: ReviewState = {
    ...state,
    history: [...state.history, { t: now, grade: g, ok: g !== "again", hinted: !!opts.hinted }].slice(-MAX_HISTORY),
    lastReviewAt: now,
    introducedOn: state.introducedOn ?? dayKey(now),
  };

  if (g === "again") {
    next.failures = state.failures + 1;
    if (!opts.retry) {
      if (state.reps > 0) next.lapses = state.lapses + 1;
      next.ease = clamp(state.ease - 0.2, MIN_EASE, MAX_EASE);
    }
    next.reps = 0;
    next.interval = 0;
    next.due = now + RELEARN_MINUTES * 60_000;
    return next;
  }

  next.successes = state.successes + 1;
  if (opts.hinted) next.hintedSuccesses = state.hintedSuccesses + 1;
  next.reps = state.reps + 1;

  let interval: number;
  if (state.reps === 0) {
    interval = { hard: 1, good: 2, easy: 4 }[g];
  } else if (state.reps === 1) {
    interval = { hard: 3, good: 6, easy: 8 }[g];
  } else {
    const base = Math.max(1, state.interval);
    const raw = g === "hard" ? base * 1.2 : g === "good" ? base * state.ease : base * state.ease * 1.3;
    interval = Math.max(Math.round(raw), state.interval + 1);
  }

  if (!opts.retry) {
    const delta = g === "hard" ? -0.15 : g === "easy" ? 0.15 : 0;
    next.ease = clamp(state.ease + delta, MIN_EASE, MAX_EASE);
  }
  next.interval = interval;
  next.due = startOfDayPlus(now, interval);
  return next;
}

export function isNewCard(state: ReviewState | undefined): boolean {
  return !state || state.lastReviewAt === undefined;
}

export function isDue(state: ReviewState | undefined, now: number): boolean {
  return !!state && state.lastReviewAt !== undefined && state.due <= now;
}

export function isMature(state: ReviewState | undefined): boolean {
  return !!state && state.interval >= MATURE_DAYS;
}

/** Texte affiché sous chaque bouton de difficulté (« 2 j », « 10 min »…). */
export function nextIntervalLabel(state: ReviewState, grade: Grade, now: number, opts: ScheduleOptions = {}): string {
  const s = schedule(state, grade, now, opts);
  return formatInterval(s.interval);
}

/** Cartes « difficiles » : beaucoup d'échecs par rapport aux réussites. */
export function isDifficult(state: ReviewState): boolean {
  const total = state.successes + state.failures;
  return state.failures >= 3 && state.failures / total >= 0.35;
}
