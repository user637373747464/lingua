// Sources conseillées (sites, podcasts, chaînes vidéo connus).
// - On ne garde que les ADRESSES D'ACCUEIL : les articles changent chaque jour.
// - Rien n'est copié depuis ces sites : l'application ouvre simplement le lien dans le navigateur.
// - Quand je ne suis pas sûr de l'adresse exacte d'une chaîne ou d'un podcast, le lien est une RECHERCHE
//   (YouTube / Apple Podcasts) sur le nom : il ne peut pas être « cassé ». Le bouton le dit clairement.

import { Lang } from "../types";

export type SourceKind = "article" | "podcast" | "video";
export type LevelId = "d" | "i" | "a";
export type ThemeId = "actu" | "science" | "culture" | "histoire" | "vie" | "langue";

export interface Source {
  id: string;
  lang: Lang;
  kind: SourceKind;
  name: string;
  description: string;
  levels: LevelId[];
  theme: ThemeId;
  url: string;
  /** Le lien est une page de recherche (et non l'adresse officielle). */
  search?: "youtube" | "podcasts";
}

export const LEVELS: { id: LevelId; label: string; hint: Record<Lang, string> }[] = [
  { id: "d", label: "Débutant", hint: { en: "A1 – A2", ja: "N5 – N4" } },
  { id: "i", label: "Intermédiaire", hint: { en: "B1 – B2", ja: "N3" } },
  { id: "a", label: "Avancé", hint: { en: "C1 et +", ja: "N2 – N1" } },
];

export const THEMES: Record<ThemeId, string> = {
  actu: "Actualité",
  science: "Sciences et technique",
  culture: "Culture et société",
  histoire: "Histoire et idées",
  vie: "Vie quotidienne",
  langue: "Apprendre la langue",
};

const L = (lv: string): LevelId[] => lv.split("") as LevelId[];

function src(lang: Lang, kind: SourceKind, id: string, name: string, lv: string, theme: ThemeId, url: string, description: string, search?: "youtube" | "podcasts"): Source {
  return { id: `${lang}-${kind}-${id}`, lang, kind, name, description, levels: L(lv), theme, url, ...(search ? { search } : {}) };
}

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const pod = (q: string) => `https://podcasts.apple.com/search?term=${encodeURIComponent(q)}`;

