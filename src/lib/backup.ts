// Sauvegardes : export, validation, migration de version et fusion sans doublons.
// Toutes les fonctions ici sont « pures » (aucun accès au navigateur) : elles sont donc testables.

import {
  Card,
  DEFAULT_SETTINGS,
  Entry,
  ExerciseStat,
  Lang,
  LANGS,
  ReviewState,
  Settings,
  Snapshot,
  StudyDay,
  TextItem,
  MAX_TEXT_LENGTH,
  POS_LIST,
  structuredCloneSafe,
  WritingStat,
  Deck,
  DeckCard,
} from "./types";
import { entryKey, normalizeForSearch } from "./search";

export const BACKUP_APP = "lingua";
export const SCHEMA_VERSION = 1;

export interface BackupFile {
  app: typeof BACKUP_APP;
  schemaVersion: number;
  exportedAt: string;
  counts: Record<string, number>;
  data: Snapshot;
}

export function createBackup(snapshot: Snapshot, now: number): BackupFile {
  return {
    app: BACKUP_APP,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date(now).toISOString(),
    counts: {
      entries: snapshot.entries.length,
      cards: snapshot.cards.length,
      reviewStates: snapshot.reviewStates.length,
      texts: snapshot.texts.length,
      writing: snapshot.writing.length,
      decks: snapshot.decks.length,
      deckCards: snapshot.deckCards.length,
    },
    data: snapshot,
  };
}

export type ParseResult = { ok: true; snapshot: Snapshot; warnings: string[] } | { ok: false; error: string };

class Invalid extends Error {}

