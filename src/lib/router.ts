"use client";

// Mini-routeur par « hash » (#/en/dictionary). Il marche hors ligne et sur n'importe quel hébergement statique,
// sans configuration, et le bouton « retour » du navigateur fonctionne.

import { useCallback, useEffect, useState } from "react";

// Nombre de changements de page faits DANS l'application depuis son ouverture :
// tant qu'il est à zéro, « retour » mène à la page de secours au lieu de quitter l'application.
let internalNavigations = 0;
let goingBack = false; // le changement de page provoqué par « retour » ne compte pas comme une navigation

export interface Route {
  segments: string[];
  query: URLSearchParams;
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, "");
  const [pathPart, queryPart] = raw.split("?");
  const segments = pathPart.split("/").filter(Boolean).map((s) => decodeURIComponent(s));
  return { segments, query: new URLSearchParams(queryPart ?? "") };
}

export function buildHash(path: string, query?: Record<string, string>): string {
  const q = query && Object.keys(query).length ? "?" + new URLSearchParams(query).toString() : "";
  return `#${path.startsWith("/") ? path : "/" + path}${q}`;
}

export function useRoute(): { route: Route; go: (path: string, query?: Record<string, string>) => void; back: (fallback: string) => void } {
  const [route, setRoute] = useState<Route>({ segments: [], query: new URLSearchParams() });

  useEffect(() => {
    const read = () => setRoute(parseHash(window.location.hash));
    const onChange = () => {
      if (goingBack) goingBack = false;
      else internalNavigations++;
      read();
    };
    read();
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const go = useCallback((path: string, query?: Record<string, string>) => {
    window.location.hash = buildHash(path, query).slice(1);
    window.scrollTo?.(0, 0);
  }, []);

  const back = useCallback((fallback: string) => {
    if (internalNavigations > 0) {
      internalNavigations = Math.max(0, internalNavigations - 1);
      goingBack = true;
      window.history.back();
    } else window.location.hash = fallback;
  }, []);

  return { route, go, back };
}
