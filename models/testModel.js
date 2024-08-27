const { Schema, model } = require("mongoose");
var validator = require("validator");

const phoneNumbersSchema = new Schema({
  type: {
    type: String,
    require: "Must have something here."
  },
  number: {
    type: String,
    require: "The phone number is required."
  }
});
const userSchema = new Schema(
  {
    name: {
      type: String,
      maxLength: 30,
      minLength: 5,
      require: [true, "Your user should include their name."]
    },
    email: {
      type: String,
      validate: {
        validator: function (val) {
          return validator.isEmail(val);
        },
        message: "The user must include their emails."
      }
    },
    age: {
      type: Number,
      validate: {
        validator: function (val) {
          return val > 17;
        },
        message: "The user is too young."
      }
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "PNS"],
      default: "PNS"
    },
    occupation: {
      title: {
        type: String,
        require: "Title must be included."
      },
      department: {
        type: String,
        require: "Tell me which department. That's all"
      },
      skills: {
        type: [String],
        require: "There must be any skills."
      }
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String
    },
    phoneNumbers: [phoneNumbersSchema],
    isActive: Boolean,
    registrationDate: {
      type: Date,
      default: Date.now()
    },
    lastLogin: {
      type: Date,
      default: Date.now()
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
    collection: "user_collection"
  }
);

const User = model("UserModel", userSchema);

// module.exports = User;

// test inserting
(async () => {
  await User.insertOne({
    item: "canvas",
    qty: 100,
    tags: ["cotton"],
    size: { h: 28, w: 35.5, uom: "cm" }
  });
})();
