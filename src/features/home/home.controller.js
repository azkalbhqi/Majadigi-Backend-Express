import * as service from './home.service.js';

export const getBeranda = async (req, res, next) => {
  try {
    const data = await service.getBerandaData();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getKategoriLayanan = async (req, res, next) => {
  try {
    const data = await service.getKategoriLayananDaerah();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getJatimAngka = async (req, res, next) => {
  try {
    const data = await service.getJatimAngka();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
