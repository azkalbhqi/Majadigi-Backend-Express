import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API',
      version: '1.0.0',
    },
  },
  // Absolute paths relative to this configuration file
  apis: [
    path.join(__dirname, '../docs/*.yaml'),
    path.join(__dirname, '../features/**/*.js'),
    path.join(__dirname, '../app.js'),
  ],
};

const specs = swaggerJsdoc(options);

// Use the standard ESM export syntax
const setupSwagger = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
};

export default setupSwagger;