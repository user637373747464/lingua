// Paquets de démarrage (facultatifs) : quelques mots courants pour essayer l'application tout de suite.
// Ils ne sont ajoutés que si l'utilisateur appuie sur le bouton ; il peut ensuite les modifier ou les supprimer.
// Aucune prononciation (IPA, accent tonal) n'est inventée : seules des lectures en kana, sûres, sont fournies.

import { Entry, Lang, Pos } from "../types";
import { uid } from "../ids";

interface StarterSense {
  pos: Pos;
  posDetail?: string;
  tr: string[];
  ex?: [string, string];
}

interface StarterWord {
  h: string; // forme principale
  r?: string; // lecture (kana)
  v?: string[]; // variantes d'écriture
  infl?: string[]; // formes utiles
  senses: StarterSense[];
  kanjiNote?: string;
  notes?: string;
}

const EN: StarterWord[] = [
  { h: "reluctant", senses: [{ pos: "adjective", tr: ["réticent", "peu enclin à"], ex: ["He was reluctant to admit that he had made a mistake.", "Il était réticent à admettre qu'il avait fait une erreur."] }], notes: "reluctant to + verbe ; l'adverbe est « reluctantly »." },
  { h: "thorough", senses: [{ pos: "adjective", tr: ["minutieux", "approfondi"], ex: ["The police carried out a thorough investigation.", "La police a mené une enquête approfondie."] }] },
  { h: "overwhelm", infl: ["overwhelms", "overwhelmed", "overwhelming"], senses: [{ pos: "verb", tr: ["submerger", "accabler"], ex: ["She was overwhelmed by the number of emails.", "Elle était submergée par le nombre d'e-mails."] }] },
  { h: "acknowledge", infl: ["acknowledges", "acknowledged", "acknowledging"], senses: [{ pos: "verb", tr: ["reconnaître (un fait)", "accuser réception de"], ex: ["He refused to acknowledge that he was wrong.", "Il a refusé de reconnaître qu'il avait tort."] }] },
  { h: "ubiquitous", senses: [{ pos: "adjective", tr: ["omniprésent"], ex: ["Smartphones have become ubiquitous in modern life.", "Les smartphones sont devenus omniprésents dans la vie moderne."] }] },
  { h: "mitigate", infl: ["mitigates", "mitigated", "mitigating"], senses: [{ pos: "verb", tr: ["atténuer", "limiter les effets de"], ex: ["New regulations aim to mitigate the effects of pollution.", "De nouvelles réglementations visent à atténuer les effets de la pollution."] }] },
  { h: "scrutiny", senses: [{ pos: "noun", tr: ["examen minutieux", "regard critique"], ex: ["The minister's decision came under intense scrutiny.", "La décision du ministre a fait l'objet d'un examen très minutieux."] }] },
  { h: "nuance", senses: [{ pos: "noun", tr: ["nuance"], ex: ["The translation missed an important nuance.", "La traduction a manqué une nuance importante."] }] },
  { h: "albeit", senses: [{ pos: "conjunction", tr: ["bien que", "quoique"], ex: ["She accepted the offer, albeit reluctantly.", "Elle a accepté l'offre, quoique de mauvaise grâce."] }], notes: "Registre soutenu ; s'utilise devant un adjectif, un adverbe ou un groupe court." },
  { h: "hence", senses: [{ pos: "adverb", tr: ["d'où", "par conséquent"], ex: ["The road was closed, hence the delay.", "La route était fermée, d'où le retard."] }] },
  { h: "cope with", infl: ["copes with", "coped with", "coping with"], senses: [{ pos: "expression", tr: ["faire face à", "gérer"], ex: ["It's hard to cope with so much stress.", "Il est difficile de gérer autant de stress."] }] },
  { h: "look forward to", infl: ["looks forward to", "looked forward to", "looking forward to"], senses: [{ pos: "expression", tr: ["avoir hâte de"], ex: ["I'm looking forward to seeing you again.", "J'ai hâte de te revoir."] }], notes: "« to » est une préposition : on dit « look forward to seeing », pas « to see »." },
  { h: "get along with", infl: ["gets along with", "got along with", "getting along with"], senses: [{ pos: "expression", tr: ["s'entendre avec"], ex: ["She gets along with all her colleagues.", "Elle s'entend bien avec tous ses collègues."] }] },
  { h: "rely on", infl: ["relies on", "relied on", "relying on"], senses: [{ pos: "verb", tr: ["compter sur", "dépendre de"], ex: ["You can rely on me.", "Tu peux compter sur moi."] }] },
  { h: "awkward", senses: [{ pos: "adjective", tr: ["gênant", "maladroit"], ex: ["There was an awkward silence after his comment.", "Il y a eu un silence gênant après son commentaire."] }] },
  { h: "genuine", senses: [{ pos: "adjective", tr: ["authentique", "sincère"], ex: ["She showed genuine concern for his health.", "Elle s'est montrée sincèrement inquiète pour sa santé."] }] },
  { h: "drawback", senses: [{ pos: "noun", tr: ["inconvénient"], ex: ["The main drawback of this plan is its cost.", "Le principal inconvénient de ce plan est son coût."] }] },
  { h: "thrive", infl: ["thrives", "thrived", "thriving"], senses: [{ pos: "verb", tr: ["prospérer", "s'épanouir"], ex: ["Plants thrive in warm, humid conditions.", "Les plantes prospèrent dans des conditions chaudes et humides."] }] },
  { h: "whereas", senses: [{ pos: "conjunction", tr: ["alors que"], ex: ["He loves sports, whereas his brother prefers reading.", "Il adore le sport, alors que son frère préfère lire."] }] },
  { h: "outcome", senses: [{ pos: "noun", tr: ["résultat", "issue"], ex: ["We are satisfied with the outcome of the meeting.", "Nous sommes satisfaits de l'issue de la réunion."] }] },
];

