import { useEffect } from 'react';
import { requestForToken, messaging } from '../../firebase';
import { onMessage } from 'firebase/messaging';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const NotificationManager = () => {
  const { user } = useAuth();

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        let swReg = null;
        if ('serviceWorker' in navigator) {
          try {
            swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered:', swReg);
          } catch (swErr) {
            console.error('Service Worker registration failed:', swErr);
          }
        }

        const token = await requestForToken(swReg);
        if (token && user) {
          // Send token to backend
          const userToken = localStorage.getItem('token');
          if (userToken) {
            await axios.patch(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/fcm-token`,
              { fcmToken: token },
              {
                headers: {
                  Authorization: `Bearer ${userToken}`
                }
              }
            );
            console.log('FCM Token updated on server');
          }
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    if (user) {
      setupNotifications();
    }

    // Listen for foreground messages
    let unsubscribe = () => {};
    if (messaging) {
      unsubscribe = onMessage(messaging, (payload) => {
        toast.success(`${payload.notification?.title || 'Notification'}: ${payload.notification?.body || ''}`, {
          duration: 6000,
          position: 'top-right',
        });
        console.log('Foreground notification received:', payload);
      });
    }

    return () => {
      unsubscribe();
    };
  }, [user]);

  return null;
};

export default NotificationManager;
