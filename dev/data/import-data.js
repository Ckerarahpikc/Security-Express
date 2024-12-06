require("dotenv").config({ path: "./../../config.env" });
const fs = require("fs");
const mongoose = require("mongoose");

const User = require("../../models/testModel");

console.log(process.env);
console.log(process.env.USERNAME);
const db = process.env.MONGO_DRIVER.replace(
  "<password>",
  process.env.MONGO_PASSWORD
);

mongoose.connect(db).then(() => {
  console.log("Connected to DB.");
});

const userFile = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, "utf-8")
);

console.log(process.argv);
const importData = async () => {
  try {
    await User.create(userFile);
    console.log("Successfully imported.");
  } catch (err) {
    console.log("Error on importing data:", err);
  }
  process.exit();
};

const eraseData = async () => {
  try {
    await User.deleteMany();
    console.log("Successfully deleted.");
  } catch (err) {
    console.log("Error on delete data:", err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  eraseData();
}
