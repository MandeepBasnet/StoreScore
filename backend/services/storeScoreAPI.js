const axios = require('axios');
const config = require('../config/api.config');

class StoreScoreAPI {
  constructor() {
    this.baseURL = config.storeScore.baseURL;
    this.clientId = config.storeScore.clientId;
    this.clientSecret = config.storeScore.clientSecret;
    this.accessToken = null;
    this.tokenExpiry = null;

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.storeScore.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        await this.ensureValidToken();
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          this.accessToken = null;
          this.tokenExpiry = null;
          await this.ensureValidToken();
          // Retry the original request
          return this.client.request(error.config);
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Ensure we have a valid access token
   */
  async ensureValidToken() {
    const now = Date.now();
    
    // Check if token exists and is still valid (with 5 min buffer)
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > now + 300000) {
      return;
    }

    // Get new token
    await this.authenticate();
  }

  /**
   * Authenticate with Xibo CMS API using OAuth2 client credentials
   * Xibo uses form-data format for token requests
   */
  async authenticate() {
    try {
      console.log('🔐 Authenticating with Xibo CMS API...');
      
      // Xibo CMS expects form-data, not JSON
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);

      const response = await axios.post(
        `${this.baseURL}${config.storeScore.tokenEndpoint}`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry (default to 1 hour if not provided)
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiry = Date.now() + (expiresIn * 1000);

      console.log('✅ Xibo CMS authentication successful');
      console.log(`🔑 Token expires in ${expiresIn} seconds`);
      return this.accessToken;
    } catch (error) {
      console.error('❌ Xibo CMS authentication failed:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(`Xibo CMS API authentication failed: ${error.message}`);
    }
  }

  /**
   * Format error for consistent error handling
   */
  formatError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || error.message,
        data: error.response.data
      };
    }
    return {
      status: 500,
      message: error.message || 'Unknown error occurred'
    };
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}) {
    try {
      const response = await this.client.patch(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new StoreScoreAPI();
