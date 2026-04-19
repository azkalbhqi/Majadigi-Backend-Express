import * as TransJatimService from './transjatim.service.js';

// Handler untuk Summary (Agregasi)
export const getSummary = async (req, res, next) => {
  try {
    const data = await TransJatimService.getAggregatedTransJatim();
    res.status(200).json({
      status: 'success',
      message: 'Data Trans Jatim berhasil di-agregat',
      data
    });
  } catch (error) {
    next(error);
  }
};


// Handler untuk Tarif saja
export const getTarif = async (req, res, next) => {
  try {
    const data = await TransJatimService.fetchTarif();
    res.status(200).json({
      status: 'success',
      message: 'Data Tarif Trans Jatim berhasil diambil',
      data
    });
  } catch (error) {
    next(error);
  }
};

// Handler untuk Rute saja
export const getRute = async (req, res, next) => {
  try {
    const data = await TransJatimService.fetchRute();
    res.status(200).json({
      status: 'success',
      message: 'Data Rute Trans Jatim berhasil diambil',
      data
    });
  } catch (error) {
    next(error);
  }
};


//ajaib

// src/features/transjatim/transjatim.controller.js

export const getBusStopsByKoridor = async (req, res, next) => {
    try {
      const { koridor } = req.query; // Client memanggil ?koridor=JTM2
      
      if (!koridor) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Parameter "koridor" (nama koridor) diperlukan' 
        });
      }
  
      // Teruskan ke service
      const data = await TransJatimService.fetchBusStops(koridor);
      
      res.json({ 
        status: 'success', 
        message: `Data Bus Stop koridor ${koridor} berhasil diambil`,
        data 
      });
    } catch (error) {
      next(error);
    }
  };