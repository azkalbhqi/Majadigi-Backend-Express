import * as service from './sapabansos.service.js';

export const checkBansos = async (req, res, next) => {
  try {
    const { userID } = req.params;

    if (!userID) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter "userID" (NIK) diperlukan'
      });
    }

    const result = await service.checkBansosEligibility(userID);

    if (!result.eligible) {
      return res.status(404).json({
        status: 'error',
        message: result.message
      });
    }

    res.status(200).json({
      status: 'success',
      message: result.data.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
