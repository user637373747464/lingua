import { Builder } from "./builders";

// Japonais, niveaux N5 et N4. On ajoute à la fin, on ne réordonne jamais.
const b = new Builder("ja-a", "ja");
const PAR = "Particules", CON = "Conjugaison", ADJ = "Adjectifs", STR = "Structures grammaticales", ORD = "Ordre des mots", CPT = "Compteurs", KAN = "Lecture des kanji", VOC = "Vocabulaire", DON = "Don et réception", COND = "Conditionnels", VTR = "Verbes transitifs et intransitifs";
const PP = "Choisis la particule ou le mot qui convient.";
const FQ = "Choisis la bonne forme.";

// --- Particules (N5) ---
b.mc(PAR, "N5", "私___学生です。", "は", ["を", "に", "で"], "は marque le thème de la phrase : 私は学生です。", PP)
 .mc(PAR, "N5", "毎朝、水___飲みます。", "を", ["に", "で", "へ"], "を marque le complément d'objet direct : 水を飲む.", PP)
 .mc(PAR, "N5", "明日、学校___行きます。", "に", ["を", "で", "と"], "に marque la destination (へ est aussi possible).", PP)
 .mc(PAR, "N5", "図書館___勉強します。", "で", ["を", "に", "が"], "で marque le lieu où se déroule une action.", PP)
 .mc(PAR, "N5", "友達___一緒に映画を見ました。", "と", ["を", "で", "の"], "と = avec (une personne).", PP)
 .mc(PAR, "N5", "これは私___本です。", "の", ["を", "に", "と"], "の relie deux noms : 私の本 (mon livre).", PP)
 .mc(PAR, "N5", "毎朝七時___起きます。", "に", ["で", "を", "が"], "に marque une heure précise.", PP)
 .mc(PAR, "N5", "バス___学校に行きます。", "で", ["に", "を", "と"], "で marque le moyen de transport.", PP)
 .mc(PAR, "N5", "机の上___本があります。", "に", ["で", "を", "へ"], "に marque le lieu d'existence avec あります / います.", PP)
 .mc(PAR, "N5", "公園に猫___います。", "が", ["を", "で", "へ"], "が marque le sujet d'un verbe d'existence (information nouvelle).", PP)
 .mc(PAR, "N5", "私は学生です。田中さん___学生です。（田中さんも学生）", "も", ["を", "に", "で"], "も = aussi ; il remplace は, が ou を.", PP)
 .mc(PAR, "N5", "九時___五時まで働きます。", "から", ["を", "に", "で"], "から… まで = de… à…", PP)
 .fl(PAR, "N5", "これ___ペンです。", ["は"], "は marque le thème : これはペンです。", "Écris la particule manquante (en kana).", "Elle se lit « wa » mais s'écrit avec ce kana.")
 .fl(PAR, "N5", "毎日パン___食べます。", ["を"], "を marque l'objet direct : パンを食べる.", "Écris la particule manquante (en kana).")
 .fl(PAR, "N5", "日本___行きます。（direction）", ["へ", "に"], "へ (lu « e ») et に peuvent tous deux marquer la destination.", "Écris la particule manquante (en kana).");

// --- Ordre des mots (N5) ---
b.od(ORD, "N5", ["私は", "朝", "七時に", "起きます"], "Thème, mot de temps, puis le verbe à la fin.", [["朝", "私は", "七時に", "起きます"]], "Remets les morceaux dans l'ordre : « Je me lève à sept heures le matin. »")
 .od(ORD, "N5", ["駅は", "銀行の", "隣に", "あります"], "Thème + complément du nom + lieu + verbe d'existence.", undefined, "Remets les morceaux dans l'ordre : « La gare est à côté de la banque. »")
 .od(ORD, "N5", ["毎日", "日本語を", "勉強します"], "Mot de temps + objet + verbe.", undefined, "Remets les morceaux dans l'ordre : « J'étudie le japonais tous les jours. »")
 .od(ORD, "N5", ["田中さんは", "先生では", "ありません"], "Négation polie de です : ではありません.", undefined, "Remets les morceaux dans l'ordre : « M. Tanaka n'est pas professeur. »")
 .od(ORD, "N5", ["昨日", "友達と", "図書館で", "勉強しました"], "Le verbe est à la fin ; temps, personne et lieu se placent avant.", [["友達と", "昨日", "図書館で", "勉強しました"], ["昨日", "図書館で", "友達と", "勉強しました"]], "Remets les morceaux dans l'ordre : « Hier, j'ai étudié à la bibliothèque avec un ami. »");

