// src/app/q/[id]/page.tsx
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

type RouteParams = {
  params: { id: string };
};

export default async function QuestionPage({ params }: RouteParams) {
  const { id } = params;

  const docSnap = await adminDb.collection("questions").doc(id).get();
  if (!docSnap.exists) notFound();
  const data = docSnap.data() as Question;

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Question Header */}
          <QuestionHeader id={id} hint={data.hint} />

          {/* Problem Description */}
          <section className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-200">
            <h2 className="text-xl font-display font-semibold mb-4 text-neutral-900">
              Problem Description
            </h2>
            <div className="prose prose-neutral max-w-none">
              <p className="text-neutral-700 leading-relaxed">{data.prompt}</p>
            </div>
          </section>

          {/* Code Editor */}
          <section className="bg-white rounded-2xl shadow-soft overflow-hidden border border-neutral-200">
            <CodeRunner
              questionId={id}
              initialCode={data.starter}
              tests={data.tests}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
