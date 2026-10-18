"use client";

import React, { useMemo, useState } from "react";
import { Lang } from "../lib/types";
import { Block, Lesson, lessonsFor, richParts, topicsOfLessons } from "../lib/lessons";
import { IRREGULAR_VERBS } from "../lib/content/irregular-verbs";
import { normalizeForSearch } from "../lib/search";
import { Icon, PageHead, SpeakButton, Txt } from "./ui";

function Rich({ text, lang }: { text: string; lang: Lang }) {
  return (
    <>
      {richParts(text).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : <span key={i}>{p.text}</span>))}
    </>
  );
}

// ---------- liste ----------

export function LessonsPage({ lang }: { lang: Lang }) {
  const [q, setQ] = useState("");
  const lessons = lessonsFor(lang);
  const needle = normalizeForSearch(q);
  const filtered = lessons.filter((l) => !needle || normalizeForSearch(`${l.title} ${l.summary} ${l.topic}`).includes(needle));
  return (
    <div className="page">
      <PageHead title="Leçons" onBack={() => (window.location.hash = `#/${lang}`)} sub={lang === "ja" ? "Grammaire et références du japonais" : "Grammaire et références de l'anglais"} />
      <label className="field">
        <span className="label">Chercher une leçon</span>
        <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={lang === "ja" ? "particules, て, adjectifs…" : "present perfect, irréguliers, articles…"} />
      </label>
      {filtered.length === 0 && <p className="muted">Aucune leçon ne correspond.</p>}
      {topicsOfLessons(lang).map((topic) => {
        const items = filtered.filter((l) => l.topic === topic);
        if (!items.length) return null;
        return (
          <section key={topic} className="stack tight">
            <h2 className="h3">{topic}</h2>
            <ul className="plain">
              {items.map((l) => (
                <li key={l.id}>
                  <a className="card card-link row between" href={`#/${lang}/lessons/${l.id}`}>
                    <div>
                      <div className="module-title">{l.title}</div>
                      <div className="muted small">{l.summary}</div>
                    </div>
                    <div className="row">
                      <span className="badge">{l.level}</span>
                      <Icon name="next" />
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

// ---------- fiche ----------

function IrregularTable() {
  const [q, setQ] = useState("");
  const needle = normalizeForSearch(q);
  const rows = useMemo(
    () => IRREGULAR_VERBS.filter((r) => !needle || r.some((c) => normalizeForSearch(c).includes(needle))),
    [needle],
  );
  return (
    <div className="stack tight">
      <input className="input" type="search" aria-label="Chercher un verbe irrégulier" placeholder="Chercher (anglais ou français)…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="table-wrap">
        <table className="ltable">
          <thead>
            <tr>
              <th>Infinitif</th>
              <th>Prétérit</th>
              <th>Participe passé</th>
              <th>Sens</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                <td lang="en">
                  <strong>{r[0]}</strong>
                </td>
                <td lang="en">{r[1]}</td>
                <td lang="en">{r[2]}</td>
                <td>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">
        {rows.length} verbe{rows.length > 1 ? "s" : ""} sur {IRREGULAR_VERBS.length}.
      </p>
    </div>
  );
}

function BlockView({ b, lang }: { b: Block; lang: Lang }) {
  switch (b.t) {
    case "p":
      return (
        <p>
          <Rich text={b.text} lang={lang} />
        </p>
      );
    case "list":
      return (
        <ul className="lesson-list">
          {b.items.map((it, i) => (
            <li key={i}>
              <Rich text={it} lang={lang} />
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="table-wrap">
          <table className="ltable">
            <thead>
              <tr>
                {b.head.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} lang={lang === "ja" && /[぀-ヿ㐀-鿿]/.test(c) ? "ja" : lang === "en" ? "en" : undefined}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "ex":
      return (
        <ul className="plain stack tight">
          {b.items.map((ex, i) => (
            <li key={i} className="lesson-ex">
              <div className="row between">
                <Txt lang={lang} className="lesson-ex-text">
                  {ex.text}
                </Txt>
                <SpeakButton text={ex.text} lang={lang} />
              </div>
              {ex.reading && (
                <Txt lang={lang} className="muted small">
                  {ex.reading}
                </Txt>
              )}
              <div className="muted">{ex.tr}</div>
            </li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <div className="notice tip">
          <Icon name="bulb" size={18} />
          <div>
            <Rich text={b.text} lang={lang} />
          </div>
        </div>
      );
    case "warn":
      return (
        <div className="notice warn">
          <div>
            ⚠️ <Rich text={b.text} lang={lang} />
          </div>
        </div>
      );
    case "irregular":
      return <IrregularTable />;
  }
}

export function LessonView({ lang, id }: { lang: Lang; id: string }) {
  const list = lessonsFor(lang);
  const idx = list.findIndex((l) => l.id === id);
  const lesson: Lesson | undefined = list[idx];
  const back = () => (window.location.hash = `#/${lang}/lessons`);
  if (!lesson) {
    return (
      <div className="page">
        <PageHead title="Leçon introuvable" onBack={back} />
        <p className="muted">Cette leçon n'existe pas.</p>
      </div>
    );
  }
  const prev = list[idx - 1];
  const next = list[idx + 1];
  return (
    <div className="page lesson">
      <PageHead title={lesson.title} onBack={back} sub={`${lesson.topic} · niveau ${lesson.level}`} />
      {lesson.blocks.map((b, i) => (
        <BlockView key={i} b={b} lang={lang} />
      ))}
      <div className="card cta">
        <div className="muted small">Pour t'entraîner, lance une série d'exercices du même thème.</div>
        <a className="btn primary" href={`#/${lang}/exercises`}>
          Exercices
        </a>
      </div>
      <div className="row between wrap">
        {prev ? (
          <a className="btn" href={`#/${lang}/lessons/${prev.id}`}>
            <Icon name="back" size={16} /> {prev.title}
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a className="btn" href={`#/${lang}/lessons/${next.id}`}>
            {next.title} <Icon name="next" size={16} />
          </a>
        )}
      </div>
    </div>
  );
}
