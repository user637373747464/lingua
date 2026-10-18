import type { Exercise } from "../exercises";
import type { Lang } from "../types";

// Petits constructeurs pour écrire beaucoup d'exercices sans répétition.
// Les identifiants sont numérotés dans l'ordre : ON AJOUTE À LA FIN, on ne réordonne jamais (les statistiques s'y réfèrent).
// Pour le QCM, la bonne réponse est placée à une position qui varie (pour qu'elle ne soit pas toujours au même endroit).

export class Builder {
  private n = 0;
  readonly list: Exercise[] = [];
  constructor(private prefix: string, private lang: Lang) {}

  private id() {
    return `${this.prefix}-${String(++this.n).padStart(3, "0")}`;
  }

  /** QCM : answer = bonne réponse, wrongs = mauvaises réponses. */
  mc(topic: string, level: string, sentence: string, answer: string, wrongs: string[], explanation: string, prompt = "Choisis la forme correcte.") {
    const n = this.n + 1;
    const choices = [...wrongs];
    const pos = (n * 5 + 1) % (wrongs.length + 1);
    choices.splice(pos, 0, answer);
    this.list.push({ id: this.id(), lang: this.lang, topic, level, type: "mcq", prompt, sentence, choices, correct: pos, explanation });
    return this;
  }

  /** QCM sans phrase à trous (question de vocabulaire, de sens…). */
  q(topic: string, level: string, prompt: string, answer: string, wrongs: string[], explanation: string) {
    const n = this.n + 1;
    const choices = [...wrongs];
    const pos = (n * 3 + 2) % (wrongs.length + 1);
    choices.splice(pos, 0, answer);
    this.list.push({ id: this.id(), lang: this.lang, topic, level, type: "mcq", prompt, choices, correct: pos, explanation });
    return this;
  }

  /** Texte à compléter : accepted = réponses valables. */
  fl(topic: string, level: string, sentence: string, accepted: string[], explanation: string, prompt = "Complète la phrase.", hint?: string) {
    this.list.push({ id: this.id(), lang: this.lang, topic, level, type: "fill", prompt, sentence, accepted, hint, explanation });
    return this;
  }

  /** Remettre en ordre : words dans le bon ordre. */
  od(topic: string, level: string, words: string[], explanation: string, alternatives?: string[][], prompt = "Remets les mots dans le bon ordre.") {
    this.list.push({ id: this.id(), lang: this.lang, topic, level, type: "order", prompt, words, alternatives, explanation });
    return this;
  }
}
