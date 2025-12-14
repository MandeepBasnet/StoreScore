import { createContext, useContext, useState, useEffect } from 'react';
import { AppwriteService } from '../services/appwrite';
import { login as loginAPI } from '../api/auth';
import { saveAuth, clearAuth, getStoredUser } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      // First check for stored token/user from "legacy" auth
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      } else {
         // Fallback to Appwrite if we were using it, but user wants to pause it.
         // setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const data = await loginAPI(username, password);
      if (!data?.token) {
        throw new Error('Login succeeded but no token was returned.');
      }
      saveAuth(data.token, data.user || { username }); // Save to local storage
      setUser(data.user || { username }); // Update context state
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    // Clear both Appwrite and Local Storage to be safe
    try {
        await AppwriteService.logout(); 
    } catch (e) {
        // Ignore if no appwrite session
    }
    clearAuth();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
