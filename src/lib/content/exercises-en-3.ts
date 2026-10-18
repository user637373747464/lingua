import { Builder } from "./builders";

// Anglais, niveaux B2 à C2. On ajoute à la fin, on ne réordonne jamais.
const b = new Builder("en-b", "en");
const TEN = "Temps verbaux", CON = "Conditionnels et souhaits", MOD = "Modaux", PAS = "Passif", DIS = "Discours indirect", GER = "Gérondif et infinitif", REL = "Relatives", INV = "Inversion et structures avancées", SUB = "Subjonctif et formes formelles", PRE = "Prépositions", PHR = "Phrasal verbs", COL = "Collocations et vocabulaire", NUA = "Nuances de vocabulaire", LIA = "Mots de liaison", FAL = "Faux amis", IDI = "Expressions idiomatiques", QUA = "Quantités", ART = "Articles et déterminants", STR = "Construction de phrases";

// --- Temps verbaux ---
b.mc(TEN, "B2", "By the time she arrived, we ___ for two hours.", "had been waiting", ["were waiting", "have been waiting", "waited"], "Durée antérieure à un moment du passé (« by the time she arrived ») → past perfect continuous.")
 .mc(TEN, "B2", "This time next week, I ___ on a beach in Greece.", "will be lying", ["lie", "have lain", "lay"], "Action qui sera en cours à un moment futur précis → future continuous.")
 .mc(TEN, "B2", "I ___ here since nine o'clock and nobody has come yet.", "have been waiting", ["am waiting", "wait", "was waiting"], "Durée jusqu'à maintenant avec insistance sur l'attente → present perfect continuous.")
 .mc(TEN, "B2", "She said she ___ the report by Friday.", "would finish", ["finishes", "has finished", "finished"], "Discours indirect au passé : will → would.")
 .mc(TEN, "B2", "I'll call you as soon as I ___ home.", "get", ["will get", "am getting", "would get"], "Après « as soon as », on emploie le présent (pas « will ») pour parler du futur.")
 .mc(TEN, "B2", "The train ___ at 6:45 tomorrow morning.", "leaves", ["has left", "left", "will have left"], "Horaire officiel : présent simple, même pour le futur.")
 .mc(TEN, "C1", "No sooner ___ the door than the phone rang.", "had she opened", ["she had opened", "she opened", "did she open"], "« No sooner … than » + past perfect, avec inversion sujet / auxiliaire après « No sooner ».")
 .mc(TEN, "C1", "By 2040, scientists ___ a cure for this disease.", "will have found", ["will find", "are finding", "have found"], "Action qui sera terminée avant un moment futur (« by 2040 ») → future perfect.")
 .mc(TEN, "C1", "I wish I ___ harder when I was at school.", "had studied", ["studied", "would study", "have studied"], "Regret sur le passé : wish + past perfect.")
 .mc(TEN, "C1", "He is always ___ his keys!", "losing", ["lose", "to lose", "lost"], "Présent continu avec « always » : agacement devant une habitude répétée (« is always losing »).")
 .fl(TEN, "B2", "I ___ to Paris three times so far this year. (be)", ["have been"], "« so far this year » : période non terminée → present perfect : have been.")
 .fl(TEN, "B2", "When I arrived, the film ___ already started.", ["had"], "Antériorité dans le passé : past perfect (had + participe passé).", "Complète avec l'auxiliaire.")
 .od(TEN, "B2", ["She", "has", "been", "working", "here", "since", "2019"], "Present perfect continuous : has been + verbe-ing + since + point de départ.")
 .od(TEN, "C1", ["By", "next", "June", "she", "will", "have", "graduated"], "Future perfect : will have + participe passé, avec « by » + date future.");

