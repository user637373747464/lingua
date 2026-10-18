"use client";

import React, { useMemo, useState } from "react";
import { Lang, MAX_TEXT_LENGTH, TextItem, TextKind } from "../lib/types";
import { useData } from "../lib/store";
import { uid } from "../lib/ids";
import { safeHttpUrl } from "../lib/url";
import { SOURCES, Source } from "../lib/content/sources";
import { ConfirmDialog, EmptyState, Icon, Modal, PageHead, Txt, useToast } from "./ui";
import Reader from "./Reader";

export type Section = "reading" | "news" | "audio";

export const SECTION_INFO: Record<Section, { kind: TextKind; title: string; sub: string; add: string; empty: string; bodyLabel: string }> = {
  reading: {
    kind: "text",
    title: "Lecture",
    sub: "Colle un texte : touche un mot pour le comprendre et l'ajouter",
    add: "Ajouter un texte",
    empty: "Colle ici un texte qui t'intéresse (un article, un extrait, un message). Chaque mot deviendra touchable.",
    bodyLabel: "Texte",
  },
  news: {
    kind: "article",
    title: "Actualités",
    sub: "Tes articles : le lien, tes notes et le texte à lire ici",
    add: "Ajouter un article",
    empty: "Ajoute un lien d'article (ou choisis une source conseillée plus bas). Pour toucher les mots, colle aussi le texte de l'article.",
    bodyLabel: "Texte de l'article (à coller depuis le site)",
  },
  audio: {
    kind: "podcast",
    title: "Podcasts et vidéos",
    sub: "Ta bibliothèque d'écoute, avec transcription à lire",
    add: "Ajouter un podcast / une vidéo",
    empty: "Ajoute un lien de podcast ou de vidéo. Si tu colles la transcription, tu pourras toucher chaque mot.",
    bodyLabel: "Transcription (à coller)",
  },
};

export const isSection = (s: string | undefined): s is Section => s === "reading" || s === "news" || s === "audio";

const KIND_TO_SECTION: Record<TextKind, Section> = { text: "reading", article: "news", podcast: "audio" };

// ---------- liste ----------

