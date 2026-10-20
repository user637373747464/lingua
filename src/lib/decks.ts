// Paquets de flashcards : logique pure (sans navigateur), testée dans tests/decks.test.ts.
//
// Une carte = un mot dans la langue étudiée (recto) + sa traduction française (verso) + éventuellement la lecture en kana.
// On peut la réviser dans les deux sens ; chaque sens a sa propre progression (cases 0 à 5, façon « boîtes de Leitner »).

import { Card, CardProg, DeckCard, Entry, Lang, ReviewState } from "./types";
import { checkAnswer, CheckResult } from "./answers";
import { entryGloss, shuffle, Rng } from "./cards";
import { uid } from "./ids";

export type Dir = "to-fr" | "from-fr";
export type DirChoice = Dir | "mixed";
export type Mode = "flip" | "qcm" | "write" | "match";

export const MODE_INFO: Record<Mode, { label: string; desc: string }> = {
  flip: { label: "Cartes", desc: "Retourne la carte, dis si tu la savais" },
  qcm: { label: "QCM", desc: "Choisis la bonne réponse parmi 4" },
  write: { label: "Écrire", desc: "Écris la réponse au clavier" },
  match: { label: "Associer", desc: "Relie les paires le plus vite possible" },
};

export const MAX_BOX = 5;
/** Délai avant de revoir une carte, selon sa case (en jours). */
export const BOX_DAYS = [0, 1, 3, 7, 14, 30];
const DAY = 86_400_000;

export const blankProg = (): CardProg => ({ box: 0, seen: 0, ok: 0, due: 0 });

export function newDeckCard(a: { deckId: string; lang: Lang; front: string; back: string; reading?: string; now: number }): DeckCard {
  const reading = a.reading?.trim();
  return {
    id: uid("dcard"),
    deckId: a.deckId,
    lang: a.lang,
    front: a.front.trim(),
    back: a.back.trim(),
    ...(reading ? { reading } : {}),
    createdAt: a.now,
    updatedAt: a.now,
    fwd: blankProg(),
    rev: blankProg(),
  };
}

// ---------- coller une liste ----------

export interface ParsedLine {
  front: string;
  back: string;
  reading?: string;
}

export interface ParsedList {
  cards: ParsedLine[];
  skipped: string[]; // lignes qu'on n'a pas su lire
}

/**
 * Une carte par ligne. Séparateurs acceptés : tabulation (copier-coller depuis Excel/Numbers), « ; », « = », « : »,
 * « - » ou « – » entourés d'espaces. Japonais : « 食べる ; たべる ; manger » (mot ; lecture ; traduction) est aussi accepté.
 */
export function parseCardList(text: string, lang: Lang): ParsedList {
  const cards: ParsedLine[] = [];
  const skipped: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    let parts: string[] | null = null;
    if (line.includes("\t")) parts = line.split("\t");
    else {
      for (const sep of [";", "=", " - ", " – ", " — ", ":"]) {
        if (line.includes(sep)) {
          parts = line.split(sep);
          break;
        }
      }
    }
    if (!parts) {
      skipped.push(line);
      continue;
    }
    parts = parts.map((p) => p.trim()).filter((p) => p !== "");
    if (parts.length < 2) {
      skipped.push(line);
      continue;
    }
    if (parts.length >= 3 && lang === "ja") cards.push({ front: parts[0], reading: parts[1], back: parts.slice(2).join(" ; ") });
    else cards.push({ front: parts[0], back: parts.slice(1).join(" ; ") });
  }
  return { cards, skipped };
}

// ---------- questions et réponses ----------

