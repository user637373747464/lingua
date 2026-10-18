import type { Exercise } from "../exercises";

// Exercices préparés d'anglais (corrections et explications en français).
// Chaque exercice n'a qu'une réponse défendable parmi les choix proposés.

const T_TENSES = "Temps verbaux";
const T_COND = "Conditionnels et souhaits";
const T_PREP = "Prépositions";
const T_VOC = "Collocations et vocabulaire";
const T_SYNTAX = "Construction de phrases";

export const EXERCISES_EN: Exercise[] = [
  // --- Temps verbaux ---
  {
    id: "en-tense-01", lang: "en", topic: T_TENSES, level: "B1", type: "mcq",
    prompt: "Choisis la forme correcte.",
    sentence: "By the time we arrived, the film ___.",
    choices: ["has started", "had started", "was starting", "starts"],
    correct: 1,
    explanation: "Le film a commencé AVANT notre arrivée (deux actions passées, l'une antérieure à l'autre) : past perfect, « had started ».",
  },
  {
    id: "en-tense-02", lang: "en", topic: T_TENSES, level: "B1", type: "fill",
    prompt: "Complète avec le verbe « live » à la forme correcte.",
    sentence: "I ___ in Paris since 2019.",
    accepted: ["have lived", "have been living", "'ve lived", "'ve been living"],
    hint: "Action commencée dans le passé et toujours vraie maintenant, avec « since ».",
    explanation: "« since 2019 » indique un point de départ dans le passé qui dure jusqu'à maintenant : present perfect (« have lived ») ou present perfect continu (« have been living »).",
  },
  {
    id: "en-tense-03", lang: "en", topic: T_TENSES, level: "B1", type: "mcq",
    prompt: "Choisis la forme correcte.",
    sentence: "She ___ TV when the phone rang.",
    choices: ["watched", "was watching", "has watched", "watches"],
    correct: 1,
    explanation: "Une action en cours (« watching ») est interrompue par une action courte (« the phone rang ») : past continuous + past simple.",
  },
  {
    id: "en-tense-04", lang: "en", topic: T_TENSES, level: "B1", type: "fill",
    prompt: "Complète avec le verbe « rain » à la forme correcte.",
    sentence: "Take an umbrella! Look, it ___.",
    accepted: ["is raining", "'s raining"],
    explanation: "« Look » : on décrit ce qui se passe en ce moment même → present continuous (« is raining »).",
  },
  {
    id: "en-tense-05", lang: "en", topic: T_TENSES, level: "B2", type: "mcq",
    prompt: "Choisis la forme correcte.",
    sentence: "By next June, she ___ at the company for ten years.",
    choices: ["works", "will have worked", "will work", "has worked"],
    correct: 1,
    explanation: "« By next June » + durée accomplie à ce moment futur : future perfect (« will have worked »).",
  },
  {
    id: "en-tense-06", lang: "en", topic: T_TENSES, level: "B2", type: "mcq",
    prompt: "Choisis la forme correcte.",
    sentence: "He denied ___ the window.",
    choices: ["to break", "breaking", "break", "to breaking"],
    correct: 1,
    explanation: "« deny » est suivi d'un gérondif (verbe + -ing) : « He denied breaking the window ».",
  },
  {
    id: "en-tense-07", lang: "en", topic: T_TENSES, level: "B2", type: "mcq",
    prompt: "Choisis la forme correcte.",
    sentence: "I'm really tired. I ___ since six o'clock this morning.",
    choices: ["work", "am working", "have been working", "worked"],
    correct: 2,
    explanation: "Action commencée dans le passé, toujours en cours, avec insistance sur la durée (« since six ») : present perfect continuous.",
  },
  {
    id: "en-tense-08", lang: "en", topic: T_TENSES, level: "C1", type: "mcq",
    prompt: "Choisis la forme correcte.",
    sentence: "No sooner ___ the house than it started to rain.",
    choices: ["he had left", "had he left", "he left", "did he leave"],
    correct: 1,
    explanation: "Après « No sooner », on inverse sujet et auxiliaire, au past perfect : « No sooner had he left… than… ».",
  },

  // --- Conditionnels et souhaits ---
  {
    id: "en-cond-01", lang: "en", topic: T_COND, level: "B1", type: "mcq",
    prompt: "Choisis la forme correcte.",
    sentence: "If it rains tomorrow, we ___ at home.",
    choices: ["would stay", "will stay", "stayed", "stay"],
    correct: 1,
    explanation: "Condition réelle au futur (type 1) : if + présent, will + base verbale.",
  },
  {
    id: "en-cond-02", lang: "en", topic: T_COND, level: "B2", type: "mcq",
    prompt: "Choisis la forme correcte.",
    sentence: "If I had studied harder, I ___ the exam.",
    choices: ["would pass", "would have passed", "will pass", "had passed"],
    correct: 1,
    explanation: "Condition irréelle dans le passé (type 3) : if + past perfect, would have + participe passé.",
  },
  {
    id: "en-cond-03", lang: "en", topic: T_COND, level: "B2", type: "fill",
    prompt: "Complète avec le verbe « go » à la forme correcte (conditionnel mixte).",
    sentence: "I wouldn't be so tired now if I ___ to bed earlier last night.",
    accepted: ["had gone"],
    explanation: "Cause dans le passé (« last night »), conséquence dans le présent (« now ») : if + past perfect, would + base verbale.",
  },
  {
    id: "en-cond-04", lang: "en", topic: T_COND, level: "B2", type: "mcq",
    prompt: "Choisis la forme correcte.",
    sentence: "I'd rather you ___ smoke in here.",
    choices: ["don't", "didn't", "won't", "wouldn't"],
    correct: 1,
    explanation: "« I'd rather + sujet » exprime une préférence sur ce que fait quelqu'un d'autre et se construit avec le prétérit : « I'd rather you didn't… ».",
  },
  {
    id: "en-cond-05", lang: "en", topic: T_COND, level: "B2", type: "mcq",
    prompt: "Choisis la forme correcte.",
    sentence: "I wish I ___ more time yesterday.",
    choices: ["have", "had", "had had", "would have"],
    correct: 2,
    explanation: "Regret à propos du passé : « I wish + past perfect » (« had had » : « had » auxiliaire + « had » verbe avoir).",
  },
  {
    id: "en-cond-06", lang: "en", topic: T_COND, level: "C1", type: "mcq",
    prompt: "Choisis la forme correcte (inversion).",
    sentence: "___ you need any help, don't hesitate to ask.",
    choices: ["Should", "Would", "Did", "Had"],
    correct: 0,
    explanation: "Conditionnel formel avec inversion : « Should you need… » = « If you should need… » (condition possible dans le futur).",
  },
  {
    id: "en-cond-07", lang: "en", topic: T_COND, level: "C1", type: "mcq",
    prompt: "Choisis la forme correcte (inversion).",
    sentence: "___ I known about the delay, I would have left earlier.",
    choices: ["Had", "Should", "Were", "If"],
    correct: 0,
    explanation: "Condition irréelle dans le passé avec inversion : « Had I known… » = « If I had known… ».",
  },

  // --- Prépositions ---
  {
    id: "en-prep-01", lang: "en", topic: T_PREP, level: "B1", type: "mcq",
    prompt: "Choisis la préposition correcte.",
    sentence: "She is very good ___ playing chess.",
    choices: ["in", "at", "on", "for"],
    correct: 1,
    explanation: "« good at » + gérondif : être doué pour quelque chose.",
  },
  {
    id: "en-prep-02", lang: "en", topic: T_PREP, level: "B1", type: "mcq",
    prompt: "Choisis la préposition correcte.",
    sentence: "I'm interested ___ learning Japanese.",
    choices: ["on", "at", "in", "for"],
    correct: 2,
    explanation: "« interested in » : s'intéresser à.",
  },
  {
    id: "en-prep-03", lang: "en", topic: T_PREP, level: "B1", type: "fill",
    prompt: "Écris la préposition manquante.",
    sentence: "We arrived ___ the airport at noon.",
    accepted: ["at"],
    explanation: "« arrive at » + lieu précis (aéroport, gare, hôtel) ; « arrive in » + ville ou pays.",
  },
  {
    id: "en-prep-04", lang: "en", topic: T_PREP, level: "B2", type: "mcq",
    prompt: "Choisis la préposition correcte.",
    sentence: "He apologised ___ being late.",
    choices: ["of", "for", "about", "to"],
    correct: 1,
    explanation: "« apologise for » (quelque chose) et « apologise to » (quelqu'un) : ici, on s'excuse POUR le retard.",
  },
  {
    id: "en-prep-05", lang: "en", topic: T_PREP, level: "B2", type: "mcq",
    prompt: "Choisis la préposition correcte.",
    sentence: "The decision depends ___ the weather.",
    choices: ["of", "from", "on", "at"],
    correct: 2,
    explanation: "« depend on » : dépendre de (le français « de » ne se traduit pas par « of » ici).",
  },
  {
    id: "en-prep-06", lang: "en", topic: T_PREP, level: "B2", type: "fill",
    prompt: "Écris la préposition manquante.",
    sentence: "I'm looking forward ___ seeing you next week.",
    accepted: ["to"],
    explanation: "« look forward to » : ici « to » est une préposition, donc suivie d'un gérondif (« seeing »).",
  },
  {
    id: "en-prep-07", lang: "en", topic: T_PREP, level: "B2", type: "mcq",
    prompt: "Choisis la préposition correcte.",
    sentence: "She is married ___ a doctor.",
    choices: ["with", "to", "by", "of"],
    correct: 1,
    explanation: "« be married to » : être marié(e) à quelqu'un.",
  },
  {
    id: "en-prep-08", lang: "en", topic: T_PREP, level: "C1", type: "mcq",
    prompt: "Choisis la préposition correcte.",
    sentence: "The report is intended ___ policymakers.",
    choices: ["to", "for", "at", "by"],
    correct: 1,
    explanation: "« be intended for » + destinataire : le rapport est destiné aux décideurs.",
  },

  // --- Collocations et vocabulaire ---
  {
    id: "en-voc-01", lang: "en", topic: T_VOC, level: "B2", type: "mcq",
    prompt: "Choisis le verbe qui forme la bonne collocation.",
    sentence: "He ___ a real effort to improve his writing.",
    choices: ["did", "made", "took", "gave"],
    correct: 1,
    explanation: "On dit « make an effort » (faire un effort). Les collocations ne se déduisent pas du français : il faut les apprendre en bloc.",
  },
  {
    id: "en-voc-02", lang: "en", topic: T_VOC, level: "B2", type: "mcq",
    prompt: "Choisis le verbe qui forme la bonne collocation.",
    sentence: "We need to ___ the deadline.",
    choices: ["meet", "touch", "win", "catch"],
    correct: 0,
    explanation: "« meet a deadline » : respecter une échéance.",
  },
  {
    id: "en-voc-03", lang: "en", topic: T_VOC, level: "B2", type: "mcq",
    prompt: "Choisis l'adjectif qui forme la bonne collocation.",
    sentence: "I'd like a ___ coffee, please.",
    choices: ["strong", "powerful", "heavy", "hard"],
    correct: 0,
    explanation: "On dit « strong coffee / strong tea » (café fort). « Heavy rain », « heavy traffic », mais « strong coffee ».",
  },
  {
    id: "en-voc-04", lang: "en", topic: T_VOC, level: "B2", type: "mcq",
    prompt: "Choisis le mot qui convient.",
    sentence: "The company decided to ___ its prices because of rising costs.",
    choices: ["raise", "rise", "arise", "lift up"],
    correct: 0,
    explanation: "« raise » est transitif (augmenter quelque chose) ; « rise » est intransitif (monter de lui-même) : « Prices rise », mais « The company raised prices ».",
  },
  {
    id: "en-voc-05", lang: "en", topic: T_VOC, level: "C1", type: "mcq",
    prompt: "Choisis le mot qui convient.",
    sentence: "Despite the setbacks, the team managed to ___ the project on time.",
    choices: ["deliver", "deliberate", "dismiss", "defer"],
    correct: 0,
    explanation: "« deliver a project » : mener un projet à son terme. « Defer » signifie reporter, « dismiss » écarter, « deliberate » délibérer.",
  },
  {
    id: "en-voc-06", lang: "en", topic: T_VOC, level: "C1", type: "mcq",
    prompt: "Choisis le mot qui convient.",
    sentence: "The lawyer's argument was so ___ that nobody could disagree.",
    choices: ["compelling", "compulsory", "complacent", "complementary"],
    correct: 0,
    explanation: "« compelling » : convaincant, irrésistible. Attention aux faux amis : « compulsory » = obligatoire, « complacent » = suffisant, « complementary » = complémentaire.",
  },

  // --- Construction de phrases ---
  {
    id: "en-syn-01", lang: "en", topic: T_SYNTAX, level: "B1", type: "order",
    prompt: "Remets les mots dans l'ordre : « Je ne suis jamais allé au Japon. »",
    words: ["I", "have", "never", "been", "to", "Japan"],
    alternatives: [["Never", "have", "I", "been", "to", "Japan"]],
    explanation: "Sujet + have + adverbe de fréquence (never) + participe passé. L'adverbe se place entre l'auxiliaire et le participe.",
  },
  {
    id: "en-syn-02", lang: "en", topic: T_SYNTAX, level: "B1", type: "order",
    prompt: "Remets les mots dans l'ordre : « Elle travaille ici depuis 2018. »",
    words: ["She", "has", "been", "working", "here", "since", "2018"],
    alternatives: [["Since", "2018", "she", "has", "been", "working", "here"]],
    explanation: "Present perfect continuous : has been + verbe en -ing, puis le complément de temps avec « since ».",
  },
  {
    id: "en-syn-03", lang: "en", topic: T_SYNTAX, level: "B2", type: "order",
    prompt: "Remets les mots dans l'ordre : « Plus tu t'entraînes, meilleur tu deviens. »",
    words: ["The", "more", "you", "practise", "the", "better", "you", "get"],
    explanation: "Double comparatif : « The + comparatif, the + comparatif ».",
  },
  {
    id: "en-syn-04", lang: "en", topic: T_SYNTAX, level: "B2", type: "order",
    prompt: "Remets les mots dans l'ordre : « Elle m'a demandé si j'avais fini le rapport. »",
    words: ["She", "asked", "me", "whether", "I", "had", "finished", "the", "report"],
    explanation: "Question indirecte : pas d'inversion sujet/auxiliaire après « whether / if », et concordance des temps (finished → had finished).",
  },
  {
    id: "en-syn-05", lang: "en", topic: T_SYNTAX, level: "C1", type: "order",
    prompt: "Remets les mots dans l'ordre : « Non seulement il s'est excusé, mais il a aussi payé les dégâts. »",
    words: ["Not", "only", "did", "he", "apologise", "but", "he", "also", "paid", "for", "the", "damage"],
    explanation: "Après « Not only » en début de phrase, on inverse (did + sujet + base verbale) : « Not only did he apologise, but he also paid… ».",
  },
];
