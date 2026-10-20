"use client";

// Les données de l'application en mémoire + les actions qui les modifient.
// Règle d'or : chaque action écrit D'ABORD dans IndexedDB, et ne met l'écran à jour qu'ensuite.
// Les actions sont exécutées l'une après l'autre (file d'attente) pour ne jamais perdre une réponse en cas de clics rapides.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  DEFAULT_SETTINGS,
  Entry,
  ExerciseStat,
  Grade,
  Lang,
  LangSettings,
  ReviewState,
  Settings,
  Snapshot,
  StudyDay,
  TextItem,
  emptySnapshot,
  WritingStat,
  Deck,
  DeckCard,
} from "./types";
import * as db from "./db";
import { newReviewState, schedule } from "./srs";
import { dayKey } from "./dates";
import { makeEntryCards } from "./cards";
import { Dir, Mode, legacyToDeckCards, withResult } from "./decks";
import { uid } from "./ids";
import { BackupFile, MergeReport, createBackup, mergeSnapshots, normalizeSettings } from "./backup";
import type { Exercise } from "./exercises";

export interface AnswerArgs {
  cardId: string;
  grade: Grade;
  hinted: boolean;
  retry: boolean;
  elapsedSec: number;
}

export interface DeckResult {
  cardId: string;
  dir: Dir;
  ok: boolean;
}