export function LibraryPage({ lang, section }: { lang: Lang; section: Section }) {
  const { snapshot, saveText } = useData();
  const notify = useToast();
  const info = SECTION_INFO[section];
  const [editing, setEditing] = useState<TextItem | "new" | null>(null);

  const items = useMemo(
    () => snapshot.texts.filter((t) => t.lang === lang && t.kind === info.kind).sort((a, b) => b.updatedAt - a.updatedAt),
    [snapshot.texts, lang, info.kind],
  );
  const sources = SOURCES.filter((s) => s.lang === lang && (section === "news" ? s.kind === "article" : section === "audio" ? s.kind === "podcast" : false));

  const addSource = async (s: Source) => {
    if (items.some((t) => t.url === s.url)) return notify("Cette source est déjà dans ta bibliothèque.", "info");
    const now = Date.now();
    try {
      await saveText({ id: uid("text"), lang, kind: info.kind, title: s.name, url: s.url, notes: s.description, createdAt: now, updatedAt: now });
      notify(`« ${s.name} » ajouté.`, "ok");
    } catch (e) {
      notify(`Enregistrement impossible : ${e instanceof Error ? e.message : e}`, "error");
    }
  };

  return (
    <div className="page">
      <PageHead title={info.title} onBack={() => (window.location.hash = `#/${lang}`)} sub={info.sub} actions={<button className="btn primary" onClick={() => setEditing("new")}>
          <Icon name="plus" size={18} /> Ajouter
        </button>} />

      {items.length === 0 ? (
        <EmptyState title="Rien ici pour l'instant">{info.empty}</EmptyState>
      ) : (
        <ul className="plain stack tight">
          {items.map((t) => (
            <li key={t.id}>
              <a className="card card-link row between" href={`#/${lang}/${section}/${encodeURIComponent(t.id)}`}>
                <div>
                  <Txt lang={lang} className="module-title">
                    {t.title}
                  </Txt>
                  <div className="muted small">
                    {t.body ? `${t.body.length.toLocaleString("fr-FR")} caractères · touchable` : "Lien seul (pas de texte collé)"}
                  </div>
                </div>
                <Icon name="next" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {sources.length > 0 && (
        <section className="stack">
          <h2 className="h3">Sources conseillées</h2>
          <p className="muted small">
            Des sites connus pour apprendre. Lingua ne copie rien : le lien s'ouvre dans ton navigateur. Les adresses peuvent changer : si une page ne s'ouvre plus, cherche simplement le nom sur Internet.
          </p>
          {sources.map((s) => (
            <div key={s.id} className="card stack tight">
              <div className="row between wrap">
                <div className="module-title">{s.name}</div>
                <span className="badge">{s.level}</span>
              </div>
              <div className="muted small">{s.description}</div>
              <div className="row wrap">
                <a className="btn small" href={s.url} target="_blank" rel="noopener noreferrer">
                  <Icon name="link" size={14} /> Ouvrir le site
                </a>
                <button className="btn small" onClick={() => addSource(s)}>
                  <Icon name="plus" size={14} /> Ajouter à ma bibliothèque
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {editing && <TextForm lang={lang} section={section} item={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} onSaved={() => setEditing(null)} />}
    </div>
  );
}

// ---------- formulaire ----------

export function TextForm({ lang, section, item, onClose, onSaved }: { lang: Lang; section: Section; item?: TextItem; onClose: () => void; onSaved: (t: TextItem) => void }) {
  const { saveText } = useData();
  const info = SECTION_INFO[section];
  const [title, setTitle] = useState(item?.title ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [body, setBody] = useState(item?.body ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const t = title.trim();
    if (!t) return setError("Donne un titre.");
    const u = url.trim();
    if (u && !safeHttpUrl(u)) return setError("Le lien doit commencer par http:// ou https:// (et ne pas contenir d'espace).");
    if (body.length > MAX_TEXT_LENGTH) return setError(`Le texte est trop long (${body.length.toLocaleString("fr-FR")} caractères, maximum ${MAX_TEXT_LENGTH.toLocaleString("fr-FR")}). Colle-le en plusieurs morceaux.`);
    if (!u && !body.trim()) return setError("Ajoute un lien ou un texte.");
    const now = Date.now();
    const next: TextItem = {
      id: item?.id ?? uid("text"),
      lang,
      kind: info.kind,
      title: t,
      url: u ? safeHttpUrl(u)! : undefined,
      body: body.trim() ? body : undefined,
      notes: notes.trim() || undefined,
      createdAt: item?.createdAt ?? now,
      updatedAt: now,
    };
    setSaving(true);
    try {
      await saveText(next);
      onSaved(next);
    } catch (e) {
      setError(`Enregistrement impossible : ${e instanceof Error ? e.message : e}`);
      setSaving(false);
    }
  };

  return (
    <Modal title={item ? "Modifier" : info.add} onClose={onClose} wide>
      <form className="stack" onSubmit={submit}>
        <label className="field">
          <span className="label">Titre</span>
          <input className={`input ${lang === "ja" ? "ja" : ""}`} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        {section !== "reading" && (
          <label className="field">
            <span className="label">Lien (facultatif)</span>
            <input className="input" type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" autoCapitalize="none" autoCorrect="off" />
          </label>
        )}
        <label className="field">
          <span className="label">{info.bodyLabel}</span>
          <textarea className={`textarea ${lang === "ja" ? "ja" : ""}`} rows={8} value={body} onChange={(e) => setBody(e.target.value)} lang={lang === "ja" ? "ja" : "en"} />
          <span className="muted small">{body.length.toLocaleString("fr-FR")} / {MAX_TEXT_LENGTH.toLocaleString("fr-FR")} caractères</span>
        </label>
        <label className="field">
          <span className="label">Notes (facultatif)</span>
          <textarea className="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        {error && <div className="notice error">{error}</div>}
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn primary" disabled={saving}>
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------- affichage d'un texte ----------

export function TextView({ lang, section, id }: { lang: Lang; section: Section; id: string }) {
  const { snapshot, deleteText } = useData();
  const notify = useToast();
  const item = snapshot.texts.find((t) => t.id === id && t.lang === lang);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const back = () => (window.location.hash = `#/${lang}/${section}`);

  if (!item) {
    return (
      <div className="page">
        <PageHead title="Introuvable" onBack={back} />
        <p className="muted">Ce texte n'existe plus.</p>
      </div>
    );
  }
  const link = safeHttpUrl(item.url);
  const info = SECTION_INFO[KIND_TO_SECTION[item.kind]];

  const remove = async () => {
    try {
      await deleteText(item.id);
      notify("Supprimé.", "ok");
      back();
    } catch (e) {
      notify(`Suppression impossible : ${e instanceof Error ? e.message : e}`, "error");
    }
  };

  return (
    <div className="page">
      <PageHead
        title={<span className={lang === "ja" ? "ja" : ""}>{item.title}</span>}
        onBack={back}
        actions={
          <>
            <button className="btn ghost icon" aria-label="Modifier" onClick={() => setEditing(true)}>
              <Icon name="edit" />
            </button>
            <button className="btn ghost icon" aria-label="Supprimer" onClick={() => setConfirm(true)}>
              <Icon name="trash" />
            </button>
          </>
        }
      />
      {link && (
        <a className="btn" href={link} target="_blank" rel="noopener noreferrer">
          <Icon name="link" size={16} /> Ouvrir la source (Internet nécessaire)
        </a>
      )}
      {item.notes && <p className="muted">{item.notes}</p>}
      {item.body ? (
        <Reader lang={lang} text={item.body} sourceTitle={item.title} sourceUrl={link ?? undefined} />
      ) : (
        <EmptyState title="Pas encore de texte">
          Pour toucher les mots, ouvre la source, copie le texte, puis « Modifier » et colle-le dans « {info.bodyLabel} ».
        </EmptyState>
      )}
      {editing && <TextForm lang={lang} section={section} item={item} onClose={() => setEditing(false)} onSaved={() => setEditing(false)} />}
      {confirm && (
        <ConfirmDialog
          title="Supprimer ?"
          message={`« ${item.title} » sera supprimé de ta bibliothèque. Les mots que tu as ajoutés au dictionnaire restent.`}
          confirmLabel="Supprimer"
          danger
          onConfirm={remove}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  );
}