// --- Conjugaison (N5) ---
b.q(CON, "N5", "「飲む」の ます形は？", "飲みます", ["飲ります", "飲むます", "飲いて"], "Groupe 1 : la dernière syllabe passe à la ligne い + ます : 飲む → 飲みます。")
 .q(CON, "N5", "「行く」の て形は？", "行って", ["行いて", "行きて", "行んで"], "行く est une exception : て形 = 行って (et non 行いて).")
 .q(CON, "N5", "「書く」の て形は？", "書いて", ["書って", "書んで", "書きて"], "く → いて : 書いて.")
 .q(CON, "N5", "「飲む」の て形は？", "飲んで", ["飲いて", "飲って", "飲して"], "む → んで : 飲んで.")
 .q(CON, "N5", "「話す」の て形は？", "話して", ["話って", "話いて", "話んで"], "す → して : 話して.")
 .q(CON, "N5", "「泳ぐ」の て形は？", "泳いで", ["泳いて", "泳って", "泳んで"], "ぐ → いで : 泳いで (sonore).")
 .q(CON, "N5", "「遊ぶ」の て形は？", "遊んで", ["遊って", "遊いで", "遊して"], "ぶ → んで : 遊んで.")
 .q(CON, "N5", "「待つ」の て形は？", "待って", ["待ちて", "待んで", "待いて"], "つ → って : 待って.")
 .q(CON, "N5", "「食べる」の ない形は？", "食べない", ["食べらない", "食べえない", "食べるない"], "Groupe 2 : る → ない : 食べない。")
 .q(CON, "N5", "「買う」の ない形は？", "買わない", ["買あない", "買うない", "買らない"], "Les verbes en う font わ + ない : 買わない。")
 .q(CON, "N5", "「する」の ない形は？", "しない", ["すない", "せない", "さない"], "する est irrégulier : しない。")
 .q(CON, "N5", "「来る」の ます形は？", "きます", ["くます", "こます", "きいます"], "来る est irrégulier : 来ます = きます。")
 .q(CON, "N5", "「見る」の た形は？", "見た", ["見った", "見んだ", "見いた"], "Groupe 2 : る → た : 見た。")
 .q(CON, "N5", "「飲む」の た形は？", "飲んだ", ["飲った", "飲いた", "飲した"], "む → んだ : 飲んだ。")
 .mc(CON, "N5", "昨日、友達に___。（会う, poli, passé）", "会いました", ["会います", "会ません", "会いません"], "Passé poli : radical ます + ました : 会いました。", FQ)
 .mc(CON, "N5", "明日は学校に___。（行く, poli, négatif）", "行きません", ["行きました", "行ません", "行きない"], "Négatif poli : 行きません。", FQ)
 .fl(CON, "N5", "昨日、パンを___。（食べる, poli, passé）", ["食べました", "たべました"], "Passé poli : 食べる → 食べました。", "Écris le verbe à la forme demandée (kana ou kanji).")
 .fl(CON, "N5", "私は日本語を___。（話す, poli）", ["話します", "はなします"], "Groupe 1 : 話す → 話します。", "Écris le verbe à la forme demandée (kana ou kanji).");

