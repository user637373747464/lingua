import { Builder } from "./builders";

// Anglais, niveaux A1 à B1. On ajoute à la fin, on ne réordonne jamais.
const b = new Builder("en-a", "en");
const TEN = "Temps verbaux", ART = "Articles et déterminants", QUA = "Quantités", COM = "Comparaison", PRE = "Prépositions", MOD = "Modaux", PAS = "Passif", GER = "Gérondif et infinitif", REL = "Relatives", PHR = "Phrasal verbs", IRR = "Verbes irréguliers", LIA = "Mots de liaison", CON = "Conditionnels et souhaits", STR = "Construction de phrases", FAL = "Faux amis", VOC = "Collocations et vocabulaire";

// --- Temps verbaux ---
b.mc(TEN, "A1", "She ___ to school every day.", "goes", ["go", "going", "is go"], "Présent simple à la 3e personne du singulier : « goes » (go + es).")
 .mc(TEN, "A1", "They ___ football at the moment.", "are playing", ["play", "plays", "played"], "« At the moment » : action en cours → présent continu (are + verbe-ing).")
 .mc(TEN, "A2", "I ___ my homework yesterday.", "finished", ["finish", "have finished", "am finishing"], "« Yesterday » est un moment précis du passé → prétérit simple.")
 .mc(TEN, "A2", "We ___ to Spain last summer.", "went", ["go", "have gone", "goes"], "« Last summer » : moment passé terminé → prétérit simple. « go » est irrégulier : went.")
 .mc(TEN, "B1", "He ___ in London since 2020.", "has lived", ["lives", "lived", "is living"], "« Since 2020 » : situation commencée dans le passé et toujours vraie → present perfect.")
 .mc(TEN, "A2", "Don't worry, I ___ you later.", "will call", ["call", "called", "have called"], "Promesse faite sur le moment → « will » + infinitif.")
 .mc(TEN, "A2", "Look at those clouds! It ___ soon.", "is going to rain", ["rains", "rained", "has rained"], "Prédiction fondée sur une preuve visible (les nuages) → « be going to ».")
 .mc(TEN, "B1", "While she ___ a shower, the lights went out.", "was taking", ["took", "has taken", "takes"], "Action longue interrompue par une action courte : prétérit continu + prétérit simple.")
 .mc(TEN, "B1", "I have never ___ sushi.", "eaten", ["ate", "eat", "eating"], "« have never » + participe passé. Le participe passé de « eat » est « eaten ».")
 .mc(TEN, "B1", "Have you ever ___ to Japan?", "been", ["went", "go", "being"], "Present perfect : have + participe passé. « been » = participe passé de « be » (« have been to » = être allé et revenu).")
 .fl(TEN, "A1", "My brother ___ (work) in a bank.", ["works"], "3e personne du singulier au présent simple : works.")
 .fl(TEN, "A2", "Yesterday I ___ (see) a very good film.", ["saw"], "Prétérit irrégulier : see → saw.")
 .fl(TEN, "A2", "What ___ you doing at 8 o'clock last night?", ["were"], "Prétérit continu avec « you » : were + verbe-ing.")
 .fl(TEN, "B1", "She ___ in this city for ten years. (live)", ["has lived", "has been living"], "Durée jusqu'à maintenant (for ten years) → present perfect (ou sa forme continue).")
 .od(TEN, "B1", ["I", "have", "lived", "here", "for", "five", "years"], "Present perfect + for + durée : « I have lived here for five years. »")
 .od(TEN, "A2", ["She", "doesn't", "like", "coffee"], "Négatif du présent simple : sujet + doesn't + infinitif.")
 .od(TEN, "A2", ["Did", "you", "watch", "the", "match", "yesterday"], "Question au prétérit : Did + sujet + infinitif sans « to ».");

