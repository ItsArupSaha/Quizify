const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateQuestions() {
  try {
    // Read the questions from questions.json
    const questionsPath = path.join(__dirname, '..', 'questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    // Update each question in Firestore
    for (const question of questions) {
      const { id, ...questionData } = question;
      
      // Remove starter code if it exists
      if (questionData.starter) {
        delete questionData.starter;
      }

      // Update the question document
      await db.collection('questions').doc(id).set(questionData, { merge: true });
      console.log(`✅ Updated question ${id}`);
    }

    console.log('🎉 All questions updated successfully!');
  } catch (error) {
    console.error('❌ Error updating questions:', error);
  } finally {
    // Close the Firebase app
    await admin.app().delete();
  }
}

// Run the update
updateQuestions(); 