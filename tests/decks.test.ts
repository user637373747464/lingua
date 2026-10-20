import { test } from "node:test";
import assert from "node:assert/strict";
import { DeckCard } from "../src/lib/types";
import {
  BOX_DAYS, acceptedFor, applyResult, blankProg, canQcm, checkTyped, deckStats, frenchAccepted, legacyToDeckCards, makeMatchRound,
  newDeckCard, parseCardList, pickSession, qcmChoices, resolveDir, withResult,
} from "../src/lib/decks";
import { mkCard, mkEntry, mkSnapshot, seeded } from "./helpers";

const mk = (front: string, back: string, extra: Partial<DeckCard> = {}, lang: "en" | "ja" = "en"): DeckCard => ({ ...newDeckCard({ deckId: "d", lang, front, back, now: 1000 }), ...extra });
const WORDS: [string, string][] = [["cat", "chat"], ["dog", "chien"], ["house", "maison"], ["tree", "arbre"], ["water", "eau"], ["bread", "pain"], ["book", "livre"], ["road", "route"]];
const deck = () => WORDS.map(([f, b]) => mk(f, b));

test("coller une liste : séparateurs, japonais à 3 colonnes, lignes illisibles", () => {
  const r = parseCardList("cat ; chat\ndog = chien\nhouse - maison\nsun\ttree\tsoleil\n\nbread: pain\nbonjour", "en");
  assert.deepEqual(r.cards.map((c) => [c.front, c.back]), [["cat", "chat"], ["dog", "chien"], ["house", "maison"], ["sun", "tree ; soleil"], ["bread", "pain"]]);
  assert.deepEqual(r.skipped, ["bonjour"]);
  const ja = parseCardList("食べる ; たべる ; manger\n犬\tいぬ\tchien\n猫 ; chat", "ja");
  assert.deepEqual(ja.cards, [
    { front: "食べる", reading: "たべる", back: "manger" },
    { front: "犬", reading: "いぬ", back: "chien" },
    { front: "猫", back: "chat" },
  ]);
  // un « - » dans un mot composé n'est pas un séparateur (il faut des espaces autour)
  assert.deepEqual(parseCardList("well-known ; connu", "en").cards[0], { front: "well-known", back: "connu" });
});

test("traductions françaises acceptées : morceaux, (e), articles", () => {
  const a = frenchAccepted("réticent(e) ; peu enclin");
  for (const x of ["réticent(e) ; peu enclin", "réticent(e)", "réticent", "peu enclin"]) assert.ok(a.includes(x), x);
  assert.ok(frenchAccepted("la maison").includes("maison"));
  const c = mk("reluctant", "réticent(e) ; peu enclin");
  assert.equal(checkTyped(c, "to-fr", "Reticent").result, "correct"); // casse et accents ignorés
  assert.equal(checkTyped(c, "to-fr", "peu enclin").result, "correct");
  assert.equal(checkTyped(c, "to-fr", "joyeux").result, "wrong");
  assert.equal(checkTyped(mk("house", "la maison"), "to-fr", "maison").result, "correct");
});

test("sens français → langue étudiée : romaji et lecture acceptés en japonais", () => {
  const c = mk("食べる", "manger", { reading: "たべる" }, "ja");
  assert.deepEqual(acceptedFor(c, "from-fr"), ["食べる", "たべる"]);
  assert.equal(checkTyped(c, "from-fr", "食べる").result, "correct");
  assert.equal(checkTyped(c, "from-fr", "たべる").result, "correct");
  assert.equal(checkTyped(c, "from-fr", "taberu").result, "correct");
  assert.equal(checkTyped(c, "from-fr", "のむ").result, "wrong");
  assert.equal(checkTyped(c, "to-fr", "manger").result, "correct");
  assert.equal(checkTyped(mk("to run", "courir"), "from-fr", "run").result, "correct"); // « to » facultatif
});

