import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QuestionList from "@/components/QuestionList";
import { adminDb } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Easy Challenges – Quizify",
};

export default async function EasyPage() {
  // 1) Fetch all questions with level === 'easy'
  const snapshot = await adminDb
    .collection("questions")
    .where("level", "==", "easy")
    .orderBy("id")
    .get();

  if (snapshot.empty) notFound();

  const questions = snapshot.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, prompt: data.prompt as string };
  });

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-4">Easy Challenges</h2>
        <QuestionList questions={questions} />
      </main>
      <Footer />
    </>
  );
}
