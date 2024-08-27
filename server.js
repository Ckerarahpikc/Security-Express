require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app");
const User = require("./models/testModel");

process.on("uncaughtException", (err) => {
  console.error("ERROR:", err.message);
  console.log("UNCAUGHT EXCEPTION.");
  process.exit(1); // 1 - failure code / 0 - success code
});

const db = process.env.MONGO_DRIVER.replace(
  "<password>",
  process.env.MONGO_PASSWORD
);

mongoose.connect(db).then(() => {
  console.log("Connected to DB.");
});

const server = app.listen(8000, () => {
  console.log("Connected to LH :8000.");
});

// * insert
(async () => {
  await User.insertOne({
    item: "canvas",
    qty: 100,
    tags: ["cotton"],
    size: { h: 28, w: 35.5, uom: "cm" }
  });
})();

process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  console.log("UNHANDLED: Shutting down...");

  server.close(() => {
    process.exit(1);
  });
});
