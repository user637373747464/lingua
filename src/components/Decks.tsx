"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Deck, DeckCard, Lang, LANG_INFO } from "../lib/types";
import { DeckResult, useData } from "../lib/store";
import { useNow } from "../lib/hooks";
import { entryGloss } from "../lib/cards";
import { normalizeForSearch } from "../lib/search";
import { uid } from "../lib/ids";
import { formatDuration } from "../lib/dates";
import {
  Dir, DirChoice, MATCH_PAIRS, MIN_MATCH_PAIRS, MODE_INFO, Mode, answerText, canQcm, checkTyped, deckStats, makeMatchRound, newDeckCard,
  parseCardList, pickSession, promptOf, qcmChoices, resolveDir,
} from "../lib/decks";
import { ConfirmDialog, EmptyState, Icon, Modal, PageHead, Segmented, SpeakButton, Txt, useToast } from "./ui";

const go = (hash: string) => {
  window.location.hash = hash;
};

const L2_NAME: Record<Lang, string> = { en: "Anglais", ja: "Japonais" };
const dirLabel = (lang: Lang, dir: DirChoice): string => (dir === "to-fr" ? `${L2_NAME[lang]} → Français` : dir === "from-fr" ? `Français → ${L2_NAME[lang]}` : "Les deux, mélangés");

// ---------- liste des paquets ----------

