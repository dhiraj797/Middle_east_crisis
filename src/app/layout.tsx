import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Middle East Crisis Briefing | Bosch India",
  description: "C-Level Executive Dashboard - Daily Middle East Crisis Intelligence Briefing",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="font-sans antialiased bg-slate-950">
        {children}
      </body>
    </html>
  );
}
