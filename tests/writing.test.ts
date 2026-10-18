import { test } from "node:test";
import assert from "node:assert/strict";
import { GLYPHS, KANA_HIRAGANA_BASE, KANA_HIRAGANA_EXTRA, KANA_KATAKANA_BASE, KANA_KATAKANA_EXTRA, KANJI_N5_LIST } from "../src/lib/content/strokes";
import { TOLERANCES, evaluate, judge, normalizeStrokes, parsePath, pathLength, resample, sizeIssue } from "../src/lib/writing";
import { handwrite, modelOf } from "./helpers-writing";

const chars = Object.keys(GLYPHS);

test("les données contiennent tous les kana et les 80 kanji", () => {
  for (const set of [KANA_HIRAGANA_BASE, KANA_HIRAGANA_EXTRA, KANA_KATAKANA_BASE, KANA_KATAKANA_EXTRA, KANJI_N5_LIST]) {
    for (const ch of set) assert.ok(GLYPHS[ch], `manque ${ch}`);
  }
  assert.equal([...KANJI_N5_LIST].length, 80);
  for (const ch of chars) {
    const g = GLYPHS[ch];
    assert.ok(g.s.length >= 1);
    assert.equal(g.n.length, g.s.length, `numéros de ${ch}`);
  }
});

test("parsePath : lignes, courbes et chemins relatifs", () => {
  assert.deepEqual(parsePath("M10,20L30,20"), [{ x: 10, y: 20 }, { x: 30, y: 20 }]);
  assert.deepEqual(parsePath("M10,20H30V50"), [{ x: 10, y: 20 }, { x: 30, y: 20 }, { x: 30, y: 50 }]);
  assert.deepEqual(parsePath("m10,20l5,5"), [{ x: 10, y: 20 }, { x: 15, y: 25 }]);
  const c = parsePath("M0,0C0,10 10,10 10,0", 10);
  assert.equal(c.length, 11);
  assert.deepEqual(c[10], { x: 10, y: 0 });
  assert.throws(() => parsePath("M0,0A5,5 0 0 1 10,0"));
});

test("tous les tracés du modèle sont lisibles et non vides", () => {
  for (const ch of chars) for (const d of GLYPHS[ch].s) {
    const p = parsePath(d);
    assert.ok(p.length >= 2, ch);
    assert.ok(p.every((q) => Number.isFinite(q.x) && Number.isFinite(q.y)), ch);
  }
});

test("resample et normalizeStrokes", () => {
  const r = resample([{ x: 0, y: 0 }, { x: 10, y: 0 }], 5);
  assert.deepEqual(r.map((p) => p.x), [0, 2.5, 5, 7.5, 10]);
  assert.equal(resample([{ x: 3, y: 3 }], 4).length, 4);
  const n = normalizeStrokes([[{ x: 100, y: 100 }, { x: 300, y: 200 }]]);
  assert.equal(Math.max(...n[0].map((p) => Math.abs(p.x))), 0.5);
  assert.ok(pathLength(n[0]) > 0);
});

test("le modèle lui-même est toujours accepté, même mis à une autre taille ou ailleurs", () => {
  for (const ch of chars) {
    const m = modelOf(ch);
    assert.ok(evaluate(m, m, TOLERANCES.strict).ok, ch);
    const moved = m.map((s) => s.map((p) => ({ x: p.x * 2.3 + 400, y: p.y * 2.3 - 50 })));
    assert.ok(evaluate(m, moved, TOLERANCES.strict).ok, `${ch} déplacé`);
  }
});

test("un tracé humain simulé est accepté presque toujours (tolérance normale)", () => {
  let pass = 0, tot = 0;
  for (const ch of chars) for (let s = 1; s <= 4; s++) {
    const m = modelOf(ch);
    tot++;
    if (evaluate(m, handwrite(m, s * 7919 + ch.codePointAt(0)!, 1), TOLERANCES.normal).ok) pass++;
  }
  assert.ok(pass / tot >= 0.985, `réussite ${((100 * pass) / tot).toFixed(1)} %`);
});

test("la tolérance large accepte au moins autant que la normale, la stricte au plus autant", () => {
  const count = (tol: typeof TOLERANCES.normal) => {
    let n = 0;
    for (const ch of chars) {
      const m = modelOf(ch);
      if (evaluate(m, handwrite(m, 31 + ch.codePointAt(0)!, 1.5), tol).ok) n++;
    }
    return n;
  };
  assert.ok(count(TOLERANCES.large) >= count(TOLERANCES.normal));
  assert.ok(count(TOLERANCES.normal) >= count(TOLERANCES.strict));
});

