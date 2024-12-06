const xss = require("xss");
const catchAsync = require("../utils/catchAsync");

const options = {
  // here are the main options
  whitelist: {
    a: ["href", "title"], // so allow the a tag with href and title attributes
    b: [], // allow 'b' tags without any attributes
    i: [], // allow 'i' tags without any attributes
    br: [] // allow 'br' tags without any attributes
  },
  stripIgnoreTag: true, // remove all tags that aren't in the whitelist
  stripIgnoreTagBody: ["script"], // Remove the content inside 'script' tags
  // I also like the 'css' prop
  css: {
    whitelist: {
      display: /^flex|grid|block$/
    }
  }
  // those are the most important and most-of-use
};
// here we just create an instance that takes the 'option' parameter
const filterThis = new xss.FilterXSS(options);

// now when we have this 'function' we can now process our inputs from the user, for this we can create our own function, I like to do this
const sanitizeAThingOrTwo = catchAsync(async (req, res, next) => {
  try {
    // only body for me here (u can also check anything u want)
    if (req.body) {
      for (let key in req.body) {
        if (typeof req.body[key] === "string") {
          req.body[key] = filterThis.process(req.body[key]);
          // e.g. <a href="#" style="display: block" script="myFunc()">Link</a> ==> <a href="#">Link</a>
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
  next();
});

module.exports = sanitizeAThingOrTwo;