// --- Conditionnels ---
b.mc(CON, "B2", "If I ___ you, I would accept the offer.", "were", ["was to", "am", "would be"], "Dans « If I were you », on emploie « were » (conseil hypothétique).")
 .mc(CON, "B2", "If she had left earlier, she ___ the train.", "wouldn't have missed", ["won't miss", "wouldn't miss", "hadn't missed"], "Type 3 (irréel du passé) : if + past perfect, would have + participe passé.")
 .mc(CON, "B2", "If I ___ so tired yesterday, I would have gone to the party.", "hadn't been", ["wasn't", "weren't", "wouldn't be"], "Type 3 : if + past perfect (hadn't been).")
 .mc(CON, "B2", "I'd rather you ___ smoke in here.", "didn't", ["don't", "won't", "wouldn't have"], "« I'd rather + sujet + prétérit » : préférence sur le comportement d'une autre personne.")
 .mc(CON, "B2", "You can borrow my car ___ you drive carefully.", "provided that", ["unless", "in case of", "although"], "« provided (that) » = à condition que. « unless » = à moins que (sens contraire).")
 .mc(CON, "C1", "If I ___ more money last year, I would be in a better position now.", "had saved", ["saved", "would save", "have saved"], "Conditionnel mixte : cause dans le passé (past perfect), conséquence au présent (would + infinitif).")
 .mc(CON, "C1", "___ you need anything, just let me know.", "Should", ["Would", "Did", "Had"], "Inversion formelle équivalant à « If you should need… » : Should you need…")
 .mc(CON, "C1", "___ I known about the problem, I would have helped.", "Had", ["Have", "Did", "Should"], "Inversion du type 3 : Had I known = If I had known.")
 .mc(CON, "C1", "___ for your help, I would have failed.", "But", ["Except", "Unless", "Despite"], "« But for + nom » = sans (la formule formelle) : But for your help, I would have failed.")
 .mc(CON, "C2", "I wish you ___ stop interrupting me.", "would", ["will", "did", "could to"], "« wish + would » exprime l'agacement ou le souhait que quelqu'un change de comportement.")
 .fl(CON, "B2", "If I ___ (know) his number, I would call him.", ["knew"], "Type 2 : if + prétérit → knew.")
 .fl(CON, "C1", "Were she ___ (arrive) late, we would start without her.", ["to arrive"], "« Were + sujet + to + infinitif » : forme inversée et formelle de « If she were to arrive… ».")
 .od(CON, "C1", ["Had", "I", "known", ",", "I", "would", "have", "helped"], "Inversion : Had I known = If I had known.");

// --- Modaux ---
b.mc(MOD, "B2", "You ___ have told me earlier. Now it's too late!", "should", ["can", "may", "will"], "« should have + participe passé » exprime un reproche ou un regret sur le passé.")
 .mc(MOD, "B2", "She ___ have left already; her coat is gone.", "must", ["should", "might not", "can't"], "Déduction presque certaine sur le passé : must have + participe passé.")
 .mc(MOD, "B2", "He ___ have taken the bus; I saw his car outside.", "can't", ["must", "should", "needn't"], "Impossibilité logique sur le passé : can't have + participe passé.")
 .mc(MOD, "B2", "I'm not sure where she is. She ___ be at the gym.", "might", ["must to", "shall", "ought"], "Possibilité faible : might + infinitif.")
 .mc(MOD, "B2", "You ___ have bought a gift; it wasn't necessary.", "needn't", ["mustn't", "can't", "shouldn't to"], "« needn't have + participe passé » : tu as fait quelque chose d'inutile.")
 .mc(MOD, "C1", "She ___ to be one of the best surgeons in the country.", "is said", ["says", "is saying", "said"], "Passif impersonnel : « is said to be » (on dit qu'elle est).")
 .mc(MOD, "C1", "He ___ well have forgotten the appointment.", "may", ["must to", "should to", "might to"], "« may well have + participe passé » : il est très possible que…")
 .fl(MOD, "B2", "You ___ have seen him; he left an hour ago. (can't / must)", ["can't", "cannot"], "Impossibilité logique sur le passé : can't have seen.");

// --- Passif ---
b.mc(PAS, "B2", "I had my car ___ yesterday.", "repaired", ["repair", "repairing", "to repair"], "Construction causative : have + objet + participe passé (on fait réparer).")
 .mc(PAS, "B2", "She ___ by her colleagues for her work.", "was praised", ["praised", "was praising", "has praised"], "Passif au prétérit : was praised.")
 .mc(PAS, "B2", "The new bridge ___ at the moment.", "is being built", ["is building", "is built", "has built"], "Passif au présent continu : is being + participe passé.")
 .mc(PAS, "C1", "It ___ that the company will close next year.", "is rumoured", ["rumours", "is rumouring", "rumoured"], "Passif impersonnel avec « it » : It is rumoured that…")
 .mc(PAS, "C1", "He denies ___ the money.", "having taken", ["to have take", "taking of", "he took"], "Après « deny » : gérondif ; « having taken » marque l'antériorité.")
 .mc(PAS, "C1", "The documents ___ by the time the manager arrived.", "had been signed", ["were signed", "have been signed", "had signed"], "Passif au past perfect : had been + participe passé.")
 .fl(PAS, "B2", "I need to get my hair ___. (cut)", ["cut"], "Causatif : get/have + objet + participe passé (cut est invariable).");

