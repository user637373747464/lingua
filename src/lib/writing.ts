// Écriture manuscrite : comparaison du tracé de l'utilisateur avec le modèle (forme, SENS et ORDRE des traits).
// Fonctions pures (sans navigateur) : elles sont testées dans tests/writing.test.ts.
//
// Principe : on découpe chaque trait en points régulièrement espacés, on met le dessin à l'échelle (même taille et même
// position que le modèle, sans déformer), puis on compare trait par trait, dans l'ordre. Si le trait n°i ne ressemble pas
// au modèle n°i mais ressemble à un autre trait du modèle, on dit que l'ordre est faux ; s'il ressemble à l'envers, que
// le sens est faux.

import type { WritingStat } from "./types";

export interface Pt {
  x: number;
  y: number;
}

// ---------- chemins SVG (le sous-ensemble utilisé par KanjiVG : M, C, S, L, H, V, en majuscules ou minuscules) ----------

const NUM = /[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g;

export function parsePath(d: string, stepsPerCurve = 14): Pt[] {
  const tokens = d.match(NUM) ?? [];
  const pts: Pt[] = [];
  let i = 0;
  let cmd = "";
  let cx = 0,
    cy = 0; // point courant
  let lastCtrl: Pt | null = null; // dernier point de contrôle (pour S / s)
  let startX = 0,
    startY = 0;
  const num = () => {
    const t = tokens[i++];
    const v = Number(t);
    if (t === undefined || Number.isNaN(v)) throw new Error(`chemin SVG illisible : ${d}`);
    return v;
  };
  const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt) => {
    for (let k = 1; k <= stepsPerCurve; k++) {
      const t = k / stepsPerCurve;
      const u = 1 - t;
      pts.push({
        x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
        y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
      });
    }
  };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    else if (cmd === "") throw new Error(`chemin SVG illisible : ${d}`);
    const rel = cmd === cmd.toLowerCase();
    switch (cmd.toLowerCase()) {
      case "m": {
        const x = num() + (rel ? cx : 0);
        const y = num() + (rel ? cy : 0);
        cx = startX = x;
        cy = startY = y;
        pts.push({ x, y });
        lastCtrl = null;
        cmd = rel ? "l" : "L"; // les paires suivantes sont des segments droits
        break;
      }
      case "l": {
        const x = num() + (rel ? cx : 0);
        const y = num() + (rel ? cy : 0);
        cx = x;
        cy = y;
        pts.push({ x, y });
        lastCtrl = null;
        break;
      }
      case "h": {
        cx = num() + (rel ? cx : 0);
        pts.push({ x: cx, y: cy });
        lastCtrl = null;
        break;
      }
      case "v": {
        cy = num() + (rel ? cy : 0);
        pts.push({ x: cx, y: cy });
        lastCtrl = null;
        break;
      }
      case "c": {
        const p1 = { x: num() + (rel ? cx : 0), y: num() + (rel ? cy : 0) };
        const p2 = { x: num() + (rel ? cx : 0), y: num() + (rel ? cy : 0) };
        const p3 = { x: num() + (rel ? cx : 0), y: num() + (rel ? cy : 0) };
        cubic({ x: cx, y: cy }, p1, p2, p3);
        cx = p3.x;
        cy = p3.y;
        lastCtrl = p2;
        break;
      }
      case "s": {
        const p1 = lastCtrl ? { x: 2 * cx - lastCtrl.x, y: 2 * cy - lastCtrl.y } : { x: cx, y: cy };
        const p2 = { x: num() + (rel ? cx : 0), y: num() + (rel ? cy : 0) };
        const p3 = { x: num() + (rel ? cx : 0), y: num() + (rel ? cy : 0) };
        cubic({ x: cx, y: cy }, p1, p2, p3);
        cx = p3.x;
        cy = p3.y;
        lastCtrl = p2;
        break;
      }
      case "z": {
        cx = startX;
        cy = startY;
        pts.push({ x: cx, y: cy });
        lastCtrl = null;
        break;
      }
      default:
        throw new Error(`commande SVG non gérée « ${cmd} » dans : ${d}`);
    }
  }
  return pts;
}

// ---------- géométrie ----------

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export function pathLength(pts: Pt[]): number {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += dist(pts[i - 1], pts[i]);
  return l;
}

