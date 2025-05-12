/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser, db as webDb } from "@/lib/firebase";
import Editor, { loader } from "@monaco-editor/react";
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

// Configure Monaco editor
loader.init().then((monaco) => {
  monaco.editor.defineTheme("customTheme", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6A9955" },
      { token: "keyword", foreground: "C586C0" },
      { token: "string", foreground: "CE9178" },
      { token: "number", foreground: "B5CEA8" },
      { token: "type", foreground: "4EC9B0" },
    ],
    colors: {
      "editor.background": "#f3f4f6",
      "editor.foreground": "#1f2937",
      "editor.lineHighlightBackground": "#e5e7eb",
      "editor.selectionBackground": "#d1d5db",
      "editor.inactiveSelectionBackground": "#e5e7eb",
      "editor.lineHighlightBorder": "#e5e7eb",
      "editorLineNumber.foreground": "#9ca3af",
      "editorLineNumber.activeForeground": "#4b5563",
    },
  });
});

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
    <div>
      {/* Editor toolbar */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Run Code
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-secondary-600 text-white rounded-lg font-medium hover:bg-secondary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Submit
          </button>
        </div>
      </div>

      {/* Editor and output container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Code editor */}
        <div className="h-[400px] rounded-lg overflow-hidden border border-neutral-200">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="customTheme"
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Output console */}
        <div className="h-[400px] bg-neutral-900 rounded-lg p-4 font-mono text-sm text-neutral-100 overflow-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-neutral-400">Output</span>
          </div>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 border-t border-neutral-200">
        <button
          onClick={() => prevId && router.push(`/q/${prevId}`)}
          disabled={!prevId}
          className="px-4 py-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-50 disabled:hover:text-neutral-600 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>
        <button
          onClick={() => nextId && router.push(`/q/${nextId}`)}
          disabled={!nextId || (isLastInLevel && !allLevelSolved)}
          className="px-4 py-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-50 disabled:hover:text-neutral-600 transition-colors flex items-center gap-2"
        >
          Next
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
