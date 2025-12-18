import { account, databases, client_instance } from '../config/appwrite';
import { ID, Query } from 'appwrite';

export { ID, Query, databases };

// Environment variables for collection IDs
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const KPI_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_KPI;
const STORES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_STORES;

export const AppwriteService = {
  // Auth
  loginWithPhone: (phone) => {
    return account.createPhoneToken(ID.unique(), phone);
  },
  verifyPhone: (userId, secret) => {
    return account.createSession(userId, secret);
  },
  loginWithEmail: (email, password) => {
    return account.createEmailPasswordSession(email, password);
  },
  logout: () => {
    return account.deleteSession('current');
  },
  getCurrentUser: () => {
    return account.get();
  },

  // Generic Database
  listDocuments: (dbId, colId, queries = []) => {
    return databases.listDocuments(dbId, colId, queries);
  },
  createDocument: (dbId, colId, data) => {
    return databases.createDocument(dbId, colId, ID.unique(), data);
  },
  updateDocument: (dbId, colId, docId, data) => {
    return databases.updateDocument(dbId, colId, docId, data);
  },
  getDocument: (dbId, colId, docId) => {
    return databases.getDocument(dbId, colId, docId);
  },

  // ===== KPI ENTRIES =====
  
  /**
   * Get KPI entries for a store in a specific month
   * @param {string} storeId - Store ID
   * @param {number} year - Year (e.g., 2024)
   * @param {number} month - Month (0-11)
   * @returns {Promise<Array>} List of KPI entries
   */
  getKPIEntriesForMonth: async (storeId, year, month) => {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;
    
    const response = await databases.listDocuments(DATABASE_ID, KPI_COLLECTION_ID, [
      Query.equal('storeId', storeId),
      Query.greaterThanEqual('date', startDate),
      Query.lessThanEqual('date', endDate),
      Query.orderDesc('date')
    ]);
    return response.documents;
  },

  /**
   * Create a new KPI entry
   * @param {Object} data - KPI entry data
   * @returns {Promise<Object>} Created document
   */
  createKPIEntry: async (data) => {
    return databases.createDocument(DATABASE_ID, KPI_COLLECTION_ID, ID.unique(), data);
  },

  /**
   * Check if KPI entry exists for a specific date and store
   * @param {string} storeId - Store ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object|null>} Existing entry or null
   */
  getKPIEntryByDate: async (storeId, date) => {
    const response = await databases.listDocuments(DATABASE_ID, KPI_COLLECTION_ID, [
      Query.equal('storeId', storeId),
      Query.equal('date', date),
      Query.limit(1)
    ]);
    return response.documents.length > 0 ? response.documents[0] : null;
  },

  // ===== STORES =====
  
  /**
   * Get all stores
   * @returns {Promise<Array>} List of stores
   */
  getStores: async () => {
    const response = await databases.listDocuments(DATABASE_ID, STORES_COLLECTION_ID, [
      Query.limit(100)
    ]);
    return response.documents;
  },
};
