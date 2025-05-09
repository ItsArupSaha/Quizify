/* eslint-disable */

"use client";

import QuestionList from "@/components/QuestionList";
import { db, useUser } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
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
      setPrevLevelIds([]); // no “previous” for easy
      return;
    }
    const prevLevel = LEVELS[idx - 1];
    async function fetchPrevIds() {
      const q = query(
        collection(db, "questions"),
        where("level", "==", prevLevel),
        orderBy("id")
      );
      const snap = await getDocs(q);
      setPrevLevelIds(snap.docs.map((d) => d.id));
    }
    fetchPrevIds();
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
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
          <p className="text-lg font-semibold text-gray-700 text-center px-4">
            You must solve all{" "}
            <strong>{LEVELS[LEVELS.indexOf(level) - 1].toUpperCase()}</strong>{" "}
            problems to unlock.
          </p>
        </div>
      )}
    </div>
  );
}
