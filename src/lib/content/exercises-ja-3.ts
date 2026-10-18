import { Builder } from "./builders";

// Japonais, niveaux N3 à N1. On ajoute à la fin, on ne réordonne jamais.
const b = new Builder("ja-b", "ja");
const STR = "Structures grammaticales", CON = "Conjugaison", KAN = "Lecture des kanji", VOC = "Vocabulaire", COND = "Conditionnels", PAR = "Particules", HON = "Politesse et keigo", EXP = "Expressions de liaison";
const PP = "Choisis le mot ou l'expression qui convient.";
const FQ = "Choisis la bonne forme.";

// --- Passif, causatif, forme potentielle (N3) ---
b.q(CON, "N3", "「読む」の passif est ?", "読まれる", ["読める", "読ませる", "読みられる"], "Groupe 1 : ligne あ + れる : 読まれる. (読める est la forme potentielle ; 読ませる est le causatif.)")
 .q(CON, "N3", "「食べる」の causatif est ?", "食べさせる", ["食べられる", "食べせる", "食べらせる"], "Groupe 2 : る → させる : 食べさせる (faire manger).")
 .q(CON, "N3", "「する」の causatif est ?", "させる", ["される", "しせる", "できる"], "する → させる (causatif) ; される est le passif ; できる le potentiel.")
 .q(CON, "N3", "「来る」の passif est ?", "来られる（こられる）", ["来れる（これる）", "来させる（こさせる）", "きられる"], "来る → 来られる (こられる) pour le passif, avec la même forme que le potentiel.")
 .mc(STR, "N3", "私は母に野菜を食べ___。（J'ai été forcé par ma mère de manger des légumes.）", "させられました", ["させました", "られました", "ました"], "Causatif-passif : 食べさせられる = être forcé de manger.", FQ)
 .mc(STR, "N3", "私は先生に___。（J'ai été félicité par le professeur.）", "ほめられました", ["ほめさせました", "ほめました", "ほめてあげました"], "Passif : ほめる → ほめられる (agent marqué par に).", FQ)
 .mc(STR, "N3", "日本語の新聞が___ようになりました。（Je suis maintenant capable de lire un journal en japonais.）", "読める", ["読んだ", "読もう", "読ませる"], "ようになる s'emploie avec la forme du dictionnaire ou la forme potentielle : 読めるようになった = devenir capable de lire.", FQ)
 .mc(STR, "N3", "漢字が___ますか。（Savez-vous lire les kanji ?）", "読め", ["読み", "読ま", "読んで"], "Forme potentielle poli : 読む → 読める → 読めます.", FQ);

