/* eslint-disable */

"use client";

import QuestionList from "@/components/QuestionList";
import { getQuestionsByLevel } from "@/data/questions";
import { db, useUser } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const LEVELS = ["easy", "medium", "hard"] as const;

interface LevelWrapperProps {
  level: (typeof LEVELS)[number];
  questions: { id: string; prompt: string }[];
}

export default function LevelWrapper({ level, questions }: LevelWrapperProps) {
  const user = useUser();
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});
  const [prevLevelIds, setPrevLevelIds] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);

  // 1) Load the user's solved map
  useEffect(() => {
    if (!user?.uid) return;
    const userRef = doc(db, "users", user.uid);
    getDoc(userRef).then((snap) => {
      const data = snap.exists() ? snap.data() : {};
      setSolvedMap((data as any).solved || {});
    });
  }, [user]);

  // 2) Fetch the IDs of the previous level
  useEffect(() => {
    const idx = LEVELS.indexOf(level);
    if (idx <= 0) {
      setPrevLevelIds([]); // no "previous" for easy
      return;
    }
    const prevLevel = LEVELS[idx - 1];
    const prevQuestions = getQuestionsByLevel(prevLevel);
    setPrevLevelIds(prevQuestions.map((q) => q.id));
  }, [level]);

  // 3) Lock if any previous‐level ID is unsolved
  useEffect(() => {
    if (prevLevelIds.length === 0 && level !== "easy") return;
    const allPrevSolved = prevLevelIds.every((id) => solvedMap[id]);
    setLocked(!allPrevSolved);
  }, [prevLevelIds, solvedMap, level]);

  return (
    <div className="relative">
      {/* Blur and block interactions when locked */}
      <div className={locked ? "filter blur-sm pointer-events-none" : ""}>
        <QuestionList questions={questions} />
      </div>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v3m12 0V6a3 3 0 00-3-3H9a3 3 0 00-3 3v3"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Level Locked
            </h3>
            <p className="text-neutral-600">
              Complete all{" "}
              <span className="font-semibold text-primary-600">
                {LEVELS[LEVELS.indexOf(level) - 1].toUpperCase()}
              </span>{" "}
              challenges to unlock this level.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
