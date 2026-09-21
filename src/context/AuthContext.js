import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Set initial state to null so AppNavigator defaults to LoginScreen (Unauthenticated)
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData || { name: 'Muhammad Umer', role: 'user' });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userToken: user ? 'active_auth_token' : null,
        isLoading: false,
        login,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);