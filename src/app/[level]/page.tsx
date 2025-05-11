import LevelWrapper from "@/components/LevelWrapper";
import { adminDb } from "@/lib/firebaseAdmin";
import type { DocumentData } from "firebase-admin/firestore";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

/** Only these three levels are valid */
const ALLOWED_LEVELS = ["easy", "medium", "hard"] as const;
type Level = (typeof ALLOWED_LEVELS)[number];

type PageProps = {
  params: { level: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { level } = params;

  if (!ALLOWED_LEVELS.includes(level as Level)) {
    return { title: "Not Found – Quizify" };
  }

  const capitalized = level.charAt(0).toUpperCase() + level.slice(1);
  return { title: `${capitalized} Challenges – Quizify` };
}

/* ---------- page component ---------- */
export default async function Page({ params }: PageProps) {
  const { level } = params;

  if (!ALLOWED_LEVELS.includes(level as Level)) {
    notFound();
  }

  /* Fetch all questions for this level */
  const snapshot = await adminDb
    .collection("questions")
    .where("level", "==", level)
    .orderBy("id")
    .get();

  if (snapshot.empty) {
    notFound();
  }

  const questions = snapshot.docs.map((doc) => {
    const data = doc.data() as DocumentData;
    return { id: doc.id, prompt: data.prompt as string };
  });

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">
        {level.charAt(0).toUpperCase() + level.slice(1)} Challenges
      </h2>
      <LevelWrapper level={level as Level} questions={questions} />
    </main>
  );
}
