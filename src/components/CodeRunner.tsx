/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser, db as webDb } from "@/lib/firebase";
import Editor from "@monaco-editor/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TIMEOUT_MS = 3000;
function withTimeout<T>(p: Promise<T>) {
  const timeout = new Promise<never>((_, rej) =>
    setTimeout(() => rej(new Error("⏰ Time limit exceeded")), TIMEOUT_MS)
  );
  return Promise.race([p, timeout]) as Promise<T>;
}

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
  const router = useRouter();
  const [nextId, setNextId] = useState<string | null>(null);
  const [prevId, setPrevId] = useState<string | null>(null);
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});
  const [levelIds, setLevelIds] = useState<string[]>([]);

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

  useEffect(() => {
    // Derive current level and numeric code from questionId: "easy-100" → ["easy","100"]
    const [level] = questionId.split("-");

    // Define the level order
    const levels = ["easy", "medium", "hard"];

    // Helper to load IDs for a given level
    async function loadIdsFor(lvl: string) {
      const q = query(
        collection(webDb, "questions"),
        where("level", "==", lvl),
        orderBy("id") // requires your composite index
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.id);
    }

    async function computeNext() {
      // 1) load IDs of current level
      const ids = await loadIdsFor(level);
      setLevelIds(ids);

      const idx = ids.indexOf(questionId);

      // ── new: compute prevId
      if (idx > 0) {
        // just the previous in this level
        setPrevId(ids[idx - 1]);
      } else {
        // first in this level → go to last of prior level (if any)
        const prevLevel = levels[levels.indexOf(level) - 1];
        if (prevLevel) {
          const prevIds = await loadIdsFor(prevLevel);
          setPrevId(prevIds.length ? prevIds[prevIds.length - 1] : null);
        } else {
          setPrevId(null);
        }
      }

      if (idx >= 0 && idx < ids.length - 1) {
        // simply next in same level
        setNextId(ids[idx + 1]);
        return;
      }
      // 2) else no more in this level → find next level
      const nextLevel = levels[levels.indexOf(level) + 1];
      if (nextLevel) {
        const nextIds = await loadIdsFor(nextLevel);
        if (nextIds.length) {
          setNextId(nextIds[0]);
          return;
        }
      }

      // 3) nowhere to go
      setNextId(null);
    }

    computeNext();
  }, [questionId]);

  useEffect(() => {
    if (!user?.uid) return;
    const userRef = doc(webDb, "users", user.uid);
    getDoc(userRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSolvedMap(data.solved || {});
      }
    });
  }, [user]);

  // 2) Handle Run (public test only)
  const handleRun = async () => {
    console.log("🔘 Run clicked");
    if (loading || !pyodide) {
      console.warn("⚠️ Pyodide loading…");
      return;
    }
    try {
      setOutput("");
      await withTimeout(pyodide.runPythonAsync(code));

      const { callArgs, expected } = tests[0];
      const actual: string = pyodide.runPython(
        `str(solution(${callArgs})) if isinstance(solution(${callArgs}), bool) else __import__('json').dumps(solution(${callArgs}))`
      );
      const passed = actual === expected;
      const status = passed ? "🔥 You did it!!" : "😢 Try again!";
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
      await withTimeout(pyodide.runPythonAsync(code));

      let allPassed = true;
      const lines: string[] = [];

      for (const { callArgs, expected, hidden } of tests) {
        let actual: string;
        let passed = false;
        try {
          actual = pyodide.runPython(
            `str(solution(${callArgs})) if isinstance(solution(${callArgs}), bool) else __import__('json').dumps(solution(${callArgs}))`
          );
          passed = actual === expected;
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
        if (user && user.uid) {
          lines.push("", "🎉 All tests passed!");
          const userRef = doc(webDb, "users", user.uid);
          await setDoc(
            userRef,
            { solved: { [questionId]: true } },
            { merge: true }
          );
          setSolvedMap((prev) => ({ ...prev, [questionId]: true }));
          console.log("💾 Solved status saved for", questionId);
        } else {
          console.warn("🔒 No user signed in, skipping solved write");
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

  // disable Next on the last question until every ID in this level is marked solved
  const isLastInLevel = levelIds.indexOf(questionId) === levelIds.length - 1;
  const allLevelSolved =
    levelIds.length > 0 && levelIds.every((id) => solvedMap[id]);

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
      <div className="mt-4 flex justify-between">
        {/* Previous button */}
        <button
          onClick={() => prevId && router.push(`/q/${prevId}`)}
          disabled={!prevId}
          title={!prevId ? "No previous question" : undefined}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {/* Next button */}
        <button
          onClick={() => nextId && router.push(`/q/${nextId}`)}
          disabled={isLastInLevel && !allLevelSolved}
          title={
            isLastInLevel && !allLevelSolved
              ? "You must solve all problems to move further!"
              : undefined
          }
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
