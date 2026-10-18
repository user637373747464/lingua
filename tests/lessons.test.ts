import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_LESSONS, lessonsFor, richParts } from "../src/lib/lessons";
import { IRREGULAR_VERBS } from "../src/lib/content/irregular-verbs";

test("leçons : identifiants uniques, champs remplis, blocs non vides", () => {
  const ids = new Set<string>();
  for (const l of ALL_LESSONS) {
    assert.ok(!ids.has(l.id), `id en double : ${l.id}`);
    ids.add(l.id);
    assert.ok(l.title && l.summary && l.topic && l.level, l.id);
    assert.ok(l.id.startsWith(l.lang + "-"), `préfixe de langue : ${l.id}`);
    assert.ok(l.blocks.length > 0, l.id);
    for (const b of l.blocks) {
      if (b.t === "table") {
        assert.ok(b.rows.length > 0, `${l.id} : tableau vide`);
        for (const r of b.rows) assert.equal(r.length, b.head.length, `${l.id} : ligne de ${r.length} colonnes pour ${b.head.length} en-têtes (${r[0]})`);
      }
      if (b.t === "ex") for (const e of b.items) assert.ok(e.text && e.tr, l.id);
      if (b.t === "list") assert.ok(b.items.length > 0, l.id);
    }
  }
});

test("leçons : les deux langues ont des fiches", () => {
  assert.ok(lessonsFor("en").length >= 15);
  assert.ok(lessonsFor("ja").length >= 12);
});

test("verbes irréguliers : pas de doublon, 4 colonnes remplies, tri alphabétique", () => {
  const seen = new Set<string>();
  let prev = "";
  for (const r of IRREGULAR_VERBS) {
    assert.equal(r.length, 4);
    assert.ok(r.every((c) => c.trim()), r[0]);
    assert.ok(!seen.has(r[0]), `doublon ${r[0]}`);
    seen.add(r[0]);
    assert.ok(r[0] >= prev, `ordre : ${prev} avant ${r[0]}`);
    prev = r[0];
  }
  assert.ok(IRREGULAR_VERBS.length >= 100);
});

test("richParts : gras", () => {
  assert.deepEqual(richParts("un **mot** ici"), [
    { text: "un ", bold: false },
    { text: "mot", bold: true },
    { text: " ici", bold: false },
  ]);
});
