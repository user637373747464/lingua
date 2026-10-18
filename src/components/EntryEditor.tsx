"use client";

import React, { useMemo, useState } from "react";
import { Entry, Example, JA_POS_DETAILS, Lang, LANG_INFO, POS_LABELS, POS_LIST, Pos, Sense } from "../lib/types";
import { useData } from "../lib/store";
import { findDuplicate } from "../lib/search";
import { canMakeCards } from "../lib/cards";
import { uid } from "../lib/ids";
import { safeHttpUrl } from "../lib/url";
import { Icon, PageHead, useToast } from "./ui";

interface ExampleForm {
  id: string;
  text: string;
  translation: string;
}

interface SenseForm {
  id: string;
  pos: Pos;
  posDetail: string;
  definition: string;
  translations: string;
  register: string;
  domain: string;
  examples: ExampleForm[];
}

interface Form {
  headword: string;
  reading: string;
  variants: string;
  inflections: string;
  ipa: string;
  pitch: string;
  readingsNote: string;
  notes: string;
  srcTitle: string;
  srcUrl: string;
  srcSentence: string;
  senses: SenseForm[];
}

const blankSense = (): SenseForm => ({ id: uid("sense"), pos: "noun", posDetail: "", definition: "", translations: "", register: "", domain: "", examples: [] });

function toForm(e: Entry | null, headword = ""): Form {
  if (!e) {
    return { headword, reading: "", variants: "", inflections: "", ipa: "", pitch: "", readingsNote: "", notes: "", srcTitle: "", srcUrl: "", srcSentence: "", senses: [blankSense()] };
  }
  return {
    headword: e.headword,
    reading: e.reading ?? "",
    variants: e.variants.join(", "),
    inflections: e.inflections.join(", "),
    ipa: e.ipa ?? "",
    pitch: e.pitch ?? "",
    readingsNote: e.readingsNote ?? "",
    notes: e.notes ?? "",
    srcTitle: e.source.title ?? "",
    srcUrl: e.source.url ?? "",
    srcSentence: e.source.sentence ?? "",
    senses: e.senses.length
      ? e.senses.map((s) => ({
          id: s.id,
          pos: s.pos,
          posDetail: s.posDetail ?? "",
          definition: s.definition ?? "",
          translations: s.translations.join("; "),
          register: s.register ?? "",
          domain: s.domain ?? "",
          examples: s.examples.map((x) => ({ id: x.id, text: x.text, translation: x.translation ?? "" })),
        }))
      : [blankSense()],
  };
}

