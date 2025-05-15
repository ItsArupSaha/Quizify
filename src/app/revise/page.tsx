// app/revise/page.tsx
import Header from "@/components/Header";
import ReviseClient from "@/components/ReviseClient";

export const metadata = {
  title: "Revise Problems – PyCrafters",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RevisePage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6 pt-32">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
            Revise Problems{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Challenges
            </span>
          </h2>
          <p className="text-lg text-neutral-600">
            Revisit and improve your solutions to previously attempted
            challenges.
          </p>
        </div>
        <ReviseClient />
      </main>
    </>
  );
}
