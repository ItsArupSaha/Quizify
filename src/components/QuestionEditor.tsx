"use client";

import Editor from "@monaco-editor/react";

interface QuestionEditorProps {
  code: string;
}

export default function QuestionEditor({ code }: QuestionEditorProps) {
  return (
    <div className="w-4/5 mx-auto shadow-lg rounded-lg overflow-hidden">
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
  );
}
