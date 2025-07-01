const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Mon API",
        version: "1.0.0",
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT}`
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: [require('path').resolve(__dirname, '../routes/*.js')],
  };

const specs = swaggerJsdoc(options);
module.exports = specs;
