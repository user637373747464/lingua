// Outils pour le japonais : kana, kanji, romaji → hiragana.

const KATAKANA_START = 0x30a1; // ァ
const KATAKANA_END = 0x30f6; // ヶ

/** Katakana → hiragana (le reste est inchangé, « ー » aussi). */
export function toHiragana(input: string): string {
  let out = "";
  for (const ch of input) {
    const c = ch.codePointAt(0)!;
    out += c >= KATAKANA_START && c <= KATAKANA_END ? String.fromCodePoint(c - 0x60) : ch;
  }
  return out;
}

export function isKana(s: string): boolean {
  return s.length > 0 && /^[ぁ-ゖァ-ヺーゝゞヽヾ]+$/.test(s);
}

export function hasKanji(s: string): boolean {
  return /[一-鿿㐀-䶿]/.test(s);
}

export function hasJapanese(s: string): boolean {
  return /[぀-ヿ一-鿿㐀-䶿]/.test(s);
}

// --- romaji → hiragana (Hepburn + Kunrei usuels) ---

const ROMAJI: Record<string, string> = {
  a: "あ", i: "い", u: "う", e: "え", o: "お",
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  sa: "さ", shi: "し", si: "し", su: "す", se: "せ", so: "そ",
  za: "ざ", ji: "じ", zi: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  ta: "た", chi: "ち", ti: "ち", tsu: "つ", tu: "つ", te: "て", to: "と",
  da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  ha: "は", hi: "ひ", fu: "ふ", hu: "ふ", he: "へ", ho: "ほ",
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  ya: "や", yu: "ゆ", yo: "よ",
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  wa: "わ", wo: "を",
  kya: "きゃ", kyu: "きゅ", kyo: "きょ",
  gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",
  sha: "しゃ", shu: "しゅ", sho: "しょ", sya: "しゃ", syu: "しゅ", syo: "しょ",
  ja: "じゃ", ju: "じゅ", jo: "じょ", jya: "じゃ", jyu: "じゅ", jyo: "じょ",
  zya: "じゃ", zyu: "じゅ", zyo: "じょ",
  cha: "ちゃ", chu: "ちゅ", cho: "ちょ", tya: "ちゃ", tyu: "ちゅ", tyo: "ちょ",
  cya: "ちゃ", cyu: "ちゅ", cyo: "ちょ",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",
  bya: "びゃ", byu: "びゅ", byo: "びょ",
  pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ",
  mya: "みゃ", myu: "みゅ", myo: "みょ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",
  fa: "ふぁ", fi: "ふぃ", fe: "ふぇ", fo: "ふぉ",
  je: "じぇ", che: "ちぇ", she: "しぇ",
};

const LONG_VOWELS: Record<string, string> = { ā: "ああ", ī: "いい", ū: "うう", ē: "ええ", ō: "おう", â: "ああ", î: "いい", û: "うう", ê: "ええ", ô: "おう" };
const VOWELS = "aiueo";

/** Convertit du romaji en hiragana. Les caractères inconnus sont conservés tels quels. */
export function romajiToHiragana(input: string): string {
  const s = input.toLowerCase().normalize("NFC");
  let out = "";
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (LONG_VOWELS[ch]) {
      out += LONG_VOWELS[ch];
      i += 1;
      continue;
    }
    // consonne double (sauf « n ») → っ
    if (
      i + 1 < s.length &&
      ch === s[i + 1] &&
      /[a-z]/.test(ch) &&
      !VOWELS.includes(ch) &&
      ch !== "n"
    ) {
      out += "っ";
      i += 1;
      continue;
    }
    // « tch » (matcha) → っち
    if (ch === "t" && s.slice(i + 1, i + 3) === "ch") {
      out += "っ";
      i += 1;
      continue;
    }
    let matched = false;
    for (const len of [3, 2, 1]) {
      const chunk = s.slice(i, i + len);
      if (chunk.length === len && ROMAJI[chunk]) {
        out += ROMAJI[chunk];
        i += len;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    if (ch === "n") {
      // « n » seul : ん (et on avale l'apostrophe éventuelle : n'a → んあ)
      out += "ん";
      i += 1;
      if (s[i] === "'" || s[i] === "’") i += 1;
      continue;
    }
    if (ch === "-") {
      out += "ー";
      i += 1;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

/** Vrai si la chaîne ne contient que de l'ASCII « lettre/apostrophe/tiret/espace » (donc du romaji possible). */
export function looksLikeRomaji(s: string): boolean {
  return /^[a-zA-Zāīūēōâîûêô'’\- ]+$/.test(s.trim()) && s.trim().length > 0;
}
