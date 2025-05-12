"use client";

import { db, useUser } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  lastSolved?: string;
  lastSolvedTitle?: string;
  streak: number;
}

export default function UserStats() {
  const user = useUser();
  const [stats, setStats] = useState<UserStats>({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    streak: 0,
  });

  useEffect(() => {
    if (!user?.uid) return;

    let unsub: (() => void) | undefined;

    try {
      unsub = onSnapshot(
        doc(db, "users", user.uid),
        async (snap) => {
          try {
            const data = snap.data();
            const solved = data?.solved || {};
            const solvedIds = Object.keys(solved).filter((id) => solved[id]);

            // Count solved questions by level
            const easySolved = solvedIds.filter((id) =>
              id.startsWith("easy")
            ).length;
            const mediumSolved = solvedIds.filter((id) =>
              id.startsWith("medium")
            ).length;
            const hardSolved = solvedIds.filter((id) =>
              id.startsWith("hard")
            ).length;

            // Calculate streak
            let streak = 0;
            const today = new Date().setHours(0, 0, 0, 0);
            const solvedTimestamps = Object.entries(data || {})
              .filter(([key]) => key.startsWith("solved_"))
              .map(([_, timestamp]) =>
                new Date(timestamp as number).setHours(0, 0, 0, 0)
              )
              .sort((a, b) => b - a);

            if (solvedTimestamps.length > 0) {
              let currentDate = today;
              let lastSolvedDate = solvedTimestamps[0];

              // If last solved was today, start streak at 1
              if (currentDate === lastSolvedDate) {
                streak = 1;
                currentDate = new Date(currentDate - 86400000).setHours(
                  0,
                  0,
                  0,
                  0
                ); // yesterday
              }

              // Count consecutive days
              for (let i = 1; i < solvedTimestamps.length; i++) {
                const solvedDate = solvedTimestamps[i];
                if (currentDate === solvedDate) {
                  streak++;
                  currentDate = new Date(currentDate - 86400000).setHours(
                    0,
                    0,
                    0,
                    0
                  );
                } else {
                  break;
                }
              }
            }

            // Get the last solved question's title
            let lastSolvedTitle = "No problems solved yet";
            if (solvedIds.length > 0 && data) {
              const lastSolvedId = Object.entries(solved)
                .filter(([_, isSolved]) => isSolved)
                .sort(([a], [b]) => {
                  const aTime = data[`solved_${a}`] || 0;
                  const bTime = data[`solved_${b}`] || 0;
                  return bTime - aTime;
                })[0]?.[0];

              if (lastSolvedId) {
                try {
                  const questionDoc = await getDoc(
                    doc(db, "questions", lastSolvedId)
                  );
                  if (questionDoc.exists()) {
                    lastSolvedTitle = questionDoc.data().title || lastSolvedId;
                  }
                } catch (error) {
                  console.error("Error fetching question:", error);
                  lastSolvedTitle = lastSolvedId;
                }
              }
            }

            setStats({
              totalSolved: easySolved + mediumSolved + hardSolved,
              easySolved,
              mediumSolved,
              hardSolved,
              lastSolved: data?.lastSolved,
              lastSolvedTitle,
              streak,
            });
          } catch (error) {
            console.error("Error processing user data:", error);
          }
        },
        (error) => {
          console.error("Error in user stats snapshot:", error);
        }
      );
    } catch (error) {
      console.error("Error setting up user stats listener:", error);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [user]);

  return (
    <div className="px-4 py-2 border-b border-gray-100">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Total Solved</p>
          <p className="font-medium text-gray-900">{stats.totalSolved}</p>
        </div>
        <div>
          <p className="text-gray-500">Streak</p>
          <p className="font-medium text-orange-600">{stats.streak} days 🔥</p>
        </div>
        <div>
          <p className="text-gray-500">Last Solved</p>
          <p
            className="font-medium text-gray-900 truncate"
            title={stats.lastSolvedTitle}
          >
            {stats.lastSolvedTitle}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Easy</p>
          <p className="font-medium text-green-600">{stats.easySolved}</p>
        </div>
        <div>
          <p className="text-gray-500">Medium</p>
          <p className="font-medium text-yellow-600">{stats.mediumSolved}</p>
        </div>
        <div>
          <p className="text-gray-500">Hard</p>
          <p className="font-medium text-red-600">{stats.hardSolved}</p>
        </div>
      </div>
    </div>
  );
}
