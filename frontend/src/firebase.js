import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Project's Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCXnX8C9dxzBggJX6dE5_mX9L58z8KOIuU",
  authDomain: "canteenprebookingsystem.firebaseapp.com",
  projectId: "canteenprebookingsystem",
  storageBucket: "canteenprebookingsystem.firebasestorage.app",
  messagingSenderId: "481435369688",
  appId: "1:481435369688:web:b86d12dc2a53d73abc97ad",
  measurementId: "G-T7L6GBYGPX"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: 'BDeolOV8jo_mpaBV1qK8XbaM8DNeitgomNynsWzqHDcPKpTVH1AG7m3ZdTaw20MP7oq2Bo0nhzSJxj5BL09gy5U' 
      });
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Payload", payload);
      resolve(payload);
    });
  });

export { messaging };
