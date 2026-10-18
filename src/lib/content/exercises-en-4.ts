import { Builder } from "./builders";

// Anglais : compléments pour les niveaux A1 et C2. On ajoute à la fin, on ne réordonne jamais.
const b = new Builder("en-c", "en");
const BAS = "Bases : be, have, there is", PLU = "Pluriels, possessifs et pronoms", QUE = "Questions et négations simples";
const ADV = "Inversion et structures avancées", NUA = "Nuances de vocabulaire", IDI = "Expressions idiomatiques", REG = "Registre et style", STR = "Construction de phrases";

// --- A1 : be, have, there is ---
b.mc(BAS, "A1", "She ___ a teacher.", "is", ["are", "am", "be"], "« be » à la 3e personne du singulier : she is.")
 .mc(BAS, "A1", "I ___ from France.", "am", ["is", "are", "be"], "« be » avec « I » : I am.")
 .mc(BAS, "A1", "They ___ my friends.", "are", ["is", "am", "be"], "« be » au pluriel : they are.")
 .mc(BAS, "A1", "___ you a student?", "Are", ["Is", "Am", "Do"], "Question avec « be » : on inverse (Are you…?), sans « do ».")
 .mc(BAS, "A1", "He ___ two sisters.", "has", ["have", "is", "haves"], "« have » à la 3e personne : he has.")
 .mc(BAS, "A1", "I ___ a dog.", "have", ["has", "am", "haves"], "« have » avec « I » : I have.")
 .mc(BAS, "A1", "There ___ a book on the table.", "is", ["are", "have", "be"], "« there is » + nom singulier.")
 .mc(BAS, "A1", "There ___ three chairs in the room.", "are", ["is", "have", "has"], "« there are » + nom pluriel.")
 .mc(BAS, "A1", "What ___ your name?", "is", ["are", "am", "do"], "What is your name? (be + sujet).")
 .mc(BAS, "A1", "How old ___ you?", "are", ["is", "do", "does"], "How old are you? (be + sujet).")
 .fl(BAS, "A1", "My brother ___ (have) a bike.", ["has"], "3e personne du singulier : have → has.")
 .fl(BAS, "A1", "They ___ (be) very happy.", ["are"], "« be » au pluriel : are.")
 .fl(BAS, "A1", "I ___ not tired. (be)", ["am"], "« be » avec « I » : am.")
 .od(BAS, "A1", ["She", "is", "my", "best", "friend"], "Sujet + be + complément.")
 .od(BAS, "A1", ["There", "are", "two", "cats", "in", "the", "garden"], "There are + pluriel + lieu.");

// --- A1 : pluriels, possessifs, pronoms ---
b.mc(PLU, "A1", "Plusieurs enfants : « three ___ ».", "children", ["childs", "childes", "childrens"], "Pluriel irrégulier : child → children.")
 .mc(PLU, "A1", "Plusieurs villes : « many ___ ».", "cities", ["citys", "cityes", "cites"], "Consonne + y → -ies : cities.")
 .mc(PLU, "A1", "Plusieurs couteaux : « two ___ ».", "knives", ["knifes", "knifs", "knifees"], "Pluriel en -ves : knife → knives.")
 .mc(PLU, "A1", "Plusieurs hommes : « five ___ ».", "men", ["mans", "mens", "manes"], "Pluriel irrégulier : man → men.")
 .mc(PLU, "A1", "Mary is my sister. ___ name is Anna.", "Her", ["His", "She", "Hers"], "Adjectif possessif féminin : her.")
 .mc(PLU, "A1", "John has a bag. It is ___ bag.", "his", ["he", "him", "her"], "Adjectif possessif masculin : his.")
 .mc(PLU, "A1", "This book is ___. It's not yours.", "mine", ["my", "me", "I"], "Pronom possessif sans nom : mine.")
 .mc(PLU, "A1", "Can you help ___?", "me", ["I", "my", "mine"], "Pronom complément : me.")
 .mc(PLU, "A1", "She likes ___.（les voisins）", "them", ["they", "their", "theirs"], "Pronom complément pluriel : them.")
 .fl(PLU, "A1", "Plural of « box » : ___", ["boxes"], "Mots en -x : -es → boxes.")
 .fl(PLU, "A1", "Plural of « bus » : ___", ["buses"], "Mots en -s : -es → buses.");

