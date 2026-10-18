import test from "node:test";
import assert from "node:assert/strict";
import { currentStreak, longestStreak, masteryOf, totals, secondsToday, dueCount, lastDaysMinutes, exerciseTopics, pct } from "../src/lib/stats";
import { newReviewState, schedule } from "../src/lib/srs";
import { mkEntry, mkCard } from "./helpers";
import { StudyDay, ReviewState } from "../src/lib/types";

const NOW = new Date(2026, 9, 18, 10).getTime();
const mk = (date: string, lang: "en" | "ja", seconds = 60, answers = 1, correct = 1): StudyDay => ({
  key: `${date}|${lang}`, date, lang, seconds, answers, correct, unaided: correct, exercises: 0, exercisesCorrect: 0, newCards: 0,
  recognition: { n: answers, ok: correct }, recall: { n: 0, ok: 0 },
});

test("série quotidienne : compte aujourd'hui ou hier, s'arrête au premier trou", () => {
  const log = [mk("2026-10-18", "en"), mk("2026-10-17", "ja"), mk("2026-10-16", "en"), mk("2026-10-14", "en")];
  assert.equal(currentStreak(log, NOW), 3);
  assert.equal(currentStreak([mk("2026-10-17", "en")], NOW), 1, "pas encore d'activité aujourd'hui : la série d'hier compte");
  assert.equal(currentStreak([mk("2026-10-15", "en")], NOW), 0);
  assert.equal(currentStreak([], NOW), 0);
  assert.equal(longestStreak(log), 3);
  assert.equal(currentStreak([mk("2026-10-31", "en"), mk("2026-10-30", "en")], new Date(2026, 10, 1).getTime()), 2, "passage de mois");
});

test("une journée sans réponse ni exercice ne compte pas dans la série", () => {
  const empty = { ...mk("2026-10-18", "en", 30, 0, 0) };
  assert.equal(currentStreak([empty], NOW), 0);
});

test("maîtrise : jamais « maîtrisé » sur la seule base du QCM", () => {
  const e = mkEntry({ headword: "cat", tr: ["chat"] });
  const rec = mkCard(e.id, "recognition");
  const recall = mkCard(e.id, "recall");
  const cards = [rec, recall];
  const states = new Map<string, ReviewState>();
  assert.equal(masteryOf(e.id, cards, states), "new");

  const train = (id: string, times: number) => {
    let s = newReviewState(id, NOW);
    let t = NOW;
    for (let i = 0; i < times; i++) {
      s = schedule(s, "easy", t);
      t = s.due + 1000;
    }
    return s;
  };
  states.set(rec.id, schedule(newReviewState(rec.id, NOW), "good", NOW));
  assert.equal(masteryOf(e.id, cards, states), "learning");
  states.set(rec.id, train(rec.id, 8));
  assert.ok(states.get(rec.id)!.interval >= 21);
  assert.equal(masteryOf(e.id, cards, states), "recognized");
  states.set(recall.id, train(recall.id, 8));
  assert.equal(masteryOf(e.id, cards, states), "mastered");
  // un oubli sur le rappel écrit annule la maîtrise
  states.set(recall.id, schedule(states.get(recall.id)!, "again", NOW));
  assert.equal(masteryOf(e.id, cards, states), "recognized");
});

test("totaux, taux et formats", () => {
  const log = [mk("2026-10-18", "en", 600, 10, 8), mk("2026-10-18", "ja", 300, 4, 1)];
  assert.equal(totals(log).answers, 14);
  assert.equal(totals(log, "ja").correct, 1);
  assert.equal(secondsToday(log, "en", NOW), 600);
  assert.equal(secondsToday(log, "en", NOW + 86400_000), 0);
  assert.equal(pct(8, 10), "80 %");
  assert.equal(pct(0, 0), "—");
  const week = lastDaysMinutes(log, NOW);
  assert.equal(week.length, 7);
  assert.equal(week[6].date, "2026-10-18");
  assert.equal(week[6].minutes, 15);
  assert.equal(week[0].date, "2026-10-12");
});

test("révisions dues : cartes suspendues et entrées absentes exclues", () => {
  const e = mkEntry({ headword: "cat", tr: ["chat"] });
  const c1 = mkCard(e.id, "recognition");
  const c2 = mkCard(e.id, "recall");
  const past = NOW - 5 * 86400_000;
  const states = new Map<string, ReviewState>([
    [c1.id, schedule(newReviewState(c1.id, past), "good", past)],
    [c2.id, schedule(newReviewState(c2.id, past), "good", past)],
  ]);
  assert.equal(dueCount([c1, c2], states, new Set([e.id]), "en", NOW), 2);
  c2.suspended = true;
  assert.equal(dueCount([c1, c2], states, new Set([e.id]), "en", NOW), 1);
  assert.equal(dueCount([c1, c2], states, new Set(), "en", NOW), 0);
  assert.equal(dueCount([c1, c2], states, new Set([e.id]), "ja", NOW), 0);
});

test("thèmes d'exercices triés du plus faible au plus fort", () => {
  const t = exerciseTopics(
    [
      { exerciseId: "a", lang: "en", topic: "Fort", level: "B1", tries: 4, correct: 4, lastAt: 1, lastCorrect: true },
      { exerciseId: "b", lang: "en", topic: "Faible", level: "B1", tries: 4, correct: 1, lastAt: 1, lastCorrect: false },
    ],
    "en",
  );
  assert.deepEqual(t.map((x) => x.topic), ["Faible", "Fort"]);
});