test("des caractères qui se ressemblent mais sont différents sont refusés", () => {
  const pairs = ["ソン", "シツ", "ぬめ", "われ", "れね", "いり", "るろ", "人入", "日月", "右左", "ノメ", "ウワ", "スヌ", "コユ", "マム", "はま", "ほは", "さき", "千午", "白百"];
  let accepted = 0, tot = 0;
  for (const p of pairs) {
    const [a, b] = [...p];
    for (const [x, y] of [[a, b], [b, a]]) {
      for (let s = 1; s <= 10; s++) {
        tot++;
        if (evaluate(modelOf(x), handwrite(modelOf(y), s, 1), TOLERANCES.normal).ok) accepted++;
      }
    }
  }
  assert.ok(accepted / tot <= 0.02, `${accepted}/${tot} acceptés à tort`);
});

test("un trait dessiné dans le mauvais sens est détecté", () => {
  for (const ch of ["あ", "日", "ト", "大", "木", "く"]) {
    const m = modelOf(ch);
    for (let k = 0; k < m.length; k++) {
      const u = handwrite(m, 5, 0.6);
      // on ne retourne que les traits assez longs et non symétriques : un trait n'est « à l'envers » que s'il a un sens net
      u[k] = [...u[k]].reverse();
      const ev = evaluate(m, u, TOLERANCES.normal);
      assert.equal(ev.ok, false, `${ch} trait ${k + 1}`);
    }
  }
  const m = modelOf("一");
  const u = handwrite(m, 3, 0.5).map((s) => [...s].reverse());
  const ev = evaluate(m, u);
  assert.equal(ev.strokes[0].status, "reversed");
  assert.match(ev.issues[0], /à l'envers/);
});

test("deux traits échangés : l'ordre est signalé avec le bon numéro", () => {
  const m = modelOf("十"); // 一 puis 丨
  const u = handwrite(m, 9, 0.5);
  const swapped = [u[1], u[0]];
  const ev = evaluate(m, swapped);
  assert.equal(ev.ok, false);
  assert.deepEqual(ev.strokes.map((s) => s.status), ["order", "order"]);
  assert.equal(ev.strokes[0].shouldBe, 2);
  assert.equal(ev.strokes[1].shouldBe, 1);
  assert.match(ev.issues.join(" "), /ordre/);
});

test("un trait manquant ou en trop est détecté", () => {
  const m = modelOf("日");
  const u = handwrite(m, 4, 0.5);
  const missing = evaluate(m, u.slice(0, 3));
  assert.equal(missing.ok, false);
  assert.deepEqual(missing.missing, [4]);
  assert.match(missing.issues[0], /Il faut 4 traits, tu en as dessiné 3/);

  const extra = evaluate(m, [...u, [{ x: 10, y: 10 }, { x: 20, y: 80 }]]);
  assert.equal(extra.ok, false);
  assert.equal(extra.strokes[4].status, "extra");
  assert.match(extra.issues[0], /en trop/);

  assert.equal(evaluate(m, []).ok, false);
});

test("un dessin vide ou un simple point ne plante pas", () => {
  const m = modelOf("あ");
  assert.equal(evaluate(m, [[{ x: 5, y: 5 }]]).ok, false);
  assert.equal(evaluate(m, [[], []]).ok, false);
});

test("petits kana : la taille compte", () => {
  const cell = 109;
  const shrink = (g: ReturnType<typeof modelOf>, f: number) => g.map((s) => s.map((p) => ({ x: p.x * f, y: p.y * f })));
  const small = modelOf("ゃ");
  const smallDrawn = shrink(handwrite(small, 2, 0.5), 0.8);
  assert.equal(sizeIssue("ゃ", smallDrawn, cell), null);
  // « や » dessiné à la taille normale ne peut pas valider « ゃ »
  const big = modelOf("や");
  assert.ok(judge("や", big, big, TOLERANCES.normal, cell).ok);
  const asSmall = judge("ゃ", small, shrink(big, 1.2), TOLERANCES.normal, cell);
  assert.equal(asSmall.ok, false);
  assert.match(asSmall.issues.join(" "), /petit kana/);
  // l'inverse : un « や » tout petit
  const tiny = judge("や", big, shrink(big, 0.45), TOLERANCES.normal, cell);
  assert.equal(tiny.ok, false);
  assert.match(tiny.issues.join(" "), /taille normale/);
  // les autres caractères ne sont pas soumis à la règle
  assert.equal(sizeIssue("あ", shrink(modelOf("あ"), 0.3), cell), null);
});

test("romaji et sens : tous les caractères ont une consigne", async () => {
  const { promptFor, kanaKind, KANJI_INFO } = await import("../src/lib/content/writing-info");
  for (const ch of chars) assert.ok(promptFor(ch).length > 0, `consigne de ${ch}`);
  assert.equal(Object.keys(KANJI_INFO).length, 80);
  assert.equal(promptFor("あ"), "a");
  assert.equal(promptFor("ア"), "a");
  assert.equal(promptFor("し"), "shi");
  assert.equal(kanaKind("あ"), "hiragana");
  assert.equal(kanaKind("ア"), "katakana");
  assert.equal(kanaKind("日"), null);
});

test("alignTo : le dessin se superpose au modèle", async () => {
  const { alignTo, drawingSpan } = await import("../src/lib/writing");
  const m = modelOf("日");
  const u = handwrite(m, 12, 0.5);
  const a = alignTo(m, u);
  const sp = (s: typeof m) => drawingSpan(s, 1);
  assert.ok(Math.abs(sp(a) - sp(m)) < 1e-6);
  assert.equal(a.length, u.length);
  assert.deepEqual(alignTo(m, []), []);
});

test("quiz d'écriture : tirage sans doublon, les caractères ratés sont favorisés", async () => {
  const { pickWritingQuiz, weakChars } = await import("../src/lib/writing");
  const pool = [...KANA_HIRAGANA_BASE];
  const stats = [
    { char: "あ", kind: "hiragana" as const, tries: 5, correct: 1, lastAt: 1, lastCorrect: false },
    { char: "い", kind: "hiragana" as const, tries: 5, correct: 5, lastAt: 1, lastCorrect: true },
  ];
  assert.deepEqual(weakChars(stats), ["あ"]);
  const pick = pickWritingQuiz(pool, stats, 10, ((s) => () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296))(7));
  assert.equal(pick.length, 10);
  assert.equal(new Set(pick).size, 10);
  assert.ok(pick.every((c) => pool.includes(c)));
  // « あ » (poids 4) apparaît bien plus souvent que « い » (poids 1) sur beaucoup de tirages
  let a = 0, i = 0;
  let seed = 99;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  for (let t = 0; t < 400; t++) {
    const p = pickWritingQuiz(pool, stats, 5, rnd);
    if (p.includes("あ")) a++;
    if (p.includes("い")) i++;
  }
  assert.ok(a > i * 1.3, `${a} vs ${i}`);
  assert.equal(pickWritingQuiz(["あ"], [], 10).length, 1);
});

