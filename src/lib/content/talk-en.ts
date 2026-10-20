// Dialogues guidés en anglais : 10 situations, 2 par niveau (A1 à C1).
// Textes ORIGINAUX écrits pour Lingua. Pas d'IA : tout est écrit d'avance.

import type { Talk } from "../talk";
import { EN_A1 } from "./talk/en-a1";
import { EN_A2 } from "./talk/en-a2";
import { EN_B1 } from "./talk/en-b1";
import { EN_B2 } from "./talk/en-b2";
import { EN_C1 } from "./talk/en-c1";

export const TALKS_EN: Talk[] = [...EN_A1, ...EN_A2, ...EN_B1, ...EN_B2, ...EN_C1];