/** n points régulièrement espacés le long du tracé (un simple point donne n copies). */
export function resample(pts: Pt[], n: number): Pt[] {
  if (pts.length === 0) return [];
  const total = pathLength(pts);
  if (total < 1e-9) return Array.from({ length: n }, () => ({ ...pts[0] }));
  const out: Pt[] = [{ ...pts[0] }];
  const step = total / (n - 1);
  let acc = 0;
  let seg = 1;
  let prev = pts[0];
  for (let k = 1; k < n - 1; k++) {
    const target = k * step;
    while (seg < pts.length && acc + dist(prev, pts[seg]) < target) {
      acc += dist(prev, pts[seg]);
      prev = pts[seg];
      seg++;
    }
    if (seg >= pts.length) break;
    const segLen = dist(prev, pts[seg]);
    const t = segLen < 1e-12 ? 0 : (target - acc) / segLen;
    out.push({ x: prev.x + (pts[seg].x - prev.x) * t, y: prev.y + (pts[seg].y - prev.y) * t });
  }
  out.push({ ...pts[pts.length - 1] });
  while (out.length < n) out.splice(out.length - 1, 0, { ...out[out.length - 2] });
  return out;
}

/** Met l'ensemble du dessin à l'échelle : plus grande dimension = 1, centré en (0,0). Les proportions ne changent pas. */
export function normalizeStrokes(strokes: Pt[][]): Pt[][] {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const s of strokes) for (const p of s) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  if (!isFinite(minX)) return strokes.map(() => []);
  const size = Math.max(maxX - minX, maxY - minY, 1e-6);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return strokes.map((s) => s.map((p) => ({ x: (p.x - cx) / size, y: (p.y - cy) / size })));
}

const SAMPLES = 24;

/** Écart moyen ET écart maximal entre deux traits de même nombre de points. */
function compare(a: Pt[], b: Pt[]): { mean: number; peak: number } {
  let t = 0;
  let peak = 0;
  for (let i = 0; i < a.length; i++) {
    const d = dist(a[i], b[i]);
    t += d;
    if (d > peak) peak = d;
  }
  return { mean: t / a.length, peak };
}

// ---------- évaluation ----------

export type StrokeStatus = "ok" | "shape" | "reversed" | "order" | "extra";

export interface StrokeJudge {
  status: StrokeStatus;
  /** pour « order » : numéro (à partir de 1) que ce trait devrait avoir */
  shouldBe?: number;
  /** écart moyen avec le modèle (0 = identique ; 1 = taille du caractère) */
  distance: number;
}

export interface Evaluation {
  ok: boolean;
  expected: number;
  got: number;
  strokes: StrokeJudge[];
  /** numéros (à partir de 1) des traits du modèle qui n'ont été retrouvés nulle part */
  missing: number[];
  issues: string[];
}

export interface Tolerance {
  /** écart moyen maximal accepté, en proportion de la taille du caractère */
  shape: number;
  /** écart maximal accepté pour le départ et l'arrivée d'un trait */
  ends: number;
  /** écart maximal accepté en un point quelconque du trait (détecte une boucle oubliée, un crochet manquant…) */
  peak: number;
  /** écart relatif maximal de longueur entre ton trait et le modèle (0,3 = 30 %) */
  length: number;
}

export const TOLERANCES: Record<"strict" | "normal" | "large", Tolerance> = {
  strict: { shape: 0.1, ends: 0.18, peak: 0.22, length: 0.28 },
  normal: { shape: 0.15, ends: 0.27, peak: 0.33, length: 0.4 },
  large: { shape: 0.2, ends: 0.35, peak: 0.44, length: 0.55 },
};

const reversed = (s: Pt[]) => [...s].reverse();

/**
 * Compare le dessin `user` (liste de traits, dans l'ordre où ils ont été tracés) au modèle `model` (idem).
 * Les deux sont mis à la même échelle avant comparaison.
 */