// --- Discours indirect ---
b.mc(DIS, "B2", "He asked me where I ___.", "lived", ["do live", "live did", "was living to"], "Discours indirect : ordre normal, sans do ; on recule d'un temps (live → lived).")
 .mc(DIS, "B2", "She told me she ___ the film the week before.", "had seen", ["has seen", "saw it", "sees"], "« I saw the film last week » devient « she had seen the film the week before ».")
 .mc(DIS, "B2", "He asked me whether I ___ swim when I was a child.", "could", ["can", "will", "am able to"], "Question sur le passé : « could » (capacité passée).")
 .mc(DIS, "B2", "'Don't touch it!' → She told me ___ it.", "not to touch", ["don't touch", "to not touching", "not touching"], "Ordre indirect négatif : told + personne + not to + infinitif.")
 .mc(DIS, "C1", "He admitted ___ the window.", "breaking", ["to break", "that break", "he break"], "« admit » + gérondif : He admitted breaking the window.")
 .mc(DIS, "C1", "She suggested ___ to the cinema.", "going", ["to go", "us going to", "that we to go"], "« suggest » + gérondif (ou that + sujet + verbe) : She suggested going…")
 .fl(DIS, "B2", "'I'm tired,' she said. → She said she ___ tired.", ["was"], "On recule d'un temps : am → was.");

// --- Gérondif / infinitif ---
b.mc(GER, "B2", "I remember ___ the door, so it must be locked.", "locking", ["to lock", "lock", "locked to"], "« remember + -ing » = se souvenir d'avoir fait. « remember + to » = ne pas oublier de faire.")
 .mc(GER, "B2", "Remember ___ the door when you leave!", "to lock", ["locking", "lock", "locked"], "« remember + to » = penser à (action à faire).")
 .mc(GER, "B2", "He stopped ___ when he saw the doctor's warning.", "smoking", ["to smoke", "smoke", "for smoke"], "« stop + -ing » = arrêter de. « stop to smoke » = s'arrêter pour fumer.")
 .mc(GER, "B2", "I tried ___ the window, but it was stuck.", "to open", ["opening", "open", "opened to"], "« try + to » = essayer de, faire un effort. « try + -ing » = tester pour voir.")
 .mc(GER, "B2", "It's no use ___ about it.", "worrying", ["to worry", "worry", "of worrying"], "Expression « it's no use + -ing ».")
 .mc(GER, "B2", "She is used to ___ up early.", "getting", ["get", "got", "gets"], "« be used to » (être habitué à) est suivi d'un verbe en -ing.")
 .mc(GER, "C1", "He regrets ___ you that your application was unsuccessful.", "to tell", ["telling", "tell", "for telling"], "« regret + to + infinitif » = avoir le regret de (annonce formelle). « regret + -ing » = regretter d'avoir fait.")
 .mc(GER, "C1", "I can't help ___ when I see that video.", "laughing", ["to laugh", "laugh", "laughed"], "« can't help + -ing » = ne pas pouvoir s'empêcher de.")
 .fl(GER, "B2", "I look forward to ___ you soon. (see)", ["seeing"], "« look forward to » : « to » est une préposition → verbe en -ing.");

// --- Relatives ---
b.mc(REL, "B2", "The woman to ___ I spoke was very helpful.", "whom", ["who", "which", "whose"], "Préposition + pronom relatif personne : to whom (forme formelle).")
 .mc(REL, "B2", "That's the house ___ roof was damaged in the storm.", "whose", ["which", "that", "where"], "Possession → whose (aussi pour les choses).")
 .mc(REL, "B2", "He passed the exam, ___ surprised everyone.", "which", ["that", "what", "who"], "« which » peut reprendre toute la proposition précédente. « that » est impossible après une virgule.")
 .mc(REL, "C1", "Everything ___ she said was true.", "that", ["which", "what", "who"], "Après « everything / all / nothing », on emploie « that ».")
 .mc(REL, "C1", "She has two sons, ___ are doctors.", "both of whom", ["both of who", "both whom of", "which both"], "Quantité + of + whom / which : both of whom.")
 .mc(REL, "C1", "The reason ___ he left remains unclear.", "why", ["when", "where", "what"], "« the reason why » + proposition.");

