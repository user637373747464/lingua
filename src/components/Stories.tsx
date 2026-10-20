"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Entry, Lang } from "../lib/types";
import { useData } from "../lib/store";
import { uid } from "../lib/ids";
import { findDuplicate } from "../lib/search";
import { Gloss, STORY_LEVELS, Story, StoryLevel, readingMinutes, storiesFor, storyById, storySize } from "../lib/stories";
import { EmptyState, Icon, PageHead, Segmented, Txt, useToast } from "./ui";
import Reader from "./Reader";

// « lue » : simple confort d'affichage, gardé dans ce navigateur (pas dans la sauvegarde)
const READ_KEY = "lingua.stories.read";
function loadRead(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(READ_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function saveRead(ids: string[]) {
  try {
    window.localStorage.setItem(READ_KEY, JSON.stringify(ids));
  } catch {
    /* navigateur privé : tant pis */
  }
}

const LEVEL_HINT: Record<StoryLevel, string> = {
  A1: "débutant", A2: "élémentaire", B1: "intermédiaire", B2: "intermédiaire +", C1: "avancé",
  N5: "débutant", N4: "élémentaire", N3: "intermédiaire", N2: "intermédiaire +", N1: "avancé",
};

function useReadList() {
  const [read, setRead] = useState<string[]>([]);
  useEffect(() => setRead(loadRead()), []);
  const toggle = (id: string) =>
    setRead((r) => {
      const next = r.includes(id) ? r.filter((x) => x !== id) : [...r, id];
      saveRead(next);
      return next;
    });
  return { read, toggle };
}

// ---------- liste ----------

export function StoriesPage({ lang }: { lang: Lang }) {
  const [level, setLevel] = useState<StoryLevel | "all">("all");
  const { read } = useReadList();
  const list = storiesFor(lang, level);
  return (
    <div className="page">
      <PageHead title="Histoires graduées" onBack={() => (window.location.hash = `#/${lang}`)} sub="Des histoires écrites pour Lingua, de 1 à 7 minutes de lecture. Touche un mot pour le comprendre et l'ajouter." />
      <Segmented
        label="Niveau"
        value={level}
        onChange={setLevel}
        options={[{ value: "all", label: "Tous" }, ...STORY_LEVELS[lang].map((l) => ({ value: l, label: l }))]}
      />
      {list.length === 0 && <EmptyState title="Aucune histoire à ce niveau">Choisis un autre niveau.</EmptyState>}
      <ul className="plain stack tight">
        {list.map((s) => (
          <li key={s.id}>
            <a className="card card-link stack tight story-card" href={`#/${lang}/stories/${s.id}`}>
              <div className="row between wrap">
                <Txt lang={lang} className="module-title">
                  {s.title}
                </Txt>
                <div className="row wrap tight">
                  {read.includes(s.id) && <span className="badge m-mastered">Lue ✓</span>}
                  <span className="badge">{s.level}</span>
                  <span className="badge">≈ {readingMinutes(s)} min</span>
                </div>
              </div>
              <div className="muted small">
                {s.titleFr} · {s.theme}
              </div>
              <div className="small">{s.summary}</div>
            </a>
          </li>
        ))}
      </ul>
      <p className="muted small">
        Textes originaux, écrits par moi pour cette application : ils peuvent contenir des maladresses. Le niveau ({lang === "ja" ? "N5 à N1" : "A1 à C1"}) est indicatif ; le temps de lecture est une estimation prudente d'apprenant.
      </p>
    </div>
  );
}

// ---------- une histoire ----------

function sentenceWith(story: Story, g: Gloss): string | undefined {
  const parts = story.text.join("\n").split(/(?<=[.!?。！？”」])\s*|\n/);
  const stem = story.lang === "ja" ? g.w : g.w.length > 4 ? g.w.replace(/e$/, "") : g.w;
  const hit = parts.find((p) => p.toLowerCase().includes(stem.toLowerCase()));
  return hit?.trim() || undefined;
}

export function StoryView({ lang, id }: { lang: Lang; id: string }) {
  const { snapshot, saveEntry } = useData();
  const notify = useToast();
  const { read, toggle } = useReadList();
  const story = storyById(id);
  const back = () => (window.location.hash = `#/${lang}/stories`);
  const [busy, setBusy] = useState<string | null>(null);

  const known = useMemo(() => {
    const set = new Set<string>();
    if (!story) return set;
    for (const g of story.words) {
      const word = g.lemma ?? g.w;
      if (findDuplicate(snapshot.entries, lang, word, g.lemmaReading ?? g.reading)) set.add(g.w);
    }
    return set;
  }, [snapshot.entries, story, lang]);

  if (!story || story.lang !== lang) {
    return (
      <div className="page">
        <PageHead title="Histoire introuvable" onBack={back} />
        <EmptyState title="Cette histoire n'existe pas">Retourne à la liste.</EmptyState>
      </div>
    );
  }

  const isRead = read.includes(story.id);
  const size = storySize(story);

  const add = async (g: Gloss) => {
    const word = g.lemma ?? g.w;
    const reading = g.lemmaReading ?? g.reading;
    setBusy(g.w);
    try {
      const now = Date.now();
      const sentence = sentenceWith(story, g);
      const entry: Entry = {
        id: uid("entry"),
        lang,
        headword: word,
        variants: [],
        inflections: [],
        reading: lang === "ja" && reading && reading !== word ? reading : undefined,
        senses: [{ id: uid("sense"), pos: g.pos ?? "noun", translations: [g.fr], examples: sentence ? [{ id: uid("ex"), text: sentence }] : [] }],
        source: { kind: "reading", title: `Histoire : ${story.title}`, sentence },
        createdAt: now,
        updatedAt: now,
      };
      await saveEntry(entry, false);
      notify(`« ${word} » ajouté au dictionnaire.`, "ok");
    } catch (e) {
      notify(`Ajout impossible : ${e instanceof Error ? e.message : e}`, "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="page">
      <PageHead
        title={<span className={lang === "ja" ? "ja" : ""}>{story.title}</span>}
        onBack={back}
        sub={
          <>
            {story.titleFr} · {story.theme}
          </>
        }
      />
      <div className="row wrap tight">
        <span className="badge">
          {story.level} · {LEVEL_HINT[story.level]}
        </span>
        <span className="badge">≈ {readingMinutes(story)} min</span>
        <span className="badge">
          {size.toLocaleString("fr-FR")} {lang === "ja" ? "caractères" : "mots"}
        </span>
        {isRead && <span className="badge m-mastered">Lue ✓</span>}
      </div>

      <details className="card story-words">
        <summary className="module-title">Mots utiles ({story.words.length})</summary>
        <ul className="plain stack tight story-word-list">
          {story.words.map((g) => (
            <li key={g.w} className="row between wrap">
              <div>
                <Txt lang={lang} className="headword">
                  {g.lemma ?? g.w}
                </Txt>
                {lang === "ja" && (g.lemmaReading ?? g.reading) && (g.lemmaReading ?? g.reading) !== (g.lemma ?? g.w) && <Txt lang={lang} className="muted"> {g.lemmaReading ?? g.reading}</Txt>}
                <div className="muted small">{g.fr}</div>
              </div>
              {known.has(g.w) ? (
                <span className="muted small">Dans ton dictionnaire</span>
              ) : (
                <button className="btn small" disabled={busy === g.w} onClick={() => void add(g)} aria-label={`Ajouter ${g.lemma ?? g.w} au dictionnaire`}>
                  <Icon name="plus" size={14} /> Ajouter
                </button>
              )}
            </li>
          ))}
        </ul>
      </details>

      <Reader lang={lang} text={story.text.join("\n")} sourceTitle={`Histoire : ${story.title}`} hints={story.words} />

      <div className="row wrap">
        <button className={`btn ${isRead ? "" : "primary"}`} aria-pressed={isRead} onClick={() => toggle(story.id)}>
          {isRead ? "Marquer comme non lue" : "J'ai fini : marquer comme lue"}
        </button>
        <a className="btn" href={`#/${lang}/stories`}>
          Autres histoires
        </a>
      </div>
    </div>
  );
}