test("progression : cases 0 à 5, un oubli ramène à 0, délais croissants", () => {
  let p = blankProg();
  const t = 10_000_000;
  const days: number[] = [];
  for (let i = 0; i < 6; i++) {
    p = applyResult(p, true, t);
    days.push((p.due - t) / 86_400_000);
  }
  assert.deepEqual(days, BOX_DAYS.slice(1).concat(30));
  assert.equal(p.box, 5);
  assert.equal(p.seen, 6);
  const f = applyResult(p, false, t);
  assert.equal(f.box, 0);
  assert.equal(f.due, t);
  assert.equal(f.ok, 6);
  assert.equal(f.seen, 7);
  // le résultat n'affecte que le bon sens
  const c = withResult(mk("a", "b"), "to-fr", true, 5);
  assert.equal(c.fwd.box, 1);
  assert.equal(c.rev.box, 0);
  assert.equal(c.updatedAt, 5);
});

test("statistiques d'un paquet", () => {
  const now = 5_000_000;
  const cards = [
    mk("a", "1"),
    mk("b", "2", { fwd: { box: 5, seen: 3, ok: 3, due: now + 1e9 }, rev: { box: 4, seen: 3, ok: 3, due: now + 1e9 } }),
    mk("c", "3", { fwd: { box: 1, seen: 1, ok: 1, due: now - 1 } }),
  ];
  assert.deepEqual(deckStats(cards, now), { total: 3, fresh: 1, due: 1, learned: 1 });
  assert.deepEqual(deckStats([], now), { total: 0, fresh: 0, due: 0, learned: 0 });
});

test("session : les cartes à revoir et les plus faibles passent en premier, sans doublon", () => {
  const now = 9_000_000;
  const strong = { box: 5, seen: 5, ok: 5, due: now + 1e9 };
  const cards = deck().map((c, i) => (i < 4 ? { ...c, fwd: strong, rev: strong } : c));
  const s = pickSession(cards, "to-fr", 4, now, seeded(3));
  assert.equal(s.length, 4);
  assert.equal(new Set(s.map((c) => c.id)).size, 4);
  assert.ok(s.every((c) => c.fwd.box === 0), "les nouvelles cartes d'abord");
  assert.equal(pickSession(cards, "to-fr", 0, now).length, 8);
  assert.equal(pickSession([], "to-fr", 5, now).length, 0);
  assert.equal(resolveDir("to-fr"), "to-fr");
  assert.ok(["to-fr", "from-fr"].includes(resolveDir("mixed", seeded(1))));
});

test("QCM : une bonne réponse, des mauvaises différentes, jamais de doublon", () => {
  const cards = deck();
  for (const dir of ["to-fr", "from-fr"] as const) {
    for (let k = 0; k < 20; k++) {
      const c = cards[k % cards.length];
      const { options, correct } = qcmChoices(c, dir, cards, seeded(k + 1));
      assert.equal(options.length, 4);
      assert.equal(new Set(options.map((o) => o.toLowerCase())).size, 4);
      assert.equal(options[correct], dir === "to-fr" ? c.back : c.front);
    }
  }
  // petit paquet : moins de choix, mais la bonne réponse y est toujours
  const two = cards.slice(0, 2);
  const q = qcmChoices(two[0], "to-fr", two, seeded(2));
  assert.equal(q.options.length, 2);
  assert.equal(q.options[q.correct], two[0].back);
  assert.equal(canQcm(two), true);
  assert.equal(canQcm(cards.slice(0, 1)), false);
  assert.equal(canQcm([mk("a", "x"), mk("b", "x")]), false); // une seule traduction différente
});

test("Associer : 6 paires = 12 tuiles, chaque paire complète, pas d'ambiguïté", () => {
  const r = makeMatchRound(deck(), 0, seeded(5));
  assert.equal(r.cards.length, 6);
  assert.equal(r.tiles.length, 12);
  for (const c of r.cards) {
    assert.equal(r.tiles.filter((t) => t.cardId === c.id).length, 2);
    assert.ok(r.tiles.some((t) => t.cardId === c.id && t.side === "front" && t.text === c.front));
    assert.ok(r.tiles.some((t) => t.cardId === c.id && t.side === "back" && t.text === c.back));
  }
  // deux cartes de même traduction : une seule est gardée dans la manche
  const dup = [mk("cat", "chat"), mk("kitty", "chat"), mk("dog", "chien")];
  const rd = makeMatchRound(dup, 0, seeded(1), 3);
  assert.equal(rd.cards.length, 2);
  assert.equal(makeMatchRound([], 0).tiles.length, 0);
});

