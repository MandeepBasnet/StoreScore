module.exports = {
  storeScore: {
    baseURL: process.env.API_BASE_URL || 'https://app.storescore.io/api',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    timeout: 30000, // 30 seconds
    tokenEndpoint: '/authorize/access_token', // Xibo CMS specific endpoint
    apiVersion: 'v1'
  },
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  }
};
