import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrePrompt",
  description: "PrePrompt is a Pre-AI Cognitive Layer—a structured thinking protocol you pass through before sending a request to an AI system. It is designed to reduce token usage, prevent AI over-generation, and give you back control over your AI outputs.",
  metadataBase: new URL("https://pre-prompt.vercel.app"),
  openGraph: {
    title: "PrePrompt",
    description: "PrePrompt is a Pre-AI Cognitive Layer—a structured thinking protocol you pass through before sending a request to an AI system. It is designed to reduce token usage, prevent AI over-generation, and give you back control over your AI outputs.",
    url: "https://pre-prompt.vercel.app",
    siteName: "PrePrompt",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
