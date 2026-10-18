// Cartes : création à partir des entrées, préparation de la question, QCM, file de session.

import { Card, Entry, Lang, ReviewState } from "./types";
import { uid } from "./ids";
import { normalizeForSearch } from "./search";
import { isNewCard, isDue } from "./srs";
import { makeHint } from "./answers";
import { dayKey } from "./dates";

export type Rng = () => number;

export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Traduction courte d'une entrée : première traduction de chaque sens (3 max), sinon première définition. */
export function entryGloss(e: Entry): string {
  const parts: string[] = [];
  for (const s of e.senses) {
    const t = s.translations.map((x) => x.trim()).find(Boolean);
    if (t && !parts.includes(t)) parts.push(t);
    if (parts.length >= 3) break;
  }
  if (parts.length) return parts.join(" ; ");
  for (const s of e.senses) if (s.definition?.trim()) return s.definition.trim();
  return "";
}

export function acceptedAnswers(e: Entry): string[] {
  const list = [e.headword, ...e.variants];
  if (e.reading) list.push(e.reading);
  return list.map((x) => x.trim()).filter(Boolean);
}

export function canMakeCards(e: Entry): boolean {
  return entryGloss(e) !== "";
}

export function makeEntryCards(e: Entry, now: number): Card[] {
  if (!canMakeCards(e)) return [];
  return (["recognition", "recall"] as const).map((kind) => ({
    id: uid("card"),
    lang: e.lang,
    kind,
    entryId: e.id,
    suspended: false,
    createdAt: now,
  }));
}

/** Phrase d'exemple où le mot est masqué (« révision à partir d'une phrase »). */
export function clozeFor(e: Entry): { text: string; translation?: string } | null {
  const forms = [e.headword, ...e.variants, ...e.inflections]
    .map((x) => x.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (!forms.length) return null;
  for (const s of e.senses) {
    for (const ex of s.examples) {
      for (const f of forms) {
        let replaced: string;
        if (e.lang === "en") {
          // le mot doit être un mot entier (sinon « reluctantly » deviendrait « _____ly »)
          const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "giu");
          replaced = ex.text.replace(re, (_m, before: string) => `${before}_____`);
        } else {
          replaced = ex.text.split(f).join("＿＿＿");
        }
        if (replaced !== ex.text) return { text: replaced, translation: ex.translation };
      }
    }
  }
  return null;
}

export type CardMode = "mcq" | "typed" | "flip";

export interface Presentation {
  cardId: string;
  lang: Lang;
  kind: Card["kind"];
  mode: CardMode;
  prompt: string; // gros texte (mot ou traduction)
  promptLabel: string; // petite consigne
  context?: string; // phrase à trous
  contextTranslation?: string;
  options?: string[];
  correctIndex?: number;
  accepted: string[]; // réponses acceptées (mode typed)
  answerDisplay: string; // réponse montrée après coup
  hint: string;
  extra?: { reading?: string; ipa?: string; example?: string; exampleTranslation?: string; notes?: string; entryId?: string };
  speakText?: string;
}

export function distractorsFor(entry: Entry, entries: Entry[], n: number, rng: Rng): string[] {
  const correct = entryGloss(entry);
  const norm = (s: string) => normalizeForSearch(s);
  const pos = entry.senses[0]?.pos;
  const seen = new Set<string>([norm(correct)]);
  const pool = shuffle(
    entries.filter((x) => x.id !== entry.id && x.lang === entry.lang && entryGloss(x) !== ""),
    rng,
  );
  const samePos = pool.filter((x) => x.senses[0]?.pos === pos);
  const others = pool.filter((x) => x.senses[0]?.pos !== pos);
  const out: string[] = [];
  for (const x of [...samePos, ...others]) {
    const g = entryGloss(x);
    const k = norm(g);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(g);
    if (out.length >= n) break;
  }
  return out;
}

