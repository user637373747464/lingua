"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { WritingStat } from "../lib/types";
import { useData } from "../lib/store";
import { GLYPHS, KANA_HIRAGANA_BASE, KANA_HIRAGANA_EXTRA, KANA_KATAKANA_BASE, KANA_KATAKANA_EXTRA, KANJI_N5_LIST } from "../lib/content/strokes";
import { KANJI_INFO, kanaKind, kanaRomaji, promptFor } from "../lib/content/writing-info";
import { Evaluation, Pt, TOLERANCES, alignTo, judge, parsePath, pickWritingQuiz, weakChars } from "../lib/writing";
import { Icon, PageHead, Segmented, SpeakButton, Txt } from "./ui";

const SIZE = 109; // taille de la grille de KanjiVG : tout est dessiné dans ce repère
const MAX_STROKES = 40;

type Kind = WritingStat["kind"];
type Level = keyof typeof TOLERANCES;
type Guide = "anim" | "trace" | "none";

const kindOf = (ch: string): Kind => (KANJI_INFO[ch] ? "kanji" : (kanaKind(ch) ?? "kanji"));

const SETS: Record<Kind, { label: string; groups: { label: string; chars: string }[] }> = {
  hiragana: {
    label: "Hiragana",
    groups: [
      { label: "Base", chars: KANA_HIRAGANA_BASE },
      { label: "Dakuten, handakuten, petits", chars: KANA_HIRAGANA_EXTRA },
    ],
  },
  katakana: {
    label: "Katakana",
    groups: [
      { label: "Base", chars: KANA_KATAKANA_BASE },
      { label: "Dakuten, handakuten, petits", chars: KANA_KATAKANA_EXTRA },
    ],
  },
  kanji: { label: "Kanji (N5)", groups: [{ label: "80 kanji du niveau N5", chars: KANJI_N5_LIST }] },
};

function allOf(kind: Kind): string[] {
  return SETS[kind].groups.flatMap((g) => [...g.chars]);
}

// ---------- exigence (mémorisée sur cet appareil) ----------

const TOL_KEY = "lingua.writing.level";
function readLevel(): Level {
  try {
    const v = window.localStorage.getItem(TOL_KEY);
    if (v === "strict" || v === "normal" || v === "large") return v;
  } catch {
    /* stockage indisponible : on garde la valeur par défaut */
  }
  return "normal";
}
function useLevel(): [Level, (l: Level) => void] {
  const [level, setLevel] = useState<Level>("normal");
  useEffect(() => setLevel(readLevel()), []);
  return [
    level,
    (l) => {
      setLevel(l);
      try {
        window.localStorage.setItem(TOL_KEY, l);
      } catch {
        /* sans importance */
      }
    },
  ];
}

// ---------- dessin SVG ----------

