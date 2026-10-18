import { Builder } from "./builders";

// Japonais : compléments N2 et N1. On ajoute à la fin, on ne réordonne jamais.
const b = new Builder("ja-c", "ja");
const EXP = "Expressions de liaison", KAN = "Lecture des kanji", VOC = "Vocabulaire";
const PP = "Choisis le mot ou l'expression qui convient.";
const FQ = "Choisis la bonne forme.";

// --- N2 ---
b.mc(EXP, "N2", "彼は子ども___、よく知っている。（pour un enfant）", "にしては", ["のおかげで", "をはじめ", "をよそに"], "〜にしては = pour (compte tenu de) ; exprime un écart avec ce qu'on attendrait.", PP)
 .mc(EXP, "N2", "この店は安い___、おいしい。（pour le prix, c'est bon）", "わりに", ["ために", "ばかりに", "ところに"], "〜わりに = compte tenu de, étonnamment par rapport à.", PP)
 .mc(EXP, "N2", "彼は英語___、フランス語も話せる。（non seulement… mais aussi）", "ばかりか", ["ばかりに", "ものの", "かたわら"], "〜ばかりか〜も = non seulement… mais aussi…", PP)
 .mc(EXP, "N2", "英語___、フランス語も話せる。（l'anglais, évidemment）", "はもちろん", ["にもかかわらず", "をはじめ", "について"], "〜はもちろん〜も = bien sûr… et aussi…", PP)
 .mc(EXP, "N2", "会議は東京___行われた。（lieu de l'événement, formel）", "において", ["にとって", "によって", "について"], "〜において = à, dans (lieu ou situation d'un événement ; formel).", PP)
 .mc(EXP, "N2", "この件___、何か質問がありますか。（au sujet de）", "に関して", ["として", "にとって", "によって"], "〜に関して = à propos de, concernant.", PP)
 .mc(EXP, "N2", "行くかどうかは天気___です。（selon la météo）", "次第", ["ずくめ", "まみれ", "がち"], "〜次第 = cela dépend de.", PP)
 .mc(EXP, "N2", "彼は遅れ___だ。（tendance à être en retard）", "がち", ["くさい", "まみれ", "ずくめ"], "ます形 + がち = avoir tendance à (souvent négatif).", PP)
 .mc(EXP, "N2", "それは噂___ない。（Ce n'est qu'une rumeur.）", "に過ぎ", ["に違い", "にたえ", "にあたら"], "〜に過ぎない = n'être rien de plus que.", PP)
 .mc(EXP, "N2", "約束したので、行かない___にはいかない。", "わけ", ["はず", "つもり", "ところ"], "〜わけにはいかない = on ne peut pas (pour des raisons de devoir ou de morale).", PP)
 .mc(EXP, "N2", "もう少しで転ぶ___だった。（J'ai failli tomber.）", "ところ", ["はず", "つもり", "ばかり"], "〜ところだった = avoir failli.", PP);

// --- N1 ---
b.mc(EXP, "N1", "入学___、書類を提出してください。（au moment de）", "に際して", ["にとって", "をめぐって", "をよそに"], "〜に際して = à l'occasion de, au moment de (formel).", PP)
 .mc(EXP, "N1", "台風で、旅行の中止を___。（On a été contraint d'annuler.）", "余儀なくされた", ["余儀なくした", "余儀なくなった", "余儀なかった"], "〜を余儀なくされる = être contraint de (passif).", FQ)
 .mc(EXP, "N1", "専門家___、間違えることはある。（même un expert）", "といえども", ["にとって", "ならでは", "とあって"], "〜といえども = même si, même (concessif, littéraire).", PP)
 .mc(EXP, "N1", "この味は老舗___のものだ。（propre à une maison ancienne）", "ならでは", ["といえども", "をもって", "にひきかえ"], "〜ならでは = propre à, que seul… peut offrir.", PP)
 .mc(EXP, "N1", "兄___、弟は静かだ。（à l'inverse de mon frère）", "にひきかえ", ["ならでは", "をもって", "といえども"], "〜にひきかえ = en contraste avec.", PP)
 .mc(EXP, "N1", "彼___、この仕事ができる人はいない。（hormis lui）", "をおいて", ["にそって", "にたえて", "をふまえて"], "〜をおいて(ほかに)ない = il n'y a personne d'autre que.", PP)
 .mc(EXP, "N1", "成功を願って___。（Je ne cesse de lui souhaiter le succès.）", "やまない", ["おかない", "ならない", "いられない"], "〜てやまない = ne pas cesser de (sentiment durable).", PP)
 .mc(EXP, "N1", "泣き出さ___の顔をしていた。（au bord des larmes）", "んばかり", ["ずじまい", "んがため", "ずくめ"], "〜んばかり = comme si on allait… (泣き出さんばかり).", PP)
 .mc(EXP, "N1", "前回の反省___、計画を立て直した。（en tenant compte de）", "をふまえて", ["をよそに", "をおいて", "をものともせず"], "〜をふまえて = en tenant compte de, en se fondant sur.", PP)
 .mc(EXP, "N1", "言ってくれれば手伝った___。（Si tu l'avais dit, je t'aurais aidé ! — reproche）", "ものを", ["ものの", "ものか", "ものなら"], "〜ものを = (regret ou reproche) alors que…", PP);

