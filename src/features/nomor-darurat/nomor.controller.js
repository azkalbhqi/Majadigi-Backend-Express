import * as NomorService from './nomor.service.js';

/**
 * Controller to handle all emergency and location data logic
 */
export const getCities = async (req, res, next) => {
    try {
        const cities = await NomorService.fetchCities();
        
        // Mobile-friendly response
        res.status(200).json({
            success: true,
            message: "Cities retrieved successfully",
            data: cities
        });
    } catch (error) {
        next(error); // Passes error to the global error handler
    }
};

export const getEmergencyNumbers = async (req, res, next) => {
    try {
        const { cityId } = req.query;

        if (!cityId) {
            const defaultNumbers = await NomorService.fetchDefaultEmergencyNumbers();
            return res.status(200).json({
                success: true,
                message: "Default emergency numbers retrieved successfully",
                data: defaultNumbers
            });
        }

        const numbers = await NomorService.fetchEmergencyNumbers(cityId);

        res.status(200).json({
            success: true,
            count: numbers.length,
            data: numbers
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getCities,
    getEmergencyNumbers
};