"use client";

import React, { useEffect } from "react";
import { Lang, LANGS } from "../lib/types";
import { DataProvider, useData } from "../lib/store";
import { useRoute } from "../lib/router";
import { Icon, PageHead, ToastProvider } from "./ui";
import Home, { LangDashboard } from "./Home";
import Dictionary from "./Dictionary";
import EntryView from "./EntryView";
import EntryEditor from "./EntryEditor";
import Study from "./Study";
import Cards from "./Cards";
import Exercises from "./Exercises";
import ProgressPage from "./Progress";
import SettingsPage from "./Settings";
import { LibraryPage, TextView, isSection } from "./Library";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const UI_PREFS_KEY = "lingua-ui";

const isLang = (s: string | undefined): s is Lang => !!s && (LANGS as string[]).includes(s);

function NotFound() {
  return (
    <div className="page">
      <PageHead title="Page introuvable" />
      <p className="muted">Cette page n'existe pas.</p>
      <a className="btn primary" href="#/">
        Retour à l'accueil
      </a>
    </div>
  );
}

function Screen() {
  const { route } = useRoute();
  const [a, b, c, d] = route.segments;

  if (!a) return <Home />;
  if (a === "settings") return <SettingsPage />;
  if (a === "progress") return <ProgressPage />;
  if (!isLang(a)) return <NotFound />;
  if (!b) return <LangDashboard lang={a} />;
  switch (b) {
    case "study":
      return <Study lang={a} />;
    case "cards":
      return <Cards lang={a} />;
    case "exercises":
      return <Exercises lang={a} />;
    case "reading":
    case "news":
    case "audio":
      if (!isSection(b)) return <NotFound />;
      if (!c) return <LibraryPage lang={a} section={b} />;
      if (!d) return <TextView lang={a} section={b} id={c} />;
      return <NotFound />;
    case "dictionary":
      if (!c) return <Dictionary lang={a} />;
      if (c === "new") return <EntryEditor lang={a} initialWord={route.query.get("w") ?? ""} />;
      if (d === "edit") return <EntryEditor lang={a} entryId={c} />;
      if (!d) return <EntryView lang={a} entryId={c} />;
      return <NotFound />;
    default:
      return <NotFound />;
  }
}

function Nav({ active }: { active: string }) {
  const items: { id: string; href: string; label: string; icon: string }[] = [
    { id: "home", href: "#/", label: "Accueil", icon: "home" },
    { id: "en", href: "#/en", label: "English", icon: "book" },
    { id: "ja", href: "#/ja", label: "日本語", icon: "book" },
    { id: "progress", href: "#/progress", label: "Progrès", icon: "chart" },
    { id: "settings", href: "#/settings", label: "Réglages", icon: "sliders" },
  ];
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      <div className="brand" aria-hidden="true">
        Lingua
      </div>
      {items.map((i) => (
        <a key={i.id} href={i.href} className={i.id === active ? "on" : ""} aria-current={i.id === active ? "page" : undefined}>
          <Icon name={i.icon} size={22} />
          <span className={i.id === "ja" ? "ja" : ""}>{i.label}</span>
        </a>
      ))}
    </nav>
  );
}

/** Applique thème / taille de texte / animations, et les mémorise pour éviter un « flash » au prochain démarrage. */
function usePrefs() {
  const { snapshot, ready } = useData();
  const { theme, textSize, reduceMotion } = snapshot.settings;
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    root.setAttribute("data-text", textSize);
    root.setAttribute("data-motion", reduceMotion);
    try {
      localStorage.setItem(UI_PREFS_KEY, JSON.stringify({ theme, textSize, reduceMotion }));
    } catch {
      /* stockage indisponible : sans importance */
    }
  }, [ready, theme, textSize, reduceMotion]);
}

function Shell() {
  const { ready, error } = useData();
  const { route } = useRoute();
  usePrefs();

  const key = route.segments.join("/");
  useEffect(() => {
    window.scrollTo?.(0, 0);
  }, [key]);

  if (error) {
    return (
      <main className="splash" role="alert">
        <h1 className="h1">Impossible d'ouvrir tes données</h1>
        <p>{error}</p>
        <p className="muted small">
          Causes fréquentes : navigation privée, stockage du navigateur désactivé ou plein. Ouvre Lingua dans une fenêtre normale. Tes données existantes n'ont pas été modifiées.
        </p>
        <button className="btn primary" onClick={() => location.reload()}>
          Réessayer
        </button>
      </main>
    );
  }
  if (!ready) {
    return (
      <main className="splash" aria-busy="true">
        <div className="splash-mark" aria-hidden="true">
          言
        </div>
        <p className="muted">Chargement…</p>
      </main>
    );
  }

  const first = route.segments[0];
  const active = !first ? "home" : first === "en" || first === "ja" ? first : first;
  return (
    <>
      <Nav active={active} />
      <main id="main" className="main" tabIndex={-1}>
        <Screen key={key} />
      </main>
    </>
  );
}

export default function App() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` }).catch(() => {
      /* l'application fonctionne aussi sans mode hors ligne */
    });
  }, []);
  return (
    <ToastProvider>
      <DataProvider>
        <Shell />
      </DataProvider>
    </ToastProvider>
  );
}