function need(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Invalid(msg);
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const isStr = (x: unknown): x is string => typeof x === "string";
const isNum = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
const isLang = (x: unknown): x is Lang => x === "en" || x === "ja";
const optStr = (x: unknown): boolean => x === undefined || isStr(x);
const strArr = (x: unknown): boolean => Array.isArray(x) && x.every(isStr);

function checkEntry(x: unknown, i: number): void {
  const where = `entrée n°${i + 1}`;
  need(isObj(x), `${where} : format invalide`);
  need(isStr(x.id) && x.id, `${where} : identifiant manquant`);
  need(isLang(x.lang), `${where} : langue invalide`);
  need(isStr(x.headword) && x.headword.trim(), `${where} : mot manquant`);
  need(strArr(x.variants) && strArr(x.inflections), `${where} : variantes invalides`);
  need(optStr(x.reading) && optStr(x.ipa) && optStr(x.pitch) && optStr(x.readingsNote) && optStr(x.notes), `${where} : champ texte invalide`);
  need(isNum(x.createdAt) && isNum(x.updatedAt), `${where} : dates invalides`);
  need(isObj(x.source) && isStr(x.source.kind), `${where} : provenance invalide`);
  need(Array.isArray(x.senses), `${where} : sens invalides`);
  for (const s of x.senses as unknown[]) {
    need(isObj(s) && isStr(s.id), `${where} : sens sans identifiant`);
    need(isStr(s.pos) && (POS_LIST as string[]).includes(s.pos), `${where} : catégorie grammaticale inconnue`);
    need(strArr(s.translations), `${where} : traductions invalides`);
    need(optStr(s.definition) && optStr(s.posDetail) && optStr(s.domain) && optStr(s.register), `${where} : champ de sens invalide`);
    need(Array.isArray(s.examples), `${where} : exemples invalides`);
    for (const ex of s.examples as unknown[]) {
      need(isObj(ex) && isStr(ex.id) && isStr(ex.text), `${where} : exemple invalide`);
      need(optStr(ex.translation), `${where} : traduction d'exemple invalide`);
    }
  }
}

function checkCard(x: unknown, i: number): void {
  const where = `carte n°${i + 1}`;
  need(isObj(x), `${where} : format invalide`);
  need(isStr(x.id) && x.id, `${where} : identifiant manquant`);
  need(isLang(x.lang), `${where} : langue invalide`);
  need(x.kind === "recognition" || x.kind === "recall" || x.kind === "custom", `${where} : type inconnu`);
  need(typeof x.suspended === "boolean", `${where} : état invalide`);
  need(isNum(x.createdAt), `${where} : date invalide`);
  if (x.kind === "custom") need(isStr(x.question) && isStr(x.answer), `${where} : question ou réponse manquante`);
  else need(isStr(x.entryId), `${where} : entrée liée manquante`);
}

function checkState(x: unknown, i: number): void {
  const where = `état de révision n°${i + 1}`;
  need(isObj(x), `${where} : format invalide`);
  need(isStr(x.cardId), `${where} : carte manquante`);
  for (const k of ["due", "interval", "ease", "reps", "lapses", "successes", "failures", "hintedSuccesses"]) {
    need(isNum(x[k]), `${where} : « ${k} » invalide`);
  }
  need(x.lastReviewAt === undefined || isNum(x.lastReviewAt), `${where} : dernière révision invalide`);
  need(Array.isArray(x.history), `${where} : historique invalide`);
}

function checkStat(x: unknown, i: number): void {
  const where = `statistique d'exercice n°${i + 1}`;
  need(isObj(x) && isStr(x.exerciseId) && isLang(x.lang), `${where} : format invalide`);
  need(isNum(x.tries) && isNum(x.correct) && isNum(x.lastAt), `${where} : nombres invalides`);
}

function checkDay(x: unknown, i: number): void {
  const where = `journée d'étude n°${i + 1}`;
  need(isObj(x) && isStr(x.key) && isStr(x.date) && isLang(x.lang), `${where} : format invalide`);
  need(isNum(x.seconds) && isNum(x.answers) && isNum(x.correct), `${where} : nombres invalides`);
}

function checkProg(x: unknown): boolean {
  return x === undefined || (isObj(x) && isNum(x.box) && isNum(x.seen) && isNum(x.ok) && isNum(x.due) && (x.lastAt === undefined || isNum(x.lastAt)));
}

function checkDeck(x: unknown, i: number): void {
  const where = `paquet n°${i + 1}`;
  need(isObj(x) && isStr(x.id) && x.id && isLang(x.lang) && isStr(x.name), `${where} : format invalide`);
  need(isNum(x.createdAt) && isNum(x.updatedAt), `${where} : dates invalides`);
  need(x.bestMatchMs === undefined || isNum(x.bestMatchMs), `${where} : meilleur temps invalide`);
}

function checkDeckCard(x: unknown, i: number): void {
  const where = `carte de paquet n°${i + 1}`;
  need(isObj(x) && isStr(x.id) && x.id && isStr(x.deckId) && isLang(x.lang), `${where} : format invalide`);
  need(isStr(x.front) && isStr(x.back) && optStr(x.reading), `${where} : textes invalides`);
  need(isNum(x.createdAt) && isNum(x.updatedAt), `${where} : dates invalides`);
  need(checkProg(x.fwd) && checkProg(x.rev), `${where} : progression invalide`);
}

function checkWriting(x: unknown, i: number): void {
  const where = `résultat d'écriture n°${i + 1}`;
  need(isObj(x) && isStr(x.char) && x.char.length > 0 && x.char.length <= 2, `${where} : format invalide`);
  need(x.kind === "hiragana" || x.kind === "katakana" || x.kind === "kanji", `${where} : type invalide`);
  need(isNum(x.tries) && isNum(x.correct) && isNum(x.lastAt) && typeof x.lastCorrect === "boolean", `${where} : nombres invalides`);
}

function checkText(x: unknown, i: number): void {
  const where = `texte n°${i + 1}`;
  need(isObj(x) && isStr(x.id) && isLang(x.lang) && isStr(x.title), `${where} : format invalide`);
  need(x.kind === "text" || x.kind === "article" || x.kind === "podcast", `${where} : type invalide`);
  need(x.body === undefined || (isStr(x.body) && x.body.length <= MAX_TEXT_LENGTH), `${where} : contenu invalide ou trop long`);
  need(x.url === undefined || isStr(x.url), `${where} : adresse invalide`);
  need(x.notes === undefined || isStr(x.notes), `${where} : notes invalides`);
  need(isNum(x.createdAt) && isNum(x.updatedAt), `${where} : dates invalides`);
}

/** Complète les anciens champs manquants (utile quand le format évoluera). */
export function normalizeSettings(raw: unknown): Settings {
  const base = structuredCloneSafe(DEFAULT_SETTINGS);
  if (!isObj(raw)) return base;
  const r = raw as Partial<Settings> & Record<string, unknown>;
  if (r.theme === "auto" || r.theme === "light" || r.theme === "dark") base.theme = r.theme;
  if (r.reduceMotion === "auto" || r.reduceMotion === "on" || r.reduceMotion === "off") base.reduceMotion = r.reduceMotion;
  if (r.textSize === "normal" || r.textSize === "large" || r.textSize === "xlarge") base.textSize = r.textSize;
  if (isNum(r.ttsRate) && r.ttsRate >= 0.3 && r.ttsRate <= 1.6) base.ttsRate = r.ttsRate;
  if (isObj(r.ttsVoice)) {
    if (isStr(r.ttsVoice.en)) base.ttsVoice.en = r.ttsVoice.en;
    if (isStr(r.ttsVoice.ja)) base.ttsVoice.ja = r.ttsVoice.ja;
  }
  if (typeof r.autoCreateCards === "boolean") base.autoCreateCards = r.autoCreateCards;
  if (isNum(r.backupReminderDays) && r.backupReminderDays >= 0) base.backupReminderDays = r.backupReminderDays;
  if (isObj(r.langs)) {
    for (const l of LANGS) {
      const v = (r.langs as Record<string, unknown>)[l];
      if (!isObj(v)) continue;
      if (isStr(v.currentLevel)) base.langs[l].currentLevel = v.currentLevel;
      if (isStr(v.targetLevel)) base.langs[l].targetLevel = v.targetLevel;
      if (isNum(v.dailyMinutes) && v.dailyMinutes >= 0 && v.dailyMinutes <= 600) base.langs[l].dailyMinutes = v.dailyMinutes;
      if (isNum(v.newPerDay) && v.newPerDay >= 0 && v.newPerDay <= 200) base.langs[l].newPerDay = v.newPerDay;
    }
  }
  return base;
}

const blankProg = (): { box: number; seen: number; ok: number; due: number } => ({ box: 0, seen: 0, ok: 0, due: 0 });

function withDefaults(entries: Entry[], cards: Card[], states: ReviewState[], days: StudyDay[], deckCards: DeckCard[] = []): void {
  for (const c of deckCards) {
    c.fwd ??= blankProg();
    c.rev ??= blankProg();
  }
  for (const e of entries) {
    e.variants ??= [];
    e.inflections ??= [];
  }
  for (const c of cards) c.suspended ??= false;
  for (const s of states) s.history ??= [];
  for (const d of days) {
    d.unaided ??= d.correct;
    d.exercises ??= 0;
    d.exercisesCorrect ??= 0;
    d.newCards ??= 0;
    d.recognition ??= { n: 0, ok: 0 };
    d.recall ??= { n: 0, ok: 0 };
  }
}

/** Lit un fichier de sauvegarde. Refuse tout fichier invalide ou plus récent que cette version. */
export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "Ce fichier n'est pas un JSON lisible." };
  }
  try {
    need(isObj(raw), "Le fichier ne ressemble pas à une sauvegarde Lingua.");
    need(raw.app === BACKUP_APP, "Le fichier ne vient pas de Lingua.");
    need(isNum(raw.schemaVersion), "Version de sauvegarde manquante.");
    need(
      raw.schemaVersion <= SCHEMA_VERSION,
      `Cette sauvegarde vient d'une version plus récente de Lingua (format ${raw.schemaVersion}). Mets l'application à jour d'abord.`,
    );
    need(raw.schemaVersion >= 1, "Version de sauvegarde invalide.");
    need(isObj(raw.data), "Données manquantes.");
    const d = raw.data;
    const entries = (d.entries ?? []) as unknown[];
    const cards = (d.cards ?? []) as unknown[];
    const states = (d.reviewStates ?? []) as unknown[];
    const stats = (d.exerciseStats ?? []) as unknown[];
    const days = (d.studyLog ?? []) as unknown[];
    const texts = (d.texts ?? []) as unknown[]; // absent des sauvegardes faites avant la bibliothèque de textes
    const writing = (d.writing ?? []) as unknown[]; // absent des sauvegardes faites avant l'écriture
    const decks = (d.decks ?? []) as unknown[]; // absents des sauvegardes faites avant les paquets
    const deckCards = (d.deckCards ?? []) as unknown[];
    for (const [name, v] of [["decks", decks], ["deckCards", deckCards], ["writing", writing], ["entries", entries], ["cards", cards], ["reviewStates", states], ["exerciseStats", stats], ["studyLog", days], ["texts", texts]] as const) {
      need(Array.isArray(v), `La liste « ${name} » est invalide.`);
    }
    entries.forEach(checkEntry);
    cards.forEach(checkCard);
    states.forEach(checkState);
    stats.forEach(checkStat);
    days.forEach(checkDay);
    texts.forEach(checkText);
    writing.forEach(checkWriting);
    decks.forEach(checkDeck);
    deckCards.forEach(checkDeckCard);

    const warnings: string[] = [];
    const entryList = dedupeById(entries as Entry[], (e) => e.id, warnings, "entrées");
    const cardList = dedupeById(cards as Card[], (c) => c.id, warnings, "cartes");
    const stateList = dedupeById(states as ReviewState[], (s) => s.cardId, warnings, "états de révision");
    const statList = dedupeById(stats as ExerciseStat[], (s) => s.exerciseId, warnings, "statistiques d'exercices");
    const dayList = dedupeById(days as StudyDay[], (s) => s.key, warnings, "journées d'étude");
    const textList = dedupeById(texts as TextItem[], (t) => t.id, warnings, "textes");
    const deckList = dedupeById(decks as Deck[], (x) => x.id, warnings, "paquets");
    const deckCardList = dedupeById(deckCards as DeckCard[], (x) => x.id, warnings, "cartes de paquets");
    const deckIds = new Set(deckList.map((x) => x.id));
    for (const c of deckCardList) need(deckIds.has(c.deckId), "Une carte pointe vers un paquet qui n'existe pas : fichier incohérent.");
    const writingList = dedupeById(writing as WritingStat[], (w) => w.char, warnings, "résultats d'écriture");

    const entryIds = new Set(entryList.map((e) => e.id));
    for (const c of cardList) {
      need(c.kind === "custom" || (c.entryId && entryIds.has(c.entryId)), "Une carte pointe vers une entrée qui n'existe pas : fichier incohérent.");
    }
    const cardIds = new Set(cardList.map((c) => c.id));
    for (const s of stateList) need(cardIds.has(s.cardId), "Un état de révision pointe vers une carte qui n'existe pas : fichier incohérent.");

    withDefaults(entryList, cardList, stateList, dayList, deckCardList);
    return {
      ok: true,
      warnings,
      snapshot: {
        entries: entryList,
        cards: cardList,
        reviewStates: stateList,
        exerciseStats: statList,
        studyLog: dayList,
        texts: textList,
        writing: writingList,
        decks: deckList,
        deckCards: deckCardList,
        settings: normalizeSettings(d.settings),
      },
    };
  } catch (err) {
    if (err instanceof Invalid) return { ok: false, error: err.message };
    return { ok: false, error: "Fichier illisible." };
  }
}

