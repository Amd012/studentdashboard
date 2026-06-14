/**
 * Authentication Context
 * Uses demo/localStorage mode by default for instant offline functionality
 * Switches to Firebase when config is provided
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { demoLogin, demoLogout, getDemoSession, seedDemoData } from '../services/demoService';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Seed demo data and check for existing session on mount
  useEffect(() => {
    seedDemoData();

    const session = getDemoSession();
    if (session) {
      setCurrentUser({ uid: session.uid, email: session.email });
      setUserData(session);
    }
    setLoading(false);
  }, []);

  /**
   * Login with email and password
   */
  async function login(email, password) {
    // Try demo login first
    const demoUser = demoLogin(email, password);
    if (demoUser) {
      setCurrentUser({ uid: demoUser.uid, email: demoUser.email });
      setUserData(demoUser);
      return demoUser;
    }

    // Try Firebase if no demo user found
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../firebase/firebase');
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      // If Firebase is not configured, throw meaningful error
      if (error.code === 'auth/invalid-api-key' || error.message?.includes('apiKey')) {
        throw new Error('Firebase not configured. Use demo accounts: admin@school.com / admin123');
      }
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async function logout() {
    demoLogout();
    setCurrentUser(null);
    setUserData(null);
  }

  const value = {
    currentUser,
    userData,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;