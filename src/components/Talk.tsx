"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lang } from "../lib/types";
import { STORY_LEVELS } from "../lib/stories";
import { Line, Option, Talk, TalkLevel, orderedOptions, scoreMessage, scorePercent } from "../lib/talk";
import { talkById, talksFor } from "../lib/talk-data";
import { EmptyState, PageHead, Progress, Segmented, SpeakButton, Txt } from "./ui";
import { LEVEL_HINT } from "./Stories";

// Meilleurs scores : simple confort d'affichage, gardé dans ce navigateur (pas dans la sauvegarde)
const BEST_KEY = "lingua.talk.best";
function loadBest(): Record<string, number> {
  try {
    const v = JSON.parse(window.localStorage.getItem(BEST_KEY) ?? "{}");
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    const out: Record<string, number> = {};
    for (const [k, n] of Object.entries(v)) if (typeof n === "number" && n >= 0 && n <= 100) out[k] = n;
    return out;
  } catch {
    return {};
  }
}
function saveBest(b: Record<string, number>) {
  try {
    window.localStorage.setItem(BEST_KEY, JSON.stringify(b));
  } catch {
    /* navigateur privé : tant pis */
  }
}

function useBest() {
  const [best, setBest] = useState<Record<string, number>>({});
  useEffect(() => setBest(loadBest()), []);
  const record = (id: string, pct: number) =>
    setBest((prev) => {
      const next = { ...prev, [id]: Math.max(pct, prev[id] ?? 0) };
      saveBest(next);
      return next;
    });
  return { best, record };
}

/** Traductions affichées d'office pour les niveaux débutants. */
const EASY: TalkLevel[] = ["A1", "A2", "N5", "N4"];

// ---------- liste ----------

export function TalkPage({ lang }: { lang: Lang }) {
  const [level, setLevel] = useState<TalkLevel | "all">("all");
  const { best } = useBest();
  const list = talksFor(lang, level);
  return (
    <div className="page">
      <PageHead
        title="Conversation"
        onBack={() => (window.location.hash = `#/${lang}`)}
        sub="Une personne te parle, tu choisis la réponse la plus adaptée parmi trois. Les dialogues sont écrits d'avance : pas d'intelligence artificielle, pas besoin de connexion."
      />
      <Segmented
        label="Niveau"
        value={level}
        onChange={setLevel}
        options={[{ value: "all", label: "Tous" }, ...STORY_LEVELS[lang].map((l) => ({ value: l, label: l }))]}
      />
      {list.length === 0 && <EmptyState title="Aucun dialogue à ce niveau">Choisis un autre niveau.</EmptyState>}
      <ul className="plain stack tight">
        {list.map((t) => (
          <li key={t.id}>
            <a className="card card-link stack tight story-card" href={`#/${lang}/talk/${t.id}`}>
              <div className="row between wrap">
                <Txt lang={lang} className="module-title">
                  {t.title}
                </Txt>
                <div className="row wrap tight">
                  {best[t.id] !== undefined && <span className="badge m-mastered">Meilleur : {best[t.id]} %</span>}
                  <span className="badge">{t.level}</span>
                  <span className="badge">{t.turns.length} échanges</span>
                </div>
              </div>
              <div className="muted small">
                {t.titleFr} · {t.role}
              </div>
              <div className="small">{t.goal}</div>
            </a>
          </li>
        ))}
      </ul>
      <p className="muted small">
        Dialogues originaux, écrits par moi pour cette application : ils peuvent contenir des maladresses (surtout en japonais, qu'aucune personne n'a relu). Le niveau ({lang === "ja" ? "N5 à N1" : "A1 à C1"}) est indicatif.
      </p>
    </div>
  );
}

// ---------- un dialogue ----------

export function TalkView({ lang, id }: { lang: Lang; id: string }) {
  const talk = talkById(id);
  if (!talk || talk.lang !== lang) {
    return (
      <div className="page">
        <PageHead title="Dialogue introuvable" onBack={() => (window.location.hash = `#/${lang}/talk`)} />
        <EmptyState title="Ce dialogue n'existe pas">Retourne à la liste.</EmptyState>
      </div>
    );
  }
  return <TalkPlay key={talk.id} lang={lang} talk={talk} />;
}