// --- Articles ---
b.mc(ART, "A1", "I have ___ apple and a banana.", "an", ["a", "the", "some"], "« an » devant un son de voyelle : an apple.")
 .mc(ART, "A1", "She wants to be ___ engineer.", "an", ["a", "the", "—"], "Profession : article indéfini ; « engineer » commence par un son de voyelle → an.")
 .mc(ART, "A2", "Look at ___ moon! It's so bright.", "the", ["a", "an", "—"], "Il n'y a qu'une lune : on utilise « the » pour ce qui est unique.")
 .mc(ART, "A2", "I love ___ music, especially jazz.", "—", ["a", "an", "the"], "Généralité (la musique en général) : pas d'article.")
 .mc(ART, "A2", "He plays ___ guitar very well.", "the", ["a", "an", "—"], "Avec les instruments de musique, on met « the » : play the guitar.")
 .mc(ART, "B1", "I usually go to ___ bed at eleven.", "—", ["a", "the", "an"], "Expression figée : go to bed (dormir), sans article.")
 .mc(ART, "B1", "We stayed at ___ hotel near the station. ___ hotel was very clean.", "a / The", ["the / A", "an / The", "a / A"], "Première mention : « a hotel » ; deuxième mention (on sait lequel) : « the hotel ».")
 .mc(ART, "B1", "It took me ___ hour to get home.", "an", ["a", "the", "—"], "Le h de « hour » ne se prononce pas : son de voyelle → an hour.")
 .fl(ART, "A1", "He is ___ honest man. (a / an)", ["an"], "« honest » : le h est muet, donc son de voyelle → an.")
 .fl(ART, "A2", "She lives in ___ United States. (a / an / the)", ["the"], "Pays dont le nom est pluriel ou contient « united / kingdom » : on met « the ».");

// --- Quantités ---
b.mc(QUA, "A1", "How ___ water do you drink a day?", "much", ["many", "few", "a few"], "« water » est indénombrable → much.")
 .mc(QUA, "A1", "How ___ brothers do you have?", "many", ["much", "little", "a little"], "« brothers » est dénombrable → many.")
 .mc(QUA, "A2", "There isn't ___ milk left.", "any", ["some", "a few", "many"], "Phrase négative + indénombrable → any.")
 .mc(QUA, "A2", "Would you like ___ tea?", "some", ["any", "many", "few"], "Dans une offre, on utilise « some ».")
 .mc(QUA, "B1", "I have ___ friends here, so I feel quite lonely.", "few", ["a few", "a little", "little"], "« few » (sans « a ») a un sens plutôt négatif : très peu. « a few » = quelques-uns, sens positif.")
 .mc(QUA, "B1", "Can you give me ___ advice?", "some", ["a", "many", "few"], "« advice » est indénombrable : pas de « a », pas de pluriel ; on dit « some advice » ou « a piece of advice ».")
 .mc(QUA, "B1", "We have very ___ time left, so let's hurry.", "little", ["few", "a few", "many"], "« time » est indénombrable : very little (très peu). « few » s'emploie avec des noms dénombrables.")
 .fl(QUA, "A2", "There are too ___ people in this room. (much / many)", ["many"], "« people » est dénombrable → too many.");

// --- Comparaison ---
b.mc(COM, "A1", "This book is ___ than that one.", "cheaper", ["more cheap", "cheapest", "cheap"], "Adjectif court → comparatif en -er : cheaper.")
 .mc(COM, "A2", "She is the ___ student in the class.", "best", ["goodest", "better", "most good"], "Superlatif irrégulier : good → best.")
 .mc(COM, "A2", "This exercise is ___ than the last one.", "more difficult", ["difficulter", "most difficult", "difficult"], "Adjectif long → more + adjectif.")
 .mc(COM, "A2", "He is as tall ___ his father.", "as", ["than", "like", "that"], "Égalité : as + adjectif + as.")
 .mc(COM, "B1", "The ___ you practise, the better you get.", "more", ["most", "much", "many"], "Structure « the + comparatif, the + comparatif » : the more you practise, the better you get.")
 .mc(COM, "B1", "Tokyo is one of the ___ cities in the world.", "largest", ["larger", "most large", "largest of"], "Superlatif d'un adjectif court : the largest.")
 .fl(COM, "A2", "My house is ___ (big) than yours.", ["bigger"], "Une syllabe, consonne finale doublée après voyelle courte : big → bigger.")
 .fl(COM, "B1", "This is the ___ (bad) day of my life.", ["worst"], "Superlatif irrégulier : bad → worst.");