export function evaluate(model: Pt[][], user: Pt[][], tol: Tolerance = TOLERANCES.normal): Evaluation {
  const expected = model.length;
  const got = user.length;
  if (got === 0) {
    return { ok: false, expected, got, strokes: [], missing: model.map((_, i) => i + 1), issues: ["Tu n'as encore rien dessiné."] };
  }
  const M = normalizeStrokes(model).map((s) => resample(s, SAMPLES));
  const U = normalizeStrokes(user).map((s) => resample(s, SAMPLES));

  // D[i][j] : écart entre mon trait i et le trait j du modèle (même sens) ; R : en parcourant mon trait à l'envers
  // longueur de chaque trait (dans l'échelle normalisée) : détecte une boucle ou un crochet oublié ou ajouté
  const lenU = normalizeStrokes(user).map(pathLength);
  const lenM = normalizeStrokes(model).map(pathLength);
  // (les tout petits traits — points des dakuten, ticks — sont trop courts pour juger leur longueur)
  const lenOk = (i: number, j: number) => lenM[j] < 0.35 || Math.abs(lenU[i] - lenM[j]) <= tol.length * lenM[j];
  const C = U.map((u) => M.map((m) => compare(u, m)));
  const CR = U.map((u) => M.map((m) => compare(reversed(u), m)));
  const D = C.map((row) => row.map((c) => c.mean));
  const R = CR.map((row) => row.map((c) => c.mean));
  const endsOk = (u: Pt[], m: Pt[]) => dist(u[0], m[0]) <= tol.ends && dist(u[SAMPLES - 1], m[SAMPLES - 1]) <= tol.ends;
  const matches = (i: number, j: number) => C[i][j].mean <= tol.shape && C[i][j].peak <= tol.peak && lenOk(i, j) && endsOk(U[i], M[j]);
  const matchesReversed = (i: number, j: number) => CR[i][j].mean <= tol.shape && CR[i][j].peak <= tol.peak && lenOk(i, j) && endsOk(reversed(U[i]), M[j]);

  const issues: string[] = [];
  const strokes: StrokeJudge[] = [];
  const found = new Set<number>(); // traits du modèle retrouvés (dans n'importe quel ordre ou sens)

  for (let i = 0; i < got; i++) {
    const j = i < expected ? i : -1;
    if (j >= 0 && matches(i, j)) {
      strokes.push({ status: "ok", distance: D[i][j] });
      found.add(j);
      continue;
    }
    if (j < 0) {
      // plus de place dans le modèle : ce trait est en trop (même s'il ressemble à un trait déjà tracé)
      strokes.push({ status: "extra", distance: Math.min(...D[i]) });
      continue;
    }
    // pas le bon trait à cette place : ressemble-t-il à un autre ? (autre ordre) ou à l'envers ? (autre sens)
    let best = -1;
    for (let k = 0; k < expected; k++) if (matches(i, k) && (best < 0 || D[i][k] < D[i][best])) best = k;
    if (best >= 0) {
      strokes.push({ status: "order", shouldBe: best + 1, distance: D[i][best] });
      found.add(best);
      continue;
    }
    let bestRev = -1;
    for (let k = 0; k < expected; k++) if (matchesReversed(i, k) && (bestRev < 0 || R[i][k] < R[i][bestRev])) bestRev = k;
    if (bestRev >= 0) {
      strokes.push({ status: "reversed", shouldBe: bestRev + 1, distance: R[i][bestRev] });
      found.add(bestRev);
      continue;
    }
    strokes.push({ status: "shape", distance: D[i][j] });
  }

  const missing: number[] = [];
  for (let j = 0; j < expected; j++) if (!found.has(j)) missing.push(j + 1);

  // messages
  if (got !== expected) {
    issues.push(got < expected ? `Il faut ${expected} traits, tu en as dessiné ${got}.` : `Il faut ${expected} traits, tu en as dessiné ${got} : un trait est en trop.`);
  }
  strokes.forEach((s, i) => {
    const n = i + 1;
    if (s.status === "order") issues.push(`Ton trait n°${n} est bon, mais c'est le trait n°${s.shouldBe} qui doit être tracé à ce moment-là : l'ordre n'est pas respecté.`);
    else if (s.status === "reversed") issues.push(`Ton trait n°${n} est dessiné à l'envers : il faut le tracer dans l'autre sens.`);
    else if (s.status === "shape") issues.push(`Ton trait n°${n} ne ressemble pas assez au modèle (forme, longueur ou position).`);
    else if (s.status === "extra") issues.push(`Ton trait n°${n} ne correspond à aucun trait du modèle.`);
  });
  if (got !== expected && missing.length) issues.push(`Il manque : ${missing.map((m) => `le trait n°${m}`).join(", ")}.`);

  const ok = got === expected && strokes.every((s) => s.status === "ok");
  return { ok, expected, got, strokes, missing, issues };
}

