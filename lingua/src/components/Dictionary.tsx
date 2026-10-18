"use client";

import React, { useMemo, useRef, useState } from "react";
import { Entry, LANG_INFO, Lang, POS_LABELS, POS_LIST, Pos } from "../lib/types";
import { useData } from "../lib/store";
import { searchEntries } from "../lib/search";
import { entryGloss } from "../lib/cards";
import { MASTERY_LABELS, masteryOf } from "../lib/stats";
import { buildStarterEntries, STARTER_COUNT } from "../lib/content/starter";
import { csvToWords, jsonToWords, wordsToEntries } from "../lib/csv";
import { findDuplicate } from "../lib/search";
import { EmptyState, Icon, Modal, PageHead, SpeakButton, Txt, useToast } from "./ui";

export default function Dictionary({ lang }: { lang: Lang }) {
  const { snapshot, statesById, addEntries } = useData();
  const notify = useToast();
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<Pos | "">("");
  const [showImport, setShowImport] = useState(false);
  const info = LANG_INFO[lang];

  const total = useMemo(() => snapshot.entries.filter((e) => e.lang === lang).length, [snapshot.entries, lang]);
  const results = useMemo(() => searchEntries(snapshot.entries, query, { lang, pos }), [snapshot.entries, query, lang, pos]);

  const addStarter = async () => {
    try {
      const existing = snapshot.entries;
      const fresh = buildStarterEntries(lang, Date.now()).filter((e) => !findDuplicate(existing, lang, e.headword, e.reading));
      await addEntries(fresh, snapshot.settings.autoCreateCards);
      notify(`${fresh.length} mots ajoutés.`, "ok");
    } catch (e) {
      notify(`Ajout impossible : ${e instanceof Error ? e.message : e}`, "error");
    }
  };

  return (
    <div className="page">
      <PageHead
        title="Dictionnaire"
        sub={`${info.name} · ${total} mot${total > 1 ? "s" : ""}`}
        onBack={() => (window.location.hash = `#/${lang}`)}
        actions={
          <a className="btn primary" href={`#/${lang}/dictionary/new`}>
            <Icon name="plus" size={18} /> Ajouter
          </a>
        }
      />

      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={18} />
          <input
            className="input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "ja" ? "Chercher : 食べる, たべる, taberu, manger…" : "Chercher un mot, une traduction…"}
            aria-label="Rechercher dans le dictionnaire"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </label>
        <select className="select" value={pos} onChange={(e) => setPos(e.target.value as Pos | "")} aria-label="Filtrer par catégorie grammaticale">
          <option value="">Toutes catégories</option>
          {POS_LIST.map((p) => (
            <option key={p} value={p}>
              {POS_LABELS[p]}
            </option>
          ))}
        </select>
        <button className="btn" onClick={() => setShowImport(true)}>
          <Icon name="upload" size={18} /> Importer
        </button>
      </div>

      {total === 0 ? (
        <EmptyState title="Ton dictionnaire est vide">
          Ajoute ton premier mot, importe une liste (CSV ou JSON), ou commence avec un petit paquet de {STARTER_COUNT[lang]} mots courants que tu pourras modifier et supprimer.
          <div className="row center wrap" style={{ marginTop: 14 }}>
            <a className="btn primary" href={`#/${lang}/dictionary/new`}>
              Ajouter un mot
            </a>
            <button className="btn" onClick={addStarter}>
              Ajouter le paquet de démarrage
            </button>
          </div>
        </EmptyState>
      ) : results.length === 0 ? (
        <EmptyState title="Aucun résultat">
          Rien ne correspond à « {query} ».
          <div className="row center" style={{ marginTop: 14 }}>
            <a className="btn primary" href={`#/${lang}/dictionary/new?w=${encodeURIComponent(query)}`}>
              Ajouter « {query} »
            </a>
          </div>
        </EmptyState>
      ) : (
        <ul className="list">
          {results.map((e) => (
            <EntryRow key={e.id} entry={e} mastery={masteryOf(e.id, snapshot.cards, statesById)} hasCards={snapshot.cards.some((c) => c.entryId === e.id)} />
          ))}
        </ul>
      )}

      {showImport && <ImportModal lang={lang} onClose={() => setShowImport(false)} />}
    </div>
  );
}

