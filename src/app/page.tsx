// src/app/page.tsx
"use client";

import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <Hero />
        <Features />
      </main>
      <Footer />
    </>
  );
}