const EN: Source[] = [
  // ----- Actualités (articles) -----
  src("en", "article", "news-in-levels", "News in Levels", "d", "actu", "https://www.newsinlevels.com/", "La même actualité racontée à 3 niveaux de difficulté, avec audio."),
  src("en", "article", "voa", "VOA Learning English", "di", "actu", "https://learningenglish.voanews.com/", "Actualités et articles au vocabulaire simplifié, avec audio."),
  src("en", "article", "bne", "Breaking News English", "di", "actu", "https://breakingnewsenglish.com/", "Articles d'actualité adaptés à plusieurs niveaux, avec audio et exercices."),
  src("en", "article", "british-council-teens", "LearnEnglish Teens (British Council)", "d", "vie", "https://learnenglishteens.britishcouncil.org/", "Textes courts, quiz et audio pour les niveaux A1 à B2."),
  src("en", "article", "tfk", "TIME for Kids", "d", "actu", "https://www.timeforkids.com/", "Actualités écrites simplement, faciles à lire."),
  src("en", "article", "dogo", "DOGOnews", "di", "science", "https://www.dogonews.com/", "Articles courts sur la science, le monde et la culture."),
  src("en", "article", "simple-wiki", "Simple English Wikipedia", "d", "culture", "https://simple.wikipedia.org/", "Une encyclopédie écrite avec des mots et des phrases simples."),
  src("en", "article", "bbc-news", "BBC News", "ia", "actu", "https://www.bbc.com/news", "Actualité internationale, anglais britannique standard."),
  src("en", "article", "npr", "NPR", "ia", "actu", "https://www.npr.org/", "Actualité américaine, articles et transcriptions d'émissions."),
  src("en", "article", "ap", "Associated Press", "i", "actu", "https://apnews.com/", "Dépêches claires et factuelles."),
  src("en", "article", "guardian", "The Guardian", "ia", "culture", "https://www.theguardian.com/", "Actualité, opinions, culture ; gratuit."),
  src("en", "article", "aljazeera", "Al Jazeera English", "i", "actu", "https://www.aljazeera.com/", "Actualité du monde entier."),
  src("en", "article", "scientific-american", "Scientific American", "ia", "science", "https://www.scientificamerican.com/", "Science expliquée à un large public."),
  src("en", "article", "natgeo", "National Geographic", "i", "science", "https://www.nationalgeographic.com/", "Nature, voyage, sciences, histoire."),
  src("en", "article", "conversation", "The Conversation", "ia", "histoire", "https://theconversation.com/", "Articles écrits par des universitaires, accessibles et gratuits."),
  src("en", "article", "atlantic", "The Atlantic", "a", "histoire", "https://www.theatlantic.com/", "Essais et reportages longs ; quelques articles gratuits."),
  src("en", "article", "newyorker", "The New Yorker", "a", "culture", "https://www.newyorker.com/", "Reportages, essais et fiction ; quelques articles gratuits."),
  src("en", "article", "nature", "Nature News", "a", "science", "https://www.nature.com/news", "Actualité scientifique par la revue Nature."),
  src("en", "article", "aeon", "Aeon", "a", "histoire", "https://aeon.co/", "Essais de philosophie, science et société."),
  src("en", "article", "wired", "WIRED", "a", "science", "https://www.wired.com/", "Technologie, science et société."),
  src("en", "article", "economist", "The Economist", "a", "actu", "https://www.economist.com/", "Économie et politique ; en grande partie payant."),

  // ----- Podcasts -----
  src("en", "podcast", "6min", "6 Minute English (BBC)", "di", "langue", "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english", "6 minutes sur un sujet, avec vocabulaire et transcription."),
  src("en", "podcast", "english-we-speak", "The English We Speak (BBC)", "d", "langue", "https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak", "Une expression courante expliquée en quelques minutes."),
  src("en", "podcast", "voa-pod", "VOA Learning English (podcasts)", "d", "actu", "https://learningenglish.voanews.com/programs/radio", "Émissions lentes et simples, avec texte à lire."),
  src("en", "podcast", "all-ears", "All Ears English", "di", "vie", "https://www.allearsenglish.com/", "Conversations naturelles sur la vie de tous les jours."),
  src("en", "podcast", "vanessa", "Speak English with Vanessa", "di", "vie", "https://www.speakenglishwithvanessa.com/", "Podcasts et leçons claires, avec transcriptions."),
  src("en", "podcast", "luke", "Luke's English Podcast", "ia", "culture", "https://teacherluke.co.uk/", "Anglais britannique naturel, longs épisodes avec humour."),
  src("en", "podcast", "ted-daily", "TED Talks Daily", "ia", "culture", "https://www.ted.com/podcasts", "Une conférence courte par jour sur des idées variées."),
  src("en", "podcast", "planet-money", "Planet Money (NPR)", "i", "actu", "https://www.npr.org/podcasts/510289/planet-money", "L'économie racontée comme des histoires."),
  src("en", "podcast", "99pi", "99% Invisible", "ia", "culture", "https://99percentinvisible.org/", "Le design et l'architecture cachés dans la vie de tous les jours."),
  src("en", "podcast", "radiolab", "Radiolab", "ia", "science", "https://radiolab.org/", "Science et philosophie, très bien produit."),
  src("en", "podcast", "tal", "This American Life", "ia", "culture", "https://www.thisamericanlife.org/", "Histoires vraies de la vie américaine, avec transcriptions."),
  src("en", "podcast", "freakonomics", "Freakonomics Radio", "a", "histoire", "https://freakonomics.com/series/freakonomics-radio/", "Économie et comportements, avec transcriptions."),
  src("en", "podcast", "in-our-time", "In Our Time (BBC Radio 4)", "a", "histoire", "https://www.bbc.co.uk/programmes/b006qykl", "Des universitaires discutent d'histoire, de science, de philosophie."),
  src("en", "podcast", "hardcore-history", "Dan Carlin's Hardcore History", "a", "histoire", "https://www.dancarlin.com/hardcore-history-series/", "Longs récits d'histoire, anglais américain soutenu."),
  src("en", "podcast", "global-news", "Global News Podcast (BBC)", "ia", "actu", "https://www.bbc.co.uk/programmes/p02nq0gn", "Le point sur l'actualité mondiale, plusieurs fois par jour."),

  // ----- Vidéos -----
  src("en", "video", "bbc-le", "BBC Learning English", "di", "langue", "https://www.youtube.com/@bbclearningenglish", "Chaîne officielle : grammaire, vocabulaire, actualité simplifiée."),
  src("en", "video", "lucy", "English with Lucy", "di", "langue", "https://www.youtube.com/@EnglishwithLucy", "Cours clairs d'une prof britannique."),
  src("en", "video", "rachel", "Rachel's English", "di", "langue", "https://rachelsenglish.com/", "Prononciation américaine, très pédagogique."),
  src("en", "video", "voa-yt", "VOA Learning English (vidéos)", "d", "actu", "https://www.youtube.com/@VOALearningEnglish", "Vidéos lentes et sous-titrées."),
  src("en", "video", "easy-languages", "Easy Languages — English", "di", "vie", yt("Easy English street interviews Easy Languages"), "Interviews dans la rue avec sous-titres.", "youtube"),
  src("en", "video", "cnn10", "CNN 10", "i", "actu", "https://www.cnn.com/cnn10", "L'actualité en 10 minutes, avec sous-titres."),
  src("en", "video", "ted", "TED Talks", "ia", "culture", "https://www.ted.com/talks", "Conférences avec sous-titres et transcription interactive."),
  src("en", "video", "ted-ed", "TED-Ed", "di", "science", "https://www.youtube.com/@TEDEd", "Courtes animations éducatives, sous-titrées."),
  src("en", "video", "kurzgesagt", "Kurzgesagt — In a Nutshell", "ia", "science", "https://kurzgesagt.org/", "Science expliquée en animation."),
  src("en", "video", "crashcourse", "Crash Course", "i", "histoire", "https://thecrashcourse.com/", "Cours courts d'histoire, de sciences et de littérature."),
  src("en", "video", "vox", "Vox", "ia", "actu", "https://www.vox.com/videos", "Explications vidéo de l'actualité et de la société."),
  src("en", "video", "veritasium", "Veritasium", "ia", "science", "https://www.veritasium.com/", "Physique et idées scientifiques, avec rigueur."),
  src("en", "video", "3b1b", "3Blue1Brown", "a", "science", "https://www.3blue1brown.com/", "Mathématiques en images (utile en prépa)."),
  src("en", "video", "spacetime", "PBS Space Time", "a", "science", "https://www.pbs.org/show/space-time/", "Physique théorique et astronomie."),
  src("en", "video", "bigthink", "Big Think", "a", "histoire", "https://bigthink.com/", "Entretiens avec des experts et penseurs."),
  src("en", "video", "oxford-union", "Oxford Union", "a", "histoire", yt("Oxford Union debates"), "Débats et conférences de l'université d'Oxford.", "youtube"),
];

