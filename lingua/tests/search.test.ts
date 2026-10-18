import test from "node:test";
import assert from "node:assert/strict";
import { searchEntries, findDuplicate, normalizeForSearch } from "../src/lib/search";
import { mkEntry } from "./helpers";

const cat = mkEntry({ headword: "cat", tr: ["chat"], ex: ["The cat sleeps.", "Le chat dort."] });
const reluctant = mkEntry({ headword: "Reluctant", tr: ["réticent"], pos: "adjective" });
const taberu = mkEntry({ lang: "ja", headword: "食べる", reading: "たべる", tr: ["manger"], pos: "verb", inflections: ["食べます"] });
const koohii = mkEntry({ lang: "ja", headword: "コーヒー", reading: "コーヒー", tr: ["café"] });
const all = [cat, reluctant, taberu, koohii];

test("anglais : insensible à la casse, trouve par traduction française (sans accent)", () => {
  assert.deepEqual(searchEntries(all, "RELUCTANT", { lang: "en" }).map((e) => e.id), [reluctant.id]);
  assert.deepEqual(searchEntries(all, "reticent", { lang: "en" }).map((e) => e.id), [reluctant.id]);
  assert.deepEqual(searchEntries(all, "chat", { lang: "en" }).map((e) => e.id), [cat.id]);
});

test("japonais : par kanji, par lecture, par romaji, par forme conjuguée, par sens", () => {
  for (const q of ["食べる", "たべる", "タベル", "taberu", "食べます", "manger"]) {
    assert.deepEqual(searchEntries(all, q, { lang: "ja" }).map((e) => e.id), [taberu.id], q);
  }
  assert.deepEqual(searchEntries(all, "こーひー", { lang: "ja" }).map((e) => e.id), [koohii.id]);
  assert.deepEqual(searchEntries(all, "koohii", { lang: "ja" }).map((e) => e.id), []); // « kōhī » s'écrit koohii seulement si on tape oo : pas de magie
  assert.deepEqual(searchEntries(all, "ko-hi-", { lang: "ja" }).map((e) => e.id), [koohii.id]);
});

test("filtre par langue et par catégorie, requête vide = tout", () => {
  assert.equal(searchEntries(all, "", { lang: "en" }).length, 2);
  assert.equal(searchEntries(all, "", { lang: "ja" }).length, 2);
  assert.deepEqual(searchEntries(all, "", { lang: "en", pos: "adjective" }).map((e) => e.id), [reluctant.id]);
});

test("classement : le mot exact passe avant la simple mention dans un exemple", () => {
  const dog = mkEntry({ headword: "dog", tr: ["chien"] });
  const bark = mkEntry({ headword: "bark", tr: ["aboyer"], ex: ["The dog likes to bark.", "Le chien aime aboyer."] });
  assert.deepEqual(searchEntries([bark, dog], "dog", { lang: "en" }).map((e) => e.id), [dog.id, bark.id]);
});

test("doublons : même mot, casse différente → doublon ; homographes japonais de lecture différente → pas doublon", () => {
  assert.ok(findDuplicate(all, "en", "reluctant"));
  assert.ok(findDuplicate(all, "en", "CAT"));
  assert.equal(findDuplicate(all, "en", "cat", undefined, cat.id), undefined, "on s'exclut soi-même");
  assert.equal(findDuplicate(all, "ja", "cat"), undefined, "autre langue");
  assert.ok(findDuplicate(all, "ja", "たべる"));
  const kata = mkEntry({ lang: "ja", headword: "方", reading: "かた", tr: ["personne (poli)"] });
  assert.equal(findDuplicate([kata], "ja", "方", "ほう"), undefined);
  assert.ok(findDuplicate([kata], "ja", "方", "かた"));
  assert.ok(findDuplicate([kata], "ja", "方"), "sans lecture : on signale quand même");
});

test("normalisation", () => {
  assert.equal(normalizeForSearch("  Été  "), "ete");
  assert.equal(normalizeForSearch("ガッコウ"), "がっこう");
  assert.equal(normalizeForSearch("が"), "が", "les dakuten sont conservés");
});
