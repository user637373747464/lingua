import type { Lesson } from "../lessons";

const T1 = "Bases";
const T2 = "Verbes et adjectifs";
const T3 = "Structures";
const T4 = "Référence";

export const LESSONS_JA: Lesson[] = [
  {
    id: "ja-desu", lang: "ja", topic: T1, level: "N5", title: "です, は et les phrases simples",
    summary: "« A est B » : l'ordre des mots japonais.",
    blocks: [
      { t: "p", text: "Le verbe est toujours à la **fin** de la phrase. **は** (lu « wa ») marque le thème dont on parle ; **です** est la forme polie de « être »." },
      { t: "table", head: ["", "Poli", "Neutre"], rows: [
        ["Affirmatif", "学生です。", "学生だ。"],
        ["Négatif", "学生ではありません。 / 学生じゃありません。", "学生ではない。 / 学生じゃない。"],
        ["Passé", "学生でした。", "学生だった。"],
        ["Question", "学生ですか。", "学生？"],
      ] },
      { t: "ex", items: [
        { text: "私は学生です。", reading: "わたしはがくせいです。", tr: "Je suis étudiant(e)." },
        { text: "これは本ではありません。", reading: "これはほんではありません。", tr: "Ceci n'est pas un livre." },
        { text: "田中さんは先生ですか。", reading: "たなかさんはせんせいですか。", tr: "M. Tanaka est-il professeur ?" },
      ] },
      { t: "tip", text: "Pour poser une question polie, il suffit d'ajouter か à la fin, sans point d'interrogation obligatoire. Le sujet est souvent omis quand le contexte est clair." },
    ],
  },
  {
    id: "ja-particles", lang: "ja", topic: T1, level: "N5", title: "Les particules essentielles",
    summary: "は が を に で へ の と も から まで や か.",
    blocks: [
      { t: "p", text: "Les particules se placent **après** le mot qu'elles marquent. Elles remplacent nos prépositions et indiquent le rôle de chaque mot." },
      { t: "table", head: ["Particule", "Rôle", "Exemple"], rows: [
        ["は (wa)", "thème (« quant à… »)", "私は学生です。"],
        ["が", "sujet (information nouvelle, ou avec un verbe d'état comme ある、好き)", "猫がいます。"],
        ["を (o)", "complément d'objet", "水を飲みます。"],
        ["に", "destination, moment précis, personne qui reçoit, lieu d'existence", "学校に行きます。 / 七時に起きます。"],
        ["で", "lieu où se passe l'action, moyen", "図書館で勉強します。 / バスで行きます。"],
        ["へ (e)", "direction", "日本へ行きます。"],
        ["の", "possession, lien entre deux noms", "私の本"],
        ["と", "« avec », « et » entre noms", "友達と行きます。"],
        ["も", "« aussi » (remplace は / が / を)", "私も学生です。"],
        ["から / まで", "depuis / jusqu'à", "九時から五時まで"],
        ["や", "« et » (liste non exhaustive)", "りんごやバナナ"],
        ["か", "question", "行きますか。"],
      ] },
      { t: "warn", text: "に et で : « 学校**で**勉強する » (j'étudie à l'école : lieu d'une action) mais « 学校**に**いる » (je suis à l'école : existence)." },
      { t: "ex", items: [
        { text: "毎日、図書館で本を読みます。", reading: "まいにち、としょかんでほんをよみます。", tr: "Tous les jours, je lis des livres à la bibliothèque." },
        { text: "友達と映画を見ました。", reading: "ともだちとえいがをみました。", tr: "J'ai regardé un film avec un ami." },
      ] },
    ],
  },
  {
    id: "ja-verb-groups", lang: "ja", topic: T2, level: "N5", title: "Groupes de verbes et forme en ます",
    summary: "Les trois groupes, et comment parler poliment.",
    blocks: [
      { t: "table", head: ["Groupe", "Reconnaître", "Forme en ます (poli)"], rows: [
        ["1 (godan)", "la plupart des verbes ; finale en う、く、ぐ、す、つ、ぬ、ぶ、む、る", "la dernière syllabe passe à la ligne い : 書く → 書きます, 飲む → 飲みます"],
        ["2 (ichidan)", "finale え + る ou い + る (en général)", "on enlève る : 食べる → 食べます, 見る → 見ます"],
        ["3 (irréguliers)", "する, 来る (くる)", "します, 来ます (きます)"],
      ] },
      { t: "table", head: ["", "Poli", "Exemple (食べる)"], rows: [
        ["Présent / futur", "〜ます", "食べます"],
        ["Négatif", "〜ません", "食べません"],
        ["Passé", "〜ました", "食べました"],
        ["Passé négatif", "〜ませんでした", "食べませんでした"],
        ["Invitation", "〜ましょう / 〜ませんか", "食べましょう / 食べませんか"],
      ] },
      { t: "warn", text: "Exceptions : certains verbes finissant par える ou いる sont du groupe 1 : 帰る (かえる), 入る (はいる), 走る (はしる), 知る (しる), 切る (きる), 要る (いる). Il faut les apprendre." },
      { t: "ex", items: [
        { text: "毎朝パンを食べます。", reading: "まいあさパンをたべます。", tr: "Je mange du pain chaque matin." },
        { text: "昨日は学校に行きませんでした。", reading: "きのうはがっこうにいきませんでした。", tr: "Hier, je ne suis pas allé à l'école." },
      ] },
    ],
  },
  {
    id: "ja-te-form", lang: "ja", topic: T2, level: "N5", title: "La forme en て",
    summary: "Formation, et ses nombreux usages.",
    blocks: [
      { t: "table", head: ["Finale (groupe 1)", "→ て / で", "Exemple"], rows: [
        ["う・つ・る", "って", "買う → 買って, 待つ → 待って, 帰る → 帰って"],
        ["む・ぶ・ぬ", "んで", "飲む → 飲んで, 遊ぶ → 遊んで, 死ぬ → 死んで"],
        ["く", "いて", "書く → 書いて"],
        ["ぐ", "いで", "泳ぐ → 泳いで"],
        ["す", "して", "話す → 話して"],
        ["Groupe 2", "る → て", "食べる → 食べて, 見る → 見て"],
        ["Groupe 3", "—", "する → して, 来る → 来て (きて)"],
      ] },
      { t: "warn", text: "Exception à retenir : 行く (いく) → 行って (et non 行いて)." },
      { t: "table", head: ["Structure", "Sens", "Exemple"], rows: [
        ["〜てください", "s'il vous plaît, fais…", "ここに書いてください。"],
        ["〜ている", "action en cours, ou état résultant", "食べています。 / 結婚しています。"],
        ["〜てもいい", "on peut, c'est permis", "入ってもいいです。"],
        ["〜てはいけない", "il est interdit de", "ここで食べてはいけません。"],
        ["〜て、〜", "enchaîner des actions", "起きて、顔を洗って、朝ご飯を食べます。"],
      ] },
    ],
  },
  {
    id: "ja-nai-ta", lang: "ja", topic: T2, level: "N5", title: "Formes neutres : ない et た",
    summary: "Négatif et passé neutres.",
    blocks: [
      { t: "table", head: ["Groupe", "Négatif neutre (〜ない)", "Passé neutre (〜た)"], rows: [
        ["1", "dernière syllabe → ligne あ + ない : 書く → 書かない, 飲む → 飲まない, 話す → 話さない", "comme la forme en て, avec て → た et で → だ : 書いた, 飲んだ, 話した"],
        ["2", "る → ない : 食べる → 食べない", "る → た : 食べた"],
        ["3", "する → しない ; 来る → 来ない (こない)", "した ; 来た (きた)"],
      ] },
      { t: "warn", text: "Verbes en う : le う devient わ → 買う → 買わない (pas 買あない). Le verbe ある (il y a) fait ない au négatif : « ない », pas « あらない »." },
      { t: "table", head: ["", "Poli", "Neutre"], rows: [
        ["Présent", "食べます", "食べる"],
        ["Négatif", "食べません", "食べない"],
        ["Passé", "食べました", "食べた"],
        ["Passé négatif", "食べませんでした", "食べなかった"],
      ] },
      { t: "tip", text: "La forme neutre (ou « du dictionnaire ») s'emploie entre amis, dans les phrases subordonnées et devant と思います, ことができます, 前に, etc." },
    ],
  },
  {
    id: "ja-adjectives", lang: "ja", topic: T2, level: "N5", title: "Adjectifs en い et en な",
    summary: "Deux familles, deux façons de se conjuguer.",
    blocks: [
      { t: "table", head: ["", "Adjectif en い (高い, cher/haut)", "Adjectif en な (静か, calme)"], rows: [
        ["Devant un nom", "高い本", "静かな町"],
        ["Présent neutre", "高い", "静かだ"],
        ["Présent poli", "高いです", "静かです"],
        ["Négatif", "高くない", "静かではない / 静かじゃない"],
        ["Passé", "高かった", "静かだった"],
        ["Passé négatif", "高くなかった", "静かではなかった"],
        ["Liaison (et)", "高くて", "静かで"],
        ["Adverbe", "高く", "静かに"],
      ] },
      { t: "warn", text: "いい (bon) est irrégulier : négatif よくない, passé よかった, adverbe よく. Certains adjectifs en な finissent par い : きれい (beau, propre), 嫌い (きらい) → きれいな花." },
      { t: "ex", items: [
        { text: "この部屋は広くないです。", reading: "このへやはひろくないです。", tr: "Cette pièce n'est pas grande." },
        { text: "昨日は天気がよかったです。", reading: "きのうはてんきがよかったです。", tr: "Hier, il faisait beau." },
      ] },
    ],
  },
  {
    id: "ja-demonstratives", lang: "ja", topic: T1, level: "N5", title: "Ceci, cela, là-bas : こ・そ・あ・ど",
    summary: "Les démonstratifs et mots interrogatifs.",
    blocks: [
      { t: "table", head: ["", "こ (près de moi)", "そ (près de toi)", "あ (loin des deux)", "ど (quel ?)"], rows: [
        ["chose", "これ", "それ", "あれ", "どれ"],
        ["… + nom", "この", "その", "あの", "どの"],
        ["lieu", "ここ", "そこ", "あそこ", "どこ"],
        ["direction (poli)", "こちら", "そちら", "あちら", "どちら"],
        ["sorte de", "こんな", "そんな", "あんな", "どんな"],
      ] },
      { t: "ex", items: [
        { text: "これは何ですか。", reading: "これはなんですか。", tr: "Qu'est-ce que c'est ?" },
        { text: "トイレはどこですか。", reading: "トイレはどこですか。", tr: "Où sont les toilettes ?" },
      ] },
    ],
  },
  {
    id: "ja-existence", lang: "ja", topic: T3, level: "N5", title: "Il y a : あります et います",
    summary: "Exister, être situé.",
    blocks: [
      { t: "list", items: [
        "**ある / あります** : choses, plantes, événements (inanimé).",
        "**いる / います** : personnes et animaux (animé).",
        "Structure : **lieu に + chose が + あります**. Pour dire où est un objet connu : **chose は + lieu に + あります**.",
      ] },
      { t: "ex", items: [
        { text: "机の上に本があります。", reading: "つくえのうえにほんがあります。", tr: "Il y a un livre sur le bureau." },
        { text: "公園に子どもがいます。", reading: "こうえんにこどもがいます。", tr: "Il y a des enfants dans le parc." },
        { text: "駅は銀行の隣にあります。", reading: "えきはぎんこうのとなりにあります。", tr: "La gare est à côté de la banque." },
      ] },
      { t: "table", head: ["Mot de lieu", "Sens"], rows: [
        ["上 (うえ)", "dessus"], ["下 (した)", "dessous"], ["中 (なか)", "dedans"], ["前 (まえ)", "devant"],
        ["後ろ (うしろ)", "derrière"], ["隣 (となり)", "à côté (voisin)"], ["近く (ちかく)", "près de"],
      ] },
    ],
  },
  {
    id: "ja-requests", lang: "ja", topic: T3, level: "N5", title: "Vouloir, demander, proposer",
    summary: "〜たい, 〜てください, 〜ましょう, 〜ませんか.",
    blocks: [
      { t: "table", head: ["Structure", "Sens", "Exemple"], rows: [
        ["radical ます + たい", "vouloir faire (se conjugue comme un adjectif en い)", "水が飲みたいです。"],
        ["〜たくない", "ne pas vouloir", "行きたくないです。"],
        ["〜てください", "demande polie", "待ってください。"],
        ["〜ましょう", "proposition « faisons… »", "行きましょう。"],
        ["〜ませんか", "invitation « voulez-vous… ? »", "一緒に食べませんか。"],
        ["〜てもいいですか", "demander la permission", "入ってもいいですか。"],
      ] },
      { t: "tip", text: "Avec たい, le complément peut prendre を ou が : 水を飲みたい / 水が飲みたい. Pour parler d'une troisième personne, on utilise たがっている." },
    ],
  },
  {
    id: "ja-reasons", lang: "ja", topic: T3, level: "N4", title: "Cause et opposition : から, ので, けど",
    summary: "Relier deux idées.",
    blocks: [
      { t: "table", head: ["Mot", "Sens", "Exemple"], rows: [
        ["から", "parce que (la cause se place AVANT から)", "雨だから、行きません。"],
        ["ので", "parce que (plus doux, plus poli)", "雨なので、行きません。"],
        ["けど / が", "mais (が est plus formel)", "高いけど、買います。"],
        ["でも", "mais, cependant (début de phrase)", "でも、おいしいです。"],
        ["〜て (cause)", "à cause de, et donc", "忙しくて、行けませんでした。"],
      ] },
      { t: "warn", text: "Avant ので, un nom ou un adjectif en な prend な : 雨**な**ので, 静か**な**ので. Avec から, on met だ (neutre) ou です : 雨だから." },
    ],
  },
  {
    id: "ja-numbers", lang: "ja", topic: T4, level: "N5", title: "Nombres et compteurs",
    summary: "Compter, les compteurs courants et leurs pièges.",
    blocks: [
      { t: "table", head: ["1 一 いち", "2 二 に", "3 三 さん", "4 四 し / よん", "5 五 ご"], rows: [
        ["6 六 ろく", "7 七 しち / なな", "8 八 はち", "9 九 きゅう / く", "10 十 じゅう"],
        ["100 百 ひゃく", "1 000 千 せん", "10 000 万 まん", "0 零 れい / ゼロ", ""],
      ] },
      { t: "table", head: ["Compteur", "Pour", "Exemples"], rows: [
        ["〜つ", "objets quelconques (jusqu'à 10)", "ひとつ、ふたつ、みっつ、よっつ、いつつ"],
        ["〜人 (にん)", "personnes", "ひとり、ふたり、さんにん、よにん"],
        ["〜枚 (まい)", "objets plats : papier, assiette", "いちまい、にまい"],
        ["〜本 (ほん)", "objets longs : stylo, bouteille", "いっぽん、にほん、さんぼん"],
        ["〜個 (こ)", "petits objets", "いっこ、にこ"],
        ["〜冊 (さつ)", "livres", "いっさつ、にさつ"],
        ["〜匹 (ひき)", "petits animaux", "いっぴき、にひき、さんびき"],
        ["〜台 (だい)", "machines, voitures", "いちだい、にだい"],
      ] },
      { t: "warn", text: "Les sons changent : 一本 = いっぽん, 三本 = さんぼん, 六本 = ろっぽん. 一人 = ひとり et 二人 = ふたり sont irréguliers. L'ordre est : nom + を + nombre + compteur + verbe (りんごを三つ買いました)." },
    ],
  },
  {
    id: "ja-time", lang: "ja", topic: T4, level: "N5", title: "Dire l'heure, les jours et les dates",
    summary: "Heures, minutes, jours de la semaine, mots de temps.",
    blocks: [
      { t: "table", head: ["Heure", "Lecture"], rows: [
        ["1時", "いちじ"], ["4時", "よじ (pas しじ)"], ["7時", "しちじ"], ["9時", "くじ (pas きゅうじ)"], ["12時", "じゅうにじ"], ["半 (demi)", "はん : 3時半 = さんじはん"],
      ] },
      { t: "table", head: ["Minutes", "Lecture"], rows: [
        ["1分", "いっぷん"], ["2分", "にふん"], ["3分", "さんぷん"], ["4分", "よんぷん"], ["5分", "ごふん"], ["6分", "ろっぷん"], ["8分", "はっぷん"], ["10分", "じゅっぷん"],
      ] },
      { t: "table", head: ["Jour", "Lecture", "Jour", "Lecture"], rows: [
        ["月曜日", "げつようび", "金曜日", "きんようび"],
        ["火曜日", "かようび", "土曜日", "どようび"],
        ["水曜日", "すいようび", "日曜日", "にちようび"],
        ["木曜日", "もくようび", "何曜日", "なんようび (quel jour ?)"],
      ] },
      { t: "table", head: ["Mot", "Lecture", "Sens"], rows: [
        ["今日", "きょう", "aujourd'hui"], ["明日", "あした", "demain"], ["昨日", "きのう", "hier"],
        ["今週", "こんしゅう", "cette semaine"], ["来週", "らいしゅう", "la semaine prochaine"], ["先週", "せんしゅう", "la semaine dernière"],
        ["毎日", "まいにち", "tous les jours"], ["今", "いま", "maintenant"],
      ] },
      { t: "tip", text: "Les mois sont le nombre + 月 : 一月 (いちがつ), 四月 (しがつ), 七月 (しちがつ), 九月 (くがつ). Attention : 4, 7 et 9 ont des lectures particulières." },
    ],
  },
  {
    id: "ja-comparison", lang: "ja", topic: T3, level: "N5", title: "Comparer : より, ほう, いちばん",
    summary: "Plus que, le plus.",
    blocks: [
      { t: "table", head: ["Structure", "Sens", "Exemple"], rows: [
        ["A は B より 〜", "A est plus … que B", "東京は大阪より大きいです。"],
        ["A の ほうが 〜", "A est plus… (choix entre deux)", "電車のほうが速いです。"],
        ["A と B と どちらが 〜 ですか", "lequel est plus … ?", "紅茶とコーヒーとどちらが好きですか。"],
        ["〜の中で ～ が いちばん 〜", "le plus … de", "果物の中でりんごがいちばん好きです。"],
      ] },
    ],
  },
  {
    id: "ja-potential", lang: "ja", topic: T3, level: "N4", title: "Pouvoir, expérience, intention",
    summary: "Forme potentielle, 〜ことができる, 〜たことがある, 〜つもり.",
    blocks: [
      { t: "table", head: ["Groupe", "Forme potentielle"], rows: [
        ["1", "dernière syllabe → ligne え + る : 書く → 書ける, 飲む → 飲める, 話す → 話せる"],
        ["2", "る → られる : 食べる → 食べられる, 見る → 見られる"],
        ["3", "する → できる ; 来る → 来られる (こられる)"],
      ] },
      { t: "table", head: ["Structure", "Sens", "Exemple"], rows: [
        ["verbe (neutre) + ことができる", "pouvoir (capacité, possibilité)", "日本語を話すことができます。"],
        ["verbe た + ことがある", "avoir déjà fait (expérience)", "京都へ行ったことがあります。"],
        ["verbe (neutre) + つもりだ", "avoir l'intention de", "来年日本へ行くつもりです。"],
        ["〜でしょう", "probablement", "明日は雨でしょう。"],
        ["〜と思います", "je pense que", "彼は来ると思います。"],
      ] },
      { t: "tip", text: "Avec la forme potentielle, l'objet prend souvent が au lieu de を : 日本語が話せます." },
    ],
  },
  {
    id: "ja-conditional", lang: "ja", topic: T3, level: "N4", title: "Les conditionnels : たら, ば, と, なら",
    summary: "« Si », « quand », « dans ce cas ».",
    blocks: [
      { t: "table", head: ["Forme", "Formation", "Emploi", "Exemple"], rows: [
        ["〜たら", "forme た + ら", "le plus polyvalent : « si / quand (une fois que) »", "雨が降ったら、行きません。"],
        ["〜ば", "forme conditionnelle : 書く → 書けば, 食べる → 食べれば", "condition générale, conseils", "安ければ、買います。"],
        ["〜と", "forme neutre + と", "résultat naturel ou automatique", "春になると、暖かくなります。"],
        ["〜なら", "forme neutre + なら", "« si c'est le cas… », en réaction à ce que dit l'autre", "行くなら、一緒に行きましょう。"],
      ] },
      { t: "warn", text: "Après 〜と, on ne peut pas mettre de demande, d'ordre ou d'intention : « 雨が降ると行きません » est naturel, mais pas « …と行きましょう ». Utilise 〜たら dans ce cas." },
    ],
  },
  {
    id: "ja-giving", lang: "ja", topic: T3, level: "N4", title: "Donner et recevoir : あげる, くれる, もらう",
    summary: "Le sens dépend de qui donne à qui.",
    blocks: [
      { t: "table", head: ["Verbe", "Sens", "Exemple"], rows: [
        ["あげる", "je (ou quelqu'un de mon groupe) donne à quelqu'un", "友達に本をあげました。"],
        ["くれる", "quelqu'un me donne (ou donne à mon groupe)", "友達が本をくれました。"],
        ["もらう", "je reçois de quelqu'un", "友達に本をもらいました。"],
      ] },
      { t: "p", text: "Ils s'emploient aussi après la forme en て pour dire qu'on fait un service : **〜てあげる** (je rends service), **〜てくれる** (on me rend service), **〜てもらう** (je me fais rendre service)." },
      { t: "ex", items: [
        { text: "先生が日本語を教えてくれました。", reading: "せんせいがにほんごをおしえてくれました。", tr: "Le professeur m'a enseigné le japonais (et j'en suis reconnaissant)." },
      ] },
    ],
  },
  {
    id: "ja-keigo", lang: "ja", topic: T3, level: "N3", title: "Politesse et keigo (bases)",
    summary: "Niveaux de langage et verbes honorifiques courants.",
    blocks: [
      { t: "p", text: "Le japonais a trois grands registres : **neutre** (entre amis), **poli** (です / ます), et **keigo** (honorifique pour élever l'interlocuteur, humble pour abaisser soi-même)." },
      { t: "table", head: ["Verbe de base", "Honorifique (sonkeigo) : l'autre", "Humble (kenjōgo) : moi"], rows: [
        ["する (faire)", "なさる", "いたす"],
        ["行く (aller) / 来る (venir)", "いらっしゃる", "参る (まいる)"],
        ["いる (être)", "いらっしゃる", "おる"],
        ["食べる (manger) / 飲む", "召し上がる (めしあがる)", "いただく"],
        ["言う (dire)", "おっしゃる", "申す (もうす)"],
        ["見る (voir)", "ご覧になる (ごらんになる)", "拝見する (はいけんする)"],
        ["知っている (savoir)", "ご存じだ (ごぞんじだ)", "存じている (ぞんじている)"],
      ] },
      { t: "list", items: [
        "Schéma honorifique général : **お + radical ます + になる** (お書きになる) ; humble : **お + radical + する** (お持ちします).",
        "お / ご devant certains noms les rend polis : お茶, お金, ご家族.",
        "Phrases utiles : いらっしゃいませ (bienvenue), よろしくお願いします, 申します (« je m'appelle », humble), 失礼します.",
      ] },
    ],
  },
  {
    id: "ja-passive", lang: "ja", topic: T3, level: "N3", title: "Passif et causatif",
    summary: "Être fait par, faire faire.",
    blocks: [
      { t: "table", head: ["Groupe", "Passif (〜れる / 〜られる)", "Causatif (〜せる / 〜させる)"], rows: [
        ["1", "ligne あ + れる : 書く → 書かれる, 飲む → 飲まれる", "ligne あ + せる : 書く → 書かせる, 飲む → 飲ませる"],
        ["2", "る → られる : 食べる → 食べられる", "る → させる : 食べる → 食べさせる"],
        ["3", "する → される ; 来る → 来られる", "する → させる ; 来る → 来させる"],
      ] },
      { t: "ex", items: [
        { text: "私は先生にほめられました。", reading: "わたしはせんせいにほめられました。", tr: "J'ai été félicité par le professeur." },
        { text: "母は私に野菜を食べさせました。", reading: "ははわたしにやさいをたべさせました。", tr: "Ma mère m'a fait manger des légumes." },
      ] },
      { t: "warn", text: "La forme passive d'un verbe du groupe 2 est identique à sa forme potentielle (食べられる). Le contexte et la particule (に pour l'agent) permettent de distinguer." },
    ],
  },
  {
    id: "ja-common-verbs", lang: "ja", topic: T4, level: "N5", title: "Verbes courants et leur groupe",
    summary: "Une trentaine de verbes de base, avec leur groupe.",
    blocks: [
      { t: "table", head: ["Verbe", "Lecture", "Sens", "Groupe"], rows: [
        ["行く", "いく", "aller (て : 行って)", "1"],
        ["来る", "くる", "venir", "3"],
        ["する", "する", "faire", "3"],
        ["帰る", "かえる", "rentrer", "1"],
        ["入る", "はいる", "entrer", "1"],
        ["出る", "でる", "sortir", "2"],
        ["食べる", "たべる", "manger", "2"],
        ["飲む", "のむ", "boire", "1"],
        ["見る", "みる", "voir, regarder", "2"],
        ["聞く", "きく", "écouter, demander", "1"],
        ["話す", "はなす", "parler", "1"],
        ["読む", "よむ", "lire", "1"],
        ["書く", "かく", "écrire", "1"],
        ["買う", "かう", "acheter", "1"],
        ["会う", "あう", "rencontrer", "1"],
        ["待つ", "まつ", "attendre", "1"],
        ["持つ", "もつ", "tenir, porter", "1"],
        ["起きる", "おきる", "se lever", "2"],
        ["寝る", "ねる", "dormir, se coucher", "2"],
        ["住む", "すむ", "habiter", "1"],
        ["働く", "はたらく", "travailler", "1"],
        ["勉強する", "べんきょうする", "étudier", "3"],
        ["知る", "しる", "savoir (知っている : je sais)", "1"],
        ["わかる", "わかる", "comprendre", "1"],
        ["ある", "ある", "il y a (inanimé) ; négatif : ない", "1"],
        ["いる", "いる", "il y a (animé), être", "2"],
        ["教える", "おしえる", "enseigner", "2"],
        ["使う", "つかう", "utiliser", "1"],
        ["作る", "つくる", "fabriquer, cuisiner", "1"],
        ["遊ぶ", "あそぶ", "jouer, s'amuser", "1"],
      ] },
    ],
  },
];
