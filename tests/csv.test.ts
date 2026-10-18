import test from "node:test";
import assert from "node:assert/strict";
import { parseCSV, csvToWords, jsonToWords, wordsToEntries, parsePos } from "../src/lib/csv";

test("CSV : guillemets, virgules internes, séparateur « ; », BOM, lignes vides", () => {
  const rows = parseCSV('﻿mot,traduction\n"hello, world","bonjour, monde"\n\n"say ""hi""","dire ""salut"""\n');
  assert.deepEqual(rows, [["mot", "traduction"], ["hello, world", "bonjour, monde"], ['say "hi"', 'dire "salut"']]);
  assert.deepEqual(parseCSV("a;b\r\n1;2\r\n"), [["a", "b"], ["1", "2"]]);
  assert.deepEqual(parseCSV("a\tb\n1\t2"), [["a", "b"], ["1", "2"]]);
});

test("CSV → entrées", () => {
  const csv = "mot,lecture,traduction,categorie,exemple,traduction_exemple\n食べる,たべる,manger;se nourrir,verbe,毎日食べます。,Je mange tous les jours.\nreluctant,,réticent,adjectif,,\n,,,,,\n";
  const { words, error } = csvToWords(csv);
  assert.equal(error, undefined);
  assert.equal(words.length, 2);
  assert.deepEqual(words[0].translations, ["manger", "se nourrir"]);
  const entries = wordsToEntries(words, "ja", 1);
  assert.equal(entries[0].reading, "たべる");
  assert.equal(entries[0].senses[0].pos, "verb");
  assert.equal(entries[0].senses[0].examples[0].translation, "Je mange tous les jours.");
  assert.equal(entries[1].senses[0].pos, "adjective");
  assert.equal(entries[1].senses[0].examples.length, 0);
  assert.ok(entries.every((e) => e.source.kind === "import"));
});

test("CSV : erreurs lisibles", () => {
  assert.match(csvToWords("juste une ligne").error!, /en-têtes/);
  assert.match(csvToWords("a,b\n1,2").error!, /mot/);
});

test("JSON : tableau ou { words }", () => {
  const a = jsonToWords([{ word: "cat", translation: "chat; félin", pos: "noun" }, { mot: "dog", translations: ["chien"] }, 42, { nope: 1 }]);
  assert.equal(a.words.length, 2);
  assert.deepEqual(a.words[0].translations, ["chat", "félin"]);
  assert.equal(jsonToWords({ words: [{ word: "x" }] }).words.length, 1);
  assert.ok(jsonToWords({ autre: 1 }).error);
});

test("catégories grammaticales : noms français, anglais, abréviations", () => {
  assert.equal(parsePos("Verbe"), "verb");
  assert.equal(parsePos("adj"), "adjective");
  assert.equal(parsePos("particule"), "particle");
  assert.equal(parsePos("n"), "noun");
  assert.equal(parsePos("zzz"), "other");
  assert.equal(parsePos(undefined), "other");
});
