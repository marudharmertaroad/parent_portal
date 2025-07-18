// In public/firebase-messaging-sw.js

// These import statements are required.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// --- PASTE YOUR FIREBASE CONFIG OBJECT HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyAB6luds9Z-Luc_T4Of4qNQrRe9Oh7Pt8Q",
  authDomain: "marudhar-school-erp.firebaseapp.com",
  projectId: "marudhar-school-erp",
  storageBucket: "marudhar-school-erp.firebasestorage.app",
  messagingSenderId: "400371137837",
  appId: "1:400371137837:web:c8a7bbed749f2d1029a7a4"
};
// ---------------------------------------------------

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // Or any other icon in your public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});