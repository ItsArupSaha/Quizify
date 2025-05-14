/* eslint-disable */

"use client";

import QuestionList from "@/components/QuestionList";
import { allQuestions } from "@/data/questions";
import { db, useUser } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

interface Question {
  id: string;
  prompt: string;
}

export default function ReviseClient() {
  const user = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    async function loadRevise() {
      // 1) load the user's revise map
      if (!user) {
        setLoading(false);
        return;
      }
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.exists() ? userSnap.data() : {};
      const reviseMap = (data as any).revise || {};

      // 2) collect all flagged IDs
      const reviseIds = Object.entries(reviseMap)
        .filter(([, flag]) => flag)
        .map(([qid]) => qid);

      if (reviseIds.length === 0) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      // 3) get questions from static data
      const qList = allQuestions
        .filter((q) => reviseIds.includes(q.id))
        .map((q) => ({ id: q.id, prompt: q.prompt }));

      setQuestions(qList);
      setLoading(false);
    }

    loadRevise();
  }, [user]);

  if (loading) return <p>Loading flagged problems…</p>;
  if (questions.length === 0) return <p>No flagged problems to revise.</p>;

  return <QuestionList questions={questions} />;
}
