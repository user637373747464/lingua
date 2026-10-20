"use client";

import { useEffect, useMemo, useState } from "react";
import { Lang } from "./types";
import { useData } from "./store";
import { deckStats } from "./decks";
import { secondsToday } from "./stats";

/** L'heure actuelle, rafraîchie régulièrement (les cartes « à revoir dans 10 min » deviennent dues sans recharger). */
export function useNow(everyMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), everyMs);
    const onVisible = () => document.visibilityState === "visible" && setNow(Date.now());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [everyMs]);
  return now;
}

export interface LangStats {
  due: number; // cartes à revoir (déjà vues, délai écoulé)
  fresh: number; // cartes jamais révisées
  cards: number;
  decks: number;
  words: number; // mots du dictionnaire
  learned: number;
  secondsToday: number;
}

export function useLangStats(lang: Lang): LangStats {
  const { snapshot } = useData();
  const now = useNow();
  return useMemo(() => {
    const decks = snapshot.decks.filter((d) => d.lang === lang);
    const cards = snapshot.deckCards.filter((c) => c.lang === lang);
    const st = deckStats(cards, now);
    return {
      due: st.due,
      fresh: st.fresh,
      cards: st.total,
      decks: decks.length,
      words: snapshot.entries.filter((e) => e.lang === lang).length,
      learned: st.learned,
      secondsToday: secondsToday(snapshot.studyLog, lang, now),
    };
  }, [snapshot, lang, now]);
}