const GODAN = "verbe godan (u)";
const ICHIDAN = "verbe ichidan (ru)";
const IRREG = "verbe irrégulier (する / 来る)";
const ADJ_I = "adjectif en い";
const ADJ_NA = "adjectif en な";

const JA: StarterWord[] = [
  { h: "食べる", r: "たべる", infl: ["食べます", "食べない", "食べた", "食べて"], senses: [{ pos: "verb", posDetail: ICHIDAN, tr: ["manger"], ex: ["毎日、朝ご飯を食べます。", "Je prends le petit-déjeuner tous les jours."] }] },
  { h: "飲む", r: "のむ", infl: ["飲みます", "飲まない", "飲んだ", "飲んで"], senses: [{ pos: "verb", posDetail: GODAN, tr: ["boire"], ex: ["水をたくさん飲みます。", "Je bois beaucoup d'eau."] }] },
  { h: "行く", r: "いく", infl: ["行きます", "行かない", "行った", "行って"], senses: [{ pos: "verb", posDetail: GODAN, tr: ["aller"], ex: ["明日、学校に行きます。", "Demain, je vais à l'école."] }], notes: "Exception : la forme en て est 行って (pas 行いて)." },
  { h: "来る", r: "くる", infl: ["来ます", "来ない", "来た", "来て"], senses: [{ pos: "verb", posDetail: IRREG, tr: ["venir"], ex: ["友達が家に来ます。", "Un ami vient à la maison."] }], notes: "Irrégulier : きます, こない, きた, きて.", kanjiNote: "来 : く (来る), き (来ます, 来た), こ (来ない)." },
  { h: "見る", r: "みる", infl: ["見ます", "見ない", "見た", "見て"], senses: [{ pos: "verb", posDetail: ICHIDAN, tr: ["voir", "regarder"], ex: ["夜、テレビを見ます。", "Le soir, je regarde la télévision."] }] },
  { h: "読む", r: "よむ", infl: ["読みます", "読まない", "読んだ", "読んで"], senses: [{ pos: "verb", posDetail: GODAN, tr: ["lire"], ex: ["毎晩、本を読みます。", "Je lis un livre chaque soir."] }] },
  { h: "書く", r: "かく", infl: ["書きます", "書かない", "書いた", "書いて"], senses: [{ pos: "verb", posDetail: GODAN, tr: ["écrire"], ex: ["友達に手紙を書きます。", "J'écris une lettre à un ami."] }] },
  { h: "話す", r: "はなす", infl: ["話します", "話さない", "話した", "話して"], senses: [{ pos: "verb", posDetail: GODAN, tr: ["parler"], ex: ["日本語で話してください。", "Parlez en japonais, s'il vous plaît."] }] },
  { h: "買う", r: "かう", infl: ["買います", "買わない", "買った", "買って"], senses: [{ pos: "verb", posDetail: GODAN, tr: ["acheter"], ex: ["新しい本を買いました。", "J'ai acheté un nouveau livre."] }] },
  { h: "水", r: "みず", senses: [{ pos: "noun", tr: ["eau"], ex: ["冷たい水をください。", "Donnez-moi de l'eau froide, s'il vous plaît."] }] },
  { h: "学校", r: "がっこう", senses: [{ pos: "noun", tr: ["école"], ex: ["学校は九時に始まります。", "L'école commence à neuf heures."] }] },
  { h: "先生", r: "せんせい", senses: [{ pos: "noun", tr: ["professeur", "maître"], ex: ["先生はとても親切です。", "Le professeur est très gentil."] }] },
  { h: "友達", r: "ともだち", senses: [{ pos: "noun", tr: ["ami(e)"], ex: ["友達と映画を見ました。", "J'ai regardé un film avec un ami."] }] },
  { h: "本", r: "ほん", senses: [{ pos: "noun", tr: ["livre"], ex: ["この本はおもしろいです。", "Ce livre est intéressant."] }] },
  { h: "時間", r: "じかん", senses: [{ pos: "noun", tr: ["temps (durée)", "heure"], ex: ["今日は時間がありません。", "Aujourd'hui, je n'ai pas le temps."] }] },
  { h: "天気", r: "てんき", senses: [{ pos: "noun", tr: ["temps (météo)"], ex: ["今日はいい天気ですね。", "Il fait beau aujourd'hui, n'est-ce pas ?"] }] },
  { h: "大きい", r: "おおきい", senses: [{ pos: "adjective", posDetail: ADJ_I, tr: ["grand"], ex: ["大きい犬が好きです。", "J'aime les grands chiens."] }] },
  { h: "小さい", r: "ちいさい", senses: [{ pos: "adjective", posDetail: ADJ_I, tr: ["petit"], ex: ["小さい部屋ですが、静かです。", "C'est une petite pièce, mais elle est calme."] }] },
  { h: "新しい", r: "あたらしい", senses: [{ pos: "adjective", posDetail: ADJ_I, tr: ["nouveau", "neuf"], ex: ["新しい車を買いました。", "J'ai acheté une nouvelle voiture."] }] },
  {
    h: "高い", r: "たかい",
    senses: [
      { pos: "adjective", posDetail: ADJ_I, tr: ["haut", "grand (taille)"], ex: ["あの山は高いです。", "Cette montagne est haute."] },
      { pos: "adjective", posDetail: ADJ_I, tr: ["cher"], ex: ["この時計は高すぎます。", "Cette montre est trop chère."] },
    ],
  },
  { h: "きれい", r: "きれい", v: ["綺麗"], senses: [{ pos: "adjective", posDetail: ADJ_NA, tr: ["joli", "propre"], ex: ["この町はきれいです。", "Cette ville est jolie et propre."] }], notes: "Adjectif en な malgré sa finale en い : きれいな町, きれいじゃない." },
  { h: "毎日", r: "まいにち", senses: [{ pos: "adverb", tr: ["tous les jours"], ex: ["毎日、日本語を勉強します。", "J'étudie le japonais tous les jours."] }] },
  { h: "今日", r: "きょう", senses: [{ pos: "noun", tr: ["aujourd'hui"], ex: ["今日は日曜日です。", "Aujourd'hui, c'est dimanche."] }] },
  { h: "明日", r: "あした", senses: [{ pos: "noun", tr: ["demain"], ex: ["明日は雨が降ります。", "Demain, il pleuvra."] }], kanjiNote: "あした (courant) ou あす (plus soutenu)." },
  { h: "一緒に", r: "いっしょに", senses: [{ pos: "adverb", tr: ["ensemble"], ex: ["一緒に昼ご飯を食べませんか。", "Voulez-vous déjeuner ensemble ?"] }] },
  { h: "ありがとう", r: "ありがとう", v: ["有難う"], senses: [{ pos: "interjection", tr: ["merci"], ex: ["手伝ってくれて、ありがとう。", "Merci de m'avoir aidé."] }] },
  { h: "すみません", r: "すみません", senses: [{ pos: "interjection", tr: ["excusez-moi", "pardon"], ex: ["すみません、駅はどこですか。", "Excusez-moi, où est la gare ?"] }] },
];

export const STARTER_COUNT: Record<Lang, number> = { en: EN.length, ja: JA.length };

export function buildStarterEntries(lang: Lang, now: number): Entry[] {
  const list = lang === "en" ? EN : JA;
  return list.map((w) => ({
    id: uid("entry"),
    lang,
    headword: w.h,
    variants: w.v ?? [],
    inflections: w.infl ?? [],
    reading: w.r,
    readingsNote: w.kanjiNote,
    senses: w.senses.map((s) => ({
      id: uid("sense"),
      pos: s.pos,
      posDetail: s.posDetail,
      translations: s.tr,
      examples: s.ex ? [{ id: uid("ex"), text: s.ex[0], translation: s.ex[1] }] : [],
    })),
    notes: w.notes,
    source: { kind: "starter" as const },
    createdAt: now,
    updatedAt: now,
  }));
}
