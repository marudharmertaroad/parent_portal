import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// TODO: Replace the following with your app's Firebase project configuration
// For more information on how to get this, visit:
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyC89Z3czVHEfgAXAMAD3sGJNKz3OHYXOw4",
  authDomain: "parent-portal-ec72d.firebaseapp.com",
  projectId: "parent-portal-ec72d",
  storageBucket: "parent-portal-ec72d.firebasestorage.app",
  messagingSenderId: "830523731757",
  appId: "1:830523731757:web:8032d84ae0c40050476da4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

export default app;