// --- Adjectifs (N5) ---
b.mc(ADJ, "N5", "この部屋は___です。（広い → négatif, présent）", "広くない", ["広いない", "広くなかった", "広じゃない"], "Négatif d'un adjectif en い : い → くない : 広くない。", FQ)
 .mc(ADJ, "N5", "昨日は天気が___です。（いい → passé）", "よかった", ["いかった", "よくない", "いくなかった"], "いい est irrégulier : passé よかった。", FQ)
 .mc(ADJ, "N5", "静か___町に住んでいます。", "な", ["の", "い", "に"], "Un adjectif en な prend な devant un nom : 静かな町。", PP)
 .mc(ADJ, "N5", "きれい___花ですね。", "な", ["い", "の", "に"], "きれい est un adjectif en な (malgré sa finale い) : きれいな花。", PP)
 .mc(ADJ, "N5", "もっと静か___してください。", "に", ["く", "な", "で"], "Un adjectif en な devient adverbe avec に : 静かにしてください。", PP)
 .mc(ADJ, "N5", "野菜が高___なりました。", "く", ["に", "い", "な"], "Un adjectif en い devient adverbe avec く : 高くなりました (est devenu cher).", PP)
 .mc(ADJ, "N5", "元気___なりました。", "に", ["く", "な", "の"], "Adjectif en な + に + なる : 元気になる (aller mieux).", PP)
 .mc(ADJ, "N5", "あの映画は___。（おもしろい → passé négatif, forme neutre）", "おもしろくなかった", ["おもしろいじゃなかった", "おもしろくないだった", "おもしろくなかっ"], "Passé négatif d'un adjectif en い : い → くなかった.", FQ);

// --- Compteurs (N5) ---
b.mc(CPT, "N5", "りんごを三___買いました。", "つ", ["人", "本", "枚"], "Objets quelconques : ひとつ、ふたつ、みっつ… (つ).", PP)
 .mc(CPT, "N5", "学生が五___います。", "人", ["本", "匹", "枚"], "Personnes : 〜人 (にん), sauf 一人 (ひとり) et 二人 (ふたり).", PP)
 .mc(CPT, "N5", "ペンを二___買いました。", "本", ["枚", "匹", "冊"], "Objets longs et fins (stylo, bouteille) : 〜本.", PP)
 .mc(CPT, "N5", "犬が三___います。", "匹", ["人", "本", "台"], "Petits animaux : 〜匹.", PP)
 .mc(CPT, "N5", "本を三___買いました。", "冊", ["枚", "本", "台"], "Livres : 〜冊.", PP)
 .mc(CPT, "N5", "紙を二___ください。", "枚", ["本", "冊", "匹"], "Objets plats (papier, assiette, ticket) : 〜枚.", PP)
 .mc(CPT, "N5", "車が二___あります。", "台", ["枚", "匹", "冊"], "Machines et véhicules : 〜台.", PP)
 .q(CPT, "N5", "「三本」の読み方は？", "さんぼん", ["さんほん", "さんぽん", "みほん"], "Après 三, ほん devient ぼん : さんぼん. (一本 = いっぽん, 六本 = ろっぽん.)")
 .q(CPT, "N5", "「六本」の読み方は？", "ろっぽん", ["ろくほん", "ろくぼん", "ろっほん"], "六 + 本 : ろっぽん (son doublé + ぽん).")
 .q(CPT, "N5", "「一人」の読み方は？", "ひとり", ["いちにん", "いちじん", "ひとにん"], "一人 = ひとり et 二人 = ふたり sont irréguliers.")
 .q(CPT, "N5", "「二人」の読み方は？", "ふたり", ["にひと", "ににん", "ふたにん"], "二人 = ふたり (irrégulier).")
 .q(CPT, "N5", "「八分」の読み方は？", "はっぷん", ["はちふん", "はちぷん", "はっふん"], "八 + 分 : はっぷん (son doublé, ふん → ぷん).")
 .q(CPT, "N5", "「四時」の読み方は？", "よじ", ["しじ", "よんじ", "よじゅう"], "4 heures se lit よじ (pas しじ).")
 .q(CPT, "N5", "「九時」の読み方は？", "くじ", ["きゅうじ", "ここのじ", "くうじ"], "9 heures se lit くじ (pas きゅうじ).")
 .q(CPT, "N5", "「七時」の読み方は？", "しちじ", ["ななじ", "なのじ", "しちゅうじ"], "7 heures se lit しちじ.");

