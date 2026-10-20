"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Entry, Example, Lang, LANG_INFO, POS_LABELS, POS_LIST, Pos, Sense } from "../lib/types";
import { useData } from "../lib/store";
import { findDuplicate } from "../lib/search";
import { uid } from "../lib/ids";
import { lookupWord } from "../lib/autofill";
import { Icon, PageHead, useToast } from "./ui";

interface ExampleForm {
  id: string;
  text: string;
  translation: string;
}

interface SenseForm {
  id: string;
  pos: Pos;
  gender: "" | "m" | "f";
  translations: string;
  examples: ExampleForm[];
}

interface Form {
  headword: string;
  reading: string;
  ipa: string;
  senses: SenseForm[];
}

const blankSense = (): SenseForm => ({ id: uid("sense"), pos: "noun", gender: "", translations: "", examples: [] });

function toForm(e: Entry | null, headword = ""): Form {
  if (!e) return { headword, reading: "", ipa: "", senses: [blankSense()] };
  return {
    headword: e.headword,
    reading: e.reading ?? "",
    ipa: e.ipa ?? "",
    senses: e.senses.length
      ? e.senses.map((s) => ({
          id: s.id,
          pos: s.pos,
          gender: s.gender ?? "",
          translations: s.translations.join("; "),
          examples: s.examples.map((x) => ({ id: x.id, text: x.text, translation: x.translation ?? "" })),
        }))
      : [blankSense()],
  };
}

