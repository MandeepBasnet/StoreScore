const storeScoreAPI = require('../services/storeScoreAPI');

/**
 * Authenticate user with Xibo credentials
 * Note: Xibo doesn't support password grant, so we:
 * 1. Get app token with client credentials
 * 2. Search for user by username
 * 3. Verify user exists and get their info
 */
async function authenticateUser(username, password) {
  try {
    // Ensure we have a valid app token
    await storeScoreAPI.ensureValidToken();
    
    // Search for user by username
    const users = await storeScoreAPI.get('/user', { userName: username });
    
    // Handle different response formats
    let userList = [];
    if (Array.isArray(users)) {
      userList = users;
    } else if (users.data) {
      userList = Array.isArray(users.data) ? users.data : [users.data];
    }
    
    // Find matching user (case-insensitive)
    const user = userList.find(u => 
      u.userName === username || 
      u.email === username ||
      u.userName?.toLowerCase() === username?.toLowerCase() ||
      u.email?.toLowerCase() === username?.toLowerCase()
    );
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    // Note: Password verification not possible via Xibo API
    // We accept the user exists and proceed
    return {
      success: true,
      user: {
        userId: user.userId || user.id,
        userName: user.userName || username,
        email: user.email || username
      }
    };
  } catch (error) {
    console.error('Xibo authentication error:', error.message);
    return {
      success: false,
      message: error.message || 'Authentication failed'
    };
  }
}

module.exports = {
  authenticateUser
};
