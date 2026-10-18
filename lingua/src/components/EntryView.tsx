"use client";

import React, { useState } from "react";
import { Lang, POS_LABELS } from "../lib/types";
import { useData } from "../lib/store";
import { canMakeCards } from "../lib/cards";
import { MASTERY_LABELS, masteryOf } from "../lib/stats";
import { isNewCard } from "../lib/srs";
import { formatDate, formatInterval } from "../lib/dates";
import { safeHttpUrl } from "../lib/url";
import { ConfirmDialog, EmptyState, Icon, PageHead, SpeakButton, Txt, useToast } from "./ui";

export default function EntryView({ lang, entryId }: { lang: Lang; entryId: string }) {
  const { snapshot, entriesById, statesById, deleteEntry, createCardsForEntry } = useData();
  const notify = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
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

  const cards = snapshot.cards.filter((c) => c.entryId === entry.id);
  const mastery = masteryOf(entry.id, snapshot.cards, statesById);
  const ja = entry.lang === "ja";
  const spoken = ja && entry.reading ? entry.reading : entry.headword;
  const srcUrl = safeHttpUrl(entry.source.url);
  const hasSource = !!(entry.source.title || srcUrl || entry.source.sentence);

  const remove = async () => {
    try {
      await deleteEntry(entry.id);
      notify("Entrée supprimée.", "ok");
      toList();
    } catch (e) {
      setConfirmDelete(false);
      notify(`Suppression impossible : ${e instanceof Error ? e.message : e}`, "error");
    }
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
            {entry.pitch && <div className="muted small">Accent : {entry.pitch}</div>}
          </div>
          <div className="row">
            <SpeakButton text={spoken} lang={lang} />
            <span className={`badge m-${mastery}`}>{cards.length ? MASTERY_LABELS[mastery] : "sans carte"}</span>
          </div>
        </div>
        {(entry.variants.length > 0 || entry.inflections.length > 0) && (
          <dl className="facts">
            {entry.variants.length > 0 && (
              <>
                <dt>Variantes</dt>
                <dd>
                  <Txt lang={lang}>{entry.variants.join("、")}</Txt>
                </dd>
              </>
            )}
            {entry.inflections.length > 0 && (
              <>
                <dt>Formes</dt>
                <dd>
                  <Txt lang={lang}>{entry.inflections.join(ja ? "、" : ", ")}</Txt>
                </dd>
              </>
            )}
          </dl>
        )}
        {entry.readingsNote && <div className="muted small">Lectures : {entry.readingsNote}</div>}
      </section>

      {entry.senses.map((s, i) => (
        <section className="card stack" key={s.id}>
          <div className="row wrap">
            {entry.senses.length > 1 && <span className="sense-num">{i + 1}</span>}
            <span className="badge">{POS_LABELS[s.pos]}</span>
            {s.posDetail && <span className="muted small">{s.posDetail}</span>}
            {s.register && <span className="muted small">· {s.register}</span>}
            {s.domain && <span className="muted small">· {s.domain}</span>}
          </div>
          {s.translations.length > 0 && <div className="h3">{s.translations.join(" ; ")}</div>}
          {s.definition && <div className="muted">{s.definition}</div>}
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

      {entry.senses.length === 0 && <p className="muted">Aucun sens renseigné pour l'instant. Utilise « Modifier » pour en ajouter.</p>}

      {entry.notes && (
        <section className="card stack">
          <h2 className="h3">Notes</h2>
          <p className="pre">{entry.notes}</p>
        </section>
      )}

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

      <section className="card stack">
        <h2 className="h3">Cartes de révision</h2>
        {cards.length === 0 ? (
          <>
            <p className="muted">Ce mot n'a pas encore de cartes, donc il n'apparaît pas dans tes révisions.</p>
            <div>
              <button
                className="btn primary"
                disabled={!canMakeCards(entry)}
                onClick={async () => {
                  try {
                    await createCardsForEntry(entry.id);
                    notify("Cartes créées.", "ok");
                  } catch (e) {
                    notify(`Création impossible : ${e instanceof Error ? e.message : e}`, "error");
                  }
                }}
              >
                Créer les cartes
              </button>
              {!canMakeCards(entry) && <span className="muted small"> Ajoute d'abord une traduction.</span>}
            </div>
          </>
        ) : (
          <ul className="plain">
            {cards.map((c) => {
              const st = statesById.get(c.id);
              return (
                <li key={c.id} className="row between wrap">
                  <span>{c.kind === "recognition" ? "Reconnaissance (QCM)" : "Rappel (écriture)"}</span>
                  <span className="muted small">
                    {c.suspended ? "suspendue" : !st || isNewCard(st) ? "nouvelle" : `intervalle ${formatInterval(st.interval)} · prochaine ${formatDate(st.due)}`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div>
        <button className="btn danger ghost" onClick={() => setConfirmDelete(true)}>
          <Icon name="trash" size={18} /> Supprimer ce mot
        </button>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer ce mot ?"
          message={
            <>
              « {entry.headword} » et ses {cards.length} carte{cards.length > 1 ? "s" : ""} (avec leur historique) seront supprimés définitivement. Pense à faire une sauvegarde si tu hésites.
            </>
          }
          confirmLabel="Supprimer"
          danger
          onConfirm={remove}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
