// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC89Z3czVHEfgAXAMAD3sGJNKz3OHYXOw4",
  authDomain: "parent-portal-ec72d.firebaseapp.com",
  projectId: "parent-portal-ec72d",
  storageBucket: "parent-portal-ec72d.firebasestorage.app",
  messagingSenderId: "830523731757",
  appId: "1:830523731757:web:8032d84ae0c40050476da4",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});