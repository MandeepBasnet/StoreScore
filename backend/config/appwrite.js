const sdk = require('node-appwrite');
require('dotenv').config();

const client = new sdk.Client();

client
    .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your API Endpoint
    .setProject(process.env.APPWRITE_PROJECT_ID) // Your project ID
    .setKey(process.env.APPWRITE_API_KEY); // Your secret API key

const databases = new sdk.Databases(client);
const users = new sdk.Users(client);

module.exports = { client, databases, users };
