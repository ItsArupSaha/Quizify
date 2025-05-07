/* eslint-disable */

// scripts/seed.js
const fs   = require("fs");
const path = require("path");
const admin = require("firebase-admin");

// use the serviceAccountKey.json via the env var you already set
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

(async () => {
  try {
    const file = path.join(__dirname, "..", "questions.json");
    const data = JSON.parse(fs.readFileSync(file, "utf8"));

    const batch = db.batch();
    data.forEach(q => {
      batch.set(db.collection("questions").doc(q.id), q);
    });

    await batch.commit();
    console.log(`✅  Seeded ${data.length} questions`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
