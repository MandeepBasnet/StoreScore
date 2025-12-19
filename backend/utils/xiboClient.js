const axios = require("axios");
const FormData = require("form-data");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");

// Resolve configuration with fallbacks
const apiUrl = process.env.XIBO_API_URL || process.env.API_BASE_URL;
const clientId = process.env.XIBO_CLIENT_ID || process.env.CLIENT_ID;
const clientSecret = process.env.XIBO_CLIENT_SECRET || process.env.CLIENT_SECRET;

let token = null;

// Get application access token (for API operations)
const getAccessToken = async () => {
  if (token) return token;

  // Check if configuration is present
  console.log("XIBO Config Check:");
  console.log("Resolved URL:", apiUrl || "MISSING");
  console.log("Resolved ID:", clientId || "MISSING");

  if (!apiUrl) {
    throw new Error(
      "XIBO_API_URL (or API_BASE_URL) is not configured. Please check your .env file."
    );
  }
  if (!clientId || !clientSecret) {
    throw new Error(
      "XIBO_CLIENT_ID/SECRET (or CLIENT_ID/SECRET) are not configured."
    );
  }

  // Xibo API uses form data for authentication
  const formData = new FormData();
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);
  formData.append("grant_type", "client_credentials");

  console.log(`[xiboClient] Authenticating with:`);
  console.log(`  - URL: ${apiUrl}/authorize/access_token`);
  console.log(`  - Client ID: ${clientId}`);

  try {
    const res = await axios.post(
      `${apiUrl}/authorize/access_token`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 10000, // 10 second timeout
      }
    );
    console.log(`[xiboClient] ✓ Authentication successful`);
    token = res.data.access_token;
    
    // Clear token 90% through expiry time for safety
    const expiryMs = (res.data.expires_in || 3600) * 1000 * 0.9;
    setTimeout(() => {
      console.log('[xiboClient] Token expired, will refresh on next request');
      token = null;
    }, expiryMs);
    
    return token;
  } catch (error) {
    // Handle network/DNS errors
    if (
        error.code === "ENOTFOUND" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ETIMEDOUT"
    ) {
      throw new Error(
        `Cannot connect to Xibo API server (${apiUrl}). Please check:\n` +
          `1. The XIBO_API_URL is correct: ${apiUrl}\n` +
          `2. The server is accessible from this network\n` +
          `3. Your internet connection is working\n` +
          `Error: ${error.message}`
      );
    }

    // Handle authentication errors
    if (error.response) {
      console.error(`[xiboClient] ✗ Authentication failed:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
      throw new Error(
        `Xibo API authentication failed: ${error.response.status} ${error.response.statusText}. ` +
          `Please check your XIBO_CLIENT_ID and XIBO_CLIENT_SECRET.`
      );
    }

    // Re-throw other errors
    throw error;
  }
};

const xiboRequest = async (
  endpoint,
  method = "GET",
  data = null,
  customHeaders = {}
) => {
  // Use user's token if provided, otherwise use application token
  const accessToken = await getAccessToken();

  // Xibo API requires form data for PUT requests
  const isPutRequest = method.toUpperCase() === "PUT";

  let requestConfig = {
    method,
    url: `${apiUrl}${endpoint}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...customHeaders,
    },
  };

  if (data) {
    // Check if Content-Type is explicitly set to JSON for PUT requests
    const isJsonPut = isPutRequest && requestConfig.headers["Content-Type"] === "application/json";

    if (isPutRequest && !isJsonPut) {
      // Xibo requires application/x-www-form-urlencoded for PUT requests (default behavior)
      // We need to use URLSearchParams to properly format the data
      const params = new URLSearchParams();
      Object.keys(data).forEach((key) => {
        params.append(key, String(data[key]));
      });

      requestConfig.data = params;
      requestConfig.headers["Content-Type"] =
        "application/x-www-form-urlencoded";
    } else {
      // Use JSON for other methods OR if explicitly requested for PUT
      requestConfig.data = data;
      if (!requestConfig.headers["Content-Type"]) {
        requestConfig.headers["Content-Type"] = "application/json";
      }
    }
  } else if (isPutRequest && !requestConfig.headers["Content-Type"]) {
    // Even if no data, PUT requests need form data content type by default
    requestConfig.headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  try {
    const res = await axios(requestConfig);
    return res.data;
  } catch (err) {
    // Retry on 401 Unauthorized
    if (err.response && err.response.status === 401) {
      console.warn(
        `[xiboRequest] 401 Unauthorized for ${endpoint}. Retrying with fresh App Token...`
      );

      try {
        // Force refresh of app token
        token = null; 
        const freshToken = await getAccessToken();

        // Update header with new token
        requestConfig.headers.Authorization = `Bearer ${freshToken}`;

        const retryRes = await axios(requestConfig);
        return retryRes.data;
      } catch (retryErr) {
        console.error(
          `[xiboRequest] Retry failed for ${endpoint}:`,
          retryErr.message
        );
        throw retryErr;
      }
    }

    console.error(`[xiboRequest] ${method} ${requestConfig.url} failed:`, {
      status: err.response?.status,
      statusText: err.response?.statusText,
      message: err.message,
      responseData: err.response?.data,
    });
    throw err;
  }
};

// Helper to verify Xibo password by simulating a browser login
const verifyXiboPassword = async (username, password) => {
  try {
    // 1. Setup Cookie Jar
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));
    
    // Determine Login URL
    // If API URL is https://app.storescore.io/api, Login URL is likely https://app.storescore.io/login
    // We strip '/api' suffix if present
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    const loginUrl = `${baseUrl}/login`;

    console.log(`[verifyXiboPassword] Verifying against: ${loginUrl}`);

    // 2. Fetch Login Page (Get CSRF Token)
    console.log(`[verifyXiboPassword] Step 1: Fetching login page...`);
    const getRes = await client.get(loginUrl, {
      timeout: 10000 // 10s timeout
    });

    // Extract CSRF Token using Regex
    // Looking for: name="csrfToken" value="xyz" (or single quotes)
    const tokenMatch = getRes.data.match(/name=["']csrfToken["'][^>]*value=["']([^"']+)["']/);
    
    if (!tokenMatch || !tokenMatch[1]) {
      console.error("[verifyXiboPassword] Failed to extract CSRF token from login page");
      return { success: false, error: "CSRF token extraction failed" };
    }
    
    const csrfToken = tokenMatch[1];
    // console.log(`[verifyXiboPassword] CSRF Token extracted: ${csrfToken.substring(0, 10)}...`);

    // 3. Submit Credentials
    console.log(`[verifyXiboPassword] Step 2: Submitting credentials...`);
    const params = new URLSearchParams();
    params.append('csrfToken', csrfToken);
    params.append('username', username);
    params.append('password', password);

    const postRes = await client.post(loginUrl, params, { 
      maxRedirects: 0, // Stop at redirect to check location
      validateStatus: (status) => status >= 200 && status < 400, // Accept 302 as valid
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // 4. Validate Redirect
    // Success: 302 Redirect AND Location is NOT back to login
    if (postRes.status === 302) {
      const location = postRes.headers.location;
      console.log(`[verifyXiboPassword] Redirect Location: ${location}`);
      
      if (location && !location.includes('login')) {
        console.log(`[verifyXiboPassword] ✓ Password verified successfully`);
        return { success: true };
      }
    }
    
    // Failure: 200 OK (page re-rendered with error) or 302 back to login
    console.warn(`[verifyXiboPassword] ✗ Verification failed (Status: ${postRes.status})`);
    return { success: false };

  } catch (error) {
    console.error(`[verifyXiboPassword] Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Authenticate user with Xibo credentials
// Uses Proxy Authentication (browser simulation) to verify password
const authenticateUser = async (username, password) => {
  try {
    console.log(`[authenticateUser] Starting Proxy Authentication for: ${username}`);
    
    // 1. Verify Password against Xibo CMS
    const verification = await verifyXiboPassword(username, password);
    
    if (!verification.success) {
      console.warn(`[authenticateUser] Password verification failed for: ${username}`);
      return {
        success: false,
        message: "Invalid username or password",
      };
    }
    
    // 2. If Password is valid, proceed to get User Info
    // Get application access token
    const appToken = await getAccessToken();

    // Search for user by userName in Xibo
    let userSearchResponse;
    try {
      console.log(`[authenticateUser] Searching for user details: ${username}`);
      userSearchResponse = await axios.get(`${apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${appToken}`,
        },
        params: {
          userName: username,
        },
        timeout: 10000 // 10 second timeout
      });
    } catch (error) {
       console.error(`[authenticateUser] Search failed for ${username}: ${error.message}`);
       // If we verified the password but can't look up details, fail safe or provide minimal info?
       // Failing safe is better
       return {
         success: false,
         message: "User lookup failed in Xibo",
       };
    }

    // Handle different response formats
    let users = [];
    if (Array.isArray(userSearchResponse.data)) {
      users = userSearchResponse.data;
    } else if (userSearchResponse.data?.data) {
      users = Array.isArray(userSearchResponse.data.data)
        ? userSearchResponse.data.data
        : [userSearchResponse.data.data];
    } else if (userSearchResponse.data) {
      // Single object response
      users = [userSearchResponse.data];
    }

    // Find exact username match
    const user = users.find(
      (u) =>
        u.userName === username ||
        u.email === username ||
        u.userName?.toLowerCase() === username?.toLowerCase()
    );

    if (!user) {
      console.warn(`[authenticateUser] User '${username}' not found in Xibo response.`);
      return {
        success: false,
        message: "User not found in Xibo CMS",
      };
    }
    console.log(`[authenticateUser] User found: ${user.userName} (ID: ${user.userId})`);
    
    return {
      success: true,
      access_token: appToken,
      user: user,
      note: "Password verified via Xibo Proxy Auth",
    };
  } catch (error) {
    console.error("Xibo authentication error:", error.message);
    
    if (error.code === 'ETIMEDOUT') {
      return {
        success: false,
        message: "Authentication timeout - Xibo server is not responding",
      };
    }
    
    if (error.response && error.response.status === 404) {
        return {
          success: false,
          message: "User not found or endpoint not available",
        };
    }
      
    return {
      success: false,
      message: `Authentication failed: ${error.message}`,
    };
  }
};

module.exports = {
  getAccessToken,
  xiboRequest,
  authenticateUser
};
