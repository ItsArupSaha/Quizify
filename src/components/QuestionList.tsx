"use client";

import { useUser, db as webDb } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Question {
  id: string;
  prompt: string;
}

export default function QuestionList({ questions }: { questions: Question[] }) {
  const user = useUser();
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});

  // Listen for user.solved changes
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(webDb, "users", user.uid), (snap) => {
      const data = snap.data();
      setSolvedMap(data?.solved || {});
    });
    return () => unsub();
  }, [user]);

  return (
    <ul className="space-y-4">
      {questions.map(({ id, prompt }) => {
        const isSolved = Boolean(solvedMap[id]);
        return (
          <li
            key={id}
            className="p-4 bg-white rounded shadow flex justify-between items-center"
          >
            <div>
              <Link
                href={`/q/${id}`}
                className="text-lg font-medium hover:underline"
              >
                {id}
              </Link>
              <p className="text-gray-600 truncate max-w-lg">{prompt}</p>
            </div>
            {isSolved ? (
              <span className="text-green-600 font-semibold">✔ Solved</span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
