import prisma from '../../config/prisma.js';

/**
 * Creates a new user notification in the database.
 */
export const createNotification = async ({ userId, title, message }) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    throw new Error('Failed to create notification');
  }
};

/**
 * Fetches user notifications sorted by creation date (newest first).
 */
export const getUserNotifications = async (userId) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications;
  } catch (error) {
    console.error('Error fetching user notifications:', error.message);
    throw new Error('Failed to fetch user notifications');
  }
};