function EntryRow({ entry, mastery, hasCards }: { entry: Entry; mastery: keyof typeof MASTERY_LABELS; hasCards: boolean }) {
  const pos = entry.senses[0]?.pos;
  return (
    <li className="row-item">
      <a className="row-link grow" href={`#/${entry.lang}/dictionary/${entry.id}`}>
        <div className="grow">
          <div className="entry-title">
            <Txt lang={entry.lang} className="headword">
              {entry.headword}
            </Txt>
            {entry.reading && entry.reading !== entry.headword && (
              <Txt lang={entry.lang} className="reading muted">
                {entry.reading}
              </Txt>
            )}
          </div>
          <div className="muted small clamp">
            {pos && <em>{POS_LABELS[pos]} · </em>}
            {entryGloss(entry) || "—"}
          </div>
        </div>
        <span className={`badge m-${mastery}`}>{hasCards ? MASTERY_LABELS[mastery] : "sans carte"}</span>
        <Icon name="next" size={18} />
      </a>
      <SpeakButton text={entry.reading && entry.lang === "ja" ? entry.reading : entry.headword} lang={entry.lang} />
    </li>
  );
}

// ---------- import CSV / JSON ----------

function ImportModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const { snapshot, addEntries } = useData();
  const notify = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ entries: Entry[]; duplicates: number } | null>(null);

  const readFile = async (file: File) => {
    setError(null);
    setPreview(null);
    try {
      if (file.size > 5_000_000) throw new Error("Fichier trop volumineux (5 Mo maximum).");
      const text = await file.text();
      let result;
      if (file.name.toLowerCase().endsWith(".json") || text.trim().startsWith("[") || text.trim().startsWith("{")) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error("Ce fichier JSON est illisible.");
        }
        if (parsed && typeof parsed === "object" && (parsed as { app?: string }).app === "lingua") {
          throw new Error("C'est une sauvegarde complète de Lingua : importe-la depuis Réglages › Sauvegarde.");
        }
        result = jsonToWords(parsed);
      } else {
        result = csvToWords(text);
      }
      if (result.error) throw new Error(result.error);
      if (result.words.length === 0) throw new Error("Aucun mot trouvé dans ce fichier.");
      const now = Date.now();
      const all = wordsToEntries(result.words, lang, now);
      const seen: Entry[] = [...snapshot.entries];
      const fresh: Entry[] = [];
      let duplicates = 0;
      for (const e of all) {
        if (findDuplicate(seen, lang, e.headword, e.reading)) {
          duplicates++;
          continue;
        }
        seen.push(e);
        fresh.push(e);
      }
      setPreview({ entries: fresh, duplicates });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const confirm = async () => {
    if (!preview) return;
    try {
      await addEntries(preview.entries, snapshot.settings.autoCreateCards);
      notify(`${preview.entries.length} mot${preview.entries.length > 1 ? "s" : ""} importé${preview.entries.length > 1 ? "s" : ""}.`, "ok");
      onClose();
    } catch (e) {
      setError(`Import impossible : ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <Modal title={`Importer une liste (${LANG_INFO[lang].name})`} onClose={onClose}>
      <div className="stack">
        <p className="muted small">
          Fichier <strong>.csv</strong> (première ligne = en-têtes : <code>mot, lecture, traduction, categorie, exemple, traduction_exemple, notes</code>) ou <strong>.json</strong> (tableau de mots). Plusieurs traductions : sépare-les par « ; ». Les mots déjà présents sont ignorés.
        </p>
        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.json,text/csv,application/json" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
        {error && <div className="notice error">{error}</div>}
        {preview && (
          <div className="notice">
            <div>
              <strong>{preview.entries.length}</strong> mot{preview.entries.length > 1 ? "s" : ""} prêt{preview.entries.length > 1 ? "s" : ""} à être ajouté{preview.entries.length > 1 ? "s" : ""}
              {preview.duplicates > 0 && <> · {preview.duplicates} déjà présent{preview.duplicates > 1 ? "s" : ""} (ignoré{preview.duplicates > 1 ? "s" : ""})</>}.
              <div className="muted small">Exemples : {preview.entries.slice(0, 4).map((e) => e.headword).join(", ")}…</div>
            </div>
          </div>
        )}
        <div className="row end">
          <button className="btn ghost" onClick={onClose}>
            Annuler
          </button>
          <button className="btn primary" disabled={!preview || preview.entries.length === 0} onClick={confirm}>
            Ajouter à mon dictionnaire
          </button>
        </div>
      </div>
    </Modal>
  );
}
