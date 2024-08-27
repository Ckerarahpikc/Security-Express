const express = require("express");
const app = express();
const morgan = require("morgan");

// packages security
var hpp = require("hpp");

const GEC = require("./controllers/globalErrorController");
const testRoute = require("./routes/testRoute");
const securityMiddleware = require("./securityTools/helmetSecure");

app.use(morgan("dev"));
app.use(express.json());

// 1. hpp - http parameter pollution
// Why - attackers can intentionally change request parameters to do/create/manage mechanism that we've build.
// How it's helping - HPP puts the array parameters in req.query / body and just select the last parameter value
app.use(hpp());

// 2. Check /securityTools/helmetSecure.js
app.use(securityMiddleware);

// routes
app.use("/api/users", testRoute);

app.use(GEC);

module.exports = app;
