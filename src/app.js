import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

// Import Middlewares & Routes
import { errorHandler } from './middleware/error.handler.js';

import setupSwagger from './config/swagger.js';

import authRoutes from './features/auth/auth.routes.js';
import transjatimRouter from './features/transjatim/transjatim.router.js';
import opendataRouter from './features/opendata/opendata.router.js';
import nomorRouter from './features/nomor-darurat/nomor.router.js';
import rumahsakitRouter from './features/rumah-sakit/rumahsakit.router.js';
import sapabansosRouter from './features/sapa-bansos/sapabansos.router.js';
import activityRouter from './features/activity/activity.router.js';
import layananRouter from './features/layanan/layanan.router.js';
import homeRouter from './features/home/home.router.js';
import notificationRouter from './features/notification/notification.router.js';

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

app.use('/auth', authRoutes);
app.use('/transjatim', transjatimRouter);
app.use('/opendata', opendataRouter);
app.use('/nomor-darurat', nomorRouter);
app.use('/sapa-bansos', sapabansosRouter);
app.use('/activity', activityRouter);
app.use('/layanan', layananRouter);
app.use('/home', homeRouter);
app.use('/notification', notificationRouter);

//Rumah sakit
app.use('/rumah-sakit', rumahsakitRouter);

// --- Error Handling ---
app.use(errorHandler);

// --swagger docs setup

setupSwagger(app);

export default app;