const polyD = (pts: Pt[]) => {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}l0.1,0.1`; // un simple point (touche brève)
  return pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("");
};

const STATUS_COLOR: Record<string, string> = {
  ok: "var(--ok)",
  shape: "var(--ko)",
  reversed: "var(--warn)",
  order: "var(--warn)",
  extra: "var(--ko)",
};

function Grid() {
  return (
    <g className="wp-grid" aria-hidden="true">
      <rect x="0.5" y="0.5" width={SIZE - 1} height={SIZE - 1} rx="3" />
      <line x1={SIZE / 2} y1="0" x2={SIZE / 2} y2={SIZE} />
      <line x1="0" y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} />
    </g>
  );
}

/** Le modèle : traits gris + numéros ; en mode « anim », les traits se dessinent un par un, dans l'ordre. */
function Model({ ch, animate, tone }: { ch: string; animate: boolean; tone: "faint" | "strong" }) {
  const g = GLYPHS[ch];
  return (
    <g className={`wp-model ${tone}`} aria-hidden="true">
      {g.s.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          className={animate ? "wp-anim" : undefined}
          style={animate ? { animationDelay: `${i * 0.9}s` } : undefined}
        />
      ))}
      {g.n.map(([x, y], i) => (
        <text key={i} x={x} y={y} className={animate ? "wp-num anim" : "wp-num"} style={animate ? { animationDelay: `${i * 0.9}s` } : undefined}>
          {i + 1}
        </text>
      ))}
    </g>
  );
}

// ---------- zone de dessin ----------

export function WritingPad({
  ch,
  initialGuide = "trace",
  recordKind,
  onChecked,
  hideGuideChoice,
}: {
  ch: string;
  initialGuide?: Guide;
  recordKind?: Kind;
  onChecked?: (ok: boolean) => void;
  hideGuideChoice?: boolean;
}) {
  const { recordWriting } = useData();
  const [level, setLevel] = useLevel();
  const [guide, setGuide] = useState<Guide>(initialGuide);
  const [strokes, setStrokes] = useState<Pt[][]>([]);
  const [live, setLive] = useState<Pt[] | null>(null);
  const [result, setResult] = useState<{ ev: Evaluation; drawn: Pt[][] } | null>(null);
  const [replay, setReplay] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const cur = useRef<Pt[] | null>(null);
  const pointer = useRef<number | null>(null);

  const model = useMemo(() => GLYPHS[ch].s.map((d) => parsePath(d)), [ch]);

  const canDraw = guide !== "anim" && !result;

  const toPt = (e: { clientX: number; clientY: number }): Pt => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
  };

  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!canDraw || pointer.current !== null || strokes.length >= MAX_STROKES) return;
    e.preventDefault();
    pointer.current = e.pointerId;
    try {
      svgRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* certains navigateurs refusent : le dessin marche quand même tant que le doigt reste dans la zone */
    }
    cur.current = [toPt(e)];
    setLive([...cur.current]);
  };
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (cur.current === null || e.pointerId !== pointer.current) return;
    e.preventDefault();
    const native = e.nativeEvent as PointerEvent & { getCoalescedEvents?: () => PointerEvent[] };
    const evs = native.getCoalescedEvents?.() ?? [];
    for (const ev of evs.length ? evs : [e]) {
      const p = toPt(ev);
      const last = cur.current[cur.current.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) >= 0.4) cur.current.push(p);
    }
    setLive([...cur.current]);
  };
  const up = (e: React.PointerEvent<SVGSVGElement>) => {
    if (cur.current === null || e.pointerId !== pointer.current) return;
    const done = cur.current;
    cur.current = null;
    pointer.current = null;
    setLive(null);
    setStrokes((s) => [...s, done]);
  };

  const check = async () => {
    if (strokes.length === 0) return;
    const ev = judge(ch, model, strokes, TOLERANCES[level], SIZE);
    setResult({ ev, drawn: alignTo(model, strokes) });
    try {
      await recordWriting(ch, recordKind ?? kindOf(ch), ev.ok);
    } catch {
      /* l'enregistrement a échoué : le résultat reste affiché */
    }
    onChecked?.(ev.ok);
  };

  const clear = () => {
    setStrokes([]);
    setResult(null);
    setLive(null);
    cur.current = null;
    pointer.current = null;
  };
  const undo = () => setStrokes((s) => s.slice(0, -1));

  const showModel: "none" | "faint" | "strong" | "anim" = result ? "strong" : guide === "anim" ? "anim" : guide === "trace" ? "faint" : "none";

  return (
    <div className="stack">
      {!hideGuideChoice && (
        <Segmented
          label="Aide"
          value={guide}
          onChange={(g) => {
            setGuide(g);
            if (g === "anim") setReplay((n) => n + 1);
            if (result) clear();
          }}
          options={[
            { value: "anim", label: "Voir l'ordre" },
            { value: "trace", label: "Calquer" },
            { value: "none", label: "De mémoire" },
          ]}
        />
      )}

      <div className="wp-wrap">
        <svg
          ref={svgRef}
          className={`wp ${canDraw ? "can-draw" : ""}`}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={canDraw ? "Zone de dessin : trace le caractère avec le doigt" : "Modèle et comparaison"}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <Grid />
          {showModel !== "none" && <Model key={`${ch}-${showModel}-${replay}`} ch={ch} animate={showModel === "anim"} tone={showModel === "faint" ? "faint" : "strong"} />}

          {!result && (
            <g className="wp-user">
              {strokes.map((s, i) => (
                <path key={i} d={polyD(s)} />
              ))}
              {live && <path d={polyD(live)} />}
            </g>
          )}

          {result && (
            <g className="wp-user result">
              {result.drawn.map((s, i) => {
                const st = result.ev.strokes[i]?.status ?? "shape";
                return (
                  <g key={i} style={{ color: STATUS_COLOR[st] }}>
                    <path d={polyD(s)} />
                    <circle cx={s[0].x} cy={s[0].y} r="2.6" className="start" />
                    <text x={s[0].x + 3.5} y={s[0].y - 3.5} className="wp-unum">
                      {i + 1}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {guide === "anim" && !result && (
        <div className="row center">
          <button className="btn" onClick={() => setReplay((n) => n + 1)}>
            <Icon name="next" size={16} /> Rejouer
          </button>
          <button className="btn primary" onClick={() => setGuide("trace")}>
            À moi d'écrire
          </button>
        </div>
      )}

      {canDraw && (
        <div className="row center wrap">
          <button className="btn" onClick={undo} disabled={strokes.length === 0}>
            <Icon name="back" size={16} /> Dernier trait
          </button>
          <button className="btn" onClick={clear} disabled={strokes.length === 0}>
            <Icon name="trash" size={16} /> Effacer
          </button>
          <button className="btn primary" onClick={check} disabled={strokes.length === 0}>
            <Icon name="check" size={16} /> Vérifier
          </button>
        </div>
      )}
      {canDraw && <div className="muted small center-text">{strokes.length === 0 ? "Dessine avec le doigt, un trait après l'autre, dans le bon ordre." : `${strokes.length} trait${strokes.length > 1 ? "s" : ""} dessiné${strokes.length > 1 ? "s" : ""}`}</div>}

      {result && <ResultPanel ev={result.ev} onRetry={clear} onWatch={() => { clear(); setGuide("anim"); setReplay((n) => n + 1); }} />}

      <div className="field wp-level">
        <span className="label">Exigence de la comparaison</span>
        <Segmented
          label="Exigence"
          value={level}
          onChange={setLevel}
          options={[
            { value: "strict", label: "Stricte" },
            { value: "normal", label: "Normale" },
            { value: "large", label: "Large" },
          ]}
        />
        <span className="muted small">Au doigt, le tracé est moins précis qu'au stylo : si de bons tracés sont refusés, passe en « Large ».</span>
      </div>
    </div>
  );
}

function ResultPanel({ ev, onRetry, onWatch }: { ev: Evaluation; onRetry: () => void; onWatch: () => void }) {
  return (
    <div className="stack tight" aria-live="polite">
      <div className={`notice ${ev.ok ? "tip ok" : "error"}`}>
        <div className="stack tight">
          <strong>{ev.ok ? "Bravo : forme, sens et ordre des traits sont corrects." : "Pas tout à fait :"}</strong>
          {!ev.ok && (
            <ul className="lesson-list">
              {ev.issues.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="muted small">
        En gris : le modèle (numéros = ordre). En couleur : ton tracé remis à la taille du modèle ; le rond marque où tu as commencé chaque trait. <span style={{ color: "var(--ok)" }}>Vert</span> = bon,{" "}
        <span style={{ color: "var(--warn)" }}>orange</span> = bon trait mais mauvais sens ou mauvais ordre, <span style={{ color: "var(--ko)" }}>rouge</span> = à refaire.
      </div>
      <div className="row center wrap">
        <button className="btn" onClick={onWatch}>
          Revoir l'ordre
        </button>
        <button className="btn primary" onClick={onRetry}>
          Réessayer
        </button>
      </div>
    </div>
  );
}

// ---------- liste des caractères ----------

function statClass(s: WritingStat | undefined): string {
  if (!s || s.tries === 0) return "";
  if (!s.lastCorrect || s.correct / s.tries < 0.6) return "weak";
  return s.correct / s.tries >= 0.85 && s.tries >= 3 ? "good" : "mid";
}

export function WritingPage() {
  const { snapshot } = useData();
  const [kind, setKind] = useState<Kind>("hiragana");
  const byChar = useMemo(() => new Map(snapshot.writing.map((w) => [w.char, w])), [snapshot.writing]);
  const weak = weakChars(snapshot.writing);
  const done = allOf(kind).filter((c) => (byChar.get(c)?.correct ?? 0) > 0).length;
  const total = allOf(kind).length;
  return (
    <div className="page">
      <PageHead title="Écriture" onBack={() => (window.location.hash = "#/ja")} sub="Dessine au doigt : on compare avec la forme, le sens et l'ordre des traits" />
      <Segmented
        label="Écriture"
        value={kind}
        onChange={setKind}
        options={[
          { value: "hiragana", label: "Hiragana" },
          { value: "katakana", label: "Katakana" },
          { value: "kanji", label: "Kanji N5" },
        ]}
      />
      <div className="card cta">
        <div>
          <div className="h3">
            {done} / {total} réussi{done > 1 ? "s" : ""} au moins une fois
          </div>
          <div className="muted small">Touche un caractère pour le voir tracé, le calquer ou l'écrire de mémoire.</div>
        </div>
        <div className="row wrap">
          <a className="btn primary" href={`#/ja/writing/quiz/${kind}`}>
            Quiz de 10
          </a>
          {weak.length > 0 && (
            <a className="btn" href="#/ja/writing/quiz/weak">
              Mes points faibles ({weak.length})
            </a>
          )}
        </div>
      </div>
      {SETS[kind].groups.map((g) => (
        <section key={g.label} className="stack tight">
          <h2 className="h3">{g.label}</h2>
          <div className="wchars">
            {[...g.chars].map((c) => (
              <a key={c} className={`wchar ${statClass(byChar.get(c))}`} href={`#/ja/writing/${encodeURIComponent(c)}`} aria-label={`${c} ${promptFor(c)}`}>
                <span className="ja wchar-c">{c}</span>
                <span className="wchar-r">{kanji(c) ? (KANJI_INFO[c].fr.split(",")[0]) : kanaRomaji(c)}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
      <div className="muted small">
        <span className="wdot weak" /> à retravailler · <span className="wdot mid" /> en progrès · <span className="wdot good" /> bien maîtrisé.
      </div>
      <div className="muted small">
        Les tracés viennent du projet <strong>KanjiVG</strong> (© Ulrich Apel et contributeurs, licence CC BY-SA 3.0, kanjivg.tagaini.net). Tout se passe sur ton appareil : rien n'est envoyé sur Internet.
      </div>
    </div>
  );
}

const kanji = (c: string) => !!KANJI_INFO[c];

// ---------- un caractère ----------

export function WritingChar({ ch }: { ch: string }) {
  const { snapshot } = useData();
  if (!GLYPHS[ch]) {
    return (
      <div className="page">
        <PageHead title="Écriture" onBack={() => (window.location.hash = "#/ja/writing")} />
        <p className="muted">Ce caractère n'est pas (encore) disponible.</p>
      </div>
    );
  }
  const kind = kindOf(ch);
  const list = allOf(kind);
  const i = list.indexOf(ch);
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];
  const stat = snapshot.writing.find((w) => w.char === ch);
  const info = KANJI_INFO[ch];
  return (
    <div className="page">
      <PageHead title={SETS[kind].label} onBack={() => (window.location.hash = "#/ja/writing")} sub={`${GLYPHS[ch].s.length} trait${GLYPHS[ch].s.length > 1 ? "s" : ""}`} />
      <div className="card row between">
        <div className="row">
          <Txt lang="ja" className="wbig">
            {ch}
          </Txt>
          <div>
            <div className="module-title">{info ? info.fr : kanaRomaji(ch)}</div>
            {info && <div className="muted small ja">{info.read}</div>}
            {stat && (
              <div className="muted small">
                Réussi {stat.correct} fois sur {stat.tries}
              </div>
            )}
          </div>
        </div>
        {!info && <SpeakButton text={ch} lang="ja" />}
      </div>
      <WritingPad key={ch} ch={ch} initialGuide="anim" recordKind={kind} />
      <div className="row between">
        <a className="btn" href={`#/ja/writing/${encodeURIComponent(prev)}`}>
          <Icon name="back" size={16} /> <Txt lang="ja">{prev}</Txt>
        </a>
        <a className="btn" href={`#/ja/writing/${encodeURIComponent(next)}`}>
          <Txt lang="ja">{next}</Txt> <Icon name="next" size={16} />
        </a>
      </div>
    </div>
  );
}

// ---------- quiz ----------

const QUIZ_LEN = 10;

export function WritingQuiz({ source }: { source: string }) {
  const { snapshot } = useData();
  const kind: Kind | "weak" = source === "katakana" || source === "kanji" || source === "weak" ? source : "hiragana";
  const [items, setItems] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  useEffect(() => {
    const pool = kind === "weak" ? weakChars(snapshot.writing).filter((c) => GLYPHS[c]) : allOf(kind);
    setItems(pickWritingQuiz(pool, snapshot.writing, QUIZ_LEN));
    setIdx(0);
    setChecked(null);
    setResults([]);
    // le tirage ne doit se faire qu'une fois par session de quiz (pas à chaque réponse enregistrée)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const back = () => (window.location.hash = "#/ja/writing");
  if (!items) return null;
  if (items.length === 0) {
    return (
      <div className="page">
        <PageHead title="Quiz d'écriture" onBack={back} />
        <p className="muted">Rien à réviser ici pour l'instant : fais d'abord quelques essais depuis la liste.</p>
      </div>
    );
  }
  if (idx >= items.length) {
    const good = results.filter(Boolean).length;
    const wrong = items.filter((_, i) => !results[i]);
    return (
      <div className="page">
        <PageHead title="Quiz terminé" onBack={back} />
        <div className="card stack tight">
          <div className="h2">
            {good} / {items.length} réussi{good > 1 ? "s" : ""}
          </div>
          {wrong.length > 0 && (
            <>
              <div className="muted">À revoir :</div>
              <div className="wchars">
                {wrong.map((c) => (
                  <a key={c} className="wchar weak" href={`#/ja/writing/${encodeURIComponent(c)}`}>
                    <span className="ja wchar-c">{c}</span>
                    <span className="wchar-r">{promptFor(c).split(" — ")[0]}</span>
                  </a>
                ))}
              </div>
            </>
          )}
          <div className="row wrap">
            <a className="btn primary" href={`#/ja/writing/quiz/${kind}`} onClick={() => setTimeout(() => window.location.reload(), 0)}>
              Un autre quiz
            </a>
            <button className="btn" onClick={back}>
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }
  const ch = items[idx];
  return (
    <div className="page">
      <PageHead title="Quiz d'écriture" onBack={back} sub={`${idx + 1} / ${items.length}`} />
      <div className="card stack tight center-text">
        <div className="muted small">Écris :</div>
        <div className="h2">{promptFor(ch)}</div>
        <div className="muted small">{kindOf(ch) === "hiragana" ? "en hiragana" : kindOf(ch) === "katakana" ? "en katakana" : "en kanji"}</div>
      </div>
      <WritingPad
        key={ch + idx}
        ch={ch}
        initialGuide="none"
        recordKind={kindOf(ch)}
        onChecked={(ok) => {
          setChecked(ok);
        }}
      />
      {checked !== null && (
        <button
          className="btn primary"
          onClick={() => {
            setResults((r) => [...r, !!checked]);
            setChecked(null);
            setIdx(idx + 1);
          }}
        >
          {idx + 1 >= items.length ? "Voir le résultat" : "Suivant"}
        </button>
      )}
    </div>
  );
}
