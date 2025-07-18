// src/firebase-init.ts

import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// --- PASTE THE CONFIG OBJECT FROM STEP 1 HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyAB6luds9Z-Luc_T4Of4qNQrRe9Oh7Pt8Q",
  authDomain: "marudhar-school-erp.firebaseapp.com",
  projectId: "marudhar-school-erp",
  storageBucket: "marudhar-school-erp.firebasestorage.app",
  messagingSenderId: "400371137837",
  appId: "1:400371137837:web:c8a7bbed749f2d1029a7a4"
};
--------------------------------------------

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