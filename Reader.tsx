"use client";

import React, { useMemo, useState } from "react";
import { Entry, Lang, POS_LABELS, POS_LIST, Pos } from "../lib/types";
import { useData } from "../lib/store";
import { Token, buildLookup, sentenceAt, splitParagraphs, tokenize } from "../lib/reader";
import { entryGloss } from "../lib/cards";
import { findDuplicate } from "../lib/search";
import { uid } from "../lib/ids";
import { Icon, SpeakButton, Txt, useToast } from "./ui";

const CHUNK = 30; // paragraphes affichés d'un coup (les très longs textes restent fluides)

interface Selected {
  p: number; // numéro de paragraphe
  i: number; // numéro du mot dans le paragraphe
}

export default function Reader({ lang, text, sourceTitle, sourceUrl }: { lang: Lang; text: string; sourceTitle?: string; sourceUrl?: string }) {
  const { snapshot } = useData();
  const [shown, setShown] = useState(CHUNK);
  const [sel, setSel] = useState<Selected | null>(null);

  const lookup = useMemo(() => buildLookup(snapshot.entries, lang), [snapshot.entries, lang]);
  const paragraphs = useMemo(() => splitParagraphs(text), [text]);
  const visible = paragraphs.slice(0, shown);
  const tokens = useMemo(() => visible.map((p) => tokenize(p.text, lang, lookup)), [visible, lang, lookup]);

  const tok: Token | undefined = sel ? tokens[sel.p]?.[sel.i] : undefined;
  const par = sel ? visible[sel.p] : undefined;

  return (
    <>
      <div className={`reader ${lang === "ja" ? "ja" : ""}`} lang={lang === "ja" ? "ja" : "en"}>
        {visible.map((p, pi) => (
          <p key={pi} className="reader-par">
            {tokens[pi].map((t, ti) =>
              t.word ? (
                <span
                  key={ti}
                  className={`tok${t.match ? " known" : ""}${sel && sel.p === pi && sel.i === ti ? " sel" : ""}`}
                  onClick={() => setSel({ p: pi, i: ti })}
                >
                  {t.text}
                </span>
              ) : (
                t.text
              ),
            )}
          </p>
        ))}
        {paragraphs.length > shown && (
          <button className="btn" onClick={() => setShown(shown + CHUNK)}>
            Afficher la suite ({paragraphs.length - shown} paragraphe{paragraphs.length - shown > 1 ? "s" : ""})
          </button>
        )}
      </div>
      {tok && par && <WordPanel key={`${sel!.p}:${sel!.i}`} lang={lang} token={tok} paragraph={par.text} sourceTitle={sourceTitle} sourceUrl={sourceUrl} onClose={() => setSel(null)} />}
      {tok && <div className="reader-spacer" aria-hidden="true" />}
    </>
  );
}

function externalDictionary(lang: Lang, word: string): { label: string; href: string } {
  const w = encodeURIComponent(word);
  return lang === "ja" ? { label: "Chercher sur Jisho", href: `https://jisho.org/search/${w}` } : { label: "Chercher sur WordReference", href: `https://www.wordreference.com/enfr/${w}` };
}

