'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/interface/user';
import { userService } from '@/services/userService';

interface AuthContextType {
  walletAddress: string | null;
  user: User | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const CURRENT_MOCK_WALLET = '9mK2...p5Ts'; // Marco Vulcan

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there's a stored wallet (simulating persistence)
    const storedWallet = localStorage.getItem('mock_wallet');
    if (storedWallet) {
      handleConnect(storedWallet);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleConnect = async (address: string) => {
    setIsLoading(true);
    setWalletAddress(address);
    localStorage.setItem('mock_wallet', address);
    
    try {
      const userData = await userService.getCurrentUser(address);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connect = () => {
    handleConnect(CURRENT_MOCK_WALLET);
  };

  const disconnect = () => {
    setWalletAddress(null);
    setUser(null);
    localStorage.removeItem('mock_wallet');
  };

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        user,
        isConnected: !!walletAddress,
        connect,
        disconnect,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
