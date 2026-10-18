import type { Lesson } from "../lessons";

const T1 = "Les temps";
const T2 = "Phrases et structures";
const T3 = "Mots et petits mots";
const T4 = "Référence";

export const LESSONS_EN: Lesson[] = [
  {
    id: "en-present", lang: "en", topic: T1, level: "A1", title: "Présent simple et présent continu",
    summary: "Habitudes et vérités générales, ou action en cours.",
    blocks: [
      { t: "p", text: "**Présent simple** : habitudes, vérités générales, horaires. **Présent continu** (be + verbe-ing) : ce qui se passe en ce moment, ou un projet proche." },
      { t: "table", head: ["", "Présent simple", "Présent continu"], rows: [
        ["Affirmatif", "She works.", "She is working."],
        ["Négatif", "She doesn't work.", "She isn't working."],
        ["Question", "Does she work?", "Is she working?"],
      ] },
      { t: "ex", items: [
        { text: "I drink coffee every morning.", tr: "Je bois du café tous les matins." },
        { text: "Water boils at 100 °C.", tr: "L'eau bout à 100 °C." },
        { text: "Look! It is raining.", tr: "Regarde ! Il pleut." },
        { text: "I'm meeting Sam tomorrow.", tr: "Je retrouve Sam demain (c'est prévu)." },
      ] },
      { t: "list", items: [
        "Au présent simple, **he/she/it** prend un **-s** : he works, she goes, it watches.",
        "Mots fréquents du présent simple : always, usually, often, sometimes, never, every day.",
        "Mots fréquents du présent continu : now, at the moment, today, these days.",
      ] },
      { t: "warn", text: "Certains verbes (know, like, love, want, need, understand, believe) ne se mettent normalement pas au continu : on dit « I know », pas « I am knowing »." },
    ],
  },
  {
    id: "en-past", lang: "en", topic: T1, level: "A2", title: "Prétérit simple et prétérit continu",
    summary: "Raconter le passé : action terminée, ou action en cours interrompue.",
    blocks: [
      { t: "p", text: "**Prétérit simple** : une action terminée à un moment du passé (verbe + -ed, ou forme irrégulière). **Prétérit continu** (was/were + verbe-ing) : une action en cours à ce moment-là." },
      { t: "ex", items: [
        { text: "I visited Tokyo in 2019.", tr: "J'ai visité Tokyo en 2019." },
        { text: "She was watching TV when the phone rang.", tr: "Elle regardait la télé quand le téléphone a sonné." },
        { text: "What were you doing at 8 p.m.?", tr: "Que faisais-tu à 20 h ?" },
      ] },
      { t: "list", items: [
        "Négatif et question du prétérit simple : **did** + infinitif sans « to » (« Did you go ? », « I didn't go »). Le verbe ne prend plus -ed.",
        "L'action courte (prétérit simple) interrompt l'action longue (prétérit continu).",
        "Indicateurs du prétérit simple : yesterday, last week, in 2010, two days ago.",
      ] },
      { t: "tip", text: "Les verbes irréguliers (go → went, see → saw…) sont dans la fiche « Verbes irréguliers »." },
    ],
  },
  {
    id: "en-perfect", lang: "en", topic: T1, level: "B1", title: "Present perfect",
    summary: "Lien entre le passé et maintenant : have/has + participe passé.",
    blocks: [
      { t: "p", text: "Le **present perfect** (have/has + participe passé) relie le passé au présent : expérience de vie, résultat visible maintenant, ou situation qui dure encore." },
      { t: "ex", items: [
        { text: "I have visited Japan twice.", tr: "J'ai visité le Japon deux fois (dans ma vie)." },
        { text: "She has lost her keys.", tr: "Elle a perdu ses clés (et ne les a toujours pas)." },
        { text: "We have lived here since 2018.", tr: "Nous habitons ici depuis 2018." },
        { text: "How long have you known him?", tr: "Depuis combien de temps le connais-tu ?" },
      ] },
      { t: "table", head: ["Present perfect", "Prétérit simple"], rows: [
        ["Période non terminée ou date non précisée", "Moment précis et terminé dans le passé"],
        ["I have seen that film.", "I saw that film last year."],
        ["since / for / ever / never / just / already / yet", "yesterday / ago / in 2015 / last week"],
      ] },
      { t: "list", items: [
        "**for** + durée (for three years) ; **since** + point de départ (since 2021).",
        "Avec une date précise du passé, on n'utilise PAS le present perfect : « I saw him yesterday », pas « I have seen him yesterday ».",
        "En français on dit « depuis », en anglais on met le verbe au present perfect : « I have lived here for 5 years » = « J'habite ici depuis 5 ans ».",
      ] },
    ],
  },
  {
    id: "en-perfect2", lang: "en", topic: T1, level: "B2", title: "Past perfect, future perfect et formes continues du perfect",
    summary: "Antériorité dans le passé et le futur, et durée.",
    blocks: [
      { t: "table", head: ["Temps", "Formation", "Exemple"], rows: [
        ["Past perfect", "had + participe passé", "When I arrived, the film had started."],
        ["Future perfect", "will have + participe passé", "By June, she will have finished."],
        ["Present perfect continuous", "have/has been + verbe-ing", "I have been waiting for an hour."],
        ["Past perfect continuous", "had been + verbe-ing", "She was tired: she had been working all day."],
      ] },
      { t: "list", items: [
        "**Past perfect** : une action passée qui a eu lieu AVANT une autre action passée.",
        "**Future perfect** : une action qui sera terminée avant un moment futur (souvent avec « by »).",
        "**Formes continues** : on insiste sur la durée ou sur l'activité en cours, pas seulement sur le résultat.",
      ] },
      { t: "ex", items: [
        { text: "I had never seen snow before I moved to Canada.", tr: "Je n'avais jamais vu la neige avant de déménager au Canada." },
        { text: "By 2030 they will have built the bridge.", tr: "D'ici 2030, ils auront construit le pont." },
        { text: "Your eyes are red. Have you been crying?", tr: "Tes yeux sont rouges. Tu as pleuré ?" },
      ] },
    ],
  },
  {
    id: "en-future", lang: "en", topic: T1, level: "A2", title: "Parler du futur : will, going to, présent continu",
    summary: "Quelle forme choisir pour parler de l'avenir.",
    blocks: [
      { t: "table", head: ["Forme", "Utilisation", "Exemple"], rows: [
        ["will + verbe", "décision prise sur le moment, promesse, prédiction", "I'll help you. / It will rain tomorrow."],
        ["be going to + verbe", "intention décidée à l'avance, prédiction avec une preuve", "I'm going to study law. / Look at those clouds: it's going to rain."],
        ["présent continu", "rendez-vous ou projet déjà organisé", "I'm seeing the dentist at 4."],
        ["présent simple", "horaire officiel", "The train leaves at 9:15."],
      ] },
      { t: "warn", text: "Après if, when, as soon as, before, after, until : on n'utilise PAS will. « If it rains, we will stay home » (pas « if it will rain »)." },
    ],
  },
  {
    id: "en-conditionals", lang: "en", topic: T2, level: "B1", title: "Conditionnels (type 0, 1, 2, 3) et wish",
    summary: "Les « si » en anglais, selon le degré de réalité.",
    blocks: [
      { t: "table", head: ["Type", "if + …", "Principale", "Sens"], rows: [
        ["0", "present simple", "present simple", "vérité générale : If you heat ice, it melts."],
        ["1", "present simple", "will + verbe", "possible dans le futur : If it rains, I will stay home."],
        ["2", "prétérit simple", "would + verbe", "irréel ou peu probable : If I had money, I would travel."],
        ["3", "past perfect", "would have + participe passé", "irréel du passé : If I had studied, I would have passed."],
      ] },
      { t: "list", items: [
        "Au type 2, on dit souvent « **If I were** you » (were pour tous les sujets) : « If I were you, I would wait. »",
        "**Wish** + prétérit = regret sur le présent : « I wish I had a car » (je voudrais avoir une voiture).",
        "**Wish** + past perfect = regret sur le passé : « I wish I had studied more ».",
        "**Wish** + would = agacement envers quelqu'un : « I wish you would stop talking ».",
        "**Unless** = « if … not » : « Unless you hurry, you'll be late ».",
      ] },
    ],
  },
  {
    id: "en-modals", lang: "en", topic: T2, level: "B1", title: "Verbes modaux",
    summary: "can, could, may, might, must, should, would… : sens et pièges.",
    blocks: [
      { t: "table", head: ["Modal", "Sens principal", "Exemple"], rows: [
        ["can", "capacité, permission", "I can swim. / Can I sit here?"],
        ["could", "capacité passée, demande polie, possibilité", "I could run fast as a child. / Could you help me?"],
        ["may / might", "possibilité (might = plus faible), permission formelle (may)", "It might rain. / May I come in?"],
        ["must", "obligation forte, déduction certaine", "You must stop. / He must be tired."],
        ["have to", "obligation (extérieure)", "I have to work tomorrow."],
        ["should", "conseil", "You should see a doctor."],
        ["would", "habitude passée, conditionnel, demande polie", "Would you like some tea?"],
      ] },
      { t: "list", items: [
        "Un modal est suivi de l'**infinitif sans « to »** et n'a jamais de -s à la 3e personne : « she can swim ».",
        "**mustn't** = interdiction ; **don't have to** = pas obligé : « You mustn't smoke » ≠ « You don't have to come ».",
        "Passé : must → had to ; can → could / was able to ; should + have + participe passé = reproche (« You should have called »).",
      ] },
    ],
  },
  {
    id: "en-passive", lang: "en", topic: T2, level: "B1", title: "La voix passive",
    summary: "be + participe passé : quand l'agent est inconnu ou sans importance.",
    blocks: [
      { t: "p", text: "On forme le passif avec **be** (au temps voulu) + **participe passé**. L'objet de la phrase active devient le sujet." },
      { t: "table", head: ["Temps", "Actif", "Passif"], rows: [
        ["Présent simple", "They make cars here.", "Cars are made here."],
        ["Prétérit simple", "Someone stole my bike.", "My bike was stolen."],
        ["Present perfect", "They have finished the work.", "The work has been finished."],
        ["Futur (will)", "They will announce the results.", "The results will be announced."],
        ["Modal", "You must do it.", "It must be done."],
      ] },
      { t: "tip", text: "L'agent se met avec « by » seulement s'il est important : « The book was written by Orwell »." },
    ],
  },
  {
    id: "en-reported", lang: "en", topic: T2, level: "B2", title: "Le discours indirect",
    summary: "Rapporter des paroles : concordance des temps.",
    blocks: [
      { t: "p", text: "Quand le verbe d'introduction est au passé (said, told, asked), on « recule » généralement d'un temps." },
      { t: "table", head: ["Paroles directes", "Discours indirect"], rows: [
        ["« I am tired. »", "She said she was tired."],
        ["« I work here. »", "He said he worked there."],
        ["« I have finished. »", "She said she had finished."],
        ["« I will call you. »", "He said he would call me."],
        ["« I can help. »", "She said she could help."],
      ] },
      { t: "list", items: [
        "**said (that)** … mais **told + personne** : « He told me he was late ».",
        "Questions : on remet l'ordre affirmatif, sans do/does/did : « She asked where I lived ». Avec oui/non : **if / whether**.",
        "Adaptations : now → then, today → that day, tomorrow → the next day, here → there, this → that.",
      ] },
    ],
  },
  {
    id: "en-questions", lang: "en", topic: T2, level: "A2", title: "Poser des questions",
    summary: "Ordre des mots, do/does/did, mots interrogatifs.",
    blocks: [
      { t: "list", items: [
        "Avec **be** et les auxiliaires/modaux : on inverse. « Is she here? » « Can you swim? » « Have they left? »",
        "Aux autres temps simples : **do / does / did** + sujet + infinitif. « Where do you live? » « Did he call? »",
        "Question sur le **sujet** : pas de do. « Who called you? » (et pas « Who did call you? »)",
        "Mots interrogatifs : who, what, where, when, why, which, whose, how (how much, how many, how long, how often).",
      ] },
      { t: "ex", items: [
        { text: "What time does the film start?", tr: "À quelle heure commence le film ?" },
        { text: "How long have you lived here?", tr: "Depuis combien de temps habites-tu ici ?" },
        { text: "You live here, don't you?", tr: "Tu habites ici, n'est-ce pas ?" },
      ] },
      { t: "tip", text: "Question tag : phrase affirmative → tag négatif (« …, isn't it? »), phrase négative → tag positif (« …, is it? »)." },
    ],
  },
  {
    id: "en-gerund", lang: "en", topic: T2, level: "B1", title: "Gérondif (-ing) ou infinitif ?",
    summary: "Quel verbe se construit avec quoi.",
    blocks: [
      { t: "table", head: ["+ verbe-ing", "+ to + infinitif"], rows: [
        ["enjoy, finish, avoid, mind, suggest, deny, keep, practise, consider", "want, decide, hope, plan, manage, refuse, promise, learn, afford, need"],
        ["I enjoy reading.", "I want to read."],
      ] },
      { t: "list", items: [
        "Après une **préposition** : toujours -ing. « I'm interested in learning » ; « Thanks for helping ».",
        "**like, love, hate, start, begin** : les deux sont possibles, avec peu de différence.",
        "**stop** : « stop smoking » = arrêter ; « stop to smoke » = s'arrêter pour fumer.",
        "**remember / forget** : « I remembered to lock the door » (j'y ai pensé) ≠ « I remember locking the door » (je me souviens de l'avoir fait).",
        "Verbe + personne + infinitif : « I want you to come ». Après make et let : infinitif sans « to » (« She made me laugh »).",
      ] },
    ],
  },
  {
    id: "en-relative", lang: "en", topic: T2, level: "B1", title: "Propositions relatives",
    summary: "who, which, that, whose, where.",
    blocks: [
      { t: "table", head: ["Mot", "Pour", "Exemple"], rows: [
        ["who / that", "personnes", "The man who called is my uncle."],
        ["which / that", "choses", "The book which I read was long."],
        ["whose", "possession", "The girl whose bike was stolen is upset."],
        ["where", "lieux", "That's the café where we met."],
        ["when", "moments", "I remember the day when we met."],
      ] },
      { t: "list", items: [
        "Quand le pronom est **objet**, on peut l'omettre : « The book (that) I read ».",
        "Relative **non déterminative** (avec virgules, information en plus) : pas de « that » : « My brother, who lives in Lyon, is a doctor ».",
      ] },
    ],
  },
  {
    id: "en-articles", lang: "en", topic: T3, level: "A1", title: "Articles : a, an, the, ou rien",
    summary: "Quand mettre (ou non) un article.",
    blocks: [
      { t: "list", items: [
        "**a / an** : on parle d'une chose pour la première fois, ou d'un élément parmi d'autres. **an** devant un SON de voyelle : an apple, an hour, a university.",
        "**the** : on sait de quoi on parle (déjà mentionné, unique, évident) : the sun, the book on the table.",
        "**Pas d'article** : généralités au pluriel et noms indénombrables : « I like music », « Dogs are loyal ».",
      ] },
      { t: "table", head: ["Sans article", "Avec « the »"], rows: [
        ["school, hospital, church (activité habituelle) : go to school", "the school (le bâtiment précis) : I went to the school to meet him"],
        ["la plupart des pays : France, Japan", "pays au pluriel ou « union » : the USA, the UK, the Netherlands"],
        ["repas : have breakfast", "mers, océans, fleuves : the Atlantic, the Seine"],
      ] },
    ],
  },
  {
    id: "en-quantifiers", lang: "en", topic: T3, level: "A2", title: "Dénombrable, indénombrable : much, many, some, any…",
    summary: "Les quantités.",
    blocks: [
      { t: "table", head: ["", "Dénombrable (pluriel)", "Indénombrable"], rows: [
        ["Beaucoup (question, négation)", "many", "much"],
        ["Beaucoup (affirmatif)", "a lot of / lots of", "a lot of / lots of"],
        ["Un peu / quelques", "a few", "a little"],
        ["Presque pas", "few", "little"],
      ] },
      { t: "list", items: [
        "**some** dans les phrases affirmatives et les offres/demandes (« Would you like some tea? »). **any** dans les questions et négations.",
        "Indénombrables fréquents : water, money, information, advice, news, furniture, luggage, bread, traffic. Pas de pluriel : « some advice », « a piece of advice ».",
        "**few / little** sans « a » ont un sens plutôt négatif (« très peu ») ; avec « a » : positif (« quelques »).",
      ] },
    ],
  },
  {
    id: "en-comparison", lang: "en", topic: T3, level: "A2", title: "Comparatifs et superlatifs",
    summary: "bigger than, the biggest, more interesting, as … as.",
    blocks: [
      { t: "table", head: ["Adjectif", "Comparatif", "Superlatif"], rows: [
        ["court : tall", "taller (than)", "the tallest"],
        ["fin en -y : easy", "easier", "the easiest"],
        ["long : interesting", "more interesting", "the most interesting"],
        ["irrégulier : good", "better", "the best"],
        ["irrégulier : bad", "worse", "the worst"],
        ["irrégulier : far", "farther / further", "the farthest / furthest"],
      ] },
      { t: "list", items: [
        "Une syllabe (+ la plupart de celles en -y) : **-er / -est**. Deux syllabes ou plus : **more / most**.",
        "Consonne finale doublée après voyelle courte : big → bigger, hot → hottest.",
        "**as … as** : égalité (« as tall as »). **not as … as** : infériorité. **the + comparatif, the + comparatif** : « The more you practise, the better you get ».",
      ] },
    ],
  },
  {
    id: "en-prepositions", lang: "en", topic: T3, level: "A2", title: "Prépositions : in, on, at",
    summary: "Temps et lieu.",
    blocks: [
      { t: "table", head: ["", "at", "on", "in"], rows: [
        ["Temps", "une heure précise : at 6 pm, at night, at the weekend (GB)", "jours et dates : on Monday, on 5 May", "mois, années, saisons, parties du jour : in May, in 2024, in summer, in the morning"],
        ["Lieu", "un point précis : at the bus stop, at home, at work", "une surface : on the table, on the wall, on the 2nd floor", "un espace fermé : in the room, in Paris, in a car"],
      ] },
      { t: "list", items: [
        "On dit « **in** the morning » mais « **on** Monday morning » et « **at** night ».",
        "Transports : **by** car / bus / train (sans article) ; **on** foot ; mais « in the car », « on the bus ».",
        "Adjectif + préposition à apprendre par cœur : good at, afraid of, interested in, married to, different from, proud of.",
      ] },
    ],
  },
  {
    id: "en-phrasal", lang: "en", topic: T3, level: "B1", title: "Phrasal verbs courants",
    summary: "Verbe + particule : le sens change.",
    blocks: [
      { t: "table", head: ["Phrasal verb", "Sens"], rows: [
        ["give up", "abandonner"],
        ["look for", "chercher"],
        ["look after", "s'occuper de"],
        ["find out", "découvrir (une information)"],
        ["turn on / turn off", "allumer / éteindre"],
        ["put off", "reporter"],
        ["get on with", "s'entendre avec"],
        ["run out of", "ne plus avoir de"],
        ["take off", "décoller ; enlever (un vêtement)"],
        ["come across", "tomber sur (par hasard)"],
        ["carry on", "continuer"],
        ["set up", "créer, installer"],
      ] },
      { t: "tip", text: "Quand le complément est un pronom, il se place AVANT la particule pour les verbes séparables : « turn it off », « put it off » (pas « turn off it »)." },
    ],
  },
  {
    id: "en-spelling", lang: "en", topic: T4, level: "A2", title: "Orthographe : -s, -ed, -ing",
    summary: "Les petites règles qui évitent les fautes.",
    blocks: [
      { t: "list", items: [
        "**-s / -es** : verbes ou noms finissant par s, x, z, ch, sh, o → -es (watch → watches, go → goes).",
        "Consonne + **y** → **-ies** (study → studies) ; voyelle + y → -ys (play → plays).",
        "**-ed** : verbe finissant par e → on ajoute seulement -d (like → liked). Consonne + y → -ied (study → studied).",
        "Consonne doublée devant -ed / -ing quand le verbe se termine par voyelle courte + consonne accentuée : stop → stopped / stopping, plan → planned / planning.",
        "**-ing** : on enlève le e muet (make → making), mais « be → being », « see → seeing ». ie → ying (lie → lying).",
        "Pluriels irréguliers : man → men, woman → women, child → children, foot → feet, tooth → teeth, mouse → mice, person → people.",
      ] },
    ],
  },
  {
    id: "en-linking", lang: "en", topic: T4, level: "B1", title: "Mots de liaison",
    summary: "Relier ses idées : but, however, although, because…",
    blocks: [
      { t: "table", head: ["Idée", "Mots"], rows: [
        ["Addition", "and, also, in addition, moreover, besides"],
        ["Opposition", "but, however, although / though, even though, whereas, on the other hand"],
        ["Cause", "because, since, as, due to, because of"],
        ["Conséquence", "so, therefore, as a result, consequently"],
        ["But", "to, in order to, so that"],
        ["Ordre", "first, then, after that, finally"],
      ] },
      { t: "ex", items: [
        { text: "Although it was raining, we went out.", tr: "Bien qu'il pleuve, nous sommes sortis." },
        { text: "She was ill; however, she came to work.", tr: "Elle était malade ; pourtant, elle est venue travailler." },
        { text: "He left early because of the traffic.", tr: "Il est parti tôt à cause de la circulation." },
      ] },
      { t: "warn", text: "« because of » + nom ; « because » + phrase complète. « Although » + phrase (jamais « although … but »)." },
    ],
  },
  {
    id: "en-irregular", lang: "en", topic: T4, level: "A2", title: "Verbes irréguliers",
    summary: "Infinitif, prétérit, participe passé : plus de 100 verbes, avec recherche.",
    blocks: [
      { t: "p", text: "Apprends-les par petits groupes de formes proches : sing–sang–sung, drink–drank–drunk ; buy–bought–bought, think–thought–thought ; cut–cut–cut, put–put–put." },
      { t: "irregular" },
    ],
  },
];
