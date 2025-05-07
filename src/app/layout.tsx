// src/app/layout.tsx
import Script from "next/script";
import "./globals.css";

export const metadata = { title: "Python Quiz", description: "Fix the code!" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Load Pyodide runtime from CDN */}
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
