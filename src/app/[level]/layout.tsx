// app/[level]/layout.tsx
import Header from "@/components/Header";
import React from "react";

export default function LevelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto m-6">{children}</main>
    </>
  );
}
