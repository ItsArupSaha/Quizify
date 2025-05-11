import * as admin from "firebase-admin";

// Read the entire JSON string from an env var
const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
if (!keyJson) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY environment variable");
}
const serviceAccount = JSON.parse(keyJson) as admin.ServiceAccount;

const adminApp = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

export const adminDb = adminApp.firestore();