export function DecksPage({ lang }: { lang: Lang }) {
  const { snapshot, saveDeck, convertLegacyCards } = useData();
  const notify = useToast();
  const now = useNow(60_000);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const decks = snapshot.decks.filter((d) => d.lang === lang).sort((a, b) => b.updatedAt - a.updatedAt);
  const legacy = snapshot.cards.filter((c) => c.lang === lang).length;

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    const t = Date.now();
    const deck: Deck = { id: uid("deck"), lang, name: n, createdAt: t, updatedAt: t };
    await saveDeck(deck);
    setCreating(false);
    setName("");
    go(`#/${lang}/study/${deck.id}`);
  };

  return (
    <div className="page">
      <PageHead
        title="Flashcards"
        sub={`${LANG_INFO[lang].name} · tes paquets`}
        onBack={() => go(`#/${lang}`)}
        actions={
          <button className="btn primary" onClick={() => setCreating(true)}>
            <Icon name="plus" size={18} /> Nouveau paquet
          </button>
        }
      />

      {legacy > 0 && (
        <div className="notice warn stack tight">
          <div>
            Tu as encore <strong>{legacy} ancienne{legacy > 1 ? "s" : ""} carte{legacy > 1 ? "s" : ""}</strong> de l'ancien système (créées automatiquement depuis le dictionnaire). Elles ne sont plus utilisées.
          </div>
          <div className="row wrap">
            <button
              className="btn small"
              onClick={async () => {
                const n = await convertLegacyCards(lang);
                notify(n ? `${n} carte${n > 1 ? "s" : ""} reprise${n > 1 ? "s" : ""} dans le paquet « Anciennes cartes ».` : "Anciennes cartes supprimées.", "ok");
              }}
            >
              Les mettre dans un paquet « Anciennes cartes »
            </button>
          </div>
        </div>
      )}

      {decks.length === 0 ? (
        <EmptyState title="Aucun paquet pour l'instant">
          Un paquet est une liste de cartes que tu crées toi-même (mot + traduction), indépendante du dictionnaire. Crée-en un, donne-lui un nom, puis ajoute tes cartes une par une ou en collant une liste.
        </EmptyState>
      ) : (
        <ul className="plain stack tight">
          {decks.map((d) => {
            const cards = snapshot.deckCards.filter((c) => c.deckId === d.id);
            const s = deckStats(cards, now);
            return (
              <li key={d.id}>
                <a className="card card-link row between" href={`#/${lang}/study/${d.id}`}>
                  <div>
                    <div className="module-title">{d.name}</div>
                    <div className="muted small">
                      {s.total} carte{s.total > 1 ? "s" : ""} · {s.learned} bien retenue{s.learned > 1 ? "s" : ""}
                      {s.total > 0 && ` · ${s.due} à revoir`}
                    </div>
                  </div>
                  <Icon name="next" />
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {creating && (
        <Modal title="Nouveau paquet" onClose={() => setCreating(false)}>
          <form className="stack" onSubmit={create}>
            <label className="field">
              <span className="label">Nom du paquet</span>
              <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "ja" ? "Ex. : Verbes du chapitre 3" : "Ex. : Vocabulaire du voyage"} maxLength={80} />
            </label>
            <div className="row end">
              <button type="button" className="btn ghost" onClick={() => setCreating(false)}>
                Annuler
              </button>
              <button type="submit" className="btn primary" disabled={!name.trim()}>
                Créer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ---------- formulaire d'une carte ----------

function CardFields({
  lang,
  front,
  reading,
  back,
  set,
}: {
  lang: Lang;
  front: string;
  reading: string;
  back: string;
  set: (p: { front?: string; reading?: string; back?: string }) => void;
}) {
  const ja = lang === "ja";
  return (
    <>
      <label className="field">
        <span className="label">{ja ? "Mot en japonais" : "Mot en anglais"} (recto)</span>
        <input className={`input ${ja ? "ja" : ""}`} lang={ja ? "ja" : "en"} value={front} onChange={(e) => set({ front: e.target.value })} autoCapitalize="none" autoCorrect="off" aria-label="Recto" />
      </label>
      {ja && (
        <label className="field">
          <span className="label">Lecture en kana (facultatif)</span>
          <input className="input ja" lang="ja" value={reading} onChange={(e) => set({ reading: e.target.value })} aria-label="Lecture" />
        </label>
      )}
      <label className="field">
        <span className="label">Traduction en français (verso) · plusieurs : sépare par « ; »</span>
        <input className="input" value={back} onChange={(e) => set({ back: e.target.value })} aria-label="Verso" />
      </label>
    </>
  );
}

function EditCardModal({ card, lang, onClose }: { card: DeckCard; lang: Lang; onClose: () => void }) {
  const { snapshot, saveDeckCards } = useData();
  const [f, setF] = useState({ front: card.front, reading: card.reading ?? "", back: card.back });
  const [deckId, setDeckId] = useState(card.deckId);
  const decks = snapshot.decks.filter((d) => d.lang === lang);
  const valid = f.front.trim() !== "" && f.back.trim() !== "";
  return (
    <Modal title="Modifier la carte" onClose={onClose}>
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!valid) return;
          const reading = f.reading.trim();
          const next: DeckCard = { ...card, front: f.front.trim(), back: f.back.trim(), deckId, updatedAt: Date.now() };
          if (reading) next.reading = reading;
          else delete next.reading;
          await saveDeckCards([next]);
          onClose();
        }}
      >
        <CardFields lang={lang} {...f} set={(p) => setF({ ...f, ...p })} />
        <label className="field">
          <span className="label">Paquet</span>
          <select className="select" value={deckId} onChange={(e) => setDeckId(e.target.value)}>
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn primary" disabled={!valid}>
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------- un paquet ----------

export function DeckPage({ lang, deckId }: { lang: Lang; deckId: string }) {
  const { snapshot, saveDeck, deleteDeck, saveDeckCards, deleteDeckCards } = useData();
  const notify = useToast();
  const now = useNow(60_000);
  const deck = snapshot.decks.find((d) => d.id === deckId && d.lang === lang);
  const cards = useMemo(() => snapshot.deckCards.filter((c) => c.deckId === deckId).sort((a, b) => b.createdAt - a.createdAt), [snapshot.deckCards, deckId]);

  const [mode, setMode] = useState<Mode>("flip");
  const [dir, setDir] = useState<DirChoice>("to-fr");
  const [size, setSize] = useState<"10" | "20" | "0">("10");
  const [f, setF] = useState({ front: "", reading: "", back: "" });
  const [msg, setMsg] = useState("");
  const [bulk, setBulk] = useState(false);
  const [fromDict, setFromDict] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<DeckCard | null>(null);
  const [toDelete, setToDelete] = useState<DeckCard | null>(null);
  const [q, setQ] = useState("");
  const frontRef = useRef<HTMLInputElement>(null);

  if (!deck) {
    return (
      <div className="page">
        <PageHead title="Paquet introuvable" onBack={() => go(`#/${lang}/study`)} />
        <p className="muted">Ce paquet n'existe pas (ou plus).</p>
      </div>
    );
  }

  const stats = deckStats(cards, now);
  const matchPairs = makeMatchRound(cards, now).cards.length;
  const availability: Record<Mode, string | null> = {
    flip: cards.length ? null : "Ajoute au moins une carte.",
    write: cards.length ? null : "Ajoute au moins une carte.",
    qcm: canQcm(cards) ? null : "Il faut au moins 2 cartes différentes.",
    match: matchPairs >= MIN_MATCH_PAIRS ? null : `Il faut au moins ${MIN_MATCH_PAIRS} cartes différentes.`,
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const front = f.front.trim();
    const back = f.back.trim();
    if (!front || !back) return setMsg("Écris le mot ET sa traduction.");
    if (cards.some((c) => normalizeForSearch(c.front) === normalizeForSearch(front) && normalizeForSearch(c.back) === normalizeForSearch(back))) return setMsg("Cette carte existe déjà dans le paquet.");
    await saveDeckCards([newDeckCard({ deckId, lang, front, back, reading: f.reading, now: Date.now() })]);
    setF({ front: "", reading: "", back: "" });
    setMsg("");
    notify(`« ${front} » ajouté.`, "ok");
    frontRef.current?.focus();
  };

  const start = () => {
    const qs = new URLSearchParams({ mode, dir, n: size });
    go(`#/${lang}/study/${deckId}/play?${qs.toString()}`);
  };

  const shown = q.trim() ? cards.filter((c) => normalizeForSearch(`${c.front} ${c.reading ?? ""} ${c.back}`).includes(normalizeForSearch(q))) : cards;

  return (
    <div className="page">
      <PageHead
        title={deck.name}
        sub={`${stats.total} carte${stats.total > 1 ? "s" : ""} · ${stats.learned} bien retenue${stats.learned > 1 ? "s" : ""} · ${stats.due} à revoir`}
        onBack={() => go(`#/${lang}/study`)}
        actions={
          <div className="row">
            <button
              className="btn ghost icon"
              aria-label="Renommer le paquet"
              onClick={() => {
                setNewName(deck.name);
                setRenaming(true);
              }}
            >
              <Icon name="edit" />
            </button>
            <button className="btn ghost icon" aria-label="Supprimer le paquet" onClick={() => setDeleting(true)}>
              <Icon name="trash" />
            </button>
          </div>
        }
      />

      <section className="card stack">
        <h2 className="h3">Réviser</h2>
        <div className="modes" role="radiogroup" aria-label="Mode de révision">
          {(Object.keys(MODE_INFO) as Mode[]).map((m) => (
            <button key={m} role="radio" aria-checked={mode === m} className={`mode ${mode === m ? "on" : ""}`} disabled={!!availability[m]} onClick={() => setMode(m)}>
              <strong>{MODE_INFO[m].label}</strong>
              <span className="small muted">{availability[m] ?? MODE_INFO[m].desc}</span>
            </button>
          ))}
        </div>
        {mode !== "match" && (
          <div className="field">
            <span className="label">Sens</span>
            <Segmented
              label="Sens"
              value={dir}
              onChange={setDir}
              options={[
                { value: "to-fr", label: `${L2_NAME[lang]} → FR` },
                { value: "from-fr", label: `FR → ${L2_NAME[lang]}` },
                { value: "mixed", label: "Mélangé" },
              ]}
            />
          </div>
        )}
        {mode !== "match" && (
          <div className="field">
            <span className="label">Nombre de cartes</span>
            <Segmented
              label="Nombre de cartes"
              value={size}
              onChange={setSize}
              options={[
                { value: "10", label: "10" },
                { value: "20", label: "20" },
                { value: "0", label: "Toutes" },
              ]}
            />
          </div>
        )}
        <button className="btn primary big" disabled={!!availability[mode]} onClick={start}>
          Commencer
        </button>
        <p className="muted small">Les cartes à revoir et les plus difficiles passent en premier. Chaque sens (langue → français, français → langue) a sa propre progression.</p>
      </section>

      <section className="card stack">
        <h2 className="h3">Ajouter une carte</h2>
        <form className="stack tight" onSubmit={add}>
          <CardFieldsWithRef lang={lang} f={f} setF={setF} frontRef={frontRef} />
          {msg && <div className="notice error">{msg}</div>}
          <div className="row wrap">
            <button type="submit" className="btn primary">
              <Icon name="plus" size={18} /> Ajouter
            </button>
            <button type="button" className="btn" onClick={() => setBulk(true)}>
              Coller une liste
            </button>
            <button type="button" className="btn" onClick={() => setFromDict(true)}>
              Depuis mon dictionnaire
            </button>
          </div>
        </form>
      </section>

      <section className="stack tight">
        <div className="row between">
          <h2 className="h3">Cartes du paquet ({cards.length})</h2>
        </div>
        {cards.length > 8 && <input className="input" type="search" placeholder="Chercher dans le paquet" aria-label="Chercher dans le paquet" value={q} onChange={(e) => setQ(e.target.value)} />}
        {cards.length === 0 ? (
          <p className="muted">Aucune carte pour l'instant.</p>
        ) : (
          <ul className="plain stack tight">
            {shown.map((c) => (
              <li key={c.id} className="row-item">
                <div className="grow">
                  <div>
                    <Txt lang={lang} className="strong">
                      {c.front}
                    </Txt>
                    {c.reading && (
                      <Txt lang={lang} className="muted small">
                        {" "}
                        {c.reading}
                      </Txt>
                    )}
                  </div>
                  <div className="muted small">{c.back}</div>
                </div>
                <span className="muted small" title="Progression : langue → français / français → langue">
                  {c.fwd.box}/{c.rev.box}
                </span>
                <button className="btn ghost icon" aria-label={`Modifier ${c.front}`} onClick={() => setEditing(c)}>
                  <Icon name="edit" size={18} />
                </button>
                <button className="btn ghost icon" aria-label={`Supprimer ${c.front}`} onClick={() => setToDelete(c)}>
                  <Icon name="trash" size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {bulk && <BulkModal lang={lang} deckId={deckId} cards={cards} onClose={() => setBulk(false)} />}
      {fromDict && <FromDictionaryModal lang={lang} deckId={deckId} cards={cards} onClose={() => setFromDict(false)} />}
      {editing && <EditCardModal card={editing} lang={lang} onClose={() => setEditing(null)} />}
      {toDelete && (
        <ConfirmDialog
          title="Supprimer la carte ?"
          message={
            <>
              « {toDelete.front} » → « {toDelete.back} » sera supprimée du paquet.
            </>
          }
          confirmLabel="Supprimer"
          danger
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            await deleteDeckCards([toDelete.id]);
            setToDelete(null);
          }}
        />
      )}
      {renaming && (
        <Modal title="Renommer le paquet" onClose={() => setRenaming(false)}>
          <form
            className="stack"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newName.trim()) return;
              await saveDeck({ ...deck, name: newName.trim(), updatedAt: Date.now() });
              setRenaming(false);
            }}
          >
            <label className="field">
              <span className="label">Nom du paquet</span>
              <input className="input" autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={80} />
            </label>
            <div className="row end">
              <button type="button" className="btn ghost" onClick={() => setRenaming(false)}>
                Annuler
              </button>
              <button type="submit" className="btn primary" disabled={!newName.trim()}>
                Enregistrer
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Supprimer le paquet ?"
          message={
            <>
              Le paquet « {deck.name} » et ses {cards.length} carte{cards.length > 1 ? "s" : ""} (avec leur progression) seront supprimés définitivement. Ton dictionnaire n'est pas touché.
            </>
          }
          confirmLabel="Supprimer le paquet"
          danger
          onCancel={() => setDeleting(false)}
          onConfirm={async () => {
            await deleteDeck(deck.id);
            go(`#/${lang}/study`);
          }}
        />
      )}
    </div>
  );
}

function CardFieldsWithRef({
  lang,
  f,
  setF,
  frontRef,
}: {
  lang: Lang;
  f: { front: string; reading: string; back: string };
  setF: (v: { front: string; reading: string; back: string }) => void;
  frontRef: React.RefObject<HTMLInputElement>;
}) {
  const ja = lang === "ja";
  return (
    <>
      <label className="field">
        <span className="label">{ja ? "Mot en japonais" : "Mot en anglais"} (recto)</span>
        <input ref={frontRef} className={`input ${ja ? "ja" : ""}`} lang={ja ? "ja" : "en"} value={f.front} onChange={(e) => setF({ ...f, front: e.target.value })} autoCapitalize="none" autoCorrect="off" aria-label="Recto" />
      </label>
      {ja && (
        <label className="field">
          <span className="label">Lecture en kana (facultatif)</span>
          <input className="input ja" lang="ja" value={f.reading} onChange={(e) => setF({ ...f, reading: e.target.value })} aria-label="Lecture" />
        </label>
      )}
      <label className="field">
        <span className="label">Traduction en français (verso) · plusieurs : sépare par « ; »</span>
        <input className="input" value={f.back} onChange={(e) => setF({ ...f, back: e.target.value })} aria-label="Verso" />
      </label>
    </>
  );
}

// ---------- coller une liste ----------

function BulkModal({ lang, deckId, cards, onClose }: { lang: Lang; deckId: string; cards: DeckCard[]; onClose: () => void }) {
  const { saveDeckCards } = useData();
  const notify = useToast();
  const [text, setText] = useState("");
  const parsed = useMemo(() => parseCardList(text, lang), [text, lang]);
  const existing = useMemo(() => new Set(cards.map((c) => normalizeForSearch(c.front) + "|" + normalizeForSearch(c.back))), [cards]);
  const fresh = parsed.cards.filter((c) => !existing.has(normalizeForSearch(c.front) + "|" + normalizeForSearch(c.back)));
  const dup = parsed.cards.length - fresh.length;
  const example = lang === "ja" ? "食べる ; たべる ; manger\n水 ; みず ; eau\n学校 ; がっこう ; école" : "reluctant ; réticent\nto run ; courir\nbread = pain";
  return (
    <Modal title="Coller une liste de cartes" onClose={onClose} wide>
      <div className="stack">
        <p className="muted small">
          Une carte par ligne : <strong>mot ; traduction</strong>
          {lang === "ja" && " (ou mot ; lecture ; traduction)"}. Tu peux aussi coller depuis un tableur (colonnes séparées par une tabulation), ou séparer avec « = » ou « - ».
        </p>
        <textarea className="textarea" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={example} aria-label="Liste de cartes" />
        {text.trim() && (
          <div className="stack tight">
            <div>
              <strong>{fresh.length}</strong> carte{fresh.length > 1 ? "s" : ""} à ajouter
              {dup > 0 && <span className="muted"> · {dup} déjà dans le paquet</span>}
              {parsed.skipped.length > 0 && <span style={{ color: "var(--warn)" }}> · {parsed.skipped.length} ligne{parsed.skipped.length > 1 ? "s" : ""} ignorée{parsed.skipped.length > 1 ? "s" : ""} (pas de séparateur)</span>}
            </div>
            <ul className="plain small muted">
              {fresh.slice(0, 5).map((c, i) => (
                <li key={i}>
                  <Txt lang={lang}>{c.front}</Txt>
                  {c.reading && <Txt lang={lang}> ({c.reading})</Txt>} → {c.back}
                </li>
              ))}
              {fresh.length > 5 && <li>… et {fresh.length - 5} autres</li>}
            </ul>
            {parsed.skipped.length > 0 && <div className="muted small">Ignorées : {parsed.skipped.slice(0, 3).join(" | ")}{parsed.skipped.length > 3 ? " …" : ""}</div>}
          </div>
        )}
        <div className="row end">
          <button className="btn ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            className="btn primary"
            disabled={fresh.length === 0}
            onClick={async () => {
              const now = Date.now();
              await saveDeckCards(fresh.map((c) => newDeckCard({ deckId, lang, front: c.front, back: c.back, reading: c.reading, now })));
              notify(`${fresh.length} carte${fresh.length > 1 ? "s" : ""} ajoutée${fresh.length > 1 ? "s" : ""}.`, "ok");
              onClose();
            }}
          >
            Ajouter {fresh.length || ""} carte{fresh.length > 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------- choisir des mots du dictionnaire ----------

function FromDictionaryModal({ lang, deckId, cards, onClose }: { lang: Lang; deckId: string; cards: DeckCard[]; onClose: () => void }) {
  const { snapshot, saveDeckCards } = useData();
  const notify = useToast();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const have = useMemo(() => new Set(cards.map((c) => normalizeForSearch(c.front))), [cards]);
  const entries = snapshot.entries
    .filter((e) => e.lang === lang && entryGloss(e) !== "" && !have.has(normalizeForSearch(e.headword)))
    .filter((e) => !q.trim() || normalizeForSearch(`${e.headword} ${e.reading ?? ""} ${entryGloss(e)}`).includes(normalizeForSearch(q)))
    .sort((a, b) => a.headword.localeCompare(b.headword));
  const toggle = (id: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  return (
    <Modal title="Choisir des mots du dictionnaire" onClose={onClose} wide>
      <div className="stack">
        <p className="muted small">Coche seulement les mots que tu veux dans ce paquet : rien n'est ajouté automatiquement.</p>
        <input className="input" type="search" placeholder="Chercher" aria-label="Chercher un mot" value={q} onChange={(e) => setQ(e.target.value)} />
        {entries.length === 0 ? (
          <p className="muted">Aucun mot disponible (il faut une traduction, et le mot ne doit pas déjà être dans le paquet).</p>
        ) : (
          <ul className="plain stack tight pick-list">
            {entries.slice(0, 200).map((e) => (
              <li key={e.id}>
                <label className="row-item">
                  <input type="checkbox" checked={picked.has(e.id)} onChange={() => toggle(e.id)} aria-label={e.headword} />
                  <div className="grow">
                    <Txt lang={lang}>{e.headword}</Txt> <span className="muted small">{entryGloss(e)}</span>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
        <div className="row end">
          <button className="btn ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            className="btn primary"
            disabled={picked.size === 0}
            onClick={async () => {
              const now = Date.now();
              const list = snapshot.entries
                .filter((e) => picked.has(e.id))
                .map((e) => newDeckCard({ deckId, lang, front: e.headword, back: entryGloss(e), reading: e.reading && e.reading !== e.headword ? e.reading : undefined, now }));
              await saveDeckCards(list);
              notify(`${list.length} carte${list.length > 1 ? "s" : ""} ajoutée${list.length > 1 ? "s" : ""}.`, "ok");
              onClose();
            }}
          >
            Ajouter {picked.size || ""}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------- révision d'un paquet ----------

interface Item {
  id: string;
  dir: Dir;
}

export function DeckPlay({ lang, deckId, mode, dir, size }: { lang: Lang; deckId: string; mode: Mode; dir: DirChoice; size: number }) {
  const { snapshot } = useData();
  const deck = snapshot.decks.find((d) => d.id === deckId && d.lang === lang);
  const back = () => go(`#/${lang}/study/${deckId}`);
  if (!deck) {
    return (
      <div className="page">
        <PageHead title="Paquet introuvable" onBack={() => go(`#/${lang}/study`)} />
      </div>
    );
  }
  if (mode === "match") return <MatchGame lang={lang} deck={deck} onBack={back} />;
  return <QuestionSession lang={lang} deck={deck} mode={mode} dir={dir} size={size} onBack={back} />;
}

function QuestionSession({ lang, deck, mode, dir, size, onBack }: { lang: Lang; deck: Deck; mode: Exclude<Mode, "match">; dir: DirChoice; size: number; onBack: () => void }) {
  const { snapshot, recordDeckResults } = useData();
  const all = useMemo(() => snapshot.deckCards.filter((c) => c.deckId === deck.id), [snapshot.deckCards, deck.id]);
  const byId = useMemo(() => new Map(snapshot.deckCards.map((c) => [c.id, c])), [snapshot.deckCards]);
  const [queue, setQueue] = useState<Item[] | null>(null);
  const [pos, setPos] = useState(0);
  const [results, setResults] = useState<{ id: string; dir: Dir; ok: boolean }[]>([]);
  const startedAt = useRef(Date.now());
  const shownAt = useRef(Date.now());

  const begin = (subset?: DeckCard[]) => {
    const picked = subset ? pickSession(subset, dir, 0, Date.now()) : pickSession(all, dir, size, Date.now());
    setQueue(picked.map((c) => ({ id: c.id, dir: resolveDir(dir) })));
    setPos(0);
    setResults([]);
    startedAt.current = Date.now();
    shownAt.current = Date.now();
  };
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!queue) return null;
  if (queue.length === 0) {
    return (
      <div className="page">
        <PageHead title={deck.name} onBack={onBack} />
        <EmptyState title="Ce paquet est vide">Ajoute d'abord quelques cartes.</EmptyState>
      </div>
    );
  }

  if (pos >= queue.length) {
    const good = results.filter((r) => r.ok).length;
    const missed = results.filter((r) => !r.ok).map((r) => byId.get(r.id)).filter((c): c is DeckCard => !!c);
    const uniqMissed = [...new Map(missed.map((c) => [c.id, c])).values()];
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    return (
      <div className="page">
        <PageHead title="Session terminée" sub={deck.name} onBack={onBack} />
        <div className="card stack center-text">
          <div className="big-number">
            {good} / {results.length}
          </div>
          <div className="muted">bonnes réponses · {formatDuration(seconds)}</div>
          {uniqMissed.length > 0 && (
            <div className="stack tight" style={{ textAlign: "left" }}>
              <div className="muted">À revoir :</div>
              <ul className="plain">
                {uniqMissed.map((c) => (
                  <li key={c.id} className="row between">
                    <Txt lang={lang}>{c.front}</Txt>
                    <span className="muted">{c.back}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="row center wrap">
            <button className="btn primary" onClick={() => begin()}>
              Recommencer
            </button>
            {uniqMissed.length > 0 && (
              <button className="btn" onClick={() => begin(uniqMissed)}>
                Revoir les ratées
              </button>
            )}
            <button className="btn" onClick={onBack}>
              Retour au paquet
            </button>
          </div>
        </div>
      </div>
    );
  }

  const item = queue[pos];
  const card = byId.get(item.id);
  const answer = async (ok: boolean) => {
    if (!card) return;
    const elapsed = (Date.now() - shownAt.current) / 1000;
    setResults((r) => [...r, { id: card.id, dir: item.dir, ok }]);
    const res: DeckResult = { cardId: card.id, dir: item.dir, ok };
    shownAt.current = Date.now();
    setPos((p) => p + 1);
    await recordDeckResults({ deckId: deck.id, lang, mode, results: [res], seconds: elapsed });
  };
  if (!card) return null;

  return (
    <div className="page study">
      <PageHead title={deck.name} sub={`${pos + 1} / ${queue.length} · ${MODE_INFO[mode].label} · ${dirLabel(lang, item.dir)}`} onBack={onBack} backLabel="Quitter la session" />
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={queue.length} aria-valuenow={pos}>
        <div className="bar" style={{ width: `${(pos / queue.length) * 100}%` }} />
      </div>
      {mode === "flip" && <FlipRunner key={pos} card={card} dir={item.dir} lang={lang} onAnswer={answer} />}
      {mode === "qcm" && <QcmRunner key={pos} card={card} dir={item.dir} lang={lang} all={all} onAnswer={answer} />}
      {mode === "write" && <WriteRunner key={pos} card={card} dir={item.dir} lang={lang} onAnswer={answer} />}
      <p className="muted small center-text">Ta progression est enregistrée à chaque carte : tu peux quitter quand tu veux.</p>
    </div>
  );
}

function PromptBlock({ card, dir, lang }: { card: DeckCard; dir: Dir; lang: Lang }) {
  const p = promptOf(card, dir);
  const l2 = dir === "to-fr";
  return (
    <div className="stack tight center-text">
      <div className="muted small">{l2 ? `Que veut dire ce mot (${L2_NAME[lang].toLowerCase()}) ?` : `Comment dit-on ça en ${L2_NAME[lang].toLowerCase()} ?`}</div>
      <div className="prompt-block">
        {l2 ? (
          <Txt lang={lang} className="prompt big-word">
            {p.text}
          </Txt>
        ) : (
          <span className="prompt">{p.text}</span>
        )}
        {l2 && <SpeakButton text={card.front} lang={lang} />}
      </div>
      {l2 && p.reading && p.reading !== p.text && <Txt lang={lang} className="muted">{p.reading}</Txt>}
    </div>
  );
}

function AnswerLine({ card, dir, lang }: { card: DeckCard; dir: Dir; lang: Lang }) {
  const l2 = dir === "from-fr";
  return (
    <div className="answer-line">
      <span className="muted small">Réponse : </span>
      <Txt lang={l2 ? lang : "en"} className="answer">
        {answerText(card, dir)}
      </Txt>
      {l2 && card.reading && card.reading !== card.front && <Txt lang={lang} className="muted"> ({card.reading})</Txt>}
      {l2 && <SpeakButton text={card.front} lang={lang} />}
    </div>
  );
}

function FlipRunner({ card, dir, lang, onAnswer }: { card: DeckCard; dir: Dir; lang: Lang; onAnswer: (ok: boolean) => void }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!flipped && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setFlipped(true);
      } else if (flipped && e.key === "1") onAnswer(false);
      else if (flipped && e.key === "2") onAnswer(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, onAnswer]);
  return (
    <div className="study-card card stack">
      <PromptBlock card={card} dir={dir} lang={lang} />
      {!flipped ? (
        <button className="btn primary big" onClick={() => setFlipped(true)}>
          Retourner la carte
        </button>
      ) : (
        <div className="feedback stack tight" aria-live="polite">
          <AnswerLine card={card} dir={dir} lang={lang} />
          <div className="muted small center-text">Tu la savais ?</div>
          <div className="grades two">
            <button className="btn grade g-again" onClick={() => onAnswer(false)}>
              À revoir
            </button>
            <button className="btn grade g-good" onClick={() => onAnswer(true)}>
              Je la savais
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QcmRunner({ card, dir, lang, all, onAnswer }: { card: DeckCard; dir: Dir; lang: Lang; all: DeckCard[]; onAnswer: (ok: boolean) => void }) {
  const q = useMemo(() => qcmChoices(card, dir, all), [card, dir, all]);
  const [chosen, setChosen] = useState<number | null>(null);
  const answered = chosen !== null;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!answered && n >= 1 && n <= q.options.length) setChosen(n - 1);
      else if (answered && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onAnswer(chosen === q.correct);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, chosen, q, onAnswer]);
  const optLang: Lang = dir === "from-fr" ? lang : "en";
  return (
    <div className="study-card card stack">
      <PromptBlock card={card} dir={dir} lang={lang} />
      <ul className="options" role="list">
        {q.options.map((o, i) => {
          const state = !answered ? "" : i === q.correct ? "right" : i === chosen ? "wrong" : "dim";
          return (
            <li key={i}>
              <button className={`option ${state}`} disabled={answered} onClick={() => setChosen(i)}>
                <span className="key">{i + 1}</span>
                <Txt lang={optLang}>{o}</Txt>
              </button>
            </li>
          );
        })}
      </ul>
      {answered && (
        <div className="feedback stack tight" aria-live="polite">
          <div className={`verdict ${chosen === q.correct ? "ok" : "ko"}`}>{chosen === q.correct ? "Bonne réponse !" : "Pas tout à fait."}</div>
          {chosen !== q.correct && <AnswerLine card={card} dir={dir} lang={lang} />}
          <button className="btn primary" onClick={() => onAnswer(chosen === q.correct)}>
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

function WriteRunner({ card, dir, lang, onAnswer }: { card: DeckCard; dir: Dir; lang: Lang; onAnswer: (ok: boolean) => void }) {
  const [typed, setTyped] = useState("");
  const [res, setRes] = useState<{ kind: "correct" | "almost" | "wrong"; gaveUp?: boolean } | null>(null);
  const [override, setOverride] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (res || !typed.trim()) return;
    setRes({ kind: checkTyped(card, dir, typed).result });
  };
  const ok = !!res && !res.gaveUp && (res.kind !== "wrong" || override);
  useEffect(() => {
    if (!res) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement !== inputRef.current) onAnswer(ok);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [res, ok, onAnswer]);
  const ja = dir === "from-fr" && lang === "ja";
  return (
    <div className="study-card card stack">
      <PromptBlock card={card} dir={dir} lang={lang} />
      {!res ? (
        <form onSubmit={submit} className="stack tight">
          <input
            ref={inputRef}
            className={`input big ${ja ? "ja" : ""}`}
            lang={ja ? "ja" : dir === "from-fr" ? "en" : "fr"}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={dir === "from-fr" ? (lang === "ja" ? "Écris en japonais (ou en romaji)" : "Écris en anglais") : "Écris en français"}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-label="Ta réponse"
          />
          <div className="row wrap">
            <button type="submit" className="btn primary grow" disabled={!typed.trim()}>
              Vérifier
            </button>
            <button type="button" className="btn ghost" onClick={() => setRes({ kind: "wrong", gaveUp: true })}>
              Je ne sais pas
            </button>
          </div>
        </form>
      ) : (
        <div className="feedback stack tight" aria-live="polite">
          <div className={`verdict ${ok ? "ok" : res.kind === "almost" ? "almost" : "ko"}`}>
            {res.gaveUp ? "On la revoit bientôt." : res.kind === "correct" ? "Bonne réponse !" : res.kind === "almost" ? "Presque : une faute de frappe." : override ? "Compté comme juste." : "Pas tout à fait."}
          </div>
          {(res.kind !== "correct" || res.gaveUp) && <AnswerLine card={card} dir={dir} lang={lang} />}
          {!res.gaveUp && res.kind === "wrong" && !override && <div className="muted small">Tu as écrit : {typed}</div>}
          <div className="row wrap">
            <button className="btn primary" onClick={() => onAnswer(ok)} autoFocus>
              Suivant
            </button>
            {!res.gaveUp && res.kind === "wrong" && !override && (
              <button className="btn small" onClick={() => setOverride(true)}>
                J'avais juste (autre traduction)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- jeu « Associer » ----------

const PENALTY_MS = 3000;

function fmtTime(ms: number): string {
  const s = Math.max(0, ms) / 1000;
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
}

function MatchGame({ lang, deck, onBack }: { lang: Lang; deck: Deck; onBack: () => void }) {
  const { snapshot, recordDeckResults } = useData();
  const all = useMemo(() => snapshot.deckCards.filter((c) => c.deckId === deck.id), [snapshot.deckCards, deck.id]);
  const [round, setRound] = useState(() => makeMatchRound(all, Date.now()));
  const [sel, setSel] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [bad, setBad] = useState<string[]>([]);
  const [wrongCards, setWrongCards] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [t0, setT0] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [final, setFinal] = useState<{ ms: number; record: boolean } | null>(null);
  const nbPairs = round.cards.length;

  useEffect(() => {
    if (t0 === null || final) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [t0, final]);

  const newRound = () => {
    setRound(makeMatchRound(snapshot.deckCards.filter((c) => c.deckId === deck.id), Date.now()));
    setSel(null);
    setDone(new Set());
    setBad([]);
    setWrongCards(new Set());
    setMistakes(0);
    setT0(null);
    setFinal(null);
  };

  const tap = (id: string) => {
    if (final || bad.length > 0) return;
    const tile = round.tiles.find((t) => t.id === id)!;
    if (done.has(tile.cardId)) return;
    const start = t0 ?? Date.now();
    if (t0 === null) {
      setT0(start);
      setNow(start);
    }
    if (sel === null) return setSel(id);
    if (sel === id) return setSel(null);
    const other = round.tiles.find((t) => t.id === sel)!;
    if (other.cardId === tile.cardId) {
      const nextDone = new Set(done).add(tile.cardId);
      setDone(nextDone);
      setSel(null);
      if (nextDone.size === nbPairs) {
        const elapsed = Date.now() - start;
        const ms = elapsed + mistakes * PENALTY_MS;
        const record = nbPairs === MATCH_PAIRS && (deck.bestMatchMs === undefined || ms < deck.bestMatchMs);
        setFinal({ ms, record });
        setNow(Date.now());
        const results: DeckResult[] = round.cards.flatMap((c) => (["to-fr", "from-fr"] as const).map((d) => ({ cardId: c.id, dir: d, ok: !wrongCards.has(c.id) })));
        void recordDeckResults({ deckId: deck.id, lang, mode: "match", results, seconds: elapsed / 1000, bestMatchMs: nbPairs === MATCH_PAIRS ? ms : undefined });
      }
    } else {
      setMistakes((m) => m + 1);
      setWrongCards((s) => new Set(s).add(tile.cardId).add(other.cardId));
      setBad([sel, id]);
      setSel(null);
      setTimeout(() => setBad([]), 450);
    }
  };

  if (nbPairs < MIN_MATCH_PAIRS) {
    return (
      <div className="page">
        <PageHead title={deck.name} onBack={onBack} />
        <EmptyState title="Pas assez de cartes">Il faut au moins {MIN_MATCH_PAIRS} cartes différentes pour jouer à Associer.</EmptyState>
      </div>
    );
  }

  const elapsed = t0 === null ? 0 : final ? final.ms - mistakes * PENALTY_MS : now - t0;
  return (
    <div className="page">
      <PageHead title="Associer" sub={deck.name} onBack={onBack} backLabel="Quitter le jeu" />
      <div className="row between">
        <div className="timer" aria-live="off">
          {fmtTime(elapsed + (final ? mistakes * PENALTY_MS : 0))}
        </div>
        <div className="muted small">
          {done.size} / {nbPairs} paires · {mistakes} erreur{mistakes > 1 ? "s" : ""}
          {deck.bestMatchMs !== undefined && <> · record {fmtTime(deck.bestMatchMs)}</>}
        </div>
      </div>
      <div className="match-grid" role="group" aria-label="Tuiles à associer">
        {round.tiles.map((t) => {
          const isDone = done.has(t.cardId);
          const cls = isDone ? "done" : bad.includes(t.id) ? "bad" : sel === t.id ? "sel" : "";
          return (
            <button key={t.id} className={`tile ${cls}`} disabled={isDone || !!final} aria-pressed={sel === t.id} onClick={() => tap(t.id)}>
              <Txt lang={t.side === "front" ? lang : "en"}>{t.text}</Txt>
            </button>
          );
        })}
      </div>
      {!final && <p className="muted small center-text">Touche un mot, puis sa traduction. Chaque erreur ajoute {PENALTY_MS / 1000} secondes.</p>}
      {final && (
        <div className="card stack center-text" aria-live="polite">
          <div className="big-number">{fmtTime(final.ms)}</div>
          <div className="muted">
            {mistakes === 0 ? "Sans aucune erreur !" : `${mistakes} erreur${mistakes > 1 ? "s" : ""} (+${(mistakes * PENALTY_MS) / 1000} s)`}
          </div>
          {final.record && <div className="verdict ok">Nouveau record !</div>}
          <div className="row center wrap">
            <button className="btn primary" onClick={newRound}>
              Nouvelle manche
            </button>
            <button className="btn" onClick={onBack}>
              Retour au paquet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- gérer les cartes (tous les paquets) ----------

export function CardsManager({ lang }: { lang: Lang }) {
  const { snapshot, deleteDeckCards } = useData();
  const [q, setQ] = useState("");
  const [deckId, setDeckId] = useState("all");
  const [editing, setEditing] = useState<DeckCard | null>(null);
  const [toDelete, setToDelete] = useState<DeckCard | null>(null);
  const decks = snapshot.decks.filter((d) => d.lang === lang);
  const names = new Map(decks.map((d) => [d.id, d.name]));
  const rows = snapshot.deckCards
    .filter((c) => c.lang === lang)
    .filter((c) => deckId === "all" || c.deckId === deckId)
    .filter((c) => !q.trim() || normalizeForSearch(`${c.front} ${c.reading ?? ""} ${c.back}`).includes(normalizeForSearch(q)))
    .sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div className="page">
      <PageHead title="Gérer les cartes" sub={`${LANG_INFO[lang].name} · toutes tes cartes, tous paquets confondus`} onBack={() => go(`#/${lang}`)} />
      <div className="toolbar">
        <input className="input" type="search" placeholder="Chercher une carte" aria-label="Chercher une carte" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: "1 1 200px" }} />
        <select className="select" aria-label="Paquet" value={deckId} onChange={(e) => setDeckId(e.target.value)}>
          <option value="all">Tous les paquets</option>
          {decks.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Aucune carte ici">
          Les cartes se créent dans un paquet : <a href={`#/${lang}/study`}>va dans Flashcards</a>.
        </EmptyState>
      ) : (
        <ul className="plain stack tight">
          {rows.slice(0, 300).map((c) => (
            <li key={c.id} className="row-item">
              <div className="grow">
                <div>
                  <Txt lang={lang} className="strong">
                    {c.front}
                  </Txt>
                  {c.reading && (
                    <Txt lang={lang} className="muted small">
                      {" "}
                      {c.reading}
                    </Txt>
                  )}{" "}
                  <span className="muted">→ {c.back}</span>
                </div>
                <div className="muted small">{names.get(c.deckId) ?? "?"}</div>
              </div>
              <button className="btn ghost icon" aria-label={`Modifier ${c.front}`} onClick={() => setEditing(c)}>
                <Icon name="edit" size={18} />
              </button>
              <button className="btn ghost icon" aria-label={`Supprimer ${c.front}`} onClick={() => setToDelete(c)}>
                <Icon name="trash" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {rows.length > 300 && <p className="muted small">Seules les 300 premières cartes sont affichées : utilise la recherche ou le filtre par paquet.</p>}
      {editing && <EditCardModal card={editing} lang={lang} onClose={() => setEditing(null)} />}
      {toDelete && (
        <ConfirmDialog
          title="Supprimer la carte ?"
          message={
            <>
              « {toDelete.front} » → « {toDelete.back} » sera supprimée.
            </>
          }
          confirmLabel="Supprimer"
          danger
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            await deleteDeckCards([toDelete.id]);
            setToDelete(null);
          }}
        />
      )}
    </div>
  );
}
