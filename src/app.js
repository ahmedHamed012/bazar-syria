const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerOptions");
const swaggerJSON = require("./utils/swagger.json");
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Swagger documentation route
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJSON));

//Endpoints Middlewares
app.use("/auth", require("./modules/auth/auth.router"));
app.use("/user", require("./modules/user/user.router"));
app.use("/category", require("./modules/category/category.router"));
app.use("/subCategory", require("./modules/subcategory/sub-category.router"));
app.use("/products", require("./modules/product/product.router"));

module.exports = app;
