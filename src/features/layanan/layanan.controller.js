import service from './layanan.service.js';

/**
 * Controller to handle GET /layanan/integrated
 * Returns all layanan records.
 */
export const getIntegratedLayanan = async (req, res, next) => {
  try {
    const layananList = await service.getAllLayanan();

    return res.status(200).json({
      success: true,
      message: 'Daftar layanan terintegrasi berhasil diambil',
      data: layananList,
    });
  } catch (error) {
    next(error);
  }
};

export default { getIntegratedLayanan };
