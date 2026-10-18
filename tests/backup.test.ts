import test from "node:test";
import assert from "node:assert/strict";
import { createBackup, parseBackup, mergeSnapshots, SCHEMA_VERSION, backupFileName } from "../src/lib/backup";
import { makeEntryCards } from "../src/lib/cards";
import { newReviewState, schedule } from "../src/lib/srs";
import { buildStarterEntries } from "../src/lib/content/starter";
import { mkEntry, mkSnapshot } from "./helpers";
import { Snapshot, emptySnapshot, StudyDay } from "../src/lib/types";

const NOW = new Date(2026, 9, 18, 10).getTime();

function populated(): Snapshot {
  const e = mkEntry({ headword: "reluctant", tr: ["réticent"], pos: "adjective" });
  const f = mkEntry({ lang: "ja", headword: "食べる", reading: "たべる", tr: ["manger"], pos: "verb" });
  const cards = [...makeEntryCards(e, NOW), ...makeEntryCards(f, NOW)];
  const states = [schedule(newReviewState(cards[0].id, NOW), "good", NOW)];
  const snap = mkSnapshot([e, f], cards, states);
  snap.studyLog.push(day("2026-10-18", "en", 600, 20, 15));
  snap.exerciseStats.push({ exerciseId: "en-tense-01", lang: "en", topic: "Temps verbaux", level: "B1", tries: 2, correct: 1, lastAt: NOW, lastCorrect: true });
  return snap;
}

function day(date: string, lang: "en" | "ja", seconds: number, answers: number, correct: number): StudyDay {
  return { key: `${date}|${lang}`, date, lang, seconds, answers, correct, unaided: correct, exercises: 0, exercisesCorrect: 0, newCards: 0, recognition: { n: answers, ok: correct }, recall: { n: 0, ok: 0 } };
}

test("export puis import : toutes les données et tous les identifiants sont conservés", () => {
  const snap = populated();
  const text = JSON.stringify(createBackup(snap, NOW));
  const res = parseBackup(text);
  assert.ok(res.ok);
  if (!res.ok) return;
  assert.deepEqual(res.snapshot, snap);
  assert.equal(JSON.parse(text).schemaVersion, SCHEMA_VERSION);
});