// --- Expressions N3 ---
b.mc(STR, "N3", "この問題___、先生と話しました。（à propos de）", "について", ["によって", "にとって", "として"], "〜について = à propos de, au sujet de.", PP)
 .mc(STR, "N3", "私___、日本語はとても大切です。（pour moi）", "にとって", ["について", "によって", "として"], "〜にとって = pour (du point de vue de).", PP)
 .mc(STR, "N3", "彼は先生___働いています。（comme）", "として", ["について", "にとって", "によって"], "〜として = en tant que, comme.", PP)
 .mc(STR, "N3", "天気___、行くかどうか決めます。（selon, en fonction de）", "によって", ["について", "にとって", "として"], "〜によって = selon, en fonction de, par.", PP)
 .mc(STR, "N3", "私は来月、東京に引っ越す___にしました。（J'ai décidé de déménager.）", "こと", ["ため", "ところ", "らしい"], "〜ことにする = décider de (décision personnelle).", PP)
 .mc(STR, "N3", "勉強すれば___ほど、日本語はおもしろくなります。", "する", ["した", "して", "すれ"], "〜ば〜ほど = plus… plus… : 勉強すればするほど (plus j'étudie, plus c'est intéressant).", FQ)
 .mc(STR, "N3", "ドアが開けて___。（La porte a été laissée ouverte exprès.）", "あります", ["います", "みます", "くれます"], "Verbe transitif + てある : résultat d'une action faite dans un but. (Avec un verbe intransitif : 開いている.)", PP)
 .mc(STR, "N3", "子どもたちは遊び___で、宿題をしません。（Ils jouent sans arrêt et ne font pas leurs devoirs.）", "っぱなし", ["たて", "かけ", "がたい"], "〜っぱなし : laisser dans le même état, continuer sans s'arrêter (遊びっぱなし).", PP)
 .mc(STR, "N3", "このケーキは焼き___です。（Ce gâteau vient d'être cuit.）", "たて", ["っぱなし", "かけ", "すぎ"], "〜たて = tout juste fait (焼きたて, 作りたて).", PP)
 .mc(STR, "N3", "この料理は作り___です。（Ce plat est facile à faire.）", "やすい", ["にくい", "すぎる", "たがる"], "ます形 + やすい = facile à ; にくい = difficile à.", PP)
 .mc(STR, "N3", "食べ___て、お腹が痛くなりました。（J'ai trop mangé…）", "すぎ", ["やすく", "かけ", "たて"], "ます形 + すぎる = faire trop de : 食べすぎる.", PP)
 .mc(STR, "N3", "彼が来る___です。（Il doit sûrement venir.）", "はず", ["つもり", "ため", "ところ"], "〜はず = ça devrait être le cas (attente logique).", PP)
 .mc(STR, "N3", "今、出かける___です。（Je suis sur le point de sortir.）", "ところ", ["はず", "ため", "つもり"], "Forme du dictionnaire + ところ = être sur le point de ; ている + ところ = être en train de.", PP)
 .mc(STR, "N3", "この映画は子ども___の映画です。（destiné aux enfants）", "向け", ["並み", "気味", "ずくめ"], "〜向け = destiné à (子ども向け).", PP);

// --- Don et réception / keigo (N3) ---
b.mc(HON, "N3", "先生は明日、学校に___。（Le professeur viendra demain. — honorifique）", "いらっしゃいます", ["参ります", "いたします", "おります"], "Honorifique (sonkeigo) pour 来る / 行く / いる : いらっしゃる.", FQ)
 .mc(HON, "N3", "私は田中と___。（Je m'appelle Tanaka. — humble）", "申します", ["おっしゃいます", "言われます", "言うます"], "申す = forme humble de 言う (kenjōgo).", FQ)
 .mc(HON, "N3", "社長は何を___か。（Que dit le président ? — honorifique）", "おっしゃいます", ["申します", "言います", "おっしゃります"], "おっしゃる = forme honorifique de 言う (le poli おっしゃいます).", FQ)
 .mc(HON, "N3", "お客様、どうぞ___ください。（Mangez, je vous en prie. — honorifique）", "召し上がって", ["いただいて", "食べさせて", "拝見して"], "召し上がる = honorifique de 食べる / 飲む ; いただく est l'humble.", FQ)
 .mc(HON, "N3", "私が資料を___。（Je vais prendre la documentation. — humble）", "お持ちします", ["お持ちになります", "お持ちください", "持たれます"], "お + radical + する = forme humble (c'est moi qui agis pour l'autre).", FQ);

// --- Conditionnels et connecteurs (N3–N2) ---
b.q(COND, "N3", "「雨が降ると、試合は中止になります。」のと は何を表しますか。", "résultat naturel ou automatique", ["supposition personnelle", "demande polie", "souhait irréalisable"], "〜と exprime un lien naturel (loi, habitude, résultat automatique).")
 .mc(COND, "N3", "行く___、一緒に行きましょう。（Si tu y vas, allons-y ensemble.）", "なら", ["たり", "ながら", "ので"], "〜なら : « si c'est le cas », en réaction à ce que dit l'autre.", PP)
 .mc(COND, "N2", "もっと勉強すれ___良かった。（J'aurais dû étudier davantage.）", "ば", ["と", "たら", "ても"], "〜ばよかった = j'aurais dû, j'aurais mieux fait de (regret).", PP)
 .mc(COND, "N2", "彼は忙しい___、毎日ジムに通っている。（bien qu'il soit occupé）", "のに", ["ので", "から", "ば"], "〜のに = bien que, alors que (contraste inattendu).", PP);