const splitList = (s: string): string[] =>
  s
    .split(/[;,、\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

const opt = (s: string): string | undefined => (s.trim() ? s.trim() : undefined);

function fromForm(f: Form, lang: Lang, base: Entry | null): Entry {
  const now = Date.now();
  const senses: Sense[] = f.senses
    .map((s) => ({
      id: s.id,
      pos: s.pos,
      posDetail: opt(s.posDetail),
      definition: opt(s.definition),
      translations: splitList(s.translations),
      register: opt(s.register),
      domain: opt(s.domain),
      examples: s.examples
        .filter((x) => x.text.trim())
        .map((x): Example => ({ id: x.id, text: x.text.trim(), translation: opt(x.translation) })),
    }))
    .filter((s) => s.translations.length || s.definition || s.examples.length);
  return {
    id: base?.id ?? uid("entry"),
    lang,
    headword: f.headword.trim(),
    variants: splitList(f.variants),
    inflections: splitList(f.inflections),
    reading: opt(f.reading),
    ipa: lang === "en" ? opt(f.ipa) : undefined,
    pitch: lang === "ja" ? opt(f.pitch) : undefined,
    readingsNote: lang === "ja" ? opt(f.readingsNote) : undefined,
    senses,
    notes: opt(f.notes),
    source: {
      kind: base?.source.kind ?? "manual",
      title: opt(f.srcTitle),
      url: opt(f.srcUrl),
      sentence: opt(f.srcSentence),
      note: base?.source.note,
    },
    createdAt: base?.createdAt ?? now,
    updatedAt: now,
  };
}

export default function EntryEditor({ lang, entryId, initialWord }: { lang: Lang; entryId?: string; initialWord?: string }) {
  const { snapshot, entriesById, saveEntry } = useData();
  const notify = useToast();
  const base = entryId ? entriesById.get(entryId) ?? null : null;
  const [form, setForm] = useState<Form>(() => toForm(base, initialWord ?? ""));
  const hasCards = base ? snapshot.cards.some((c) => c.entryId === base.id) : false;
  const [makeCards, setMakeCards] = useState(snapshot.settings.autoCreateCards);
  const [allowDup, setAllowDup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setSense = (i: number, patch: Partial<SenseForm>) => setForm((f) => ({ ...f, senses: f.senses.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  const dup = useMemo(
    () => (form.headword.trim() ? findDuplicate(snapshot.entries, lang, form.headword, form.reading, base?.id) : undefined),
    [snapshot.entries, lang, form.headword, form.reading, base?.id],
  );

  const draft = useMemo(() => fromForm(form, lang, base), [form, lang, base]);
  const cardsPossible = canMakeCards(draft);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const problems: string[] = [];
    if (!form.headword.trim()) problems.push("Écris le mot.");
    if (draft.senses.length === 0) problems.push("Ajoute au moins une traduction, une définition ou un exemple.");
    if (form.srcUrl.trim() && !safeHttpUrl(form.srcUrl)) problems.push("L'adresse de la source doit commencer par http:// ou https://.");
    if (dup && !allowDup) problems.push("Ce mot existe déjà : ouvre l'entrée existante pour la compléter, ou coche « créer quand même ».");
    setErrors(problems);
    if (problems.length) {
      window.scrollTo?.(0, 0);
      return;
    }
    setSaving(true);
    try {
      const url = safeHttpUrl(form.srcUrl) ?? undefined;
      const entry = { ...draft, source: { ...draft.source, url } };
      await saveEntry(entry, makeCards && cardsPossible && !hasCards);
      notify(base ? "Entrée enregistrée." : "Mot ajouté au dictionnaire.", "ok");
      window.location.hash = `#/${lang}/dictionary/${entry.id}`;
    } catch (e) {
      setErrors([`Enregistrement impossible : ${e instanceof Error ? e.message : e}`]);
    } finally {
      setSaving(false);
    }
  };

  if (entryId && !base) {
    return (
      <div className="page">
        <PageHead title="Entrée introuvable" onBack={() => (window.location.hash = `#/${lang}/dictionary`)} />
        <p className="muted">Cette entrée n'existe pas (elle a peut-être été supprimée).</p>
      </div>
    );
  }

  const ja = lang === "ja";
  return (
    <div className="page">
      <PageHead title={base ? "Modifier l'entrée" : "Nouveau mot"} sub={LANG_INFO[lang].name} onBack={() => window.history.length > 1 ? window.history.back() : (window.location.hash = `#/${lang}/dictionary`)} />

      <form className="stack" onSubmit={submit} noValidate>
        {errors.length > 0 && (
          <div className="notice error" role="alert">
            <ul className="plain">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <section className="card stack">
          <label className="field">
            <span className="label">{ja ? "Mot (kanji, kana…)" : "Mot ou expression"}</span>
            <input className={`input big ${ja ? "ja" : ""}`} lang={ja ? "ja" : "en"} value={form.headword} onChange={(e) => { set("headword", e.target.value); setAllowDup(false); }} autoCapitalize="none" autoCorrect="off" spellCheck={false} autoFocus={!base} />
          </label>

          {dup && (
            <div className="notice warn">
              <div className="stack tight">
                <div>
                  Ce mot est déjà dans ton dictionnaire : <strong className={ja ? "ja" : ""}>{dup.headword}</strong>
                  {dup.reading && dup.reading !== dup.headword ? ` (${dup.reading})` : ""}.
                </div>
                <div className="row wrap">
                  <a className="btn small primary" href={`#/${lang}/dictionary/${dup.id}/edit`}>
                    Compléter l'entrée existante
                  </a>
                  <label className="checkbox">
                    <input type="checkbox" checked={allowDup} onChange={(e) => setAllowDup(e.target.checked)} /> C'est un mot différent : créer quand même
                  </label>
                </div>
              </div>
            </div>
          )}

          {ja ? (
            <label className="field">
              <span className="label">Lecture en hiragana</span>
              <input className="input ja" lang="ja" value={form.reading} onChange={(e) => set("reading", e.target.value)} placeholder="たべる" autoCapitalize="none" />
            </label>
          ) : (
            <label className="field">
              <span className="label">Transcription phonétique (facultatif)</span>
              <input className="input" value={form.ipa} onChange={(e) => set("ipa", e.target.value)} placeholder="Laisse vide si tu n'es pas sûr : rien n'est inventé" autoCapitalize="none" />
            </label>
          )}
          {ja && (
            <>
              <label className="field">
                <span className="label">Accent tonal (si tu le connais)</span>
                <input className="input" value={form.pitch} onChange={(e) => set("pitch", e.target.value)} placeholder="ex. [0] heiban, [2]…" />
              </label>
              <label className="field">
                <span className="label">Lectures des kanji (on / kun)</span>
                <input className="input" value={form.readingsNote} onChange={(e) => set("readingsNote", e.target.value)} placeholder="ex. 食 : ショク (on), た-べる (kun)" />
              </label>
            </>
          )}
          <label className="field">
            <span className="label">Variantes d'écriture (séparées par des virgules)</span>
            <input className={`input ${ja ? "ja" : ""}`} value={form.variants} onChange={(e) => set("variants", e.target.value)} placeholder={ja ? "綺麗" : "colour, color"} />
          </label>
          <label className="field">
            <span className="label">Formes fléchies ou conjuguées utiles</span>
            <input className={`input ${ja ? "ja" : ""}`} value={form.inflections} onChange={(e) => set("inflections", e.target.value)} placeholder={ja ? "食べます, 食べない, 食べた, 食べて" : "went, gone, going"} />
          </label>
        </section>

        {form.senses.map((s, i) => (
          <section className="card stack" key={s.id} aria-label={`Sens ${i + 1}`}>
            <div className="row between">
              <h2 className="h3">Sens {i + 1}</h2>
              {form.senses.length > 1 && (
                <button type="button" className="btn ghost small" onClick={() => set("senses", form.senses.filter((_, j) => j !== i))}>
                  <Icon name="trash" size={16} /> Retirer ce sens
                </button>
              )}
            </div>
            <div className="grid grid-2">
              <label className="field">
                <span className="label">Catégorie grammaticale</span>
                <select className="select" value={s.pos} onChange={(e) => setSense(i, { pos: e.target.value as Pos })}>
                  {POS_LIST.map((p) => (
                    <option key={p} value={p}>
                      {POS_LABELS[p]}
                    </option>
                  ))}
                </select>
              </label>
              {ja && (
                <label className="field">
                  <span className="label">Précision (japonais)</span>
                  <input className="input" list="ja-pos-details" value={s.posDetail} onChange={(e) => setSense(i, { posDetail: e.target.value })} placeholder="ex. verbe ichidan (ru)" />
                </label>
              )}
            </div>
            <label className="field">
              <span className="label">Traductions en français (séparées par « ; »)</span>
              <input className="input" value={s.translations} onChange={(e) => setSense(i, { translations: e.target.value })} placeholder="réticent ; peu enclin à" />
            </label>
            <label className="field">
              <span className="label">Définition (facultatif)</span>
              <input className="input" value={s.definition} onChange={(e) => setSense(i, { definition: e.target.value })} />
            </label>
            <div className="grid grid-2">
              <label className="field">
                <span className="label">Registre (facultatif)</span>
                <input className="input" value={s.register} onChange={(e) => setSense(i, { register: e.target.value })} placeholder="familier, soutenu, poli…" />
              </label>
              <label className="field">
                <span className="label">Domaine (facultatif)</span>
                <input className="input" value={s.domain} onChange={(e) => setSense(i, { domain: e.target.value })} placeholder="droit, informatique…" />
              </label>
            </div>

            <div className="stack tight">
              <div className="label">Exemples</div>
              {s.examples.map((x, k) => (
                <div className="example-edit" key={x.id}>
                  <input
                    className={`input ${ja ? "ja" : ""}`}
                    lang={ja ? "ja" : "en"}
                    value={x.text}
                    placeholder="Phrase d'exemple"
                    aria-label={`Exemple ${k + 1}`}
                    onChange={(e) => setSense(i, { examples: s.examples.map((y, j) => (j === k ? { ...y, text: e.target.value } : y)) })}
                  />
                  <input
                    className="input"
                    value={x.translation}
                    placeholder="Traduction française"
                    aria-label={`Traduction de l'exemple ${k + 1}`}
                    onChange={(e) => setSense(i, { examples: s.examples.map((y, j) => (j === k ? { ...y, translation: e.target.value } : y)) })}
                  />
                  <button type="button" className="btn ghost icon" aria-label={`Retirer l'exemple ${k + 1}`} onClick={() => setSense(i, { examples: s.examples.filter((_, j) => j !== k) })}>
                    <Icon name="x" size={18} />
                  </button>
                </div>
              ))}
              <div>
                <button type="button" className="btn small" onClick={() => setSense(i, { examples: [...s.examples, { id: uid("ex"), text: "", translation: "" }] })}>
                  <Icon name="plus" size={16} /> Ajouter un exemple
                </button>
              </div>
            </div>
          </section>
        ))}
        <div>
          <button type="button" className="btn" onClick={() => set("senses", [...form.senses, blankSense()])}>
            <Icon name="plus" size={18} /> Ajouter un autre sens
          </button>
        </div>
        <datalist id="ja-pos-details">
          {JA_POS_DETAILS.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>

        <section className="card stack">
          <label className="field">
            <span className="label">Notes personnelles</span>
            <textarea className="textarea" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </label>
          <details>
            <summary>Contexte d'origine (où as-tu rencontré ce mot ?)</summary>
            <div className="stack" style={{ marginTop: 10 }}>
              <label className="field">
                <span className="label">Titre du texte</span>
                <input className="input" value={form.srcTitle} onChange={(e) => set("srcTitle", e.target.value)} />
              </label>
              <label className="field">
                <span className="label">Adresse (URL)</span>
                <input className="input" type="url" inputMode="url" value={form.srcUrl} onChange={(e) => set("srcUrl", e.target.value)} placeholder="https://…" autoCapitalize="none" />
              </label>
              <label className="field">
                <span className="label">Phrase d'origine</span>
                <textarea className="textarea" rows={2} value={form.srcSentence} onChange={(e) => set("srcSentence", e.target.value)} />
              </label>
            </div>
          </details>
        </section>

        {!hasCards && (
          <label className="checkbox card">
            <input type="checkbox" checked={makeCards && cardsPossible} disabled={!cardsPossible} onChange={(e) => setMakeCards(e.target.checked)} />
            <span>
              Créer les cartes de révision (QCM + écriture)
              {!cardsPossible && <span className="muted small"> — ajoute d'abord une traduction ou une définition</span>}
            </span>
          </label>
        )}

        <div className="row end sticky-actions">
          <button type="button" className="btn ghost" onClick={() => window.history.back()}>
            Annuler
          </button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