// --- Prépositions ---
b.mc(PRE, "A1", "The lesson starts ___ 9 o'clock.", "at", ["on", "in", "to"], "Heure précise → at.")
 .mc(PRE, "A1", "My birthday is ___ May.", "in", ["on", "at", "to"], "Mois → in.")
 .mc(PRE, "A1", "See you ___ Monday!", "on", ["in", "at", "to"], "Jour de la semaine → on.")
 .mc(PRE, "A2", "She is good ___ maths.", "at", ["in", "on", "with"], "Adjectif + préposition : good at.")
 .mc(PRE, "A2", "I'm afraid ___ spiders.", "of", ["from", "for", "about"], "Adjectif + préposition : afraid of.")
 .mc(PRE, "A2", "We went there ___ car.", "by", ["with", "at", "on"], "Moyen de transport sans article : by car.")
 .mc(PRE, "B1", "I'm interested ___ learning Japanese.", "in", ["on", "at", "for"], "Interested in. Après une préposition : verbe en -ing.")
 .mc(PRE, "B1", "She is married ___ a doctor.", "to", ["with", "by", "at"], "Married to someone.")
 .mc(PRE, "A2", "The picture is ___ the wall.", "on", ["in", "at", "by"], "Surface verticale → on the wall.")
 .fl(PRE, "A2", "He arrived ___ Paris yesterday. (in / at / to)", ["in"], "Avec une ville, on emploie « arrive in ». « arrive at » est pour un lieu précis (arrive at the station).");

// --- Modaux ---
b.mc(MOD, "A1", "I ___ swim very well.", "can", ["am", "must to", "do"], "can = capacité (suivi de l'infinitif sans « to »).")
 .mc(MOD, "A2", "You ___ smoke in the hospital. It's forbidden.", "mustn't", ["don't have to", "needn't to", "can to"], "« mustn't » = interdiction. « don't have to » = pas obligé.")
 .mc(MOD, "A2", "You ___ wear a tie. It's optional.", "don't have to", ["mustn't", "can't", "won't to"], "« don't have to » = pas obligé (c'est facultatif). « mustn't » serait une interdiction.")
 .mc(MOD, "A2", "You look tired. You ___ go to bed early.", "should", ["must to", "would", "can to"], "« should » donne un conseil.")
 .mc(MOD, "B1", "Her car is outside, so she ___ at home.", "must be", ["can't be", "mustn't be", "has to being"], "Déduction presque certaine → must be. « can't be » exprimerait l'impossibilité (le contraire).")
 .mc(MOD, "B1", "___ you pass me the salt, please?", "Could", ["Must", "Should", "Would to"], "Demande polie → Could you…? (ou Can you…?).")
 .mc(MOD, "B1", "You ___ have called me! I was so worried.", "should", ["must", "can", "would"], "Reproche sur le passé : should have + participe passé.")
 .fl(MOD, "B1", "I couldn't ___ the door. (open)", ["open"], "Après un modal : infinitif sans « to ».")
 .od(MOD, "A2", ["You", "should", "see", "a", "doctor"], "Conseil : sujet + should + infinitif.");

// --- Passif ---
b.mc(PAS, "B1", "English ___ all over the world.", "is spoken", ["speaks", "is speaking", "spoke"], "Passif au présent : is/are + participe passé.")
 .mc(PAS, "B1", "The window ___ yesterday.", "was broken", ["broke", "is broken", "has broken"], "Passif au prétérit : was/were + participe passé.")
 .mc(PAS, "B1", "My bike ___ last night.", "was stolen", ["stole", "has stolen", "is stealing"], "Passif au prétérit : was stolen (steal → stolen).")
 .mc(PAS, "B1", "The results ___ next week.", "will be announced", ["will announce", "are announcing", "announced"], "Passif au futur : will be + participe passé.")
 .mc(PAS, "B1", "This room ___ every day.", "is cleaned", ["cleans", "is cleaning", "cleaned"], "Passif au présent simple : is cleaned.")
 .fl(PAS, "B1", "The book ___ (write) by Orwell in 1949.", ["was written"], "Passif au prétérit : was written.");