/** Traductions françaises acceptées : chaque morceau séparé par « ; », « / » ou « , », avec ou sans « (e) », sans article. */
export function frenchAccepted(back: string): string[] {
  const out = new Set<string>();
  const add = (s: string) => {
    const t = s.trim();
    if (t) out.add(t);
  };
  add(back);
  for (const part of back.split(/[;/,]/)) {
    add(part);
    const noParen = part.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
    add(noParen);
    add(noParen.replace(/^(le|la|les|l'|l’|un|une|des|du|de la)\s*/i, ""));
  }
  return [...out];
}

export function promptOf(card: DeckCard, dir: Dir): { text: string; reading?: string } {
  return dir === "to-fr" ? { text: card.front, reading: card.reading } : { text: card.back };
}

/** Texte de la bonne réponse, tel qu'on l'affiche. */
export function answerText(card: DeckCard, dir: Dir): string {
  return dir === "to-fr" ? card.back : card.front;
}

export function acceptedFor(card: DeckCard, dir: Dir): string[] {
  if (dir === "to-fr") return frenchAccepted(card.back);
  const list = [card.front];
  if (card.reading) list.push(card.reading);
  return list;
}

export function checkTyped(card: DeckCard, dir: Dir, input: string): CheckResult {
  // en sens « français → langue étudiée », la langue de la réponse est celle du paquet ; sinon le français
  const lang: Lang = dir === "from-fr" ? card.lang : "en";
  return checkAnswer(input, acceptedFor(card, dir), lang);
}

export function resolveDir(choice: DirChoice, rng: Rng = Math.random): Dir {
  if (choice === "mixed") return rng() < 0.5 ? "to-fr" : "from-fr";
  return choice;
}

export const progOf = (c: DeckCard, dir: Dir): CardProg => (dir === "to-fr" ? c.fwd : c.rev);

// ---------- progression ----------

export function applyResult(p: CardProg, ok: boolean, now: number): CardProg {
  const box = ok ? Math.min(MAX_BOX, p.box + 1) : 0;
  return { box, seen: p.seen + 1, ok: p.ok + (ok ? 1 : 0), lastAt: now, due: now + BOX_DAYS[box] * DAY };
}

export function withResult(c: DeckCard, dir: Dir, ok: boolean, now: number): DeckCard {
  return dir === "to-fr"
    ? { ...c, fwd: applyResult(c.fwd, ok, now), updatedAt: now }
    : { ...c, rev: applyResult(c.rev, ok, now), updatedAt: now };
}

export const isDue = (p: CardProg, now: number): boolean => p.due <= now;
export const isLearned = (p: CardProg): boolean => p.box >= 4;

export interface DeckStats {
  total: number;
  fresh: number; // jamais révisées (dans les deux sens)
  due: number; // au moins un sens déjà vu dont le délai est écoulé
  learned: number; // les deux sens bien retenus
}

export function deckStats(cards: DeckCard[], now: number): DeckStats {
  let fresh = 0,
    due = 0,
    learned = 0;
  for (const c of cards) {
    if (c.fwd.seen === 0 && c.rev.seen === 0) fresh++;
    // « à revoir » = déjà vue dans ce sens, et le délai est écoulé (une carte jamais vue est « nouvelle », pas « à revoir »)
    if ((c.fwd.seen > 0 && isDue(c.fwd, now)) || (c.rev.seen > 0 && isDue(c.rev, now))) due++;
    if (isLearned(c.fwd) && isLearned(c.rev)) learned++;
  }
  return { total: cards.length, fresh, due, learned };
}

// ---------- choix des cartes d'une session ----------

/**
 * Cartes à réviser en premier : d'abord celles « à revoir » (les plus faibles d'abord), puis les autres,
 * en mélangeant à l'intérieur de chaque groupe. `size` = nombre de cartes voulu (0 = toutes).
 */
export function pickSession(cards: DeckCard[], dir: DirChoice, size: number, now: number, rng: Rng = Math.random): DeckCard[] {
  const weight = (c: DeckCard): number => {
    const ps = dir === "mixed" ? [c.fwd, c.rev] : [progOf(c, dir)];
    const due = ps.some((p) => isDue(p, now));
    const box = Math.min(...ps.map((p) => p.box));
    return (due ? 0 : 10) + box; // plus petit = passe en premier
  };
  const groups = new Map<number, DeckCard[]>();
  for (const c of cards) {
    const w = weight(c);
    groups.set(w, [...(groups.get(w) ?? []), c]);
  }
  const ordered = [...groups.keys()].sort((a, b) => a - b).flatMap((w) => shuffle(groups.get(w)!, rng));
  return size > 0 ? ordered.slice(0, size) : ordered;
}

// ---------- QCM ----------

/** La bonne réponse + jusqu'à 3 mauvaises tirées des autres cartes du paquet, dans un ordre mélangé. */
export function qcmChoices(card: DeckCard, dir: Dir, all: DeckCard[], rng: Rng = Math.random): { options: string[]; correct: number } {
  const right = answerText(card, dir);
  const seen = new Set([right.trim().toLowerCase()]);
  const wrong: string[] = [];
  for (const o of shuffle(all, rng)) {
    if (o.id === card.id) continue;
    const t = answerText(o, dir);
    const k = t.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    wrong.push(t);
    if (wrong.length === 3) break;
  }
  const options = shuffle([right, ...wrong], rng);
  return { options, correct: options.indexOf(right) };
}

/** Un QCM n'a de sens que s'il y a au moins 2 réponses différentes. */
export const canQcm = (cards: DeckCard[]): boolean => new Set(cards.map((c) => c.back.trim().toLowerCase())).size >= 2 && new Set(cards.map((c) => c.front.trim().toLowerCase())).size >= 2;

// ---------- jeu « Associer » ----------

export interface Tile {
  id: string;
  cardId: string;
  side: "front" | "back";
  text: string;
}

export const MATCH_PAIRS = 6; // 12 tuiles = grille 3 × 4
export const MIN_MATCH_PAIRS = 3;

/** Les cartes d'une manche (les plus faibles d'abord) et leurs tuiles mélangées. */
export function makeMatchRound(cards: DeckCard[], now: number, rng: Rng = Math.random, pairs = MATCH_PAIRS): { cards: DeckCard[]; tiles: Tile[] } {
  // on évite deux cartes de même traduction ou de même mot : l'association serait ambiguë
  const used = new Set<string>();
  const chosen: DeckCard[] = [];
  for (const c of pickSession(cards, "mixed", 0, now, rng)) {
    const kf = c.front.trim().toLowerCase();
    const kb = c.back.trim().toLowerCase();
    if (used.has("f:" + kf) || used.has("b:" + kb)) continue;
    used.add("f:" + kf);
    used.add("b:" + kb);
    chosen.push(c);
    if (chosen.length === pairs) break;
  }
  const tiles: Tile[] = chosen.flatMap((c) => [
    { id: `${c.id}:f`, cardId: c.id, side: "front" as const, text: c.front },
    { id: `${c.id}:b`, cardId: c.id, side: "back" as const, text: c.back },
  ]);
  return { cards: chosen, tiles: shuffle(tiles, rng) };
}

// ---------- anciennes cartes du dictionnaire → paquet ----------

/** Transforme les anciennes cartes (créées automatiquement depuis le dictionnaire, ou « cartes libres ») en cartes de paquet. */
export function legacyToDeckCards(cards: Card[], entries: Entry[], states: ReviewState[], deckId: string, lang: Lang, now: number): DeckCard[] {
  const byEntry = new Map(entries.map((e) => [e.id, e]));
  const stateById = new Map(states.map((s) => [s.cardId, s]));
  const out = new Map<string, DeckCard>();
  const protoFrom = (front: string, back: string, reading?: string) => newDeckCard({ deckId, lang, front, back, reading, now });
  const progFrom = (s: ReviewState | undefined): CardProg => {
    if (!s || s.lastReviewAt === undefined) return blankProg();
    const box = s.interval >= 21 ? 5 : s.interval >= 7 ? 3 : s.reps >= 1 ? 1 : 0;
    return { box, seen: s.successes + s.failures, ok: s.successes, lastAt: s.lastReviewAt, due: s.due };
  };
  for (const c of cards) {
    if (c.lang !== lang) continue;
    if (c.kind === "custom") {
      const q = c.question?.trim();
      const a = c.answer?.trim();
      if (q && a) out.set(c.id, protoFrom(q, a));
      continue;
    }
    const e = c.entryId ? byEntry.get(c.entryId) : undefined;
    if (!e) continue;
    const gloss = entryGloss(e);
    if (!gloss) continue;
    const key = `e:${e.id}`;
    const card = out.get(key) ?? protoFrom(e.headword, gloss, e.reading && e.reading !== e.headword ? e.reading : undefined);
    // « recognition » = on voit le mot, on reconnaît (langue → français) ; « recall » = on écrit le mot (français → langue)
    const prog = progFrom(stateById.get(c.id));
    if (c.kind === "recognition") card.fwd = prog;
    else card.rev = prog;
    out.set(key, card);
  }
  return [...out.values()];
}