// --- Inversion et structures avancées ---
b.mc(INV, "C1", "Never ___ such a beautiful sunset.", "have I seen", ["I have seen", "I saw", "did I have seen"], "Adverbe négatif en tête de phrase (Never, Rarely, Seldom…) → inversion auxiliaire + sujet.")
 .mc(INV, "C1", "Not only ___ late, but he also forgot the documents.", "did he arrive", ["he arrived", "he did arrive", "arrived he"], "« Not only » en tête de phrase → inversion avec « did ».")
 .mc(INV, "C1", "Hardly ___ the house when it started to rain.", "had we left", ["we had left", "we left", "did we leave"], "Hardly… when + past perfect, avec inversion après Hardly.")
 .mc(INV, "C1", "Only after the meeting ___ the truth.", "did she learn", ["she learned", "she did learn", "learned she"], "« Only after… » en tête de phrase → inversion.")
 .mc(INV, "C1", "So tired ___ that he fell asleep at the table.", "was he", ["he was", "did he", "he is"], "« So + adjectif » en tête → inversion : So tired was he that…")
 .mc(INV, "C1", "It was John ___ broke the window.", "who", ["whom", "which", "whose"], "Phrase clivée : It was + élément mis en relief + who/that + verbe.")
 .mc(INV, "C2", "Little ___ she know what was waiting for her.", "did", ["has", "had", "does"], "« Little » (= pas du tout) en tête de phrase → inversion avec « did » : Little did she know…")
 .mc(INV, "C2", "What I need ___ a good night's sleep.", "is", ["are", "being", "to be"], "Phrase pseudo-clivée : What I need + is + élément.")
 .od(INV, "C1", ["Rarely", "do", "we", "see", "such", "talent"], "« Rarely » en tête de phrase → inversion avec « do ».")
 .od(INV, "C2", ["Under", "no", "circumstances", "should", "you", "open", "this", "door"], "Expression négative en tête (Under no circumstances) → inversion : should + sujet.");

// --- Subjonctif et formes formelles ---
b.mc(SUB, "C1", "I suggest that he ___ a doctor.", "see", ["sees", "saw", "will see"], "Subjonctif présent après suggest, insist, recommend… : forme de base du verbe (même à la 3e personne).")
 .mc(SUB, "C1", "It is essential that every student ___ on time.", "be", ["is", "will be", "being"], "Après « It is essential / important / vital that », subjonctif : be.")
 .mc(SUB, "C1", "She insisted that he ___ the meeting.", "attend", ["attends", "attended", "would attending"], "Après insist (au sens d'exiger) : subjonctif, forme de base.")
 .mc(SUB, "C1", "If I ___ you, I'd think twice.", "were", ["was to", "am", "have been"], "Subjonctif prétérit : were pour tous les sujets (registre soigné).")
 .mc(SUB, "C2", "Long ___ the King!", "live", ["lives", "living", "lived"], "Expression figée au subjonctif : Long live… ! (souhait).");

// --- Prépositions ---
b.mc(PRE, "B2", "She is responsible ___ the marketing team.", "for", ["of", "to", "about"], "Responsible for.")
 .mc(PRE, "B2", "He is very different ___ his brother.", "from", ["of", "than to", "with"], "Different from (en anglais américain aussi « different than »).")
 .mc(PRE, "B2", "I'm not used ___ this kind of food.", "to", ["at", "with", "for"], "Be used to + nom ou -ing.")
 .mc(PRE, "B2", "She apologised ___ being late.", "for", ["of", "about to", "at"], "Apologise for + -ing.")
 .mc(PRE, "B2", "We congratulated him ___ his promotion.", "on", ["for", "at", "to"], "Congratulate someone on something.")
 .mc(PRE, "B2", "I am fed up ___ waiting.", "with", ["of", "from", "at"], "Fed up with.")
 .mc(PRE, "C1", "The company is accused ___ fraud.", "of", ["for", "with", "about"], "Accuse someone of something.")
 .mc(PRE, "C1", "He insisted ___ paying for dinner.", "on", ["at", "to", "about"], "Insist on + -ing.")
 .mc(PRE, "C1", "She takes great pride ___ her work.", "in", ["of", "on", "at"], "Take pride in.")
 .fl(PRE, "B2", "He succeeded ___ passing the test. (in / at / of)", ["in"], "Succeed in + -ing.");

