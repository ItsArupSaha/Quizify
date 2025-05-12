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
    <div ref={containerRef} className="relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            Challenge #{id}
          </h1>
        </div>
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          aria-label={isOpen ? "Hide Hint" : "Show Hint"}
        >
          <Lightbulb className="w-5 h-5" />
          <span className="font-medium">Hint</span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-neutral-200 rounded-xl shadow-lg p-4 z-10">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-primary-500" />
            <h2 className="font-display font-semibold text-neutral-900">
              Hint
            </h2>
          </div>
          <p className="text-neutral-700 leading-relaxed">{hint}</p>
        </div>
      )}
    </div>
  );
}
