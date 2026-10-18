import test from "node:test";
import assert from "node:assert/strict";
import { ALL_EXERCISES, checkExercise, exercisesFor, pickSeries, topicsFor, levelsFor, topicHistory, expectedAnswerText, shuffledTokens } from "../src/lib/exercises";
import { seeded } from "./helpers";
import { ExerciseStat } from "../src/lib/types";

test("banque d'exercices : identifiants uniques, contenus complets et cohérents", () => {
  const ids = new Set<string>();
  for (const ex of ALL_EXERCISES) {
    assert.ok(!ids.has(ex.id), `id en double : ${ex.id}`);
    ids.add(ex.id);
    assert.ok(ex.id.startsWith(ex.lang + "-"), ex.id);
    assert.ok(ex.prompt.trim() && ex.explanation.trim() && ex.topic.trim() && ex.level.trim(), ex.id);
    if (ex.type === "mcq") {
      assert.ok(ex.choices.length >= 3 && ex.correct >= 0 && ex.correct < ex.choices.length, ex.id);
      assert.equal(new Set(ex.choices).size, ex.choices.length, `choix en double : ${ex.id}`);
      if (ex.sentence) assert.ok(ex.sentence.includes("___"), `phrase sans trou : ${ex.id}`);
    }
    if (ex.type === "fill") {
      assert.ok(ex.sentence.includes("___") || ex.sentence.includes("→"), ex.id);
      assert.ok(ex.accepted.length > 0, ex.id);
    }
    if (ex.type === "order") {
      assert.ok(ex.words.length >= 3, ex.id);
      for (const alt of ex.alternatives ?? []) {
        assert.equal(alt.length, ex.words.length, `alternative de longueur différente : ${ex.id}`);
        assert.deepEqual([...alt].map((w) => w.toLowerCase()).sort(), [...ex.words].map((w) => w.toLowerCase()).sort(), `mots différents : ${ex.id}`);
      }
    }
  }
  for (const lang of ["en", "ja"] as const) {
    assert.ok(exercisesFor(lang).length >= 30, `${lang}: assez d'exercices`);
    assert.ok(topicsFor(lang).length >= 4);
    assert.ok(levelsFor(lang).length >= 3);
  }
});

test("la réponse attendue est toujours jugée correcte, une mauvaise réponse jamais", () => {
  for (const ex of ALL_EXERCISES) {
    if (ex.type === "mcq") {
      assert.ok(checkExercise(ex, ex.correct).correct, ex.id);
      assert.ok(!checkExercise(ex, (ex.correct + 1) % ex.choices.length).correct, ex.id);
    } else if (ex.type === "fill") {
      for (const a of ex.accepted) assert.ok(checkExercise(ex, a).correct, `${ex.id} « ${a} »`);
      assert.ok(!checkExercise(ex, "zzz").correct);
    } else {
      assert.ok(checkExercise(ex, ex.words).correct, ex.id);
      for (const alt of ex.alternatives ?? []) assert.ok(checkExercise(ex, alt).correct, ex.id);
      const reversed = [...ex.words].reverse();
      assert.ok(!checkExercise(ex, reversed).correct, ex.id);
      assert.ok(expectedAnswerText(ex).length > 0);
    }
  }
});

test("exercice à trous : « presque » n'est pas compté juste", () => {
  const ex = ALL_EXERCISES.find((e) => e.id === "en-tense-02")!;
  const r = checkExercise(ex, "have livd");
  assert.equal(r.correct, false);
  assert.equal(r.almost, true);
  assert.ok(checkExercise(ex, "Have Lived").correct);
});

test("japonais : romaji accepté dans les exercices à trous en kana", () => {
  const ex = ALL_EXERCISES.find((e) => e.id === "ja-part-07")!;
  assert.ok(checkExercise(ex, "ni").correct);
  assert.ok(checkExercise(ex, "に").correct);
  assert.ok(!checkExercise(ex, "で").correct);
});

test("série : pas de doublon, priorité aux exercices jamais faits ou ratés", () => {
  const pool = exercisesFor("en");
  const stats: ExerciseStat[] = pool.slice(0, 20).map((e) => ({ exerciseId: e.id, lang: "en", topic: e.topic, level: e.level, tries: 3, correct: 3, lastAt: 1, lastCorrect: true }));
  stats[0] = { ...stats[0], lastCorrect: false, correct: 1 };
  let failedFirst = 0;
  let untriedPicked = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const s = pickSeries(pool, stats, 10, seeded(seed));
    assert.equal(s.length, 10);
    assert.equal(new Set(s.map((e) => e.id)).size, 10);
    if (s.some((e) => e.id === pool[0].id)) failedFirst++;
    untriedPicked += s.filter((e) => !stats.find((x) => x.exerciseId === e.id)).length;
  }
  assert.ok(failedFirst > 70, `l'exercice raté revient souvent (${failedFirst}/200)`);
  assert.ok(untriedPicked / 200 > 4, `${untriedPicked / 200} jamais faits par série en moyenne`);
  assert.equal(pickSeries(pool.slice(0, 3), [], 10).length, 3);
});

test("historique par thème", () => {
  const stats: ExerciseStat[] = [
    { exerciseId: "a", lang: "en", topic: "Prépositions", level: "B1", tries: 4, correct: 1, lastAt: 1, lastCorrect: false },
    { exerciseId: "b", lang: "en", topic: "Prépositions", level: "B1", tries: 1, correct: 1, lastAt: 1, lastCorrect: true },
    { exerciseId: "c", lang: "ja", topic: "Prépositions", level: "N5", tries: 9, correct: 0, lastAt: 1, lastCorrect: false },
  ];
  assert.deepEqual(topicHistory(stats, "en", "Prépositions"), { tries: 5, wrong: 3 });
});

test("mélange des mots : jamais l'ordre de la solution", () => {
  const words = ["a", "b", "c", "d"];
  for (let seed = 1; seed < 50; seed++) assert.notDeepEqual(shuffledTokens(words, seeded(seed)), words);
});
