"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lang, LANGS, LANG_INFO, Settings, Snapshot } from "../lib/types";
import { useData } from "../lib/store";
import { SCHEMA_VERSION, backupFileName, parseBackup } from "../lib/backup";
import { NO_VOICE_HELP, getVoices, speak, ttsSupported, voicesFor } from "../lib/tts";
import { formatDate } from "../lib/dates";
import { ConfirmDialog, Icon, Modal, PageHead, Segmented, useToast } from "./ui";

const APP_VERSION = "1.0.0";

function LangSettingsCard({ lang }: { lang: Lang }) {
  const { snapshot, updateLangSettings } = useData();
  const info = LANG_INFO[lang];
  const cfg = snapshot.settings.langs[lang];
  const notify = useToast();
  const save = (patch: Partial<typeof cfg>) => updateLangSettings(lang, patch).catch((e) => notify(`Enregistrement impossible : ${e instanceof Error ? e.message : e}`, "error"));
  return (
    <section className="card stack">
      <h2 className={`h3 ${lang === "ja" ? "ja" : ""}`}>{info.name}</h2>
      <div className="grid grid-2">
        <label className="field">
          <span className="label">Niveau estimé</span>
          <select className="select" value={cfg.currentLevel} onChange={(e) => save({ currentLevel: e.target.value })}>
            {info.levels.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="label">Objectif</span>
          <select className="select" value={cfg.targetLevel} onChange={(e) => save({ targetLevel: e.target.value })}>
            {info.levels.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="label">Minutes par jour</span>
          <input className="input" type="number" inputMode="numeric" min={5} max={240} step={5} value={cfg.dailyMinutes} onChange={(e) => save({ dailyMinutes: Number(e.target.value) })} />
        </label>
      </div>
    </section>
  );
}

function VoiceSection() {
  const { snapshot, updateSettings } = useData();
  const notify = useToast();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const supported = typeof window !== "undefined" && ttsSupported();
  useEffect(() => {
    if (supported) void getVoices().then(setVoices);
  }, [supported]);
  const s = snapshot.settings;
  const set = (fn: (s: Settings) => Settings) => updateSettings(fn).catch((e) => notify(`Enregistrement impossible : ${e instanceof Error ? e.message : e}`, "error"));

  if (!supported) {
    return (
      <section className="card stack">
        <h2 className="h3">Voix</h2>
        <p className="muted">La synthèse vocale n'est pas disponible dans ce navigateur.</p>
      </section>
    );
  }
  return (
    <section className="card stack">
      <h2 className="h3">Voix</h2>
      <label className="field">
        <span className="label">Vitesse : {s.ttsRate.toFixed(2)}×</span>
        <input type="range" min={0.5} max={1.2} step={0.05} value={s.ttsRate} onChange={(e) => set((x) => ({ ...x, ttsRate: Number(e.target.value) }))} />
      </label>
      {LANGS.map((l) => {
        const list = voicesFor(voices, l);
        return (
          <div className="field" key={l}>
            <span className="label">{LANG_INFO[l].name}</span>
            {list.length === 0 ? (
              <p className="muted small">{NO_VOICE_HELP[l]}</p>
            ) : (
              <div className="row">
                <select className="select grow" value={s.ttsVoice[l] ?? ""} onChange={(e) => set((x) => ({ ...x, ttsVoice: { ...x.ttsVoice, [l]: e.target.value || undefined } }))} aria-label={`Voix ${LANG_INFO[l].name}`}>
                  <option value="">Automatique</option>
                  {list.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
                <button
                  className="btn"
                  onClick={async () => {
                    const r = await speak(l === "ja" ? "こんにちは、元気ですか。" : "Hello, how are you today?", l, { rate: s.ttsRate, voiceName: s.ttsVoice[l] });
                    if (!r.ok && r.reason === "no-voice") notify(NO_VOICE_HELP[l], "error");
                  }}
                >
                  <Icon name="speaker" size={18} /> Tester
                </button>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

function BackupSection() {
  const { snapshot, exportBackup, importSnapshot, markBackupDone, lastBackupAt, updateSettings } = useData();
  const notify = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ snapshot: Snapshot; warnings: string[]; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const doExport = async () => {
    try {
      const file = exportBackup();
      const text = JSON.stringify(file, null, 1);
      const name = backupFileName(Date.now());
      const blob = new Blob([text], { type: "application/json" });
      const f = typeof File !== "undefined" ? new File([blob], name, { type: "application/json" }) : null;
      // Sur iPhone/iPad, le menu « Partager » permet d'enregistrer dans Fichiers ou iCloud Drive.
      if (f && navigator.canShare?.({ files: [f] })) {
        try {
          await navigator.share({ files: [f], title: "Sauvegarde Lingua" });
          await markBackupDone();
          notify("Sauvegarde partagée.", "ok");
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
          // sinon on retombe sur le téléchargement classique
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      await markBackupDone();
      notify("Sauvegarde téléchargée. Garde-la hors de l'appareil (Fichiers, iCloud…).", "ok");
    } catch (e) {
      notify(`Sauvegarde impossible : ${e instanceof Error ? e.message : e}`, "error");
    }
  };

  const readFile = async (file: File) => {
    setError(null);
    setPending(null);
    try {
      if (file.size > 50_000_000) throw new Error("Fichier trop volumineux.");
      const r = parseBackup(await file.text());
      if (!r.ok) throw new Error(r.error);
      setPending({ snapshot: r.snapshot, warnings: r.warnings, name: file.name });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const merge = async () => {
    if (!pending) return;
    try {
      const rep = await importSnapshot(pending.snapshot, "merge");
      notify(rep ? `Fusion terminée : ${rep.entriesAdded} mot(s) ajouté(s), ${rep.entriesUpdated} mis à jour, ${rep.entriesDuplicate} doublon(s) ignoré(s).` : "Fusion terminée.", "ok");
      setPending(null);
    } catch (e) {
      setError(`Import impossible : ${e instanceof Error ? e.message : e}`);
    }
  };

  const replace = async () => {
    if (!pending) return;
    try {
      await importSnapshot(pending.snapshot, "replace");
      notify("Données remplacées par la sauvegarde.", "ok");
      setPending(null);
      setConfirmReplace(false);
    } catch (e) {
      setConfirmReplace(false);
      setError(`Import impossible : ${e instanceof Error ? e.message : e}`);
    }
  };

  const p = pending?.snapshot;
  return (
    <section className="card stack">
      <h2 className="h3">Sauvegarde</h2>
      <p className="muted small">
        Tes données ne sont stockées que sur cet appareil. Une sauvegarde est ta seule protection si le navigateur efface ses données. {lastBackupAt ? `Dernière sauvegarde : ${formatDate(lastBackupAt)}.` : "Aucune sauvegarde faite pour l'instant."}
      </p>
      <div className="row wrap">
        <button className="btn primary" onClick={doExport}>
          <Icon name="download" size={18} /> Exporter une sauvegarde
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" size={18} /> Importer une sauvegarde
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void readFile(f); e.target.value = ""; }} />
      </div>
      <label className="field">
        <span className="label">Me rappeler de sauvegarder tous les</span>
        <select
          className="select"
          value={snapshot.settings.backupReminderDays}
          onChange={(e) => updateSettings((s) => ({ ...s, backupReminderDays: Number(e.target.value) }))}
        >
          <option value={0}>Ne pas me rappeler</option>
          <option value={3}>3 jours</option>
          <option value={7}>7 jours</option>
          <option value={14}>14 jours</option>
          <option value={30}>30 jours</option>
        </select>
      </label>
      {error && <div className="notice error" role="alert">{error}</div>}

      {pending && p && (
        <Modal title="Importer cette sauvegarde ?" onClose={() => setPending(null)}>
          <div className="stack">
            <p className="small muted">{pending.name}</p>
            <ul className="plain">
              <li>{p.entries.length} mots</li>
              <li>{p.decks.length} paquets, {p.deckCards.length} cartes</li>
              <li>{p.studyLog.length} jours d'historique</li>
            </ul>
            {pending.warnings.length > 0 && (
              <div className="notice warn">
                <ul className="plain">
                  {pending.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            <p>
              <strong>Fusionner</strong> ajoute ce qui manque sans rien supprimer ni créer de doublons (recommandé).
              <br />
              <strong>Remplacer</strong> efface tout ce qui est sur cet appareil et le remplace par la sauvegarde.
            </p>
            <div className="row wrap end">
              <button className="btn ghost" onClick={() => setPending(null)}>
                Annuler
              </button>
              <button className="btn danger" onClick={() => setConfirmReplace(true)}>
                Remplacer
              </button>
              <button className="btn primary" onClick={merge}>
                Fusionner
              </button>
            </div>
          </div>
        </Modal>
      )}
      {confirmReplace && (
        <ConfirmDialog
          title="Remplacer toutes les données ?"
          message="Tout ce qui est actuellement sur cet appareil sera perdu. Exporte d'abord une sauvegarde si tu n'es pas sûr."
          confirmLabel="Remplacer"
          danger
          onCancel={() => setConfirmReplace(false)}
          onConfirm={replace}
        />
      )}
    </section>
  );
}

export default function SettingsPage() {
  const { snapshot, updateSettings, persisted, resetAll } = useData();
  const notify = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const s = snapshot.settings;
  const set = (fn: (s: Settings) => Settings) => updateSettings(fn).catch((e) => notify(`Enregistrement impossible : ${e instanceof Error ? e.message : e}`, "error"));

  return (
    <div className="page">
      <PageHead title="Réglages" />

      <section className="card stack">
        <h2 className="h3">Affichage</h2>
        <div className="field">
          <span className="label">Thème</span>
          <Segmented
            value={s.theme}
            label="Thème"
            options={[
              { value: "auto", label: "Auto" },
              { value: "light", label: "Clair" },
              { value: "dark", label: "Sombre" },
            ]}
            onChange={(v) => set((x) => ({ ...x, theme: v }))}
          />
        </div>
        <div className="field">
          <span className="label">Taille du texte</span>
          <Segmented
            value={s.textSize}
            label="Taille du texte"
            options={[
              { value: "normal", label: "Normale" },
              { value: "large", label: "Grande" },
              { value: "xlarge", label: "Très grande" },
            ]}
            onChange={(v) => set((x) => ({ ...x, textSize: v }))}
          />
        </div>
        <div className="field">
          <span className="label">Animations</span>
          <Segmented
            value={s.reduceMotion}
            label="Animations"
            options={[
              { value: "auto", label: "Selon l'appareil" },
              { value: "on", label: "Réduites" },
              { value: "off", label: "Normales" },
            ]}
            onChange={(v) => set((x) => ({ ...x, reduceMotion: v }))}
          />
        </div>
      </section>

      {LANGS.map((l) => (
        <LangSettingsCard key={l} lang={l} />
      ))}

      <VoiceSection />
      <BackupSection />

      <section className="card stack">
        <h2 className="h3">Stockage sur cet appareil</h2>
        <p>
          {persisted === true && "Le navigateur a accepté de conserver tes données durablement."}
          {persisted === false && "Le navigateur n'a pas (encore) garanti la conservation durable de tes données."}
          {persisted === null && "Vérification en cours…"}
        </p>
        <p className="muted small">
          Sur iPhone et iPad, Safari peut effacer les données des sites peu utilisés. Pour réduire ce risque : ouvre Lingua dans Safari, touche « Partager » puis « Sur l'écran d'accueil », et utilise l'icône ainsi créée. Fais aussi une sauvegarde régulièrement.
        </p>
      </section>

      <section className="card stack">
        <h2 className="h3">Confidentialité</h2>
        <p className="muted small">
          Lingua n'a ni compte, ni publicité, ni statistiques d'usage. Tes mots, cartes et résultats restent dans ce navigateur. Seules les voix de ton appareil servent à la lecture à voix haute.
        </p>
      </section>

      <section className="card stack">
        <h2 className="h3">Zone dangereuse</h2>
        <p className="muted small">Efface tous les mots, cartes et statistiques de cet appareil. Cette action est définitive.</p>
        <div>
          <button className="btn danger" onClick={() => setConfirmReset(true)}>
            <Icon name="trash" size={18} /> Tout effacer
          </button>
        </div>
      </section>

      <p className="muted small center-text">
        Lingua {APP_VERSION} · format de données {SCHEMA_VERSION}
      </p>

      {confirmReset && (
        <ConfirmDialog
          title="Tout effacer ?"
          message="Tous tes mots, cartes, résultats et réglages seront supprimés de cet appareil. Pense à exporter une sauvegarde avant."
          confirmLabel="Tout effacer"
          danger
          requireText="EFFACER"
          onCancel={() => setConfirmReset(false)}
          onConfirm={async () => {
            try {
              await resetAll();
              setConfirmReset(false);
              notify("Toutes les données ont été effacées.", "ok");
            } catch (e) {
              setConfirmReset(false);
              notify(`Effacement impossible : ${e instanceof Error ? e.message : e}`, "error");
            }
          }}
        />
      )}
    </div>
  );
}
