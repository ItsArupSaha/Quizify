const admin = require("firebase-admin");
const path = require("path");

// Path to your service account key JSON file
const serviceAccount = require(path.resolve(__dirname, "../serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function syncUsers() {
  const auth = admin.auth();
  let nextPageToken;
  let updatedCount = 0;

  do {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    for (const userRecord of listUsersResult.users) {
      const { uid, email, displayName, photoURL } = userRecord;
      if (!email) continue; // skip users without email

      // Update Firestore user document
      await db.collection("users").doc(uid).set(
        {
          email,
          displayName: displayName || "",
          photoURL: photoURL || "",
        },
        { merge: true }
      );
      updatedCount++;
      console.log(`Updated user: ${email} (${uid})`);
    }
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  console.log(`Done! Updated ${updatedCount} users.`);
}

syncUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  }); 