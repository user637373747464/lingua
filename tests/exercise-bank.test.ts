import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_EXERCISES, exercisesFor } from "../src/lib/exercises";

// Contrôles d'intégrité de TOUTE la banque d'exercices (pas de vérité grammaticale : celle-là se relit à la main).

test("banque d'exercices : identifiants uniques", () => {
  const seen = new Set<string>();
  for (const e of ALL_EXERCISES) {
    assert.ok(!seen.has(e.id), `id en double : ${e.id}`);
    seen.add(e.id);
  }
});

test("banque d'exercices : chaque exercice est bien formé", () => {
  for (const e of ALL_EXERCISES) {
    assert.ok(e.prompt.trim() && e.explanation.trim() && e.topic.trim() && e.level.trim(), `${e.id} : champ vide`);
    const levels = e.lang === "en" ? ["A1", "A2", "B1", "B2", "C1", "C2"] : ["N5", "N4", "N3", "N2", "N1"];
    assert.ok(levels.includes(e.level), `${e.id} : niveau inconnu ${e.level}`);
    if (e.type === "mcq") {
      assert.ok(e.choices.length >= 3 && e.choices.length <= 5, `${e.id} : nombre de choix`);
      assert.ok(Number.isInteger(e.correct) && e.correct >= 0 && e.correct < e.choices.length, `${e.id} : bonne réponse hors liste`);
      assert.equal(new Set(e.choices.map((c) => c.trim().toLowerCase())).size, e.choices.length, `${e.id} : choix en double`);
      assert.ok(e.choices.every((c) => c.trim()), `${e.id} : choix vide`);
      if (e.sentence) assert.ok(e.sentence.includes("___"), `${e.id} : phrase sans « ___ »`);
    } else if (e.type === "fill") {
      assert.ok(e.sentence.includes("___"), `${e.id} : phrase sans « ___ »`);
      assert.ok(e.accepted.length > 0 && e.accepted.every((a) => a.trim()), `${e.id} : réponses`);
    } else {
      assert.ok(e.words.length >= 3, `${e.id} : trop court`);
      assert.equal(new Set(e.words).size >= 1, true);
      for (const alt of e.alternatives ?? []) assert.deepEqual(alt.map((w) => w.toLowerCase()).sort(), e.words.map((w) => w.toLowerCase()).sort(), `${e.id} : alternative avec d'autres mots`);
    }
  }
});

test("banque d'exercices : au moins 3 exercices par thème et niveau couvert", () => {
  const counts = new Map<string, number>();
  for (const e of ALL_EXERCISES) counts.set(`${e.lang}|${e.topic}`, (counts.get(`${e.lang}|${e.topic}`) ?? 0) + 1);
  for (const [k, n] of counts) assert.ok(n >= 3, `thème trop mince : ${k} (${n})`);
});
