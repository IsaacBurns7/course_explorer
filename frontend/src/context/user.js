
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = "http://localhost:4000";

  const refreshUser = async () => {
    try {
      console.log("Attempting to refresh user info...");
      const response = await fetch(`${API}/auth/me`, { credentials: "include" });
      const data = await response.json();
      console.log(data);
      setUser(data.user || null);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Initial load
  useEffect(() => {
    refreshUser();
  }, []);

  const value = {
    user,
    setUser,
    refreshUser,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};