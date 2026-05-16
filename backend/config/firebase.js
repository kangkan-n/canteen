const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const initializeFirebase = () => {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, 'serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin Initialized');
    } else {
      console.warn('⚠️ Firebase serviceAccountKey.json not found. Notifications will not work.');
    }
  } catch (error) {
    console.error('❌ Firebase Initialization Error:', error.message);
  }
};

module.exports = { admin, initializeFirebase };