// --- Expressions N2 ---
b.mc(EXP, "N2", "彼は努力した___、合格できなかった。（malgré ses efforts）", "にもかかわらず", ["おかげで", "ために", "によって"], "〜にもかかわらず = malgré.", PP)
 .mc(EXP, "N2", "嫌いな___ではないが、あまり食べない。（Ce n'est pas que je n'aime pas…）", "わけ", ["はず", "べき", "つもり"], "〜わけではない = ce n'est pas que… (nuancer, ne pas conclure).", PP)
 .mc(EXP, "N2", "雨の___、遠足が中止になった。（à cause de la pluie, effet négatif）", "せいで", ["おかげで", "くせに", "つもりで"], "〜せいで = à cause de (le blâme tombe sur la cause) ; おかげで = grâce à.", PP)
 .mc(EXP, "N2", "先生の___、合格できました。（grâce à mon professeur）", "おかげで", ["せいで", "くせに", "つもりで"], "〜おかげで = grâce à (cause positive).", PP)
 .mc(EXP, "N2", "あの人は犯人___ない。（C'est certainement le coupable.）", "に違い", ["かもしれ", "のはずで", "らしく"], "〜に違いない = certainement, sans aucun doute.", PP)
 .mc(EXP, "N2", "去年___、今年は暑い。（par rapport à l'an dernier）", "に比べて", ["について", "にとって", "として"], "〜に比べて = par rapport à, comparé à.", PP)
 .mc(EXP, "N2", "行か___を得ない。（Je suis obligé d'y aller.）", "ざる", ["ない", "ず", "なく"], "〜ざるを得ない = ne pas avoir d'autre choix que (forme littéraire de ない = ざる).", PP)
 .mc(EXP, "N2", "雨が降ろう___、試合は行われる。（qu'il pleuve ou non）", "が", ["を", "に", "で"], "〜（よ）うが = même si… quoi qu'il en soit (降ろうが).", PP)
 .mc(EXP, "N2", "この仕事は経験___問いません。（L'expérience n'a pas d'importance.）", "を", ["が", "に", "と"], "〜を問わない = sans distinction de, peu importe.", PP);

// --- Expressions N1 ---
b.mc(EXP, "N1", "本日___閉店いたします。（à compter d'aujourd'hui, nous fermons）", "をもって", ["をもとに", "をめぐって", "をよそに"], "〜をもって = avec, à partir de (formel, sert à marquer une date limite).", PP)
 .mc(EXP, "N1", "その問題___、意見が分かれている。（à propos de, autour de）", "をめぐって", ["をもって", "をよそに", "をはじめ"], "〜をめぐって = autour de (un sujet de débat).", PP)
 .mc(EXP, "N1", "親の心配___、彼は一人旅に出かけた。（sans se soucier de）", "をよそに", ["をめぐって", "をもって", "をはじめ"], "〜をよそに = sans tenir compte de, en ignorant.", PP)
 .mc(EXP, "N1", "社長___、社員全員が参加した。（à commencer par le président）", "をはじめ", ["をよそに", "をめぐり", "をもとに"], "〜をはじめ = à commencer par, y compris.", PP)
 .mc(EXP, "N1", "彼は会社で働く___、小説も書いている。（tout en travaillant）", "かたわら", ["あげく", "とたん", "きり"], "〜かたわら = tout en (faisant une activité principale à côté d'une autre).", PP)
 .mc(EXP, "N1", "努力した___、結果は出なかった。（Bien que j'aie fait des efforts, …）", "ものの", ["からには", "とたんに", "きっかけに"], "〜ものの = bien que, c'est vrai que… mais.", PP)
 .mc(EXP, "N1", "笑わ___はいられない。（On ne peut pas s'empêcher de rire.）", "ずに", ["ずを", "ずが", "なくに"], "〜ずにはいられない = ne pas pouvoir s'empêcher de.", PP)
 .mc(EXP, "N1", "約束した___は、守らなければならない。（puisque j'ai promis）", "からには", ["ものの", "にしては", "かたわら"], "〜からには = puisque, dès lors que (implique un devoir).", PP);