// --- Gérondif / infinitif ---
b.mc(GER, "A2", "I enjoy ___ to music.", "listening", ["to listen", "listen", "listened"], "« enjoy » est suivi d'un verbe en -ing.")
 .mc(GER, "A2", "She wants ___ a doctor.", "to be", ["being", "be", "been"], "« want » + to + infinitif.")
 .mc(GER, "B1", "He decided ___ his job.", "to quit", ["quitting", "quit", "quitted"], "« decide » + to + infinitif.")
 .mc(GER, "B1", "Thank you for ___ me.", "helping", ["to help", "help", "helped"], "Après une préposition (for), on utilise la forme en -ing.")
 .mc(GER, "B1", "I'm looking forward to ___ you.", "seeing", ["see", "to see", "saw"], "Dans « look forward to », « to » est une préposition : verbe en -ing.")
 .mc(GER, "B1", "She made me ___.", "laugh", ["to laugh", "laughing", "laughed"], "Après « make » + personne : infinitif sans « to ».")
 .mc(GER, "B1", "He avoided ___ the question.", "answering", ["to answer", "answer", "answered"], "« avoid » + verbe en -ing.")
 .fl(GER, "B1", "I can't afford ___ a new car. (buy)", ["to buy"], "« afford » + to + infinitif.");

// --- Relatives ---
b.mc(REL, "B1", "The man ___ lives next door is a pilot.", "who", ["which", "whose", "where"], "Pour une personne sujet → who (ou that).")
 .mc(REL, "B1", "The book ___ I bought yesterday is great.", "that", ["who", "whose", "where"], "Pour une chose → that / which (ici, on peut aussi l'omettre).")
 .mc(REL, "B1", "That's the girl ___ bike was stolen.", "whose", ["who", "which", "that"], "Possession → whose.")
 .mc(REL, "B1", "This is the café ___ we first met.", "where", ["which", "who", "whose"], "Lieu → where.")
 .mc(REL, "B1", "My brother, ___ lives in Rome, is a chef.", "who", ["that", "which", "whose"], "Relative non déterminative (avec virgules) : pas de « that » ; personne → who.");

// --- Phrasal verbs ---
b.q(PHR, "B1", "Que signifie « give up » ?", "abandonner", ["donner", "se lever", "rendre visite"], "give up = abandonner, renoncer.")
 .q(PHR, "B1", "Que signifie « look after » ?", "s'occuper de", ["regarder après", "chercher", "ressembler à"], "look after = s'occuper de, prendre soin de.")
 .mc(PHR, "B1", "Can you ___ the light? It's too dark.", "turn on", ["turn up to", "turn around", "turn in"], "turn on = allumer.")
 .mc(PHR, "B1", "We've ___ of milk. I'll buy some.", "run out", ["run off", "run over", "run into"], "run out of = ne plus avoir de.")
 .mc(PHR, "B1", "I'm ___ my keys. Have you seen them?", "looking for", ["looking at", "looking after", "looking up"], "look for = chercher.")
 .mc(PHR, "B1", "Please ___ your shoes before entering.", "take off", ["take out", "take up", "take after"], "take off = enlever (un vêtement).")
 .mc(PHR, "B1", "I need to ___ what time the train leaves.", "find out", ["find up", "find on", "find in"], "find out = découvrir, se renseigner.")
 .fl(PHR, "B1", "Don't give ___! You're almost there.", ["up"], "give up = abandonner.");