// --- Lecture des kanji (N2–N1) ---
b.q(KAN, "N1", "「逸脱」の読み方は？", "いつだつ", ["いちだつ", "いつぬ", "いつだっ"], "逸脱 = いつだつ (s'écarter de la norme).")
 .q(KAN, "N1", "「該当」の読み方は？", "がいとう", ["かいとう", "がいどう", "げいとう"], "該当 = がいとう (correspondre à).")
 .q(KAN, "N1", "「抽象」の読み方は？", "ちゅうしょう", ["ちゅうぞう", "ちょうしょう", "ちゅしょう"], "抽象 = ちゅうしょう (abstraction).")
 .q(KAN, "N1", "「顕著」の読み方は？", "けんちょ", ["けんしょ", "げんちょ", "けんじゅ"], "顕著 = けんちょ (remarquable, net).")
 .q(KAN, "N1", "「脆弱」の読み方は？", "ぜいじゃく", ["もろじゃく", "せいじゃく", "ぜいやく"], "脆弱 = ぜいじゃく (fragile, vulnérable).")
 .q(KAN, "N1", "「破綻」の読み方は？", "はたん", ["はじょう", "はたい", "ばたん"], "破綻 = はたん (faillite, effondrement).")
 .q(KAN, "N1", "「賄う」の読み方は？", "まかなう", ["わいなう", "まかなる", "ちがなう"], "賄う = まかなう (financer, couvrir).")
 .q(KAN, "N1", "「偏る」の読み方は？", "かたよる", ["へんる", "かたまる", "かたよう"], "偏る = かたよる (être déséquilibré, partial).")
 .q(KAN, "N2", "「普及」の読み方は？", "ふきゅう", ["ふぎゅう", "ふきょう", "ふっきゅう"], "普及 = ふきゅう (diffusion).")
 .q(KAN, "N2", "「軽減」の読み方は？", "けいげん", ["けいかん", "けいけん", "かるげん"], "軽減 = けいげん (réduction, allègement).")
 .q(KAN, "N2", "「確保」の読み方は？", "かくほ", ["かくぼ", "たしほ", "かくもう"], "確保 = かくほ (s'assurer, garantir).")
 .q(KAN, "N2", "「貢献」の読み方は？", "こうけん", ["こうげん", "ごうけん", "こうかん"], "貢献 = こうけん (contribution).");

// --- Vocabulaire (N2–N1) ---
b.q(VOC, "N2", "「傾向」の意味は？", "tendance", ["direction exacte", "obstacle", "habitude de mentir"], "傾向 = tendance.")
 .q(VOC, "N2", "「普及」の意味は？", "diffusion, popularisation", ["interruption", "imitation", "ancienneté"], "普及する = se répandre dans le public.")
 .q(VOC, "N2", "「軽減」の意味は？", "allègement, réduction", ["accroissement", "mensonge", "retard"], "軽減する = alléger, réduire (charge, impôt).")
 .q(VOC, "N2", "「確保」の意味は？", "s'assurer d'obtenir, garantir", ["perdre", "refuser", "emprunter"], "確保する = assurer la disponibilité de (place, budget…).")
 .q(VOC, "N2", "「依存」の意味は？", "dépendance", ["indépendance", "opposition", "silence"], "依存する = dépendre de.")
 .q(VOC, "N2", "「貢献」の意味は？", "contribution", ["compétition", "refus", "retard"], "貢献する = contribuer à.")
 .q(VOC, "N1", "「逸脱」の意味は？", "écart, déviation", ["fuite d'eau", "preuve", "obéissance"], "逸脱する = s'écarter de la norme ou du sujet.")
 .q(VOC, "N1", "「破綻」の意味は？", "effondrement, faillite", ["réconciliation", "ouverture", "simplification"], "破綻する = échouer complètement (entreprise, plan).")
 .q(VOC, "N1", "「顕著」の意味は？", "remarquable, net", ["discret", "fragile", "lent"], "顕著な = qui se remarque clairement.")
 .q(VOC, "N1", "「脆弱」の意味は？", "fragile, vulnérable", ["solide", "ancien", "coûteux"], "脆弱な = fragile, peu résistant.");

export const EXERCISES_JA_C = b.list;
