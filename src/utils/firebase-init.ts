import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your configuration from environment variables is correct and secure.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- THIS IS THE MISSING LINE ---
// Initialize the main Firebase application. This MUST come before 'messaging'.
export const app = initializeApp(firebaseConfig);

// Now that 'app' exists, we can safely use it to get the messaging service.
export const messaging = typeof window !== 'undefined' && typeof window.navigator !== 'undefined' 
  ? getMessaging(app) 
  : null;

// The rest of your functions are correct.
export const requestPermissionAndGetToken = async () => {
  if (!messaging) {
    console.log("Firebase messaging is not supported in this browser.");
    return null;
  }
  
  console.log('Requesting notification permission...');
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (currentToken) {
        console.log('FCM Token generated:', currentToken);
        return currentToken;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Permission not granted.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token.', err);
    return null;
  }
};

if (messaging) {
  onMessage(messaging, (payload) => {
    console.log('Foreground message received.', payload);
    // Add '!' to assert title exists, as it's required for a Notification.
    const notification = new Notification(payload.notification.title!, { 
      body: payload.notification.body,
      icon: '/logo.png',
    });
  });
}