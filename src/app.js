import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';


// Import Middlewares & Routes
import { errorHandler } from './middleware/error.handler.js';

// import authRoutes from './features/auth/auth.routes.js'; // Nanti diuncomment kalau file sudah ada
import transjatimRouter from './features/transjatim/transjatim.router.js';
import opendataRouter from './features/opendata/opendata.router.js';

dotenv.config();

const app = express();

// --- Global Middlewares ---
app.use(helmet());                // Security headers
app.use(cors());                  // Allow cross-origin requests
app.use(morgan('dev'));           // Logger
app.use(express.json());          // Parse JSON body
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Majadigi Backend API is running. Please refer to the documentation for available endpoints.' 
    });
  });
// --- Health Check ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Majadigi API is running' });
});

app.use('/transjatim', transjatimRouter);
app.use('/opendata', opendataRouter);

// --- Error Handling ---
app.use(errorHandler);

export default app;