// --- Verbes irréguliers ---
b.mc(IRR, "A2", "Yesterday she ___ me a letter.", "wrote", ["writed", "written", "write"], "Prétérit irrégulier : write → wrote.")
 .mc(IRR, "A2", "I have ___ my keys.", "lost", ["losed", "lose", "losted"], "Participe passé irrégulier : lose → lost.")
 .mc(IRR, "A2", "He ___ the window by accident.", "broke", ["breaked", "broken", "break"], "Prétérit : break → broke (participe passé : broken).")
 .mc(IRR, "B1", "She has ___ the answer.", "known", ["knew", "knowed", "know"], "Participe passé : know → known.")
 .mc(IRR, "B1", "We have ___ this film three times.", "seen", ["saw", "seed", "see"], "Participe passé : see → seen.")
 .mc(IRR, "B1", "The bird has ___ away.", "flown", ["flew", "flied", "fly"], "Participe passé : fly → flown.")
 .fl(IRR, "A2", "I ___ (buy) this bag last week.", ["bought"], "Prétérit irrégulier : buy → bought.")
 .fl(IRR, "B1", "Have you ___ (choose) a gift yet?", ["chosen"], "Participe passé : choose → chosen.")
 .fl(IRR, "A2", "She has ___ English for ten years. (teach)", ["taught"], "Participe passé irrégulier : teach → taught.");

// --- Mots de liaison ---
b.mc(LIA, "A2", "I was tired, ___ I went to bed early.", "so", ["but", "because", "although"], "« so » introduit la conséquence.")
 .mc(LIA, "A2", "I stayed at home ___ it was raining.", "because", ["so", "but", "although"], "« because » introduit la cause.")
 .mc(LIA, "B1", "___ it was cold, we went for a walk.", "Although", ["Because", "So", "However"], "« Although » + phrase = bien que (opposition). « However » est suivi d'une virgule et commence une nouvelle phrase.")
 .mc(LIA, "B1", "He studied hard. ___, he failed the exam.", "However", ["Although", "Because", "So that"], "« However, » = pourtant, en début de phrase.")
 .mc(LIA, "B1", "She went out ___ the rain.", "despite", ["although", "because", "however"], "« despite » + nom (ou -ing). « although » + phrase complète.")
 .mc(LIA, "B1", "He left early ___ the traffic.", "because of", ["because", "although", "so"], "« because of » + nom ; « because » + phrase.")
 .fl(LIA, "B1", "She was ill; ___, she went to work. (however / so / because)", ["however"], "« however » exprime l'opposition entre deux phrases.");

// --- Conditionnels ---
b.mc(CON, "B1", "If it rains tomorrow, we ___ at home.", "will stay", ["would stay", "stay", "stayed"], "Type 1 : if + présent, will + infinitif.")
 .mc(CON, "B1", "If I ___ rich, I would travel the world.", "were", ["am", "will be", "would be"], "Type 2 : if + prétérit (« were » pour tous les sujets), would + infinitif.")
 .mc(CON, "B1", "If you heat water to 100 °C, it ___.", "boils", ["will boil", "would boil", "boiled"], "Type 0 (vérité générale) : if + présent, présent.")
 .mc(CON, "B1", "If I had studied, I ___ the exam.", "would have passed", ["would pass", "will pass", "had passed"], "Type 3 : if + past perfect, would have + participe passé.")
 .mc(CON, "B1", "I wish I ___ a car.", "had", ["have", "would have", "will have"], "« wish » + prétérit : regret sur le présent.")
 .mc(CON, "B1", "___ you hurry, you'll miss the bus.", "Unless", ["If not", "Except", "Without"], "« Unless » = if … not (à moins que).")
 .fl(CON, "B1", "If I ___ you, I would apologise. (be)", ["were"], "Dans « If I were you », on emploie « were » à la 1re personne aussi.")
 .od(CON, "B1", ["If", "it", "rains", ",", "we", "will", "stay", "home"], "Type 1 : If + présent, will + infinitif.");

