// src/lib/firebase.ts

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC89Z3czVHEfgAXAMAD3sGJNKz3OHYXOw4",
  authDomain: "parent-portal-ec72d.firebaseapp.com",
  projectId: "parent-portal-ec72d",
  storageBucket: "parent-portal-ec72d.firebasestorage.app",
  messagingSenderId: "830523731757",
  appId: "1:830523731757:web:8032d84ae0c40050476da4",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to request permission and get the FCM token
export const requestPermissionAndGetToken = async () => {
  console.log('Requesting notification permission...');
  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    console.log('Notification permission granted.');
    try {
      const currentToken = await getToken(messaging, {
        vapidKey: 'BBeF_czSvvuzRfYm7FFrTee4XqZ7iU1sF4Yavx0TJ5jx08SMOoqIhwYXoEtlPZd1vo7pbx5tkLx4zTVGIdd-HRI', // From Firebase Console -> Cloud Messaging settings
      });
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
      return null;
    }
  } else {
    console.log('Unable to get permission to notify.');
    return null;
  }
};

// Listen for messages when the app is in the foreground
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Create a beautiful, custom notification toast here
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo.png' // Optional: your school logo
  });
});