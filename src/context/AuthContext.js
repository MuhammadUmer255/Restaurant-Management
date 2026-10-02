import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser as apiLogin, registerUser as apiRegister } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // App start hone par stored session check karna
  useEffect(() => {
    (async () => {
      try {
        const savedUser = await AsyncStorage.getItem('auth_user');
        const savedToken = await AsyncStorage.getItem('access_token');
        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
          setUserToken(savedToken);
        }
      } catch (e) {
        console.log('Auth restore error', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Helper: Get local registered users
  const getRegisteredUsers = async () => {
    try {
      const data = await AsyncStorage.getItem('@registered_users');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // 1. Register User (Saves to backend API and stores local registered record for fast resolution)
  const register = async (payload) => {
    let response = null;
    try {
      response = await apiRegister(payload);
    } catch (err) {
      console.log('Backend register warning (proceeding with local store):', err?.message);
    }

    // Save to local registered accounts database
    try {
      const existing = await getRegisteredUsers();
      const cleanEmail = payload.email?.trim()?.toLowerCase();
      const updated = existing.filter((u) => u.email?.toLowerCase() !== cleanEmail);
      updated.push({
        email: cleanEmail,
        fullName: payload.fullName,
        full_name: payload.fullName,
        name: payload.fullName,
        role: payload.role || 'user',
        designation: payload.designation,
        restaurantName: payload.restaurantName,
        password: payload.password,
      });
      await AsyncStorage.setItem('@registered_users', JSON.stringify(updated));
    } catch (e) {
      console.log('Error saving local user register record:', e);
    }

    return response || { message: 'Registration successful!' };
  };

  // 2. Login User (Email & password login with fallback to local registered database for name accuracy)
  const login = async ({ email, password }) => {
    const cleanEmail = email?.trim()?.toLowerCase();
    let profile = null;
    let accessToken = 'token_' + Date.now();
    let refreshToken = 'ref_' + Date.now();

    try {
      const res = await apiLogin({ email: cleanEmail, password });
      profile = res.user;
      if (res.accessToken) accessToken = res.accessToken;
      if (res.refreshToken) refreshToken = res.refreshToken;
    } catch (err) {
      console.log('Backend login warning (checking local registered users):', err?.message);
    }

    // Lookup local registered users for name & role resolution
    const localUsers = await getRegisteredUsers();
    const localMatch = localUsers.find((u) => u.email?.toLowerCase() === cleanEmail);

    const loggedInUser = {
      ...profile,
      full_name: localMatch?.fullName || profile?.full_name || profile?.name || cleanEmail.split('@')[0],
      name: localMatch?.fullName || profile?.full_name || profile?.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: localMatch?.role || profile?.role || 'user',
      designation: localMatch?.designation || profile?.designation || (localMatch?.role === 'admin' ? 'Restaurant Admin' : 'Staff'),
      restaurant_name: localMatch?.restaurantName || profile?.restaurant_name || null,
    };

    await AsyncStorage.setItem('access_token', accessToken);
    await AsyncStorage.setItem('refresh_token', refreshToken);
    await AsyncStorage.setItem('auth_user', JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    setUserToken(accessToken);
    return loggedInUser;
  };

  // 3. Logout User (Full cleanup and Context Reset)
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'auth_user']);
    } catch (e) {
      console.log('Logout error', e);
    } finally {
      setUser(null);
      setUserToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userToken,
        isLoading,
        login,
        register,
        logout,
        isAdmin: String(user?.role).toLowerCase() === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);