// app/q/[id]/page.tsx
import CodeRunner from "@/components/CodeRunner";
import QuestionHeader from "@/components/QuestionHeader";
import { adminDb } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";

type TestCase = {
  callArgs: string;
  expected: string;
  hidden: boolean;
};

type Question = {
  level: string;
  prompt: string;
  starter: string;
  hint: string;
  tests: TestCase[];
};

export default async function QuestionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const docSnap = await adminDb.collection("questions").doc(id).get();
  if (!docSnap.exists) notFound();
  const data = docSnap.data() as Question;

  console.log("📝 fetched tests for", id, data.tests);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <QuestionHeader id={id} hint={data.hint} />

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Prompt</h2>
        <p>{data.prompt}</p>
      </section>

      <section>
        <CodeRunner
          questionId={id}
          initialCode={data.starter}
          tests={data.tests}
        />
      </section>
    </div>
  );
}
