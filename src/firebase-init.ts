// src/firebase-init.ts

import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// --- PASTE THE CONFIG OBJECT FROM STEP 1 HERE ---
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
}; // <--- THE FIX: Ensure this closing brace and semicolon are present.
// -----------------------------------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * This function requests permission for notifications and returns the FCM token.
 * We will call this function in a later step.
 */
export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      // --- PASTE THE VAPID KEY FROM STEP 1 HERE ---
      vapidKey: "BEf3YN65kLxO81YCYvgdCE6HPXwcb0u8VKOxq3qFmFDrMXwtrKeXwIUaPIbQwNdEbme12la7gaZLCW10cWZ98To",
    });

    if (currentToken) {
      console.log('FCM Registration Token:', currentToken);
      return currentToken;
    } else {
      // This happens if the user denies permission.
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) => {
    console.error('An error occurred while retrieving token:', err);
    return null;
  }
};