"use client";

import { useEffect, useMemo, useState } from "react";
import { Lang } from "./types";
import { useData } from "./store";
import { buildQueue, introducedToday } from "./cards";
import { dueCount, masteryOf, secondsToday } from "./stats";

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
  due: number;
  fresh: number;
  words: number;
  mastered: number;
  secondsToday: number;
  newLimitLeft: number;
}

export function useLangStats(lang: Lang): LangStats {
  const { snapshot, statesById } = useData();
  const now = useNow();
  return useMemo(() => {
    const entries = snapshot.entries.filter((e) => e.lang === lang);
    const entryIds = new Set(entries.map((e) => e.id));
    const intro = introducedToday(snapshot.cards, statesById, lang, now);
    const newLimitLeft = Math.max(0, snapshot.settings.langs[lang].newPerDay - intro);
    const { fresh } = buildQueue(snapshot.cards, statesById, entryIds, { lang, now, newLimit: newLimitLeft });
    const mastered = entries.filter((e) => masteryOf(e.id, snapshot.cards, statesById) === "mastered").length;
    return {
      due: dueCount(snapshot.cards, statesById, entryIds, lang, now),
      fresh: fresh.length,
      words: entries.length,
      mastered,
      secondsToday: secondsToday(snapshot.studyLog, lang, now),
      newLimitLeft,
    };
  }, [snapshot, statesById, lang, now]);
}
