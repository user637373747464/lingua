import test from "node:test";
import assert from "node:assert/strict";
import { entryGloss, makeEntryCards, prepareCard, clozeFor, buildQueue, distractorsFor, introducedToday } from "../src/lib/cards";
import { newReviewState, schedule } from "../src/lib/srs";
import { mkEntry, mkCard, seeded } from "./helpers";
import { ReviewState } from "../src/lib/types";

const NOW = new Date(2026, 9, 18, 10, 0).getTime();

test("traduction courte : première traduction de chaque sens", () => {
  const bank = mkEntry({ headword: "bank", tr: ["banque", "établissement"] });
  bank.senses.push({ id: "s2", pos: "noun", translations: ["rive"], examples: [] });
  assert.equal(entryGloss(bank), "banque ; rive");
  const defOnly = mkEntry({ headword: "x", tr: [] });
  defOnly.senses[0].definition = "une définition";
  assert.equal(entryGloss(defOnly), "une définition");
});

test("création des cartes : une reconnaissance + un rappel, rien sans traduction", () => {
  const e = mkEntry({ headword: "cat", tr: ["chat"] });
  const cards = makeEntryCards(e, NOW);
  assert.deepEqual(cards.map((c) => c.kind).sort(), ["recall", "recognition"]);
  assert.ok(cards.every((c) => c.entryId === e.id && !c.suspended));
  assert.equal(makeEntryCards(mkEntry({ headword: "vide", tr: [] }), NOW).length, 0);
});

test("QCM : bonne réponse présente une seule fois, distracteurs de la même langue et différents", () => {
  const entries = ["chat", "chien", "cheval", "vache", "mouton"].map((t, i) => mkEntry({ headword: `w${i}`, tr: [t], pos: "noun" }));
  entries.push(mkEntry({ headword: "jp", lang: "ja", tr: ["japonais"] }));
  const card = mkCard(entries[0].id, "recognition");
  for (let seed = 1; seed < 20; seed++) {
    const p = prepareCard(card, entries, seeded(seed))!;
    assert.equal(p.mode, "mcq");
    assert.equal(p.options!.length, 4);
    assert.equal(new Set(p.options).size, 4);
    assert.equal(p.options![p.correctIndex!], "chat");
    assert.ok(!p.options!.includes("japonais"));
  }
});

test("avec un seul mot, la reconnaissance bascule en « retourner la carte »", () => {
  const e = mkEntry({ headword: "cat", tr: ["chat"] });
  const p = prepareCard(mkCard(e.id, "recognition"), [e])!;
  assert.equal(p.mode, "flip");
  assert.equal(p.answerDisplay, "chat");
  assert.deepEqual(distractorsFor(e, [e], 3, seeded()), []);
});

test("rappel : réponses acceptées = mot, variantes, lecture ; phrase à trous", () => {
  const e = mkEntry({
    lang: "ja", headword: "食べる", reading: "たべる", variants: [], inflections: ["食べます"], tr: ["manger"], pos: "verb",
    ex: ["毎日、朝ご飯を食べます。", "Je prends le petit-déjeuner."],
  });
  const p = prepareCard(mkCard(e.id, "recall", "ja"), [e])!;
  assert.equal(p.mode, "typed");
  assert.deepEqual(p.accepted, ["食べる", "たべる"]);
  assert.equal(p.prompt, "manger");
  assert.equal(p.context, "毎日、朝ご飯を＿＿＿。");
  assert.equal(p.answerDisplay, "食べる（たべる）");
});

test("phrase à trous : mot entier seulement", () => {
  const e = mkEntry({ headword: "reluctant", ex: ["He agreed reluctantly, but a reluctant yes is still a yes.", "…"] });
  assert.equal(clozeFor(e)!.text, "He agreed reluctantly, but a _____ yes is still a yes.");
  assert.equal(clozeFor(mkEntry({ headword: "zebra", ex: ["A cat.", "Un chat."] })), null);
});

