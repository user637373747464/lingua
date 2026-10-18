import type { Metadata, Viewport } from "next";
import "./globals.css";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Lingua",
  description: "Apprendre l'anglais et le japonais : flashcards, dictionnaire personnel, exercices. Fonctionne hors ligne, données privées.",
  applicationName: "Lingua",
  appleWebApp: { capable: true, title: "Lingua", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1822" },
  ],
};

// Applique les préférences d'affichage AVANT le premier affichage, pour éviter un flash clair → sombre.
const PREFS_SCRIPT = `try{var p=JSON.parse(localStorage.getItem("lingua-ui")||"null");if(p){var r=document.documentElement;if(p.theme==="light"||p.theme==="dark")r.setAttribute("data-theme",p.theme);if(p.textSize)r.setAttribute("data-text",p.textSize);if(p.reduceMotion)r.setAttribute("data-motion",p.reduceMotion)}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href={`${base}/manifest.webmanifest`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${base}/icons/favicon-32.png`} />
        <link rel="apple-touch-icon" href={`${base}/icons/apple-touch-icon.png`} />
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
