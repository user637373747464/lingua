"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Grade, Lang, LANG_INFO } from "../lib/types";
import { useData } from "../lib/store";
import { useLangStats } from "../lib/hooks";
import { Presentation, buildQueue, prepareCard } from "../lib/cards";
import { checkAnswer, CheckKind } from "../lib/answers";
import { isNewCard, newReviewState, nextIntervalLabel } from "../lib/srs";
import { formatDate, formatDuration } from "../lib/dates";
import { EmptyState, Icon, PageHead, Progress, SpeakButton, Txt, useToast } from "./ui";

const REQUEUE_GAP = 3; // une carte ratée revient après ~3 autres cartes
const MAX_REQUEUES = 3; // au-delà, elle reviendra dans 10 minutes (prochaine session)

interface Session {
  queue: string[];
  pos: number;
  failed: string[]; // cartes ratées dans cette session (leur 2e passage ne compte pas un nouvel oubli)
  requeues: Record<string, number>;
  newIds: string[];
  answered: number;
  correct: number;
  seconds: number;
  total: number;
}

// ---------- une carte ----------

interface Outcome {
  correct: boolean;
  almost?: boolean;
  chosen?: number;
  typed?: string;
  gaveUp?: boolean;
}

function CardRunner({
  p,
  lang,
  retry,
  intervalFor,
  onGrade,
}: {
  p: Presentation;
  lang: Lang;
  retry: boolean;
  intervalFor: (g: Grade, hinted: boolean) => string;
  onGrade: (grade: Grade, hinted: boolean, elapsedSec: number) => Promise<void>;
}) {
  const shownAt = useRef(Date.now());
  const [typed, setTyped] = useState("");
  const [hinted, setHinted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [overridden, setOverridden] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (p.mode === "typed") inputRef.current?.focus();
  }, [p.mode]);

  const grade = async (g: Grade) => {
    if (busy) return;
    setBusy(true);
    try {
      await onGrade(g, hinted, (Date.now() - shownAt.current) / 1000);
    } finally {
      setBusy(false);
    }
  };

  const choose = (i: number) => {
    if (outcome) return;
    setOutcome({ correct: i === p.correctIndex, chosen: i });
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (outcome) return;
    if (!typed.trim()) return;
    const r = checkAnswer(typed, p.accepted, p.lang);
    const kind: CheckKind = r.result;
    setOutcome({ correct: kind === "correct", almost: kind === "almost", typed });
  };

  const giveUp = () => {
    if (outcome) return;
    setOutcome({ correct: false, gaveUp: true, typed });
  };

  // le résultat est « réussi » si la réponse est juste, ou si l'utilisateur a corrigé un « presque »
  const success = !!outcome && (outcome.correct || overridden);
  const needsGrade = p.mode === "flip" ? flipped : success;
  const showFeedback = p.mode === "flip" ? flipped : !!outcome;

  const gradeButtons: { grade: Grade; label: string }[] = [];
  if (needsGrade) {
    if (p.mode === "flip") gradeButtons.push({ grade: "again", label: "À revoir" });
    gradeButtons.push({ grade: "hard", label: "Difficile" });
    if (!hinted) gradeButtons.push({ grade: "good", label: "Bien" });
    if (!hinted && !retry) gradeButtons.push({ grade: "easy", label: "Facile" });
  }
  const gradesRef = useRef(gradeButtons);
  gradesRef.current = gradeButtons;

  // raccourcis clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || tag === "A") return;
      if (busy) return;
      if (p.mode === "mcq" && !outcome) {
        const n = Number(e.key);
        if (n >= 1 && p.options && n <= p.options.length) {
          e.preventDefault();
          choose(n - 1);
        }
        return;
      }
      if (p.mode === "flip" && !flipped && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setFlipped(true);
        return;
      }
      if (!showFeedback) return;
      if (!needsGrade) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void grade("again");
        }
        return;
      }
      const list = gradesRef.current;
      const n = Number(e.key);
      if (n >= 1 && n <= list.length) {
        e.preventDefault();
        void grade(list[n - 1].grade);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const dflt = list.find((b) => b.grade === "good") ?? list[0];
        if (dflt) void grade(dflt.grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, outcome, flipped, showFeedback, needsGrade, p.mode, hinted]);

  const promptLang: Lang | null = p.kind === "recognition" ? p.lang : null;
  const ex = p.extra;

  return (
    <div className="study-card card stack">
      <div className="muted small center-text">{p.promptLabel}</div>

      <div className="prompt-block">
        {promptLang ? (
          <Txt lang={promptLang} className="prompt big-word">
            {p.prompt}
          </Txt>
        ) : (
          <span className="prompt">{p.prompt}</span>
        )}
        {p.speakText && (p.kind === "recognition" || showFeedback) && <SpeakButton text={p.speakText} lang={p.lang} />}
      </div>

      {p.context && (
        <div className="context">
          <Txt lang={p.lang}>{p.context}</Txt>
          {p.contextTranslation && <div className="muted small">{p.contextTranslation}</div>}
        </div>
      )}

      {/* ---------- QCM ---------- */}
      {p.mode === "mcq" && p.options && (
        <ul className="options" role="list">
          {p.options.map((o, i) => {
            const state = !outcome ? "" : i === p.correctIndex ? "right" : i === outcome.chosen ? "wrong" : "dim";
            return (
              <li key={i}>
                <button className={`option ${state}`} disabled={!!outcome} onClick={() => choose(i)}>
                  <span className="key">{i + 1}</span>
                  <span>{o}</span>
                  {state === "right" && <Icon name="check" size={18} />}
                  {state === "wrong" && <Icon name="x" size={18} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* ---------- réponse écrite ---------- */}
      {p.mode === "typed" && (
        <form onSubmit={submit} className="stack tight">
          <input
            ref={inputRef}
            className="input big"
            lang={p.lang === "ja" ? "ja" : "en"}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={!!outcome}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="done"
            aria-label="Ta réponse"
            placeholder={p.lang === "ja" ? "ひらがな, 漢字 ou romaji" : "Ta réponse"}
          />
          {showHint && !outcome && p.hint && (
            <div className="hint" aria-live="polite">
              Indice : <code>{p.hint}</code>
            </div>
          )}
          {!outcome && (
            <div className="row wrap">
              <button type="submit" className="btn primary grow" disabled={!typed.trim()}>
                Valider
              </button>
              {p.hint && !showHint && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowHint(true);
                    setHinted(true);
                  }}
                >
                  <Icon name="bulb" size={18} /> Indice
                </button>
              )}
              <button type="button" className="btn ghost" onClick={giveUp}>
                Je ne sais pas
              </button>
            </div>
          )}
        </form>
      )}

      {/* ---------- carte à retourner ---------- */}
      {p.mode === "flip" && !flipped && (
        <button className="btn primary" onClick={() => setFlipped(true)}>
          Montrer la réponse
        </button>
      )}

      {/* ---------- «je ne sais pas» pour le QCM ---------- */}
      {p.mode === "mcq" && !outcome && (
        <button className="btn ghost" onClick={() => setOutcome({ correct: false, gaveUp: true })}>
          Je ne sais pas
        </button>
      )}

      {/* ---------- retour ---------- */}
      {showFeedback && (
        <div className="feedback stack tight" aria-live="polite">
          {p.mode !== "flip" && outcome && (
            <div className={`verdict ${success ? "ok" : outcome.almost ? "almost" : "ko"}`}>
              {success
                ? hinted
                  ? "Juste (avec indice)"
                  : "Juste !"
                : outcome.almost
                  ? "Presque ! Attention à l'orthographe"
                  : outcome.gaveUp
                    ? "Voici la réponse"
                    : "Ce n'est pas ça"}
            </div>
          )}
          <div className="answer-line">
            <span className="muted small">Réponse : </span>
            <Txt lang={p.kind === "recognition" ? "en" : p.lang} className="answer">
              {p.answerDisplay}
            </Txt>
          </div>
          {outcome?.typed && !outcome.correct && !outcome.gaveUp && <div className="muted small">Tu as écrit : {outcome.typed}</div>}
          {ex?.reading && p.kind === "recognition" && (
            <div className="muted">
              Lecture : <Txt lang={p.lang}>{ex.reading}</Txt>
            </div>
          )}
          {ex?.ipa && p.kind === "recognition" && <div className="muted">/{ex.ipa.replace(/^\/|\/$/g, "")}/</div>}
          {ex?.example && (
            <div className="example-line">
              <Txt lang={p.lang}>{ex.example}</Txt>
              {ex.exampleTranslation && <div className="muted small">{ex.exampleTranslation}</div>}
            </div>
          )}
          {ex?.notes && <div className="muted small">{ex.notes}</div>}
          {ex?.entryId && (
            <a className="small" href={`#/${lang}/dictionary/${ex.entryId}`}>
              Ouvrir la fiche du mot
            </a>
          )}

          {outcome?.almost && !overridden && (
            <button className="btn small" onClick={() => setOverridden(true)}>
              Ma réponse était juste (faute de frappe)
            </button>
          )}

          {needsGrade ? (
            <div className="grades" role="group" aria-label="Comment était cette carte ?">
              {gradeButtons.map((b, i) => (
                <button key={b.grade} className={`btn grade g-${b.grade}`} disabled={busy} onClick={() => void grade(b.grade)}>
                  <span>{b.label}</span>
                  <small>{intervalFor(b.grade, hinted)}</small>
                  <span className="key">{i + 1}</span>
                </button>
              ))}
            </div>
          ) : (
            <button className="btn primary" disabled={busy} onClick={() => void grade("again")}>
              Continuer <small className="muted">· reviendra dans {intervalFor("again", hinted)}</small>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- écran de révision ----------

export default function Study({ lang }: { lang: Lang }) {
  const { snapshot, statesById, answerCard } = useData();
  const stats = useLangStats(lang);
  const notify = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [lastSummary, setLastSummary] = useState<Session | null>(null);
  const info = LANG_INFO[lang];
  const home = () => (window.location.hash = `#/${lang}`);

  const start = () => {
    const now = Date.now();
    const entryIds = new Set(snapshot.entries.filter((e) => e.lang === lang).map((e) => e.id));
    const { due, fresh } = buildQueue(snapshot.cards, statesById, entryIds, { lang, now, newLimit: stats.newLimitLeft });
    // on écarte les cartes qui ne peuvent pas être présentées (mot sans traduction, etc.)
    const ok = [...due, ...fresh].filter((c) => prepareCard(c, snapshot.entries) !== null).map((c) => c.id);
    if (ok.length === 0) {
      notify("Aucune carte à présenter pour le moment.", "info");
      return;
    }
    setLastSummary(null);
    setSession({ queue: ok, pos: 0, failed: [], requeues: {}, newIds: [], answered: 0, correct: 0, seconds: 0, total: ok.length });
  };

  const currentId = session ? session.queue[session.pos] : undefined;
  const card = currentId ? snapshot.cards.find((c) => c.id === currentId) : undefined;
  // la présentation (et le tirage des mauvaises réponses) est fixée une fois par passage
  const presentation = useMemo(
    () => (card ? prepareCard(card, snapshot.entries) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.pos, currentId],
  );

  // carte devenue impossible à présenter (supprimée…) : on passe à la suivante
  useEffect(() => {
    if (session && currentId && !presentation) {
      setSession((s) => (s ? { ...s, pos: s.pos + 1 } : s));
    }
  }, [session, currentId, presentation]);

  // fin de session
  useEffect(() => {
    if (session && session.pos >= session.queue.length) {
      setLastSummary(session);
      setSession(null);
    }
  }, [session]);

  const onGrade = async (grade: Grade, hinted: boolean, elapsed: number) => {
    if (!session || !card) return;
    const retry = session.failed.includes(card.id);
    const wasNew = isNewCard(statesById.get(card.id));
    try {
      await answerCard({ cardId: card.id, grade, hinted, retry, elapsedSec: elapsed });
    } catch (e) {
      notify(`Réponse non enregistrée : ${e instanceof Error ? e.message : e}`, "error");
      return;
    }
    setSession((s) => {
      if (!s) return s;
      const queue = [...s.queue];
      const failed = [...s.failed];
      const requeues = { ...s.requeues };
      if (grade === "again") {
        if (!failed.includes(card.id)) failed.push(card.id);
        const n = requeues[card.id] ?? 0;
        if (n < MAX_REQUEUES) {
          requeues[card.id] = n + 1;
          queue.splice(Math.min(queue.length, s.pos + 1 + REQUEUE_GAP), 0, card.id);
        }
      }
      return {
        ...s,
        queue,
        failed,
        requeues,
        pos: s.pos + 1,
        answered: s.answered + 1,
        correct: s.correct + (grade === "again" ? 0 : 1),
        seconds: s.seconds + Math.min(120, Math.round(elapsed)),
        newIds: wasNew && !s.newIds.includes(card.id) ? [...s.newIds, card.id] : s.newIds,
        total: s.total + (queue.length - s.queue.length),
      };
    });
  };

  const intervalFor = (g: Grade, hinted: boolean): string => {
    if (!card) return "";
    const st = statesById.get(card.id) ?? newReviewState(card.id, Date.now());
    return nextIntervalLabel(st, g, Date.now(), { hinted, retry: !!session?.failed.includes(card.id) });
  };

  // ---------- session en cours ----------
  if (session && card && presentation) {
    return (
      <div className="page study">
        <PageHead
          title={`Révision · ${info.name}`}
          onBack={home}
          backLabel="Quitter la session"
          sub={`${Math.min(session.pos + 1, session.total)} / ${session.total}`}
        />
        <Progress value={session.pos} max={session.total} label="Avancement de la session" />
        <CardRunner key={`${card.id}:${session.pos}`} p={presentation} lang={lang} retry={session.failed.includes(card.id)} intervalFor={intervalFor} onGrade={onGrade} />
        <p className="muted small center-text">Ta progression est enregistrée à chaque carte : tu peux quitter quand tu veux.</p>
      </div>
    );
  }

  // ---------- bilan ----------
  if (lastSummary) {
    const s = lastSummary;
    const pctOk = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
    return (
      <div className="page">
        <PageHead title="Session terminée" onBack={home} />
        <div className="card stack center-text">
          <div className="big-number">{pctOk} %</div>
          <div className="muted">de réussite sur {s.answered} réponse{s.answered > 1 ? "s" : ""}</div>
          <div className="metrics">
            <div>
              <strong>{s.newIds.length}</strong>
              <span>nouvelle{s.newIds.length > 1 ? "s" : ""}</span>
            </div>
            <div>
              <strong>{s.failed.length}</strong>
              <span>à revoir</span>
            </div>
            <div>
              <strong>{formatDuration(s.seconds)}</strong>
              <span>de travail</span>
            </div>
          </div>
          {s.failed.length > 0 && <p className="muted small">Les cartes ratées reviendront dans une dizaine de minutes.</p>}
          <div className="row center wrap">
            {stats.due + stats.fresh > 0 && (
              <button className="btn primary" onClick={start}>
                Encore quelques cartes
              </button>
            )}
            <button className="btn" onClick={home}>
              Terminer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- accueil de la session ----------
  const nothing = stats.due + stats.fresh === 0;
  const hasCards = snapshot.cards.some((c) => c.lang === lang);
  const nextDue = nothing
    ? snapshot.reviewStates
        .filter((s) => s.lastReviewAt !== undefined && s.due > Date.now() && snapshot.cards.some((c) => c.id === s.cardId && !c.suspended))
        .reduce<number | null>((m, s) => (m === null || s.due < m ? s.due : m), null)
    : null;

  return (
    <div className="page">
      <PageHead title={`Révision · ${info.name}`} onBack={home} />
      {nothing ? (
        hasCards ? (
          <EmptyState title="Rien à réviser pour le moment">
            Bravo, tu es à jour !{nextDue ? <> Prochaine carte : {new Date(nextDue).toDateString() === new Date().toDateString() ? "aujourd'hui" : formatDate(nextDue)}.</> : null}
            {stats.newLimitLeft === 0 && <div className="small">Tu as atteint ta limite de nouvelles cartes pour aujourd'hui (modifiable dans les Réglages).</div>}
            <div className="row center wrap" style={{ marginTop: 14 }}>
              <a className="btn primary" href={`#/${lang}/dictionary/new`}>
                Ajouter un mot
              </a>
              <a className="btn" href={`#/${lang}/exercises`}>
                Faire des exercices
              </a>
            </div>
          </EmptyState>
        ) : (
          <EmptyState title="Pas encore de cartes">
            Ajoute des mots à ton dictionnaire : leurs cartes de révision sont créées automatiquement.
            <div className="row center" style={{ marginTop: 14 }}>
              <a className="btn primary" href={`#/${lang}/dictionary`}>
                Ouvrir le dictionnaire
              </a>
            </div>
          </EmptyState>
        )
      ) : (
        <div className="card stack center-text">
          <div className="metrics">
            <div>
              <strong>{stats.due}</strong>
              <span>à réviser</span>
            </div>
            <div>
              <strong>{stats.fresh}</strong>
              <span>nouvelle{stats.fresh > 1 ? "s" : ""}</span>
            </div>
          </div>
          <p className="muted small">Les cartes de rappel (écriture) arrivent après la réussite de la carte QCM du même mot.</p>
          <div>
            <button className="btn primary big" onClick={start}>
              Commencer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