// --- A1 : questions et négations ---
b.mc(QUE, "A1", "I ___ like fish.", "don't", ["doesn't", "not", "am not"], "Négatif du présent simple avec I : don't + infinitif.")
 .mc(QUE, "A1", "She ___ like fish.", "doesn't", ["don't", "not", "isn't"], "Négatif du présent simple à la 3e personne : doesn't + infinitif.")
 .mc(QUE, "A1", "___ you like pizza?", "Do", ["Does", "Are", "Is"], "Question au présent simple : Do + sujet + infinitif.")
 .mc(QUE, "A1", "Where ___ he live?", "does", ["do", "is", "are"], "Question avec « he » : does + infinitif.")
 .mc(QUE, "A1", "What time ___ the film start?", "does", ["do", "is", "are"], "Question avec sujet 3e personne : does + infinitif.")
 .mc(QUE, "A1", "___ late for school!", "Don't be", ["Not be", "No be", "Doesn't be"], "Impératif négatif : Don't + infinitif.")
 .od(QUE, "A1", ["I", "don't", "like", "coffee"], "Négatif : sujet + don't + infinitif.")
 .od(QUE, "A1", ["Where", "is", "the", "station"], "Question avec « be » : mot interrogatif + be + sujet.");

// --- C2 : structures avancées ---
b.mc(ADV, "C2", "Hardly had he sat down ___ the phone rang.", "when", ["than", "that", "as"], "« Hardly … when » (et « No sooner … than »).")
 .mc(ADV, "C2", "No sooner had he sat down ___ the phone rang.", "than", ["that", "as", "then"], "« No sooner … than ».")
 .mc(ADV, "C2", "It is high time we ___ a decision.", "made", ["make", "will make", "would make"], "« It's (high) time + sujet + prétérit » : il est grand temps que…")
 .mc(ADV, "C2", "He behaved as if he ___ the boss. (He isn't.)", "were", ["will be", "has being", "would be"], "« as if » + prétérit (were) pour une situation irréelle.")
 .mc(ADV, "C2", "Not a word ___ she say.", "did", ["does", "has", "was"], "Expression négative en tête de phrase → inversion avec did.")
 .mc(ADV, "C2", "Were it ___ for his courage, we would be in trouble.", "not", ["no", "never", "none"], "« Were it not for + nom » = sans (irréel du présent).")
 .mc(ADV, "C2", "Neither the teacher nor the students ___ aware of the change.", "were", ["was", "has", "being"], "Avec « neither … nor », le verbe s'accorde avec le sujet le plus proche (students → were).")
 .mc(ADV, "C2", "I'd sooner you ___ here.", "weren't", ["aren't", "wouldn't be", "haven't been"], "« I'd sooner / rather + sujet + prétérit » : préférence sur le comportement de quelqu'un d'autre.")
 .mc(ADV, "C2", "He is said ___ the country.", "to have left", ["to leave left", "have left", "having to leave"], "Passif impersonnel avec antériorité : is said to have left.")
 .mc(ADV, "C2", "She was made ___ the report again.", "to rewrite", ["rewrite", "rewriting", "to rewriting"], "Au passif, « make » prend « to » : was made to rewrite. (À l'actif : They made her rewrite.)")
 .mc(ADV, "C2", "Much to my ___, the exam was cancelled.", "delight", ["delighted", "delighting", "delightful"], "Expression : much to my delight / surprise / regret.")
 .mc(ADV, "C2", "By no means ___ this a simple matter.", "is", ["does", "has", "do"], "« By no means » en tête → inversion : By no means is this…")
 .mc(ADV, "C2", "Seldom ___ such courage.", "have I seen", ["I have seen", "I saw", "did I seen"], "Seldom en tête → inversion : have I seen.")
 .mc(ADV, "C2", "She is ___ to be elected; everyone supports her.", "bound", ["tied", "fastened", "joined"], "« be bound to + infinitif » = être certain de, ne pas pouvoir manquer de.")
 .od(ADV, "C2", ["Never", "have", "I", "felt", "so", "relieved"], "Never en tête de phrase → inversion (have I).")
 .od(ADV, "C2", ["Rarely", "has", "the", "committee", "met", "such", "criticism"], "Rarely en tête → inversion avec l'auxiliaire.");

