// Export 100 % statique : le dossier "out" peut être hébergé n'importe où (GitHub Pages, etc.)
// NEXT_PUBLIC_BASE_PATH est rempli par le workflow GitHub (ex. "/lingua"). En local, il reste vide.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  // La vérification des types se fait avec « npm run typecheck » : elle ne doit pas empêcher de publier le site.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
