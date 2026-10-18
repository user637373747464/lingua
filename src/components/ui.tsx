"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Lang } from "../lib/types";
import { NO_VOICE_HELP, speak, ttsSupported } from "../lib/tts";
import { useData } from "../lib/store";

// ---------- icônes (traits simples, style « Feather ») ----------

const ICONS: Record<string, string[]> = {
  home: ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  book: ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  cards: ["M12 2 2 7l10 5 10-5-10-5z", "M2 17l10 5 10-5", "M2 12l10 5 10-5"],
  pen: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"],
  chart: ["M18 20V10", "M12 20V4", "M6 20v-6"],
  sliders: ["M4 21v-7", "M4 10V3", "M12 21v-9", "M12 8V3", "M20 21v-5", "M20 12V3", "M1 14h6", "M9 8h6", "M17 16h6"],
  speaker: ["M11 5L6 9H2v6h4l5 4V5z", "M19.07 4.93a10 10 0 0 1 0 14.14", "M15.54 8.46a5 5 0 0 1 0 7.07"],
  plus: ["M12 5v14", "M5 12h14"],
  search: ["M21 21l-4.35-4.35", "M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"],
  check: ["M20 6L9 17l-5-5"],
  x: ["M18 6L6 18", "M6 6l12 12"],
  back: ["M15 18l-6-6 6-6"],
  next: ["M9 18l6-6-6-6"],
  trash: ["M3 6h18", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],
  download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  upload: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  bulb: ["M9 18h6", "M10 22h4", "M15.1 14c.2-1 .7-1.7 1.4-2.5A4.7 4.7 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5A4.6 4.6 0 0 1 8.9 14"],
  link: ["M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", "M15 3h6v6", "M10 14L21 3"],
  edit: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"],
  lock: ["M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z", "M8 11V7a4 4 0 0 1 8 0v4"],
  flame: ["M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z"],
};

export function Icon({ name, size = 20 }: { name: keyof typeof ICONS | string; size?: number }) {
  const paths = ICONS[name] ?? [];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

// ---------- notifications ----------

interface ToastItem {
  id: number;
  text: string;
  kind: "info" | "error" | "ok";
}

const ToastCtx = createContext<(text: string, kind?: ToastItem["kind"]) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const notify = useCallback((text: string, kind: ToastItem["kind"] = "info") => {
    const id = ++counter.current;
    setItems((cur) => [...cur, { id, text, kind }]);
    setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), kind === "error" ? 7000 : 3500);
  }, []);
  return (
    <ToastCtx.Provider value={notify}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ---------- boîtes de dialogue ----------

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? " wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2 className="h2">{title}</h2>
          <button className="btn ghost icon" onClick={onClose} aria-label="Fermer">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  requireText,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  /** Si défini, l'utilisateur doit recopier ce mot pour confirmer. */
  requireText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const ok = !requireText || typed.trim().toUpperCase() === requireText.toUpperCase();
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="stack">
        <div>{message}</div>
        {requireText && (
          <label className="field">
            <span className="label">Pour confirmer, écris « {requireText} »</span>
            <input className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoCapitalize="characters" />
          </label>
        )}
        <div className="row end">
          <button className="btn ghost" onClick={onCancel}>
            Annuler
          </button>
          <button className={`btn ${danger ? "danger" : "primary"}`} disabled={!ok} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------- petits composants ----------

export function Progress({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <div className="bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={o.value === value} className={o.value === value ? "on" : ""} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      {children && <div className="muted">{children}</div>}
    </div>
  );
}

export function PageHead({ title, onBack, backLabel, actions, sub }: { title: React.ReactNode; onBack?: () => void; backLabel?: string; actions?: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <header className="page-head">
      <div className="row">
        {onBack && (
          <button className="btn ghost icon" onClick={onBack} aria-label={backLabel ?? "Retour"}>
            <Icon name="back" />
          </button>
        )}
        <div className="grow">
          <h1 className="h1">{title}</h1>
          {sub && <div className="muted small">{sub}</div>}
        </div>
        {actions}
      </div>
    </header>
  );
}

/** Bouton « écouter » : utilise la voix du système, sans rien envoyer sur Internet. */
export function SpeakButton({ text, lang, label = "Écouter" }: { text: string; lang: Lang; label?: string }) {
  const { snapshot } = useData();
  const notify = useToast();
  if (typeof window !== "undefined" && !ttsSupported()) return null;
  return (
    <button
      className="btn ghost icon"
      aria-label={`${label} : ${text}`}
      title={label}
      onClick={async (e) => {
        e.stopPropagation();
        const r = await speak(text, lang, { rate: snapshot.settings.ttsRate, voiceName: snapshot.settings.ttsVoice[lang] });
        if (!r.ok && r.reason === "no-voice") notify(NO_VOICE_HELP[lang], "error");
        else if (!r.ok && r.reason === "unsupported") notify("La synthèse vocale n'est pas disponible dans ce navigateur.", "error");
      }}
    >
      <Icon name="speaker" size={18} />
    </button>
  );
}

/** Texte avec la bonne police selon la langue. */
export function Txt({ lang, children, className }: { lang: Lang; children: React.ReactNode; className?: string }) {
  return (
    <span lang={lang === "ja" ? "ja" : "en"} className={`${lang === "ja" ? "ja " : ""}${className ?? ""}`}>
      {children}
    </span>
  );
}
