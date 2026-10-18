"use client";

import React from "react";
import { LANG_INFO, Lang, LANGS } from "../lib/types";
import { useData } from "../lib/store";
import { useLangStats, useNow } from "../lib/hooks";
import { currentStreak } from "../lib/stats";
import { dayKey } from "../lib/dates";
import { Icon, PageHead, Progress } from "./ui";

function LangCard({ lang }: { lang: Lang }) {
  const { snapshot } = useData();
  const s = useLangStats(lang);
  const info = LANG_INFO[lang];
  const cfg = snapshot.settings.langs[lang];
  const minutes = Math.floor(s.secondsToday / 60);
  const nothing = s.due + s.fresh === 0;
  return (
    <article className={`card lang-card lang-${lang}`}>
      <header className="lang-head">
        <div className={`glyph ${lang === "ja" ? "ja" : ""}`} aria-hidden="true">
          {info.glyph}
        </div>
        <div>
          <h2 className={`h2 ${lang === "ja" ? "ja" : ""}`}>{info.name}</h2>
          <div className="muted small">
            Niveau estimé {cfg.currentLevel} · objectif {cfg.targetLevel}
          </div>
        </div>
      </header>

      <div className="metrics">
        <div>
          <strong>{s.due}</strong>
          <span>à réviser</span>
        </div>
        <div>
          <strong>{s.fresh}</strong>
          <span>nouvelles</span>
        </div>
        <div>
          <strong>{s.words}</strong>
          <span>mots</span>
        </div>
      </div>

      <div className="goal">
        <div className="row between small muted">
          <span>Aujourd'hui</span>
          <span>
            {minutes} / {cfg.dailyMinutes} min
          </span>
        </div>
        <Progress value={s.secondsToday} max={cfg.dailyMinutes * 60} label={`Temps d'étude aujourd'hui, ${info.name}`} />
      </div>

      <div className="row wrap">
        {s.words === 0 ? (
          <a className="btn primary grow" href={`#/${lang}/dictionary`}>
            Ajouter des mots
          </a>
        ) : (
          <a className="btn primary grow" href={`#/${lang}/study`}>
            {nothing ? "Voir les révisions" : "Commencer une session"}
          </a>
        )}
        <a className="btn" href={`#/${lang}`}>
          Ouvrir
        </a>
      </div>
    </article>
  );
}

export default function Home() {
  const { snapshot, lastBackupAt } = useData();
  const now = useNow(60_000);
  const streak = currentStreak(snapshot.studyLog, now);
  const totalSeconds = snapshot.studyLog.filter((d) => d.date === dayKey(now)).reduce((n, d) => n + d.seconds, 0);
  const goal = LANGS.reduce((n, l) => n + snapshot.settings.langs[l].dailyMinutes, 0);
  const reminderDays = snapshot.settings.backupReminderDays;
  const hasData = snapshot.entries.length > 0 || snapshot.cards.length > 0;
  const daysSince = lastBackupAt === undefined ? Infinity : Math.floor((now - lastBackupAt) / 86400_000);
  const showBackupReminder = hasData && reminderDays > 0 && daysSince >= reminderDays;

  return (
    <div className="page">
      <PageHead
        title="Bonjour"
        sub={
          <>
            {Math.floor(totalSeconds / 60)} min d'étude aujourd'hui sur {goal} visées
            {streak > 0 && <> · {streak} jour{streak > 1 ? "s" : ""} d'affilée</>}
          </>
        }
      />

      {showBackupReminder && (
        <a className="notice warn" href="#/settings">
          <Icon name="download" />
          <span>
            {lastBackupAt === undefined ? "Tu n'as encore jamais sauvegardé tes données." : `Dernière sauvegarde il y a ${daysSince} jours.`} Exporte une sauvegarde : c'est ta seule copie de sécurité.
          </span>
        </a>
      )}

      <div className="grid grid-2">
        {LANGS.map((l) => (
          <LangCard key={l} lang={l} />
        ))}
      </div>
    </div>
  );
}

// ---------- tableau de bord d'une langue ----------

interface Module {
  id: string;
  title: string;
  desc: string;
  icon: string;
  href?: string;
  soon?: boolean;
  onlyLang?: Lang;
}

const MODULES: Module[] = [
  { id: "study", title: "Flashcards", desc: "Réviser au bon moment", icon: "cards", href: "study" },
  { id: "dictionary", title: "Dictionnaire", desc: "Tes mots, sens et exemples", icon: "book", href: "dictionary" },
  { id: "exercises", title: "Grammaire et exercices", desc: "QCM, trous, phrases à remettre en ordre", icon: "pen", href: "exercises" },
  { id: "lessons", title: "Leçons", desc: "Fiches de grammaire, temps, verbes irréguliers", icon: "bulb", href: "lessons" },
  { id: "cards", title: "Gérer les cartes", desc: "Créer, suspendre, supprimer", icon: "sliders", href: "cards" },
  { id: "writing", title: "Écriture", desc: "Kana, kanji, tracé et ordre des traits", icon: "edit", soon: true, onlyLang: "ja" },
  { id: "reading", title: "Lecture", desc: "Textes avec dictionnaire au toucher", icon: "book", href: "reading" },
  { id: "news", title: "Actualités", desc: "Articles, sources conseillées, mots au toucher", icon: "link", href: "news" },
  { id: "audio", title: "Podcasts et vidéos", desc: "Ta bibliothèque d'écoute + transcriptions", icon: "speaker", href: "audio" },
  { id: "stories", title: "Histoires graduées", desc: "Lire à son niveau", icon: "book", soon: true },
  { id: "talk", title: "Conversation", desc: "Entraînement guidé", icon: "pen", soon: true },
];

export function LangDashboard({ lang }: { lang: Lang }) {
  const s = useLangStats(lang);
  const { snapshot } = useData();
  const info = LANG_INFO[lang];
  const cfg = snapshot.settings.langs[lang];
  const modules = MODULES.filter((m) => !m.onlyLang || m.onlyLang === lang);
  return (
    <div className="page">
      <PageHead
        title={<span className={lang === "ja" ? "ja" : ""}>{info.name}</span>}
        onBack={() => (window.location.hash = "#/")}
        sub={`Niveau estimé ${cfg.currentLevel} · objectif ${cfg.targetLevel}`}
      />

      <div className="card cta">
        <div>
          <div className="h2">
            {s.due} à réviser · {s.fresh} nouvelle{s.fresh > 1 ? "s" : ""}
          </div>
          <div className="muted small">
            {Math.floor(s.secondsToday / 60)} / {cfg.dailyMinutes} min aujourd'hui · {s.words} mots · {s.mastered} maîtrisé{s.mastered > 1 ? "s" : ""}
          </div>
        </div>
        <a className="btn primary" href={`#/${lang}/study`}>
          Commencer
        </a>
      </div>

      <div className="grid grid-3">
        {modules.map((m) =>
          m.soon ? (
            <div key={m.id} className="card module disabled" aria-disabled="true">
              <Icon name={m.icon} size={22} />
              <div>
                <div className="module-title">{m.title}</div>
                <div className="muted small">{m.desc}</div>
                <span className="badge">Prochainement</span>
              </div>
            </div>
          ) : (
            <a key={m.id} className="card module card-link" href={`#/${lang}/${m.href}`}>
              <Icon name={m.icon} size={22} />
              <div>
                <div className="module-title">{m.title}</div>
                <div className="muted small">{m.desc}</div>
              </div>
            </a>
          ),
        )}
      </div>
    </div>
  );
}
