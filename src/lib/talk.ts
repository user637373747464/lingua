// Conversations guidées SANS intelligence artificielle : des dialogues écrits d'avance.
// À chaque tour, la personne parle, et l'apprenant choisit la réponse la plus adaptée parmi 3.
// Fonctions pures, testées dans tests/talk.test.ts.

import { Lang } from "./types";
import { StoryLevel } from "./stories";

export type TalkLevel = StoryLevel;

export interface Line {
  /** texte dans la langue apprise */
  t: string;
  /** traduction française */
  fr: string;
}

export interface Option extends Line {
  /** la bonne réponse (une seule par tour) */
  ok?: boolean;
  /** pourquoi cette réponse ne convient pas (en français) : seulement pour les mauvaises */
  why?: string;
}

export interface Turn {
  npc: Line;
  options: Option[];
}

export interface Talk {
  id: string;
  lang: Lang;
  level: TalkLevel;
  title: string;
  titleFr: string;
  /** nom de la personne qui te parle */
  npcName: string;
  /** qui est-ce, en français (ex. « Le serveur du café ») */
  role: string;
  /** la situation, en français */
  setting: string;
  /** ce que tu dois réussir à faire, en français */
  goal: string;
  turns: Turn[];
  /** dernière réplique de la personne, quand tout est fini */
  end: Line;
}

type Good = [t: string, fr: string];
type Bad = [t: string, fr: string, why: string];

/** Écrire un tour : la phrase de la personne, la bonne réponse, puis deux réponses qui ne conviennent pas. */
export function turn(npc: string, npcFr: string, good: Good, bad1: Bad, bad2: Bad): Turn {
  return {
    npc: { t: npc, fr: npcFr },
    options: [
      { t: good[0], fr: good[1], ok: true },
      { t: bad1[0], fr: bad1[1], why: bad1[2] },
      { t: bad2[0], fr: bad2[1], why: bad2[2] },
    ],
  };
}

export const MIN_TURNS = 20;

// ---------- ordre des choix ----------

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Ordre des 3 choix d'un tour : mélangé, mais toujours le même pour un tour donné (donc testable). */
export function choiceOrder(talkId: string, turnIndex: number, salt = 0): number[] {
  const order = [0, 1, 2];
  let h = hash(`${talkId}#${turnIndex}#${salt}`);
  for (let i = 2; i > 0; i--) {
    const j = h % (i + 1);
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function orderedOptions(talk: Talk, turnIndex: number, salt = 0): Option[] {
  const turn = talk.turns[turnIndex];
  return choiceOrder(talk.id, turnIndex, salt).map((i) => turn.options[i]);
}

// ---------- score ----------

/** Pourcentage de tours réussis du premier coup. */
export function scorePercent(total: number, firstTry: number): number {
  return total <= 0 ? 0 : Math.round((100 * firstTry) / total);
}

export function scoreMessage(pct: number): string {
  if (pct >= 90) return "Excellent : tu réagis comme dans la vraie vie.";
  if (pct >= 70) return "Très bien. Relis les explications des erreurs, puis rejoue.";
  if (pct >= 50) return "Pas mal. Rejoue en lisant bien chaque réponse avant de choisir.";
  return "C'est le but : on apprend avec les erreurs. Active les traductions et rejoue.";
}
