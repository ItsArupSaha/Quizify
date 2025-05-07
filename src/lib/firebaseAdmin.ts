// src/lib/firebaseAdmin.ts
import * as admin from "firebase-admin";
import serviceAccount from "../../serviceAccountKey.json";

// Initialize the Admin app if not already initialized
const adminApp = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    })
  : admin.app();

// Export a Firestore instance for server‐side use
export const adminDb = adminApp.firestore();
