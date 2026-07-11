import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Global Search — AI Discovery Platform",
  description: "Search tools, companies, models, news, videos and repositories.",
};

// Explicitly light-only. Without this, some browsers/OSes (Android Chrome's
// "force dark", Samsung Internet, etc.) will auto-repaint the page with a
// heuristic dark palette — which is what produces garbled colors and
// low-contrast text, since it's guessing at colors we never intended.
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}