// --- Phrasal verbs ---
b.mc(PHR, "B2", "The meeting was ___ until next week.", "put off", ["put on", "put up", "put away"], "put off = reporter.")
 .mc(PHR, "B2", "I can't ___ with this noise any longer.", "put up", ["put off", "put away", "put through"], "put up with = supporter.")
 .mc(PHR, "B2", "She ___ her mother; they look exactly alike.", "takes after", ["takes up", "takes on", "takes over"], "take after = ressembler à (un parent).")
 .mc(PHR, "B2", "We need to ___ a solution before Friday.", "come up with", ["come across", "come over", "come off"], "come up with = trouver (une idée, une solution).")
 .mc(PHR, "B2", "The plan ___ because of lack of money.", "fell through", ["fell off", "fell apart to", "fell behind to"], "fall through = échouer, tomber à l'eau.")
 .mc(PHR, "C1", "I ___ an old photo while cleaning the attic.", "came across", ["came up", "came round", "came through"], "come across = tomber sur (par hasard).")
 .mc(PHR, "C1", "The company ___ a rival firm last year.", "took over", ["took in", "took out", "took up"], "take over = racheter, prendre le contrôle de.")
 .mc(PHR, "C1", "He was ___ by the news and couldn't speak.", "taken aback", ["taken off", "taken out", "taken up"], "be taken aback = être déconcerté, pris au dépourvu.")
 .q(PHR, "B2", "Que signifie « to carry out a survey » ?", "réaliser une enquête", ["porter une enquête", "annuler une enquête", "commencer une enquête"], "carry out = effectuer, réaliser.")
 .q(PHR, "C1", "Que signifie « to bring about change » ?", "provoquer un changement", ["empêcher un changement", "apporter un objet", "refuser un changement"], "bring about = causer, provoquer.");

// --- Collocations et vocabulaire ---
b.mc(COL, "B2", "The government has ___ a new law.", "passed", ["done", "taken", "held"], "Collocation : pass a law.")
 .mc(COL, "B2", "We need to ___ a deal before the deadline.", "strike", ["do", "put", "give"], "Collocation : strike a deal (conclure un accord).")
 .mc(COL, "B2", "She ___ a good impression on the interviewer.", "made", ["did", "took", "gave"], "Collocation : make an impression.")
  .mc(COL, "B2", "We had a ___ argument about politics.", "heated", ["warm", "burning", "cooking"], "Collocation : a heated argument.")
 .mc(COL, "C1", "Prices have ___ sharply this year.", "risen", ["raised", "arisen", "lifted"], "« rise » est intransitif (sans complément) : prices have risen. « raise » est transitif.")
 .mc(COL, "C1", "He gave a ___ speech that moved the audience.", "powerful", ["heavy", "big", "hard"], "Collocation : a powerful speech.")
 .mc(COL, "C1", "The company is facing a ___ challenge.", "daunting", ["frightful", "timid", "fearless"], "Collocation : a daunting challenge (décourageant par son ampleur).")
 .mc(COL, "C2", "She has a ___ eye for detail.", "keen", ["heavy", "tall", "narrow"], "Collocation : a keen eye for detail (un regard vif, très attentif).")
 .fl(COL, "B2", "It is vital to ___ attention to the details. (pay)", ["pay"], "Collocation : pay attention.");