// --- Construction de phrases ---
b.od(STR, "A1", ["My", "name", "is", "Anna"], "Ordre de base : sujet + verbe + complément.")
 .od(STR, "A1", ["Where", "do", "you", "live"], "Question avec mot interrogatif : Where + do + sujet + infinitif.")
 .od(STR, "A2", ["She", "always", "drinks", "tea", "in", "the", "morning"], "Les adverbes de fréquence (always, never, often) se placent avant le verbe.")
 .od(STR, "A2", ["How", "much", "does", "this", "cost"], "How much + does + sujet + infinitif.")
 .od(STR, "B1", ["I", "have", "never", "been", "to", "Japan"], "Never se place entre l'auxiliaire et le participe passé.")
 .od(STR, "B1", ["She", "asked", "me", "where", "I", "lived"], "Discours indirect : l'ordre redevient celui d'une phrase affirmative (sujet + verbe).")
 .od(STR, "B1", ["The", "film", "was", "so", "boring", "that", "we", "left"], "so + adjectif + that + conséquence.")
 .mc(STR, "A2", "She ___ likes pizza.", "really", ["real", "reality", "realize"], "Adverbe de degré « really », placé avant le verbe.")
 .mc(STR, "B1", "He told ___ he was late.", "me", ["to me", "that me", "for me"], "told + personne (sans « to ») + that…")
 .mc(STR, "B1", "She asked me ___ I lived.", "where", ["where did", "where do", "that where"], "Discours indirect : pas d'inversion ni de do/did.");

// --- Faux amis ---
b.q(FAL, "A2", "« I'm going to the library to buy a book. » Que faut-il corriger ?", "library = bibliothèque (pas librairie) : on dit « bookshop »", ["Rien, « library » = librairie", "« to buy » est incorrect", "« going » est incorrect"], "Faux ami : « library » = bibliothèque ; la librairie se dit « bookshop » (ou « bookstore »).")
 .q(FAL, "A2", "Que veut dire « actually » ?", "en fait, en réalité", ["actuellement", "aujourd'hui", "vraiment pas"], "Faux ami : « actually » = en fait ; « actuellement » se dit « currently » / « at the moment ».")
 .q(FAL, "B1", "Que veut dire « to attend a meeting » ?", "assister à une réunion", ["attendre une réunion", "organiser une réunion", "annuler une réunion"], "Faux ami : « to attend » = assister à ; « attendre » se dit « to wait for ».")
 .q(FAL, "B1", "Que veut dire « sensible » ?", "raisonnable, de bon sens", ["sensible (émotif)", "sensationnel", "sensuel"], "Faux ami : « sensible » = raisonnable ; « sensible » (émotif) se dit « sensitive ».")
 .q(FAL, "B1", "Que veut dire « to eventually » dans « He eventually arrived » ?", "finalement, au bout du compte", ["éventuellement", "rapidement", "à peine"], "Faux ami : « eventually » = finalement ; « éventuellement » se dit « possibly ».")
 .q(FAL, "B1", "Que veut dire « a journey » ?", "un voyage (trajet)", ["une journée", "un journal", "un jury"], "Faux ami : « journey » = voyage ; « journée » se dit « day ».");

// --- Vocabulaire / collocations ---
b.mc(VOC, "A2", "I need to ___ a decision soon.", "make", ["do", "take to", "put"], "Collocation : make a decision.")
 .mc(VOC, "A2", "Could you ___ me a favour?", "do", ["make", "give to", "take"], "Collocation : do someone a favour.")
 .mc(VOC, "A2", "She ___ a photo of the sunset.", "took", ["made", "did", "gave"], "Collocation : take a photo.")
 .mc(VOC, "B1", "Let's ___ a break.", "take", ["do", "make", "put"], "Collocation : take a break.")
 .mc(VOC, "B1", "I always ___ attention in class.", "pay", ["give to", "make", "do"], "Collocation : pay attention.")
 .mc(VOC, "B1", "It's important to ___ your best.", "do", ["make", "take", "get"], "Collocation : do your best.")
 .mc(VOC, "B1", "She ___ a mistake in the report.", "made", ["did", "took", "gave"], "Collocation : make a mistake.")
 .fl(VOC, "B1", "We need to ___ some progress. (make / do)", ["make"], "Collocation : make progress.");

export const EXERCISES_EN_A = b.list;
