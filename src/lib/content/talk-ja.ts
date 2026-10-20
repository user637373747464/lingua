// Dialogues guidés en japonais : 10 situations, 2 par niveau (N5 à N1).
// Textes ORIGINAUX écrits pour Lingua. Pas d'IA : tout est écrit d'avance.

import type { Talk } from "../talk";
import { JA_N5 } from "./talk/ja-n5";
import { JA_N4 } from "./talk/ja-n4";
import { JA_N3 } from "./talk/ja-n3";
import { JA_N2 } from "./talk/ja-n2";
import { JA_N1 } from "./talk/ja-n1";

export const TALKS_JA: Talk[] = [...JA_N5, ...JA_N4, ...JA_N3, ...JA_N2, ...JA_N1];
