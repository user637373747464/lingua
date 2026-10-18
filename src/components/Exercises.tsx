"use client";

import { shuffle } from "../lib/cards";
import React, { useMemo, useRef, useState } from "react";
import { Lang, LANG_INFO } from "../lib/types";
import { useData } from "../lib/store";
import { Exercise, checkExercise, exercisesFor, expectedAnswerText, levelsFor, pickSeries, shuffledTokens, topicHistory, topicsFor } from "../lib/exercises";
import { EmptyState, Icon, PageHead, Progress, Segmented, Txt, useToast } from "./ui";

interface Result {
  ex: Exercise;
  correct: boolean;
}

// ---------- un exercice ----------

function ExerciseRunner({
  ex,
  previousWrong,
  onDone,
}: {
  ex: Exercise;
  previousWrong: number;
  onDone: (correct: boolean, elapsedSec: number) => Promise<void>;
}) {
  const shownAt = useRef(Date.now());
  const [chosen, setChosen] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const tokens = useMemo(() => (ex.type === "order" ? shuffledTokens(ex.words) : []), [ex]);
  // l'ordre des choix est mélangé à chaque exercice (la bonne réponse ne doit pas être à une place prévisible)
  const choiceOrder = useMemo(() => (ex.type === "mcq" ? shuffle(ex.choices.map((_, i) => i)) : []), [ex]);
  const [picked, setPicked] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<{ correct: boolean; almost?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const lang: Lang = ex.lang;

  const answer = (response: number | string | string[]) => {
    if (verdict) return;
    setVerdict(checkExercise(ex, response));
  };

  const next = async () => {
    if (!verdict || busy) return;
    setBusy(true);
    try {
      await onDone(verdict.correct, (Date.now() - shownAt.current) / 1000);
    } finally {
      setBusy(false);
    }
  };

  const sentence = "sentence" in ex ? ex.sentence : undefined;

  return (
    <div className="card stack">
      <div className="row between wrap small muted">
        <span>{ex.topic}</span>
        <span className="badge">{ex.level}</span>
      </div>
      <div className="h3">{ex.prompt}</div>
      {sentence && (
        <div className="context big-sentence">
          <Txt lang={lang}>{sentence}</Txt>
        </div>
      )}

      {ex.type === "mcq" && (
        <ul className="options" role="list">
          {choiceOrder.map((i, rank) => {
            const c = ex.choices[i];
            const state = !verdict ? "" : i === ex.correct ? "right" : i === chosen ? "wrong" : "dim";
            return (
              <li key={i}>
                <button
                  className={`option ${state}`}
                  disabled={!!verdict}
                  onClick={() => {
                    setChosen(i);
                    answer(i);
                  }}
                >
                  <span className="key">{rank + 1}</span>
                  <Txt lang={lang}>{c}</Txt>
                  {state === "right" && <Icon name="check" size={18} />}
                  {state === "wrong" && <Icon name="x" size={18} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {ex.type === "fill" && (
        <form
          className="stack tight"
          onSubmit={(e) => {
            e.preventDefault();
            if (typed.trim()) answer(typed);
          }}
        >
          <input
            className="input big"
            lang={lang === "ja" ? "ja" : "en"}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={!!verdict}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-label="Ta réponse"
            autoFocus
          />
          {ex.hint && !verdict && <div className="muted small">Indice : {ex.hint}</div>}
          {!verdict && (
            <button className="btn primary" type="submit" disabled={!typed.trim()}>
              Valider
            </button>
          )}
        </form>
      )}

      {ex.type === "order" && (
        <div className="stack tight">
          <div className={`order-line ${lang === "ja" ? "ja" : ""}`} aria-label="Ta phrase" lang={lang === "ja" ? "ja" : "en"}>
            {picked.length === 0 && <span className="muted small">Touche les mots dans l'ordre</span>}
            {picked.map((ti, k) => (
              <button key={k} className="chip on" disabled={!!verdict} onClick={() => setPicked(picked.filter((_, j) => j !== k))}>
                {tokens[ti]}
              </button>
            ))}
          </div>
          <div className={`order-bank ${lang === "ja" ? "ja" : ""}`} lang={lang === "ja" ? "ja" : "en"}>
            {tokens.map((t, ti) => (
              <button key={ti} className="chip" disabled={!!verdict || picked.includes(ti)} onClick={() => setPicked([...picked, ti])}>
                {t}
              </button>
            ))}
          </div>
          {!verdict && (
            <div className="row">
              <button className="btn ghost" disabled={picked.length === 0} onClick={() => setPicked([])}>
                Effacer
              </button>
              <button className="btn primary grow" disabled={picked.length !== tokens.length} onClick={() => answer(picked.map((i) => tokens[i]))}>
                Valider
              </button>
            </div>
          )}
        </div>
      )}

      {verdict && (
        <div className="feedback stack tight" aria-live="polite">
          <div className={`verdict ${verdict.correct ? "ok" : verdict.almost ? "almost" : "ko"}`}>
            {verdict.correct ? "Juste !" : verdict.almost ? "Presque ! Vérifie l'orthographe" : "Ce n'est pas ça"}
          </div>
          {!verdict.correct && (
            <div>
              <span className="muted small">Réponse attendue : </span>
              <Txt lang={lang} className="answer">
                {expectedAnswerText(ex)}
              </Txt>
            </div>
          )}
          <p>{ex.explanation}</p>
          {!verdict.correct && previousWrong >= 2 && <p className="muted small">Ce thème t'a déjà posé problème {previousWrong} fois : relis bien l'explication.</p>}
          <button className="btn primary" disabled={busy} onClick={next} autoFocus>
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- écran ----------

export default function Exercises({ lang }: { lang: Lang }) {
  const { snapshot, answerExercise } = useData();
  const notify = useToast();
  const info = LANG_INFO[lang];
  const topics = useMemo(() => topicsFor(lang), [lang]);
  const levels = useMemo(() => levelsFor(lang), [lang]);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [size, setSize] = useState<"5" | "10" | "20" | "50">("10");
  const [series, setSeries] = useState<Exercise[] | null>(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const home = () => (window.location.hash = `#/${lang}`);

  const pool = useMemo(() => exercisesFor(lang).filter((e) => (!topic || e.topic === topic) && (!level || e.level === level)), [lang, topic, level]);

  const start = () => {
    const picked = pickSeries(pool, snapshot.exerciseStats, Number(size));
    if (picked.length === 0) return;
    setSeries(picked);
    setIndex(0);
    setResults([]);
  };

  if (series && index < series.length) {
    const ex = series[index];
    const prev = topicHistory(snapshot.exerciseStats, lang, ex.topic).wrong;
    return (
      <div className="page">
        <PageHead title={`Exercices · ${info.name}`} onBack={() => setSeries(null)} backLabel="Arrêter la série" sub={`${index + 1} / ${series.length}`} />
        <Progress value={index} max={series.length} label="Avancement de la série" />
        <ExerciseRunner
          key={`${ex.id}:${index}`}
          ex={ex}
          previousWrong={prev}
          onDone={async (correct, elapsed) => {
            try {
              await answerExercise(ex, correct, elapsed);
            } catch (e) {
              notify(`Résultat non enregistré : ${e instanceof Error ? e.message : e}`, "error");
              return;
            }
            setResults((r) => [...r, { ex, correct }]);
            setIndex((i) => i + 1);
          }}
        />
      </div>
    );
  }

  if (series) {
    const ok = results.filter((r) => r.correct).length;
    const wrong = results.filter((r) => !r.correct);
    return (
      <div className="page">
        <PageHead title="Série terminée" onBack={home} />
        <div className="card stack center-text">
          <div className="big-number">
            {ok} / {results.length}
          </div>
          <div className="muted">bonnes réponses</div>
        </div>
        {wrong.length > 0 && (
          <section className="card stack">
            <h2 className="h3">À retravailler</h2>
            <ul className="plain stack tight">
              {wrong.map((r) => (
                <li key={r.ex.id}>
                  <div className="small muted">{r.ex.topic}</div>
                  <Txt lang={lang}>{expectedAnswerText(r.ex)}</Txt>
                  <div className="muted small">{r.ex.explanation}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="row center wrap">
          <button className="btn primary" onClick={start}>
            Nouvelle série
          </button>
          <button className="btn" onClick={() => setSeries(null)}>
            Changer de thème
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHead title="Grammaire et exercices" sub={info.name} onBack={home} />
      <div className="card stack">
        <label className="field">
          <span className="label">Thème</span>
          <select className="select" value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">Tous les thèmes</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="label">Niveau</span>
          <select className="select" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Tous les niveaux</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <div className="field">
          <span className="label">Nombre d'exercices</span>
          <Segmented
            value={size}
            label="Nombre d'exercices"
            options={[
              { value: "5", label: "5" },
              { value: "10", label: "10" },
              { value: "20", label: "20" },
              { value: "50", label: "50" },
            ]}
            onChange={setSize}
          />
        </div>
        {pool.length === 0 ? (
          <EmptyState title="Aucun exercice pour ce choix">Essaie un autre niveau ou un autre thème.</EmptyState>
        ) : (
          <>
            <p className="muted small">
              {pool.length} exercice{pool.length > 1 ? "s" : ""} disponible{pool.length > 1 ? "s" : ""}. Les exercices jamais faits ou ratés reviennent en priorité.
            </p>
            <button className="btn primary big" onClick={start}>
              Commencer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
