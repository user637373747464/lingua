// Outils de dates en heure LOCALE de l'appareil.

const pad = (n: number): string => String(n).padStart(2, "0");

/** "AAAA-MM-JJ" en heure locale. */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Minuit local du jour de `ts`. */
export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Minuit local, `n` jours calendaires après le jour de `ts` (gère l'heure d'été). */
export function startOfDayPlus(ts: number, n: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.getTime();
}

/** Clé du jour précédent (en calendrier local). */
export function previousDayKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function formatInterval(days: number): string {
  if (days <= 0) return "10 min";
  if (days < 30) return `${days} j`;
  if (days < 365) return `${Math.round(days / 30)} mois`;
  return `${(days / 365).toFixed(1).replace(".", ",")} an`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${pad(m % 60)}`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
