// Identifiants stables. crypto.randomUUID() existe sur les sites en HTTPS (GitHub Pages) et en localhost.

export function uid(prefix = ""): string {
  const c: Crypto | undefined = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  let id: string;
  if (c && typeof c.randomUUID === "function") {
    id = c.randomUUID();
  } else {
    id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
      const r = (Math.random() * 16) | 0;
      return (ch === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  return prefix ? `${prefix}_${id}` : id;
}
