// scripts/seed.ts
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Load service account via env var
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function main() {
  const file = path.join(__dirname, "..", "questions.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  const batch = db.batch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.forEach((q: any) => {
    const ref = db.collection("questions").doc(q.id);
    batch.set(ref, q);
  });

  await batch.commit();
  console.log(`✅ Seeded ${data.length} questions`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