test("carte libre", () => {
  const p = prepareCard({ id: "k", lang: "en", kind: "custom", question: "Capitale de la France ?", answer: "Paris", alternatives: ["paris, france"], suspended: false, createdAt: 1 }, [])!;
  assert.equal(p.mode, "typed");
  assert.deepEqual(p.accepted, ["Paris", "paris, france"]);
  assert.equal(prepareCard({ id: "k2", lang: "en", kind: "recall", entryId: "inconnu", suspended: false, createdAt: 1 }, []), null, "entrée supprimée : carte ignorée");
});

function setup() {
  const e1 = mkEntry({ headword: "a", tr: ["un"] });
  const e2 = mkEntry({ headword: "b", tr: ["deux"] });
  const e3 = mkEntry({ headword: "c", tr: ["trois"] });
  const cards = [
    mkCard(e1.id, "recognition", "en", 1), mkCard(e1.id, "recall", "en", 1),
    mkCard(e2.id, "recognition", "en", 2), mkCard(e2.id, "recall", "en", 2),
    mkCard(e3.id, "recognition", "en", 3), mkCard(e3.id, "recall", "en", 3),
  ];
  return { entries: [e1, e2, e3], cards, ids: new Set([e1.id, e2.id, e3.id]) };
}

test("file de session : nouvelles cartes limitées ; le rappel attend que la reconnaissance ait été réussie", () => {
  const { cards, ids } = setup();
  const states = new Map<string, ReviewState>();
  const q = buildQueue(cards, states, ids, { lang: "en", now: NOW, newLimit: 10 });
  assert.equal(q.due.length, 0);
  assert.deepEqual(q.fresh.map((c) => c.kind), ["recognition", "recognition", "recognition"], "pas de carte de rappel avant la reconnaissance");

  const limited = buildQueue(cards, states, ids, { lang: "en", now: NOW, newLimit: 2 });
  assert.equal(limited.fresh.length, 2);

  // la reconnaissance du mot 1 est réussie hier → son rappel devient disponible
  const rec1 = cards[0];
  states.set(rec1.id, schedule(newReviewState(rec1.id, NOW - 3 * 86400_000), "good", NOW - 3 * 86400_000));
  const q2 = buildQueue(cards, states, ids, { lang: "en", now: NOW, newLimit: 10 });
  assert.equal(q2.due.length, 1);
  assert.ok(q2.fresh.some((c) => c.id === cards[1].id), "rappel du mot 1 disponible");
  assert.ok(!q2.fresh.some((c) => c.id === cards[3].id), "rappel du mot 2 toujours bloqué");
});

test("file de session : cartes suspendues, entrées supprimées et autre langue ignorées ; les plus en retard d'abord", () => {
  const { cards, ids } = setup();
  const states = new Map<string, ReviewState>();
  const past = NOW - 10 * 86400_000;
  for (const c of cards.slice(0, 3)) {
    let s = schedule(newReviewState(c.id, past), "good", past);
    s = { ...s, due: past + (cards.indexOf(c) + 1) * 3600_000 * -1 };
    states.set(c.id, s);
  }
  const base = buildQueue(cards, states, ids, { lang: "en", now: NOW, newLimit: 0 });
  assert.equal(base.due.length, 3);
  assert.deepEqual(base.due.map((c) => c.id), [cards[2].id, cards[1].id, cards[0].id], "le plus en retard d'abord");

  cards[0].suspended = true;
  assert.equal(buildQueue(cards, states, ids, { lang: "en", now: NOW, newLimit: 0 }).due.length, 2);
  assert.equal(buildQueue(cards, states, new Set([cards[1].entryId!]), { lang: "en", now: NOW, newLimit: 0 }).due.length, 1);
  assert.equal(buildQueue(cards, states, ids, { lang: "ja", now: NOW, newLimit: 5 }).fresh.length, 0);
});

test("nouvelles cartes du jour", () => {
  const { cards } = setup();
  const states = new Map<string, ReviewState>();
  assert.equal(introducedToday(cards, states, "en", NOW), 0);
  states.set(cards[0].id, schedule(newReviewState(cards[0].id, NOW), "good", NOW));
  states.set(cards[1].id, schedule(newReviewState(cards[1].id, NOW - 2 * 86400_000), "good", NOW - 2 * 86400_000));
  assert.equal(introducedToday(cards, states, "en", NOW), 1);
});
