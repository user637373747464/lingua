// Tous les types de données de Lingua.
// Les dates sont stockées en millisecondes (Date.now()).
// Les relations utilisent des identifiants stables (jamais le texte affiché).

export type Lang = "en" | "ja";
export const LANGS: Lang[] = ["en", "ja"];

export type Pos =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "determiner"
  | "preposition"
  | "conjunction"
  | "interjection"
  | "expression"
  | "particle"
  | "other";

export const POS_LABELS: Record<Pos, string> = {
  noun: "nom",
  verb: "verbe",
  adjective: "adjectif",
  adverb: "adverbe",
  pronoun: "pronom",
  determiner: "déterminant",
  preposition: "préposition",
  conjunction: "conjonction",
  interjection: "interjection",
  expression: "expression / locution",
  particle: "particule grammaticale",
  other: "autre",
};

export const POS_LIST = Object.keys(POS_LABELS) as Pos[];

/** Catégories propres au japonais (champ « précision » d'un sens). */
export const JA_POS_DETAILS = [
  "verbe godan (u)",
  "verbe ichidan (ru)",
  "verbe irrégulier (する / 来る)",
  "adjectif en い",
  "adjectif en な",
  "adverbe",
  "compteur",
  "nom d'action (+ する)",
];

export interface Example {
  id: string;
  text: string;
  translation?: string;
  context?: string;
  register?: string;
  source?: string;
}

export interface Sense {
  id: string;
  pos: Pos;
  posDetail?: string;
  definition?: string;
  translations: string[];
  domain?: string;
  register?: string;
  examples: Example[];
}

export type SourceKind = "manual" | "starter" | "import" | "reading";

export interface EntrySource {
  kind: SourceKind;
  title?: string;
  url?: string;
  sentence?: string;
  note?: string;
}

export interface Entry {
  id: string;
  lang: Lang;
  headword: string;
  variants: string[];
  inflections: string[];
  reading?: string; // kana (japonais) ou prononciation écrite
  ipa?: string;
  pitch?: string; // accent tonal (japonais) — seulement si l'utilisateur le connaît
  readingsNote?: string; // lectures des kanji (on / kun)
  senses: Sense[];
  notes?: string;
  source: EntrySource;
  createdAt: number;
  updatedAt: number;
}

export type CardKind = "recognition" | "recall" | "custom";

export interface Card {
  id: string;
  lang: Lang;
  kind: CardKind;
  entryId?: string; // recognition / recall
  question?: string; // custom
  answer?: string; // custom
  alternatives?: string[]; // custom : autres réponses acceptées
  hint?: string;
  note?: string;
  suspended: boolean;
  createdAt: number;
}

export type Grade = "again" | "hard" | "good" | "easy";

export interface ReviewEvent {
  t: number;
  grade: Grade;
  ok: boolean;
  hinted: boolean;
}

export interface ReviewState {
  cardId: string;
  due: number;
  interval: number; // jours
  ease: number;
  reps: number; // réussites consécutives depuis le dernier échec
  lapses: number; // oublis d'une carte déjà apprise
  successes: number;
  failures: number;
  hintedSuccesses: number;
  lastReviewAt?: number;
  introducedOn?: string; // AAAA-MM-JJ du premier passage
  history: ReviewEvent[];
}

export interface ExerciseStat {
  exerciseId: string;
  lang: Lang;
  topic: string;
  level: string;
  tries: number;
  correct: number;
  lastAt: number;
  lastCorrect: boolean;
}

export interface KindCounter {
  n: number;
  ok: number;
}

export interface StudyDay {
  key: string; // "AAAA-MM-JJ|lang"
  date: string;
  lang: Lang;
  seconds: number;
  answers: number;
  correct: number;
  unaided: number; // réponses justes sans indice
  exercises: number;
  exercisesCorrect: number;
  newCards: number;
  recognition: KindCounter;
  recall: KindCounter;
}

export type ThemeSetting = "auto" | "light" | "dark";

export interface LangSettings {
  currentLevel: string;
  targetLevel: string;
  dailyMinutes: number;
  newPerDay: number;
}

export interface Settings {
  theme: ThemeSetting;
  reduceMotion: "auto" | "on" | "off";
  textSize: "normal" | "large" | "xlarge";
  ttsRate: number;
  ttsVoice: { en?: string; ja?: string };
  autoCreateCards: boolean;
  backupReminderDays: number;
  langs: Record<Lang, LangSettings>;
}

export type TextKind = "text" | "article" | "podcast";

/** Un texte à lire (collé par l'utilisateur) et/ou un lien (article, podcast, vidéo) avec ses notes. */
export interface TextItem {
  id: string;
  lang: Lang;
  kind: TextKind;
  title: string;
  url?: string;
  body?: string; // texte collé, lisible avec les mots tactiles
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export const MAX_TEXT_LENGTH = 200_000;

export interface Snapshot {
  entries: Entry[];
  cards: Card[];
  reviewStates: ReviewState[];
  exerciseStats: ExerciseStat[];
  studyLog: StudyDay[];
  texts: TextItem[];
  settings: Settings;
}

export const LANG_INFO: Record<
  Lang,
  { name: string; short: string; glyph: string; levels: string[]; defaultCurrent: string; defaultTarget: string }
> = {
  en: {
    name: "English",
    short: "EN",
    glyph: "Aa",
    levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    defaultCurrent: "B1",
    defaultTarget: "C1",
  },
  ja: {
    name: "日本語",
    short: "JA",
    glyph: "あ",
    levels: ["Débutant", "N5", "N4", "N3", "N2", "N1"],
    defaultCurrent: "Débutant",
    defaultTarget: "N3",
  },
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "auto",
  reduceMotion: "auto",
  textSize: "normal",
  ttsRate: 0.9,
  ttsVoice: {},
  autoCreateCards: true,
  backupReminderDays: 7,
  langs: {
    en: { currentLevel: "B1", targetLevel: "C1", dailyMinutes: 30, newPerDay: 10 },
    ja: { currentLevel: "Débutant", targetLevel: "N3", dailyMinutes: 30, newPerDay: 10 },
  },
};

export function emptySnapshot(): Snapshot {
  return {
    entries: [],
    cards: [],
    reviewStates: [],
    exerciseStats: [],
    studyLog: [],
    texts: [],
    settings: structuredCloneSafe(DEFAULT_SETTINGS),
  };
}

export function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