test("sauvegarde : les résultats d'écriture font l'aller-retour, se fusionnent, et les anciennes sauvegardes restent lisibles", async () => {
  const { createBackup, parseBackup, mergeSnapshots } = await import("../src/lib/backup");
  const { emptySnapshot } = await import("../src/lib/types");
  const w = (char: string, tries: number, correct: number) => ({ char, kind: "hiragana" as const, tries, correct, lastAt: 5, lastCorrect: true });
  const a = { ...emptySnapshot(), writing: [w("あ", 2, 1), w("い", 1, 1)] };
  const file = createBackup(a, 1000);
  assert.equal(file.counts.writing, 2);
  const r = parseBackup(JSON.stringify(file));
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.snapshot.writing, a.writing);

  const old = JSON.parse(JSON.stringify(file));
  delete old.data.writing;
  const r2 = parseBackup(JSON.stringify(old));
  assert.ok(r2.ok);
  if (r2.ok) assert.deepEqual(r2.snapshot.writing, []);

  const bad = JSON.parse(JSON.stringify(file));
  bad.data.writing[0].tries = "beaucoup";
  assert.equal(parseBackup(JSON.stringify(bad)).ok, false);

  const b = { ...emptySnapshot(), writing: [w("あ", 5, 4), w("う", 1, 0)] };
  const merged = mergeSnapshots(a, b).snapshot.writing;
  assert.equal(merged.length, 3);
  assert.equal(merged.find((x) => x.char === "あ")!.tries, 5);
});
