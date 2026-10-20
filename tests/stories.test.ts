import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_STORIES, STORY_LEVELS, findGloss, glossInText, readingMinutes, storiesFor, storyById, storySize } from "../src/lib/stories";

test("10 histoires par langue, 2 par niveau, identifiants uniques", () => {
  for (const lang of ["en", "ja"] as const) {
    assert.equal(storiesFor(lang).length, 10);
    for (const lv of STORY_LEVELS[lang]) assert.equal(storiesFor(lang, lv).length, 2, `${lang} ${lv}`);
  }
  const ids = new Set(ALL_STORIES.map((s) => s.id));
  assert.equal(ids.size, ALL_STORIES.length);
});

test("champs obligatoires et niveau cohérent avec la langue", () => {
  for (const s of ALL_STORIES) {
    assert.ok(s.title && s.titleFr && s.theme && s.summary, s.id);
    assert.ok(STORY_LEVELS[s.lang].includes(s.level), s.id);
    assert.ok(s.id.startsWith(`${s.lang}-${s.level.toLowerCase()}-`), s.id);
    assert.ok(s.text.length >= 3 && s.text.every((p) => p.trim().length > 0), s.id);
    assert.equal(s.words.length, 8, s.id);
    // pas d'écriture japonaise dans l'anglais, et inversement
    const body = s.text.join("");
    if (s.lang === "en") assert.ok(!/[぀-ヿ一-鿿]/.test(body), s.id);
    else assert.ok(/[぀-ヿ]/.test(body), s.id);
  }
});

test("chaque mot utile se trouve vraiment dans le texte, avec traduction (et lecture en japonais)", () => {
  for (const s of ALL_STORIES)
    for (const g of s.words) {
      assert.ok(glossInText(s, g), `${s.id} : « ${g.w} » absent du texte`);
      assert.ok(g.fr.trim(), `${s.id} : ${g.w} sans traduction`);
      if (s.lang === "ja") assert.ok(g.reading && /^[぀-ヿー]+$/.test(g.reading), `${s.id} : lecture de ${g.w}`);
      if (g.lemma) assert.ok(g.lemmaReading, `${s.id} : lecture de ${g.lemma}`);
    }
});

test("durée de lecture : jamais plus de 15 minutes, du plus court au plus long selon le niveau", () => {
  for (const s of ALL_STORIES) {
    const m = readingMinutes(s);
    assert.ok(m >= 1 && m <= 15, `${s.id} : ${m} min`);
  }
  for (const lang of ["en", "ja"] as const) {
    const avg = (lv: string) => {
      const l = storiesFor(lang).filter((s) => s.level === lv);
      return l.reduce((n, s) => n + storySize(s), 0) / l.length;
    };
    const lv = STORY_LEVELS[lang];
    assert.ok(avg(lv[0]) < avg(lv[2]) && avg(lv[2]) < avg(lv[4]), `${lang} : la longueur doit croître avec le niveau`);
  }
});

test("storySize compte les mots anglais et les caractères japonais", () => {
  assert.equal(storySize({ lang: "en", text: ["Hello, world! It's fine."] }), 4);
  assert.equal(storySize({ lang: "ja", text: ["今日は、いい天気です。"] }), 9);
});

test("findGloss : forme exacte, pluriel et formes en -ed / -ing", () => {
  const words = [
    { w: "wake", fr: "x" },
    { w: "hesitate", fr: "y" },
    { w: "story", fr: "z" },
    { w: "jump", fr: "j" },
  ];
  assert.equal(findGloss(words, "Wakes", "en")?.w, "wake");
  assert.equal(findGloss(words, "hesitated", "en")?.w, "hesitate");
  assert.equal(findGloss(words, "stories", "en")?.w, "story");
  assert.equal(findGloss(words, "jumping", "en")?.w, "jump");
  assert.equal(findGloss(words, "banana", "en"), undefined);
  assert.equal(findGloss([{ w: "駅", fr: "gare" }], "駅", "ja")?.fr, "gare");
  assert.equal(findGloss([{ w: "駅", fr: "gare" }], "駅前", "ja"), undefined);
});

test("storyById", () => {
  assert.equal(storyById("en-a1-mia-cat")?.title, "Mia's Cat");
  assert.equal(storyById("nope"), undefined);
});
