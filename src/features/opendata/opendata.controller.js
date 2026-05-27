import * as OpenDataService from './opendata.service.js';

export const listDatasets = async (req, res, next) => {
  try {
    const { search } = req.query;
    const data = await OpenDataService.getDatasets(search);

    res.status(200).json({
      status: 'success',
      message: data.length > 0 ? 'Datasets found' : 'No datasets found',
      pagination: {
        total: data.length
      },
      data
    });
  } catch (error) {
    next(error);
  }
};