// --- Lecture des kanji (N5–N4) ---
b.q(KAN, "N5", "「学校」の読み方は？", "がっこう", ["がくこう", "がこう", "がっこ"], "学校 = がっこう (が + っ doublé + こう).")
 .q(KAN, "N5", "「先生」の読み方は？", "せんせい", ["さきせい", "せんしょう", "せんぜい"], "先生 = せんせい.")
 .q(KAN, "N5", "「毎日」の読み方は？", "まいにち", ["まいひ", "ごとひ", "めいにち"], "毎日 = まいにち.")
 .q(KAN, "N5", "「大学」の読み方は？", "だいがく", ["おおがく", "だいかく", "たいがく"], "大学 = だいがく (sonore : が).")
 .q(KAN, "N5", "「友達」の読み方は？", "ともだち", ["ゆうだち", "ともたち", "ゆうたつ"], "友達 = ともだち.")
 .q(KAN, "N5", "「電車」の読み方は？", "でんしゃ", ["でんくるま", "てんしゃ", "でんじゃ"], "電車 = でんしゃ.")
 .q(KAN, "N5", "「時間」の読み方は？", "じかん", ["ときかん", "じげん", "しかん"], "時間 = じかん.")
 .q(KAN, "N5", "「天気」の読み方は？", "てんき", ["てんぎ", "あまき", "でんき"], "天気 = てんき (météo). Attention à 電気 = でんき (électricité).")
 .q(KAN, "N5", "「図書館」の読み方は？", "としょかん", ["ずしょかん", "としょうかん", "とのかん"], "図書館 = としょかん.")
 .q(KAN, "N4", "「病院」の読み方は？", "びょういん", ["ひょういん", "びょうえん", "やまいいん"], "病院 = びょういん (びょう, avec sonore).")
 .q(KAN, "N4", "「買い物」の読み方は？", "かいもの", ["かいぶつ", "かうもの", "ばいもの"], "買い物 = かいもの.")
 .q(KAN, "N4", "「会社」の読み方は？", "かいしゃ", ["あいしゃ", "かいじゃ", "えしゃ"], "会社 = かいしゃ.")
 .q(KAN, "N4", "「運動」の読み方は？", "うんどう", ["うんとう", "えんどう", "うんろう"], "運動 = うんどう.")
 .q(KAN, "N4", "「旅行」の読み方は？", "りょこう", ["りょうこう", "たびこう", "りょごう"], "旅行 = りょこう (voyage).")
 .q(KAN, "N4", "「勉強」の読み方は？", "べんきょう", ["べんきょ", "べんごう", "めんきょう"], "勉強 = べんきょう.");

// --- Vocabulaire (N5–N4) ---
b.q(VOC, "N5", "「朝ご飯」の意味は？", "petit-déjeuner", ["déjeuner", "dîner", "goûter"], "朝 (matin) + ご飯 (repas) = petit-déjeuner.")
 .q(VOC, "N5", "「安い」の意味は？", "bon marché", ["cher", "grand", "tranquille"], "安い = bon marché ; 高い = cher (ou haut).")
 .q(VOC, "N5", "「来週」の意味は？", "la semaine prochaine", ["la semaine dernière", "ce mois-ci", "l'année prochaine"], "来週 = la semaine prochaine ; 先週 = la semaine dernière.")
 .q(VOC, "N5", "「駅」の意味は？", "gare", ["aéroport", "banque", "bureau de poste"], "駅 = gare.")
 .q(VOC, "N5", "「忙しい」の意味は？", "occupé", ["triste", "fatigué", "heureux"], "忙しい = occupé.")
 .q(VOC, "N5", "「難しい」の意味は？", "difficile", ["facile", "ennuyeux", "amusant"], "難しい = difficile ; 易しい / 簡単 = facile.")
 .q(VOC, "N5", "「おいしい」の意味は？", "délicieux", ["trop salé", "chaud", "rapide"], "おいしい = délicieux.")
 .q(VOC, "N5", "「毎朝」の意味は？", "chaque matin", ["ce matin", "demain matin", "tôt le matin"], "毎 = chaque : 毎朝 = chaque matin, 毎日 = chaque jour.")
 .q(VOC, "N5", "「電話」の意味は？", "téléphone", ["télévision", "électricité", "ordinateur"], "電話 = téléphone.")
 .q(VOC, "N4", "「約束」の意味は？", "promesse, rendez-vous", ["contrat de travail", "voyage", "réunion"], "約束 = promesse ou engagement, souvent un rendez-vous fixé.")
 .q(VOC, "N4", "「準備」の意味は？", "préparation", ["problème", "retard", "réponse"], "準備 = préparation.")
 .q(VOC, "N4", "「経験」の意味は？", "expérience", ["examen", "économie", "distance"], "経験 = expérience.")
 .q(VOC, "N4", "「習慣」の意味は？", "habitude", ["coutume interdite", "apprentissage", "souvenir"], "習慣 = habitude, coutume.")
 .q(VOC, "N4", "「相談」の意味は？", "consulter, demander conseil", ["discuter bruyamment", "refuser", "promettre"], "相談する = discuter d'un problème avec quelqu'un pour avoir un avis.")
 .q(VOC, "N4", "「予定」の意味は？", "projet, programme prévu", ["réservation", "retard", "souvenir"], "予定 = ce qui est prévu (programme, emploi du temps).");

