import type { Exercise } from "../exercises";

// Exercices préparés de japonais (explications en français).
// Les niveaux N5 / N4 / N3 sont indicatifs.

const T_PART = "Particules";
const T_CONJ = "Conjugaison";
const T_ADJ = "Adjectifs";
const T_STRUCT = "Structures grammaticales";
const T_ORDER = "Ordre des mots";

export const EXERCISES_JA: Exercise[] = [
  // --- Particules ---
  {
    id: "ja-part-01", lang: "ja", topic: T_PART, level: "N5", type: "mcq",
    prompt: "Choisis la particule correcte.",
    sentence: "毎日、パン___食べます。",
    choices: ["を", "に", "で", "へ"], correct: 0,
    explanation: "を marque le complément d'objet direct : ce qui est mangé, lu, bu, regardé…",
  },
  {
    id: "ja-part-02", lang: "ja", topic: T_PART, level: "N5", type: "mcq",
    prompt: "Choisis la particule correcte.",
    sentence: "学校___行きます。",
    choices: ["に", "を", "で", "と"], correct: 0,
    explanation: "Avec un verbe de déplacement (行く, 来る, 帰る), la destination se marque avec に (ou へ).",
  },
  {
    id: "ja-part-03", lang: "ja", topic: T_PART, level: "N5", type: "mcq",
    prompt: "Choisis la particule correcte.",
    sentence: "図書館___勉強します。",
    choices: ["に", "で", "を", "が"], correct: 1,
    explanation: "で marque le lieu où se déroule une action (étudier, manger, travailler…).",
  },
  {
    id: "ja-part-04", lang: "ja", topic: T_PART, level: "N5", type: "mcq",
    prompt: "Choisis la particule correcte.",
    sentence: "友達___一緒に映画を見ました。",
    choices: ["と", "が", "を", "で"], correct: 0,
    explanation: "と signifie « avec » (une personne avec qui l'on fait quelque chose) et relie aussi deux noms (« A et B »).",
  },
  {
    id: "ja-part-05", lang: "ja", topic: T_PART, level: "N5", type: "mcq",
    prompt: "Choisis la particule correcte.",
    sentence: "これは私___本です。",
    choices: ["の", "を", "に", "で"], correct: 0,
    explanation: "の relie deux noms et exprime l'appartenance : 私の本 = « mon livre ».",
  },
  {
    id: "ja-part-06", lang: "ja", topic: T_PART, level: "N5", type: "mcq",
    prompt: "Choisis la particule correcte.",
    sentence: "東京___大阪まで新幹線で行きます。",
    choices: ["から", "まで", "に", "と"], correct: 0,
    explanation: "から = « depuis / à partir de » (point de départ) et まで = « jusqu'à » (point d'arrivée) : 東京から大阪まで.",
  },
  {
    id: "ja-part-07", lang: "ja", topic: T_PART, level: "N5", type: "fill",
    prompt: "Écris la particule manquante (en kana).",
    sentence: "私は毎朝七時___起きます。",
    accepted: ["に"],
    hint: "Une heure précise se marque avec cette particule.",
    explanation: "に se place après une heure précise : 七時に = « à sept heures ». Pas de に après « 毎朝 », « 今日 » ou « 明日 ».",
  },
  {
    id: "ja-part-08", lang: "ja", topic: T_PART, level: "N5", type: "fill",
    prompt: "Écris la particule manquante (en kana).",
    sentence: "ペン___名前を書いてください。",
    accepted: ["で"],
    hint: "Elle marque l'instrument, le moyen.",
    explanation: "で marque aussi le moyen ou l'instrument : ペンで書く = « écrire avec un stylo », 電車で行く = « aller en train ».",
  },
  {
    id: "ja-part-09", lang: "ja", topic: T_PART, level: "N4", type: "mcq",
    prompt: "Choisis la particule correcte.",
    sentence: "私は猫___好きです。",
    choices: ["が", "を", "に", "で"], correct: 0,
    explanation: "Avec 好き, 嫌い, 上手, 下手, わかる, できる…, l'objet du sentiment ou de la capacité se marque avec が.",
  },
  {
    id: "ja-part-10", lang: "ja", topic: T_PART, level: "N4", type: "mcq",
    prompt: "Choisis la particule correcte.",
    sentence: "駅___近くにコンビニがあります。",
    choices: ["の", "を", "で", "へ"], correct: 0,
    explanation: "の relie « 駅 » à « 近く » : 駅の近く = « près de la gare ».",
  },
  {
    id: "ja-part-11", lang: "ja", topic: T_PART, level: "N4", type: "mcq",
    prompt: "Choisis la particule correcte.",
    sentence: "机の上___本があります。",
    choices: ["に", "で", "を", "と"], correct: 0,
    explanation: "Avec あります / います (existence), le lieu où se trouve quelque chose se marque avec に.",
  },
  {
    id: "ja-part-12", lang: "ja", topic: T_PART, level: "N3", type: "mcq",
    prompt: "Choisis l'expression correcte.",
    sentence: "約束した___、彼は来なかった。",
    choices: ["のに", "ので", "ように", "ために"], correct: 0,
    explanation: "のに exprime une opposition inattendue (« bien que… alors que… ») : il avait promis, pourtant il n'est pas venu.",
  },

  // --- Conjugaison ---
  {
    id: "ja-conj-01", lang: "ja", topic: T_CONJ, level: "N5", type: "mcq",
    prompt: "Quelle est la forme en ます de 食べる ?",
    choices: ["食べります", "食べます", "食べいます", "食べるます"], correct: 1,
    explanation: "食べる est un verbe ichidan (en る) : on retire る et on ajoute ます → 食べます.",
  },
  {
    id: "ja-conj-02", lang: "ja", topic: T_CONJ, level: "N5", type: "mcq",
    prompt: "Quelle est la forme en ます de 飲む ?",
    choices: ["飲むます", "飲みます", "飲ります", "飲いります"], correct: 1,
    explanation: "飲む est un verbe godan : la dernière syllabe passe de la colonne う à la colonne い (む → み), puis ます.",
  },
  {
    id: "ja-conj-03", lang: "ja", topic: T_CONJ, level: "N5", type: "mcq",
    prompt: "Quelle est la forme négative (ない) de 見る ?",
    choices: ["見らない", "見ない", "見いない", "見るない"], correct: 1,
    explanation: "Verbe ichidan : on retire る et on ajoute ない → 見ない.",
  },
  {
    id: "ja-conj-04", lang: "ja", topic: T_CONJ, level: "N5", type: "mcq",
    prompt: "Quelle est la forme en て de 行く ?",
    choices: ["行いて", "行って", "行くて", "行んで"], correct: 1,
    explanation: "Les verbes en く font いて (書く → 書いて), mais 行く est une exception : 行って.",
  },
  {
    id: "ja-conj-05", lang: "ja", topic: T_CONJ, level: "N5", type: "mcq",
    prompt: "Quelle est la forme en て de 書く ?",
    choices: ["書いて", "書って", "書んで", "書きて"], correct: 0,
    explanation: "Verbes godan en く : く → いて.",
  },
  {
    id: "ja-conj-06", lang: "ja", topic: T_CONJ, level: "N5", type: "mcq",
    prompt: "Quelle est la forme en て de 読む ?",
    choices: ["読んで", "読って", "読いて", "読みて"], correct: 0,
    explanation: "Verbes godan en む, ぶ, ぬ : → んで.",
  },
  {
    id: "ja-conj-07", lang: "ja", topic: T_CONJ, level: "N5", type: "mcq",
    prompt: "Quelle est la forme en て de 話す ?",
    choices: ["話して", "話いて", "話んで", "話って"], correct: 0,
    explanation: "Verbes godan en す : す → して.",
  },
  {
    id: "ja-conj-08", lang: "ja", topic: T_CONJ, level: "N5", type: "mcq",
    prompt: "Quelle est la forme en て de 買う ?",
    choices: ["買って", "買いて", "買んで", "買して"], correct: 0,
    explanation: "Verbes godan en う, つ, る : → って.",
  },
  {
    id: "ja-conj-09", lang: "ja", topic: T_CONJ, level: "N5", type: "fill",
    prompt: "Écris 来る à la forme en ます (kana ou kanji).",
    sentence: "来る → ___",
    accepted: ["きます", "来ます"],
    explanation: "来る est irrégulier : 来ます se lit きます (la lecture de 来 change : く → き).",
  },
  {
    id: "ja-conj-10", lang: "ja", topic: T_CONJ, level: "N5", type: "fill",
    prompt: "Écris する à la forme négative (ない), en kana.",
    sentence: "する → ___",
    accepted: ["しない"],
    explanation: "する est irrégulier : négatif しない, poli します, en て : して.",
  },
  {
    id: "ja-conj-11", lang: "ja", topic: T_CONJ, level: "N4", type: "fill",
    prompt: "Écris 書く au passé neutre (た), en kanji ou kana.",
    sentence: "書く → ___",
    accepted: ["書いた", "かいた"],
    explanation: "La forme en た se construit comme la forme en て : 書いて → 書いた.",
  },
  {
    id: "ja-conj-12", lang: "ja", topic: T_CONJ, level: "N4", type: "mcq",
    prompt: "Quelle est la forme en て de 待つ ?",
    choices: ["待って", "待ちて", "待いて", "待んで"], correct: 0,
    explanation: "Verbes godan en つ : つ → って.",
  },
  {
    id: "ja-conj-13", lang: "ja", topic: T_CONJ, level: "N4", type: "mcq",
    prompt: "Quelle est la forme en て de 遊ぶ ?",
    choices: ["遊んで", "遊って", "遊いて", "遊びて"], correct: 0,
    explanation: "Verbes godan en ぶ : ぶ → んで.",
  },
  {
    id: "ja-conj-14", lang: "ja", topic: T_CONJ, level: "N3", type: "mcq",
    prompt: "Quelle est la forme passive de 書く ?",
    choices: ["書かれる", "書ける", "書かせる", "書きられる"], correct: 0,
    explanation: "Passif des verbes godan : dernière syllabe en colonne あ + れる (書かれる). 書ける est le potentiel, 書かせる le causatif.",
  },
  {
    id: "ja-conj-15", lang: "ja", topic: T_CONJ, level: "N3", type: "mcq",
    prompt: "Quelle est la forme causative de 食べる ?",
    choices: ["食べさせる", "食べられる", "食べせる", "食べらせる"], correct: 0,
    explanation: "Causatif des verbes ichidan : on retire る et on ajoute させる (« faire manger / laisser manger »). 食べられる est le passif ou le potentiel.",
  },

  // --- Adjectifs ---
  {
    id: "ja-adj-01", lang: "ja", topic: T_ADJ, level: "N5", type: "mcq",
    prompt: "Quelle est la forme négative de 高い (cher, haut) ?",
    choices: ["高いくない", "高くない", "高じゃない", "高かない"], correct: 1,
    explanation: "Adjectif en い : on remplace い par くない → 高くない.",
  },
  {
    id: "ja-adj-02", lang: "ja", topic: T_ADJ, level: "N5", type: "mcq",
    prompt: "Quelle est la forme négative de きれい (adjectif en な) ?",
    choices: ["きれいくない", "きれいじゃない", "きれくない", "きれいなない"], correct: 1,
    explanation: "Adjectif en な : on ajoute じゃない (ou ではない) → きれいじゃない. Même si きれい finit par い, c'est un adjectif en な.",
  },
  {
    id: "ja-adj-03", lang: "ja", topic: T_ADJ, level: "N5", type: "mcq",
    prompt: "Quelle est la forme passée de 大きい ?",
    choices: ["大きいだった", "大きかった", "大きくだった", "大きた"], correct: 1,
    explanation: "Adjectif en い : い → かった → 大きかった (« c'était grand »).",
  },
  {
    id: "ja-adj-04", lang: "ja", topic: T_ADJ, level: "N5", type: "mcq",
    prompt: "Choisis la terminaison correcte devant un nom.",
    sentence: "静か___町です。",
    choices: ["な", "の", "い", "に"], correct: 0,
    explanation: "Les adjectifs en な prennent な devant un nom : 静かな町 (« une ville calme »).",
  },
  {
    id: "ja-adj-05", lang: "ja", topic: T_ADJ, level: "N5", type: "fill",
    prompt: "Écris la forme négative (ない) de いい, en kana.",
    sentence: "いい → ___",
    accepted: ["よくない"],
    explanation: "いい est irrégulier : devant くない, くて, かった… il redevient よい → よくない, よくて, よかった.",
  },
  {
    id: "ja-adj-06", lang: "ja", topic: T_ADJ, level: "N4", type: "mcq",
    prompt: "Quelle est la forme négative passée de おいしい ?",
    choices: ["おいしくなかった", "おいしいじゃなかった", "おいしくじゃなかった", "おいしなかった"], correct: 0,
    explanation: "Adjectif en い : くない → くなかった (« ce n'était pas bon »).",
  },
  {
    id: "ja-adj-07", lang: "ja", topic: T_ADJ, level: "N4", type: "mcq",
    prompt: "Choisis la terminaison correcte (adverbe).",
    sentence: "明日は早___起きてください。",
    choices: ["く", "に", "な", "の"], correct: 0,
    explanation: "Adjectif en い → adverbe : い → く (早い → 早く, « tôt »).",
  },
  {
    id: "ja-adj-08", lang: "ja", topic: T_ADJ, level: "N4", type: "mcq",
    prompt: "Choisis la terminaison correcte (« devenir »).",
    sentence: "この部屋は静か___なりました。",
    choices: ["に", "く", "で", "な"], correct: 0,
    explanation: "Adjectif en な + になる = « devenir » (静かになる) ; adjectif en い : くなる (大きくなる).",
  },

  // --- Structures grammaticales ---
  {
    id: "ja-str-01", lang: "ja", topic: T_STRUCT, level: "N5", type: "fill",
    prompt: "Complète pour dire « Je voudrais manger » (en kana).",
    sentence: "食べ___です。",
    accepted: ["たい"],
    hint: "Racine du verbe + ... exprime le désir.",
    explanation: "Racine + たい exprime le désir de faire quelque chose : 食べたい = « vouloir manger ».",
  },
  {
    id: "ja-str-02", lang: "ja", topic: T_STRUCT, level: "N5", type: "mcq",
    prompt: "Choisis la forme correcte pour « Écrivez votre nom ici, s'il vous plaît ».",
    sentence: "ここに名前を___ください。",
    choices: ["書いて", "書き", "書く", "書かない"], correct: 0,
    explanation: "Forme en て + ください = demande polie.",
  },
  {
    id: "ja-str-03", lang: "ja", topic: T_STRUCT, level: "N4", type: "mcq",
    prompt: "« Je suis en train de lire. » Choisis la forme correcte.",
    sentence: "今、本を___います。",
    choices: ["読んで", "読みて", "読って", "読む"], correct: 0,
    explanation: "Forme en て + いる exprime une action en cours : 読んでいます.",
  },
  {
    id: "ja-str-04", lang: "ja", topic: T_STRUCT, level: "N4", type: "mcq",
    prompt: "« Puis-je prendre une photo ici ? » Choisis la bonne expression.",
    sentence: "ここで写真を撮っ___いいですか。",
    choices: ["ても", "ながら", "ように", "まで"], correct: 0,
    explanation: "Forme en て + も + いいですか = demande de permission (« est-ce que je peux… ? »).",
  },
  {
    id: "ja-str-05", lang: "ja", topic: T_STRUCT, level: "N4", type: "mcq",
    prompt: "« Je dois faire mes devoirs. » Choisis la bonne partie.",
    sentence: "宿題をし___ければなりません。",
    choices: ["な", "ない", "なく", "なかっ"], correct: 0,
    explanation: "Négatif de する (し + ない) → なければなりません : « devoir faire quelque chose » (littéralement « si on ne fait pas, ça ne va pas »).",
  },
  {
    id: "ja-str-06", lang: "ja", topic: T_STRUCT, level: "N4", type: "mcq",
    prompt: "« Es-tu déjà allé au Japon ? » (expérience) Choisis le mot qui convient.",
    sentence: "日本に行った___がありますか。",
    choices: ["こと", "もの", "ところ", "ばかり"], correct: 0,
    explanation: "Verbe au passé (た) + ことがある = avoir déjà fait quelque chose (expérience).",
  },
  {
    id: "ja-str-07", lang: "ja", topic: T_STRUCT, level: "N3", type: "mcq",
    prompt: "« J'ai (malheureusement) oublié mes devoirs. » Choisis la forme correcte.",
    sentence: "宿題を忘れて___ました。",
    choices: ["しまい", "あり", "おき", "いき"], correct: 0,
    explanation: "Forme en て + しまう exprime une action achevée, souvent avec regret : 忘れてしまいました.",
  },
  {
    id: "ja-str-08", lang: "ja", topic: T_STRUCT, level: "N3", type: "mcq",
    prompt: "« Je lis en buvant du café. » Choisis le mot qui convient.",
    sentence: "コーヒーを飲み___、本を読みます。",
    choices: ["ながら", "ために", "ので", "けど"], correct: 0,
    explanation: "Racine du verbe + ながら = deux actions simultanées par la même personne.",
  },
  {
    id: "ja-str-09", lang: "ja", topic: T_STRUCT, level: "N3", type: "mcq",
    prompt: "« Il a l'air de pleuvoir. » Choisis le mot qui convient.",
    sentence: "雨が降り___だ。",
    choices: ["そう", "よう", "らしい", "みたい"], correct: 0,
    explanation: "Racine du verbe + そう = « avoir l'air de / être sur le point de » (impression visuelle) : 降りそうだ.",
  },

  // --- Ordre des mots ---
  {
    id: "ja-ord-01", lang: "ja", topic: T_ORDER, level: "N5", type: "order",
    prompt: "Remets les morceaux dans l'ordre : « Je vais à l'école tous les jours. »",
    words: ["私は", "毎日", "学校に", "行きます"],
    alternatives: [["毎日", "私は", "学校に", "行きます"]],
    explanation: "Le verbe est toujours à la fin de la phrase. Thème (私は), mot de temps (毎日) et lieu (学校に) se placent avant lui.",
  },
  {
    id: "ja-ord-02", lang: "ja", topic: T_ORDER, level: "N5", type: "order",
    prompt: "Remets les morceaux dans l'ordre : « C'est mon livre. »",
    words: ["これは", "私の", "本です"],
    explanation: "Thème (これは) + complément du nom (私の) + nom + です.",
  },
  {
    id: "ja-ord-03", lang: "ja", topic: T_ORDER, level: "N5", type: "order",
    prompt: "Remets les morceaux dans l'ordre : « Hier, j'ai regardé un film avec un ami. »",
    words: ["昨日", "友達と", "映画を", "見ました"],
    alternatives: [
      ["友達と", "昨日", "映画を", "見ました"],
      ["昨日", "映画を", "友達と", "見ました"],
    ],
    explanation: "Les compléments peuvent changer de place, mais le verbe reste à la fin.",
  },
  {
    id: "ja-ord-04", lang: "ja", topic: T_ORDER, level: "N4", type: "order",
    prompt: "Remets les morceaux dans l'ordre : « J'attends un ami à la gare. »",
    words: ["駅で", "友達を", "待っています"],
    alternatives: [["友達を", "駅で", "待っています"]],
    explanation: "Lieu de l'action (駅で) et objet (友達を) précèdent le verbe, dans l'un ou l'autre ordre.",
  },
  {
    id: "ja-ord-05", lang: "ja", topic: T_ORDER, level: "N4", type: "order",
    prompt: "Remets les morceaux dans l'ordre : « Étudier le japonais est amusant. »",
    words: ["日本語を", "勉強するのは", "楽しいです"],
    explanation: "Verbe + の transforme l'action en nom (« le fait d'étudier »), puis は et l'adjectif.",
  },
  {
    id: "ja-ord-06", lang: "ja", topic: T_ORDER, level: "N4", type: "order",
    prompt: "Remets les morceaux dans l'ordre : « Parlez plus lentement, s'il vous plaît. »",
    words: ["もっと", "ゆっくり", "話してください"],
    explanation: "Les adverbes (もっと, ゆっくり) précèdent le verbe.",
  },
  {
    id: "ja-ord-07", lang: "ja", topic: T_ORDER, level: "N3", type: "order",
    prompt: "Remets les morceaux dans l'ordre : « Bien qu'il soit occupé, il va à la salle de sport tous les jours. »",
    words: ["彼は", "忙しいのに", "毎日", "ジムに", "通っています"],
    alternatives: [["忙しいのに", "彼は", "毎日", "ジムに", "通っています"]],
    explanation: "La proposition en のに (« bien que ») précède la proposition principale ; le verbe de la principale clôt la phrase.",
  },
];