// --- Nuances de vocabulaire ---
b.mc(NUA, "B2", "The new rule will ___ everyone in the company.", "affect", ["effect", "afflict to", "infect"], "« affect » (verbe) = influencer. « effect » (nom) = effet.")
 .mc(NUA, "B2", "The medicine had no ___ on me.", "effect", ["affect", "affection", "affective"], "« effect » (nom) = effet : have an effect on.")
 .mc(NUA, "B2", "Could you ___ me some money until Friday?", "lend", ["borrow", "rent", "owe to"], "lend = prêter ; borrow = emprunter.")
 .mc(NUA, "B2", "I'd like to ___ some money from the bank.", "borrow", ["lend", "rent out", "give back"], "borrow = emprunter.")
 .mc(NUA, "B2", "The teacher ___ the pupils about the dangers.", "warned", ["noticed", "advised to", "told to"], "warn someone about/of something = avertir.")
 .mc(NUA, "C1", "He gave a ___ explanation that nobody believed.", "far-fetched", ["well-known", "down-to-earth", "straightforward"], "far-fetched = tiré par les cheveux, peu crédible.")
 .mc(NUA, "C1", "The two options are almost ___; I can't decide.", "indistinguishable", ["incomparable", "irreversible", "inevitable"], "indistinguishable = impossible à distinguer l'un de l'autre.")
 .mc(NUA, "C1", "Her ___ remarks offended many guests.", "tactless", ["tactful", "tactic", "tacit"], "tactless = sans tact, maladroit ; tactful = plein de tact ; tacit = tacite.")
 .mc(NUA, "C2", "The report was ___; it said a lot in very few words.", "succinct", ["verbose", "convoluted", "redundant"], "succinct = concis. verbose = verbeux, convoluted = compliqué, redundant = redondant.")
 .mc(NUA, "C2", "His ___ behaviour surprised us; he usually acts so predictably.", "erratic", ["steady", "consistent", "systematic"], "erratic = irrégulier, imprévisible.")
 .q(NUA, "C1", "Quelle phrase utilise « economic » et « economical » correctement ?", "The economic crisis made people look for economical ways to travel.", ["The economical crisis made people look for economic ways to travel.", "Both words mean the same in every context.", "Economical only applies to politics."], "economic = relatif à l'économie ; economical = économe, peu coûteux.");

// --- Mots de liaison ---
b.mc(LIA, "B2", "___ the bad weather, the match went ahead.", "Despite", ["Although", "However", "Even though"], "« Despite » + nom. « Although / Even though » + phrase complète.")
 .mc(LIA, "B2", "He works hard; ___, he never gets promoted.", "nevertheless", ["therefore", "moreover", "because"], "« nevertheless » = pourtant (opposition).")
 .mc(LIA, "B2", "She left early ___ catch the last train.", "so as to", ["in order that", "so that to", "for"], "« so as to / in order to » + infinitif exprime le but.")
 .mc(LIA, "B2", "I'll take an umbrella ___ it rains.", "in case", ["unless", "if only", "so that"], "« in case » = au cas où (précaution).")
 .mc(LIA, "C1", "___ he was exhausted, he kept on working.", "Even though", ["Despite", "In spite", "Because of"], "« Even though » + proposition complète (opposition forte).")
 .mc(LIA, "C1", "The project failed. ___, we learned a lot.", "That said", ["Moreover", "Consequently", "Whereas"], "« That said » = cela dit, introduit une nuance ou une opposition.")
 .mc(LIA, "C1", "Some people prefer cities, ___ others love the countryside.", "whereas", ["despite", "therefore", "so"], "« whereas » oppose deux idées dans une même phrase.")
 .mc(LIA, "C2", "___ the evidence, the jury found him guilty.", "In light of", ["Notwithstanding of", "Albeit", "Insofar"], "« In light of » = compte tenu de.")
 .fl(LIA, "B2", "She was ill; ___, she attended the meeting. (nevertheless / because / so)", ["nevertheless"], "« nevertheless » exprime l'opposition entre deux phrases.");

// --- Faux amis avancés ---
b.q(FAL, "B2", "Que veut dire « to pretend » ?", "faire semblant", ["prétendre (affirmer)", "tendre", "prévoir"], "Faux ami : « pretend » = faire semblant ; « prétendre » se dit « claim ».")
 .q(FAL, "B2", "Que veut dire « a demand » ?", "une exigence, une demande forte", ["une demande polie", "un doute", "une dénonciation"], "Faux ami : « demand » = exigence ; une demande polie = « a request ».")
 .q(FAL, "B2", "Que veut dire « to assist someone » ?", "aider quelqu'un", ["assister à une réunion", "interdire quelque chose", "organiser un événement"], "Faux ami : « assist » = aider ; « assister à » se dit « attend ».")
 .q(FAL, "C1", "Que veut dire « a lecture » ?", "un cours magistral, une conférence", ["une lecture de livre", "un lecteur", "une bibliothèque"], "Faux ami : « lecture » = cours / conférence ; la lecture se dit « reading ».")
 .q(FAL, "C1", "Que veut dire « to deceive » ?", "tromper", ["décevoir", "décider", "recevoir"], "Faux ami : « deceive » = tromper ; « décevoir » se dit « disappoint ».")
 .q(FAL, "C1", "Que veut dire « sympathetic » ?", "compatissant", ["sympathique", "agréable à vivre", "sportif"], "Faux ami : « sympathetic » = compatissant ; « sympathique » se dit « nice / friendly ».");

