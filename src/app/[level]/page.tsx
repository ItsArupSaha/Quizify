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
    <section className="w-full py-20 bg-neutral-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="container-custom relative">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
            {level.charAt(0).toUpperCase() + level.slice(1)}{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Challenges
            </span>
          </h2>
          <p className="text-lg text-neutral-600">
            Test your Python skills with these carefully crafted challenges.
          </p>
        </div>

        {/* Challenges container */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-neutral-200">
          <LevelWrapper level={level as Level} questions={questions} />
        </div>
      </div>
    </section>
  );
}
