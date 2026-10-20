"use client";

import React, { useMemo, useState } from "react";
import { Lang, LANG_INFO } from "../lib/types";
import { useData } from "../lib/store";
import { useNow } from "../lib/hooks";
import { currentStreak, exerciseTopics, lastDaysMinutes, longestStreak, pct, totals } from "../lib/stats";
import { isLearned } from "../lib/decks";
import { formatDuration } from "../lib/dates";
import { EmptyState, PageHead, Segmented, Txt } from "./ui";

type Scope = "all" | Lang;

const DAY_LABELS = ["di", "lu", "ma", "me", "je", "ve", "sa"];

export default function ProgressPage() {
  const { snapshot } = useData();
  const now = useNow(60_000);
  const [scope, setScope] = useState<Scope>("all");
  const lang = scope === "all" ? undefined : scope;

  const log = useMemo(() => (lang ? snapshot.studyLog.filter((d) => d.lang === lang) : snapshot.studyLog), [snapshot.studyLog, lang]);
  const t = useMemo(() => totals(log), [log]);
  const week = useMemo(() => lastDaysMinutes(log, now, 7), [log, now]);
  const maxMin = Math.max(10, ...week.map((d) => d.minutes));
  const entries = useMemo(() => snapshot.entries.filter((e) => !lang || e.lang === lang), [snapshot.entries, lang]);

  const deckCards = useMemo(() => snapshot.deckCards.filter((c) => !lang || c.lang === lang), [snapshot.deckCards, lang]);
  const cardCounts = useMemo(() => {
    let fresh = 0,
      learning = 0,
      learned = 0;
    for (const c of deckCards) {
      if (c.fwd.seen === 0 && c.rev.seen === 0) fresh++;
      else if (isLearned(c.fwd) && isLearned(c.rev)) learned++;
      else learning++;
    }
    return { fresh, learning, learned };
  }, [deckCards]);

  const difficult = useMemo(() => {
    const rows: { id: string; front: string; lang: Lang; fails: number }[] = [];
    for (const c of deckCards) {
      const seen = c.fwd.seen + c.rev.seen;
      const fails = seen - (c.fwd.ok + c.rev.ok);
      if (seen >= 2 && fails >= 2 && fails / seen >= 0.4) rows.push({ id: c.id, front: `${c.front} → ${c.back}`, lang: c.lang, fails });
    }
    return rows.sort((a, b) => b.fails - a.fails).slice(0, 8);
  }, [deckCards]);

  const weakTopics = useMemo(() => {
    const langs: Lang[] = lang ? [lang] : ["en", "ja"];
    return langs.flatMap((l) => exerciseTopics(snapshot.exerciseStats, l).map((x) => ({ ...x, lang: l }))).filter((x) => x.tries >= 2).slice(0, 5);
  }, [snapshot.exerciseStats, lang]);

  const empty = t.answers === 0 && t.exercises === 0 && entries.length === 0;
  const streak = currentStreak(log, now);

  return (
    <div className="page">
      <PageHead title="Progression" sub="Calculée uniquement à partir de tes données, sur cet appareil" />
      <Segmented
        value={scope}
        label="Langue"
        options={[
          { value: "all", label: "Tout" },
          { value: "en", label: "English" },
          { value: "ja", label: "日本語" },
        ]}
        onChange={setScope}
      />

      {empty ? (
        <EmptyState title="Pas encore de statistiques">Ajoute des mots et fais quelques révisions : tes progrès apparaîtront ici.</EmptyState>
      ) : (
        <>
          <section className="card">
            <div className="metrics four">
              <div>
                <strong>{streak}</strong>
                <span>jour{streak > 1 ? "s" : ""} d'affilée</span>
              </div>
              <div>
                <strong>{longestStreak(log)}</strong>
                <span>record</span>
              </div>
              <div>
                <strong>{formatDuration(t.seconds)}</strong>
                <span>au total</span>
              </div>
              <div>
                <strong>{entries.length}</strong>
                <span>mots</span>
              </div>
            </div>
          </section>

          <section className="card stack">
            <h2 className="h3">7 derniers jours (minutes)</h2>
            <div className="bars" role="img" aria-label={`Minutes d'étude : ${week.map((d) => `${d.date} ${d.minutes}`).join(", ")}`}>
              {week.map((d) => {
                const [y, m, day] = d.date.split("-").map(Number);
                const wd = DAY_LABELS[new Date(y, m - 1, day).getDay()];
                return (
                  <div key={d.date} className="bar-col">
                    <span className="bar-val small">{d.minutes || ""}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ height: `${(d.minutes / maxMin) * 100}%` }} />
                    </div>
                    <span className="small muted">{wd}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card stack">
            <h2 className="h3">Réussite aux révisions</h2>
            {t.answers === 0 ? (
              <p className="muted">Aucune révision pour l'instant.</p>
            ) : (
              <dl className="facts wide">
                <dt>Réponses justes</dt>
                <dd>
                  {pct(t.correct, t.answers)} <span className="muted small">({t.answers} réponses)</span>
                </dd>
                <dt>Justes sans indice</dt>
                <dd>{pct(t.unaided, t.answers)}</dd>
                <dt>Reconnaissance (cartes, QCM, associer)</dt>
                <dd>
                  {pct(t.recognition.ok, t.recognition.n)} <span className="muted small">({t.recognition.n})</span>
                </dd>
                <dt>Rappel (écrire)</dt>
                <dd>
                  {pct(t.recall.ok, t.recall.n)} <span className="muted small">({t.recall.n})</span>
                </dd>
                {t.exercises > 0 && (
                  <>
                    <dt>Exercices</dt>
                    <dd>
                      {pct(t.exercisesCorrect, t.exercises)} <span className="muted small">({t.exercises})</span>
                    </dd>
                  </>
                )}
              </dl>
            )}
            <p className="muted small">Reconnaître un mot est plus facile que l'écrire : un écart entre les deux est normal.</p>
          </section>

          <section className="card stack">
            <h2 className="h3">Tes cartes</h2>
            <div className="metrics">
              <div>
                <strong>{cardCounts.fresh}</strong>
                <span>nouvelles</span>
              </div>
              <div>
                <strong>{cardCounts.learning}</strong>
                <span>en cours</span>
              </div>
              <div>
                <strong>{cardCounts.learned}</strong>
                <span>bien retenues</span>
              </div>
            </div>
            <p className="muted small">« Bien retenue » = réussie plusieurs fois de suite dans les deux sens (langue → français et français → langue).</p>
          </section>

          {difficult.length > 0 && (
            <section className="card stack">
              <h2 className="h3">Cartes difficiles</h2>
              <ul className="plain">
                {difficult.map((d) => (
                  <li key={d.id} className="row between">
                    <Txt lang={d.lang}>{d.front}</Txt>
                    <span className="muted small">{d.fails} échecs</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {weakTopics.length > 0 && (
            <section className="card stack">
              <h2 className="h3">Thèmes à retravailler</h2>
              <ul className="plain">
                {weakTopics.map((w) => (
                  <li key={`${w.lang}:${w.topic}`} className="row between">
                    <span>
                      {w.topic} <span className="muted small">· {LANG_INFO[w.lang].short}</span>
                    </span>
                    <span className="muted">{pct(w.correct, w.tries)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
