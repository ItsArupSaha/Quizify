/* eslint-disable */
import LevelWrapper from "@/components/LevelWrapper";
import { adminDb } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";

interface Params {
  params: { level: string };
}

// only these three levels are valid
const ALLOWED_LEVELS = ["easy", "medium", "hard"] as const;

export async function generateMetadata({ params }: Params) {
  const lvl = params.level;
  if (!ALLOWED_LEVELS.includes(lvl as any)) {
    return { title: "Not Found – Quizify" };
  }
  const capitalized = lvl.charAt(0).toUpperCase() + lvl.slice(1);
  return { title: `${capitalized} Challenges – Quizify` };
}

export default async function LevelPage({ params }: Params) {
  const { level } = params;
  if (!ALLOWED_LEVELS.includes(level as any)) {
    notFound();
  }

  const lvl = level as (typeof ALLOWED_LEVELS)[number];

  // fetch all questions for this level
  const snapshot = await adminDb
    .collection("questions")
    .where("level", "==", level)
    .orderBy("id")
    .get();

  if (snapshot.empty) {
    notFound();
  }

  const questions = snapshot.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, prompt: data.prompt as string };
  });

  return (
    <>
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-4">
          {level.charAt(0).toUpperCase() + level.slice(1)} Challenges
        </h2>
        <LevelWrapper level={lvl} questions={questions} />
      </main>
    </>
  );
}