const splitList = (s: string): string[] =>
  s
    .split(/[;；\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

const opt = (s: string): string | undefined => (s.trim() ? s.trim() : undefined);

/**
 * Les champs retirés du formulaire (variantes, formes conjuguées, notes, accent, définition…) sont CONSERVÉS tels quels
 * pour les mots déjà enregistrés : on ne perd aucune donnée, et le lecteur continue de reconnaître les formes conjuguées.
 */
function fromForm(f: Form, lang: Lang, base: Entry | null): Entry {
  const now = Date.now();
  const senses: Sense[] = f.senses
    .map((s) => {
      const old = base?.senses.find((x) => x.id === s.id);
      const sense: Sense = {
        ...old,
        id: s.id,
        pos: s.pos,
        translations: splitList(s.translations),
        examples: s.examples.filter((x) => x.text.trim()).map((x): Example => ({ ...base?.senses.flatMap((y) => y.examples).find((y) => y.id === x.id), id: x.id, text: x.text.trim(), translation: opt(x.translation) })),
      };
      if (s.pos === "noun" && s.gender) sense.gender = s.gender;
      else delete sense.gender;
      return sense;
    })
    .filter((s) => s.translations.length || s.definition || s.examples.length);
  return {
    id: base?.id ?? uid("entry"),
    lang,
    headword: f.headword.trim(),
    variants: base?.variants ?? [],
    inflections: base?.inflections ?? [],
    reading: lang === "ja" ? opt(f.reading) : base?.reading,
    ipa: lang === "en" ? opt(f.ipa) : base?.ipa,
    pitch: base?.pitch,
    readingsNote: base?.readingsNote,
    senses,
    notes: base?.notes,
    source: base?.source ?? { kind: "manual" },
    createdAt: base?.createdAt ?? now,
    updatedAt: now,
  };
}

const AUTOFILL_KEY = "lingua.autofill";
function readAutofill(): boolean {
  try {
    return window.localStorage.getItem(AUTOFILL_KEY) !== "off";
  } catch {
    return true;
  }
}

export default function EntryEditor({ lang, entryId, initialWord }: { lang: Lang; entryId?: string; initialWord?: string }) {
  const { snapshot, entriesById, saveEntry } = useData();
  const notify = useToast();
  const base = entryId ? entriesById.get(entryId) ?? null : null;
  const [form, setForm] = useState<Form>(() => toForm(base, initialWord ?? ""));
  const [allowDup, setAllowDup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [auto, setAuto] = useState(true);
  const [busy, setBusy] = useState(false);
  const [autoMsg, setAutoMsg] = useState<{ kind: "ok" | "warn"; text: string } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const lastLookup = useRef<string>("");
  const ja = lang === "ja";

  useEffect(() => setAuto(readAutofill()), []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setSense = (i: number, patch: Partial<SenseForm>) => setForm((f) => ({ ...f, senses: f.senses.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  const dup = useMemo(
    () => (form.headword.trim() ? findDuplicate(snapshot.entries, lang, form.headword, form.reading, base?.id) : undefined),
    [snapshot.entries, lang, form.headword, form.reading, base?.id],
  );
  const draft = useMemo(() => fromForm(form, lang, base), [form, lang, base]);

  /** Remplit seulement ce qui est VIDE : ce que tu as déjà écrit n'est jamais écrasé. */
  const fill = async (word: string, manual: boolean) => {
    const w = word.trim();
    if (w.length < 2) return;
    lastLookup.current = w;
    setBusy(true);
    setAutoMsg(null);
    try {
      const info = await lookupWord(w, lang);
      if (lastLookup.current !== w) return; // le mot a changé entre-temps
      const filled: string[] = [];
      setForm((f) => {
        if (f.headword.trim() !== w) return f;
        const next = { ...f, senses: [...f.senses] };
        if (info.ipa && !next.ipa.trim() && lang === "en") {
          next.ipa = info.ipa;
          filled.push("prononciation");
        }
        if (info.reading && !next.reading.trim() && ja) {
          next.reading = info.reading;
          filled.push("lecture");
        }
        const s0 = next.senses[0];
        if (s0 && !s0.translations.trim() && info.translations.length) {
          next.senses[0] = { ...s0, translations: info.translations[0], pos: info.pos ?? s0.pos };
          filled.push("traduction");
          if (info.pos) filled.push("type");
        } else if (s0 && info.pos && !s0.translations.trim()) {
          next.senses[0] = { ...s0, pos: info.pos };
        }
        return next;
      });
      setSuggestions(info.translations);
      setAutoMsg(
        filled.length || info.translations.length
          ? { kind: "ok", text: `Rempli automatiquement${filled.length ? ` (${filled.join(", ")})` : ""}. Relis : c'est une suggestion, elle peut se tromper.` }
          : { kind: "warn", text: manual ? "Rien trouvé pour ce mot : remplis les champs à la main." : "" },
      );
    } catch (e) {
      if (manual || lastLookup.current === w) setAutoMsg({ kind: "warn", text: e instanceof Error ? e.message : "Remplissage automatique impossible." });
    } finally {
      setBusy(false);
    }
  };

  // remplissage automatique d'un NOUVEAU mot, un instant après la fin de la saisie
  useEffect(() => {
    if (base || !auto) return;
    const w = form.headword.trim();
    if (w.length < 2 || w === lastLookup.current || form.senses[0]?.translations.trim()) return;
    const t = setTimeout(() => void fill(w, false), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.headword, auto, base]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const problems: string[] = [];
    if (!form.headword.trim()) problems.push("Écris le mot.");
    if (draft.senses.length === 0) problems.push("Ajoute au moins une traduction.");
    if (dup && !allowDup) problems.push("Ce mot existe déjà : ouvre l'entrée existante pour la compléter, ou coche « créer quand même ».");
    setErrors(problems);
    if (problems.length) {
      window.scrollTo?.(0, 0);
      return;
    }
    setSaving(true);
    try {
      await saveEntry(draft, false);
      notify(base ? "Mot enregistré." : "Mot ajouté au dictionnaire.", "ok");
      window.location.hash = `#/${lang}/dictionary/${draft.id}`;
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

  return (
    <div className="page">
      <PageHead title={base ? "Modifier le mot" : "Nouveau mot"} sub={LANG_INFO[lang].name} onBack={() => (window.history.length > 1 ? window.history.back() : (window.location.hash = `#/${lang}/dictionary`))} />

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
            <input
              className={`input big ${ja ? "ja" : ""}`}
              lang={ja ? "ja" : "en"}
              value={form.headword}
              onChange={(e) => {
                set("headword", e.target.value);
                setAllowDup(false);
              }}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoFocus={!base}
            />
          </label>

          <div className="row wrap">
            <button type="button" className="btn small" disabled={busy || form.headword.trim().length < 2} onClick={() => void fill(form.headword, true)}>
              {busy ? "Recherche…" : "Remplir automatiquement"}
            </button>
            <label className="checkbox small">
              <input
                type="checkbox"
                checked={auto}
                onChange={(e) => {
                  setAuto(e.target.checked);
                  try {
                    window.localStorage.setItem(AUTOFILL_KEY, e.target.checked ? "on" : "off");
                  } catch {
                    /* sans importance */
                  }
                }}
              />{" "}
              Remplir tout seul quand je tape un nouveau mot
            </label>
          </div>
          {autoMsg && autoMsg.text && (
            <div className={`notice ${autoMsg.kind === "ok" ? "tip" : "warn"}`} role="status">
              {autoMsg.text}
            </div>
          )}
          <div className="muted small">Le remplissage envoie le mot tapé à des services gratuits en ligne (Free Dictionary API pour l'anglais, MyMemory pour les traductions). Internet nécessaire ; tu peux le désactiver ci-dessus.</div>

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
              <span className="label">Phonétique (IPA)</span>
              <input className="input" value={form.ipa} onChange={(e) => set("ipa", e.target.value)} placeholder="rɪˈlʌktənt" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
            </label>
          )}
        </section>

        {form.senses.map((s, i) => (
          <section className="card stack" key={s.id} aria-label={`Sens ${i + 1}`}>
            <div className="row between">
              <h2 className="h3">{form.senses.length > 1 ? `Sens ${i + 1}` : "Sens et traduction"}</h2>
              {form.senses.length > 1 && (
                <button type="button" className="btn ghost small" onClick={() => set("senses", form.senses.filter((_, j) => j !== i))}>
                  <Icon name="trash" size={16} /> Retirer ce sens
                </button>
              )}
            </div>
            <div className="grid grid-2">
              <label className="field">
                <span className="label">Type</span>
                <select className="select" value={s.pos} onChange={(e) => setSense(i, { pos: e.target.value as Pos })}>
                  {POS_LIST.map((p) => (
                    <option key={p} value={p}>
                      {POS_LABELS[p]}
                    </option>
                  ))}
                </select>
              </label>
              {s.pos === "noun" && (
                <label className="field">
                  <span className="label">Genre du mot français</span>
                  <select className="select" value={s.gender} onChange={(e) => setSense(i, { gender: e.target.value as "" | "m" | "f" })} aria-label="Genre">
                    <option value="">—</option>
                    <option value="m">masculin</option>
                    <option value="f">féminin</option>
                  </select>
                </label>
              )}
            </div>
            <label className="field">
              <span className="label">Traduction en français (plusieurs : sépare par « ; »)</span>
              <input className="input" value={s.translations} onChange={(e) => setSense(i, { translations: e.target.value })} placeholder="réticent ; peu enclin à" aria-label="Traduction" />
            </label>
            {i === 0 && suggestions.length > 1 && (
              <div className="row wrap" aria-label="Autres traductions proposées">
                <span className="muted small">Autres propositions :</span>
                {suggestions.slice(1).map((t) => (
                  <button
                    type="button"
                    key={t}
                    className="chip small-chip"
                    onClick={() => setSense(0, { translations: s.translations.trim() ? `${s.translations.trim()} ; ${t}` : t })}
                  >
                    + {t}
                  </button>
                ))}
              </div>
            )}

            {s.examples.length > 0 && (
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
              </div>
            )}
            <div>
              <button type="button" className="btn small" onClick={() => setSense(i, { examples: [...s.examples, { id: uid("ex"), text: "", translation: "" }] })}>
                <Icon name="plus" size={16} /> Ajouter un exemple (facultatif)
              </button>
            </div>
          </section>
        ))}
        <div>
          <button type="button" className="btn" onClick={() => set("senses", [...form.senses, blankSense()])}>
            <Icon name="plus" size={18} /> Ajouter un autre sens (autre type)
          </button>
        </div>

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
