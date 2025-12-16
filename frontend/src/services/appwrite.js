import { account, databases, client_instance } from '../config/appwrite';
import { ID, Query } from 'appwrite';

export { ID, Query, databases };

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

  // Database
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
  }
};
