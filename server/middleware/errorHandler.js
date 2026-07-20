// Central error handler. Keeps responses as JSON so clients show on-screen messages.
const errorHandler = (err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;

  // Only forward messages we intentionally threw (e.g. validation errors with
  // a status set). Anything else (driver errors, network errors, etc.) is an
  // internal detail — log it, but don't expose it to the client.
  const isKnownClientError = status < 500;
  const message = isKnownClientError
    ? err.message
    : "Something went wrong. Please try again in a moment.";

  res.status(status).json({ message });
};

module.exports = errorHandler;
