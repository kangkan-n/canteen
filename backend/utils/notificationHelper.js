const { admin } = require('../config/firebase');
const User = require('../models/User');

/**
 * Send notification to a specific user
 * @param {string} userId - ID of the user to notify
 * @param {object} notification - Notification object { title, body, data }
 */
const sendNotificationToUser = async (userId, notification) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      console.log(`No FCM token found for user ${userId}`);
      return;
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      token: user.fcmToken
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Send notification to all users with a specific role
 * @param {string} role - User role ('student' or 'canteenOwner')
 * @param {object} notification - Notification object { title, body, data }
 */
const sendNotificationToRole = async (role, notification) => {
  try {
    const users = await User.find({ role, fcmToken: { $ne: '' } });
    const tokens = users.map(user => user.fcmToken);

    if (tokens.length === 0) {
      console.log(`No FCM tokens found for role ${role}`);
      return;
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      tokens: tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`${response.successCount} messages were sent successfully to role ${role}`);
    return response;
  } catch (error) {
    console.error('Error sending multicast notification:', error);
  }
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToRole
};
