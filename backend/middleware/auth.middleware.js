const jwt = require('jsonwebtoken');
const storeScoreAPI = require('../services/storeScoreAPI');

/**
 * Middleware to verify JWT token from frontend
 */
const verifyToken = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({
      error: 'No token',
      message: 'Authorization header is missing or token not provided.'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err.message);
      
      let errorMessage = 'Invalid token';
      if (err.name === 'TokenExpiredError') {
        errorMessage = 'Token has expired. Please login again.';
      } else if (err.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token format. Please login again.';
      }
      
      return res.status(403).json({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    req.user = decoded;
    next();
  });
};

/**
 * Middleware to ensure StoreScore API authentication (existing)
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
  verifyToken,
  ensureAuthenticated
};