// --- Lecture des kanji (N3–N1) ---
b.q(KAN, "N3", "「経験」の読み方は？", "けいけん", ["きょうけん", "けいげん", "けえけん"], "経験 = けいけん.")
 .q(KAN, "N3", "「約束」の読み方は？", "やくそく", ["やくぞく", "やぐそく", "やくそう"], "約束 = やくそく.")
 .q(KAN, "N3", "「準備」の読み方は？", "じゅんび", ["じゅんぴ", "しゅんび", "じゅうび"], "準備 = じゅんび.")
 .q(KAN, "N3", "「説明」の読み方は？", "せつめい", ["せつみょう", "せっめい", "ぜつめい"], "説明 = せつめい.")
 .q(KAN, "N3", "「習慣」の読み方は？", "しゅうかん", ["しゅかん", "しゅうがん", "しゅうけん"], "習慣 = しゅうかん.")
 .q(KAN, "N3", "「景色」の読み方は？", "けしき", ["けいしき", "けいいろ", "けいじき"], "景色 = けしき (cas particulier de lecture).")
 .q(KAN, "N3", "「相談」の読み方は？", "そうだん", ["そうたん", "しょうだん", "そうたい"], "相談 = そうだん.")
 .q(KAN, "N3", "「季節」の読み方は？", "きせつ", ["きふし", "きせい", "ぎせつ"], "季節 = きせつ.")
 .q(KAN, "N2", "「頻繁」の読み方は？", "ひんぱん", ["ひんはん", "ぴんぱん", "ひんばん"], "頻繁 = ひんぱん.")
 .q(KAN, "N2", "「貴重」の読み方は？", "きちょう", ["きじゅう", "ぎちょう", "きちょ"], "貴重 = きちょう.")
 .q(KAN, "N2", "「延期」の読み方は？", "えんき", ["のべき", "えんぎ", "えんごく"], "延期 = えんき.")
 .q(KAN, "N2", "「概念」の読み方は？", "がいねん", ["かいねん", "がいねい", "がいてん"], "概念 = がいねん.")
 .q(KAN, "N1", "「曖昧」の読み方は？", "あいまい", ["あいみ", "あいめい", "あいみょう"], "曖昧 = あいまい.")
 .q(KAN, "N1", "「懸念」の読み方は？", "けねん", ["けんねん", "かんねん", "けいねん"], "懸念 = けねん.")
 .q(KAN, "N1", "「妥協」の読み方は？", "だきょう", ["たきょう", "だけい", "だきょ"], "妥協 = だきょう.")
 .q(KAN, "N1", "「把握」の読み方は？", "はあく", ["はわく", "はくあく", "ばあく"], "把握 = はあく.")
 .q(KAN, "N1", "「葛藤」の読み方は？", "かっとう", ["かつとう", "くずとう", "かっどう"], "葛藤 = かっとう.");

// --- Vocabulaire (N3–N1) ---
b.q(VOC, "N3", "「案内」の意味は？", "guider, informer", ["refuser", "annoncer un décès", "rendre visite"], "案内する = guider, faire visiter, informer.")
 .q(VOC, "N3", "「遠慮」の意味は？", "se retenir par politesse", ["se plaindre", "être éloigné", "partir en voyage"], "遠慮する = se retenir, décliner poliment.")
 .q(VOC, "N3", "「検討」の意味は？", "examiner, étudier (une proposition)", ["refuser", "regarder la télévision", "se fâcher"], "検討する = examiner, réfléchir à une proposition.")
 .q(VOC, "N2", "「維持」の意味は？", "maintenir", ["abandonner", "interdire", "oublier"], "維持する = maintenir en l'état.")
 .q(VOC, "N2", "「緩和」の意味は？", "atténuer, assouplir", ["durcir", "reculer", "imiter"], "緩和する = atténuer, desserrer.")
 .q(VOC, "N1", "「妥協」の意味は？", "compromis", ["conflit", "mensonge", "départ"], "妥協 = compromis.")
 .q(VOC, "N1", "「把握」の意味は？", "saisir, bien comprendre", ["rejeter", "déplacer", "améliorer"], "把握する = saisir, cerner une situation.");

export const EXERCISES_JA_B = b.list;
