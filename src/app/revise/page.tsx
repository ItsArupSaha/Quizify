// app/revise/page.tsx
import Header from "@/components/Header";
import ReviseClient from "@/components/ReviseClient";

export const metadata = {
  title: "Revise Problems – Quizify",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RevisePage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-4 w-max">Revise Problems</h2>
        <ReviseClient />
      </main>
    </>
  );
}
