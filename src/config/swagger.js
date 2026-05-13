import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API',
      version: '1.0.0',
    },
  },
  // Adjust this path if your files are in different locations
  apis: ['./src/docs/*.yaml', './src/features/**/*.js', './src/app.js'], 
};

const specs = swaggerJsdoc(options);

// Use the standard ESM export syntax
const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

export default setupSwagger;