function WordPanel({
  lang,
  token,
  paragraph,
  sourceTitle,
  sourceUrl,
  onClose,
}: {
  lang: Lang;
  token: Token;
  paragraph: string;
  sourceTitle?: string;
  sourceUrl?: string;
  onClose: () => void;
}) {
  const { snapshot, saveEntry } = useData();
  const notify = useToast();
  const sentence = useMemo(() => sentenceAt(paragraph, token.start, token.end), [paragraph, token]);
  const match = token.match;
  const [word, setWord] = useState(token.text);
  const [reading, setReading] = useState("");
  const [tr, setTr] = useState("");
  const [pos, setPos] = useState<Pos>("noun");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const ja = lang === "ja";

  // le mot touché est peut-être déjà dans le dictionnaire (ex. forme que le lecteur n'a pas reliée)
  const existing: Entry | undefined = match?.entry ?? findDuplicate(snapshot.entries, lang, word, reading || undefined);

  const add = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const translations = tr.split(/[;；]/).map((x) => x.trim()).filter(Boolean);
    if (!word.trim()) return setError("Écris le mot.");
    if (translations.length === 0) return setError("Écris au moins une traduction.");
    const dup = findDuplicate(snapshot.entries, lang, word, reading || undefined);
    if (dup) return setError(`« ${dup.headword} » est déjà dans ton dictionnaire.`);
    const now = Date.now();
    const safeUrl = sourceUrl && /^https?:\/\//i.test(sourceUrl) ? sourceUrl : undefined;
    const entry: Entry = {
      id: uid("entry"),
      lang,
      headword: word.trim(),
      variants: [],
      inflections: [],
      reading: ja && reading.trim() ? reading.trim() : undefined,
      senses: [
        {
          id: uid("sense"),
          pos,
          translations,
          examples: sentence ? [{ id: uid("ex"), text: sentence }] : [],
        },
      ],
      source: { kind: "reading", title: sourceTitle, url: safeUrl, sentence: sentence || undefined },
      createdAt: now,
      updatedAt: now,
    };
    setSaving(true);
    try {
      await saveEntry(entry, snapshot.settings.autoCreateCards);
      notify(`« ${entry.headword} » ajouté au dictionnaire.`, "ok");
      onClose();
    } catch (e) {
      setError(`Enregistrement impossible : ${e instanceof Error ? e.message : e}`);
    } finally {
      setSaving(false);
    }
  };

  const ext = externalDictionary(lang, existing?.headword ?? word);
  return (
    <aside className="reader-panel" aria-label="Mot sélectionné">
      <div className="row between">
        <div className="row">
          <Txt lang={lang} className="headword">
            {token.text}
          </Txt>
          <SpeakButton text={token.text} lang={lang} />
        </div>
        <button className="btn ghost icon" aria-label="Fermer" onClick={onClose}>
          <Icon name="x" />
        </button>
      </div>

      {existing ? (
        <div className="stack tight">
          <div>
            <Txt lang={lang} className="headword">
              {existing.headword}
            </Txt>
            {existing.reading && existing.reading !== existing.headword && (
              <Txt lang={lang} className="muted">
                {" "}
                {existing.reading}
              </Txt>
            )}
          </div>
          <div>
            {existing.senses[0] && <em className="muted small">{POS_LABELS[existing.senses[0].pos]} · </em>}
            {entryGloss(existing) || "—"}
          </div>
          {match?.how === "stem" && <div className="muted small">Forme conjuguée ou fléchie de ce mot.</div>}
          <div className="row wrap">
            <a className="btn small primary" href={`#/${lang}/dictionary/${existing.id}`}>
              Ouvrir la fiche
            </a>
          </div>
        </div>
      ) : (
        <form className="stack tight" onSubmit={add}>
          <div className="muted small">Pas encore dans ton dictionnaire.</div>
          <div className="grid grid-2">
            <label className="field">
              <span className="label">Mot</span>
              <input className={`input ${ja ? "ja" : ""}`} lang={ja ? "ja" : "en"} value={word} onChange={(e) => setWord(e.target.value)} autoCapitalize="none" autoCorrect="off" />
            </label>
            {ja && (
              <label className="field">
                <span className="label">Lecture (kana)</span>
                <input className="input ja" lang="ja" value={reading} onChange={(e) => setReading(e.target.value)} autoCapitalize="none" />
              </label>
            )}
          </div>
          <label className="field">
            <span className="label">Traduction en français (plusieurs : sépare par « ; »)</span>
            <input className="input" value={tr} onChange={(e) => setTr(e.target.value)} />
          </label>
          <label className="field">
            <span className="label">Catégorie</span>
            <select className="select" value={pos} onChange={(e) => setPos(e.target.value as Pos)}>
              {POS_LIST.map((p) => (
                <option key={p} value={p}>
                  {POS_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          {sentence && (
            <div className="muted small">
              Phrase gardée comme exemple : <Txt lang={lang}>{sentence}</Txt>
            </div>
          )}
          {error && <div className="notice error">{error}</div>}
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? "Ajout…" : "Ajouter au dictionnaire"}
          </button>
        </form>
      )}

      <div className="row wrap small">
        <a href={ext.href} target="_blank" rel="noopener noreferrer">
          <Icon name="link" size={14} /> {ext.label}
        </a>
        <span className="muted">(ouvre un site, Internet nécessaire)</span>
      </div>
    </aside>
  );
}
