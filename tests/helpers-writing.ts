// Outils de test pour l'écriture : simuler un tracé « fait à la main » à partir du modèle.
import { GLYPHS } from "../src/lib/content/strokes";
import { Pt, parsePath, resample } from "../src/lib/writing";

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return (s >>> 0) / 4294967296;
  };
}

export const modelOf = (ch: string): Pt[][] => GLYPHS[ch].s.map((d) => parsePath(d));

const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());

/**
 * Tracé d'un humain (assez maladroit mais honnête) : chaque trait est déformé par une ondulation lente (1 à 2 oscillations),
 * ses extrémités bougent un peu, les points sont irréguliers et légèrement bruités ; le dessin entier est mis à une autre
 * taille, un peu tourné et décalé. `level` multiplie l'amplitude de toutes les erreurs.
 */
export function handwrite(model: Pt[][], seed: number, level = 1): Pt[][] {
  const r = rng(seed);
  const scale = 0.6 + r() * 0.8;
  const angle = ((r() - 0.5) * 2 * 5 * Math.PI) / 180 * level;
  const ox = (r() - 0.5) * 30, oy = (r() - 0.5) * 30;
  const cosA = Math.cos(angle), sinA = Math.sin(angle);
  return model.map((stroke) => {
    const n = 8 + Math.floor(r() * 18); // nombre de points relevés : irrégulier
    const base = resample(stroke, n);
    const a1 = gauss(r) * 2.2 * level, a2 = gauss(r) * 1.2 * level; // amplitude de l'ondulation (unités de la grille 109)
    const ph = r() * Math.PI * 2;
    const j0x = gauss(r) * 1.6 * level, j0y = gauss(r) * 1.6 * level, j1x = gauss(r) * 1.6 * level, j1y = gauss(r) * 1.6 * level;
    return base.map((p, k) => {
      const t = k / (n - 1);
      // normale approximative
      const q = base[Math.min(k + 1, n - 1)], pr = base[Math.max(k - 1, 0)];
      let nx = -(q.y - pr.y), ny = q.x - pr.x;
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl; ny /= nl;
      const wob = a1 * Math.sin(Math.PI * t + ph) + a2 * Math.sin(2 * Math.PI * t + ph);
      let x = p.x + nx * wob + (1 - t) * j0x + t * j1x + gauss(r) * 0.5 * level;
      let y = p.y + ny * wob + (1 - t) * j0y + t * j1y + gauss(r) * 0.5 * level;
      // taille, rotation, décalage globaux (autour du centre de la grille)
      x -= 54.5; y -= 54.5;
      const rx = (x * cosA - y * sinA) * scale + 54.5 + ox;
      const ry = (x * sinA + y * cosA) * scale + 54.5 + oy;
      return { x: rx, y: ry };
    });
  });
}
