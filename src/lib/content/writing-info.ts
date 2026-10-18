// Informations affichées autour des caractères à écrire : romaji des kana, sens et lectures des kanji.
// (Contenu écrit pour Lingua ; les TRACÉS, eux, viennent de KanjiVG — voir strokes.ts.)

const H =
  "あ:a い:i う:u え:e お:o か:ka き:ki く:ku け:ke こ:ko さ:sa し:shi す:su せ:se そ:so た:ta ち:chi つ:tsu て:te と:to " +
  "な:na に:ni ぬ:nu ね:ne の:no は:ha ひ:hi ふ:fu へ:he ほ:ho ま:ma み:mi む:mu め:me も:mo や:ya ゆ:yu よ:yo " +
  "ら:ra り:ri る:ru れ:re ろ:ro わ:wa を:wo ん:n が:ga ぎ:gi ぐ:gu げ:ge ご:go ざ:za じ:ji ず:zu ぜ:ze ぞ:zo " +
  "だ:da ぢ:ji づ:zu で:de ど:do ば:ba び:bi ぶ:bu べ:be ぼ:bo ぱ:pa ぴ:pi ぷ:pu ぺ:pe ぽ:po " +
  "ゃ:ya(petit) ゅ:yu(petit) ょ:yo(petit) っ:tsu(petit)";

const ROMAJI: Record<string, string> = {};
for (const pair of H.split(" ")) {
  const [k, r] = pair.split(":");
  ROMAJI[k] = r;
  // le katakana correspond au hiragana, décalé de 0x60 dans Unicode
  ROMAJI[String.fromCodePoint(k.codePointAt(0)! + 0x60)] = r;
}
ROMAJI["ー"] = "ī (voyelle longue)";

/** Prononciation en lettres latines d'un kana ("あ" → "a"), ou chaîne vide si inconnu. */
export function kanaRomaji(ch: string): string {
  return ROMAJI[ch] ?? "";
}

export function kanaKind(ch: string): "hiragana" | "katakana" | null {
  const c = ch.codePointAt(0)!;
  if (c >= 0x3041 && c <= 0x3096) return "hiragana";
  if ((c >= 0x30a1 && c <= 0x30fa) || c === 0x30fc) return "katakana";
  return null;
}

export interface KanjiInfo {
  /** sens en français */
  fr: string;
  /** lectures principales : on'yomi (katakana) / kun'yomi (hiragana) */
  read: string;
}

const K =
  "日|jour, soleil|ニチ・ジツ / ひ・か;一|un|イチ / ひと(つ);国|pays|コク / くに;人|personne|ジン・ニン / ひと;年|année|ネン / とし;" +
  "大|grand|ダイ・タイ / おお(きい);十|dix|ジュウ / とお;二|deux|ニ / ふた(つ);本|livre, origine|ホン / もと;中|milieu, dans|チュウ / なか;" +
  "長|long, chef|チョウ / なが(い);出|sortir|シュツ / で(る)・だ(す);三|trois|サン / みっ(つ);時|heure, moment|ジ / とき;行|aller|コウ / い(く);" +
  "見|voir|ケン / み(る);月|lune, mois|ゲツ・ガツ / つき;分|minute, partager|ブン・フン / わ(ける);後|après, derrière|ゴ / あと・うし(ろ);" +
  "前|avant, devant|ゼン / まえ;生|vie, naître|セイ・ショウ / い(きる)・う(まれる);五|cinq|ゴ / いつ(つ);間|intervalle, entre|カン / あいだ・ま;" +
  "上|haut, dessus|ジョウ / うえ・あ(がる);東|est|トウ / ひがし;四|quatre|シ / よん・よっ(つ);今|maintenant|コン / いま;金|or, argent, métal|キン / かね;" +
  "九|neuf|キュウ・ク / ここの(つ);入|entrer|ニュウ / はい(る)・い(れる);学|étudier|ガク / まな(ぶ);高|haut, cher|コウ / たか(い);" +
  "円|yen, cercle|エン / まる(い);子|enfant|シ / こ;外|dehors|ガイ / そと;八|huit|ハチ / やっ(つ);六|six|ロク / むっ(つ);" +
  "下|bas, dessous|カ・ゲ / した・さ(がる);来|venir|ライ / く(る);気|esprit, énergie|キ・ケ;小|petit|ショウ / ちい(さい);七|sept|シチ / なな(つ);" +
  "山|montagne|サン / やま;話|parler, récit|ワ / はな(す);女|femme|ジョ / おんな;北|nord|ホク / きた;午|midi|ゴ;百|cent|ヒャク;" +
  "書|écrire|ショ / か(く);先|devant, précédent|セン / さき;名|nom|メイ / な;川|rivière|セン / かわ;千|mille|セン / ち;水|eau|スイ / みず;" +
  "半|moitié|ハン / なか(ば);男|homme|ダン / おとこ;西|ouest|セイ / にし;電|électricité|デン;校|école|コウ;語|langue, mot|ゴ / かた(る);" +
  "土|terre, sol|ド / つち;木|arbre, bois|モク / き;聞|entendre, écouter|ブン / き(く);食|manger|ショク / た(べる);車|voiture|シャ / くるま;" +
  "何|quoi|カ / なに・なん;南|sud|ナン / みなみ;万|dix mille|マン;毎|chaque|マイ;白|blanc|ハク / しろ(い);天|ciel|テン;母|mère|ボ / はは;" +
  "火|feu|カ / ひ;右|droite|ウ・ユウ / みぎ;読|lire|ドク / よ(む);友|ami|ユウ / とも;左|gauche|サ / ひだり;休|se reposer|キュウ / やす(む);" +
  "父|père|フ / ちち;雨|pluie|ウ / あめ";

export const KANJI_INFO: Record<string, KanjiInfo> = {};
for (const item of K.split(";")) {
  const [ch, fr, read] = item.split("|");
  KANJI_INFO[ch] = { fr, read: read ?? "" };
}

/** Consigne affichée au-dessus de la zone de dessin : ce qu'il faut écrire, sans montrer le caractère. */
export function promptFor(ch: string): string {
  const k = KANJI_INFO[ch];
  if (k) return `${k.fr}${k.read ? ` — ${k.read}` : ""}`;
  return kanaRomaji(ch);
}
