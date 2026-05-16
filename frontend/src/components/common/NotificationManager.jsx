import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '../../firebase';
import toast from 'react-hot-toast';
import axios from 'axios';

const NotificationManager = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const token = await requestForToken();
        if (token) {
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

    setupNotifications();

    // Listen for foreground messages
    const unsubscribe = onMessageListener().then((payload) => {
      toast.success(`${payload.notification.title}: ${payload.notification.body}`, {
        duration: 6000,
        position: 'top-right',
      });
      console.log('Foreground notification received:', payload);
    }).catch((err) => console.log('failed: ', err));

    return () => {
      // Clean up if necessary
    };
  }, []);

  return null; // This component doesn't render anything
};

export default NotificationManager;
