const express = require("express");
const app = express();
const morgan = require("morgan");
const MongoStore = require("rate-limit-mongo");

// packages security
const hpp = require("hpp");
const RateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const GEC = require("./controllers/globalErrorController");
const testRoute = require("./routes/testRoute");
const securityMiddleware = require("./securityTools/helmetSecure");
const sanitizeAThingOrTwo = require("./securityTools/xssFilter");

if (process.env.NODE_ENV === "developer") {
  app.use(morgan("dev"));
}
app.use(express.urlencoded({ extended: true }));
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

// 4. express-mongo-sanitize - this thing will check for any '$' or '.' the req.params/body/query contains (it can remove/replace)
// note: so by default the '$' and '.' are completely removed, so we can use it just like this: app.use(mongoSanitize());
// but for me im gonna use the following one
app.use(
  mongoSanitize({
    replaceWith: "^", // replace '$' and '.' with
    allowDots: true, // no comments

    // 'onSanitize' - this will be called after the request value was sanitized
    onSanitize: ({ req, key }) => {
      // log(this request[key] is sanitize)
    },

    // 'dryRun' - this will run the dryrun mode (very basic)
    // dryRun: true,
    onSanitize: ({ req, key }) => {
      // log(this request[key] will be sanitize)
    }
  })
);
// note: we can also use the sanitize with options like so: 'mongoSanitize.sanitize(payload, {options})' by assuming we have this payload:
const payload = {
  username: "john_doe",
  email: "john@example.com",
  password: "password123",
  // This might be dangerous if not sanitized:
  injectedField: { $gt: "" }
};
// note: we can also check for those payloads like so:
// const isSuspicious = mongoSanitize.has(payload, true)
// the 'true' is optional and means:
// a. we want to exclude '.' from sanitizing => 'true'
// b. we don't want to exclude '.' from sanitizing => just don't include 'true'

// 5. xss - so here we go again, this module filter the user inputs (body, params, etc.), here is how to use it: check out /securityTools/xssFilter.js
app.use(sanitizeAThingOrTwo);

// routes ===================================================
app.use("/api/users", testRoute);

app.use(GEC);

module.exports = app;