function Bubble({ who, name, line, lang, showFr }: { who: "npc" | "me"; name?: string; line: Line; lang: Lang; showFr: boolean }) {
  return (
    <div className={`bubble ${who}`}>
      <div className="bubble-main">
        {who === "npc" && name && <div className="bubble-name">{name}</div>}
        <Txt lang={lang} className="bubble-text">
          {line.t}
        </Txt>
        {showFr && <div className="bubble-fr">{line.fr}</div>}
      </div>
      <SpeakButton text={line.t} lang={lang} />
    </div>
  );
}

type Phase = "intro" | "play" | "end";

function TalkPlay({ lang, talk }: { lang: Lang; talk: Talk }) {
  const n = talk.turns.length;
  const { best, record } = useBest();
  const [phase, setPhase] = useState<Phase>("intro");
  const [salt, setSalt] = useState(0);
  const [showFr, setShowFr] = useState(EASY.includes(talk.level));
  const [idx, setIdx] = useState(0);
  /** pour chaque tour raté : les mauvaises réponses choisies, dans l'ordre */
  const [mistakes, setMistakes] = useState<Record<number, Option[]>>({});
  const [newBest, setNewBest] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const wrongs = mistakes[idx] ?? [];
  const wrongCount = Object.keys(mistakes).length;
  const firstTry = n - wrongCount;
  const pct = scorePercent(n, firstTry);
  const shown = phase === "play" ? orderedOptions(talk, idx, salt) : [];

  const pick = (o: Option | undefined) => {
    if (phase !== "play" || !o || wrongs.includes(o)) return;
    if (!o.ok) {
      setMistakes((m) => ({ ...m, [idx]: [...(m[idx] ?? []), o] }));
      return;
    }
    if (idx + 1 < n) {
      setIdx(idx + 1);
      return;
    }
    // dernier tour réussi : fin du dialogue
    setNewBest(best[talk.id] !== undefined && pct > best[talk.id]);
    record(talk.id, pct);
    setIdx(n);
    setPhase("end");
  };

  const restart = () => {
    setSalt((s) => s + 1);
    setIdx(0);
    setMistakes({});
    setNewBest(false);
    setPhase("play");
  };

  // touches 1, 2, 3 (ordinateur)
  const pickRef = useRef(pick);
  pickRef.current = pick;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      const k = Number(e.key);
      if (k >= 1 && k <= 3) pickRef.current(shownRef.current[k - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // garder le dernier message et les choix visibles
  const shownWrong = wrongs.length;
  useEffect(() => {
    if (phase === "intro") return;
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [phase, idx, shownWrong]);

  const back = () => (window.location.hash = `#/${lang}/talk`);
  const title = <span className={lang === "ja" ? "ja" : ""}>{talk.title}</span>;

  if (phase === "intro") {
    return (
      <div className="page">
        <PageHead title={title} onBack={back} sub={talk.titleFr} />
        <div className="row wrap tight">
          <span className="badge">
            {talk.level} · {LEVEL_HINT[talk.level]}
          </span>
          <span className="badge">{n} échanges</span>
          {best[talk.id] !== undefined && <span className="badge m-mastered">Meilleur : {best[talk.id]} %</span>}
        </div>
        <div className="card stack">
          <div>
            <div className="strong">{talk.role}</div>
            <p>{talk.setting}</p>
          </div>
          <p>
            <span className="strong">Objectif : </span>
            {talk.goal}
          </p>
          <p className="muted small">
            À chaque échange, {talk.npcName} parle et tu choisis la réponse la plus adaptée parmi trois. Si tu te trompes, une explication s'affiche et tu peux réessayer ; seuls les échanges réussis du premier coup comptent dans ton score.
          </p>
          <div className="row wrap">
            <button className="btn" aria-pressed={showFr} onClick={() => setShowFr((v) => !v)}>
              Traductions : {showFr ? "affichées" : "masquées"}
            </button>
          </div>
          <button className="btn primary big" onClick={() => setPhase("play")}>
            Commencer
          </button>
        </div>
      </div>
    );
  }

  const current = phase === "play" ? talk.turns[idx] : undefined;

  return (
    <div className="page">
      <PageHead
        title={title}
        onBack={back}
        sub={
          phase === "play" ? (
            <>
              Échange {idx + 1} / {n}
            </>
          ) : (
            <>Dialogue terminé</>
          )
        }
        actions={
          <button className="btn small" aria-pressed={showFr} onClick={() => setShowFr((v) => !v)}>
            Traductions : {showFr ? "oui" : "non"}
          </button>
        }
      />
      <Progress value={idx} max={n} label="Avancement du dialogue" />

      <div className="chat" aria-label="Dialogue">
        {talk.turns.slice(0, idx).flatMap((t, i) => [
          <Bubble key={`n${i}`} who="npc" name={talk.npcName} line={t.npc} lang={lang} showFr={showFr} />,
          <Bubble key={`m${i}`} who="me" line={t.options[0]} lang={lang} showFr={showFr} />,
        ])}
        {current && <Bubble who="npc" name={talk.npcName} line={current.npc} lang={lang} showFr={showFr} />}
        {phase === "end" && <Bubble who="npc" name={talk.npcName} line={talk.end} lang={lang} showFr={showFr} />}
      </div>

      {current && (
        <div className="stack tight">
          <div className="muted small">Quelle est la réponse la plus adaptée ?</div>
          <ul className="options" aria-label="Choix de réponse">
            {shown.map((o, i) => {
              const wrong = wrongs.includes(o);
              return (
                <li key={o.t}>
                  <button className={`option${wrong ? " wrong" : ""}`} disabled={wrong} onClick={() => pick(o)}>
                    <span className="key">{i + 1}</span>
                    <span>
                      <Txt lang={lang}>{o.t}</Txt>
                      {showFr && <span className="opt-fr">{o.fr}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {wrongs.length > 0 && (
            <div className="stack tight" role="status">
              {wrongs.map((o) => (
                <div key={o.t} className="why">
                  <div>
                    <strong>Pas ici.</strong> <Txt lang={lang}>{o.t}</Txt> <span className="muted">= « {o.fr} »</span>
                  </div>
                  <div>{o.why}</div>
                </div>
              ))}
              <div className="muted small">Choisis une autre réponse.</div>
            </div>
          )}
        </div>
      )}

      {phase === "end" && (
        <div className="stack">
          <div className="card stack center-text" role="status">
            <div className="muted small">Ton score (réponses justes du premier coup)</div>
            <div className="big-number">{pct} %</div>
            <div>
              {firstTry} sur {n}
              {newBest && <span className="badge m-mastered"> Nouveau record !</span>}
            </div>
            <div>{scoreMessage(pct)}</div>
            {best[talk.id] !== undefined && <div className="muted small">Meilleur score sur ce dialogue : {best[talk.id]} %</div>}
          </div>

          {wrongCount > 0 && (
            <details className="card" open>
              <summary className="module-title">À revoir ({wrongCount})</summary>
              <ul className="plain stack">
                {talk.turns.map((t, i) =>
                  mistakes[i] ? (
                    <li key={i} className="stack tight recap">
                      <div>
                        <span className="muted small">{talk.npcName} : </span>
                        <Txt lang={lang}>{t.npc.t}</Txt>
                        <div className="muted small">{t.npc.fr}</div>
                      </div>
                      {mistakes[i].map((o) => (
                        <div key={o.t} className="why">
                          <Txt lang={lang}>{o.t}</Txt> <span className="muted">= « {o.fr} »</span>
                          <div>{o.why}</div>
                        </div>
                      ))}
                      <div className="good">
                        <strong>Bonne réponse : </strong>
                        <Txt lang={lang}>{t.options[0].t}</Txt> <span className="muted">= « {t.options[0].fr} »</span>
                      </div>
                    </li>
                  ) : null,
                )}
              </ul>
            </details>
          )}

          <div className="row wrap">
            <button className="btn primary" onClick={restart}>
              Rejouer
            </button>
            <button className="btn" onClick={back}>
              Autres dialogues
            </button>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
