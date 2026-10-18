/* Service worker de Lingua : permet d'ouvrir l'application SANS connexion.
 *
 * Au build, scripts/postbuild.mjs remplace __BUILD_ID__ et __PRECACHE__ :
 *  - __PRECACHE__ = la liste de tous les fichiers de l'application (téléchargés une fois pour toutes à l'installation) ;
 *  - __BUILD_ID__ = un numéro de version qui change à chaque modification de l'application.
 * Les données personnelles ne passent JAMAIS par ici : elles restent dans IndexedDB.
 */
const BUILD_ID = "__BUILD_ID__";
const PRECACHE = __PRECACHE__;
const CACHE = "lingua-" + BUILD_ID;
const SCOPE = self.registration.scope; // ex. https://nom.github.io/lingua/

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // cache: "reload" = on va chercher les fichiers sur le réseau, pas dans le cache HTTP du navigateur
      await Promise.all(
        PRECACHE.map(async (path) => {
          const res = await fetch(new Request(new URL(path, SCOPE), { cache: "reload" }));
          if (!res.ok) throw new Error("Impossible de mettre en cache " + path + " (" + res.status + ")");
          await cache.put(new URL(path, SCOPE), res);
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith("lingua-") && n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE)) return; // on ne touche pas aux autres sites

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (req.mode === "navigate") {
        // L'application est une seule page : on sert toujours la page d'accueil mise en cache.
        const shell = (await cache.match(new URL("./", SCOPE).href)) || (await cache.match(new URL("index.html", SCOPE).href));
        if (shell) return shell;
        try {
          return await fetch(req);
        } catch (e) {
          return new Response("Lingua est hors ligne et n'a pas encore été installée. Ouvre-la une fois avec Internet.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
      }
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch (e) {
        return new Response("", { status: 503, statusText: "Hors ligne" });
      }
    })(),
  );
});