function dedupeById<T>(list: T[], key: (x: T) => string, warnings: string[], label: string): T[] {
  const map = new Map<string, T>();
  let dup = 0;
  for (const x of list) {
    if (map.has(key(x))) dup++;
    map.set(key(x), x);
  }
  if (dup) warnings.push(`${dup} doublon(s) interne(s) ignoré(s) parmi les ${label}.`);
  return [...map.values()];
}

// --- fusion ---

export interface MergeReport {
  entriesAdded: number;
  entriesUpdated: number;
  entriesDuplicate: number; // même mot déjà présent sous un autre identifiant
  cardsAdded: number;
  cardsSkipped: number;
}

function betterState(a: ReviewState, b: ReviewState): ReviewState {
  const ta = a.lastReviewAt ?? 0;
  const tb = b.lastReviewAt ?? 0;
  if (ta !== tb) return ta > tb ? a : b;
  return a.reps >= b.reps ? a : b;
}

/**
 * Fusionne une sauvegarde dans les données existantes, sans jamais créer de doublon :
 * - même identifiant → on garde la version la plus récemment modifiée ;
 * - même mot (langue + écriture) sous un autre identifiant → l'entrée importée est ignorée et ses cartes sont rattachées à l'entrée existante ;
 * - cartes identiques (même entrée, même type) → une seule est conservée, avec l'état de révision le plus récent.
 * Les réglages existants sont conservés.
 */
