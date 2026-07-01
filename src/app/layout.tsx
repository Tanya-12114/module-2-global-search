import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Search — AI Discovery Platform",
  description: "Search tools, companies, models, news, videos and repositories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
