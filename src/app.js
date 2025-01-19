const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
//Endpoints Middlewares
app.use("/auth", require("./modules/auth/auth.router"));
app.use("/user", require("./modules/user/user.router"));

module.exports = app;
