// src/lib/firebaseAdmin.ts
import * as admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Read the path to your key from the env var
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  throw new Error(
    "Missing GOOGLE_APPLICATION_CREDENTIALS environment variable"
  );
}

// Synchronously load and parse the JSON key
const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve(keyPath), "utf-8")
) as admin.ServiceAccount;

// Initialize the Admin app if not already initialized
const adminApp = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

// Export Firestore (or other services)
export const adminDb = adminApp.firestore();
