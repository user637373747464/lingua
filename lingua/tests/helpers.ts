import { Entry, Card, Lang, Pos, ReviewState, Snapshot, emptySnapshot } from "../src/lib/types";

let n = 0;
export function mkEntry(over: Partial<Entry> & { headword: string; lang?: Lang; tr?: string[]; pos?: Pos; ex?: [string, string] }): Entry {
  const { tr, pos, ex, ...rest } = over;
  n++;
  return {
    id: `e${n}`,
    lang: "en",
    variants: [],
    inflections: [],
    senses: [
      {
        id: `s${n}`,
        pos: pos ?? "noun",
        translations: tr ?? ["traduction"],
        examples: ex ? [{ id: `x${n}`, text: ex[0], translation: ex[1] }] : [],
      },
    ],
    source: { kind: "manual" },
    createdAt: 1000 + n,
    updatedAt: 1000 + n,
    ...rest,
  } as Entry;
}

export function mkCard(entryId: string, kind: "recognition" | "recall", lang: Lang = "en", createdAt = 1): Card {
  n++;
  return { id: `c${n}`, lang, kind, entryId, suspended: false, createdAt };
}

export function mkSnapshot(entries: Entry[], cards: Card[] = [], states: ReviewState[] = []): Snapshot {
  return { ...emptySnapshot(), entries, cards, reviewStates: states };
}

/** Générateur pseudo-aléatoire déterministe (pour des tests reproductibles). */
export function seeded(seed = 42): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
