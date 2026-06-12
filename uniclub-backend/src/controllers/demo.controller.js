const getDemo = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Hello from Uniclub backend demo API",
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getDemo,
};
