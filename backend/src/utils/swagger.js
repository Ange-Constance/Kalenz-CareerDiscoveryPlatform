const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KarrerLenz API',
      version: '1.0.0',
      description: 'Career discovery platform API for Rwandan tech graduates',
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Development' },
      { url: 'https://api.karrerlenz.io/api', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
