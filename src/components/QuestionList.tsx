"use client";

import { useUser, db as webDb } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

interface Question {
  id: string;
  prompt: string;
}

export default function QuestionList({ questions }: { questions: Question[] }) {
  const user = useUser();
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});
  const [reviseMap, setReviseMap] = useState<Record<string, boolean>>({});

  // Listen for user.solved changes
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(webDb, "users", user.uid), (snap) => {
      const data = snap.data();
      setSolvedMap(data?.solved || {});
      setReviseMap(data?.revise || {});
    });
    return () => unsub();
  }, [user]);

  const toggleRevise = async (qid: string) => {
    if (!user?.uid) return;

    // Toggle locally first
    const newVal = !reviseMap[qid];
    setReviseMap((prev) => ({ ...prev, [qid]: newVal }));

    // Reference the user document
    const userRef = doc(webDb, "users", user.uid);

    // Merge in the nested revise flag
    await setDoc(userRef, { revise: { [qid]: newVal } }, { merge: true });
  };

  return (
    <div className="p-6">
      <div className="grid gap-4">
        {questions.map(({ id, prompt }) => {
          const isSolved = Boolean(solvedMap[id]);
          const isRevise = Boolean(reviseMap[id]);
          return (
            <div
              key={id}
              className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-primary-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <Link
                    href={`/q/${id}`}
                    className="text-lg font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {id}
                  </Link>
                  <p className="text-neutral-600 mt-1 line-clamp-2">{prompt}</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Solved status */}
                  <div className="flex items-center">
                    {isSolved ? (
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Solved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm font-medium">
                        Unsolved
                      </span>
                    )}
                  </div>

                  {/* Revise button */}
                  <button
                    onClick={() => toggleRevise(id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isRevise
                        ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                        : "text-neutral-400 hover:text-yellow-500 hover:bg-yellow-50"
                    }`}
                    title={isRevise ? "Remove from revise" : "Mark to revise"}
                  >
                    {isRevise ? (
                      <FaStar className="w-5 h-5" />
                    ) : (
                      <FaRegStar className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
