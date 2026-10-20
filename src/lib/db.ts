// Stockage local dans IndexedDB (la base de données intégrée au navigateur).
//
// Pourquoi pas une bibliothèque ? Les besoins de Lingua sont simples (lire tout, écrire plusieurs choses
// d'un coup, tout effacer). Cette petite couche suffit et garde l'application légère.
// Tout accès à la base passe par CE fichier : si un jour on veut passer à Dexie, on ne change que lui.
//
// Migrations : pour changer la structure, on ajoute une fonction à la fin de MIGRATIONS (et on garde les anciennes).
// Le numéro de version de la base = nombre de migrations.

import { Entry, Card, ReviewState, ExerciseStat, StudyDay, Settings, Snapshot, TextItem, WritingStat, Deck, DeckCard, DEFAULT_SETTINGS } from "./types";
import { normalizeSettings } from "./backup";

export type StoreName = "entries" | "cards" | "reviewStates" | "exerciseStats" | "studyLog" | "texts" | "writing" | "decks" | "deckCards" | "settings" | "meta";

const KEY_PATHS: Record<StoreName, string> = {
  entries: "id",
  cards: "id",
  reviewStates: "cardId",
  exerciseStats: "exerciseId",
  studyLog: "key",
  texts: "id",
  writing: "char",
  decks: "id",
  deckCards: "id",
  settings: "key",
  meta: "key",
};

const DB_NAME = "lingua";

const MIGRATIONS: Array<(db: IDBDatabase) => void> = [
  // version 1 : création des tables
  (db) => {
    (["entries", "cards", "reviewStates", "exerciseStats", "studyLog", "settings", "meta"] as StoreName[]).forEach((name) => {
      if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: KEY_PATHS[name] });
    });
  },
  // version 2 : bibliothèque de textes (lecture, actualités, podcasts)
  (db) => {
    if (!db.objectStoreNames.contains("texts")) db.createObjectStore("texts", { keyPath: KEY_PATHS.texts });
  },
  // version 3 : résultats d'écriture (kana, kanji)
  (db) => {
    if (!db.objectStoreNames.contains("writing")) db.createObjectStore("writing", { keyPath: KEY_PATHS.writing });
  },
  // version 4 : paquets de flashcards et leurs cartes
  (db) => {
    for (const name of ["decks", "deckCards"] as StoreName[]) {
      if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: KEY_PATHS[name] });
    }
  },
];

export const DB_VERSION = MIGRATIONS.length;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB n'est pas disponible dans ce navigateur."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (ev) => {
      const db = req.result;
      for (let v = ev.oldVersion; v < DB_VERSION; v++) MIGRATIONS[v](db);
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => reject(req.error ?? new Error("Impossible d'ouvrir la base locale."));
    req.onblocked = () => reject(new Error("La base est bloquée par un autre onglet de Lingua : ferme-le puis recharge."));
  }).catch((err) => {
    dbPromise = null;
    throw err;
  });
  return dbPromise;
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDb();
  return reqToPromise(db.transaction(store, "readonly").objectStore(store).getAll() as IDBRequest<T[]>);
}

export async function getOne<T>(store: StoreName, key: string): Promise<T | undefined> {
  const db = await openDb();
  return reqToPromise(db.transaction(store, "readonly").objectStore(store).get(key) as IDBRequest<T | undefined>);
}

export interface WriteOp {
  store: StoreName;
  put?: unknown[];
  del?: string[];
  clear?: boolean;
}

/** Plusieurs écritures en UNE transaction : tout est enregistré, ou rien. */
export async function write(ops: WriteOp[]): Promise<void> {
  if (ops.length === 0) return;
  const db = await openDb();
  const names = [...new Set(ops.map((o) => o.store))];
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(names, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Écriture impossible."));
    tx.onabort = () => reject(tx.error ?? new Error("Écriture annulée (espace de stockage plein ?)."));
    try {
      for (const op of ops) {
        const os = tx.objectStore(op.store);
        if (op.clear) os.clear();
        for (const k of op.del ?? []) os.delete(k);
        for (const v of op.put ?? []) os.put(v);
      }
    } catch (err) {
      tx.abort();
      reject(err);
    }
  });
}

// --- chargement / remplacement complet ---

const SETTINGS_KEY = "app";

export async function loadSnapshot(): Promise<Snapshot> {
  const [entries, cards, reviewStates, exerciseStats, studyLog, texts, writing, decks, deckCards, settingsRows] = await Promise.all([
    getAll<Entry>("entries"),
    getAll<Card>("cards"),
    getAll<ReviewState>("reviewStates"),
    getAll<ExerciseStat>("exerciseStats"),
    getAll<StudyDay>("studyLog"),
    getAll<TextItem>("texts"),
    getAll<WritingStat>("writing"),
    getAll<Deck>("decks"),
    getAll<DeckCard>("deckCards"),
    getAll<Settings & { key: string }>("settings"),
  ]);
  const row = settingsRows.find((r) => r.key === SETTINGS_KEY);
  return { entries, cards, reviewStates, exerciseStats, studyLog, texts, writing, decks, deckCards, settings: row ? normalizeSettings(row) : normalizeSettings(DEFAULT_SETTINGS) };
}

export function settingsRecord(settings: Settings): Settings & { key: string } {
  return { ...settings, key: SETTINGS_KEY };
}

/** Remplace TOUT le contenu de la base par `snap` (dans une seule transaction). */
export async function replaceAll(snap: Snapshot): Promise<void> {
  await write([
    { store: "entries", clear: true, put: snap.entries },
    { store: "cards", clear: true, put: snap.cards },
    { store: "reviewStates", clear: true, put: snap.reviewStates },
    { store: "exerciseStats", clear: true, put: snap.exerciseStats },
    { store: "studyLog", clear: true, put: snap.studyLog },
    { store: "texts", clear: true, put: snap.texts },
    { store: "writing", clear: true, put: snap.writing },
    { store: "decks", clear: true, put: snap.decks },
    { store: "deckCards", clear: true, put: snap.deckCards },
    { store: "settings", clear: true, put: [settingsRecord(snap.settings)] },
  ]);
}

// --- métadonnées (dernière sauvegarde, etc.) ---

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const row = await getOne<{ key: string; value: T }>("meta", key);
  return row?.value;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await write([{ store: "meta", put: [{ key, value }] }]);
}

/** Demande au navigateur de ne pas effacer les données (important sur iPhone / iPad). */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    }
  } catch {
    /* ignore */
  }
  return false;
}
