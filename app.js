const express = require("express");
const app = express();
const morgan = require("morgan");
const MongoStore = require("rate-limit-mongo");

// packages security
const hpp = require("hpp");
const RateLimit = require("express-rate-limit");

const GEC = require("./controllers/globalErrorController");
const testRoute = require("./routes/testRoute");
const securityMiddleware = require("./securityTools/helmetSecure");

if (process.env.NODE_ENV === "developer") {
  app.use(morgan("dev"));
}
app.use(express.json());

// 1. hpp - http parameter pollution
// Why - attackers can intentionally change request parameters to do/create/manage mechanism that we've build.
// How it's helping - HPP puts the array parameters in req.query / body and just select the last parameter value
app.use(hpp());

// 2. Check /securityTools/helmetSecure.js
app.use(securityMiddleware);

// 3. rateLimit - this function accepts an options object and returns the rate limiting middleware (notice: there is not required configurations, all options have reasonable defaults)
const limiter = RateLimit({
  limit: 100, // the maximum allowed request that can user make from a single IP address ('max' serves the same purpose as 'limit')
  windowMs: 60 * 60 * 1000, // the rate limit (which is set to 1hour), meaning that user can make up to 100 request within this period
  standardHeaders: true, // this ensures that the rate information (like remaining request) is included in the 'RateLimit-*' headers in the HTTP response (this info is useful for the clients that makes request and other things when working with let's say API)
  legacyHeaders: false, // this disables the older X-RateLimit-* headers, which helps to avoid redundancy and keeps the response header cleaner
  message: "You've reached the rate limit. Try again after 1h.", // as u may already understand, this is a custom message, which basically tell the client that they've reached the rate limit

  // there is also other USEFUL options, like:
  // when u want to rate limit based on something other than the default IP adress (e.g. user ID, ...)
  keyGenerator: (req) => req.ip, // default

  // use this when U want to send more detailed messages or logging rate limit hits
  handler: (req, res) => {
    res
      .status(429)
      .json({ message: "Your gentleman message for the clients." });
  },

  // if u want to exclude certain routes, users, or IPs from rate limiting (e.g., internal services or admin users) use this
  skip: (req) => req.user && req.user.role === "admin",
  // example with IP (assume we have allowlist = ['192.168.0.56', '192.168.0.21'])
  skip: (req, res) => allowlist.includes(req.ip)

  // useful for distributed environments where you want to share limits across multiple servers
  // store: new RedisStore({
  //   client: redisClient
  // }),

  // this can be used for monitoring or to trigger/alert/logging or other actions
  // onLimitReached: (req, res, options) => {
  //   console.log(`Rate limit reached for IP: ${req.ip}`);
  // } // ! option is deprecated and has been removed in express-rate-limit v7, but don't worry nobody use it anyway
});
// but personally I'm gonna use this
const limiterMongo = RateLimit({
  store: new MongoStore({
    uri: process.env.MONGO_DRIVER.replace(
      "<password>",
      process.env.MONGO_PASSWORD
    ),
    // should match windowMs
    expireTimeMs: 30 * 60 * 1000,
    errorHandler: console.error.bind(null, "rate-limit-mongo")
    // see Configuration section for more options and details
  }),
  max: 100,
  windowMs: 30 * 60 * 1000 // 30 min
});
// then let's say that I have this route (host/websiteName/users/plans) and I want to use limit rate, I'll do it like this:
app.use("/api", limiterMongo);
// or just
app.use(limiterMongo);

// routes
app.use("/api/users", testRoute);

app.use(GEC);

module.exports = app;
