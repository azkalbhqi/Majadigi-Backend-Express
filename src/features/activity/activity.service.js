import prisma from '../../config/prisma.js';

/**
 * Creates a new user activity log in the database.
 */
export const createActivityLog = async ({ userId, feature, description }) => {
  try {
    const activity = await prisma.activity.create({
      data: {
        userId,
        feature,
        description,
      },
    });
    return activity;
  } catch (error) {
    console.error('Error creating activity log:', error.message);
    throw new Error('Failed to create activity log');
  }
};

/**
 * Fetches user activities sorted by creation date (newest first).
 */
export const getUserActivities = async (userId) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return activities;
  } catch (error) {
    console.error('Error fetching user activities:', error.message);
    throw new Error('Failed to fetch user activities');
  }
};