// --- Structures grammaticales (N5–N4) ---
b.mc(STR, "N5", "水が___です。（Je veux boire de l'eau.）", "飲みたい", ["飲むたい", "飲みたく", "飲んたい"], "Vouloir faire : radical ます + たい : 飲みたい。", FQ)
 .mc(STR, "N5", "ここに名前を___ください。", "書いて", ["書き", "書く", "書かない"], "Demande polie : て形 + ください。", FQ)
 .mc(STR, "N5", "一緒に昼ご飯を___か。（Voulez-vous manger avec moi ?）", "食べません", ["食べます", "食べた", "食べない"], "Invitation polie : 〜ませんか (« ne mangeriez-vous pas… ? »).", FQ)
 .mc(STR, "N5", "入って___ですか。（Puis-je entrer ?）", "もいい", ["ばいい", "はいけない", "ください"], "Demander la permission : て形 + もいいですか。", PP)
 .mc(STR, "N5", "ここで写真を撮って___。（Il est interdit de prendre des photos ici.）", "はいけません", ["もいいです", "ください", "たいです"], "Interdiction : て形 + はいけません。", PP)
 .mc(STR, "N5", "今、ご飯を食べて___。（Je suis en train de manger.）", "います", ["あります", "みます", "おきます"], "Action en cours : て形 + います。", PP)
 .mc(STR, "N5", "彼は結婚___います。", "して", ["した", "する", "しない"], "結婚している = être marié (état résultant).", FQ)
 .mc(STR, "N5", "東京は大阪___大きいです。", "より", ["から", "まで", "ほど"], "A は B より… = A est plus … que B.", PP)
 .mc(STR, "N5", "紅茶とコーヒーと___が好きですか。", "どちら", ["どれ", "だれ", "いくつ"], "Comparer deux choses : AとBとどちらが…", PP)
 .mc(STR, "N5", "駅は銀行の___にあります。（à côté）", "隣", ["上", "中", "前の中"], "隣 (となり) = à côté.", "Choisis le mot qui convient.")
 .mc(STR, "N4", "日本へ行った___があります。（J'ai déjà été au Japon.）", "こと", ["もの", "ところ", "はず"], "Expérience : た形 + ことがある。", PP)
 .mc(STR, "N4", "来年、日本へ行く___です。（J'ai l'intention d'aller au Japon l'an prochain.）", "つもり", ["はず", "ため", "ところ"], "Intention : forme du dictionnaire + つもりです。", PP)
 .mc(STR, "N4", "彼は来ない___しれません。", "かも", ["はず", "よう", "そう"], "Possibilité : 〜かもしれません (peut-être).", PP)
 .mc(STR, "N4", "静か___ので、勉強しやすいです。", "な", ["だ", "の", "い"], "Avant ので, un adjectif en な prend な : 静かなので。", PP)
 .mc(STR, "N4", "食べ___ながら話します。（en même temps）", "ながら", ["てから", "たり", "ので"], "ながら : deux actions simultanées (radical ます + ながら).", PP)
 .mc(STR, "N4", "ご飯を食べて___、寝ます。（après）", "から", ["ながら", "ので", "でも"], "て形 + から = après avoir fait.", PP)
 .mc(STR, "N4", "ちょっと食べて___ます。（essayer）", "み", ["おき", "しまい", "あげ"], "て形 + みる = essayer de faire.", PP)
 .mc(STR, "N4", "窓が開いて___。（La fenêtre est ouverte.）", "います", ["あります", "みます", "おきます"], "Verbe intransitif (開く) + ている : état résultant.", PP)
 .mc(STR, "N4", "試験に合格する___に、一生懸命勉強しました。", "ため", ["ので", "から", "ながら"], "But : forme du dictionnaire + ために.", PP)
 .mc(STR, "N4", "電気を消し___ください。", "て", ["た", "ます", "ない"], "Demande : て形 + ください : 消してください。", PP)
 .mc(STR, "N4", "毎日運動する___にしています。", "こと", ["もの", "ところ", "はず"], "〜ことにしている = avoir pour règle de (habitude choisie).", PP);