export function prepareCard(card: Card, entries: Entry[], rng: Rng = Math.random): Presentation | null {
  if (card.kind === "custom") {
    if (!card.question || !card.answer) return null;
    return {
      cardId: card.id,
      lang: card.lang,
      kind: "custom",
      mode: "typed",
      prompt: card.question,
      promptLabel: "Écris la réponse",
      accepted: [card.answer, ...(card.alternatives ?? [])],
      answerDisplay: card.answer,
      hint: card.hint?.trim() || makeHint(card.answer, card.lang),
      extra: { notes: card.note },
    };
  }

  const entry = entries.find((e) => e.id === card.entryId);
  if (!entry) return null;
  const gloss = entryGloss(entry);
  if (!gloss) return null;
  const firstExample = entry.senses.flatMap((s) => s.examples)[0];
  const extra = {
    reading: entry.reading,
    ipa: entry.ipa,
    example: firstExample?.text,
    exampleTranslation: firstExample?.translation,
    notes: entry.notes,
    entryId: entry.id,
  };

  if (card.kind === "recognition") {
    const wrong = distractorsFor(entry, entries, 3, rng);
    if (wrong.length === 0) {
      return {
        cardId: card.id,
        lang: card.lang,
        kind: "recognition",
        mode: "flip",
        prompt: entry.headword,
        promptLabel: "Que signifie ce mot ?",
        accepted: [],
        answerDisplay: gloss,
        hint: "",
        extra,
        speakText: entry.headword,
      };
    }
    const options = shuffle([gloss, ...wrong], rng);
    return {
      cardId: card.id,
      lang: card.lang,
      kind: "recognition",
      mode: "mcq",
      prompt: entry.headword,
      promptLabel: "Que signifie ce mot ?",
      options,
      correctIndex: options.indexOf(gloss),
      accepted: [],
      answerDisplay: gloss,
      hint: "",
      extra,
      speakText: entry.headword,
    };
  }

  // recall : traduction → mot, écrit
  const cloze = clozeFor(entry);
  const posLabel = entry.senses[0]?.pos;
  return {
    cardId: card.id,
    lang: card.lang,
    kind: "recall",
    mode: "typed",
    prompt: gloss,
    promptLabel: entry.lang === "ja" ? "Écris le mot en japonais (kana, kanji ou romaji)" : "Écris le mot en anglais",
    context: cloze?.text,
    contextTranslation: cloze?.translation,
    accepted: acceptedAnswers(entry),
    answerDisplay: entry.reading && entry.reading !== entry.headword ? `${entry.headword}（${entry.reading}）` : entry.headword,
    hint: makeHint(entry.lang === "ja" && entry.reading ? entry.reading : entry.headword, entry.lang),
    extra: { ...extra, notes: [posLabel ? `(${posLabel})` : "", entry.notes ?? ""].filter(Boolean).join(" ") || undefined },
    speakText: entry.headword,
  };
}

// --- file d'attente d'une session ---

export interface QueueOptions {
  lang: Lang;
  now: number;
  /** nombre de nouvelles cartes autorisées dans cette session (déjà réduit de celles vues aujourd'hui) */
  newLimit: number;
  maxReviews?: number;
}

export interface QueueResult {
  due: Card[];
  fresh: Card[];
}

const KIND_ORDER: Record<Card["kind"], number> = { recognition: 0, recall: 1, custom: 2 };

export function buildQueue(
  cards: Card[],
  states: Map<string, ReviewState>,
  entryIds: Set<string>,
  opts: QueueOptions,
): QueueResult {
  const usable = cards.filter(
    (c) => c.lang === opts.lang && !c.suspended && (c.kind === "custom" || (c.entryId && entryIds.has(c.entryId))),
  );

  const due = usable
    .filter((c) => isDue(states.get(c.id), opts.now))
    .sort((a, b) => states.get(a.id)!.due - states.get(b.id)!.due)
    .slice(0, opts.maxReviews ?? 200);

  // Une carte « rappel » n'est proposée que lorsque la carte « reconnaissance » du même mot a déjà été réussie une fois :
  // on voit d'abord le mot, on l'écrit ensuite (au moins un jour plus tard).
  const recognitionByEntry = new Map<string, Card>();
  for (const c of usable) if (c.kind === "recognition" && c.entryId) recognitionByEntry.set(c.entryId, c);

  const fresh = usable
    .filter((c) => isNewCard(states.get(c.id)))
    .filter((c) => {
      if (c.kind !== "recall" || !c.entryId) return true;
      const sibling = recognitionByEntry.get(c.entryId);
      if (!sibling) return true;
      const st = states.get(sibling.id);
      return !!st && st.reps >= 1;
    })
    .sort((a, b) => a.createdAt - b.createdAt || KIND_ORDER[a.kind] - KIND_ORDER[b.kind])
    .slice(0, Math.max(0, opts.newLimit));

  return { due, fresh };
}

/** Nombre de cartes de cette langue présentées pour la première fois aujourd'hui. */
export function introducedToday(cards: Card[], states: Map<string, ReviewState>, lang: Lang, now: number): number {
  const today = dayKey(now);
  let n = 0;
  for (const c of cards) {
    if (c.lang !== lang) continue;
    if (states.get(c.id)?.introducedOn === today) n++;
  }
  return n;
}
