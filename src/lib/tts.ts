// Synthèse vocale : on utilise les voix installées sur l'appareil (aucun service payant, rien n'est envoyé).

import { Lang } from "./types";

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

const LANG_TAGS: Record<Lang, string[]> = {
  en: ["en-gb", "en-us", "en-au", "en-ie", "en-ca", "en-za", "en-in"],
  ja: ["ja-jp", "ja"],
};

let voicesCache: SpeechSynthesisVoice[] | null = null;

/** Les voix se chargent parfois en retard : on attend un court instant si la liste est vide. */
export function getVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!ttsSupported()) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) {
    voicesCache = now;
    return Promise.resolve(now);
  }
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      synth.removeEventListener?.("voiceschanged", finish);
      voicesCache = synth.getVoices();
      resolve(voicesCache);
    };
    synth.addEventListener?.("voiceschanged", finish);
    setTimeout(finish, 1200);
  });
}

export function voicesFor(voices: SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice[] {
  return voices.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(lang));
}

export function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang, preferredName?: string): SpeechSynthesisVoice | undefined {
  const candidates = voicesFor(voices, lang);
  if (preferredName) {
    const p = candidates.find((v) => v.name === preferredName);
    if (p) return p;
  }
  for (const tag of LANG_TAGS[lang]) {
    const m = candidates.find((v) => v.lang.toLowerCase().replace("_", "-") === tag);
    if (m) return m;
  }
  return candidates[0];
}

export type SpeakResult = { ok: true } | { ok: false; reason: "unsupported" | "no-voice" | "empty" };

export const NO_VOICE_HELP: Record<Lang, string> = {
  en: "Aucune voix anglaise trouvée sur cet appareil. Sur iPhone/iPad : Réglages › Accessibilité › Contenu énoncé › Voix › Anglais.",
  ja: "Aucune voix japonaise trouvée sur cet appareil. Sur iPhone/iPad : Réglages › Accessibilité › Contenu énoncé › Voix › Japonais. Sur Mac : Réglages Système › Accessibilité › Contenu énoncé › Voix du système.",
};

export async function speak(text: string, lang: Lang, opts: { rate?: number; voiceName?: string } = {}): Promise<SpeakResult> {
  if (!text.trim()) return { ok: false, reason: "empty" };
  if (!ttsSupported()) return { ok: false, reason: "unsupported" };
  const synth = window.speechSynthesis;
  const voices = await getVoices();
  const voice = pickVoice(voices, lang, opts.voiceName);
  if (!voice) return { ok: false, reason: "no-voice" };
  synth.cancel(); // Safari : évite qu'une lecture bloquée empêche la suivante
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = opts.rate ?? 0.9;
  synth.speak(u);
  return { ok: true };
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
