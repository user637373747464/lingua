// Sources conseillées (sites et podcasts connus). On ne garde que les ADRESSES D'ACCUEIL : les articles changent chaque jour.
// Rien n'est copié depuis ces sites : l'application ouvre simplement le lien dans le navigateur.

import { Lang, TextKind } from "../types";

export interface Source {
  id: string;
  lang: Lang;
  kind: Extract<TextKind, "article" | "podcast">;
  name: string;
  description: string;
  level: string;
  url: string;
}

export const SOURCES: Source[] = [
  {
    id: "voa-learning-english",
    lang: "en",
    kind: "article",
    name: "VOA Learning English",
    description: "Actualités et articles écrits avec un vocabulaire simplifié, souvent avec audio.",
    level: "A2 – B2",
    url: "https://learningenglish.voanews.com/",
  },
  {
    id: "news-in-levels",
    lang: "en",
    kind: "article",
    name: "News in Levels",
    description: "Une même actualité racontée à trois niveaux de difficulté, avec audio.",
    level: "A1 – B1",
    url: "https://www.newsinlevels.com/",
  },
  {
    id: "bbc-learning-english",
    lang: "en",
    kind: "podcast",
    name: "BBC Learning English",
    description: "Émissions et podcasts pour apprendre l'anglais (dont « 6 Minute English »), avec transcriptions.",
    level: "A2 – C1",
    url: "https://www.bbc.co.uk/learningenglish",
  },
  {
    id: "nhk-news-web-easy",
    lang: "ja",
    kind: "article",
    name: "NHK News Web Easy",
    description: "Actualités en japonais simplifié, avec furigana (la lecture au-dessus des kanji).",
    level: "N5 – N3",
    url: "https://www3.nhk.or.jp/news/easy/",
  },
  {
    id: "nihongo-con-teppei",
    lang: "ja",
    kind: "podcast",
    name: "Nihongo con Teppei",
    description: "Podcast en japonais lent et simple, pour débutants.",
    level: "Débutant – N4",
    url: "https://nihongoconteppei.com/",
  },
];