// --- Conditionnels (N4) ---
b.mc(COND, "N4", "雨が降っ___、行きません。（S'il pleut, je n'irai pas.）", "たら", ["ても", "たり", "ながら"], "〜たら = si / quand : 降ったら。", PP)
 .mc(COND, "N4", "春に___と、暖かくなります。", "なる", ["なって", "なれ", "なろう"], "〜と (résultat naturel) s'ajoute à la forme du dictionnaire : なると。", FQ)
 .mc(COND, "N4", "時間が___ば、行きます。", "あれ", ["ある", "あっ", "あり"], "Forme en ば : ある → あれば。", FQ)
 .q(COND, "N4", "「書く」の ば形は？", "書けば", ["書くば", "書かば", "書いば"], "Groupe 1 : la dernière syllabe passe à la ligne え + ば : 書けば。")
 .q(COND, "N4", "「食べる」の ば形は？", "食べれば", ["食べば", "食べるば", "食べらば"], "Groupe 2 : る → れば : 食べれば。")
 .q(COND, "N4", "「安い」の ば形は？", "安ければ", ["安いば", "安くば", "安かったば"], "Adjectif en い : い → ければ : 安ければ。");

// --- Don et réception (N4) ---
b.mc(DON, "N4", "友達が私に本を___ました。（Mon ami m'a donné un livre.）", "くれ", ["あげ", "もらい", "さしあげ"], "くれる = quelqu'un me donne (à moi ou à mon groupe).", FQ)
 .mc(DON, "N4", "私は友達に本を___ました。（J'ai donné un livre à un ami.）", "あげ", ["くれ", "もらい", "くださり"], "あげる = je donne à quelqu'un.", FQ)
 .mc(DON, "N4", "私は先生に本を___ました。（J'ai reçu un livre du professeur.）", "もらい", ["あげ", "くれ", "やり"], "もらう = je reçois de quelqu'un (la source se marque avec に ou から).", FQ)
 .mc(DON, "N4", "先生に漢字を教え___。（J'ai demandé au professeur de m'apprendre les kanji.）", "てもらいました", ["てあげました", "てくれました", "ておきました"], "〜てもらう : j'obtiens un service de quelqu'un (la personne se marque avec に).", FQ);

// --- Verbes transitifs et intransitifs (N4) ---
b.mc(VTR, "N4", "風で窓が___。（Le vent a ouvert la fenêtre : elle s'est ouverte.）", "開きました", ["開けました", "開かせました", "開けます"], "開く (intransitif) : la fenêtre s'ouvre toute seule. 開ける (transitif) demande un agent : 窓を開ける。", FQ)
 .mc(VTR, "N4", "私は窓を___。（J'ai ouvert la fenêtre.）", "開けました", ["開きました", "開きます", "開いています"], "開ける (transitif) avec を : 窓を開けました。", FQ)
 .mc(VTR, "N4", "ドアが開けて___。（La porte a été laissée ouverte, volontairement.）", "あります", ["います", "みます", "いきます"], "Verbe transitif + てある : résultat d'une action faite exprès. (Intransitif : ドアが開いている.)", PP)
 .mc(VTR, "N4", "電気が___。（La lumière s'est allumée.）", "つきました", ["つけました", "つけられました", "つけさせました"], "つく (intransitif) = s'allumer ; つける (transitif) = allumer (電気をつける).", FQ);

export const EXERCISES_JA_A = b.list;
