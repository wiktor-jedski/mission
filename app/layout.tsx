import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Misja: Poszukiwanie Skarbu",
  description: "Interaktywna gra terenowa - poszukiwanie skarbu.",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

