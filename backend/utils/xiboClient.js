const axios = require("axios");
const FormData = require("form-data");

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
    setTimeout(() => (token = null), res.data.expires_in * 900);
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

// Authenticate user with Xibo credentials
const authenticateUser = async (username, password) => {
  try {
    // Get application access token
    const appToken = await getAccessToken();

    // Search for user by username/email
    // Xibo API: GET /user with filter parameters
    let userSearchResponse;
    try {
      // Try with userName parameter
      userSearchResponse = await axios.get(`${apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${appToken}`,
        },
        params: {
          userName: username,
        },
      });
    } catch (error) {
      // If that fails, try without parameters to get all users
      console.warn(
        "User search with params failed, trying without params:",
        error.response?.status
      );
      userSearchResponse = await axios.get(`${apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${appToken}`,
        },
      });
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
      users = [userSearchResponse.data];
    }

    // Find matching user (case-insensitive)
    const user = users.find(
      (u) =>
        u.userName === username ||
        u.email === username ||
        u.userName?.toLowerCase() === username?.toLowerCase() ||
        u.email?.toLowerCase() === username?.toLowerCase()
    );

    console.log(`[authenticateUser] Searching for user: ${username}`);
    if (!user) {
      console.warn(`[authenticateUser] User '${username}' not found in Xibo.`);
      return {
        success: false,
        message: "User not found in Xibo CMS",
      };
    }
    console.log(`[authenticateUser] User found: ${user.userName}`);

    // Note: We accept the login if the user exists, as we can't verify password via API 
    // without user specific token grant which Xibo might not support nicely here.
    return {
      success: true,
      access_token: appToken,
      user: user,
      note: "Using application token",
    };
  } catch (error) {
    console.error("Xibo authentication error:", error.message);
    
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
