import test from "node:test";
import assert from "node:assert/strict";
import { romajiToHiragana, toHiragana, isKana, hasKanji } from "../src/lib/japanese";

test("romaji → hiragana : mots courants", () => {
  assert.equal(romajiToHiragana("taberu"), "たべる");
  assert.equal(romajiToHiragana("nomu"), "のむ");
  assert.equal(romajiToHiragana("gakkou"), "がっこう");
  assert.equal(romajiToHiragana("sensei"), "せんせい");
  assert.equal(romajiToHiragana("tomodachi"), "ともだち");
  assert.equal(romajiToHiragana("shinbun"), "しんぶん");
  assert.equal(romajiToHiragana("konnichiha"), "こんにちは");
  assert.equal(romajiToHiragana("kyou"), "きょう");
  assert.equal(romajiToHiragana("ryokou"), "りょこう");
  assert.equal(romajiToHiragana("onegaishimasu"), "おねがいします");
  assert.equal(romajiToHiragana("matcha"), "まっちゃ");
  assert.equal(romajiToHiragana("kitte"), "きって");
  assert.equal(romajiToHiragana("ben'i"), "べんい");
  assert.equal(romajiToHiragana("arigatou"), "ありがとう");
});

test("katakana → hiragana, détection kana / kanji", () => {
  assert.equal(toHiragana("コーヒー"), "こーひー");
  assert.equal(toHiragana("ガッコウ"), "がっこう");
  assert.ok(isKana("たべる"));
  assert.ok(isKana("コーヒー"));
  assert.ok(!isKana("食べる"));
  assert.ok(hasKanji("食べる"));
  assert.ok(!hasKanji("たべる"));
});
