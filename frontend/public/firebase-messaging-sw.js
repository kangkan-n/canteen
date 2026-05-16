// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCXnX8C9dxzBggJX6dE5_mX9L58z8KOIuU",
  authDomain: "canteenprebookingsystem.firebaseapp.com",
  projectId: "canteenprebookingsystem",
  storageBucket: "canteenprebookingsystem.firebasestorage.app",
  messagingSenderId: "481435369688",
  appId: "1:481435369688:web:b86d12dc2a53d73abc97ad",
  measurementId: "G-T7L6GBYGPX"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
