// src/app/layout.tsx
import Header from "@/components/Header";
import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Quizify | Modern Python Learning Platform",
  description:
    "Learn Python through interactive coding challenges and quizzes with real-time feedback",
  keywords: "python, learning, coding, challenges, quizzes, programming",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Load Pyodide runtime from CDN */}
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js"
          strategy="beforeInteractive"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col antialiased text-neutral-800 bg-gradient-to-br from-white to-neutral-50">
        <Header />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
