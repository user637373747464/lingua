"use client";

import React, { useState } from "react";
import { Lang, POS_LABELS } from "../lib/types";
import { useData } from "../lib/store";
import { entryGloss } from "../lib/cards";
import { newDeckCard } from "../lib/decks";
import { normalizeForSearch } from "../lib/search";
import { safeHttpUrl } from "../lib/url";
import { ConfirmDialog, EmptyState, Icon, Modal, PageHead, SpeakButton, Txt, useToast } from "./ui";

const GENDER: Record<string, string> = { m: "masculin", f: "féminin" };

export default function EntryView({ lang, entryId }: { lang: Lang; entryId: string }) {
  const { snapshot, entriesById, deleteEntry, saveDeckCards } = useData();
  const notify = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [picking, setPicking] = useState(false);
  const entry = entriesById.get(entryId);
  const toList = () => (window.location.hash = `#/${lang}/dictionary`);

  if (!entry || entry.lang !== lang) {
    return (
      <div className="page">
        <PageHead title="Entrée introuvable" onBack={toList} />
        <EmptyState title="Cette entrée n'existe pas">Elle a peut-être été supprimée.</EmptyState>
      </div>
    );
  }

  const ja = entry.lang === "ja";
  const spoken = ja && entry.reading ? entry.reading : entry.headword;
  const srcUrl = safeHttpUrl(entry.source.url);
  const hasSource = !!(entry.source.title || srcUrl || entry.source.sentence);
  const decks = snapshot.decks.filter((d) => d.lang === lang);

  const remove = async () => {
    try {
      await deleteEntry(entry.id);
      notify("Mot supprimé.", "ok");
      toList();
    } catch (e) {
      setConfirmDelete(false);
      notify(`Suppression impossible : ${e instanceof Error ? e.message : e}`, "error");
    }
  };

  const addToDeck = async (deckId: string) => {
    const deck = decks.find((d) => d.id === deckId);
    const back = entryGloss(entry);
    if (!deck || !back) return;
    const already = snapshot.deckCards.some((c) => c.deckId === deckId && normalizeForSearch(c.front) === normalizeForSearch(entry.headword) && normalizeForSearch(c.back) === normalizeForSearch(back));
    if (already) {
      notify(`Ce mot est déjà dans « ${deck.name} ».`, "error");
      return;
    }
    await saveDeckCards([newDeckCard({ deckId, lang, front: entry.headword, back, reading: entry.reading && entry.reading !== entry.headword ? entry.reading : undefined, now: Date.now() })]);
    notify(`Ajouté au paquet « ${deck.name} ».`, "ok");
    setPicking(false);
  };

  return (
    <div className="page">
      <PageHead
        title="Fiche du mot"
        onBack={toList}
        actions={
          <a className="btn" href={`#/${lang}/dictionary/${entry.id}/edit`}>
            <Icon name="edit" size={18} /> Modifier
          </a>
        }
      />

      <section className="card stack entry-hero">
        <div className="row between wrap">
          <div>
            <Txt lang={lang} className="hero-word">
              {entry.headword}
            </Txt>
            {entry.reading && entry.reading !== entry.headword && (
              <div>
                <Txt lang={lang} className="muted hero-reading">
                  {entry.reading}
                </Txt>
              </div>
            )}
            {entry.ipa && <div className="muted">/{entry.ipa.replace(/^\/|\/$/g, "")}/</div>}
          </div>
          <SpeakButton text={spoken} lang={lang} />
        </div>
      </section>

      {entry.senses.map((s, i) => (
        <section className="card stack" key={s.id}>
          <div className="row wrap">
            {entry.senses.length > 1 && <span className="sense-num">{i + 1}</span>}
            <span className="badge">{POS_LABELS[s.pos]}</span>
            {s.gender && <span className="muted small">{GENDER[s.gender]}</span>}
          </div>
          {s.translations.length > 0 && <div className="h3">{s.translations.join(" ; ")}</div>}
          {s.examples.length > 0 && (
            <ul className="examples">
              {s.examples.map((x) => (
                <li key={x.id}>
                  <div className="row">
                    <Txt lang={lang} className="grow">
                      {x.text}
                    </Txt>
                    <SpeakButton text={x.text} lang={lang} label="Écouter la phrase" />
                  </div>
                  {x.translation && <div className="muted small">{x.translation}</div>}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {entry.senses.length === 0 && <p className="muted">Aucune traduction pour l'instant. Utilise « Modifier » pour en ajouter.</p>}

      {hasSource && (
        <section className="card stack">
          <h2 className="h3">D'où vient ce mot</h2>
          {entry.source.title && <div>{entry.source.title}</div>}
          {entry.source.sentence && <blockquote className="quote">{entry.source.sentence}</blockquote>}
          {srcUrl && (
            <a href={srcUrl} target="_blank" rel="noopener noreferrer" className="btn small">
              <Icon name="link" size={16} /> Ouvrir la source
            </a>
          )}
        </section>
      )}

      <div className="row wrap">
        <button className="btn" disabled={!entryGloss(entry)} onClick={() => setPicking(true)}>
          <Icon name="cards" size={18} /> Ajouter à un paquet de flashcards
        </button>
        <button className="btn danger ghost" onClick={() => setConfirmDelete(true)}>
          <Icon name="trash" size={18} /> Supprimer ce mot
        </button>
      </div>

      {picking && (
        <Modal title="Ajouter à un paquet" onClose={() => setPicking(false)}>
          <div className="stack">
            {decks.length === 0 ? (
              <p className="muted">
                Tu n'as pas encore de paquet. <a href={`#/${lang}/study`}>Crées-en un dans Flashcards</a>.
              </p>
            ) : (
              <ul className="plain stack tight">
                {decks.map((d) => (
                  <li key={d.id}>
                    <button className="btn grow" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => void addToDeck(d.id)}>
                      {d.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer ce mot ?"
          message={<>« {entry.headword} » sera supprimé définitivement du dictionnaire (tes paquets de flashcards ne sont pas touchés). Pense à faire une sauvegarde si tu hésites.</>}
          confirmLabel="Supprimer"
          danger
          onConfirm={remove}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
