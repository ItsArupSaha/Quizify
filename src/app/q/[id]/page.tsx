// src/app/q/[id]/page.tsx
import CodeRunner from "@/components/CodeRunner";
import QuestionHeader from "@/components/QuestionHeader";
import { adminDb } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";

type TestCase = {
  input: string;
  output: string;
  hidden: boolean;
};

type Question = {
  level: string;
  prompt: string;
  hint: string;
  tests: TestCase[];
};

type RouteParams = {
  params: { id: string };
};

function formatPrompt(prompt: string) {
  // Split the prompt into sections
  const sections = prompt.split("\n\n");

  // The first section is always the problem statement
  const problemStatement = sections[0];

  // Find input and output format sections
  const inputFormat = sections.find((s) => s.startsWith("Input Format:"));
  const outputFormat = sections.find((s) => s.startsWith("Output Format:"));

  return (
    <div className="space-y-4">
      {/* Problem Statement */}
      <p className="text-neutral-700 leading-relaxed">{problemStatement}</p>

      {/* Input/Output Format */}
      <div className="space-y-3">
        {inputFormat && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-blue-800 font-medium mb-2">Input Format:</h3>
            <p className="text-blue-700 whitespace-pre-line">
              {inputFormat.replace("Input Format:", "").trim()}
            </p>
          </div>
        )}

        {outputFormat && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-green-800 font-medium mb-2">Output Format:</h3>
            <p className="text-green-700 whitespace-pre-line">
              {outputFormat.replace("Output Format:", "").trim()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

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
              {formatPrompt(data.prompt)}
            </div>
          </section>

          {/* Code Editor */}
          <section className="bg-white rounded-2xl shadow-soft overflow-hidden border border-neutral-200">
            <CodeRunner questionId={id} tests={data.tests} />
          </section>
        </div>
      </div>
    </div>
  );
}
