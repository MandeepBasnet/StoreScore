const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../utils/xiboClient');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required'
      });
    }
    
    console.log(`[Login] Attempting login for user: ${username}`);
    
    // Authenticate with Xibo API
    const authResult = await authenticateUser(username, password);
    
    console.log(`[Login] Xibo Auth Result for ${username}:`, JSON.stringify(authResult, null, 2));

    if (!authResult.success) {
      return res.status(401).json({
        message: authResult.message || 'Invalid credentials',
        details: authResult
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: authResult.user.userId || username,
        username: authResult.user.userName || username,
        email: authResult.user.email || username
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    
    res.json({
      token,
      user: {
        username: authResult.user.userName || username,
        email: authResult.user.email || username,
        userId: authResult.user.userId || null
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  login
};
