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
      console.error("Auth check failed:", error);
      setUser(null);
      clearAuth(); // Fix: Clear zombie token if user resolution fails
    } finally {
      // One final check: if we finished loading and user is null, 
      // make sure we don't have a lingering token that tricks ProtectedRoute
      if (!getStoredUser()) { // Use getter to check current state
         // We might have set user(null) above, ensuring we clear storage too
         clearAuth();
      }
      setLoading(false);
    }
  };

  const login = async (username, password, type = 'admin') => {
    // 1. Admin Login (Xibo / Backend)
    if (type === 'admin') {
        try {
            console.log("Attempting Xibo Login (Admin)...");
            const data = await loginAPI(username, password);
            
            if (data?.token) {
                // Use the role returned from the backend (admin or super_admin)
                const adminUser = { 
                    ...(data.user || { username }), 
                    role: data.user?.role || 'admin' // Fallback to admin if undefined
                };
                
                saveAuth(data.token, adminUser);
                setUser(adminUser);
                return data; 
            }
        } catch (backendError) {
             console.error("Xibo Login failed:", backendError);
             throw new Error('Invalid Admin credentials');
        }
    } 
    // 2. Manager Login (Appwrite)
    else if (type === 'manager') {
         try {
            console.log("Attempting Appwrite Login (Manager)...");
            
            // Construct the fake email
            const email = `${username}@storescore.local`;
            console.log(`[DEBUG] Attempting login with Email: "${email}"`);
            
            // Try to create session directly
            try {
                await account.createEmailPasswordSession(email, password);
            } catch (sessionError) {
                // If session already exists, clear it and retry
                if (sessionError.code === 401 || sessionError.type === 'user_session_already_exists') {
                    console.log("[DEBUG] Session exists, clearing and retrying...");
                    try {
                        await account.deleteSession('current');
                        await account.createEmailPasswordSession(email, password);
                    } catch (retryError) {
                         throw  retryError;
                    }
                } else {
                    throw sessionError;
                }
            }
            
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
            saveAuth('appwrite-session', managerUser);
            setUser(managerUser);
            
            return { user: managerUser };

        } catch (appwriteError) {
             console.error("Appwrite Login failed:", appwriteError);
             
             // [DEBUG] Print specific error details
             console.group("Appwrite Login Error Debug");
             console.log("Error Code:", appwriteError.code);
             console.log("Error Message:", appwriteError.message);
             console.log("Error Type:", appwriteError.type);
             console.groupEnd();

             throw new Error(`Login failed: ${appwriteError.message} (Code: ${appwriteError.code})`);
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
