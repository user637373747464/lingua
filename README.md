# Lingua 🌸

Ton application personnelle pour apprendre l'**anglais** et le **japonais** : dictionnaire à toi, cartes de révision qui reviennent au bon moment, exercices de grammaire, prononciation à voix haute, statistiques.

- Fonctionne sur **iPhone, iPad et Mac** (comme une vraie appli, depuis l'écran d'accueil)
- Marche **sans Internet** une fois installée
- **Gratuite** (0 €/mois), sans compte, sans publicité
- **Tes données restent sur ton appareil**. Une seule exception, que tu peux couper dans *Réglages* : le **remplissage automatique** du dictionnaire envoie le mot que tu tapes à deux services gratuits (Free Dictionary API et MyMemory)

---

## 1. Mettre l'application sur Internet (GitHub Pages)

Tu n'as besoin de rien installer sur ton ordinateur pour ça.

1. Crée un compte sur [github.com](https://github.com) si tu n'en as pas.
2. Clique sur **+** (en haut à droite) › **New repository**.
   - Nom : `lingua` (tu peux en choisir un autre)
   - Choisis **Public** (nécessaire pour GitHub Pages gratuit ; ça ne rend publiques que les *fichiers du programme*, jamais tes mots ni tes données)
   - Clique sur **Create repository**
3. Sur la page du dépôt vide, clique sur **uploading an existing file**.
4. **Dézippe** le dossier de Lingua, puis **glisse tout son contenu** dans la page (pas le dossier lui-même, ce qu'il y a dedans).
   - ⚠️ Le dossier caché **`.github`** est indispensable (c'est lui qui publie le site). Sur Mac, dans le Finder, affiche les fichiers cachés avec **Cmd + Maj + .** (point), puis glisse aussi `.github`.
   - Si GitHub refuse le dossier `.github` en glisser-déposer, utilise la méthode « ligne de commande » plus bas.
5. Descends et clique sur **Commit changes**.
6. Va dans **Settings** › **Pages** › dans « Source », choisis **GitHub Actions**.
7. Va dans l'onglet **Actions** : une ligne « Publier sur GitHub Pages » tourne (2–3 minutes). Quand elle est **verte ✅**, ton site est en ligne :

   `https://TON-PSEUDO.github.io/lingua/`

   Si la ligne est passée au rouge ❌ *avant* l'étape 6, clique dessus puis **Re-run all jobs**.

### Méthode « ligne de commande » (si tu préfères)

```bash
cd lingua
git init
git add .
git commit -m "Première version de Lingua"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/lingua.git
git push -u origin main
```

---

## 2. L'installer comme une appli

Ouvre l'adresse **une première fois avec Internet** (pour que tout se télécharge).

- **iPhone / iPad** : ouvre-la dans **Safari** › bouton **Partager** › **Sur l'écran d'accueil**. Utilise ensuite l'icône créée.
- **Mac** : Safari › menu **Fichier** › **Ajouter au Dock**.

Ensuite, Lingua s'ouvre même sans connexion.

> 💡 **Utilise toujours la même façon d'ouvrir Lingua sur un appareil** (l'icône de l'écran d'accueil, *ou* Safari). Chacune a son propre stockage : ce que tu ajoutes dans l'une n'apparaît pas dans l'autre.

---

## 3. Tes données : lis ça une fois

- Tes mots et ta progression sont enregistrés **dans le navigateur de l'appareil**. Il n'y a pas de synchronisation automatique entre iPhone, iPad et Mac.
- Sur iPhone/iPad, Safari peut **effacer** les données d'un site peu utilisé. Installer l'appli sur l'écran d'accueil réduit ce risque, mais ne l'annule pas.
- **Fais donc une sauvegarde de temps en temps** : *Réglages › Exporter une sauvegarde*, puis enregistre le fichier dans **Fichiers / iCloud Drive**. Lingua te le rappelle (tous les 7 jours par défaut).
- Pour passer d'un appareil à l'autre : exporte sur le premier, **importe** sur le second. Choisis **Fusionner** (ajoute ce qui manque, sans doublons ni perte). **Remplacer** efface tout et ne sert que pour restaurer après un problème.

---

## 4. Utiliser Lingua

- **Dictionnaire** (simplifié) : un mot, sa **prononciation** (API ou lecture en kana), son **type** (nom, verbe, adjectif…), son **genre** (masculin/féminin) si tu veux, et sa **traduction** : rien d'autre d'obligatoire. Les exemples sont facultatifs. Si le mot existe déjà, Lingua te prévient. Un petit **paquet de démarrage** (20 mots anglais, 27 japonais) est proposé quand le dictionnaire est vide.
  - **Remplissage automatique** : quand tu tapes un mot, Lingua cherche la prononciation, le type et des traductions, et remplit **seulement les cases vides** (ce que tu as écrit n'est jamais écrasé). Ce n'est **pas Linguee** (Linguee n'a pas d'accès libre ni le droit de copier sa base) : j'utilise deux services gratuits, *Free Dictionary API* (prononciation, type, anglais) et *MyMemory* (traduction vers le français, anglais et japonais). **Le mot que tu tapes leur est envoyé** (Internet nécessaire) ; tu peux couper cette option dans *Réglages*. Les traductions automatiques sont une aide, pas une vérité : relis-les. Pour le japonais, le service ne fournit pas la lecture : tape-la toi-même.
- **Flashcards = des paquets à toi**, indépendants du dictionnaire : tu crées un paquet, tu le **nommes**, tu y mets des cartes une par une ou en collant une **liste** (une carte par ligne : `mot ; traduction`). Un mot du dictionnaire n'entre dans un paquet que si **toi** tu l'y ajoutes (bouton sur la fiche du mot, ou « Depuis le dictionnaire » dans le paquet). Dans un paquet, 4 modes de révision :
  1. **Cartes** : tu retournes la carte et dis si tu la savais ;
  2. **QCM** : 4 choix, sans doublon ;
  3. **Écrire** : tu tapes la réponse (accents ignorés ; en japonais kana, kanji ou romaji acceptés ; bouton « J'avais juste » si tu penses avoir raison) ;
  4. **Associer** : 12 cartes (3 × 4), tu relies le plus vite possible les mots et leurs traductions ; une erreur ajoute 3 secondes ; ton record est gardé.
  Tu choisis le **sens** : anglais → français, français → anglais, ou mélangé (idem pour le japonais). Chaque sens a sa propre progression (révision espacée : 1, 3, 7, 14, 30 jours). L'onglet « Catégories » n'existe plus pour les flashcards. « Gérer les cartes » est tout en bas de l'accueil. Si tu avais des cartes de l'ancienne version, un bandeau propose de les convertir en paquet (rien n'est perdu).
- **Exercices** : plus de 600 (QCM, phrases à trous, phrases à remettre en ordre), du niveau A1 au C2 en anglais et de N5 à N1 en japonais, par thème et par niveau (séries de 5 à 50). Les choix d'un QCM sont mélangés à chaque fois. Les erreurs reviennent en priorité.
- **Progression** : jours d'affilée, minutes d'étude, taux de réussite (avec ou sans indice), QCM contre écriture, cartes difficiles, thèmes à retravailler.
- **Lecture** : colle un texte (article, extrait, message) et **touche un mot** : si tu l'as déjà dans ton dictionnaire, tu vois sa fiche (les mots connus sont soulignés en pointillés, même conjugués ou au pluriel) ; sinon tu l'ajoutes en quelques secondes avec sa traduction, et la **phrase d'origine est gardée comme exemple**. Un lien « Chercher sur WordReference / Jisho » s'ouvre dans le navigateur (Internet nécessaire).
- **Actualités** et **Podcasts / vidéos** : **les liens sont maintenant en haut de la page** : **98 sources conseillées** (articles, podcasts, vidéos ; anglais et japonais), avec au moins **5 sources par niveau** (Débutant / Intermédiaire / Avancé) et un filtre par **thème** (actualité, sciences, culture, histoire, vie quotidienne, apprendre la langue). Bouton « Ouvrir » (ou « Chercher sur YouTube / le podcast » quand je ne suis pas sûr de l'adresse exacte) et « Garder dans ma bibliothèque ». Lingua **n'affiche pas** ces sites et ne copie rien (les navigateurs l'interdisent) : tu ouvres le lien, tu copies le texte ou la transcription, tu le colles dans une fiche, et tous les mots deviennent touchables. Sur chaque fiche, une case **« Noter un mot »** envoie directement le mot vers le dictionnaire (avec remplissage automatique).
- **Leçons** : fiches de grammaire écrites en français, avec exemples et tableaux : temps, conditionnels, modaux, passif, articles, **110 verbes irréguliers** (avec recherche) en anglais ; particules, groupes de verbes, formes て / ない / た, adjectifs, compteurs, heure, politesse en japonais. Rubrique rédigée à la main : si tu repères une erreur, dis-le-moi.
- **Écriture** (japonais) : les **46 hiragana, 46 katakana, leurs variantes** (dakuten, handakuten, petits ゃ ゅ ょ っ, ー) et **80 kanji du N5**. Pour chaque caractère : le modèle **s'anime trait par trait** (numéros dans l'ordre), tu peux le **calquer** ou l'écrire **de mémoire** avec le doigt, puis « Vérifier » : ton tracé est superposé au modèle, trait par trait, avec le **sens** (départ marqué par un rond), l'**ordre**, le nombre de traits et la forme. Les erreurs sont expliquées en français (« trait n°2 dessiné à l'envers », « l'ordre n'est pas respecté », « il manque un trait »…). Un quiz de 10 caractères favorise ceux que tu rates. La taille et la position de ton dessin n'ont pas d'importance (sauf pour les petits kana : ゃ ゅ ょ っ doivent être écrits petit). Les tracés viennent de **KanjiVG** (voir plus bas).
- **Voix** : le bouton 🔊 utilise les voix de ton appareil. Si aucune voix japonaise n'est installée : *Réglages iPhone › Accessibilité › Contenu énoncé › Voix › Japonais*.

### Importer une liste de mots (CSV ou JSON)

Dans *Dictionnaire › Importer*. Un CSV s'ouvre avec Numbers/Excel ; la première ligne contient les en-têtes :

```csv
mot,lecture,traduction,categorie,exemple,traduction_exemple,notes
食べる,たべる,manger,verbe,毎日ご飯を食べる。,Je mange du riz tous les jours.,
reluctant,,réticent ; peu enclin,adjectif,She was reluctant to go.,Elle hésitait à y aller.,
```

Plusieurs traductions : sépare-les par `;`. Les mots déjà présents sont ignorés.

---

## 5. Honnêteté : ce qui est fait, ce qui ne l'est pas

**Fait (phase 1 du cahier des charges + une partie de la phase 2)** : dictionnaire bilingue, cartes et répétition espacée, exercices (plus de 600), TTS, statistiques, sauvegarde/restauration, import CSV/JSON, mode hors ligne, thème clair/sombre, taille du texte.

**Ajouté ensuite** : lecture avec mots touchables, actualités, podcasts/vidéos (bibliothèque + sources conseillées).

**Écriture tactile** : tracé des kana et de 80 kanji, comparaison avec le sens et l'ordre des traits, quiz.

**Flashcards en paquets** (4 modes, 2 sens), **dictionnaire simplifié avec remplissage automatique**, **98 sources** triées par niveau et thème.

**Pas encore fait (affichés « Prochainement »)** : histoires graduées, conversation. On les ajoutera une par une.

**À savoir sur les exercices** : je les ai écrits moi-même et relus un par un, mais ce n'est pas un manuel agréé : si une réponse te paraît fausse ou ambiguë, ne la crois pas aveuglément et dis-le-moi. Les niveaux (A1–C2, N5–N1) sont indicatifs.

**À savoir sur la lecture** : Lingua ne contient **aucun dictionnaire intégré** (il fonctionne hors ligne et gratuitement) : elle ne reconnaît que **les mots que tu as toi-même ajoutés**. Pour un mot inconnu, tu saisis toi-même la traduction (ou tu cliques sur le lien WordReference / Jisho). La reconnaissance des mots conjugués est une approximation : elle peut se tromper ou rater un mot, et ne remplace pas un vrai analyseur grammatical. Un texte peut faire jusqu'à 200 000 caractères.

**À savoir sur l'écriture** : la comparaison est faite par un algorithme maison, pas par une intelligence artificielle. Il compare chaque trait au modèle (forme, longueur, début et fin) après avoir mis ton dessin à la même taille. Limites connues : (1) sur des tracés humains simulés, il en accepte environ 99,8 % en exigence « Normale », mais un vrai doigt sur un vrai écran est plus maladroit que ma simulation : si de bons tracés sont refusés, passe en « Large » (en « Large », des caractères voisins comme る/ろ, わ/れ/ね, ス/ヌ ou コ/ユ peuvent passer à tort ; en « Normale » et « Stricte », ces paires sont refusées) ; (2) les caractères qui ont **exactement la même forme** (へ et ヘ, par exemple) ne peuvent pas être distingués : l'application te dit ce qu'il faut écrire, elle ne peut pas deviner ; (3) les très petits détails (une petite boucle) sont jugés de façon approximative ; (4) certains caractères ont plusieurs façons d'être écrits dans la réalité (notamment certains kanji) : seul l'ordre standard de KanjiVG est accepté. **Je n'ai pas pu tester sur un iPhone** : j'ai testé avec de vrais événements souris et tactiles dans Chromium, mais pas avec ton doigt sur Safari.

**Tracés : KanjiVG.** Les modèles de tracé viennent de KanjiVG (https://kanjivg.tagaini.net), © 2009–2011 Ulrich Apel et contributeurs, licence Creative Commons Attribution-ShareAlike 3.0. Le fichier `src/lib/content/strokes.ts` est une adaptation de ces données et reste donc sous la même licence (CC BY-SA 3.0). Il est fabriqué par `scripts/build-strokes.mjs`.

**Testé** : 119 tests automatiques de la logique (paquets de flashcards, remplissage automatique, sources, répétition espacée, vérification des réponses, romaji, sauvegarde/fusion, import CSV, exercices, statistiques, lecteur de mots) + un parcours complet dans un vrai navigateur (Chromium) : ajout/modification/suppression de mots, révisions, exercices, import CSV, les écrans de lecture/actualités/podcasts (filtres de sources),  les paquets de flashcards (création, liste collée, 4 modes, 2 sens, jeu Associer, japonais), le dictionnaire simplifié et son remplissage automatique (réponses simulées), l'écriture (dessin à la souris et avec des événements tactiles : tracé juste, trait à l'envers, mauvais ordre, trait manquant, petit kana, quiz), la mise à jour de ta base de données existante vers la nouvelle version (tes mots sont conservés), export/import de sauvegarde (fusion et remplacement), thème sombre, mode hors ligne, effacement total, écran téléphone et ordinateur.

**Pas testé (je n'ai pas pu)** :
- les **adresses des sources conseillées** : mon environnement ne peut pas ouvrir ces sites, donc **aucun lien n'a été ouvert un par un**. Ce sont des pages d'accueil officielles que je connais ; une partie (chaînes YouTube et podcasts dont je ne suis pas sûr de l'adresse) passe par une **recherche** qui ne peut pas être cassée. Les niveaux et thèmes sont mon appréciation. Si un lien ne s'ouvre pas, cherche le nom sur Internet et dis-le-moi ;
- le **remplissage automatique** du dictionnaire avec de **vrais** services : mes tests utilisent des réponses simulées (le réseau de mon environnement bloque ces deux services). Les analyseurs de réponses sont testés, mais **le premier essai en vrai, c'est toi qui le fais** : si rien ne se remplit, l'application te le dit et tu peux tout saisir à la main. MyMemory limite le nombre de demandes par jour (message affiché si c'est atteint) ;
- sur un vrai **iPhone/iPad/Safari** (les voix, l'installation sur l'écran d'accueil et la conservation des données y varient) ;
- la commande **`next build`** et la publication GitHub elle-même : le réseau de mon environnement bloquait le téléchargement des paquets. Le code a été vérifié avec un autre outil de construction. **Si l'onglet Actions affiche une erreur rouge, copie-m'en le texte, je corrige.**

**Choix techniques à connaître** : la base de données du navigateur est gérée par un petit module maison (au lieu de la bibliothèque Dexie prévue au départ), pour pouvoir la tester ici ; fonctionnellement c'est équivalent. Aucune transcription phonétique ni aucun accent tonal n'est inventé : ces champs restent vides tant que tu ne les remplis pas.

---

## 6. Pour modifier le programme (facultatif)

Il faut [Node.js 22+](https://nodejs.org).

```bash
npm install      # une seule fois
npm run dev      # lance Lingua sur http://localhost:3000
npm test         # lance les 119 tests
npm run typecheck
npm run build    # fabrique le site dans le dossier "out"
npm run preview  # l'ouvre pour vérifier
```

Où est quoi :

- `src/lib/` : la logique (répétition espacée `srs.ts`, vérification des réponses `answers.ts`, sauvegardes `backup.ts`, base de données `db.ts`…)
- `src/components/` : les écrans
- `src/lib/content/` : les exercices et le paquet de démarrage (tu peux en ajouter)
- `src/app/globals.css` : l'apparence (couleurs en haut du fichier)
- `public/sw.js` : le mode hors ligne
- `tests/` : les tests

Quand tu mets à jour le site, rouvre l'appli avec Internet : la nouvelle version s'installe et s'active à l'ouverture suivante.
