
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { toast } from "@/components/ui/sonner";

interface UserContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  updateBalance: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (username: string) => {
    // In a real app, this would be an API call
    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      balance: 5000, // Starting balance
    };
    setUser(newUser);
    toast.success(`Welcome, ${username}!`, {
      description: "5,000 gems have been added to your account."
    });
  };

  const logout = () => {
    setUser(null);
    toast("You've been logged out");
  };

  const updateBalance = (amount: number) => {
    if (!user) return;
    setUser({
      ...user,
      balance: Math.max(0, user.balance + amount),
    });
    
    if (amount > 0) {
      toast.success(`You won ${amount} gems!`);
    } else if (amount < 0) {
      toast(`${Math.abs(amount)} gems deducted`);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateBalance }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
