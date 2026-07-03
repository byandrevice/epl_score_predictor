// Central error handler. Keeps responses as JSON so clients show on-screen messages.
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
};

module.exports = errorHandler;
