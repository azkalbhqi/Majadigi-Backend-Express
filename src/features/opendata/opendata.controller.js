import * as OpenDataService from './opendata.service.js';
import fs from 'fs';
import path from 'path';

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
      debug: {
        cwd: process.cwd(),
        dirContents: fs.existsSync(process.cwd()) ? fs.readdirSync(process.cwd()) : [],
        fallbackExists: fs.existsSync(path.join(process.cwd(), 'data-fallback')),
        fallbackDirContents: fs.existsSync(path.join(process.cwd(), 'data-fallback')) ? fs.readdirSync(path.join(process.cwd(), 'data-fallback')) : []
      },
      data
    });
  } catch (error) {
    next(error);
  }
};