test("anciennes cartes → cartes de paquet (mot, traduction, progression)", () => {
  const e = mkEntry({ headword: "reluctant", tr: ["réticent"], lang: "en" });
  const rec = mkCard(e.id, "recognition");
  const rcl = mkCard(e.id, "recall");
  const free = { ...mkCard("", "recall"), kind: "custom" as const, entryId: undefined, question: "capital of France", answer: "Paris" };
  const stRec = { cardId: rec.id, due: 99, interval: 30, ease: 2.5, reps: 4, lapses: 0, successes: 4, failures: 1, hintedSuccesses: 0, lastReviewAt: 50, history: [] };
  const out = legacyToDeckCards([rec, rcl, free], [e], [stRec], "dk", "en", 1000);
  assert.equal(out.length, 2);
  const w = out.find((c) => c.front === "reluctant")!;
  assert.equal(w.back, "réticent");
  assert.equal(w.deckId, "dk");
  assert.equal(w.fwd.box, 5);
  assert.equal(w.fwd.seen, 5);
  assert.equal(w.rev.box, 0);
  assert.ok(out.find((c) => c.front === "capital of France" && c.back === "Paris"));
  // une autre langue n'est pas reprise
  assert.equal(legacyToDeckCards([rec], [e], [], "dk", "ja", 1).length, 0);
});

test("sauvegarde : paquets et cartes font l'aller-retour, fusion, anciennes sauvegardes, incohérences", async () => {
  const { createBackup, parseBackup, mergeSnapshots } = await import("../src/lib/backup");
  const d1 = { id: "d1", lang: "en" as const, name: "Voyage", createdAt: 1, updatedAt: 1 };
  const c1 = { ...mk("cat", "chat"), deckId: "d1", id: "c1" };
  const a = { ...mkSnapshot([]), decks: [d1], deckCards: [c1] };
  const file = createBackup(a, 5);
  assert.equal(file.counts.decks, 1);
  assert.equal(file.counts.deckCards, 1);
  const r = parseBackup(JSON.stringify(file));
  assert.ok(r.ok);
  if (r.ok) {
    assert.deepEqual(r.snapshot.decks, [d1]);
    assert.equal(r.snapshot.deckCards[0].front, "cat");
  }
  // ancienne sauvegarde sans paquets
  const old = JSON.parse(JSON.stringify(file));
  delete old.data.decks;
  delete old.data.deckCards;
  const r2 = parseBackup(JSON.stringify(old));
  assert.ok(r2.ok);
  if (r2.ok) assert.deepEqual([r2.snapshot.decks, r2.snapshot.deckCards], [[], []]);
  // progression manquante : remplie
  const noProg = JSON.parse(JSON.stringify(file));
  delete noProg.data.deckCards[0].fwd;
  const r3 = parseBackup(JSON.stringify(noProg));
  assert.ok(r3.ok);
  if (r3.ok) assert.equal(r3.snapshot.deckCards[0].fwd.box, 0);
  // carte vers un paquet inexistant : refusé
  const orphan = JSON.parse(JSON.stringify(file));
  orphan.data.deckCards[0].deckId = "nope";
  assert.equal(parseBackup(JSON.stringify(orphan)).ok, false);
  const bad = JSON.parse(JSON.stringify(file));
  bad.data.decks[0].name = 42;
  assert.equal(parseBackup(JSON.stringify(bad)).ok, false);
  // fusion : le plus récent gagne, rien ne disparaît
  const newer = { ...c1, back: "félin", updatedAt: 5000 };
  const b = { ...mkSnapshot([]), decks: [{ ...d1, name: "Voyage 2", updatedAt: 50 }], deckCards: [newer, { ...mk("dog", "chien"), id: "c2", deckId: "d1" }] };
  const m = mergeSnapshots(a, b).snapshot;
  assert.equal(m.decks.length, 1);
  assert.equal(m.decks[0].name, "Voyage 2");
  assert.equal(m.deckCards.length, 2);
  assert.equal(m.deckCards.find((c) => c.id === "c1")!.back, "félin");
});

