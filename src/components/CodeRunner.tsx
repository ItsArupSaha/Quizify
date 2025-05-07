/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser, db as webDb } from "@/lib/firebase";
import Editor from "@monaco-editor/react";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

type TestCase = { callArgs: string; expected: string; hidden: boolean };

interface CodeRunnerProps {
  questionId: string;
  initialCode: string;
  tests: TestCase[];
}

export default function CodeRunner({
  questionId,
  initialCode,
  tests,
}: CodeRunnerProps) {
  const user = useUser();
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>("");
  const [pyodide, setPyodide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1) Load & initialize Pyodide v0.27.5
  useEffect(() => {
    async function init() {
      // Inject script if needed
      if (!(window as any).loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js";
        await new Promise<void>((res) => {
          script.onload = () => res();
          document.body.appendChild(script);
        });
      }
      const py = await (window as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
      });
      setPyodide(py);
      setLoading(false);
      console.log("✅ Pyodide ready", py.version);
    }
    init();
  }, []);

  // 2) Handle Run (public test only)
  const handleRun = async () => {
    console.log("🔘 Run clicked");
    if (loading || !pyodide) {
      console.warn("⚠️ Pyodide loading…");
      return;
    }
    try {
      setOutput("");
      await pyodide.runPythonAsync(code);

      const { callArgs, expected } = tests[0];
      const actual = pyodide.runPython(`solution(${callArgs})`);
      const passed = String(actual) === expected;
      const status = passed ? "✅" : "❌";
      const message =
        `Test:     solution(${callArgs})\n` +
        `Expected: ${expected}\n` +
        `Actual:   ${actual}\n` +
        `${status}`;

      console.log("➡️ Run feedback:\n" + message);
      setOutput(message);
    } catch (e: any) {
      console.error("❌ Run error", e);
      setOutput(`Error: ${e.message || e}`);
    }
  };

  // 3) Handle Submit (all tests + Firestore write)
  const handleSubmit = async () => {
    console.log("🔘 Submit clicked");
    if (loading || !pyodide) {
      console.warn("⚠️ Pyodide loading…");
      return;
    }
    try {
      setOutput("");
      await pyodide.runPythonAsync(code);

      let allPassed = true;
      const lines: string[] = [];

      for (const { callArgs, expected, hidden } of tests) {
        let actual: any;
        let passed = false;
        try {
          actual = pyodide.runPython(`solution(${callArgs})`);
          passed = String(actual) === expected;
        } catch (err: any) {
          actual = `⚠️ ${err.message || err}`;
        }
        if (!passed) allPassed = false;
        if (!hidden) {
          lines.push(
            `solution(${callArgs}) → ${actual} ${
              passed ? "✅" : `❌ (expected ${expected})`
            }`
          );
        }
      }

      if (allPassed) {
        lines.push("", "🎉 All tests passed!");
        if (user?.uid) {
          const field = `solved.${questionId}`;
          await setDoc(
            doc(webDb, "users", user.uid),
            { [field]: true },
            { merge: true }
          );
          console.log("💾 Solved saved for", questionId);
        }
      } else {
        lines.push("", "Some tests failed. Check above.");
      }

      const message = lines.join("\n");
      console.log("➡️ Submit feedback:\n" + message);
      setOutput(message);
    } catch (e: any) {
      console.error("❌ Submit error", e);
      setOutput(`Error: ${e.message || e}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="relative rounded-lg shadow-lg overflow-hidden">
        <Editor
          height="300px"
          width="100%"
          defaultLanguage="python"
          value={code}
          theme="vs-dark"
          onChange={(v) => v !== undefined && setCode(v)}
          options={{
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />

        <div className="absolute top-2 right-2 flex space-x-2 z-20">
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
          >
            Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>

      <pre className="mt-4 bg-black text-white p-4 rounded font-mono h-40 overflow-y-auto whitespace-pre-wrap">
        {output || "No output yet…"}
      </pre>
    </div>
  );
}
