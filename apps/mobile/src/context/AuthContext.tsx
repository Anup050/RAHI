import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import api from '../services/api';

interface AuthContextType {
  user: any;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
    
    // Add global response interceptor for 401/403
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          await logout();
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const loadStorageData = async () => {
    try {
      const storedToken = await storageService.getToken();
      const storedUser = await storageService.getUser();
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        
        // Refresh user data from backend to ensure we have latest fields (like rahi_id)
        try {
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            const { data } = await api.get('/users/me');
            if (data) {
                setUser(data);
                await storageService.setUser(data);
            }
        } catch (err) {
            console.error("Failed to refresh user data", err);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newUser: any) => {
    setIsLoading(true);
    try {
        setToken(newToken);
        setUser(newUser);
        await storageService.setToken(newToken);
        await storageService.setUser(newUser);
    } catch(e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
        await storageService.clearAuth();
        setToken(null);
        setUser(null);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const updateUser = async (newUser: any) => {
    try {
        const updatedUser = { ...user, ...newUser };
        setUser(updatedUser);
        await storageService.setUser(updatedUser);
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