export interface Store {
  ready: boolean;
  error: string | null;
  snapshot: Snapshot;
  statesById: Map<string, ReviewState>;
  entriesById: Map<string, Entry>;
  lastBackupAt: number | undefined;
  persisted: boolean | null;
  saveEntry(entry: Entry, createCards: boolean): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  addEntries(entries: Entry[], createCards: boolean): Promise<void>;
  createCardsForEntry(entryId: string): Promise<void>;
  saveCustomCard(card: Card): Promise<void>;
  setCardSuspended(cardId: string, suspended: boolean): Promise<void>;
  deleteCard(cardId: string): Promise<void>;
  answerCard(args: AnswerArgs): Promise<void>;
  answerExercise(exercise: Exercise, correct: boolean, elapsedSec: number): Promise<void>;
  recordWriting(char: string, kind: WritingStat["kind"], correct: boolean): Promise<void>;
  saveDeck(deck: Deck): Promise<void>;
  deleteDeck(id: string): Promise<void>;
  saveDeckCards(cards: DeckCard[]): Promise<void>;
  deleteDeckCards(ids: string[]): Promise<void>;
  /** Enregistre les résultats d'une session de révision d'un paquet (progression des cartes + minutes d'étude). */
  recordDeckResults(args: { deckId: string; lang: Lang; mode: Mode; results: DeckResult[]; seconds: number; bestMatchMs?: number }): Promise<void>;
  /** Transforme les anciennes cartes du dictionnaire en un paquet « Anciennes cartes », puis les supprime. Renvoie le nombre de cartes reprises. */
  convertLegacyCards(lang: Lang): Promise<number>;
  saveText(item: TextItem): Promise<void>;
  deleteText(id: string): Promise<void>;
  updateSettings(fn: (s: Settings) => Settings): Promise<void>;
  updateLangSettings(lang: Lang, patch: Partial<LangSettings>): Promise<void>;
  exportBackup(): BackupFile;
  importSnapshot(incoming: Snapshot, mode: "merge" | "replace"): Promise<MergeReport | null>;
  markBackupDone(): Promise<void>;
  resetAll(): Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export function useData(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error("useData doit être utilisé dans <DataProvider>.");
  return v;
}

function blankDay(date: string, lang: Lang): StudyDay {
  return {
    key: `${date}|${lang}`,
    date,
    lang,
    seconds: 0,
    answers: 0,
    correct: 0,
    unaided: 0,
    exercises: 0,
    exercisesCorrect: 0,
    newCards: 0,
    recognition: { n: 0, ok: 0 },
    recall: { n: 0, ok: 0 },
  };
}

const MAX_SECONDS_PER_ANSWER = 120;

export function DataProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<Snapshot>(emptySnapshot());
  const [snapshot, setSnapshot] = useState<Snapshot>(ref.current);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBackupAt, setLastBackupAt] = useState<number | undefined>(undefined);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const commit = useCallback((next: Snapshot) => {
    ref.current = next;
    setSnapshot(next);
  }, []);

  /** Exécute `fn` après toutes les actions précédentes. */
  const enqueue = useCallback(<T,>(fn: () => Promise<T>): Promise<T> => {
    const run = queue.current.then(fn, fn);
    queue.current = run.catch(() => undefined);
    return run;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await db.loadSnapshot();
        const last = await db.getMeta<number>("lastBackupAt");
        if (cancelled) return;
        commit(snap);
        setLastBackupAt(last);
        setReady(true);
        db.requestPersistence().then((p) => !cancelled && setPersisted(p));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [commit]);

  const statesById = useMemo(() => new Map(snapshot.reviewStates.map((s) => [s.cardId, s])), [snapshot.reviewStates]);
  const entriesById = useMemo(() => new Map(snapshot.entries.map((e) => [e.id, e])), [snapshot.entries]);

  const store: Store = useMemo(() => {
    const upsert = <T,>(list: T[], item: T, key: (x: T) => string): T[] => {
      const k = key(item);
      const i = list.findIndex((x) => key(x) === k);
      if (i === -1) return [...list, item];
      const copy = [...list];
      copy[i] = item;
      return copy;
    };

    const withNewCards = (cur: Snapshot, entries: Entry[], createCards: boolean, now: number) => {
      const newCards: Card[] = [];
      if (createCards) {
        for (const e of entries) {
          const has = cur.cards.some((c) => c.entryId === e.id);
          if (!has) newCards.push(...makeEntryCards(e, now));
        }
      }
      return newCards;
    };

    return {
      ready,
      error,
      snapshot,
      statesById,
      entriesById,
      lastBackupAt,
      persisted,

      saveEntry: (entry, createCards) =>
        enqueue(async () => {
          const cur = ref.current;
          const newCards = withNewCards(cur, [entry], createCards, Date.now());
          await db.write([
            { store: "entries", put: [entry] },
            { store: "cards", put: newCards },
          ]);
          commit({ ...cur, entries: upsert(cur.entries, entry, (e) => e.id), cards: [...cur.cards, ...newCards] });
        }),

      deleteEntry: (id) =>
        enqueue(async () => {
          const cur = ref.current;
          const cardIds = cur.cards.filter((c) => c.entryId === id).map((c) => c.id);
          await db.write([
            { store: "entries", del: [id] },
            { store: "cards", del: cardIds },
            { store: "reviewStates", del: cardIds },
          ]);
          const gone = new Set(cardIds);
          commit({
            ...cur,
            entries: cur.entries.filter((e) => e.id !== id),
            cards: cur.cards.filter((c) => !gone.has(c.id)),
            reviewStates: cur.reviewStates.filter((s) => !gone.has(s.cardId)),
          });
        }),

      addEntries: (entries, createCards) =>
        enqueue(async () => {
          const cur = ref.current;
          const newCards = withNewCards(cur, entries, createCards, Date.now());
          await db.write([
            { store: "entries", put: entries },
            { store: "cards", put: newCards },
          ]);
          commit({ ...cur, entries: [...cur.entries, ...entries], cards: [...cur.cards, ...newCards] });
        }),

      createCardsForEntry: (entryId) =>
        enqueue(async () => {
          const cur = ref.current;
          const entry = cur.entries.find((e) => e.id === entryId);
          if (!entry) return;
          const newCards = withNewCards(cur, [entry], true, Date.now());
          if (!newCards.length) return;
          await db.write([{ store: "cards", put: newCards }]);
          commit({ ...cur, cards: [...cur.cards, ...newCards] });
        }),

      saveCustomCard: (card) =>
        enqueue(async () => {
          const cur = ref.current;
          await db.write([{ store: "cards", put: [card] }]);
          commit({ ...cur, cards: upsert(cur.cards, card, (c) => c.id) });
        }),

      setCardSuspended: (cardId, suspended) =>
        enqueue(async () => {
          const cur = ref.current;
          const card = cur.cards.find((c) => c.id === cardId);
          if (!card) return;
          const next = { ...card, suspended };
          await db.write([{ store: "cards", put: [next] }]);
          commit({ ...cur, cards: upsert(cur.cards, next, (c) => c.id) });
        }),

      deleteCard: (cardId) =>
        enqueue(async () => {
          const cur = ref.current;
          await db.write([
            { store: "cards", del: [cardId] },
            { store: "reviewStates", del: [cardId] },
          ]);
          commit({ ...cur, cards: cur.cards.filter((c) => c.id !== cardId), reviewStates: cur.reviewStates.filter((s) => s.cardId !== cardId) });
        }),

      answerCard: ({ cardId, grade, hinted, retry, elapsedSec }) =>
        enqueue(async () => {
          const cur = ref.current;
          const card = cur.cards.find((c) => c.id === cardId);
          if (!card) return;
          const now = Date.now();
          const prev = cur.reviewStates.find((s) => s.cardId === cardId) ?? newReviewState(cardId, now);
          const wasNew = prev.lastReviewAt === undefined;
          const next = schedule(prev, grade, now, { hinted, retry });
          const ok = grade !== "again";

          const date = dayKey(now);
          const key = `${date}|${card.lang}`;
          const day: StudyDay = structuredClone(cur.studyLog.find((d) => d.key === key) ?? blankDay(date, card.lang));
          day.answers += 1;
          if (ok) day.correct += 1;
          if (ok && !hinted) day.unaided += 1;
          if (wasNew) day.newCards += 1;
          day.seconds += Math.max(0, Math.min(MAX_SECONDS_PER_ANSWER, Math.round(elapsedSec)));
          if (card.kind === "recognition" || card.kind === "recall") {
            day[card.kind].n += 1;
            if (ok) day[card.kind].ok += 1;
          }

          await db.write([
            { store: "reviewStates", put: [next] },
            { store: "studyLog", put: [day] },
          ]);
          commit({
            ...cur,
            reviewStates: upsert(cur.reviewStates, next, (s) => s.cardId),
            studyLog: upsert(cur.studyLog, day, (d) => d.key),
          });
        }),

      answerExercise: (exercise, correct, elapsedSec) =>
        enqueue(async () => {
          const cur = ref.current;
          const now = Date.now();
          const prev: ExerciseStat = cur.exerciseStats.find((s) => s.exerciseId === exercise.id) ?? {
            exerciseId: exercise.id,
            lang: exercise.lang,
            topic: exercise.topic,
            level: exercise.level,
            tries: 0,
            correct: 0,
            lastAt: now,
            lastCorrect: false,
          };
          const stat: ExerciseStat = { ...prev, tries: prev.tries + 1, correct: prev.correct + (correct ? 1 : 0), lastAt: now, lastCorrect: correct };

          const date = dayKey(now);
          const key = `${date}|${exercise.lang}`;
          const day: StudyDay = structuredClone(cur.studyLog.find((d) => d.key === key) ?? blankDay(date, exercise.lang));
          day.exercises += 1;
          if (correct) day.exercisesCorrect += 1;
          day.seconds += Math.max(0, Math.min(MAX_SECONDS_PER_ANSWER, Math.round(elapsedSec)));

          await db.write([
            { store: "exerciseStats", put: [stat] },
            { store: "studyLog", put: [day] },
          ]);
          commit({
            ...cur,
            exerciseStats: upsert(cur.exerciseStats, stat, (s) => s.exerciseId),
            studyLog: upsert(cur.studyLog, day, (d) => d.key),
          });
        }),

      updateSettings: (fn) =>
        enqueue(async () => {
          const cur = ref.current;
          const next = normalizeSettings(fn(cur.settings));
          await db.write([{ store: "settings", put: [db.settingsRecord(next)] }]);
          commit({ ...cur, settings: next });
        }),

      recordWriting: (char, kind, correct) =>
        enqueue(async () => {
          const cur = ref.current;
          const now = Date.now();
          const prev = cur.writing.find((w) => w.char === char) ?? { char, kind, tries: 0, correct: 0, lastAt: now, lastCorrect: false };
          const stat: WritingStat = { ...prev, tries: prev.tries + 1, correct: prev.correct + (correct ? 1 : 0), lastAt: now, lastCorrect: correct };
          await db.write([{ store: "writing", put: [stat] }]);
          commit({ ...cur, writing: upsert(cur.writing, stat, (w) => w.char) });
        }),

      saveDeck: (deck) =>
        enqueue(async () => {
          const cur = ref.current;
          await db.write([{ store: "decks", put: [deck] }]);
          commit({ ...cur, decks: upsert(cur.decks, deck, (d) => d.id) });
        }),

      deleteDeck: (id) =>
        enqueue(async () => {
          const cur = ref.current;
          const ids = cur.deckCards.filter((c) => c.deckId === id).map((c) => c.id);
          await db.write([
            { store: "decks", del: [id] },
            { store: "deckCards", del: ids },
          ]);
          const gone = new Set(ids);
          commit({ ...cur, decks: cur.decks.filter((d) => d.id !== id), deckCards: cur.deckCards.filter((c) => !gone.has(c.id)) });
        }),

      saveDeckCards: (cards) =>
        enqueue(async () => {
          if (cards.length === 0) return;
          const cur = ref.current;
          await db.write([{ store: "deckCards", put: cards }]);
          const byId = new Map(cards.map((c) => [c.id, c]));
          const merged = cur.deckCards.map((c) => byId.get(c.id) ?? c);
          const have = new Set(cur.deckCards.map((c) => c.id));
          commit({ ...cur, deckCards: [...merged, ...cards.filter((c) => !have.has(c.id))] });
        }),

      deleteDeckCards: (ids) =>
        enqueue(async () => {
          if (ids.length === 0) return;
          const cur = ref.current;
          await db.write([{ store: "deckCards", del: ids }]);
          const gone = new Set(ids);
          commit({ ...cur, deckCards: cur.deckCards.filter((c) => !gone.has(c.id)) });
        }),

      recordDeckResults: ({ deckId, lang, mode, results, seconds, bestMatchMs }) =>
        enqueue(async () => {
          const cur = ref.current;
          const now = Date.now();
          const cards = new Map(cur.deckCards.map((c) => [c.id, c]));
          const changed = new Map<string, DeckCard>();
          for (const r of results) {
            const base = changed.get(r.cardId) ?? cards.get(r.cardId);
            if (base) changed.set(r.cardId, withResult(base, r.dir, r.ok, now));
          }
          const date = dayKey(now);
          const key = `${date}|${lang}`;
          const day: StudyDay = structuredClone(cur.studyLog.find((d) => d.key === key) ?? blankDay(date, lang));
          const n = results.length;
          const ok = results.filter((r) => r.ok).length;
          day.answers += n;
          day.correct += ok;
          day.unaided += ok;
          day.seconds += Math.max(0, Math.min(n * MAX_SECONDS_PER_ANSWER, Math.round(seconds)));
          const kind = mode === "write" ? "recall" : "recognition";
          day[kind].n += n;
          day[kind].ok += ok;

          let deck = cur.decks.find((d) => d.id === deckId);
          if (deck && bestMatchMs !== undefined && (deck.bestMatchMs === undefined || bestMatchMs < deck.bestMatchMs)) deck = { ...deck, bestMatchMs, updatedAt: now };
          else deck = undefined;

          await db.write([
            { store: "deckCards", put: [...changed.values()] },
            { store: "studyLog", put: [day] },
            ...(deck ? [{ store: "decks" as const, put: [deck] }] : []),
          ]);
          commit({
            ...cur,
            deckCards: cur.deckCards.map((c) => changed.get(c.id) ?? c),
            studyLog: upsert(cur.studyLog, day, (d) => d.key),
            decks: deck ? upsert(cur.decks, deck, (d) => d.id) : cur.decks,
          });
        }),

      convertLegacyCards: (lang) =>
        enqueue(async () => {
          const cur = ref.current;
          const legacy = cur.cards.filter((c) => c.lang === lang);
          if (legacy.length === 0) return 0;
          const now = Date.now();
          const deck: Deck = { id: uid("deck"), lang, name: "Anciennes cartes", createdAt: now, updatedAt: now };
          const fresh = legacyToDeckCards(legacy, cur.entries, cur.reviewStates, deck.id, lang, now);
          const ids = legacy.map((c) => c.id);
          await db.write([
            { store: "decks", put: fresh.length ? [deck] : [] },
            { store: "deckCards", put: fresh },
            { store: "cards", del: ids },
            { store: "reviewStates", del: ids },
          ]);
          const gone = new Set(ids);
          commit({
            ...cur,
            decks: fresh.length ? [...cur.decks, deck] : cur.decks,
            deckCards: [...cur.deckCards, ...fresh],
            cards: cur.cards.filter((c) => !gone.has(c.id)),
            reviewStates: cur.reviewStates.filter((s) => !gone.has(s.cardId)),
          });
          return fresh.length;
        }),

      saveText: (item) =>
        enqueue(async () => {
          const cur = ref.current;
          await db.write([{ store: "texts", put: [item] }]);
          commit({ ...cur, texts: upsert(cur.texts, item, (t) => t.id) });
        }),

      deleteText: (id) =>
        enqueue(async () => {
          const cur = ref.current;
          await db.write([{ store: "texts", del: [id] }]);
          commit({ ...cur, texts: cur.texts.filter((t) => t.id !== id) });
        }),

      updateLangSettings: (lang, patch) =>
        enqueue(async () => {
          const cur = ref.current;
          const next = normalizeSettings({ ...cur.settings, langs: { ...cur.settings.langs, [lang]: { ...cur.settings.langs[lang], ...patch } } });
          await db.write([{ store: "settings", put: [db.settingsRecord(next)] }]);
          commit({ ...cur, settings: next });
        }),

      exportBackup: () => createBackup(ref.current, Date.now()),

      importSnapshot: (incoming, mode) =>
        enqueue(async () => {
          const cur = ref.current;
          if (mode === "replace") {
            await db.replaceAll(incoming);
            commit(incoming);
            return null;
          }
          const { snapshot: merged, report } = mergeSnapshots(cur, incoming);
          await db.replaceAll(merged);
          commit(merged);
          return report;
        }),

      markBackupDone: () =>
        enqueue(async () => {
          const now = Date.now();
          await db.setMeta("lastBackupAt", now);
          setLastBackupAt(now);
        }),

      resetAll: () =>
        enqueue(async () => {
          const fresh = emptySnapshot();
          fresh.settings = normalizeSettings(DEFAULT_SETTINGS);
          await db.replaceAll(fresh);
          await db.write([{ store: "meta", clear: true }]);
          setLastBackupAt(undefined);
          commit(fresh);
        }),
    };
  }, [ready, error, snapshot, statesById, entriesById, lastBackupAt, persisted, enqueue, commit]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
