import test from "node:test";
import assert from "node:assert/strict";
import { newReviewState, schedule, isDue, isNewCard, isMature, nextIntervalLabel, isDifficult, RELEARN_MINUTES } from "../src/lib/srs";
import { dayKey, startOfDay, startOfDayPlus } from "../src/lib/dates";

const NOW = new Date(2026, 9, 18, 14, 30).getTime(); // 18 oct 2026, 14 h 30 (heure locale)

test("une carte neuve est « nouvelle » et pas encore « due »", () => {
  const s = newReviewState("c1", NOW);
  assert.ok(isNewCard(s));
  assert.ok(!isDue(s, NOW + 1000));
});

test("réponse incorrecte : la carte revient dans 10 minutes", () => {
  const s = schedule(newReviewState("c1", NOW), "again", NOW);
  assert.equal(s.due, NOW + RELEARN_MINUTES * 60_000);
  assert.equal(s.interval, 0);
  assert.equal(s.failures, 1);
  assert.equal(s.lapses, 0, "un premier échec sur une carte jamais réussie n'est pas un oubli");
  assert.ok(isDue(s, NOW + RELEARN_MINUTES * 60_000));
  assert.ok(!isDue(s, NOW + 60_000));
});

test("premières réussites : intervalles prudents puis plus longs", () => {
  const hard = schedule(newReviewState("c", NOW), "hard", NOW);
  const good = schedule(newReviewState("c", NOW), "good", NOW);
  const easy = schedule(newReviewState("c", NOW), "easy", NOW);
  assert.deepEqual([hard.interval, good.interval, easy.interval], [1, 2, 4]);
  // l'échéance tombe à minuit (heure locale) du jour prévu
  assert.equal(good.due, startOfDayPlus(NOW, 2));
  assert.equal(new Date(good.due).getHours(), 0);
  assert.equal(dayKey(good.due), "2026-10-20");
});

test("les intervalles augmentent à chaque réussite « bien »", () => {
  let s = newReviewState("c", NOW);
  const seen: number[] = [];
  let t = NOW;
  for (let i = 0; i < 6; i++) {
    s = schedule(s, "good", t);
    seen.push(s.interval);
    t = s.due + 3600_000;
  }
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i] > seen[i - 1], `intervalle ${i}: ${seen.join(",")}`);
  assert.equal(seen[0], 2);
  assert.equal(seen[1], 6);
});

test("facile allonge plus que bien, difficile moins", () => {
  let base = newReviewState("c", NOW);
  base = schedule(base, "good", NOW);
  base = schedule(base, "good", NOW + 2 * 86400_000);
  const hard = schedule(base, "hard", NOW);
  const good = schedule(base, "good", NOW);
  const easy = schedule(base, "easy", NOW);
  assert.ok(hard.interval < good.interval && good.interval < easy.interval, `${hard.interval} < ${good.interval} < ${easy.interval}`);
  assert.ok(hard.interval > base.interval, "même « difficile » fait progresser l'intervalle");
  assert.ok(hard.ease < good.ease && easy.ease > good.ease);
});

test("un oubli remet à zéro la série et compte une erreur « oubli »", () => {
  let s = newReviewState("c", NOW);
  s = schedule(s, "good", NOW);
  s = schedule(s, "good", NOW + 2 * 86400_000);
  const failed = schedule(s, "again", NOW + 8 * 86400_000);
  assert.equal(failed.reps, 0);
  assert.equal(failed.lapses, 1);
  assert.equal(failed.interval, 0);
  assert.ok(failed.ease < s.ease);
});

test("retry dans la même session : pas de second oubli, « facile » plafonné à « bien »", () => {
  let s = newReviewState("c", NOW);
  s = schedule(s, "good", NOW);
  s = schedule(s, "good", NOW + 2 * 86400_000);
  const first = schedule(s, "again", NOW + 8 * 86400_000);
  const second = schedule(first, "again", NOW + 8 * 86400_000 + 60_000, { retry: true });
  assert.equal(second.lapses, first.lapses);
  assert.equal(second.ease, first.ease);
  assert.equal(second.failures, first.failures + 1);
  const ok = schedule(first, "easy", NOW + 8 * 86400_000 + 120_000, { retry: true });
  assert.equal(ok.interval, 2, "good (2 j) et non easy (4 j)");
});

test("avec indice : une bonne réponse ne dépasse pas « difficile »", () => {
  const s = schedule(newReviewState("c", NOW), "easy", NOW, { hinted: true });
  assert.equal(s.interval, 1);
  assert.equal(s.hintedSuccesses, 1);
  assert.equal(s.history.at(-1)?.grade, "hard");
  assert.equal(s.history.at(-1)?.hinted, true);
});

test("l'historique est limité et l'état n'est pas modifié en place", () => {
  const original = newReviewState("c", NOW);
  let s = original;
  for (let i = 0; i < 50; i++) s = schedule(s, "good", NOW + i * 1000);
  assert.equal(s.history.length, 30);
  assert.equal(original.history.length, 0);
  assert.equal(original.successes, 0);
});

test("maturité et libellés d'intervalle", () => {
  let s = newReviewState("c", NOW);
  let t = NOW;
  while (!isMature(s)) {
    s = schedule(s, "good", t);
    t = s.due + 3600_000;
  }
  assert.ok(s.interval >= 21);
  const fresh = newReviewState("c", NOW);
  assert.equal(nextIntervalLabel(fresh, "again", NOW), "10 min");
  assert.equal(nextIntervalLabel(fresh, "good", NOW), "2 j");
});

test("cartes difficiles", () => {
  let s = newReviewState("c", NOW);
  for (let i = 0; i < 4; i++) s = schedule(s, "again", NOW + i * 1000);
  assert.ok(isDifficult(s));
  assert.ok(!isDifficult(schedule(newReviewState("d", NOW), "again", NOW)));
});

test("helpers de dates (heure d'été comprise)", () => {
  const d = new Date(2026, 2, 28, 12).getTime(); // veille du passage à l'heure d'été en Europe
  assert.equal(dayKey(startOfDayPlus(d, 1)), "2026-03-29");
  assert.equal(new Date(startOfDayPlus(d, 3)).getHours(), 0);
  assert.equal(startOfDay(NOW), new Date(2026, 9, 18).getTime());
});
