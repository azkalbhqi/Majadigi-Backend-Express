import * as service from './activity.service.js';

export const logActivity = async (req, res) => {
  try {
    const { userId, feature, description } = req.body;

    if (!userId || !feature || !description) {
      return res.status(400).json({
        success: false,
        message: 'userId, feature, and description are required fields',
      });
    }

    const activity = await service.createActivityLog({ userId, feature, description });
    return res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: activity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId parameter is required',
      });
    }

    const activities = await service.getUserActivities(userId);
    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
