import test from "node:test";
import assert from "node:assert/strict";
import { checkAnswer, makeHint, normalizeLatin, levenshtein } from "../src/lib/answers";

test("anglais : casse, ponctuation et « to » facultatifs", () => {
  assert.equal(checkAnswer("Reluctant", ["reluctant"], "en").result, "correct");
  assert.equal(checkAnswer("  give   up. ", ["give up"], "en").result, "correct");
  assert.equal(checkAnswer("to give up", ["give up"], "en").result, "correct");
  assert.equal(checkAnswer("give up", ["to give up"], "en").result, "correct");
  assert.equal(checkAnswer("the outcome", ["outcome"], "en").result, "correct");
});

test("anglais : les accents et apostrophes typographiques ne comptent pas", () => {
  assert.equal(checkAnswer("etre", ["être"], "en").result, "correct");
  assert.equal(checkAnswer("it’s", ["it's"], "en").result, "correct");
});

test("anglais : une lettre de travers sur un mot long = « presque » (pas juste)", () => {
  assert.equal(checkAnswer("recieve", ["receive"], "en").result, "wrong"); // transposition = 2 modifications
  assert.equal(checkAnswer("reluctnt", ["reluctant"], "en").result, "almost");
  assert.equal(checkAnswer("cat", ["cut"], "en").result, "wrong", "mots courts : pas de tolérance");
  assert.equal(checkAnswer("", ["cat"], "en").result, "wrong");
});

test("japonais : katakana = hiragana, romaji accepté, kanji ou lecture", () => {
  const accepted = ["食べる", "たべる"];
  assert.equal(checkAnswer("食べる", accepted, "ja").result, "correct");
  assert.equal(checkAnswer("たべる", accepted, "ja").result, "correct");
  assert.equal(checkAnswer("タベル", accepted, "ja").result, "correct");
  assert.equal(checkAnswer("taberu", accepted, "ja").result, "correct");
  assert.equal(checkAnswer("TABERU", accepted, "ja").result, "correct");
  assert.equal(checkAnswer("のむ", accepted, "ja").result, "wrong");
  assert.equal(checkAnswer("たべます", accepted, "ja").result, "wrong");
  assert.equal(checkAnswer("たべる ", accepted, "ja").result, "correct");
});

test("japonais : les dakuten comptent (か ≠ が)", () => {
  assert.equal(checkAnswer("かっこう", ["がっこう"], "ja").result, "wrong");
  assert.equal(checkAnswer("gakkou", ["学校", "がっこう"], "ja").result, "correct");
});

test("carte libre d'un japonais avec réponse en français : mode latin", () => {
  assert.equal(checkAnswer("Bonjour", ["bonjour"], "ja").result, "correct");
});

test("indice : ne révèle pas toute la réponse", () => {
  assert.equal(makeHint("reluctant", "en"), "r________ (9 lettres)");
  assert.equal(makeHint("give up", "en"), "g___ __ (6 lettres)");
  assert.equal(makeHint("たべる", "ja"), "た… (3 caractères)");
  assert.notEqual(makeHint("a", "en"), "a");
});

test("distance de Levenshtein et normalisation", () => {
  assert.equal(levenshtein("kitten", "sitting"), 3);
  assert.equal(levenshtein("", "abc"), 3);
  assert.equal(normalizeLatin("  The  Dog! "), "dog");
});
