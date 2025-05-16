/* eslint-disable */
"use client";

import Editor, { loader } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";

// TypeScript definitions for Skulpt
declare global {
  interface Window {
    Sk: {
      configure: (config: {
        output: (text: string) => void;
        read: (x: string) => string;
        inputfun: (prompt: string) => string;
        inputfunTakesPrompt: boolean;
      }) => void;
      misceval: {
        asyncToPromise: (f: () => any) => Promise<any>;
      };
      importMainWithBody: (
        name: string,
        dumpJS: boolean,
        code: string,
        useAsync: boolean
      ) => any;
      builtinFiles: {
        files: {
          [key: string]: string;
        };
      };
    };
  }
}

// Configure Monaco editor
if (typeof window !== "undefined") {
  loader.init().then((monaco) => {
    monaco.editor.defineTheme("customTheme", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "008000" },
        { token: "keyword", foreground: "0000FF" },
        { token: "string", foreground: "A31515" },
        { token: "number", foreground: "098658" },
        { token: "type", foreground: "267F99" },
        { token: "default", foreground: "000000" },
      ],
      colors: {
        "editor.background": "#f3f4f6",
        "editor.foreground": "#000000",
        "editor.lineHighlightBackground": "#e5e7eb",
        "editor.selectionBackground": "#d1d5db",
        "editor.inactiveSelectionBackground": "#e5e7eb",
        "editor.lineHighlightBorder": "#e5e7eb",
        "editorLineNumber.foreground": "#6B7280",
        "editorLineNumber.activeForeground": "#374151",
      },
    });
  });
}

export default function PythonPlayground() {
  const [code, setCode] = useState<string>("# Write Python here\n");
  const [output, setOutput] = useState<string>("No output yet…");
  const [loading, setLoading] = useState<boolean>(true);
  const [inputValue, setInputValue] = useState<string>("");
  const [waitingForInput, setWaitingForInput] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const outputRef = useRef<string[]>([]);
  const inputResolveRef = useRef<((value: string) => void) | null>(null);

  // Load Skulpt
  useEffect(() => {
    if (typeof window === "undefined") return;

    async function loadSkulpt() {
      // Load Skulpt core
      const skulptCore = document.createElement("script");
      skulptCore.src = "https://skulpt.org/js/skulpt.min.js";
      document.body.appendChild(skulptCore);

      // Load Skulpt standard lib
      const skulptStdLib = document.createElement("script");
      skulptStdLib.src = "https://skulpt.org/js/skulpt-stdlib.js";
      document.body.appendChild(skulptStdLib);

      // Wait for both scripts to load
      await new Promise<void>((res) => {
        skulptStdLib.onload = () => res();
      });

      setLoading(false);
    }

    loadSkulpt();
  }, []);

  // Skulpt output function
  const outf = (text: string) => {
    outputRef.current.push(text);
    setOutput(outputRef.current.join(""));
  };

  // Skulpt input function
  const inf = (prompt: string) => {
    return new Promise<string>((resolve) => {
      setInputPrompt(prompt);
      setWaitingForInput(true);
      inputResolveRef.current = resolve;
    });
  };

  // Handle input submission
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputResolveRef.current) {
      inputResolveRef.current(inputValue);
      inputResolveRef.current = null;
      setWaitingForInput(false);
      setInputValue("");
      setInputPrompt("");
    }
  };

  // Skulpt ready function (called when external modules are loaded)
  const builtinRead = (x: string) => {
    if (
      window.Sk.builtinFiles === undefined ||
      window.Sk.builtinFiles["files"][x] === undefined
    )
      throw "File not found: '" + x + "'";
    return window.Sk.builtinFiles["files"][x];
  };

  const handleRun = async () => {
    if (loading) return;

    // Clear previous output and input state
    outputRef.current = [];
    setOutput("");
    setWaitingForInput(false);
    setInputPrompt("");
    setInputValue("");
    inputResolveRef.current = null;

    try {
      // Configure Skulpt
      window.Sk.configure({
        output: outf,
        read: builtinRead,
        inputfun: inf as any,
        inputfunTakesPrompt: true,
      });

      // Run the Python code
      await window.Sk.misceval.asyncToPromise(() =>
        window.Sk.importMainWithBody("<stdin>", false, code, true)
      );
    } catch (err: any) {
      outf(`Error: ${err.toString()}\n`);
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

            {/* Output console with input field */}
            <div className="h-[400px] bg-neutral-900 rounded-lg p-4 font-mono text-sm text-neutral-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-neutral-400">Output</span>
              </div>
              <div className="flex-1 overflow-auto">
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
              {waitingForInput && (
                <form onSubmit={handleInputSubmit} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={inputPrompt}
                    className="flex-1 bg-neutral-800 text-white px-3 py-2 rounded border border-neutral-700 focus:outline-none focus:border-primary-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                  >
                    Enter
                  </button>
                </form>
              )}
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
