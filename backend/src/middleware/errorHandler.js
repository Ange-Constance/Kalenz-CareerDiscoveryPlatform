function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.code === '23505') {
    return res.status(409).json({ success: false, error: 'An account with this email already exists' });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
