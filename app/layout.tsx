import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mission Treasure Hunt",
  description: "Foundation shell for the Mission Treasure Hunt app."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