export function mergeSnapshots(existing: Snapshot, incoming: Snapshot): { snapshot: Snapshot; report: MergeReport } {
  const report: MergeReport = { entriesAdded: 0, entriesUpdated: 0, entriesDuplicate: 0, cardsAdded: 0, cardsSkipped: 0 };

  // entrées
  const entries = new Map<string, Entry>(existing.entries.map((e) => [e.id, e]));
  // index « mot → entrées » pour repérer les doublons (même règle que le dictionnaire : une lecture manquante ne bloque pas)
  const index = new Map<string, { id: string; reading: string }[]>();
  const indexEntry = (e: Entry) => {
    const k = entryKey(e.lang, e.headword);
    const list = index.get(k) ?? [];
    list.push({ id: e.id, reading: e.reading ? normalizeForSearch(e.reading) : "" });
    index.set(k, list);
  };
  const findSameWord = (e: Entry): string | undefined => {
    const r = e.reading ? normalizeForSearch(e.reading) : "";
    return index.get(entryKey(e.lang, e.headword))?.find((c) => !r || !c.reading || c.reading === r)?.id;
  };
  existing.entries.forEach(indexEntry);
  const idMap = new Map<string, string>(); // id importé → id conservé
  for (const e of incoming.entries) {
    const cur = entries.get(e.id);
    if (cur) {
      idMap.set(e.id, e.id);
      if (e.updatedAt > cur.updatedAt) {
        entries.set(e.id, e);
        report.entriesUpdated++;
      }
      continue;
    }
    const sameWord = findSameWord(e);
    if (sameWord) {
      idMap.set(e.id, sameWord);
      report.entriesDuplicate++;
      continue;
    }
    entries.set(e.id, e);
    indexEntry(e);
    idMap.set(e.id, e.id);
    report.entriesAdded++;
  }

  // cartes
  const cards = new Map<string, Card>(existing.cards.map((c) => [c.id, c]));
  const cardSlot = new Map<string, string>(); // « entrée|type » → id de carte conservée
  for (const c of existing.cards) if (c.kind !== "custom" && c.entryId) cardSlot.set(`${c.entryId}|${c.kind}`, c.id);
  const customSlot = new Map<string, string>();
  for (const c of existing.cards) if (c.kind === "custom") customSlot.set(`${c.lang}|${c.question}|${c.answer}`, c.id);
  const cardIdMap = new Map<string, string>(); // id importé → id conservé
  for (const c of incoming.cards) {
    if (cards.has(c.id)) {
      cardIdMap.set(c.id, c.id);
      report.cardsSkipped++;
      continue;
    }
    if (c.kind === "custom") {
      const slot = `${c.lang}|${c.question}|${c.answer}`;
      const same = customSlot.get(slot);
      if (same) {
        cardIdMap.set(c.id, same);
        report.cardsSkipped++;
      } else {
        cards.set(c.id, c);
        customSlot.set(slot, c.id);
        cardIdMap.set(c.id, c.id);
        report.cardsAdded++;
      }
      continue;
    }
    const entryId = idMap.get(c.entryId!) ?? c.entryId!;
    const slot = `${entryId}|${c.kind}`;
    const same = cardSlot.get(slot);
    if (same) {
      cardIdMap.set(c.id, same);
      report.cardsSkipped++;
    } else {
      cards.set(c.id, { ...c, entryId });
      cardSlot.set(slot, c.id);
      cardIdMap.set(c.id, c.id);
      report.cardsAdded++;
    }
  }

  // états de révision
  const states = new Map<string, ReviewState>(existing.reviewStates.map((s) => [s.cardId, s]));
  for (const s of incoming.reviewStates) {
    const target = cardIdMap.get(s.cardId);
    if (!target) continue;
    const moved = { ...s, cardId: target };
    const cur = states.get(target);
    states.set(target, cur ? betterState(cur, moved) : moved);
  }

  // exercices : on garde, pour chaque exercice, le compteur le plus élevé (évite de compter deux fois un même import)
  const stats = new Map<string, ExerciseStat>(existing.exerciseStats.map((s) => [s.exerciseId, s]));
  for (const s of incoming.exerciseStats) {
    const cur = stats.get(s.exerciseId);
    if (!cur || s.tries > cur.tries) stats.set(s.exerciseId, s);
  }

  // journées d'étude : maximum de chaque compteur
  const days = new Map<string, StudyDay>(existing.studyLog.map((d) => [d.key, d]));
  for (const d of incoming.studyLog) {
    const cur = days.get(d.key);
    if (!cur) {
      days.set(d.key, d);
      continue;
    }
    days.set(d.key, {
      ...cur,
      seconds: Math.max(cur.seconds, d.seconds),
      answers: Math.max(cur.answers, d.answers),
      correct: Math.max(cur.correct, d.correct),
      unaided: Math.max(cur.unaided, d.unaided),
      exercises: Math.max(cur.exercises, d.exercises),
      exercisesCorrect: Math.max(cur.exercisesCorrect, d.exercisesCorrect),
      newCards: Math.max(cur.newCards, d.newCards),
      recognition: { n: Math.max(cur.recognition.n, d.recognition.n), ok: Math.max(cur.recognition.ok, d.recognition.ok) },
      recall: { n: Math.max(cur.recall.n, d.recall.n), ok: Math.max(cur.recall.ok, d.recall.ok) },
    });
  }

  // textes : même identifiant → le plus récemment modifié l'emporte
  const texts = new Map<string, TextItem>(existing.texts.map((t) => [t.id, t]));
  for (const t of incoming.texts) {
    const cur = texts.get(t.id);
    if (!cur || t.updatedAt > cur.updatedAt) texts.set(t.id, t);
  }

  // paquets et cartes : le plus récemment modifié l'emporte
  const decks = new Map<string, Deck>(existing.decks.map((x) => [x.id, x]));
  for (const x of incoming.decks) {
    const cur = decks.get(x.id);
    if (!cur || x.updatedAt > cur.updatedAt) decks.set(x.id, x);
  }
  const deckCards = new Map<string, DeckCard>(existing.deckCards.map((x) => [x.id, x]));
  for (const x of incoming.deckCards) {
    const cur = deckCards.get(x.id);
    if (!cur || x.updatedAt > cur.updatedAt) deckCards.set(x.id, x);
  }

  // écriture : pour chaque caractère, le compteur le plus élevé
  const writing = new Map<string, WritingStat>(existing.writing.map((w) => [w.char, w]));
  for (const w of incoming.writing) {
    const cur = writing.get(w.char);
    if (!cur || w.tries > cur.tries) writing.set(w.char, w);
  }

  return {
    snapshot: {
      entries: [...entries.values()],
      cards: [...cards.values()],
      reviewStates: [...states.values()],
      exerciseStats: [...stats.values()],
      studyLog: [...days.values()],
      texts: [...texts.values()],
      writing: [...writing.values()],
      decks: [...decks.values()],
      deckCards: [...deckCards.values()],
      settings: existing.settings,
    },
    report,
  };
}

export function backupFileName(now: number): string {
  const d = new Date(now);
  const p = (n: number) => String(n).padStart(2, "0");
  return `lingua-sauvegarde-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}
