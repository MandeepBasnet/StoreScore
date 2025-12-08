const storeScoreAPI = require('../services/storeScoreAPI');

/**
 * Middleware to ensure StoreScore API authentication
 */
const ensureAuthenticated = async (req, res, next) => {
  try {
    await storeScoreAPI.ensureValidToken();
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(401).json({
      error: {
        message: 'Failed to authenticate with StoreScore API',
        details: error.message
      }
    });
  }
};

module.exports = {
  ensureAuthenticated
};
