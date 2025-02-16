const express = require("express");
const path = require("path");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJSON = require("../public/swagger.json");
const app = express();
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.static(path.resolve(__dirname.slice(0, -4), "public")));

// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });
// Swagger documentation route
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerJSON, {
    customCss:
      ".swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }",
    customCssUrl: CSS_URL,
  })
);
//Endpoints Middlewares
app.use("/auth", require("./modules/auth/auth.router"));
app.use("/user", require("./modules/user/user.router"));
app.use("/category", require("./modules/category/category.router"));
app.use("/subCategory", require("./modules/subcategory/sub-category.router"));
app.use("/advertisement", require("./modules/advertisement/adv.router"));
app.use(
  "/verification",
  require("./modules/verification-requests/verification.router")
);
app.use("/chat", require("./modules/chat/chat.router"));

module.exports = app;