// --- C2 : nuances de vocabulaire ---
b.q(NUA, "C2", "Que veut dire « ubiquitous » ?", "omniprésent", ["ambigu", "très rare", "mal élevé"], "ubiquitous = qu'on trouve partout.")
 .q(NUA, "C2", "Que veut dire « ephemeral » ?", "éphémère", ["éternel", "éclatant", "épineux"], "ephemeral = qui dure très peu.")
 .q(NUA, "C2", "Que veut dire « mundane » ?", "banal, ordinaire", ["mondial", "mondain", "mystérieux"], "mundane = banal, du quotidien (faux ami avec « mondain » = society / fashionable).")
 .q(NUA, "C2", "Que veut dire « reticent » ?", "peu enclin à parler", ["très bavard", "en colère", "énergique"], "reticent = réservé, qui garde ses pensées pour lui.")
 .q(NUA, "C2", "Que veut dire « ambivalent » ?", "partagé, aux sentiments contradictoires", ["sans importance", "ambitieux", "bilingue"], "ambivalent = qui ressent deux choses opposées à la fois.")
 .q(NUA, "C2", "Que veut dire « cogent » ?", "convaincant, solide (argument)", ["bruyant", "poli", "confus"], "cogent = clair, logique et persuasif.")
 .q(NUA, "C2", "Que veut dire « fortuitous » ?", "fortuit, dû au hasard", ["fortuné", "très fort", "dangereux"], "fortuitous = qui arrive par hasard (souvent heureux).")
 .q(NUA, "C2", "Que veut dire « to mitigate » ?", "atténuer", ["aggraver", "mélanger", "migrer"], "mitigate = rendre moins grave.")
 .q(NUA, "C2", "Que veut dire « to exacerbate » ?", "aggraver", ["améliorer", "exagérer un peu", "ignorer"], "exacerbate = rendre pire.")
 .q(NUA, "C2", "Que veut dire « ostensibly » ?", "en apparence", ["ouvertement", "principalement", "soigneusement"], "ostensibly = en apparence (mais peut-être pas en réalité).")
 .mc(NUA, "C2", "He was ___ with grief and couldn't speak.", "overcome", ["overtaken", "overrun", "overdone"], "Collocation : overcome with grief / emotion.", "Choisis le mot qui convient.")
 .mc(NUA, "C2", "The company is in ___ financial straits.", "dire", ["tall", "harsh-edged", "clear"], "Collocation : in dire straits = dans une situation très difficile.", "Choisis le mot qui convient.");

// --- C2 : expressions idiomatiques ---
b.q(IDI, "C2", "Que signifie « the elephant in the room » ?", "un sujet gênant que tout le monde évite", ["un objet très encombrant", "une personne importante", "un animal de compagnie"], "the elephant in the room = problème évident dont personne ne parle.")
 .q(IDI, "C2", "Que signifie « a red herring » ?", "une fausse piste", ["un poisson rare", "une alerte rouge", "une mauvaise odeur"], "a red herring = information qui détourne de la vraie question.")
 .q(IDI, "C2", "Que signifie « a Catch-22 » ?", "une situation sans issue, paradoxale", ["un piège à souris", "un numéro de téléphone", "un coup de chance"], "a Catch-22 = situation où chaque solution dépend d'une condition impossible.")
 .q(IDI, "C2", "Que signifie « the last straw » ?", "la goutte d'eau qui fait déborder le vase", ["la dernière paille", "le dernier espoir", "un petit cadeau"], "the last straw = ce qui rend la situation insupportable.")
 .q(IDI, "C2", "Que signifie « to beat around the bush » ?", "tourner autour du pot", ["frapper un buisson", "faire du bruit", "partir en courant"], "beat around the bush = éviter d'aborder directement le sujet.")
 .q(IDI, "C2", "Que signifie « the tip of the iceberg » ?", "la partie visible d'un problème bien plus grand", ["un glaçon", "un grand froid", "un secret de famille"], "the tip of the iceberg = un petit signe d'un phénomène beaucoup plus vaste.");

// --- C2 : registre ---
b.q(REG, "C2", "Quelle phrase est la plus formelle ?", "We regret to inform you that your application has been unsuccessful.", ["Sorry, but you didn't get the job.", "Too bad, you're out.", "No luck this time, mate."], "Le registre formel utilise « regret to inform », le passif et un vocabulaire soutenu.")
 .q(REG, "C2", "Quel mot est le plus formel pour « to start » ?", "to commence", ["to kick off", "to get going", "to set about"], "commence est de registre soutenu ; kick off, get going sont familiers.")
 .q(REG, "C2", "Quel mot est le plus formel pour « to ask for » ?", "to request", ["to beg for", "to chase up", "to go after"], "request est neutre-formel ; les autres sont soit trop forts, soit familiers.")
 .q(REG, "C2", "Quelle phrase est la plus familière ?", "I'm gonna grab a bite.", ["I intend to have a meal.", "I shall dine shortly.", "I am about to eat."], "gonna et grab a bite sont typiques de la langue parlée familière.");

export const EXERCISES_EN_C = b.list;
