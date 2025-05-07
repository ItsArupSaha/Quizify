"use client";

import { Lightbulb } from "lucide-react";
import { useState } from "react";

interface HintToggleProps {
  hint: string;
}

export default function HintToggle({ hint }: HintToggleProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mt-4">
      <button
        onClick={() => setVisible((v) => !v)}
        className="absolute top-0 right-0 flex items-center px-3 py-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
      >
        <Lightbulb className="w-5 h-5 mr-1" />
        {visible ? "Hide Hint" : "Show Hint"}
      </button>

      {visible && (
        <div className="mt-8 p-4 bg-gray-600 border border-gray-300 rounded shadow-sm">
          {hint}
        </div>
      )}
    </div>
  );
}
