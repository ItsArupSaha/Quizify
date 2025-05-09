/* eslint-disable */
"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";

export default function PythonPlayground() {
  const [code, setCode] = useState<string>("# Write Python here\n");
  const [output, setOutput] = useState<string>("No output yet…");
  const [pyodide, setPyodide] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load Pyodide
  useEffect(() => {
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
    <div className="max-w-4xl mx-auto my-12 p-4 bg-amber-50 border rounded-lg shadow">
      <h3 className="text-2xl font-semibold text-gray-600 mb-4">
        Python Playground
      </h3>
      <Editor
        height="300px"
        width="100%"
        defaultLanguage="python"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value ?? "")}
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleRun}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
        >
          Run
        </button>
      </div>
      <pre className="mt-4 bg-black text-green-200 p-4 rounded h-40 overflow-y-auto font-mono whitespace-pre-wrap">
        {output}
      </pre>
    </div>
  );
}
