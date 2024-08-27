const SetAppError = require("../utils/SetAppError");

const devError = (err, res) => {
  res.status(err.status).json({
    message: err.message,
    statusCode: err.statusCode,
    status: err.status,
    stack: err.stack
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = {
    message: err.message,
    statusCode: err.statusCode,
    status: err.status,
    path: err.path,
    value: err.value,
    stack: err.stack
  };

  devError(error, res);
};
