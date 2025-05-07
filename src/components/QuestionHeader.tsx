"use client";

import { Lightbulb } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface QuestionHeaderProps {
  id: string;
  hint: string;
}

export default function QuestionHeader({ id, hint }: QuestionHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover if click happens outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Question: {id}</h1>
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          aria-label={isOpen ? "Hide Hint" : "Show Hint"}
        >
          <Lightbulb className="w-5 h-5 mr-1" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-500 border border-gray-300 rounded shadow-lg p-4 z-10">
          <h2 className="font-semibold mb-1">Hint</h2>
          <p>{hint}</p>
        </div>
      )}
    </div>
  );
}