test("remplissage automatique : lecture des réponses des services (format documenté de dictionaryapi.dev et MyMemory)", async () => {
  const { parseFreeDictionary, parseMyMemory, lookupWord } = await import("../src/lib/autofill");
  const dict = [
    { word: "reluctant", phonetic: "/rɪˈlʌk.tənt/", phonetics: [{ audio: "" }, { text: "/rɪˈlʌk.tənt/", audio: "x.mp3" }], meanings: [{ partOfSpeech: "adjective", definitions: [] }] },
  ];
  assert.deepEqual(parseFreeDictionary(dict), { ipa: "rɪˈlʌk.tənt", pos: "adjective" });
  assert.deepEqual(parseFreeDictionary({ title: "No Definitions Found" }), {});
  assert.deepEqual(parseFreeDictionary([{ meanings: [{ partOfSpeech: "exclamation" }] }]), { ipa: undefined, pos: "interjection" });

  const mm = {
    responseData: { translatedText: "réticent(e)", match: 0.99 },
    responseStatus: 200,
    matches: [
      { translation: "réticent(e)", quality: "74", match: 0.99 },
      { translation: "peu enclin", quality: "70", match: 0.8 },
      { translation: "reluctant", quality: "90", match: 1 }, // identique au mot : ignoré
      { translation: "MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS", quality: "0", match: 0 },
      { translation: "hésitant", quality: "60", match: 0.7 },
    ],
  };
  assert.deepEqual(parseMyMemory(mm, "reluctant"), ["réticent(e)", "peu enclin", "hésitant"]);
  assert.throws(() => parseMyMemory({ quotaFinished: true }, "x"));
  assert.deepEqual(parseMyMemory({ responseStatus: 403 }, "x"), []);
  assert.deepEqual(parseMyMemory(null, "x"), []);

  // appels simulés
  const ok = (data: unknown, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => data });
  const fake = (url: string) => (url.includes("dictionaryapi") ? ok(dict) : ok(mm));
  const r = await lookupWord("reluctant", "en", fake);
  assert.equal(r.ipa, "rɪˈlʌk.tənt");
  assert.equal(r.pos, "adjective");
  assert.equal(r.translations[0], "réticent(e)");
  // mot inconnu du dictionnaire (404) : on garde quand même la traduction
  const only = await lookupWord("blorp", "en", (u) => (u.includes("dictionaryapi") ? ok({ title: "No Definitions Found" }, 404) : ok(mm)));
  assert.equal(only.ipa, undefined);
  assert.ok(only.translations.length > 0);
  // tout échoue : erreur claire ; échec partiel : résultat partiel
  await assert.rejects(lookupWord("x", "en", () => Promise.reject(new Error("réseau"))));
  const partial = await lookupWord("reluctant", "en", (u) => (u.includes("mymemory") ? Promise.reject(new Error("réseau")) : ok(dict)));
  assert.equal(partial.ipa, "rɪˈlʌk.tənt");
  // japonais : lecture déduite d'un mot en kana, traduction proposée
  const ja = await lookupWord("ネコ", "ja", () => ok({ responseData: { translatedText: "chat" }, responseStatus: 200, matches: [] }));
  assert.equal(ja.reading, "ねこ");
  assert.deepEqual(ja.translations, ["chat"]);
  const urls: string[] = [];
  await lookupWord("食べる", "ja", (u) => (urls.push(u), ok({ responseData: { translatedText: "manger" }, responseStatus: 200, matches: [] })));
  assert.equal(urls.length, 1);
  assert.ok(urls[0].includes("langpair=ja%7Cfr"));
});
