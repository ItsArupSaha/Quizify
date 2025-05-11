// app/[level]/page.tsx
import LevelWrapper from "@/components/LevelWrapper";
import { adminDb } from "@/lib/firebaseAdmin";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type RouteParams = {
  params: {
    level: "easy" | "medium" | "hard";
  };
};

const ALLOWED_LEVELS = ["easy", "medium", "hard"] as const;

/**
 * Page-level <head> metadata
 */
export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { level } = params;

  if (!ALLOWED_LEVELS.includes(level)) {
    return { title: "Not Found – Quizify" };
  }

  const capitalised = level.charAt(0).toUpperCase() + level.slice(1);
  return { title: `${capitalised} Challenges – Quizify` };
}

/**
 * /[level] page component
 */
export default async function LevelPage({ params }: RouteParams) {
  const { level } = params;

  if (!ALLOWED_LEVELS.includes(level)) {
    // Wrong URL -> 404
    notFound();
  }

  // 🔎 fetch all questions for this level
  const snapshot = await adminDb
    .collection("questions")
    .where("level", "==", level)
    .orderBy("id")
    .get();

  if (snapshot.empty) {
    notFound();
  }

  const questions = snapshot.docs.map((doc) => {
    const data = doc.data() as { prompt: string };
    return { id: doc.id, prompt: data.prompt };
  });

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">
        {level.charAt(0).toUpperCase() + level.slice(1)} Challenges
      </h2>

      <LevelWrapper level={level} questions={questions} />
    </main>
  );
}
