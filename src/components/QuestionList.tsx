"use client";

import { useUser, db as webDb } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa"; // for a revise star icon

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
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-gray-700">Problem</th>
            <th className="px-4 py-2 text-center text-gray-700">Solved</th>
            <th className="px-4 py-2 text-center text-gray-700">Revise</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(({ id, prompt }) => {
            const isSolved = Boolean(solvedMap[id]);
            const isRevise = Boolean(reviseMap[id]);
            return (
              <tr key={id} className="border-t">
                {/* Problem */}
                <td className="px-4 py-3">
                  <Link
                    href={`/q/${id}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    {id}
                  </Link>
                  <div className="text-gray-600 text-sm truncate max-w-xl">
                    {prompt}
                  </div>
                </td>

                {/* Solved */}
                <td className="px-4 py-3 text-center">
                  {isSolved ? (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      ✓
                    </span>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </td>

                {/* Revise */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleRevise(id)}
                    className="text-xl text-yellow-600 hover:text-yellow-700 transition"
                    title={isRevise ? "Remove from revise" : "Mark to revise"}
                  >
                    {isRevise ? <FaStar /> : <FaRegStar />}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
