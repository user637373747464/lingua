"use client";

import React, { useMemo, useState } from "react";
import { Card, Lang, LANG_INFO } from "../lib/types";
import { useData } from "../lib/store";
import { entryGloss } from "../lib/cards";
import { isDifficult, isDue, isNewCard } from "../lib/srs";
import { formatDate, formatInterval } from "../lib/dates";
import { uid } from "../lib/ids";
import { ConfirmDialog, EmptyState, Icon, Modal, PageHead, Segmented, Txt, useToast } from "./ui";

type Filter = "all" | "due" | "new" | "difficult" | "suspended";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "due", label: "À réviser" },
  { value: "new", label: "Nouvelles" },
  { value: "difficult", label: "Difficiles" },
  { value: "suspended", label: "Suspendues" },
];

export default function Cards({ lang }: { lang: Lang }) {
  const { snapshot, statesById, entriesById, setCardSuspended, deleteCard } = useData();
  const notify = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [toDelete, setToDelete] = useState<Card | null>(null);
  const [creating, setCreating] = useState(false);
  const now = Date.now();

  const rows = useMemo(() => {
    return snapshot.cards
      .filter((c) => c.lang === lang)
      .filter((c) => c.kind === "custom" || (c.entryId && entriesById.has(c.entryId)))
      .filter((c) => {
        const st = statesById.get(c.id);
        switch (filter) {
          case "due":
            return !c.suspended && isDue(st, now);
          case "new":
            return !c.suspended && isNewCard(st);
          case "difficult":
            return !!st && isDifficult(st);
          case "suspended":
            return c.suspended;
          default:
            return true;
        }
      })
      .sort((a, b) => b.createdAt - a.createdAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.cards, statesById, entriesById, lang, filter]);

  const label = (c: Card): { front: React.ReactNode; back: string; kind: string } => {
    if (c.kind === "custom") return { front: c.question, back: c.answer ?? "", kind: "Libre" };
    const e = c.entryId ? entriesById.get(c.entryId) : undefined;
    if (!e) return { front: "?", back: "", kind: "" };
    return c.kind === "recognition"
      ? { front: <Txt lang={lang}>{e.headword}</Txt>, back: entryGloss(e), kind: "QCM" }
      : { front: entryGloss(e), back: e.headword, kind: "Écriture" };
  };

  return (
    <div className="page">
      <PageHead
        title="Cartes"
        sub={LANG_INFO[lang].name}
        onBack={() => (window.location.hash = `#/${lang}`)}
        actions={
          <button className="btn primary" onClick={() => setCreating(true)}>
            <Icon name="plus" size={18} /> Carte libre
          </button>
        }
      />
      <div className="scroll-x">
        <Segmented value={filter} options={FILTERS} onChange={setFilter} label="Filtrer les cartes" />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Aucune carte ici">
          {filter === "all" ? "Les cartes se créent automatiquement avec chaque mot du dictionnaire, ou à la main avec « Carte libre »." : "Aucune carte ne correspond à ce filtre."}
        </EmptyState>
      ) : (
        <ul className="list">
          {rows.map((c) => {
            const st = statesById.get(c.id);
            const l = label(c);
            return (
              <li key={c.id} className={`row-item ${c.suspended ? "suspended" : ""}`}>
                <div className="grow">
                  <div className="entry-title">
                    <span className="headword">{l.front}</span>
                    <span className="badge">{l.kind}</span>
                  </div>
                  <div className="muted small clamp">→ {l.back}</div>
                  <div className="muted small">
                    {c.suspended ? "Suspendue" : !st || isNewCard(st) ? "Nouvelle" : `Intervalle ${formatInterval(st.interval)} · prochaine : ${formatDate(st.due)}`}
                    {st && isDifficult(st) && " · difficile"}
                  </div>
                </div>
                <button
                  className="btn ghost small"
                  onClick={async () => {
                    try {
                      await setCardSuspended(c.id, !c.suspended);
                    } catch (e) {
                      notify(`Impossible : ${e instanceof Error ? e.message : e}`, "error");
                    }
                  }}
                >
                  {c.suspended ? "Réactiver" : "Suspendre"}
                </button>
                <button className="btn ghost icon" aria-label="Supprimer cette carte" onClick={() => setToDelete(c)}>
                  <Icon name="trash" size={18} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer cette carte ?"
          message="La carte et son historique de révision seront supprimés. Le mot reste dans ton dictionnaire."
          confirmLabel="Supprimer"
          danger
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            try {
              await deleteCard(toDelete.id);
              setToDelete(null);
            } catch (e) {
              notify(`Suppression impossible : ${e instanceof Error ? e.message : e}`, "error");
            }
          }}
        />
      )}
      {creating && <CustomCardModal lang={lang} onClose={() => setCreating(false)} />}
    </div>
  );
}

function CustomCardModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const { saveCustomCard } = useData();
  const notify = useToast();
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [alts, setAlts] = useState("");
  const [hint, setHint] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!q.trim() || !a.trim()) {
      setErr("Écris une question et sa réponse.");
      return;
    }
    const card: Card = {
      id: uid("card"),
      lang,
      kind: "custom",
      question: q.trim(),
      answer: a.trim(),
      alternatives: alts
        .split(/[;\n]/)
        .map((x) => x.trim())
        .filter(Boolean),
      hint: hint.trim() || undefined,
      note: note.trim() || undefined,
      suspended: false,
      createdAt: Date.now(),
    };
    try {
      await saveCustomCard(card);
      notify("Carte créée.", "ok");
      onClose();
    } catch (e) {
      setErr(`Enregistrement impossible : ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <Modal title="Nouvelle carte libre" onClose={onClose}>
      <form className="stack" onSubmit={save}>
        {err && <div className="notice error">{err}</div>}
        <label className="field">
          <span className="label">Question</span>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        </label>
        <label className="field">
          <span className="label">Réponse attendue</span>
          <input className="input" lang={lang === "ja" ? "ja" : "en"} value={a} onChange={(e) => setA(e.target.value)} autoCapitalize="none" autoCorrect="off" />
        </label>
        <label className="field">
          <span className="label">Autres réponses acceptées (séparées par « ; »)</span>
          <input className="input" value={alts} onChange={(e) => setAlts(e.target.value)} />
        </label>
        <label className="field">
          <span className="label">Indice (facultatif)</span>
          <input className="input" value={hint} onChange={(e) => setHint(e.target.value)} />
        </label>
        <label className="field">
          <span className="label">Note affichée après la réponse (facultatif)</span>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn primary">
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}
