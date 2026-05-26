import service from './rumahsakit.service.js';

/**
 * Controller to handle Tuberculosis screening questions retrieval
 */
export const getQuestions = async (req, res, next) => {
  try {
    const questions = await service.getQuestions();
    
    return res.status(200).json({
      success: true,
      message: "TBC screening questions retrieved successfully",
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle TBC screening submission
 */
export const submitScreening = async (req, res, next) => {
  try {
    const { userId, answers } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: "answers object is required"
      });
    }

    const screeningResult = await service.submitScreening(userId, answers);

    return res.status(201).json({
      success: true,
      message: "TBC screening completed successfully",
      data: screeningResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle retrieving TBC screening history
 */
export const getHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId parameter is required"
      });
    }

    const history = await service.getScreeningHistory(userId);
 
     return res.status(200).json({
       success: true,
       message: "TBC screening history retrieved successfully",
       data: history
     });
   } catch (error) {
     next(error);
   }
 };
 
 /**
  * Controller to handle retrieving the catalog of all hospitals
  */
 export const getAllRumahSakit = async (req, res, next) => {
   try {
     const rumahSakitList = await service.getAllRumahSakit();
     return res.status(200).json({
       success: true,
       message: "Katalog Rumah Sakit retrieved successfully",
       data: rumahSakitList
     });
   } catch (error) {
     next(error);
   }
 };
 
 /**
  * Controller to handle retrieving hospital layanan details from external Majadigi API.
  */
 export const getLayananByHospitalPath = async (req, res, next) => {
   try {
     const { hospitalPath } = req.params;
     const layananData = await service.getLayananByHospitalPath(hospitalPath);
 
     if (!layananData) {
       return next(); // Fall through to individual routes/handlers
     }
 
     return res.status(200).json(layananData);
   } catch (error) {
     next(error);
   }
 };
 
 export default {
   getQuestions,
   submitScreening,
   getHistory,
   getAllRumahSakit,
   getLayananByHospitalPath
 };
