import test from "node:test";
import assert from "node:assert/strict";
import { buildLookup, englishBaseForms, sentenceAt, splitParagraphs, tokenize } from "../src/lib/reader";
import { mkEntry, mkSnapshot } from "./helpers";
import { createBackup, mergeSnapshots, parseBackup } from "../src/lib/backup";
import { TextItem } from "../src/lib/types";

const words = (text: string, lang: "en" | "ja", entries = [] as ReturnType<typeof mkEntry>[]) =>
  tokenize(text, lang, buildLookup(entries, lang)).filter((t) => t.word);

test("anglais : mots, apostrophes et traits d'union restent entiers", () => {
  const t = words("It's a well-known fact, isn't it?", "en").map((x) => x.text);
  assert.deepEqual(t, ["It's", "a", "well-known", "fact", "isn't", "it"]);
});

test("anglais : les formes fléchies retrouvent le mot du dictionnaire", () => {
  const e = [mkEntry({ headword: "reluctant" }), mkEntry({ headword: "stop", pos: "verb" }), mkEntry({ headword: "city" })];
  const t = words("She stopped, reluctantly, in two cities. Stops.", "en", e);
  const found = Object.fromEntries(t.filter((x) => x.match).map((x) => [x.text, x.match!.entry.headword]));
  assert.equal(found["stopped"], "stop");
  assert.equal(found["reluctantly"], "reluctant");
  assert.equal(found["cities"], "city");
  assert.equal(found["Stops"], "stop");
  assert.equal(found["She"], undefined);
  assert.ok(englishBaseForms("running").includes("run"));
  assert.ok(englishBaseForms("making").includes("make"));
});

test("anglais : une expression de plusieurs mots est reconnue d'un bloc", () => {
  const e = [mkEntry({ headword: "put off", pos: "verb" })];
  const t = words("Don't put off your homework.", "en", e);
  const hit = t.find((x) => x.match);
  assert.equal(hit?.text, "put off");
  assert.equal(t.filter((x) => x.text === "off").length, 0);
});

test("anglais : accents et majuscules sont ignorés", () => {
  const e = [mkEntry({ headword: "café" })];
  assert.equal(words("Un CAFE, please", "en", e).filter((x) => x.match).length, 1);
});

test("japonais : le découpage produit des mots", () => {
  const t = words("私は毎日ご飯を食べます。", "ja").map((x) => x.text);
  assert.ok(t.includes("毎日") && t.includes("ご飯"), t.join("|"));
});

test("japonais : un verbe conjugué est reconnu et fusionné en un seul mot", () => {
  const e = [mkEntry({ lang: "ja", headword: "食べる", reading: "たべる", pos: "verb" }), mkEntry({ lang: "ja", headword: "飲む", reading: "のむ", pos: "verb" })];
  const t = words("毎日ご飯を食べました。水を飲んだ。", "ja", e);
  const eat = t.find((x) => x.match?.entry.headword === "食べる");
  assert.ok(eat, "食べました non reconnu");
  assert.equal(eat!.match!.how, "stem");
  assert.ok(eat!.text.startsWith("食べま"));
  assert.ok(t.find((x) => x.match?.entry.headword === "飲む"), "飲んだ non reconnu");
});

test("japonais : la lecture en kana et la forme exacte sont reconnues", () => {
  const e = [mkEntry({ lang: "ja", headword: "学校", reading: "がっこう" })];
  assert.equal(words("学校に行く", "ja", e).find((x) => x.match)?.text, "学校");
  assert.equal(words("がっこうに行く", "ja", e).find((x) => x.match)?.text, "がっこう");
});

test("japonais : pas de faux positif sur des mots en kana (verbes sans kanji)", () => {
  const e = [mkEntry({ lang: "ja", headword: "する", pos: "verb" })];
  assert.equal(words("すたすた歩く", "ja", e).filter((x) => x.match).length, 0);
});

test("langues : un mot japonais n'est pas cherché dans un texte anglais et inversement", () => {
  const e = [mkEntry({ lang: "ja", headword: "犬" })];
  assert.equal(words("犬 dog", "en", e).filter((x) => x.match).length, 0);
});

test("phrase du mot touché", () => {
  const text = "First one. The cat sat down! Another sentence here.";
  const i = text.indexOf("cat");
  assert.equal(sentenceAt(text, i, i + 3), "The cat sat down!");
  const ja = "今日は雨です。私は学校に行きます。明日は晴れ。";
  const j = ja.indexOf("学校");
  assert.equal(sentenceAt(ja, j, j + 2), "私は学校に行きます。");
  assert.ok(sentenceAt("x".repeat(1000), 500, 501, 100).length <= 103);
});

test("paragraphes : lignes vides ignorées, positions conservées", () => {
  const p = splitParagraphs("Un\n\nDeux\r\nTrois");
  assert.deepEqual(p.map((x) => x.text), ["Un", "Deux", "Trois"]);
  assert.equal("Un\n\nDeux\r\nTrois".slice(p[1].offset, p[1].offset + 4), "Deux");
});

// ---------- sauvegarde des textes ----------

const item = (id: string, over: Partial<TextItem> = {}): TextItem => ({ id, lang: "en", kind: "article", title: "T " + id, body: "Hello world", createdAt: 1, updatedAt: 1, ...over });

test("sauvegarde : les textes font l'aller-retour", () => {
  const snap = { ...mkSnapshot([]), texts: [item("a", { url: "https://example.com" }), item("b", { kind: "podcast", body: undefined })] };
  const r = parseBackup(JSON.stringify(createBackup(snap, 5)));
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(JSON.parse(JSON.stringify(r.snapshot.texts)), JSON.parse(JSON.stringify(snap.texts)));
});

test("sauvegarde : une ancienne sauvegarde sans textes reste lisible", () => {
  const file = JSON.parse(JSON.stringify(createBackup(mkSnapshot([]), 5)));
  delete file.data.texts;
  delete file.counts.texts;
  const r = parseBackup(JSON.stringify(file));
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.snapshot.texts, []);
});

test("sauvegarde : un texte invalide est refusé", () => {
  for (const bad of [{ kind: "video" }, { title: 5 }, { body: "x".repeat(200_001) }, { lang: "fr" }]) {
    const snap = { ...mkSnapshot([]), texts: [{ ...item("a"), ...bad } as unknown as TextItem] };
    assert.equal(parseBackup(JSON.stringify(createBackup(snap, 5))).ok, false, JSON.stringify(bad).slice(0, 30));
  }
});

test("fusion : textes sans doublon, le plus récent gagne", () => {
  const a = { ...mkSnapshot([]), texts: [item("1", { title: "ancien", updatedAt: 1 }), item("2")] };
  const b = { ...mkSnapshot([]), texts: [item("1", { title: "récent", updatedAt: 9 }), item("3")] };
  const { snapshot } = mergeSnapshots(a, b);
  assert.equal(snapshot.texts.length, 3);
  assert.equal(snapshot.texts.find((t) => t.id === "1")!.title, "récent");
  assert.equal(mergeSnapshots(snapshot, b).snapshot.texts.length, 3);
});
