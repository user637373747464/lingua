// Les adresses (URL) saisies ou importées sont des données NON FIABLES : on n'ouvre que http(s).

export function safeHttpUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!s || /[\u0000-\u001f\u007f\s]/.test(s)) return null;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}
