import { test } from "node:test";
import assert from "node:assert/strict";
import { LEVELS, SOURCES, THEMES, pickSources, SourceKind } from "../src/lib/content/sources";

test("chaque langue, type et niveau a au moins 5 sources", () => {
  for (const lang of ["en", "ja"] as const)
    for (const kind of ["article", "podcast", "video"] as SourceKind[])
      for (const lv of LEVELS) {
        const n = pickSources(lang, kind, lv.id).length;
        assert.ok(n >= 5, `${lang}/${kind}/${lv.id} : ${n} source(s)`);
      }
});

test("identifiants uniques, liens https valides, thèmes connus", () => {
  const ids = new Set<string>();
  for (const s of SOURCES) {
    assert.ok(!ids.has(s.id), `doublon ${s.id}`);
    ids.add(s.id);
    assert.ok(s.url.startsWith("https://") && !/\s/.test(s.url), `lien invalide ${s.id}`);
    assert.ok(new URL(s.url).hostname.includes("."), s.id);
    assert.ok(s.theme in THEMES, s.id);
    assert.ok(s.levels.length > 0 && s.name && s.description, s.id);
  }
});

test("pickSources filtre par niveau et thème", () => {
  const all = pickSources("en", "article");
  const sci = pickSources("en", "article", "all", "science");
  assert.ok(sci.length > 0 && sci.length < all.length);
  assert.ok(sci.every((s) => s.theme === "science"));
  assert.ok(pickSources("ja", ["podcast", "video"]).every((s) => s.lang === "ja"));
});
