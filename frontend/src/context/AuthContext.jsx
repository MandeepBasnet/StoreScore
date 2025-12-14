import { createContext, useContext, useState, useEffect } from 'react';
import { AppwriteService } from '../services/appwrite';
import { account } from '../config/appwrite';
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
      // 1. Check Local Storage (Mainly for Xibo users or fast load)
      const storedUser = getStoredUser();
      
      if (storedUser) {
        setUser(storedUser);
      } else {
        // 2. Check Appwrite Session (If page refreshed and localStorage cleared but cookie exists)
        try {
            const sessionUser = await account.get();
            setUser({
                id: sessionUser.$id,
                name: sessionUser.name,
                username: sessionUser.email.split('@')[0],
                role: 'manager'
            });
        } catch (e) {
            // No Appwrite session either
            setUser(null);
        }
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    // 1. Try Xibo / Backend Login First
    try {
      console.log("Attempting Xibo Login...");
      const data = await loginAPI(username, password);
      // If success, logic continues here
      if (data?.token) {
        saveAuth(data.token, data.user || { username, role: 'admin' });
        setUser(data.user || { username, role: 'admin' });
        return data; 
      }
    } catch (backendError) {
      console.log("Backend Login failed, trying Appwrite...", backendError);
      
      // 2. Fallback to Appwrite Login (Store Managers)
      try {
        // Construct the fake email
        const email = `${username}@storescore.local`;
        
        // Create session
        await account.createEmailPasswordSession(email, password);
        
        // Fetch User Details to get the ID/Name
        const appwriteUser = await account.get();
        
        // Define a "Manager" user object
        const managerUser = {
            id: appwriteUser.$id,
            username: username,
            name: appwriteUser.name,
            role: 'manager', 
            isAdmin: false
        };

        // Save mock token (or Appwrite session ID) to local storage to persist session
        // Note: Appwrite SDK handles its own persistence, but we use localStorage for app state 
        saveAuth('appwrite-session', managerUser);
        setUser(managerUser);
        
        return { user: managerUser };

      } catch (appwriteError) {
         console.error("Appwrite Login failed:", appwriteError);
         // Throw the original error or a generic one? 
         // Let's throw a combined message or just "Invalid credentials"
         throw new Error('Invalid username or password (checked both systems)');
      }
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
