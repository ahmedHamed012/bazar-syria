const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0", // Use OpenAPI version 3.0.0
  info: {
    title: "Bazar Syria Backend", // Title of your API
    version: "1.0.0", // Version of your API
    description: "API documentation for Bazar Syria Backend", // Description of your API
  },
  servers: [
    {
      // url: "http://localhost:5000/", // Base URL for your API
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/modules/**/*.router.js"], // Path to the API docs (adjust the path as needed)
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