test("fichiers invalides refusés avec un message clair", () => {
  const good = JSON.parse(JSON.stringify(createBackup(populated(), NOW)));
  const bad = (mutate: (b: any) => void): string => {
    const b = JSON.parse(JSON.stringify(good));
    mutate(b);
    const r = parseBackup(JSON.stringify(b));
    assert.equal(r.ok, false);
    return r.ok ? "" : r.error;
  };
  assert.match(parseBackup("pas du json").ok ? "" : (parseBackup("pas du json") as any).error, /JSON/);
  assert.match(bad((b) => (b.app = "autre")), /Lingua/);
  assert.match(bad((b) => (b.schemaVersion = 99)), /plus récente/);
  assert.match(bad((b) => delete b.data), /Données manquantes/);
  assert.match(bad((b) => (b.data.entries[0].lang = "fr")), /langue/);
  assert.match(bad((b) => (b.data.entries[0].senses[0].pos = "inconnu")), /catégorie/);
  assert.match(bad((b) => (b.data.cards[0].entryId = "fantome")), /n'existe pas/);
  assert.match(bad((b) => (b.data.reviewStates[0].cardId = "fantome")), /n'existe pas/);
  assert.match(bad((b) => (b.data.reviewStates[0].due = "demain")), /due/);
  assert.equal(parseBackup("[]").ok, false);
  assert.equal(parseBackup("null").ok, false);
});

test("la fusion d'une sauvegarde déjà présente ne change rien (aucun doublon)", () => {
  const snap = populated();
  const { snapshot, report } = mergeSnapshots(snap, JSON.parse(JSON.stringify(snap)));
  assert.equal(snapshot.entries.length, 2);
  assert.equal(snapshot.cards.length, 4);
  assert.equal(snapshot.reviewStates.length, 1);
  assert.equal(snapshot.studyLog.length, 1);
  assert.equal(report.entriesAdded, 0);
  assert.equal(report.cardsAdded, 0);
  assert.equal(snapshot.studyLog[0].seconds, 600, "pas de double comptage du temps");
});

test("fusion : même mot sous un autre identifiant → entrée ignorée, cartes rattachées, meilleur état gardé", () => {
  const mine = populated();
  const other = emptySnapshot();
  const dup = mkEntry({ headword: "RELUCTANT", tr: ["peu enclin"], pos: "adjective" }); // même mot, autre id
  const newer = mkEntry({ headword: "thorough", tr: ["minutieux"], pos: "adjective" });
  const cards = [...makeEntryCards(dup, NOW), ...makeEntryCards(newer, NOW)];
  other.entries = [dup, newer];
  other.cards = cards;
  // l'autre appareil a révisé 3 fois la carte « reconnaissance » du mot en doublon → son état est plus avancé
  let st = newReviewState(cards[0].id, NOW);
  for (let i = 0; i < 3; i++) st = schedule(st, "good", NOW + (i + 1) * 86400_000);
  other.reviewStates = [st];

  const { snapshot, report } = mergeSnapshots(mine, other);
  assert.equal(report.entriesDuplicate, 1);
  assert.equal(report.entriesAdded, 1);
  assert.equal(snapshot.entries.length, 3);
  assert.equal(snapshot.entries.filter((e) => e.headword.toLowerCase() === "reluctant").length, 1);
  const myCard = mine.cards.find((c) => c.entryId === mine.entries[0].id && c.kind === "recognition")!;
  const kept = snapshot.reviewStates.find((s) => s.cardId === myCard.id)!;
  assert.equal(kept.reps, 3, "l'état le plus récent est conservé, rattaché à la carte existante");
  // chaque entrée a au plus une carte de chaque type
  const slots = snapshot.cards.map((c) => `${c.entryId}|${c.kind}`);
  assert.equal(new Set(slots).size, slots.length);
  // aucune carte ni état orphelin
  const entryIds = new Set(snapshot.entries.map((e) => e.id));
  assert.ok(snapshot.cards.every((c) => c.kind === "custom" || entryIds.has(c.entryId!)));
  const cardIds = new Set(snapshot.cards.map((c) => c.id));
  assert.ok(snapshot.reviewStates.every((s) => cardIds.has(s.cardId)));
});

test("fusion : même identifiant → la version la plus récente gagne ; les réglages locaux sont conservés", () => {
  const mine = populated();
  const theirs = JSON.parse(JSON.stringify(mine)) as Snapshot;
  theirs.entries[0].notes = "modifiée ailleurs";
  theirs.entries[0].updatedAt += 5000;
  theirs.settings.theme = "dark";
  const { snapshot, report } = mergeSnapshots(mine, theirs);
  assert.equal(report.entriesUpdated, 1);
  assert.equal(snapshot.entries[0].notes, "modifiée ailleurs");
  assert.equal(snapshot.settings.theme, "auto");
});

test("fusion : journées d'étude — maximum par compteur, nouvelles journées ajoutées", () => {
  const mine = populated();
  const theirs = emptySnapshot();
  theirs.studyLog = [day("2026-10-18", "en", 900, 10, 9), day("2026-10-17", "ja", 300, 5, 5)];
  const { snapshot } = mergeSnapshots(mine, theirs);
  assert.equal(snapshot.studyLog.length, 2);
  const d = snapshot.studyLog.find((x) => x.key === "2026-10-18|en")!;
  assert.equal(d.seconds, 900);
  assert.equal(d.answers, 20);
});

test("cartes libres identiques non dupliquées", () => {
  const a = emptySnapshot();
  a.cards = [{ id: "k1", lang: "en", kind: "custom", question: "Q", answer: "A", suspended: false, createdAt: 1 }];
  const b = emptySnapshot();
  b.cards = [{ id: "k2", lang: "en", kind: "custom", question: "Q", answer: "A", suspended: false, createdAt: 2 }];
  assert.equal(mergeSnapshots(a, b).snapshot.cards.length, 1);
});

test("les paquets de démarrage forment une sauvegarde valide, sans doublon interne", () => {
  for (const lang of ["en", "ja"] as const) {
    const entries = buildStarterEntries(lang, NOW);
    assert.ok(entries.length >= 20);
    const snap = mkSnapshot(entries, entries.flatMap((e) => makeEntryCards(e, NOW)));
    const res = parseBackup(JSON.stringify(createBackup(snap, NOW)));
    assert.ok(res.ok, res.ok ? "" : res.error);
    const keys = entries.map((e) => e.headword.toLowerCase());
    assert.equal(new Set(keys).size, keys.length, `doublon dans le paquet ${lang}`);
    assert.ok(entries.every((e) => e.senses.every((s) => s.translations.length > 0)));
    const ids = new Set<string>();
    for (const e of entries) for (const s of e.senses) for (const id of [s.id, ...s.examples.map((x) => x.id)]) { assert.ok(!ids.has(id)); ids.add(id); }
  }
});

test("nom du fichier de sauvegarde", () => {
  assert.equal(backupFileName(new Date(2026, 0, 5, 12).getTime()), "lingua-sauvegarde-2026-01-05.json");
});
