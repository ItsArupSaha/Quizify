"use client";

import { db, useUser } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StudentProgress {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak: number;
  lastActive: Date;
}

export default function AdminPage() {
  const user = useUser();
  const router = useRouter();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      console.log("Current user state:", user);

      // Wait for user to be loaded
      if (user === undefined) {
        console.log("User state is still loading...");
        return;
      }

      // Check if user is logged in
      if (!user) {
        console.log("No user found, redirecting to login...");
        router.push("/");
        return;
      }

      // Check if user is admin
      const isAdmin = user.email === "growwitharup@gmail.com";
      console.log("User email:", user.email);
      console.log("Is admin:", isAdmin);

      if (!isAdmin) {
        console.log("User is not admin, redirecting...");
        router.push("/");
        return;
      }

      // User is verified as admin
      console.log("User verified as admin, proceeding...");
      setIsVerifying(false);
    };

    // Add a small delay to ensure auth state is stable
    const timeoutId = setTimeout(verifyAdmin, 1000);
    return () => clearTimeout(timeoutId);
  }, [user, router]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (isVerifying) {
        console.log("Still verifying admin status...");
        return;
      }

      try {
        console.log("Fetching students...");
        const usersSnapshot = await getDocs(collection(db, "users"));
        console.log("Got users snapshot:", usersSnapshot.size, "users");

        const studentsData: StudentProgress[] = [];

        for (const doc of usersSnapshot.docs) {
          const data = doc.data();
          console.log("Processing user:", doc.id, data.email);

          const solved = data.solved || {};
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

          studentsData.push({
            uid: doc.id,
            email: data.email || "",
            displayName: data.displayName || "Anonymous",
            photoURL: data.photoURL || "/avatar-placeholder.png",
            totalSolved: easySolved + mediumSolved + hardSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            streak,
            lastActive: new Date(data.lastSolved || Date.now()),
          });
        }

        // Sort by total solved questions (descending)
        studentsData.sort((a, b) => b.totalSolved - a.totalSolved);
        setStudents(studentsData);
        setError(null);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch students"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [isVerifying]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 text-white pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold">Verifying admin access...</h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 text-white pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold">Loading student data...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 text-white pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Error</h1>
          <div className="bg-red-500/10 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 text-white pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Student Progress</h1>
          <div className="text-sm text-white/60">{user?.email}</div>
        </div>

        <div className="bg-white/5 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Easy</th>
                  <th className="p-4 font-medium">Medium</th>
                  <th className="p-4 font-medium">Hard</th>
                  <th className="p-4 font-medium">Streak</th>
                  <th className="p-4 font-medium">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  console.log("Rendering student:", student);
                  return (
                    <tr key={student.uid} className="border-b border-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={student.photoURL}
                              alt={student.displayName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium">
                            {student.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">{student.totalSolved}</td>
                      <td className="p-4">{student.easySolved}</td>
                      <td className="p-4">{student.mediumSolved}</td>
                      <td className="p-4">{student.hardSolved}</td>
                      <td className="p-4">{student.streak} days</td>
                      <td className="p-4 text-white/80">
                        {student.lastActive.toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