const JA: Source[] = [
  // ----- Actualités (articles) -----
  src("ja", "article", "nhk-easy", "NHK News Web Easy", "di", "actu", "https://www3.nhk.or.jp/news/easy/", "Actualité en japonais simplifié, avec furigana."),
  src("ja", "article", "tadoku", "Tadoku (lectures graduées gratuites)", "d", "culture", "https://tadoku.org/japanese/en/free-books/", "Petits livres gratuits classés par niveau."),
  src("ja", "article", "nhk-school", "NHK for School", "d", "science", "https://www.nhk.or.jp/school/", "Contenus pour écoliers japonais : textes simples, vidéos, sujets variés."),
  src("ja", "article", "kids-yahoo", "Yahoo! きっず", "d", "culture", "https://kids.yahoo.co.jp/", "Site pour enfants : explications et actualité avec furigana."),
  src("ja", "article", "satori", "Satori Reader", "di", "culture", "https://www.satorireader.com/", "Histoires avec explications ligne par ligne (une partie gratuite)."),
  src("ja", "article", "mainichi-kids", "毎日小学生新聞", "di", "actu", "https://mainichi.jp/maisho/", "Journal pour écoliers, vocabulaire accessible."),
  src("ja", "article", "nhk-news", "NHK NEWS WEB", "i", "actu", "https://www3.nhk.or.jp/news/", "Actualité en japonais standard, textes courts."),
  src("ja", "article", "yahoo-news", "Yahoo!ニュース", "ia", "actu", "https://news.yahoo.co.jp/", "Agrégateur des grands journaux japonais."),
  src("ja", "article", "asahi", "朝日新聞デジタル", "ia", "actu", "https://www.asahi.com/", "Grand quotidien ; une partie gratuite."),
  src("ja", "article", "mainichi", "毎日新聞", "ia", "actu", "https://mainichi.jp/", "Grand quotidien ; une partie gratuite."),
  src("ja", "article", "yomiuri", "読売新聞オンライン", "ia", "actu", "https://www.yomiuri.co.jp/", "Plus grand quotidien du Japon ; une partie gratuite."),
  src("ja", "article", "wiki-ja", "Wikipédia japonais", "ia", "culture", "https://ja.wikipedia.org/", "Encyclopédie : lis sur un sujet que tu connais déjà."),
  src("ja", "article", "matcha", "MATCHA", "i", "vie", "https://matcha-jp.com/jp", "Voyage et culture au Japon, articles accessibles."),
  src("ja", "article", "nikkei", "日本経済新聞", "a", "actu", "https://www.nikkei.com/", "Économie et entreprises ; en grande partie payant."),
  src("ja", "article", "toyokeizai", "東洋経済オンライン", "a", "culture", "https://toyokeizai.net/", "Économie, société, entreprise."),
  src("ja", "article", "aozora", "青空文庫 (Aozora Bunko)", "a", "histoire", "https://www.aozora.gr.jp/", "Littérature japonaise classique, gratuite (domaine public)."),

  // ----- Podcasts -----
  src("ja", "podcast", "teppei", "Nihongo con Teppei", "di", "langue", "https://nihongoconteppei.com/", "Japonais lent et naturel, version débutants disponible."),
  src("ja", "podcast", "pod101", "JapanesePod101", "di", "langue", "https://www.japanesepod101.com/", "Leçons audio par niveau (une partie gratuite)."),
  src("ja", "podcast", "ci", "Comprehensible Japanese", "di", "langue", "https://cijapanese.com/", "Japonais compréhensible grâce aux images et aux gestes."),
  src("ja", "podcast", "learnjapanesepod", "Learn Japanese Pod", "d", "langue", "https://www.learnjapanesepod.com/", "Leçons audio courtes pour débutants."),
  src("ja", "podcast", "nhk-world", "NHK WORLD-JAPAN (Easy Japanese)", "d", "langue", "https://www3.nhk.or.jp/nhkworld/", "Leçons « Easy Japanese » et actualité ; cherche « Learn Japanese »."),
  src("ja", "podcast", "bilingual-news", "バイリンガルニュース", "ia", "actu", pod("バイリンガルニュース Bilingual News"), "Deux présentateurs commentent l'actualité en japonais et en anglais.", "podcasts"),
  src("ja", "podcast", "nhk-radio", "NHKラジオ らじる★らじる", "i", "actu", "https://www.nhk.or.jp/radio/", "Radio NHK en direct et en replay."),
  src("ja", "podcast", "coten", "歴史を面白く学ぶ COTEN RADIO", "ia", "histoire", pod("COTEN RADIO"), "Histoire racontée de façon vivante, japonais naturel.", "podcasts"),
  src("ja", "podcast", "rebuild", "Rebuild", "a", "science", "https://rebuild.fm/", "Technologie et culture geek, conversation rapide."),
  src("ja", "podcast", "tbs-radio", "TBSラジオ", "ia", "culture", "https://www.tbsradio.jp/", "Radio d'actualité et de divertissement, replays gratuits."),
  src("ja", "podcast", "voicy", "Voicy", "ia", "vie", "https://voicy.jp/", "Plateforme de courtes émissions audio de tous sujets."),
  src("ja", "podcast", "allnight", "オールナイトニッポン", "a", "culture", "https://www.allnightnippon.com/", "Radio de nuit, humour et japonais très parlé."),
  src("ja", "podcast", "teppei-n3", "Nihongo con Teppei — intermédiaire", "i", "vie", pod("Nihongo con Teppei Intermediate"), "Discussions plus rapides sur la vie quotidienne.", "podcasts"),
  src("ja", "podcast", "teppei-adv", "Nihongo con Teppei — avancé", "a", "vie", pod("Nihongo con Teppei Advanced"), "Japonais rapide sur des sujets variés.", "podcasts"),

  // ----- Vidéos -----
  src("ja", "video", "misa", "Japanese Ammo with Misa", "d", "langue", yt("Japanese Ammo with Misa"), "Cours clairs en anglais, très bien pour commencer.", "youtube"),
  src("ja", "video", "ci-yt", "Comprehensible Japanese (vidéos)", "di", "langue", yt("Comprehensible Japanese"), "Vidéos en japonais avec images, faciles à suivre.", "youtube"),
  src("ja", "video", "easy-languages-ja", "Easy Languages — Japanese", "di", "vie", yt("Easy Japanese Easy Languages street interviews"), "Interviews dans la rue, sous-titres japonais/anglais.", "youtube"),
  src("ja", "video", "nihongo-no-mori", "日本語の森 (Nihongo no Mori)", "di", "langue", yt("日本語の森 JLPT N5 N4 N3"), "Leçons 100 % en japonais préparant le JLPT.", "youtube"),
  src("ja", "video", "nhk-world-v", "NHK WORLD-JAPAN", "di", "culture", "https://www3.nhk.or.jp/nhkworld/", "Documentaires et émissions sur le Japon, sous-titrés."),
  src("ja", "video", "nhk-school-v", "NHK for School (vidéos)", "d", "science", "https://www.nhk.or.jp/school/", "Courtes vidéos éducatives pour écoliers."),
  src("ja", "video", "tbs-dig", "TBS NEWS DIG", "ia", "actu", "https://newsdig.tbs.co.jp/", "Actualité en vidéo, japonais standard."),
  src("ja", "video", "ann", "テレビ朝日 ニュース (ANN)", "ia", "actu", "https://news.tv-asahi.co.jp/", "Actualité télévisée en japonais."),
  src("ja", "video", "ntv", "日テレNEWS", "ia", "actu", "https://news.ntv.co.jp/", "Actualité télévisée en japonais."),
  src("ja", "video", "fnn", "FNNプライムオンライン", "ia", "actu", "https://www.fnn.jp/", "Actualité en vidéo et en articles."),
  src("ja", "video", "txbiz", "テレ東BIZ", "a", "actu", "https://txbiz.tv-tokyo.co.jp/", "Économie et entreprises en vidéo."),
  src("ja", "video", "ted-ja", "TED (sous-titres japonais)", "ia", "culture", "https://www.ted.com/talks?language=ja", "Conférences : choisis les sous-titres japonais."),
  src("ja", "video", "nhk-yt", "NHK (chaîne YouTube)", "i", "actu", yt("NHK ニュース 公式"), "Extraits d'émissions et d'infos de la chaîne publique.", "youtube"),
  src("ja", "video", "miku", "Miku Real Japanese", "di", "langue", yt("Miku Real Japanese"), "Japonais naturel du quotidien, sous-titres.", "youtube"),
  src("ja", "video", "sushiramen", "Sushi Ramen Riku", "i", "vie", yt("Sushi Ramen Riku"), "Vie au Japon, japonais parlé avec sous-titres.", "youtube"),
  src("ja", "video", "newspicks", "NewsPicks", "a", "histoire", yt("NewsPicks 公式"), "Discussions d'actualité économique et de société.", "youtube"),
];

export const SOURCES: Source[] = [...EN, ...JA];

/** Sources d'une langue et d'un type, éventuellement filtrées par niveau et thème. */
export function pickSources(lang: Lang, kind: SourceKind | SourceKind[], level?: LevelId | "all", theme?: ThemeId | "all"): Source[] {
  const kinds = Array.isArray(kind) ? kind : [kind];
  return SOURCES.filter(
    (s) => s.lang === lang && kinds.includes(s.kind) && (!level || level === "all" || s.levels.includes(level)) && (!theme || theme === "all" || s.theme === theme),
  );
}
