import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiCall, handleApiError, authenticatedRequest } from '../utils/apiUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await authenticatedRequest({
        method: 'GET',
        url: '/api/users/profile'
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      // Only logout if it's an authentication error
      if (error.response?.status === 401) {
        logout();
      } else {
        handleApiError(error, 'Failed to load user profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiCall({
        method: 'POST',
        url: '/api/users/login',
        data: { email, password }
      });
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const result = handleApiError(error, 'Login failed');
      return result;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiCall({
        method: 'POST',
        url: '/api/users/register',
        data: userData
      });
      
      const { token: newToken, user: userInfo } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userInfo);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const result = handleApiError(error, 'Registration failed');
      return result;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authenticatedRequest({
        method: 'PUT',
        url: '/api/users/profile',
        data: profileData
      });
      setUser(response.data);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const result = handleApiError(error, 'Profile update failed');
      return result;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isOwner: user?.type === 'owner',
    isAdmin: user?.type === 'admin',
    isRenter: user?.type === 'renter'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 