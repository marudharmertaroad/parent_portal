// public/firebase-messaging-sw.js

// These import scripts are required for the service worker to function.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// --- PASTE THE SAME CONFIG OBJECT FROM STEP 1 HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyAB6luds9Z-Luc_T4Of4qNQrRe9Oh7Pt8Q",
  authDomain: "marudhar-school-erp.firebaseapp.com",
  projectId: "marudhar-school-erp",
  storageBucket: "marudhar-school-erp.firebasestorage.app",
  messagingSenderId: "400371137837",
  appId: "1:400371137837:web:c8a7bbed749f2d1029a7a4"
};

// ----------------------------------------------------

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// This part handles notifications that arrive when the app is in the background.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // You can change this to your school's logo if it's in the public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});