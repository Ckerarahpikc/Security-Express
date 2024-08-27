const express = require("express");
const morgan = require("morgan");
const GEC = require("./controllers/globalErrorController");
const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use(GEC);

module.exports = app;
