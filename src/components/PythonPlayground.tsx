/* eslint-disable */
"use client";

import Editor, { loader } from "@monaco-editor/react";
import { useEffect, useState } from "react";

// Configure Monaco editor
if (typeof window !== "undefined") {
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
}

export default function PythonPlayground() {
  const [code, setCode] = useState<string>("# Write Python here\n");
  const [output, setOutput] = useState<string>("No output yet…");
  const [pyodide, setPyodide] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load Pyodide
  useEffect(() => {
    if (typeof window === "undefined") return;

    async function init() {
      if (!(window as any).loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js";
        document.body.appendChild(script);
        await new Promise<void>((res) => {
          script.onload = () => res();
        });
      }
      const py = await (window as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
      });
      setPyodide(py);
      setLoading(false);
    }
    init();
  }, []);

  const handleRun = async () => {
    if (loading || !pyodide) return;
    setOutput("");
    try {
      const wrapped = `
import sys, io, traceback
sys.stdout = io.StringIO()
sys.stderr = sys.stdout
try:
${code
  .split("\n")
  .map((line) => "    " + line)
  .join("\n")}
except Exception:
    traceback.print_exc()
`;
      await pyodide.runPythonAsync(wrapped);
      const result = await pyodide.runPythonAsync("sys.stdout.getvalue()");
      setOutput(String(result));
    } catch (err: any) {
      setOutput(`Error: ${err.message || err}`);
    }
  };

  return (
    <section className="w-full py-20 bg-neutral-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="container-custom relative">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
            Try Python{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Right in Your Browser
            </span>
          </h2>
          <p className="text-lg text-neutral-600">
            Write and run Python code instantly. No setup required.
          </p>
        </div>

        {/* Playground container */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-neutral-200">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
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

          {/* Tips section */}
          <div className="p-4 bg-neutral-50 border-t border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">Pro Tip</h4>
                <p className="text-sm text-neutral-600">
                  Try modifying the example code or write your own. The editor
                  supports syntax highlighting and auto-completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