// ---------- taille : petits kana ----------
// La comparaison des traits ignore la taille du dessin (sinon il faudrait dessiner exactement à la taille du modèle).
// Mais « ゃ » et « や » ont la même forme, seule la taille change : on ajoute donc une règle de taille pour ces kana.

export const SMALL_KANA = "ゃゅょっャュョッ";
/** les grands kana qui ont un petit jumeau de même forme */
export const BIG_TWINS = "やゆよつヤユヨツ";

/** Plus grande dimension du dessin, en proportion de la case de dessin (0 à 1). */
export function drawingSpan(user: Pt[][], cell: number): number {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of user) for (const p of s) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  if (!isFinite(minX) || cell <= 0) return 0;
  return Math.max(maxX - minX, maxY - minY) / cell;
}

/** Message si la taille ne convient pas à ce kana (sinon null). `cell` = côté de la case de dessin, dans l'unité du dessin. */
export function sizeIssue(ch: string, user: Pt[][], cell: number): string | null {
  const span = drawingSpan(user, cell);
  if (span === 0) return null;
  if (SMALL_KANA.includes(ch) && span > 0.62) return "C'est un petit kana : écris-le plus petit (environ la moitié de la case).";
  if (BIG_TWINS.includes(ch) && span < 0.4) return "Ce kana est de taille normale (le petit s'écrit avec un autre signe : ゃ ゅ ょ っ) : écris-le plus grand.";
  return null;
}

/** Évaluation complète d'un caractère : traits (forme, sens, ordre) + règle de taille. */
export function judge(ch: string, model: Pt[][], user: Pt[][], tol: Tolerance, cell: number): Evaluation {
  const ev = evaluate(model, user, tol);
  const sz = sizeIssue(ch, user, cell);
  if (!sz) return ev;
  return { ...ev, ok: false, issues: [...ev.issues, sz] };
}

/** Déplace et redimensionne le dessin pour qu'il occupe la même place que le modèle (pour les superposer à l'écran). */
export function alignTo(model: Pt[][], user: Pt[][]): Pt[][] {
  const box = (strokes: Pt[][]) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const s of strokes) for (const p of s) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, size: Math.max(maxX - minX, maxY - minY, 1e-6), ok: isFinite(minX) };
  };
  const m = box(model);
  const u = box(user);
  if (!m.ok || !u.ok) return user;
  const k = m.size / u.size;
  return user.map((s) => s.map((p) => ({ x: m.cx + (p.x - u.cx) * k, y: m.cy + (p.y - u.cy) * k })));
}

// ---------- choix des caractères d'un quiz ----------


/**
 * Tire `n` caractères (sans doublon) dans `pool`, en favorisant ceux qui posent problème :
 * jamais essayé → poids 3 ; dernier essai raté ou moins de 60 % de réussite → 4 ; sinon 1.
 */
export function pickWritingQuiz(pool: string[], stats: WritingStat[], n: number, rand: () => number = Math.random): string[] {
  const byChar = new Map(stats.map((s) => [s.char, s]));
  const items = pool.map((ch) => {
    const s = byChar.get(ch);
    let w = 3;
    if (s && s.tries > 0) w = !s.lastCorrect || s.correct / s.tries < 0.6 ? 4 : 1;
    return { ch, w };
  });
  const out: string[] = [];
  while (out.length < n && items.length) {
    const total = items.reduce((t, x) => t + x.w, 0);
    let r = rand() * total;
    let k = 0;
    for (; k < items.length - 1; k++) {
      r -= items[k].w;
      if (r < 0) break;
    }
    out.push(items[k].ch);
    items.splice(k, 1);
  }
  return out;
}

/** Caractères qui méritent d'être retravaillés : essayés mais ratés au dernier essai ou sous 60 % de réussite. */
export function weakChars(stats: WritingStat[]): string[] {
  return stats.filter((s) => s.tries > 0 && (!s.lastCorrect || s.correct / s.tries < 0.6)).map((s) => s.char);
}