// --- Expressions idiomatiques ---
b.q(IDI, "B2", "Que signifie « It's a piece of cake » ?", "C'est très facile", ["C'est délicieux", "C'est cher", "C'est dangereux"], "a piece of cake = très facile (un jeu d'enfant).")
 .q(IDI, "B2", "Que signifie « to be under the weather » ?", "ne pas se sentir bien", ["être sous la pluie", "être très occupé", "être en retard"], "under the weather = patraque, pas en forme.")
 .q(IDI, "C1", "Que signifie « to bite the bullet » ?", "se forcer à faire quelque chose de désagréable", ["tirer sur quelqu'un", "manger vite", "perdre patience"], "bite the bullet = serrer les dents et s'y résoudre.")
 .q(IDI, "C1", "Que signifie « to let the cat out of the bag » ?", "révéler un secret", ["perdre son chat", "se mettre en colère", "faire du bruit"], "let the cat out of the bag = vendre la mèche.")
 .q(IDI, "C1", "Que signifie « once in a blue moon » ?", "très rarement", ["chaque nuit", "au dernier moment", "par temps clair"], "once in a blue moon = tous les trente-six du mois.")
 .q(IDI, "C2", "Que signifie « to be on the fence » ?", "hésiter, ne pas avoir pris parti", ["être très en colère", "être caché", "être en danger"], "on the fence = indécis.")
 .q(IDI, "C2", "Que signifie « a blessing in disguise » ?", "un malheur qui finit par être bénéfique", ["un cadeau déguisé", "une bénédiction religieuse", "un secret bien gardé"], "a blessing in disguise = quelque chose de mauvais qui s'avère être une chance.");

// --- Quantités et articles (avancé) ---
b.mc(QUA, "B2", "___ of the two answers is correct.", "Neither", ["None", "Either not", "Any"], "« Neither » concerne deux éléments (aucun des deux) ; « none » en concerne plus de deux.")
 .mc(QUA, "B2", "You have two options. You can take ___ of them.", "either", ["each other", "neither", "none"], "« either of them » = l'un ou l'autre (de deux).")
 .mc(QUA, "C1", "A large number of students ___ absent today.", "are", ["is", "was being", "has been"], "« A large number of » + pluriel → verbe au pluriel. (« The number of… » → singulier.)")
 .mc(ART, "C1", "She is ___ European Union official.", "a", ["an", "one", "some"], "« European » commence par le son /j/ (consonne) → a.")
 .mc(ART, "C1", "___ rich are not always happy.", "The", ["A", "—", "These"], "« the + adjectif » désigne un groupe de personnes : the rich, the poor, the elderly.");

// --- Construction de phrases ---
b.od(STR, "B2", ["I", "would", "rather", "you", "didn't", "tell", "anyone"], "I'd rather + sujet + prétérit : préférence sur le comportement de quelqu'un d'autre.")
 .od(STR, "B2", ["She", "suggested", "going", "to", "the", "cinema"], "suggest + gérondif.")
 .od(STR, "C1", ["Not", "until", "he", "left", "did", "I", "realise", "my", "mistake"], "« Not until » en tête de phrase : inversion dans la proposition principale (did I realise).")
 .od(STR, "C1", ["The", "more", "you", "practise", ",", "the", "better", "you", "become"], "Double comparatif : The more …, the better …")
 .od(STR, "C2", ["Had", "it", "not", "been", "for", "your", "help", ",", "we", "would", "have", "failed"], "« Had it not been for + nom » : forme formelle et inversée de « If it hadn't been for… » (irréel du passé).");

export const EXERCISES_EN_B = b.list;
