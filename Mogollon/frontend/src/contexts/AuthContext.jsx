// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeJwt } from '../utils/jwt';
import { ACCESS_TOKEN } from '../constants';

const AuthContext = createContext({
  role: null,
  username: null
});

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ role: null, username: null });

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      const decoded = decodeJwt(token);
      setAuth({
        // assuming your JWT payload has { role, username }
        role: decoded.role     || null,
        username: decoded.username || decoded.sub || null
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
