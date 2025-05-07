"use client";

import Editor from "@monaco-editor/react";
import { Lightbulb } from "lucide-react";
import { useState } from "react";

interface CodeWithHintProps {
  code: string;
  hint: string;
}

export default function CodeWithHint({ code, hint }: CodeWithHintProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-4/5 mx-auto">
      <div className="relative shadow-lg rounded-lg">
        {/* Editor container */}
        <div className="overflow-hidden rounded-t-lg">
          <Editor
            height="300px"
            width="100%"
            defaultLanguage="python"
            defaultValue={code}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Hint toggle button overlaid top-right */}
        <button
          onClick={() => setVisible((v) => !v)}
          className="absolute top-2 right-2 flex items-center bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-3 py-1 transition-shadow shadow-md"
        >
          <Lightbulb className="w-5 h-5 mr-1" />
          {visible ? "Hide Hint" : "Show Hint"}
        </button>
      </div>

      {/* Hint panel */}
      {visible && (
        <div className="mt-3 p-4 bg-gray-100 border border-gray-300 rounded shadow-sm">
          {hint}
        </div>
      )}
    </div>
  );
}
